import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudentAuth } from '../../context/StudentAuthContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const { forgotPassword } = useStudentAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-page">
            <div className="forgot-container animate-fade-in-up">
                <div className="forgot-card card">
                    <Link to="/student/login" className="back-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Back to login
                    </Link>

                    {!sent ? (
                        <>
                            <div className="forgot-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                                </svg>
                            </div>
                            <h1>Forgot Password?</h1>
                            <p>Enter your email and we'll send you a reset link</p>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {error && <div className="alert alert-error">{error}</div>}

                                <button type="submit" className="btn btn-success w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="sent-state">
                            <div className="sent-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h1>Check Your Email</h1>
                            <p>We've sent a password reset link to <strong>{email}</strong></p>
                            <p className="note">Didn't receive it? Check your spam folder or try again.</p>
                            <button
                                className="btn btn-secondary w-full"
                                onClick={() => setSent(false)}
                            >
                                Try Another Email
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
