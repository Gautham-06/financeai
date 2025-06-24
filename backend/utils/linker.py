def link_records(transactions, bills_or_invoices):
    links = []
    for idx, bill in bills_or_invoices.iterrows():
        # Convert amounts to absolute values for comparison
        bill_amount = abs(float(bill['amount']))
        
        # Find matching transactions
        match = transactions[
            (transactions['date'] == bill['date']) &
            (abs(transactions['amount'].astype(float)) == bill_amount)
        ]
        
        if not match.empty:
            links.append((bill['id'], match.iloc[0]['id']))
    return links