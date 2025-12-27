import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import axios from 'axios';
import API_URL from '../../config/api';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const { student, token, logout, getAttendance } = useStudentAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseDetail, setCourseDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchAttendance();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_URL}/student-auth/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

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

    const fetchCourseDetail = async (courseId) => {
        setDetailLoading(true);
        try {
            const res = await axios.get(`${API_URL}/student-auth/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourseDetail(res.data.data);
            setSelectedCourse(courseId);
        } catch (error) {
            console.error('Failed to fetch course detail:', error);
        } finally {
            setDetailLoading(false);
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
                        <div className="stat-icon total">📚</div>
                        <div className="stat-info">
                            <h3>{courses.length}</h3>
                            <p>Courses</p>
                        </div>
                    </div>
                    <div className="stat-card present">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{stats?.present || 0}</h3>
                            <p>Present</p>
                        </div>
                    </div>
                    <div className="stat-card late">
                        <div className="stat-icon">⏰</div>
                        <div className="stat-info">
                            <h3>{stats?.late || 0}</h3>
                            <p>Late</p>
                        </div>
                    </div>
                    <div className="stat-card invalid">
                        <div className="stat-icon">❌</div>
                        <div className="stat-info">
                            <h3>{stats?.invalid || 0}</h3>
                            <p>Invalid</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <button
                        className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('courses'); setSelectedCourse(null); }}
                    >
                        📚 My Courses
                    </button>
                    <button
                        className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        📋 All Records
                    </button>
                </div>

                {/* Courses Tab */}
                {activeTab === 'courses' && !selectedCourse && (
                    <div className="courses-section card">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading courses...</p>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📚</div>
                                <h4>No Courses Yet</h4>
                                <p>Mark attendance in a class to be enrolled in courses</p>
                                <Link to="/scan" className="btn btn-success">
                                    Scan QR Code
                                </Link>
                            </div>
                        ) : (
                            <div className="courses-list">
                                {courses.map(course => (
                                    <div
                                        key={course._id}
                                        className="course-item"
                                        onClick={() => fetchCourseDetail(course._id)}
                                    >
                                        <div className="course-info">
                                            <span className="course-code">{course.courseCode}</span>
                                            <h4>{course.courseName}</h4>
                                            {course.semester && <span className="semester">{course.semester}</span>}
                                        </div>
                                        <div className="course-stats">
                                            <div className="attendance-percentage">
                                                <div
                                                    className="percentage-bar"
                                                    style={{
                                                        '--percentage': `${course.attendancePercentage}%`,
                                                        background: `linear-gradient(90deg, var(--success) ${course.attendancePercentage}%, var(--bg-surface) ${course.attendancePercentage}%)`
                                                    }}
                                                >
                                                    <span>{course.attendancePercentage}%</span>
                                                </div>
                                            </div>
                                            <p className="attendance-count">
                                                {course.attendanceCount} / {course.totalSessions} sessions
                                            </p>
                                        </div>
                                        <div className="course-arrow">→</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Course Detail View */}
                {activeTab === 'courses' && selectedCourse && (
                    <div className="course-detail-section card">
                        <button
                            className="back-link"
                            onClick={() => { setSelectedCourse(null); setCourseDetail(null); }}
                        >
                            ← Back to Courses
                        </button>

                        {detailLoading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading course detail...</p>
                            </div>
                        ) : courseDetail && (
                            <>
                                <div className="course-header">
                                    <span className="course-code">{courseDetail.course.courseCode}</span>
                                    <h3>{courseDetail.course.courseName}</h3>
                                </div>

                                <div className="course-stats-bar">
                                    <div className="stat">
                                        <span className="value">{courseDetail.stats.percentage}%</span>
                                        <span className="label">Attendance</span>
                                    </div>
                                    <div className="stat">
                                        <span className="value">{courseDetail.stats.present}</span>
                                        <span className="label">Present</span>
                                    </div>
                                    <div className="stat">
                                        <span className="value">{courseDetail.stats.late}</span>
                                        <span className="label">Late</span>
                                    </div>
                                    <div className="stat">
                                        <span className="value">{courseDetail.stats.absent}</span>
                                        <span className="label">Absent</span>
                                    </div>
                                </div>

                                <h4>Session History</h4>
                                <div className="session-list">
                                    {courseDetail.sessions.map(session => (
                                        <div key={session._id} className={`session-item ${session.status.toLowerCase()}`}>
                                            <span className="session-number">#{session.sessionNumber}</span>
                                            <span className="session-date">
                                                {new Date(session.date).toLocaleDateString('en-IN', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                            <span className={`status-badge ${session.status.toLowerCase()}`}>
                                                {session.status === 'PRESENT' && '✅'}
                                                {session.status === 'LATE' && '⏰'}
                                                {session.status === 'ABSENT' && '❌'}
                                                {session.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="attendance-section card">
                        <h3>All Attendance Records</h3>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading records...</p>
                            </div>
                        ) : attendance.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📋</div>
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
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
