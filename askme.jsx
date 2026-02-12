import React, { useState, useEffect, useRef } from 'react';

const AskSanju = () => {
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const messagesEndRef = useRef(null);
    const filePickerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initial Load - Check Authentication
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const storedEmail = localStorage.getItem('user_email');
                const storedName = localStorage.getItem('user_name');

                if (token && storedEmail) {
                    setUserEmail(storedEmail);
                    setUserName(storedName || storedEmail.split('@')[0]);
                    setIsAuthenticated(true);
                    loadChatHistory(storedEmail);
                } else {
                    setShowAuthModal(true);
                }
            } catch (e) {
                console.error("Auth check failed", e);
                setShowAuthModal(true);
            }
        };
        checkAuth();
    }, []);

    // Load Chat History from Backend
    const loadChatHistory = async (email) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/user-chats/${email}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChats(data.chats || []);
            }
        } catch (e) {
            console.error("Failed to load chat history", e);
        }
    };

    // Save Chat to Backend
    const saveChatToBackend = async (chatData) => {
        try {
            const res = await fetch('http://127.0.0.1:8000/save-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    email: userEmail,
                    chat_id: chatData.id,
                    title: chatData.title,
                    messages: chatData.messages
                })
            });
            return res.ok;
        } catch (e) {
            console.error("Failed to save chat", e);
            return false;
        }
    };

    // Voice Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            try {
                const SpeechRecognition = window.webkitSpeechRecognition;
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';
                
                recognitionRef.current.onstart = () => setIsListening(true);
                recognitionRef.current.onend = () => setIsListening(false);
                recognitionRef.current.onresult = (e) => {
                    let transcript = '';
                    for (let i = e.resultIndex; i < e.results.length; i++) {
                        transcript += e.results[i][0].transcript;
                        if (e.results[i].isFinal) {
                            setInput(prev => prev + ' ' + transcript);
                        }
                    }
                };
                recognitionRef.current.onerror = (e) => {
                    console.error("Speech error", e.error);
                    setIsListening(false);
                };
            } catch (e) {
                console.error("Speech recognition error", e);
            }
        }
    }, []);

    const toggleVoice = () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    const handleSend = async () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        if (!input.trim() && !attachment || isLoading) return;

        const userMsg = input.trim();
        const newMsg = { role: 'user', content: userMsg, timestamp: new Date().toISOString() };
        const updatedMessages = [...messages, newMsg];

        setMessages(updatedMessages);
        setInput('');
        setAttachment(null);
        setIsLoading(true);

        // Session logic
        let targetId = currentChatId;
        if (!targetId) {
            targetId = Date.now().toString();
            setCurrentChatId(targetId);
            const newChat = { id: targetId, title: userMsg.substring(0, 30) || 'New Conversation', messages: [], created_at: new Date().toISOString() };
            setChats(prev => [newChat, ...prev]);
        }

        const isImage = userMsg.toLowerCase().includes('generate') || userMsg.toLowerCase().includes('image') || userMsg.toLowerCase().includes('draw') || userMsg.toLowerCase().includes('create picture');
        const endpoint = isImage ? 'http://127.0.0.1:8000/generate-image' : 'http://127.0.0.1:8000/ask';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    message: userMsg,
                    system_prompt: `You are AskSanju, a professional, helpful, and intelligent AI assistant. You are designed to assist users with a wide range of tasks including writing, analysis, coding, research, creative work, and problem-solving. You respond in the same language as the user, support multilingual communication, and provide accurate, well-structured responses. User: ${userName} (${userEmail})`,
                    user_email: userEmail
                }),
            });
            const data = await res.json();

            const aiReply = isImage ?
                { role: 'assistant', type: 'image', content: data.image_url, timestamp: new Date().toISOString() } :
                { role: 'assistant', content: data.response || 'I have processed your request. How can I assist you further?', timestamp: new Date().toISOString() };

            const finalMsgs = [...updatedMessages, aiReply];
            setMessages(finalMsgs);

            // Update chat in state
            setChats(prev => prev.map(c => {
                if (c.id === targetId) {
                    return { ...c, messages: finalMsgs };
                }
                return c;
            }));

            // Save to backend
            saveChatToBackend({ id: targetId, title: chats.find(c => c.id === targetId)?.title || 'Conversation', messages: finalMsgs });
        } catch (error) {
            console.error("API error:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Connection error. Please verify your internet connection and try again.', 
                timestamp: new Date().toISOString() 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadChat = (chat) => {
        setCurrentChatId(chat.id);
        setMessages(chat.messages || []);
    };

    const newSession = () => {
        setCurrentChatId(null);
        setMessages([]);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
        setIsAuthenticated(false);
        setShowAuthModal(true);
        setMessages([]);
    };

    const goToLogin = () => {
        window.location.href = '/login';
    };

    const goToDashboard = () => {
        window.location.href = '/dashboard';
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    if (showAuthModal) {
        return (
            <div style={styles.authModalContainer}>
                <div style={styles.authModal}>
                    <div style={styles.authHeader}>
                        <h1 style={styles.authTitle}>AskSanju Professional</h1>
                        <p style={styles.authSubtitle}>Your Intelligent AI Assistant</p>
                    </div>
                    <div style={styles.authContent}>
                        <p style={styles.authDescription}>
                            Welcome to AskSanju - A professional multilingual AI chatbot designed to help you with writing, analysis, coding, research, and more.
                        </p>
                        <div style={styles.authFeatures}>
                            <div style={styles.feature}>
                                <span style={styles.featureIcon}>⚡</span>
                                <span>Professional AI Responses</span>
                            </div>
                            <div style={styles.feature}>
                                <span style={styles.featureIcon}>🌐</span>
                                <span>Multilingual Support</span>
                            </div>
                            <div style={styles.feature}>
                                <span style={styles.featureIcon}>💾</span>
                                <span>Chat History Saved</span>
                            </div>
                            <div style={styles.feature}>
                                <span style={styles.featureIcon}>🎯</span>
                                <span>Personalized Experience</span>
                            </div>
                        </div>
                    </div>
                    <div style={styles.authActions}>
                        <button style={{ ...styles.authBtn, background: '#000', color: '#fff' }} onClick={goToLogin}>
                            Login
                        </button>
                        <button style={{ ...styles.authBtn, background: '#f0f0f0', color: '#000' }} onClick={goToDashboard}>
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <div style={styles.logoBox}>S</div>
                    <span style={styles.logoText}>AskSanju</span>
                </div>
                <button style={styles.newBtn} onClick={newSession}>+ New Conversation</button>
                <div style={styles.sectionTitle}>Your Conversations</div>
                <div style={styles.historyList}>
                    {chats && chats.length > 0 ? (
                        chats.map(chat => (
                            <div key={chat.id}
                                style={{ ...styles.navLink, background: currentChatId === chat.id ? '#e0e0e0' : 'transparent' }}
                                onClick={() => loadChat(chat)}
                                title={chat.title}>
                                💬 {chat.title}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '12px', fontSize: '13px', color: '#999' }}>No conversations yet</div>
                    )}
                </div>
                <div style={styles.sidebarFooter}>
                    <button style={styles.dashboardBtn} onClick={goToDashboard}>📊 Dashboard</button>
                    <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
                </div>
            </aside>

            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <div style={styles.model}>AskSanju Professional AI</div>
                        <div style={styles.modelSub}>Powered by Advanced Intelligence</div>
                    </div>
                    <div style={styles.userArea}>
                        <div style={styles.userInfo}>
                            <div style={styles.userName}>{userName}</div>
                            <div style={styles.userEmail}>{userEmail}</div>
                        </div>
                        <div style={styles.avatar}>{userName[0]?.toUpperCase() || userEmail[0]?.toUpperCase() || '?'}</div>
                    </div>
                </header>

                <div style={styles.scrollArea}>
                    {messages.length === 0 ? (
                        <div style={styles.hero}>
                            <h1 style={styles.heroText}>How can I assist you today?</h1>
                            <p style={styles.heroSubtext}>Ask me anything - I support writing, coding, analysis, research, creative work, and more.</p>
                            <div style={styles.suggestionsGrid}>
                                <div style={styles.suggestion}>📝 Write & Edit</div>
                                <div style={styles.suggestion}>💻 Code & Debug</div>
                                <div style={styles.suggestion}>🔍 Research & Analysis</div>
                                <div style={styles.suggestion}>🎨 Creative Tasks</div>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.msgList}>
                            {messages.map((m, i) => (
                                <div key={i} style={styles.msgWrap}>
                                    <div style={{ ...styles.msgIcon, background: m.role === 'user' ? '#0369a1' : '#1f2937', color: '#fff' }}>
                                        {m.role === 'user' ? 'YOU' : 'ASK'}
                                    </div>
                                    <div style={styles.msgBody}>
                                        <div style={styles.msgHeader}>
                                            <b style={styles.msgRole}>{m.role === 'user' ? 'You' : 'AskSanju'}</b>
                                            {m.timestamp && <span style={styles.timestamp}>{new Date(m.timestamp).toLocaleTimeString()}</span>}
                                        </div>
                                        {m.type === 'image' ? (
                                            <img src={m.content} style={styles.img} alt="Generated by AskSanju" />
                                        ) : (
                                            <div style={styles.msgTxt}>{m.content}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div style={styles.msgWrap}>
                                    <div style={{ ...styles.msgIcon, background: '#1f2937', color: '#fff' }}>ASK</div>
                                    <div style={styles.msgBody}>
                                        <b style={styles.msgRole}>AskSanju</b>
                                        <div style={styles.typing}>⏳ Processing your request...</div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    <div style={styles.inputStack}>
                        <div style={styles.inputBar}>
                            {attachment && (
                                <div style={styles.attachTag}>
                                    📎 {attachment.name}
                                    <span onClick={() => setAttachment(null)} style={{ marginLeft: '8px', cursor: 'pointer' }}>✕</span>
                                </div>
                            )}
                            <textarea
                                style={styles.area}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question here... (Shift+Enter for new line)"
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            />
                            <div style={styles.barFooter}>
                                <div style={styles.tools}>
                                    <span 
                                        onClick={() => filePickerRef.current?.click()} 
                                        style={{ cursor: 'pointer', fontSize: '18px', opacity: 0.6, hover: { opacity: 1 } }}
                                        title="Attach file"
                                    >📎</span>
                                    <input type="file" hidden ref={filePickerRef} onChange={(e) => setAttachment(e.target.files?.[0])} />
                                    <span style={{ fontSize: '18px', opacity: 0.6 }} title="Web search">🔗</span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <span 
                                        onClick={toggleVoice} 
                                        style={{ cursor: 'pointer', color: isListening ? '#ef4444' : '#999', fontSize: '20px', opacity: isListening ? 1 : 0.6 }}
                                        title="Voice input"
                                    >🎤</span>
                                    <button 
                                        style={{ ...styles.send, background: (input.trim() || attachment) ? '#0369a1' : '#d1d5db', cursor: (input.trim() || attachment) ? 'pointer' : 'not-allowed' }} 
                                        onClick={handleSend}
                                        disabled={!input.trim() && !attachment}
                                    >
                                        ↑
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles = {
    // Main container
    container: { display: 'flex', height: '100vh', background: '#fff', color: '#111', fontFamily: 'Inter, system-ui, sans-serif' },
    
    // Sidebar styles
    sidebar: { width: '280px', background: '#f5f5f5', borderRight: '1px solid #e5e5e5', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    logoArea: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' },
    logoBox: { width: '36px', height: '36px', background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' },
    logoText: { fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: '#111' },
    newBtn: { background: '#fff', border: '1.5px solid #d0d0d0', padding: '12px 16px', borderRadius: '10px', fontWeight: '600', marginBottom: '20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' },
    sectionTitle: { fontSize: '12px', fontWeight: '700', color: '#999', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' },
    historyList: { flex: 1, overflowY: 'auto', marginBottom: '16px' },
    navLink: { padding: '10px 12px', borderRadius: '8px', fontSize: '14px', color: '#444', marginBottom: '6px', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'all 0.2s' },
    sidebarFooter: { display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #e0e0e0', paddingTop: '16px', marginTop: 'auto' },
    dashboardBtn: { background: '#fff', border: '1px solid #d0d0d0', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
    logoutBtn: { background: '#f5f5f5', border: '1px solid #d0d0d0', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', color: '#d32f2f' },
    
    // Main content area
    main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#fafafa' },
    header: { height: '70px', borderBottom: '1px solid #e5e5e5', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    model: { fontWeight: '700', color: '#111', fontSize: '16px' },
    modelSub: { fontSize: '12px', color: '#999', marginTop: '2px' },
    userArea: { display: 'flex', alignItems: 'center', gap: '14px' },
    userInfo: { textAlign: 'right' },
    userName: { fontSize: '14px', color: '#111', fontWeight: '600' },
    userEmail: { fontSize: '12px', color: '#999' },
    avatar: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 8px rgba(3, 105, 161, 0.2)' },
    scrollArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    
    // Hero section
    hero: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' },
    heroText: { fontSize: '42px', fontWeight: '800', letterSpacing: '-1px', color: '#111', textAlign: 'center' },
    heroSubtext: { fontSize: '16px', color: '#666', marginTop: '12px', textAlign: 'center', maxWidth: '600px' },
    suggestionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '28px', maxWidth: '400px' },
    suggestion: { background: '#fff', border: '1px solid #e5e5e5', padding: '16px', borderRadius: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    
    // Messages
    msgList: { flex: 1, overflowY: 'auto', padding: '32px 40px', background: '#fafafa' },
    msgWrap: { display: 'flex', gap: '16px', maxWidth: '900px', margin: '0 auto 24px', width: '100%' },
    msgIcon: { width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0, fontSize: '11px' },
    msgBody: { flex: 1 },
    msgHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
    msgRole: { display: 'inline', fontSize: '14px', fontWeight: '700', color: '#111' },
    timestamp: { fontSize: '12px', color: '#999' },
    msgTxt: { fontSize: '15px', lineHeight: '1.6', color: '#222', background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #f0f0f0' },
    typing: { fontSize: '14px', color: '#666', fontStyle: 'italic' },
    img: { maxWidth: '100%', borderRadius: '12px', border: '1px solid #e5e5e5', marginTop: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    
    // Input area
    inputStack: { padding: '32px 40px', width: '100%', maxWidth: '100%', background: '#fafafa' },
    inputBar: { border: '1.5px solid #e5e5e5', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: '#fff', maxWidth: '900px', margin: '0 auto' },
    attachTag: { background: '#0369a1', color: '#fff', fontSize: '12px', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', marginBottom: '8px', fontWeight: '600' },
    area: { border: 'none', outline: 'none', width: '100%', height: '60px', resize: 'none', fontSize: '15px', fontFamily: 'inherit', color: '#111' },
    barFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' },
    tools: { color: '#999', fontSize: '18px', display: 'flex', gap: '16px' },
    send: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', transition: 'all 0.2s' },
    
    // Auth modal
    authModalContainer: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' },
    authModal: { background: '#fff', borderRadius: '16px', padding: '40px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
    authHeader: { textAlign: 'center', marginBottom: '32px' },
    authTitle: { fontSize: '32px', fontWeight: '800', color: '#111', marginBottom: '8px' },
    authSubtitle: { fontSize: '16px', color: '#666' },
    authContent: { marginBottom: '28px' },
    authDescription: { fontSize: '15px', color: '#555', lineHeight: '1.6', marginBottom: '20px' },
    authFeatures: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    feature: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#333', fontWeight: '500' },
    featureIcon: { fontSize: '20px' },
    authActions: { display: 'flex', flexDirection: 'column', gap: '12px' },
    authBtn: { padding: '12px 16px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }
};

export default AskSanju;
