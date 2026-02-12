import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store tokens
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);

                setMessage('Login successful! Redirecting...');
                setIsError(false);

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                setMessage(data.detail || 'Invalid email or password');
                setIsError(true);
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logoContainer}>
                    <div style={styles.logo}>🔐</div>
                </div>
                <h1 style={styles.title}>Welcome Back</h1>
                <p style={styles.subtitle}>Enter your credentials to access your account</p>

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.passwordWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={styles.input}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div style={styles.options}>
                        <label style={styles.remember}>
                            <input type="checkbox" style={styles.checkbox} />
                            Remember me
                        </label>
                        <a href="#" style={styles.forgot}>Forgot password?</a>
                    </div>

                    <button type="submit" disabled={isLoading} style={styles.button}>
                        {isLoading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                {message && (
                    <div style={{ ...styles.messageBox, backgroundColor: isError ? 'rgba(255, 77, 109, 0.1)' : 'rgba(6, 214, 160, 0.1)' }}>
                        <p style={{ ...styles.message, color: isError ? '#ff4d6d' : '#06d6a0' }}>
                            {message}
                        </p>
                    </div>
                )}

                <p style={styles.footer}>
                    Don't have an account? <a href="/signup" style={styles.link}>Create Account</a>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: '20px',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
    },
    logoContainer: {
        textAlign: 'center',
        marginBottom: '12px',
    },
    logo: {
        fontSize: '52px',
    },
    title: {
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: '700',
        textAlign: 'center',
        margin: '0 0 8px 0',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '14px',
        textAlign: 'center',
        margin: '0 0 32px 0',
        lineHeight: '1.5',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '13px',
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(255, 255, 255, 0.07)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: '#ffffff',
        fontSize: '15px',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
    },
    passwordWrapper: {
        position: 'relative',
    },
    eyeButton: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '4px',
        opacity: '0.6',
    },
    options: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
    },
    remember: {
        color: 'rgba(255, 255, 255, 0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
    },
    checkbox: {
        cursor: 'pointer',
        accentColor: '#667eea',
    },
    forgot: {
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '500',
    },
    button: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '10px',
        boxShadow: '0 10px 20px rgba(102, 126, 234, 0.2)',
    },
    messageBox: {
        marginTop: '20px',
        padding: '12px',
        borderRadius: '10px',
        textAlign: 'center',
    },
    message: {
        fontSize: '14px',
        fontWeight: '500',
        margin: 0,
    },
    footer: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '14px',
        textAlign: 'center',
        marginTop: '28px',
    },
    link: {
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '600',
        marginLeft: '5px',
    },
};

export default Login;
