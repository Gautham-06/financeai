from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import tempfile
import os
from typing import List, Optional
import re
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

def extract_text_from_pdf(file_path):
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(file_path)
        text = "\n".join(page.extract_text() or '' for page in reader.pages)
        return text
    except Exception as e:
        return ""

def extract_text_from_doc(file_path):
    try:
        from docx import Document
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        return ""

def extract_fields_from_text(text, is_invoice=False):
    # Simple regex-based extraction; can be improved
    date_match = re.search(r'(\d{2,4}[/-]\d{1,2}[/-]\d{1,4})', text)
    number_match = re.search(r'(Bill|Invoice)[^\d]*(\d+)', text, re.IGNORECASE)
    amount_match = re.search(r'([Rr][sS]?|INR|USD)?\s?([\d,]+\.\d{2})', text)
    description_match = re.search(r'(Description|For|Purpose)[:\-\s]+(.+)', text)
    return {
        "date": date_match.group(1) if date_match else None,
        "bill_number": number_match.group(2) if number_match and not is_invoice else None,
        "invoice_number": number_match.group(2) if number_match and is_invoice else None,
        "amount": amount_match.group(2) if amount_match else None,
        "description": description_match.group(2).strip() if description_match else None
    }

@app.post("/map-records/")
async def map_records(
    bank_statement: UploadFile = File(...),
    bills: List[UploadFile] = File(...),
    invoices: List[UploadFile] = File(...)
):
    # 1. Save and read bank statement (XLSX or CSV)
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(bank_statement.filename)[-1]) as tmp:
        tmp.write(await bank_statement.read())
        tmp_path = tmp.name
    if bank_statement.filename.endswith('.csv'):
        bank_df = pd.read_csv(tmp_path)
    else:
        bank_df = pd.read_excel(tmp_path)
    os.unlink(tmp_path)

    # 2. Extract data from bills and invoices (PDF/DOC)
    bills_data = []
    for bill in bills:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(bill.filename)[-1]) as tmp:
            tmp.write(await bill.read())
            bill_path = tmp.name
        if bill.filename.lower().endswith('.pdf'):
            text = extract_text_from_pdf(bill_path)
        elif bill.filename.lower().endswith('.doc') or bill.filename.lower().endswith('.docx'):
            text = extract_text_from_doc(bill_path)
        else:
            text = ""
        os.unlink(bill_path)
        fields = extract_fields_from_text(text, is_invoice=False)
        bills_data.append(fields)

    invoices_data = []
    for invoice in invoices:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(invoice.filename)[-1]) as tmp:
            tmp.write(await invoice.read())
            invoice_path = tmp.name
        if invoice.filename.lower().endswith('.pdf'):
            text = extract_text_from_pdf(invoice_path)
        elif invoice.filename.lower().endswith('.doc') or invoice.filename.lower().endswith('.docx'):
            text = extract_text_from_doc(invoice_path)
        else:
            text = ""
        os.unlink(invoice_path)
        fields = extract_fields_from_text(text, is_invoice=True)
        invoices_data.append(fields)

    # 3. Prepare prompt for LLM
    prompt = f"""
    Map the following bank transactions to bills and invoices.\n
    Bank Transactions:\n{bank_df.to_dict(orient='records')}\n
    Bills:\n{bills_data}\n
    Invoices:\n{invoices_data}\n
    Output two tables as JSON: one for bills (Date, transaction ID, bill number, amount), one for invoices (Date, transaction ID, invoice number, amount).
    """

    # 4. Call DeepSeek LLM via OpenRouter
    from openai import OpenAI
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    client = OpenAI(api_key=openrouter_api_key, base_url="https://openrouter.ai/api/v1")
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[
            {"role": "system", "content": "You are a financial data mapping assistant."},
            {"role": "user", "content": prompt}
        ],
        stream=False
    )
    llm_output = response.choices[0].message.content

    # 5. Parse LLM output (expecting JSON with two tables)
    import json
    try:
        result = json.loads(llm_output)
    except Exception:
        result = {"error": "Failed to parse LLM output", "raw": llm_output}

    return JSONResponse(content=result) 