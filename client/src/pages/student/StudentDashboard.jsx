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

    // Course detail state
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseDetail, setCourseDetail] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [courseTab, setCourseTab] = useState('announcements');
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
        setSelectedCourse(courseId);
        setCourseTab('announcements');

        try {
            // Fetch course detail (attendance)
            const detailRes = await axios.get(`${API_URL}/student-auth/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourseDetail(detailRes.data.data);

            // Fetch announcements
            const announcementsRes = await axios.get(`${API_URL}/courses/${courseId}/announcements`);
            setAnnouncements(announcementsRes.data.data || []);

            // Fetch materials
            const materialsRes = await axios.get(`${API_URL}/courses/${courseId}/materials`);
            setMaterials(materialsRes.data.data || []);

            // Fetch assignments
            const assignmentsRes = await axios.get(`${API_URL}/courses/${courseId}/assignments`);
            setAssignments(assignmentsRes.data.data || []);

        } catch (error) {
            console.error('Failed to fetch course details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const closeCourseDetail = () => {
        setSelectedCourse(null);
        setCourseDetail(null);
        setMaterials([]);
        setAnnouncements([]);
        setAssignments([]);
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
                    <Link to="/scan" className="btn btn-success">Scan QR</Link>
                    <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                {/* Profile Card */}
                <div className="profile-card card">
                    <div className="profile-avatar">{student?.name?.charAt(0)?.toUpperCase()}</div>
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

                {/* Course List */}
                {!selectedCourse && (
                    <div className="courses-section card">
                        <h3>📚 My Courses</h3>
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
                                <Link to="/scan" className="btn btn-success">Scan QR Code</Link>
                            </div>
                        ) : (
                            <div className="courses-list">
                                {courses.map(course => (
                                    <div key={course._id} className="course-item" onClick={() => fetchCourseDetail(course._id)}>
                                        <div className="course-info">
                                            <span className="course-code">{course.courseCode}</span>
                                            <h4>{course.courseName}</h4>
                                            {course.semester && <span className="semester">{course.semester}</span>}
                                        </div>
                                        <div className="course-stats">
                                            <div className="attendance-percentage" style={{
                                                background: `linear-gradient(90deg, var(--success) ${course.attendancePercentage}%, var(--bg-surface) ${course.attendancePercentage}%)`
                                            }}>
                                                <span>{course.attendancePercentage}%</span>
                                            </div>
                                            <p className="attendance-count">{course.attendanceCount} / {course.totalSessions} sessions</p>
                                        </div>
                                        <div className="course-arrow">→</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Course Detail View */}
                {selectedCourse && (
                    <div className="course-detail-section card">
                        <button className="back-link" onClick={closeCourseDetail}>← Back to Courses</button>

                        {detailLoading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading course...</p>
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

                                {/* Course Tabs */}
                                <div className="course-tabs">
                                    <button className={courseTab === 'announcements' ? 'active' : ''} onClick={() => setCourseTab('announcements')}>
                                        📢 Announcements ({announcements.length})
                                    </button>
                                    <button className={courseTab === 'materials' ? 'active' : ''} onClick={() => setCourseTab('materials')}>
                                        📁 Materials ({materials.length})
                                    </button>
                                    <button className={courseTab === 'assignments' ? 'active' : ''} onClick={() => setCourseTab('assignments')}>
                                        📝 Assignments ({assignments.length})
                                    </button>
                                    <button className={courseTab === 'attendance' ? 'active' : ''} onClick={() => setCourseTab('attendance')}>
                                        📅 Attendance
                                    </button>
                                </div>

                                {/* Announcements Tab */}
                                {courseTab === 'announcements' && (
                                    <div className="announcements-list">
                                        {announcements.length === 0 ? (
                                            <div className="empty-state-small">No announcements yet.</div>
                                        ) : (
                                            announcements.map(announcement => (
                                                <div key={announcement._id} className={`announcement-card ${announcement.isPinned ? 'pinned' : ''}`}>
                                                    {announcement.isPinned && <span className="pin-badge">📌 Pinned</span>}
                                                    <p>{announcement.content}</p>
                                                    <span className="announcement-date">
                                                        {new Date(announcement.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Materials Tab */}
                                {courseTab === 'materials' && (
                                    <div className="materials-list">
                                        {materials.length === 0 ? (
                                            <div className="empty-state-small">No materials shared yet.</div>
                                        ) : (
                                            materials.map(material => (
                                                <div key={material._id} className="material-card">
                                                    <div className="material-icon">{material.type === 'LINK' ? '🔗' : '📄'}</div>
                                                    <div className="material-info">
                                                        <h4>{material.title}</h4>
                                                        {material.description && <p>{material.description}</p>}
                                                        <span className="material-meta">
                                                            {material.type === 'FILE' && `${Math.round(material.fileSize / 1024)}KB • `}
                                                            {new Date(material.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {material.type === 'LINK' ? (
                                                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                                                            Open ↗
                                                        </a>
                                                    ) : (
                                                        <a href={`${API_URL}/courses/${selectedCourse}/materials/${material._id}/download`} className="btn btn-sm btn-secondary">
                                                            Download
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Assignments Tab */}
                                {courseTab === 'assignments' && (
                                    <div className="assignments-list">
                                        {assignments.length === 0 ? (
                                            <div className="empty-state-small">No assignments yet.</div>
                                        ) : (
                                            assignments.map(assignment => {
                                                const dueDate = new Date(assignment.dueDate);
                                                const isOverdue = dueDate < new Date();
                                                return (
                                                    <div key={assignment._id} className={`assignment-card ${isOverdue ? 'overdue' : ''}`}>
                                                        <div className="assignment-icon">📝</div>
                                                        <div className="assignment-info">
                                                            <h4>{assignment.title}</h4>
                                                            {assignment.description && <p>{assignment.description}</p>}
                                                            <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                                                                {isOverdue ? '⚠️ ' : '📅 '}
                                                                Due: {dueDate.toLocaleDateString('en-IN', {
                                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        {assignment.points > 0 && (
                                                            <span className="points-badge">{assignment.points} pts</span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}

                                {/* Attendance Tab */}
                                {courseTab === 'attendance' && (
                                    <div className="session-list">
                                        {courseDetail.sessions.map(session => (
                                            <div key={session._id} className={`session-item ${session.status.toLowerCase()}`}>
                                                <span className="session-number">#{session.sessionNumber}</span>
                                                <span className="session-date">
                                                    {new Date(session.date).toLocaleDateString('en-IN', {
                                                        weekday: 'short', day: 'numeric', month: 'short'
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
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
