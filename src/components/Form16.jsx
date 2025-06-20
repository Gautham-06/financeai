import { useState } from 'react';

export default function Form16() {
  const [form16s, setForm16s] = useState([]);
  const [error, setError] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [selectedForm16, setSelectedForm16] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const years = ['2023-24', '2022-23', '2021-22', '2020-21'];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would process the file and make an API call
      const newForm16 = {
        id: form16s.length + 1,
        name: file.name,
        year: '2023-24',
        date: new Date().toLocaleDateString(),
        status: 'Pending',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      };
      setForm16s([...form16s, newForm16]);
    }
  };

  const handleView = (form16) => {
    setSelectedForm16(form16);
    setViewDialogOpen(true);
  };

  const handleDelete = (id) => {
    setForm16s(form16s.filter(form16 => form16.id !== id));
  };

  const filteredForm16s = form16s.filter(form16 => {
    if (filterYear !== 'all' && form16.year !== filterYear) return false;
    return true;
  });

  return (
    <div>
      <div className="header">
        <h1>Form 16</h1>
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById('fileInput').click()}
        >
          Upload Form 16
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
            <th>Form 16 Details</th>
            <th>Year</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredForm16s.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-form16s">
                No Form 16s found
              </td>
            </tr>
          ) : (
            filteredForm16s.map((form16) => (
              <tr key={form16.id}>
                <td>
                  <div>
                    <h3>{form16.name}</h3>
                    <p>{form16.size}</p>
                  </div>
                </td>
                <td>{form16.year}</td>
                <td>{form16.date}</td>
                <td>
                  <span className={`status ${form16.status === 'Verified' ? 'success' : 'warning'}`}>
                    {form16.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleView(form16)}>View</button>
                  <button>Download</button>
                  <button onClick={() => handleDelete(form16.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 