import requests
import json

def test_upload():
    # Test bank statement upload
    files = {
        'file': ('test_bank_statement.csv', open('test_bank_statement.csv', 'rb'), 'text/csv')
    }
    data = {'file_type': 'bank'}
    response = requests.post('http://localhost:8000/upload/', files=files, data=data)
    print("Bank Statement Upload Response:", response.json())

    # Test bill upload
    files = {
        'file': ('test_bill.csv', open('test_bill.csv', 'rb'), 'text/csv')
    }
    data = {'file_type': 'bill'}
    response = requests.post('http://localhost:8000/upload/', files=files, data=data)
    print("Bill Upload Response:", response.json())

def test_link():
    # Test linking transactions
    response = requests.post('http://localhost:8000/link/')
    print("Linking Response:", json.dumps(response.json(), indent=2))

def test_search():
    # Test searching transactions
    params = {
        'type': 'transaction',
        'query': 'Utility'
    }
    response = requests.get('http://localhost:8000/search/', params=params)
    print("Search Response:", json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    print("Testing Upload...")
    test_upload()
    print("\nTesting Linking...")
    test_link()
    print("\nTesting Search...")
    test_search() 