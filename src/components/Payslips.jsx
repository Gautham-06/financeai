import { useState } from 'react';

export default function Payslips() {
  const [payslips, setPayslips] = useState([]);
  const [error, setError] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = ['2024', '2023', '2022', '2021'];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would process the file and make an API call
      const newPayslip = {
        id: payslips.length + 1,
        name: file.name,
        month: 'March',
        year: '2024',
        date: new Date().toLocaleDateString(),
        amount: '₹75,000',
        status: 'Processed',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      };
      setPayslips([...payslips, newPayslip]);
    }
  };

  const handleView = (payslip) => {
    setSelectedPayslip(payslip);
    setViewDialogOpen(true);
  };

  const handleDelete = (id) => {
    setPayslips(payslips.filter(payslip => payslip.id !== id));
  };

  const filteredPayslips = payslips.filter(payslip => {
    if (filterMonth !== 'all' && payslip.month !== filterMonth) return false;
    if (filterYear !== 'all' && payslip.year !== filterYear) return false;
    return true;
  });

  return (
    <div>
      <div className="header">
        <h1>Payslips</h1>
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById('fileInput').click()}
        >
          Upload Payslip
          <input
            id="fileInput"
            type="file"
            hidden
            accept=".pdf"
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
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="all">All Months</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="all">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Payslip Details</th>
            <th>Month</th>
            <th>Year</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayslips.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-payslips">
                No payslips found
              </td>
            </tr>
          ) : (
            filteredPayslips.map((payslip) => (
              <tr key={payslip.id}>
                <td>
                  <div>
                    <h3>{payslip.name}</h3>
                    <p>{payslip.size}</p>
                  </div>
                </td>
                <td>{payslip.month}</td>
                <td>{payslip.year}</td>
                <td>{payslip.amount}</td>
                <td>
                  <span className={`status ${payslip.status === 'Processed' ? 'success' : 'warning'}`}>
                    {payslip.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleView(payslip)}>View</button>
                  <button>Download</button>
                  <button onClick={() => handleDelete(payslip.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 