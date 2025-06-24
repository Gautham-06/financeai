from fastapi import FastAPI, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, BankTransaction, Bill, Invoice
import os
import pandas as pd
from utils.parser import parse_csv, parse_pdf
from utils.linker import link_records
from typing import Optional
import tabula
import pdfplumber
import docx

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

engine = create_engine('sqlite:///database.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), file_type: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    session = Session()
    df = None
    if file.filename.endswith('.csv'):
        df = pd.read_csv(file_path)
    elif file.filename.endswith('.xlsx'):
        df = pd.read_excel(file_path)
    elif file.filename.endswith('.pdf'):
        # Try to extract tables using tabula-py
        try:
            tables = tabula.read_pdf(file_path, pages='all', multiple_tables=True)
            if tables and len(tables) > 0:
                df = tables[0]  # Use the first table found
        except Exception as e:
            print(f"Tabula PDF extraction failed: {e}")
        # Fallback: try to extract text with pdfplumber (not structured)
        if df is None:
            try:
                with pdfplumber.open(file_path) as pdf:
                    text = ''
                    for page in pdf.pages:
                        text += page.extract_text() + '\n'
                # Attempt to parse text into a DataFrame (user should customize this for their format)
                # For now, skip further processing if no table found
                print("PDF text extraction fallback used, but no table parsed.")
            except Exception as e:
                print(f"pdfplumber extraction failed: {e}")
    elif file.filename.endswith('.doc') or file.filename.endswith('.docx'):
        try:
            doc = docx.Document(file_path)
            table = doc.tables[0] if doc.tables else None
            if table:
                data = []
                keys = None
                for i, row in enumerate(table.rows):
                    text = [cell.text.strip() for cell in row.cells]
                    if i == 0:
                        keys = text
                    else:
                        data.append(text)
                if keys and data:
                    df = pd.DataFrame(data, columns=keys)
                    print("Extracted DOCX DataFrame:")
                    print(df.head())
        except Exception as e:
            print(f"DOCX extraction failed: {e}")
    # You can add more advanced PDF parsing logic as needed

    if df is not None:
        # Normalize date format
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
        
        # Normalize amount format
        if 'amount' in df.columns:
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)

        if file_type == "bank":
            for _, row in df.iterrows():
                txn = BankTransaction(
                    transaction_number=str(row.get('transaction_number', '')),
                    date=row.get('date', ''),
                    amount=float(row.get('amount', 0)),
                    description=str(row.get('description', ''))
                )
                session.add(txn)
        elif file_type == "bill":
            for _, row in df.iterrows():
                bill = Bill(
                    bill_number=str(row.get('bill_number', '')),
                    date=row.get('date', ''),
                    amount=abs(float(row.get('amount', 0)))  # Always store positive amount for bills
                )
                session.add(bill)
        elif file_type == "invoice":
            for _, row in df.iterrows():
                invoice = Invoice(
                    invoice_number=str(row.get('invoice_number', '')),
                    date=row.get('date', ''),
                    amount=abs(float(row.get('amount', 0)))  # Always store positive amount for invoices
                )
                session.add(invoice)
        session.commit()
    session.close()
    return {"status": "uploaded"}

