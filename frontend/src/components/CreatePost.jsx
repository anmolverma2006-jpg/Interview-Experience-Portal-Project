import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreatePost() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Selected');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(
        '/api/experiences',
        { company, role, status, content },
        { withCredentials: true }
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post. Are you logged in?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container-sm fade-in">
      <div className="section-header" style={{ textAlign: 'center' }}>
        <h2 className="section-title">Share Your Experience</h2>
        <p className="section-subtitle">Help your peers prepare with your real story</p>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="form-group">
              <label className="form-label">Company</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Google, Amazon"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role Applied For</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SDE Intern"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Interview Result</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Waiting">Waiting for Results</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Interview Details</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the rounds, questions asked, difficulty level, tips for others..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
            />
          </div>

          <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button type="submit" className="btn-gradient" disabled={loading}>
              {loading ? (
                <>
                  <span style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Posting...
                </>
              ) : (
                'Post Experience'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;