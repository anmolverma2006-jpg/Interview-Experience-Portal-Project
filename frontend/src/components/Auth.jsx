import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Auth({ onLoginSuccess, initialIsLogin }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(initialIsLogin);
    setMessage('');
    setIsError(false);
  }, [initialIsLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isLogin) {
        const res = await axios.post(
          'http://localhost:4000/login',
          { email, password },
          { withCredentials: true }
        );
        setIsError(false);
        setMessage('Logged in successfully! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(res.data.user);
          navigate('/feed');
        }, 800);
      } else {
        const res = await axios.post(
          'http://localhost:4000/register',
          { email, password, branch, name },
          { withCredentials: true }
        );
        setIsError(false);
        setMessage('Account created! Redirecting...');
        setTimeout(() => {
          onLoginSuccess(res.data.user);
          navigate('/feed');
        }, 800);
      }
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setMessage('');
    setIsError(false);
    navigate(loginMode ? '/login' : '/register');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">D</div>
          <h1 className="auth-title">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Sign in to access your account'
              : 'Join DTU Portal for free'}
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${isLogin ? ' active' : ''}`}
            onClick={() => switchMode(true)}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab${!isLogin ? ' active' : ''}`}
            onClick={() => switchMode(false)}
            type="button"
          >
            Register
          </button>
        </div>

        {message && (
          <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Branch / Department</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CSE, ECE, SE, IT"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-gradient w-full"
            style={{ justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.35)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite'
                }} />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-muted-sm">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => switchMode(!isLogin)}
            style={{
              background: 'none', border: 'none', color: 'var(--accent-light)',
              fontWeight: 600, cursor: 'pointer', padding: 0,
              fontFamily: 'inherit', fontSize: 'inherit'
            }}
          >
            {isLogin ? 'Register here' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;