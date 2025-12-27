import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <div className="home-content animate-fade-in-up">
                <div className="home-logo">
                    <div className="logo-mark">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                    <span className="logo-text">ClassCheck</span>
                </div>

                <p className="home-subtitle">
                    Smart attendance tracking with QR codes and geolocation verification
                </p>

                <div className="home-cards">
                    <Link to="/scan" className="home-card student-card">
                        <div className="card-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <path d="M7 7h.01M7 12h.01M7 17h.01M12 7h.01M12 12h.01M12 17h.01M17 7h.01M17 12h.01M17 17h.01" />
                            </svg>
                        </div>
                        <h3>Scan QR</h3>
                        <p>Mark your attendance</p>
                    </Link>

                    <Link to="/student/login" className="home-card portal-card">
                        <div className="card-icon-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <h3>My Dashboard</h3>
                        <p>View attendance history</p>
                    </Link>
                </div>

                <div className="admin-link">
                    <Link to="/admin/login">Admin Portal →</Link>
                </div>

                <div className="home-features">
                    <div className="feature">
                        <span className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </span>
                        50m Radius Check
                    </div>
                    <div className="feature">
                        <span className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </span>
                        Dynamic QR Codes
                    </div>
                    <div className="feature">
                        <span className="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </span>
                        Real-time Tracking
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
