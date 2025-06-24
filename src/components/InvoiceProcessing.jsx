import { useState } from 'react';

export default function InvoiceProcessing() {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const statuses = ['Pending', 'Approved', 'Rejected'];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would process the file and make an API call
      const newInvoice = {
        id: invoices.length + 1,
        name: file.name,
        date: new Date().toLocaleDateString(),
        amount: '₹15,000',
        status: 'Pending',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      };
      setInvoices([...invoices, newInvoice]);
    }
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleDelete = (id) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus !== 'all' && invoice.status !== filterStatus) return false;
    if (filterDate && invoice.date !== filterDate) return false;
    return true;
  });

  return (
    <div>
      <div className="header">
        <h1>Invoice Processing</h1>
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById('fileInput').click()}
        >
          Upload Invoice
          <input
            id="fileInput"
            type="file"
            hidden
            accept=".pdf,.jpg,.png"
            onChange={handleFileUpload}
          />
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Invoice Details</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-invoices">
                No invoices found
              </td>
            </tr>
          ) : (
            filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  <div>
                    <h3>{invoice.name}</h3>
                    <p>{invoice.size}</p>
                  </div>
                </td>
                <td>{invoice.date}</td>
                <td>{invoice.amount}</td>
                <td>
                  <span className={`status ${invoice.status === 'Approved' ? 'success' : invoice.status === 'Rejected' ? 'error' : 'warning'}`}>
                    {invoice.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleView(invoice)}>View</button>
                  <button>Download</button>
                  <button onClick={() => handleDelete(invoice.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 