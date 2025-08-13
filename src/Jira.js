import React, { useState } from 'react';
import axios from 'axios';
import './App.css'

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
      const response = await axios.post('http://localhost:5002/analyze-jira', {
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

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">JIRA Productivity Analyzer</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
        <input
          type="text"
          placeholder="JIRA Base URL"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className="w-full border px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Email / Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="API Token"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
          className="w-full border px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Project Key (optional)"
          value={projectKey}
          onChange={(e) => setProjectKey(e.target.value)}
          className="w-full border px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">Error: {error}</p>}

      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Overall Summary</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(result.summary, null, 2)}
          </pre>

          <h3 className="text-xl font-semibold mt-4 mb-2">User Stats</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(result.user_stats[Object.keys(result.user_stats)[0]] || {}).map((key) => (
                    <th key={key} className="border px-2 py-1 bg-gray-200">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.values(result.user_stats).map((user, idx) => (
                  <tr key={idx}>
                    {Object.values(user).map((val, i) => (
                      <td key={i} className="border px-2 py-1">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
