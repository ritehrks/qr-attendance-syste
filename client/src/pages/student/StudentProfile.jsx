import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';
import './StudentProfile.css';

const StudentProfile = () => {
    const { student, updateProfile, changePassword, logout } = useStudentAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        name: student?.name || '',
        phone: student?.phone || '',
        batch: student?.batch || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            await updateProfile(profileData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);

        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div className="header-left">
                    <Link to="/student/dashboard" className="back-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Back to Dashboard
                    </Link>
                    <h1>Profile Settings</h1>
                </div>
                <button className="btn btn-ghost" onClick={handleLogout}>
                    Logout
                </button>
            </header>

            <main className="profile-content">
                {/* Profile Summary */}
                <div className="profile-summary card">
                    <div className="profile-avatar">
                        {student?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="profile-details">
                        <h2>{student?.name}</h2>
                        <p className="roll">{student?.rollNo}</p>
                        <p className="email">{student?.email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Edit Profile
                    </button>
                    <button
                        className={`tab ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Change Password
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content card">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit} className="profile-form">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        value={profileData.phone}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Batch</label>
                                    <input
                                        type="text"
                                        name="batch"
                                        className="form-input"
                                        value={profileData.batch}
                                        onChange={handleProfileChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-group readonly">
                                <label className="form-label">Email (cannot be changed)</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={student?.email || ''}
                                    disabled
                                />
                            </div>

                            <div className="form-group readonly">
                                <label className="form-label">Roll Number (cannot be changed)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={student?.rollNo || ''}
                                    disabled
                                />
                            </div>

                            {message.text && activeTab === 'profile' && (
                                <div className={`alert alert-${message.type}`}>{message.text}</div>
                            )}

                            <button type="submit" className="btn btn-success" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="password-form">
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    className="form-input"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    className="form-input"
                                    placeholder="At least 6 characters"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-input"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {message.text && activeTab === 'password' && (
                                <div className={`alert alert-${message.type}`}>{message.text}</div>
                            )}

                            <button type="submit" className="btn btn-success" disabled={loading}>
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudentProfile;
