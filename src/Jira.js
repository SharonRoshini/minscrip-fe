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
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const userStatsHeaders = {
    assignee: 'Assignee',
    avg_time_per_task: 'Avg. Time per Task (seconds)',
    completed: 'Tasks Completed',
    completed_this_month: 'Completed This Month',
    completion_rate: 'Completion Rate (%)',
    in_progress: 'In Progress',
    todo: 'To Do',
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
              required
            />
          </div>
          <div className="input-group">
            <label>Email / Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>API Token</label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Project Key (optional)</label>
            <input
              type="text"
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
            />
          </div>
          <button type="submit" className="generate-btn" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {error && <div className="error-msg">Error: {error}</div>}

        {result && (
          <div className="table-wrapper">
            <h2>Overall Summary</h2>
            <table>
              <thead>
                <tr>
                  {Object.keys(result.summary || {}).map((key) => (
                    <th key={key}>{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.values(result.summary || {}).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              </tbody>
            </table>

            <h2>User Stats</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {Object.keys(userStatsHeaders).map((key) => (
                      <th key={key}>{userStatsHeaders[key]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.values(result.user_stats).map((user, idx) => (
                    <tr key={idx}>
                      {Object.keys(userStatsHeaders).map((key) => (
                        <td key={key}>{user[key]}</td>
                      ))}
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
