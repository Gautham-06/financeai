import { useState } from "react";
import { mapRecords } from "../services/api";

export default function BankStatements() {
  const [bankStatement, setBankStatement] = useState(null);
  const [bills, setBills] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");
  const [mappingResults, setMappingResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event, fileType) => {
    const files = Array.from(event.target.files);
    if (fileType === "bank") {
      setBankStatement(files[0] || null);
    } else if (fileType === "bill") {
      setBills(files);
    } else if (fileType === "invoice") {
      setInvoices(files);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setMappingResults(null);
    if (!bankStatement || bills.length === 0 || invoices.length === 0) {
      setError("Please upload all files.");
      setLoading(false);
      return;
    }
    try {
      const response = await mapRecords.mapRecords(
        bankStatement,
        bills,
        invoices
      );
      if (response && response.data) {
        setMappingResults(response.data);
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      setError(`Failed to map records: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
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
            onChange={(e) => handleFileChange(e, "bank")}
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
            accept=".pdf,.doc,.docx"
            multiple
            onChange={(e) => handleFileChange(e, "bill")}
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
            accept=".pdf,.doc,.docx"
            multiple
            onChange={(e) => handleFileChange(e, "invoice")}
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
          {/* Bills Table */}
          {mappingResults.bills && (
            <div style={{ marginBottom: "2rem" }}>
              <h3>Bills</h3>
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
                    <th>Bill Number</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingResults.bills.length === 0 ? (
                    <tr>
                      <td colSpan="4">No bills found</td>
                    </tr>
                  ) : (
                    mappingResults.bills.map((bill, idx) => (
                      <tr key={idx}>
                        <td>{bill.date}</td>
                        <td>{bill.transaction_id}</td>
                        <td>{bill.bill_number}</td>
                        <td>{bill.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* Invoices Table */}
          {mappingResults.invoices && (
            <div style={{ marginBottom: "2rem" }}>
              <h3>Invoices</h3>
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
                    <th>Invoice Number</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingResults.invoices.length === 0 ? (
                    <tr>
                      <td colSpan="4">No invoices found</td>
                    </tr>
                  ) : (
                    mappingResults.invoices.map((inv, idx) => (
                      <tr key={idx}>
                        <td>{inv.date}</td>
                        <td>{inv.transaction_id}</td>
                        <td>{inv.invoice_number}</td>
                        <td>{inv.amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
