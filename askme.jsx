import React, { useState, useEffect, useRef } from 'react';

const AskMe = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your MyApp assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    system_prompt: "You are a friendly, conversational human-like assistant for MyApp. Be helpful, concise, and professional yet warm."
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Let's try that again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.logoArea} onClick={() => window.location.href = '/dashboard'}>
                    <span style={styles.logoIcon}>📱</span>
                    <span style={styles.logoText}>MyApp</span>
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navItem} onClick={() => window.location.href = '/dashboard'}>
                        <span>🏠</span> Dashboard
                    </div>
                    <div style={{ ...styles.navItem, ...styles.navActive }}>
                        <span>🤖</span> AskAI
                    </div>
                </nav>
            </div>

            {/* Chat Area */}
            <div style={styles.chatArea}>
                <header style={styles.header}>
                    <div style={styles.headerTitle}>
                        <span style={{ fontSize: '24px' }}>🤖</span>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px' }}>AskMe AI</h2>
                            <p style={{ margin: 0, fontSize: '12px', color: '#38a169' }}>● Online & Ready to help</p>
                        </div>
                    </div>
                </header>

                <div style={styles.messagesContainer}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            ...styles.messageWrapper,
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            <div style={{
                                ...styles.message,
                                backgroundColor: msg.role === 'user' ? '#4318ff' : '#ffffff',
                                color: msg.role === 'user' ? '#ffffff' : '#1b2559',
                                borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '18px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div style={styles.messageWrapper}>
                            <div style={{ ...styles.message, backgroundColor: '#ffffff' }}>
                                <div style={styles.typing}>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} style={styles.inputArea}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        style={styles.input}
                        disabled={isLoading}
                    />
                    <button type="submit" style={styles.sendBtn} disabled={isLoading || !input.trim()}>
                        {isLoading ? '...' : 'Send 🚀'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', backgroundColor: '#f4f7fe', fontFamily: "'Inter', sans-serif" },
    sidebar: { width: '260px', backgroundColor: 'white', borderRight: '1px solid #edf2f7', display: 'flex', flexDirection: 'column', padding: '24px', position: 'fixed', height: '100vh' },
    logoArea: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', cursor: 'pointer' },
    logoIcon: { fontSize: '28px' },
    logoText: { fontSize: '20px', fontWeight: '800', color: '#2d3748' },
    nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
    navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#718096', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: '0.2s' },
    navActive: { backgroundColor: '#f4f7fe', color: '#4318ff' },
    chatArea: { marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' },
    header: { height: '80px', backgroundColor: 'white', display: 'flex', alignItems: 'center', padding: '0 40px', borderBottom: '1px solid #edf2f7', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
    headerTitle: { display: 'flex', alignItems: 'center', gap: '15px' },
    messagesContainer: { flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' },
    messageWrapper: { display: 'flex', width: '100%' },
    message: { maxWidth: '70%', padding: '15px 20px', borderRadius: '18px', fontSize: '15px', lineHeight: '1.5' },
    inputArea: { padding: '30px 40px', backgroundColor: 'white', borderTop: '1px solid #edf2f7', display: 'flex', gap: '15px' },
    input: { flex: 1, padding: '15px 25px', borderRadius: '30px', border: '1px solid #edf2f7', backgroundColor: '#f4f7fe', outline: 'none', transition: '0.3s' },
    sendBtn: { padding: '10px 25px', borderRadius: '30px', border: 'none', backgroundColor: '#4318ff', color: 'white', fontWeight: '700', cursor: 'pointer', transition: '0.3s' },
    typing: { display: 'flex', gap: '4px', padding: '5px' },
};

export default AskMe;
