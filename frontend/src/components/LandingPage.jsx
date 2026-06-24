import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          DTU Interview Experience Portal
        </div>

        <h1 className="hero-title">
          Prepare Smarter.<br />
          <span className="gradient-text">Get Placed.</span>
        </h1>

        <p className="hero-subtitle">
          Read real interview experiences shared by DTU seniors.
          Get insider knowledge on rounds, questions, and tips — all in one place.
        </p>

        <div className="hero-buttons">
          <button className="hero-btn-primary" onClick={() => navigate('/register')}>
            Get Started Free
          </button>
          <button className="hero-btn-outline" onClick={() => navigate('/feed')}>
            Browse Experiences
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Experiences</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">80+</span>
            <span className="stat-label">Companies</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Students</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;