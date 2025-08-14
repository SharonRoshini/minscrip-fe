import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

export default function JiraAnalyzer() {
  const [baseUrl, setBaseUrl] = useState('');
  const [username, setUsername] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('completion_rate');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('https://min-scrip.vercel.app/analyze-jira', {
        base_url: baseUrl,
        username,
        api_token: apiToken,
        project_key: projectKey || 'ALL'
      });
      setResult(response.data);
      setSortBy('completion_rate');
      setSortOrder('desc');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderClick = (column) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newOrder);

    if (result && result.user_stats) {
      const userArray = Object.values(result.user_stats);
      const sortedData = [...userArray].sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        if (column === 'assignee') {
          valueA = String(valueA || '').toLowerCase();
          valueB = String(valueB || '').toLowerCase();
          return newOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }

        valueA = parseFloat(valueA) || 0;
        valueB = parseFloat(valueB) || 0;
        
        return newOrder === 'asc' ? valueA - valueB : valueB - valueA;
      });

      // Update the result with sorted data
      const sortedUserStats = {};
      sortedData.forEach((user, index) => {
        sortedUserStats[`user_${index}`] = user;
      });
      
      setResult({
        ...result,
        user_stats: sortedUserStats
      });
    }
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

  // Convert seconds to minutes for display
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0';
    return Math.round(seconds / 60);
  };

  const userStatsHeaders = {
    assignee: 'Assignee',
    total: 'Total Tasks',
    completed: 'Completed',
    in_progress: 'In Progress',
    todo: 'To Do',
    completion_rate: 'Completion Rate (%)',
    total_time_spent: 'Total Time (min)',
    avg_time_per_task: 'Avg Time/Task (min)',
    completed_this_month: 'Completed This Month',
    overdue_tasks: 'Overdue Tasks'
  };

  return (
    <div className="page">
      <div className="form-container">
        <h1>JIRA Productivity Analyzer</h1>
        <form onSubmit={handleSubmit} className="input-box">
          <div className="input-group">
            <label>JIRA Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://yourcompany.atlassian.net"
              required
            />
          </div>
          <div className="input-group">
            <label>Email / Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-email@company.com"
              required
            />
          </div>
          <div className="input-group">
            <label>API Token</label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Your JIRA API token"
              required
            />
          </div>
          <div className="input-group">
            <label>Project Key (optional)</label>
            <input
              type="text"
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
              placeholder="Leave empty for all projects"
            />
          </div>
          <button type="submit" className="generate-btn" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {error && <div className="error-msg">Error: {error}</div>}

        {result && (
          <div className="table-wrapper">
            <h2>Project Summary</h2>
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                <div><strong>Total Issues:</strong> {result.summary?.total || 0}</div>
                <div><strong>Completed:</strong> {result.summary?.completed || 0}</div>
                <div><strong>In Progress:</strong> {result.summary?.in_progress || 0}</div>
                <div><strong>To Do:</strong> {result.summary?.todo || 0}</div>
                <div><strong>Overdue:</strong> {result.summary?.overdue || 0}</div>
                <div><strong>Completion Rate:</strong> {result.summary?.completion_rate || 0}%</div>
              </div>
            </div>

            {/* Unassigned Tasks Block */}
            {result.unassigned_stats && result.unassigned_stats.total > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h2>Unassigned Tasks</h2>
                <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                    <div><strong>Total:</strong> {result.unassigned_stats.total}</div>
                    <div><strong>Completed:</strong> {result.unassigned_stats.completed}</div>
                    <div><strong>In Progress:</strong> {result.unassigned_stats.in_progress}</div>
                    <div><strong>To Do:</strong> {result.unassigned_stats.todo}</div>
                    <div><strong>Overdue:</strong> {result.unassigned_stats.overdue_tasks}</div>
                    <div><strong>Completion Rate:</strong> {result.unassigned_stats.completion_rate}%</div>
                    <div><strong>Total Time:</strong> {formatTime(result.unassigned_stats.total_time_spent)} min</div>
                    <div><strong>Avg Time/Task:</strong> {formatTime(result.unassigned_stats.avg_time_per_task)} min</div>
                  </div>
                </div>
              </div>
            )}

            <h2>User Productivity Stats</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th 
                      onClick={() => handleHeaderClick('assignee')}
                      style={getHeaderStyle('assignee')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'assignee') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'assignee') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Assignee"
                    >
                      Assignee{getSortIcon('assignee')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('total')}
                      style={getHeaderStyle('total')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'total') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'total') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Total Tasks"
                    >
                      Total Tasks{getSortIcon('total')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('completed')}
                      style={getHeaderStyle('completed')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'completed') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'completed') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Completed"
                    >
                      Completed{getSortIcon('completed')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('in_progress')}
                      style={getHeaderStyle('in_progress')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'in_progress') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'in_progress') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by In Progress"
                    >
                      In Progress{getSortIcon('in_progress')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('todo')}
                      style={getHeaderStyle('todo')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'todo') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'todo') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by To Do"
                    >
                      To Do{getSortIcon('todo')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('completion_rate')}
                      style={getHeaderStyle('completion_rate')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'completion_rate') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'completion_rate') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Completion Rate"
                    >
                      Completion Rate (%){getSortIcon('completion_rate')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('total_time_spent')}
                      style={getHeaderStyle('total_time_spent')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'total_time_spent') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'total_time_spent') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Total Time"
                    >
                      Total Time (min){getSortIcon('total_time_spent')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('avg_time_per_task')}
                      style={getHeaderStyle('avg_time_per_task')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'avg_time_per_task') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'avg_time_per_task') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Average Time per Task"
                    >
                      Avg Time/Task (min){getSortIcon('avg_time_per_task')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('completed_this_month')}
                      style={getHeaderStyle('completed_this_month')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'completed_this_month') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'completed_this_month') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Completed This Month"
                    >
                      This Month{getSortIcon('completed_this_month')}
                    </th>
                    <th 
                      onClick={() => handleHeaderClick('overdue_tasks')}
                      style={getHeaderStyle('overdue_tasks')}
                      onMouseEnter={(e) => {
                        if (sortBy !== 'overdue_tasks') e.target.style.backgroundColor = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        if (sortBy !== 'overdue_tasks') e.target.style.backgroundColor = '#f8f9fa';
                      }}
                      title="Click to sort by Overdue Tasks"
                    >
                      Overdue{getSortIcon('overdue_tasks')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(result.user_stats || {}).map((user, idx) => (
                    <tr 
                      key={idx}
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6' }}>{user.assignee}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{user.total}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{user.completed}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{user.in_progress}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{user.todo}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{user.completion_rate}%</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{formatTime(user.total_time_spent)}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{formatTime(user.avg_time_per_task)}</td>
                      <td style={{ padding: '8px', borderRight: '1px solid #dee2e6', textAlign: 'center' }}>{user.completed_this_month}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{user.overdue_tasks}</td>
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