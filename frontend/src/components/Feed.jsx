import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Feed({ isAuthenticated }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/experiences');
        setPosts(response.data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeClass = (status) => {
    if (status === 'Selected') return 'badge badge-selected';
    if (status === 'Rejected') return 'badge badge-rejected';
    return 'badge badge-waiting';
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 className="section-title">Experience Feed</h2>
          <p className="section-subtitle">Real stories from DTU students</p>
        </div>
        <button
          className="btn-gradient"
          onClick={() => isAuthenticated ? navigate('/create') : navigate('/login')}
        >
          + Share Yours
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search by company or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="spinner" />
          <p style={{ marginTop: 14, color: '#9ca3af', fontSize: '0.875rem' }}>Loading experiences...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '70px 40px' }}>
          <p style={{ color: '#9ca3af', marginBottom: 22, fontSize: '0.9rem' }}>
            No experiences posted yet. Be the first!
          </p>
          <button className="btn-gradient" onClick={() => navigate(isAuthenticated ? '/create' : '/register')}>
            {isAuthenticated ? 'Share Now' : 'Join & Share'}
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
          <p>No results for "<strong style={{ color: '#4b5563' }}>{searchTerm}</strong>"</p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-card-header">
              <div>
                <div className="post-company">{post.company}</div>
                <div className="post-role-text">{post.role}</div>
              </div>
              <span className={getBadgeClass(post.status)}>{post.status}</span>
            </div>
            <p className="post-content">{post.content}</p>
            <div className="post-footer">
              <span>{post.author_name || 'Anonymous'} &middot; {post.branch}</span>
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Feed;