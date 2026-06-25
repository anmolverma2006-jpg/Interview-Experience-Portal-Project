import { useState, useEffect } from 'react';
import axios from 'axios';

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          axios.get('/api/me', { withCredentials: true }),
          axios.get('/api/my-posts', { withCredentials: true }),
        ]);
        setProfile(profileRes.data.user);
        setPostCount(postsRes.data.length);
      } catch (err) {
        console.error('Failed to load profile', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="spinner" />
        <p style={{ marginTop: 14, color: '#9ca3af', fontSize: '0.875rem' }}>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error || 'Profile not found.'}</div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <h2 className="section-title">Profile</h2>
        <p className="section-subtitle">Your account information</p>
      </div>

      {/* Profile header card */}
      <div className="profile-header">
        <div className="profile-avatar">{getInitials(profile.name)}</div>
        <div>
          <h2 className="profile-name">{profile.name || 'No name set'}</h2>
          <p className="profile-email">{profile.email}</p>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <span className="badge" style={{
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.20)',
            }}>
              {profile.branch || 'No branch set'}
            </span>
            <span className="badge" style={{
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.20)',
            }}>
              {postCount} Post{postCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="profile-info-grid">
        <div className="profile-info-item">
          <div className="profile-info-label">User ID</div>
          <div className="profile-info-value" style={{ fontFamily: 'monospace', color: '#9ca3af' }}>
            #{profile.id}
          </div>
        </div>

        <div className="profile-info-item">
          <div className="profile-info-label">Full Name</div>
          <div className="profile-info-value">{profile.name || '—'}</div>
        </div>

        <div className="profile-info-item">
          <div className="profile-info-label">Email</div>
          <div className="profile-info-value" style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
            {profile.email}
          </div>
        </div>

        <div className="profile-info-item">
          <div className="profile-info-label">Branch</div>
          <div className="profile-info-value">{profile.branch || '—'}</div>
        </div>

        <div className="profile-info-item">
          <div className="profile-info-label">Member Since</div>
          <div className="profile-info-value">{formatDate(profile.created_at)}</div>
        </div>

        <div className="profile-info-item">
          <div className="profile-info-label">Posts Shared</div>
          <div className="profile-info-value" style={{ color: '#2563eb' }}>
            {postCount}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;