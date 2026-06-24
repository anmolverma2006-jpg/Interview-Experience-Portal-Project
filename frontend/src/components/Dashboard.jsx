import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard({ user }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editForm, setEditForm] = useState({ company: '', role: '', content: '', status: 'Selected' });
  const [actionMsg, setActionMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const fetchMyPosts = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/my-posts', { withCredentials: true });
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMyPosts(); }, []);

  const openEdit = (post) => {
    setEditingPost(post.id);
    setEditForm({ company: post.company, role: post.role, content: post.content, status: post.status });
    setActionMsg('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:4000/api/experiences/${editingPost}`,
        editForm,
        { withCredentials: true }
      );
      setIsError(false);
      setActionMsg('Post updated successfully.');
      setEditingPost(null);
      fetchMyPosts();
    } catch (err) {
      setIsError(true);
      setActionMsg(err.response?.data?.error || 'Failed to update post.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/experiences/${id}`, { withCredentials: true });
      setIsError(false);
      setActionMsg('Post deleted.');
      setDeleteConfirmId(null);
      fetchMyPosts();
    } catch (err) {
      setIsError(true);
      setActionMsg(err.response?.data?.error || 'Failed to delete post.');
    }
  };

  const getBadgeClass = (status) => {
    if (status === 'Selected') return 'badge badge-selected';
    if (status === 'Rejected') return 'badge badge-rejected';
    return 'badge badge-waiting';
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <h2 className="section-title">Dashboard</h2>
          <p className="section-subtitle">
            {posts.length} post{posts.length !== 1 ? 's' : ''} shared by you
          </p>
        </div>
        <button className="btn-gradient" onClick={() => navigate('/create')}>
          + New Post
        </button>
      </div>

      {actionMsg && (
        <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>
          {actionMsg}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="spinner" />
          <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading your posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 24 }}>
            You haven't shared any experiences yet.
          </p>
          <button className="btn-gradient" onClick={() => navigate('/create')}>
            Share Your First Experience
          </button>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post-card" style={{ marginBottom: 16 }}>
            <div className="post-card-header">
              <div>
                <div className="post-company">{post.company}</div>
                <div className="post-role-text">{post.role}</div>
              </div>
              <span className={getBadgeClass(post.status)}>{post.status}</span>
            </div>

            <p className="post-content">
              {post.content.length > 220 ? post.content.slice(0, 220) + '...' : post.content}
            </p>

            <div className="post-footer">
              <span>{formatDate(post.created_at)}</span>
              <div className="flex gap-2">
                <button className="btn-edit" onClick={() => openEdit(post)}>Edit</button>
                <button
                  className="btn-danger"
                  onClick={() => setDeleteConfirmId(deleteConfirmId === post.id ? null : post.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {deleteConfirmId === post.id && (
              <div className="confirm-dialog">
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.875rem' }}>
                  Are you sure you want to delete this post? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button className="btn-danger" onClick={() => handleDelete(post.id)}>
                    Yes, Delete
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => setDeleteConfirmId(null)}
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingPost(null)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Edit Post</h3>
              <button className="modal-close" onClick={() => setEditingPost(null)}>✕</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="row">
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Interview Result</label>
                <select
                  className="form-select"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  required
                  rows={5}
                />
              </div>

              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setEditingPost(null)}
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gradient">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;