@app.post("/link/")
def link_all():
    session = Session()
    txns = pd.read_sql(session.query(BankTransaction).statement, session.bind)
    bills = pd.read_sql(session.query(Bill).statement, session.bind)
    invoices = pd.read_sql(session.query(Invoice).statement, session.bind)

    # Filter out empty/zero rows
    txns = txns[(txns['transaction_number'].astype(str).str.strip() != '') & (txns['amount'] > 0)]
    bills = bills[(bills['bill_number'].astype(str).str.strip() != '') & (bills['amount'] > 0)]
    invoices = invoices[(invoices['invoice_number'].astype(str).str.strip() != '') & (invoices['amount'] > 0)]

    # Debug print the dataframes
    print("Transactions DataFrame:")
    print(txns)
    print("Bills DataFrame:")
    print(bills)
    print("Invoices DataFrame:")
    print(invoices)

    # Normalize date and amount columns for robust matching
    for df in [txns, bills, invoices]:
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.strftime('%Y-%m-%d')
        if 'amount' in df.columns:
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0).astype(float)

    # Link bills
    bill_links = link_records(txns, bills)
    for bill_id, txn_id in bill_links:
        bill = session.query(Bill).get(bill_id)
        bill.linked_transaction_id = txn_id
    # Link invoices
    invoice_links = link_records(txns, invoices)
    for invoice_id, txn_id in invoice_links:
        invoice = session.query(Invoice).get(invoice_id)
        invoice.linked_transaction_id = txn_id
    session.commit()
    # Prepare detailed mapping results (only valid, non-empty records)
    detailed_bills = []
    bills_q = session.query(Bill).filter(Bill.linked_transaction_id != None)
    for bill in bills_q:
        txn = session.query(BankTransaction).get(bill.linked_transaction_id)
        if bill and bill.bill_number and bill.amount > 0:
            detailed_bills.append({
                'bill_id': bill.id,
                'bill_number': bill.bill_number,
                'bill_date': bill.date,
                'bill_amount': bill.amount,
                'linked_transaction_id': bill.linked_transaction_id,
                'linked_transaction': {
                    'transaction_id': txn.id,
                    'transaction_number': txn.transaction_number,
                    'date': txn.date,
                    'amount': txn.amount,
                    'description': txn.description
                } if txn else None
            })
            
    detailed_invoices = []
    invoices_q = session.query(Invoice).filter(Invoice.linked_transaction_id != None)
    for invoice in invoices_q:
        txn = session.query(BankTransaction).get(invoice.linked_transaction_id)
        if invoice and invoice.invoice_number and invoice.amount > 0:
            detailed_invoices.append({
                'invoice_id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'invoice_date': invoice.date,
                'invoice_amount': invoice.amount,
                'linked_transaction_id': invoice.linked_transaction_id,
                'linked_transaction': {
                    'transaction_id': txn.id,
                    'transaction_number': txn.transaction_number,
                    'date': txn.date,
                    'amount': txn.amount,
                    'description': txn.description
                } if txn else None
            })

    # For each transaction, find all linked bills and invoices
    transactions_with_links = []
    all_txns = session.query(BankTransaction).all()
    for txn in all_txns:
        linked_bills = session.query(Bill).filter(Bill.linked_transaction_id == txn.id).all()
        linked_invoices = session.query(Invoice).filter(Invoice.linked_transaction_id == txn.id).all()
        transactions_with_links.append({
            'transaction_id': txn.id,
            'transaction_number': txn.transaction_number,
            'date': txn.date,
            'amount': txn.amount,
            'description': txn.description,
            'bills': [
                {
                    'bill_id': bill.id,
                    'bill_number': bill.bill_number,
                    'date': bill.date,
                    'amount': bill.amount,
                    'linked_transaction_id': bill.linked_transaction_id
                } for bill in linked_bills
            ],
            'invoices': [
                {
                    'invoice_id': invoice.id,
                    'invoice_number': invoice.invoice_number,
                    'date': invoice.date,
                    'amount': invoice.amount,
                    'linked_transaction_id': invoice.linked_transaction_id
                } for invoice in linked_invoices
            ]
        })
    session.close()
    return {
        "bills": detailed_bills,
        "invoices": detailed_invoices,
        "transactions": transactions_with_links
    }

@app.get("/search/")
def search_records(
    type: Optional[str] = Query(None, description="Type: transaction, bill, invoice"),
    query: Optional[str] = Query(None, description="Search text (number, date, amount, description)")
):
    session = Session()
    results = []
    if type == "transaction":
        q = session.query(BankTransaction)
        if query:
            q = q.filter(
                (BankTransaction.transaction_number.contains(query)) |
                (BankTransaction.date.contains(query)) |
                (BankTransaction.description.contains(query))
            )
        for txn in q:
            results.append({
                'id': txn.id,
                'transaction_number': txn.transaction_number,
                'date': txn.date,
                'amount': txn.amount,
                'description': txn.description
            })
    elif type == "bill":
        q = session.query(Bill)
        if query:
            q = q.filter(
                (Bill.bill_number.contains(query)) |
                (Bill.date.contains(query))
            )
        for bill in q:
            results.append({
                'id': bill.id,
                'bill_number': bill.bill_number,
                'date': bill.date,
                'amount': bill.amount,
                'linked_transaction_id': int(bill.linked_transaction_id) if bill.linked_transaction_id else None
            })
    elif type == "invoice":
        q = session.query(Invoice)
        if query:
            q = q.filter(
                (Invoice.invoice_number.contains(query)) |
                (Invoice.date.contains(query))
            )
        for invoice in q:
            results.append({
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'date': invoice.date,
                'amount': invoice.amount,
                'linked_transaction_id': int(invoice.linked_transaction_id) if invoice.linked_transaction_id else None
            })
    session.close()
    return {"results": results} 