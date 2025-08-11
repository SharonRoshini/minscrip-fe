import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

export default function CsvUpload() {
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setUsers([]);

    if (!file) {
      setError('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5002/analyze-xlsx', formData);
      if (res.data.users) {
        setUsers(res.data.users);
      } else {
        setError('No users found in analysis.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Ensure the backend is running and file format is correct.');
    }
  };

  return (
    <div className="page">
      <div className="form-container">
        <h1>Upload XLSX for User Call Analysis</h1>
        <form onSubmit={handleUpload} className="input-box">
          <div className="input-group">
            <label>Select Excel File (.xlsx)</label>
            <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <button type="submit" className="generate-btn">Upload and Analyze</button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        {users.length > 0 && (
          <div className="table-wrapper">
            <h2>Top Users Based on Total Duration</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Total Hours</th>
                  <th>Missed Calls</th>
                  <th>Voicemails</th>
                  <th>Call Ratio (In/Out)</th>
                  <th>Duration Ratio (In/Out)</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={idx}>
                    <td>{user.Name}</td>
                    <td>{user["Total Hours"]}</td>
                    <td>{user["Missed Calls"]}</td>
                    <td>{user["Voicemails"]}</td>
                    <td>{user["Call Ratio (Inbound/Outbound)"]}</td>
                    <td>{user["Duration Ratio (Inbound/Outbound)"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
