import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const { student, logout, getAttendance } = useStudentAuth();
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await getAttendance();
            setAttendance(res.data);
            setStats(res.stats);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PRESENT':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                );
            case 'LATE':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                );
            default:
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                );
        }
    };

    return (
        <div className="student-dashboard">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>My Dashboard</h1>
                    <p>Welcome, {student?.name}</p>
                </div>
                <div className="header-right">
                    <ThemeToggle />
                    <Link to="/student/profile" className="btn btn-secondary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Profile
                    </Link>
                    <Link to="/scan" className="btn btn-success">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M7 7h.01M7 12h.01M7 17h.01M12 7h.01M12 12h.01M12 17h.01M17 7h.01M17 12h.01M17 17h.01" />
                        </svg>
                        Scan QR
                    </Link>
                    <button className="btn btn-ghost" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                {/* Profile Card */}
                <div className="profile-card card">
                    <div className="profile-avatar">
                        {student?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h3>{student?.name}</h3>
                        <p className="roll-badge">{student?.rollNo}</p>
                        <p className="email">{student?.email}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>{stats?.total || 0}</h3>
                            <p>Total Records</p>
                        </div>
                    </div>
                    <div className="stat-card present">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>{stats?.present || 0}</h3>
                            <p>Present</p>
                        </div>
                    </div>
                    <div className="stat-card late">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>{stats?.late || 0}</h3>
                            <p>Late</p>
                        </div>
                    </div>
                    <div className="stat-card invalid">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>{stats?.invalid || 0}</h3>
                            <p>Invalid</p>
                        </div>
                    </div>
                </div>

                {/* Attendance History */}
                <div className="attendance-section card">
                    <h3>Attendance History</h3>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading records...</p>
                        </div>
                    ) : attendance.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <h4>No Attendance Records</h4>
                            <p>Scan a QR code to mark your first attendance</p>
                            <Link to="/scan" className="btn btn-success">
                                Scan QR Code
                            </Link>
                        </div>
                    ) : (
                        <div className="attendance-list">
                            {attendance.map(record => (
                                <div key={record._id} className="attendance-item">
                                    <div className={`status-indicator ${record.status.toLowerCase()}`}>
                                        {getStatusIcon(record.status)}
                                    </div>
                                    <div className="attendance-info">
                                        <h4>{record.session?.courseName || 'Unknown Session'}</h4>
                                        <p>{new Date(record.createdAt).toLocaleDateString('en-IN', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                    <div className="attendance-meta">
                                        <span className={`badge badge-${record.status.toLowerCase()}`}>
                                            {record.status}
                                        </span>
                                        <span className="distance">{record.distance}m</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
