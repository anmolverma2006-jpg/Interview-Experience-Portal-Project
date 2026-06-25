import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Auth from './components/Auth';
import CreatePost from './components/CreatePost';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get('/api/check-auth', { withCredentials: true });
        setIsAuthenticated(true);
        setUser(res.data.user);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/logout', {}, { withCredentials: true });
    } catch {}
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isCheckingAuth) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <span>Loading portal...</span>
      </div>
    );
  }

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
      <Routes>
        {/* Landing page - shown to all, but redirects logged-in users to /feed */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/feed" /> : <LandingPage />
        } />

        {/* Auth routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/feed" /> :
          <Auth initialIsLogin={true} onLoginSuccess={handleLoginSuccess} />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/feed" /> :
          <Auth initialIsLogin={false} onLoginSuccess={handleLoginSuccess} />
        } />

        {/* Feed - public */}
        <Route path="/feed" element={<Feed isAuthenticated={isAuthenticated} />} />

        {/* Protected routes */}
        <Route path="/create" element={
          isAuthenticated ? <CreatePost /> : <Navigate to="/login" />
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />
        } />
        <Route path="/profile" element={
          isAuthenticated ? <Profile user={user} /> : <Navigate to="/login" />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;