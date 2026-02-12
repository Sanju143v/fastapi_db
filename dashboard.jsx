import React, { useEffect, useState } from 'react';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for tokens
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Simulate fetching user data or actual fetch if endpoint exists
        // For now, we'll just parse the email if it's in the token or local storage
        setUser({
            email: 'user@example.com', // Placeholder
            name: 'System Administrator',
            role: 'Project Manager'
        });
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <span style={styles.logoIcon}>📱</span>
                    <span style={styles.logoText}>MyApp</span>
                </div>

                <nav style={styles.nav}>
                    <div style={{ ...styles.navItem, ...styles.navActive }}>
                        <span>🏠</span> Dashboard
                    </div>
                    <div style={styles.navItem} onClick={() => window.location.href = '/askme'}>
                        <span>🤖</span> AskAI
                    </div>
                    <div style={styles.navItem}>
                        <span>📊</span> Analytics
                    </div>
                    <div style={styles.navItem}>
                        <span>📁</span> Projects
                    </div>
                    <div style={styles.navItem}>
                        <span>👥</span> Team
                    </div>
                    <div style={styles.navItem}>
                        <span>⚙️</span> Settings
                    </div>
                </nav>

                <div style={styles.logoutSection}>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        <span>🚪</span> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                <header style={styles.header}>
                    <div style={styles.breadcrumb}>
                        Pages / <span style={{ fontWeight: 600, color: '#2d3748' }}>Dashboard</span>
                    </div>

                    <div style={styles.profile}>
                        <input type="text" placeholder="Search..." style={styles.search} />
                        <div style={styles.avatar}>SA</div>
                    </div>
                </header>

                <main style={styles.main}>
                    <h1 style={styles.greeting}>Welcome back, {user.name}!</h1>
                    <p style={styles.subtitle}>Here's what's happening with your projects today.</p>

                    {/* Stats Cards */}
                    <div style={styles.statsGrid}>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.cardLabel}>TODAY'S USAGE</span>
                                <span style={styles.cardIcon}>💎</span>
                            </div>
                            <div style={styles.cardValue}>2,300</div>
                            <div style={styles.cardTrend}>+55% <span style={{ color: '#a0aec0', fontWeight: 400 }}>since yesterday</span></div>
                        </div>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.cardLabel}>NEW USERS</span>
                                <span style={styles.cardIcon}>👤</span>
                            </div>
                            <div style={styles.cardValue}>12,400</div>
                            <div style={styles.cardTrend}>+3% <span style={{ color: '#a0aec0', fontWeight: 400 }}>since last week</span></div>
                        </div>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.cardLabel}>TASKS COMPLETED</span>
                                <span style={styles.cardIcon}>✅</span>
                            </div>
                            <div style={styles.cardValue}>1,020</div>
                            <div style={styles.cardTrend}>-2% <span style={{ color: '#a0aec0', fontWeight: 400 }}>since yesterday</span></div>
                        </div>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.cardLabel}>REVENUE</span>
                                <span style={styles.cardIcon}>💰</span>
                            </div>
                            <div style={styles.cardValue}>$103,430</div>
                            <div style={styles.cardTrend}>+12% <span style={{ color: '#a0aec0', fontWeight: 400 }}>than last month</span></div>
                        </div>
                    </div>

                    {/* Projects Table */}
                    <div style={styles.tableCard}>
                        <h3 style={styles.tableTitle}>Recent Projects</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeadRow}>
                                    <th style={styles.th}>COMPANIES</th>
                                    <th style={styles.th}>MEMBERS</th>
                                    <th style={styles.th}>BUDGET</th>
                                    <th style={styles.th}>COMPLETION</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={styles.tableRow}>
                                    <td style={styles.td}>
                                        <div style={styles.compCell}>
                                            <div style={{ ...styles.compIcon, background: '#3182ce' }}>A</div>
                                            Antigravity Platform
                                        </div>
                                    </td>
                                    <td style={styles.td}>3 members</td>
                                    <td style={styles.td}>$14,000</td>
                                    <td style={styles.td}>60%</td>
                                </tr>
                                <tr style={styles.tableRow}>
                                    <td style={styles.td}>
                                        <div style={styles.compCell}>
                                            <div style={{ ...styles.compIcon, background: '#e53e3e' }}>F</div>
                                            FastAPI Backend
                                        </div>
                                    </td>
                                    <td style={styles.td}>2 members</td>
                                    <td style={styles.td}>$8,000</td>
                                    <td style={styles.td}>100%</td>
                                </tr>
                                <tr style={styles.tableRow}>
                                    <td style={styles.td}>
                                        <div style={styles.compCell}>
                                            <div style={{ ...styles.compIcon, background: '#38a169' }}>D</div>
                                            Database Sync
                                        </div>
                                    </td>
                                    <td style={styles.td}>5 members</td>
                                    <td style={styles.td}>$22,500</td>
                                    <td style={styles.td}>45%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: "'Inter', sans-serif",
    },
    sidebar: {
        width: '260px',
        backgroundColor: 'white',
        borderRight: '1px solid #edf2f7',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        position: 'fixed',
        height: '100vh',
    },
    logoArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px',
    },
    logoIcon: { fontSize: '28px' },
    logoText: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#2d3748',
        letterSpacing: '-0.5px',
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        color: '#718096',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    navActive: {
        backgroundColor: '#f7fafc',
        color: '#3182ce',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
    },
    logoutSection: {
        paddingTop: '20px',
        borderTop: '1px solid #edf2f7',
    },
    logoutBtn: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: 'none',
        border: 'none',
        color: '#e53e3e',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        textAlign: 'left',
    },
    mainContent: {
        marginLeft: '260px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        height: '80px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 40px',
        backgroundColor: 'rgba(248, 249, 250, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    breadcrumb: { color: '#a0aec0', fontSize: '13px' },
    profile: { display: 'flex', alignItems: 'center', gap: '20px' },
    search: {
        padding: '10px 16px',
        borderRadius: '10px',
        border: '1px solid #edf2f7',
        fontSize: '14px',
        width: '200px',
        outline: 'none',
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: '#3182ce',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '13px',
    },
    main: { padding: '32px 40px' },
    greeting: { fontSize: '28px', color: '#2d3748', marginBottom: '4px', fontWeight: '700' },
    subtitle: { color: '#718096', marginBottom: '32px', fontSize: '15px' },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
    },
    card: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.05)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    cardLabel: { color: '#a0aec0', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' },
    cardIcon: { fontSize: '20px' },
    cardValue: { fontSize: '24px', fontWeight: '700', color: '#2d3748', marginBottom: '4px' },
    cardTrend: { fontSize: '13px', color: '#38a169', fontWeight: '700' },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.05)',
    },
    tableTitle: { fontSize: '18px', color: '#2d3748', marginBottom: '20px', fontWeight: '700' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        textAlign: 'left',
        fontSize: '11px',
        color: '#a0aec0',
        paddingBottom: '16px',
        fontWeight: '700',
        borderBottom: '1px solid #edf2f7',
    },
    td: { padding: '16px 0', fontSize: '14px', color: '#4a5568', borderBottom: '1px solid #f7fafc' },
    compCell: { display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', color: '#2d3748' },
    compIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
    },
    loadingContainer: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #edf2f7',
        borderTopColor: '#3182ce',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
};

export default Dashboard;
