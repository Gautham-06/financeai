import { useState } from 'react';

export default function BankStatements() {
  const [statements, setStatements] = useState([]);
  const [error, setError] = useState('');
  const [filterBank, setFilterBank] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const banks = ['HDFC', 'SBI', 'ICICI', 'Axis', 'Other'];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would process the file and make an API call
      const newStatement = {
        id: statements.length + 1,
        name: file.name,
        bank: 'HDFC', // This would be extracted from the statement
        date: new Date().toLocaleDateString(),
        amount: '₹50,000',
        transactions: 25,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: 'Processed',
      };
      setStatements([...statements, newStatement]);
    }
  };

  const handleView = (statement) => {
    setSelectedStatement(statement);
    setViewDialogOpen(true);
  };

  const handleDelete = (id) => {
    setStatements(statements.filter(statement => statement.id !== id));
  };

  const filteredStatements = statements.filter(statement => {
    if (filterBank !== 'all' && statement.bank !== filterBank) return false;
    if (filterDate && statement.date !== filterDate) return false;
    return true;
  });

  return (
    <div>
      <div className="header">
        <h1>Bank Statements</h1>
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById('fileInput').click()}
        >
          Upload Statement
          <input
            id="fileInput"
            type="file"
            hidden
            accept=".pdf,.csv"
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
          value={filterBank}
          onChange={(e) => setFilterBank(e.target.value)}
        >
          <option value="all">All Banks</option>
          {banks.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
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
            <th>Statement Details</th>
            <th>Bank</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStatements.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-statements">
                No statements found
              </td>
            </tr>
          ) : (
            filteredStatements.map((statement) => (
              <tr key={statement.id}>
                <td>
                  <div>
                    <h3>{statement.name}</h3>
                    <p>{statement.transactions} transactions • {statement.size}</p>
                  </div>
                </td>
                <td>{statement.bank}</td>
                <td>{statement.date}</td>
                <td>{statement.amount}</td>
                <td>
                  <span className={`status ${statement.status === 'Processed' ? 'success' : 'warning'}`}>
                    {statement.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleView(statement)}>View</button>
                  <button>Download</button>
                  <button onClick={() => handleDelete(statement.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 