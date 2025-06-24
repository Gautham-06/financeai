import { useState } from "react";
import { documents } from "../services/api";

export default function BankStatements() {
  const [statements, setStatements] = useState([]);
  const [error, setError] = useState("");
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [mappingResults, setMappingResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("transaction");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleFileUpload = async (event, fileType) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      let newStatements = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          setError("");
          const response = await documents.upload(fileType, file);
          if (
            response &&
            response.data &&
            response.data.status === "uploaded"
          ) {
            newStatements.push({
              id: statements.length + newStatements.length + 1,
              name: file.name,
              bank: "HDFC",
              date: new Date().toLocaleDateString(),
              amount: "₹50,000",
              transactions: 25,
              size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
              status: "Processed",
              type: fileType,
            });
          }
        } catch (err) {
          console.error("Upload error:", err);
          setError(
            `Failed to upload file ${file.name}: ${
              err.message || "Unknown error"
            }`
          );
          return; // Stop processing more files if one fails
        }
      }
      setStatements([...statements, ...newStatements]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setMappingResults(null);
    try {
      const response = await documents.link();
      if (response && response.data) {
        console.log("Mapping response:", response.data);
        setMappingResults(response.data);
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Mapping error:", err);
      setError(`Failed to map records: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchResults(null);
    setError("");
    try {
      const params = {
        type: searchType,
        query: searchQuery,
      };
      const response = await documents.search(params);
      setSearchResults(response.data.results);
    } catch (err) {
      setError("Failed to search records. " + (err.message || ""));
    }
    setSearchLoading(false);
  };

  return (
    <div>
      <div className="header">
        <h1>Bank Statements</h1>
      </div>

      <div
        className="upload-sections"
        style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}
      >
        {/* Bank Statement Upload */}
        <div
          className="upload-card"
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h2>Upload Bank Statement</h2>
          <input
            type="file"
            accept=".pdf,.csv,.xlsx"
            multiple
            onChange={(e) => handleFileUpload(e, "bank")}
          />
        </div>

        {/* Bill Upload */}
        <div
          className="upload-card"
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h2>Upload Bill</h2>
          <input
            type="file"
            accept=".pdf,.csv,.xlsx"
            multiple
            onChange={(e) => handleFileUpload(e, "bill")}
          />
        </div>

        {/* Invoice Upload */}
        <div
          className="upload-card"
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <h2>Upload Invoice</h2>
          <input
            type="file"
            accept=".pdf,.csv,.xlsx"
            multiple
            onChange={(e) => handleFileUpload(e, "invoice")}
          />
        </div>
      </div>

      <button
        className="btn btn-success"
        onClick={handleSubmit}
        style={{ marginBottom: "2rem" }}
      >
        Submit & Map Records
      </button>

      {loading && <div>Processing and mapping records...</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {mappingResults && (
        <div className="mapping-results" style={{ marginTop: "2rem" }}>
          <h2>Mapping Results</h2>
          {/* Transactions Table */}
          {mappingResults.transactions && (
            <div style={{ marginBottom: "2rem" }}>
              <h3>All Transactions</h3>
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    <th>Transaction #</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Linked Bills</th>
                    <th>Linked Invoices</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingResults.transactions.length === 0 ? (
                    <tr>
                      <td colSpan="6">No transactions found</td>
                    </tr>
                  ) : (
                    mappingResults.transactions.map((txn) => (
                      <tr key={txn.transaction_id}>
                        <td>{txn.transaction_number}</td>
                        <td>{txn.date}</td>
                        <td>{txn.amount}</td>
                        <td>{txn.description}</td>
                        <td>
                          {txn.bills && txn.bills.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: 16 }}>
                              {txn.bills.map((bill) => (
                                <li key={bill.bill_id}>
                                  {bill.bill_number} ({bill.date}, {bill.amount}
                                  )
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span>None</span>
                          )}
                        </td>
                        <td>
                          {txn.invoices && txn.invoices.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: 16 }}>
                              {txn.invoices.map((inv) => (
                                <li key={inv.invoice_id}>
                                  {inv.invoice_number} ({inv.date}, {inv.amount}
                                  )
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span>None</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ display: "flex", gap: "2rem" }}>
            {/* Bills Table */}
            <div>
              <h3>Bills</h3>
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    <th>Bill Number</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Linked Transaction ID</th>
                    <th>Linked Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingResults.bills && mappingResults.bills.length > 0 ? (
                    mappingResults.bills.map((bill) => (
                      <tr key={bill.bill_id}>
                        <td>{bill.bill_number}</td>
                        <td>{bill.bill_date}</td>
                        <td>{bill.bill_amount}</td>
                        <td>
                          {bill.linked_transaction ? (
                            bill.linked_transaction.transaction_id
                          ) : (
                            <span>Not Linked</span>
                          )}
                        </td>
                        <td>
                          {bill.linked_transaction ? (
                            <div>
                              <div>
                                Txn #:{" "}
                                {bill.linked_transaction.transaction_number}
                              </div>
                              <div>Date: {bill.linked_transaction.date}</div>
                              <div>
                                Amount: {bill.linked_transaction.amount}
                              </div>
                              <div>
                                Desc: {bill.linked_transaction.description}
                              </div>
                            </div>
                          ) : (
                            <span>Not Linked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No bills mapped</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Invoices Table */}
            <div>
              <h3>Invoices</h3>
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Linked Transaction ID</th>
                    <th>Linked Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingResults.invoices &&
                  mappingResults.invoices.length > 0 ? (
                    mappingResults.invoices.map((invoice) => (
                      <tr key={invoice.invoice_id}>
                        <td>{invoice.invoice_number}</td>
                        <td>{invoice.invoice_date}</td>
                        <td>{invoice.invoice_amount}</td>
                        <td>
                          {invoice.linked_transaction ? (
                            invoice.linked_transaction.transaction_id
                          ) : (
                            <span>Not Linked</span>
                          )}
                        </td>
                        <td>
                          {invoice.linked_transaction ? (
                            <div>
                              <div>
                                Txn #:{" "}
                                {invoice.linked_transaction.transaction_number}
                              </div>
                              <div>Date: {invoice.linked_transaction.date}</div>
                              <div>
                                Amount: {invoice.linked_transaction.amount}
                              </div>
                              <div>
                                Desc: {invoice.linked_transaction.description}
                              </div>
                            </div>
                          ) : (
                            <span>Not Linked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No invoices mapped</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div
        style={{
          marginTop: "3rem",
          borderTop: "1px solid #ccc",
          paddingTop: "2rem",
        }}
      >
        <h2>Search Records</h2>
        <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="transaction">Transactions</option>
            <option value="bill">Bills</option>
            <option value="invoice">Invoices</option>
          </select>
          <input
            type="text"
            placeholder="Search by number, date, amount, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginLeft: "1rem", marginRight: "1rem" }}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
        {searchLoading && <div>Searching...</div>}
        {searchResults && (
          <div style={{ marginTop: "1rem" }}>
            <table border="1" cellPadding="5">
              <thead>
                <tr>
                  {searchType === "transaction" && (
                    <>
                      <th>ID</th>
                      <th>Transaction #</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Description</th>
                    </>
                  )}
                  {searchType === "bill" && (
                    <>
                      <th>ID</th>
                      <th>Bill #</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Linked Transaction ID</th>
                    </>
                  )}
                  {searchType === "invoice" && (
                    <>
                      <th>ID</th>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Linked Transaction ID</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {searchResults.length === 0 ? (
                  <tr>
                    <td colSpan="5">No results found</td>
                  </tr>
                ) : (
                  searchResults.map((item, idx) => (
                    <tr key={idx}>
                      {searchType === "transaction" && (
                        <>
                          <td>{item.id}</td>
                          <td>{item.transaction_number}</td>
                          <td>{item.date}</td>
                          <td>{item.amount}</td>
                          <td>{item.description}</td>
                        </>
                      )}
                      {searchType === "bill" && (
                        <>
                          <td>{item.id}</td>
                          <td>{item.bill_number}</td>
                          <td>{item.date}</td>
                          <td>{item.amount}</td>
                          <td>{item.linked_transaction_id}</td>
                        </>
                      )}
                      {searchType === "invoice" && (
                        <>
                          <td>{item.id}</td>
                          <td>{item.invoice_number}</td>
                          <td>{item.date}</td>
                          <td>{item.amount}</td>
                          <td>{item.linked_transaction_id}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
