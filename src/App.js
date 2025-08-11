import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import CsvUpload from './CsvUpload';
import './App.css';
import axios from 'axios';

function HomePage() {
  const [file, setFile] = useState(null);
  const [days, setDays] = useState(60);
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult([]);

    if (!file || !days || !adminEmail) {
      setError('Please provide all required inputs.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('inactivity_days', days);
    formData.append('admin_email', adminEmail);

    try {
      const res = await axios.post('http://localhost:5002/upload', formData);
      if (res.data.results) {
        setResult(res.data.results);
      } else {
        setError('No results returned from server.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-container">
        <h1>Google Suites Report</h1>
        <form onSubmit={handleSubmit} className="input-box">
          <div className="input-group">
            <label>Upload Service Account JSON</label>
            <input type="file" accept="application/json" onChange={(e) => setFile(e.target.files[0])} required />
          </div>
          <div className="input-group">
            <label>Number of Inactivity Days</label>
            <input type="number" value={days} onChange={(e) => setDays(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Admin Email</label>
            <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
          </div>
          <button type="submit" className="generate-btn">
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </form>
        {error && <p className="error-msg">{error}</p>}
        {result.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Last Login</th>
                  <th>Inactive Days</th>
                  <th>Storage (GB)</th>
                </tr>
              </thead>
              <tbody>
                {result.map((user, index) => {
                  let rowClass = '';
                  if (user.storage_gb > 10 || user.inactive_days > 100) rowClass = 'high-usage';
                  else if (user.storage_gb > 5) rowClass = 'moderate-usage';
                  else if (user.storage_gb < 2) rowClass = 'low-usage';

                  return (
                    <tr key={index} className={rowClass}>
                      <td>{user.email}</td>
                      <td>{user.last_login}</td>
                      <td>{user.inactive_days}</td>
                      <td>{user.storage_gb}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload-csv" element={<CsvUpload />} />
      </Routes>
    </Router>
  );
}
