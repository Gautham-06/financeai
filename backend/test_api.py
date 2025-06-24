from fastapi.testclient import TestClient
from app import app
import json

client = TestClient(app)

def test_upload():
    # Test bank statement upload
    with open('test_bank_statement.csv', 'rb') as f:
        files = {'file': ('test_bank_statement.csv', f, 'text/csv')}
        data = {'file_type': 'bank'}
        response = client.post('/upload/', files=files, data=data)
        print("Bank Statement Upload Response:", response.json())

    # Test bill upload
    with open('test_bill.csv', 'rb') as f:
        files = {'file': ('test_bill.csv', f, 'text/csv')}
        data = {'file_type': 'bill'}
        response = client.post('/upload/', files=files, data=data)
        print("Bill Upload Response:", response.json())

def test_link():
    # Test linking transactions
    response = client.post('/link/')
    print("Linking Response:", json.dumps(response.json(), indent=2))

def test_search():
    # Test searching transactions
    params = {
        'type': 'transaction',
        'query': 'Utility'
    }
    response = client.get('/search/', params=params)
    print("Search Response:", json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    print("Testing Upload...")
    test_upload()
    print("\nTesting Linking...")
    test_link()
    print("\nTesting Search...")
    test_search() 