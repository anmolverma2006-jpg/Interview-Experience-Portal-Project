import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar({ isAuthenticated, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <nav className="portal-navbar">
      <Link className="brand" to={isAuthenticated ? '/feed' : '/'}>
        DTU Portal
      </Link>

      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link className={`nav-link-btn${isActive('/feed') ? ' active' : ''}`} to="/feed">
              Feed
            </Link>
            <Link className={`nav-link-btn${isActive('/dashboard') ? ' active' : ''}`} to="/dashboard">
              Dashboard
            </Link>
            <Link className={`nav-link-btn${isActive('/profile') ? ' active' : ''}`} to="/profile">
              {user?.name ? user.name.split(' ')[0] : 'Profile'}
            </Link>
            <Link className="nav-btn-primary" to="/create">
              + Share
            </Link>
            <button className="nav-btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className={`nav-link-btn${isActive('/feed') ? ' active' : ''}`} to="/feed">
              Feed
            </Link>
            <Link className="nav-link-btn" to="/login">
              Login
            </Link>
            <Link className="nav-btn-primary" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;