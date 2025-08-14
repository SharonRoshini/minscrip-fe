import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

export default function CsvUpload() {
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('Total Hours');
  const [sortOrder, setSortOrder] = useState('desc');

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
      const res = await axios.post('https://min-scrip.vercel.app/analyze-xlsx', formData);
      if (res.data.users) {
        setUsers(res.data.users);
        setSortBy('Total Hours');
        setSortOrder('desc');
      } else {
        setError('No users found in analysis.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Ensure the backend is running and file format is correct.');
    }
  };

  const handleHeaderClick = (column) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newOrder);

    const sortedData = [...users].sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];

      if (column === 'Name') {
        valueA = String(valueA || '').toLowerCase();
        valueB = String(valueB || '').toLowerCase();
        return newOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      // Handle "Inf" values for ratios
      if (valueA === "Inf") valueA = 999999;
      if (valueB === "Inf") valueB = 999999;
      
      valueA = parseFloat(valueA) || 0;
      valueB = parseFloat(valueB) || 0;
      
      return newOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

    setUsers(sortedData);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return ' ↕';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const getHeaderStyle = (column) => ({
    cursor: 'pointer',
    userSelect: 'none',
    padding: '12px 8px',
    backgroundColor: sortBy === column ? '#e3f2fd' : '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
    position: 'relative'
  });

  return (
    <div className="page">
      <div className="form-container">
        <h1>VitelGlobal User Call Analysis</h1>
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
            <h2>User Data Analysis</h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th 
                      onClick={() => handleHeaderClick('Name')}
                      style={getHeaderStyle('Name')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'Name') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'Name') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Name"
                    >
                      Name{getSortIcon('Name')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('Total Hours')}
                      style={getHeaderStyle('Total Hours')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'Total Hours') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'Total Hours') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Total Hours"
                    >
                      Total Hours{getSortIcon('Total Hours')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('Missed Calls')}
                      style={getHeaderStyle('Missed Calls')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'Missed Calls') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'Missed Calls') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Missed Calls"
                    >
                      Missed Calls{getSortIcon('Missed Calls')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('Voicemails')}
                      style={getHeaderStyle('Voicemails')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'Voicemails') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'Voicemails') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Voicemails"
                    >
                      Voicemails{getSortIcon('Voicemails')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('Call Ratio (Inbound/Outbound)')}
                      style={getHeaderStyle('Call Ratio (Inbound/Outbound)')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'Call Ratio (Inbound/Outbound)') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'Call Ratio (Inbound/Outbound)') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Call Ratio"
                    >
                      Call Ratio (In/Out){getSortIcon('Call Ratio (Inbound/Outbound)')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('Duration Ratio (Inbound/Outbound)')}
                      style={getHeaderStyle('Duration Ratio (Inbound/Outbound)')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'Duration Ratio (Inbound/Outbound)') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'Duration Ratio (Inbound/Outbound)') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Duration Ratio"
                    >
                      Duration Ratio (In/Out){getSortIcon('Duration Ratio (Inbound/Outbound)')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr 
                      key={idx}
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6' }}>{user.Name}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'right' }}>{user["Total Hours"]}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{user["Missed Calls"]}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{user.Voicemails}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{user["Call Ratio (Inbound/Outbound)"]}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{user["Duration Ratio (Inbound/Outbound)"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}