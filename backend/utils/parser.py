import pandas as pd
import pdfplumber

def parse_csv(file_path):
    return pd.read_csv(file_path)

def parse_pdf(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = ''
        for page in pdf.pages:
            text += page.extract_text() + '\n'
    # You can add table extraction logic here
    return text 