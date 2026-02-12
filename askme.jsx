import React, { useState, useEffect, useRef } from 'react';

const AskAI = () => {
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const messagesEndRef = useRef(null);
    const filePickerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Authentication Check
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const email = localStorage.getItem('user_email');

        if (token && email) {
            setUserEmail(email);
            loadSampleChats();
        } else {
            window.location.href = '/login';
        }
    }, []);

    const loadSampleChats = () => {
        const sampleChats = [
            { id: '1', title: 'Python Best Practices', messages: [], created_at: new Date().toISOString() },
            { id: '2', title: 'Database Design Tips', messages: [], created_at: new Date().toISOString() },
            { id: '3', title: 'React Optimization', messages: [], created_at: new Date().toISOString() },
        ];
        setChats(sampleChats);
    };

    // Voice Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setInput(prev => prev + (prev ? ' ' : '') + transcript);
            };
        }
    }, []);

    const toggleVoice = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        const newUserMsg = { role: 'user', content: userMsg, timestamp: new Date().toISOString() };
        const updatedMessages = [...messages, newUserMsg];

        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        // Create new chat if needed
        let targetChatId = currentChatId;
        if (!targetChatId) {
            targetChatId = Date.now().toString();
            setCurrentChatId(targetChatId);
            const newChat = {
                id: targetChatId,
                title: userMsg.substring(0, 50) + (userMsg.length > 50 ? '...' : ''),
                messages: [],
                created_at: new Date().toISOString()
            };
            setChats(prev => [newChat, ...prev]);
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    message: userMsg,
                    system_prompt: `You are AskAI, a professional and highly intelligent AI assistant. Provide expert-level responses with clear structure and actionable insights. Be concise yet comprehensive in your answers.`
                }),
            });

            const data = await response.json();
            const aiResponse = data.response || 'I encountered an issue processing your request. Please try again.';
            
            const newAssistantMsg = {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString()
            };

            const finalMessages = [...updatedMessages, newAssistantMsg];
            setMessages(finalMessages);

            // Update chat with new messages
            setChats(prev => prev.map(chat =>
                chat.id === targetChatId ? { ...chat, messages: finalMessages } : chat
            ));
        } catch (error) {
            console.error('API Error:', error);
            const errorMsg = {
                role: 'assistant',
                content: 'Sorry, I encountered a connection error. Please check your internet and try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadChat = (chat) => {
        setCurrentChatId(chat.id);
        setMessages(chat.messages || []);
    };

    const deleteChat = (chatId) => {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
            setCurrentChatId(null);
            setMessages([]);
        }
        setShowDeleteConfirm(null);
    };

    const startNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email');
        window.location.href = '/login';
    };

    const goToDashboard = () => {
        window.location.href = '/dashboard';
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const userInitial = userEmail ? userEmail[0].toUpperCase() : 'U';

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <aside style={{ ...styles.sidebar, display: sidebarOpen ? 'flex' : 'none' }}>
                <div style={styles.sidebarHeader}>
                    <div style={styles.logo}>
                        <div style={styles.logoIcon}>💡</div>
                        <h1 style={styles.logoText}>AskAI</h1>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        style={styles.closeBtn}
                    >
                        ✕
                    </button>
                </div>

                <button onClick={startNewChat} style={styles.newChatBtn}>
                    + New Chat
                </button>

                <div style={styles.sidebarSection}>
                    <h3 style={styles.sectionTitle}>Chat History</h3>
                    <div style={styles.chatList}>
                        {chats.length > 0 ? (
                            chats.map(chat => (
                                <div
                                    key={chat.id}
                                    style={{
                                        ...styles.chatItem,
                                        background: currentChatId === chat.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                        borderLeft: currentChatId === chat.id ? '3px solid #3b82f6' : 'none'
                                    }}
                                    onClick={() => loadChat(chat)}
                                >
                                    <span style={styles.chatItemText}>{chat.title}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm(chat.id);
                                        }}
                                        style={styles.deleteBtn}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p style={styles.emptyText}>No chats yet</p>
                        )}
                    </div>
                </div>

                {showDeleteConfirm && (
                    <div style={styles.confirmDialog}>
                        <p>Delete this chat?</p>
                        <div style={styles.confirmButtons}>
                            <button 
                                onClick={() => deleteChat(showDeleteConfirm)}
                                style={styles.confirmBtn}
                            >
                                Yes
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(null)}
                                style={styles.cancelBtn}
                            >
                                No
                            </button>
                        </div>
                    </div>
                )}

                <div style={styles.sidebarFooter}>
                    <button onClick={goToDashboard} style={styles.dashboardBtn}>
                        📊 Dashboard
                    </button>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                {/* Header */}
                <header style={styles.header}>
                    <div style={styles.headerLeft}>
                        {!sidebarOpen && (
                            <button 
                                onClick={() => setSidebarOpen(true)}
                                style={styles.menuBtn}
                            >
                                ☰
                            </button>
                        )}
                        <div>
                            <h2 style={styles.headerTitle}>AskAI Assistant</h2>
                            <p style={styles.headerSub}>Professional AI for your queries</p>
                        </div>
                    </div>
                    <div style={styles.userProfile}>
                        <span style={styles.userEmail}>{userEmail}</span>
                        <div style={styles.avatar}>{userInitial}</div>
                    </div>
                </header>

                {/* Chat Area */}
                <div style={styles.chatArea}>
                    {messages.length === 0 ? (
                        <div style={styles.welcomeSection}>
                            <div style={styles.welcomeIcon}>🤖</div>
                            <h1 style={styles.welcomeTitle}>Welcome to AskAI</h1>
                            <p style={styles.welcomeSubtitle}>Your intelligent assistant for every question</p>
                            <div style={styles.suggestionsGrid}>
                                <div style={styles.suggestionCard}>
                                    <span style={styles.suggestionIcon}>💻</span>
                                    <span>Coding Help</span>
                                </div>
                                <div style={styles.suggestionCard}>
                                    <span style={styles.suggestionIcon}>📚</span>
                                    <span>Learning</span>
                                </div>
                                <div style={styles.suggestionCard}>
                                    <span style={styles.suggestionIcon}>✍️</span>
                                    <span>Writing</span>
                                </div>
                                <div style={styles.suggestionCard}>
                                    <span style={styles.suggestionIcon}>🔍</span>
                                    <span>Analysis</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.messagesList}>
                            {messages.map((msg, idx) => (
                                <div key={idx} style={styles.messageWrapper}>
                                    <div style={{
                                        ...styles.messageBubble,
                                        background: msg.role === 'user' ? '#3b82f6' : '#f3f4f6',
                                        color: msg.role === 'user' ? '#fff' : '#1f2937',
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '70%'
                                    }}>
                                        <p style={styles.messageText}>{msg.content}</p>
                                        <span style={styles.messageTime}>
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div style={styles.messageWrapper}>
                                    <div style={styles.typingBubble}>
                                        <span style={styles.typingDot}></span>
                                        <span style={styles.typingDot}></span>
                                        <span style={styles.typingDot}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div style={styles.inputSection}>
                    <div style={styles.inputWrapper}>
                        <textarea
                            style={styles.inputField}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask me anything... (Shift+Enter for new line)"
                            disabled={isLoading}
                        />
                        <div style={styles.inputFooter}>
                            <div style={styles.inputTools}>
                                <button
                                    onClick={() => filePickerRef.current?.click()}
                                    style={styles.toolBtn}
                                    title="Attach file"
                                >
                                    📎
                                </button>
                                <input 
                                    type="file" 
                                    ref={filePickerRef} 
                                    style={{ display: 'none' }}
                                />
                                <button
                                    onClick={toggleVoice}
                                    style={{
                                        ...styles.toolBtn,
                                        color: isListening ? '#ef4444' : '#6b7280'
                                    }}
                                    title="Voice input"
                                >
                                    🎤
                                </button>
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                style={{
                                    ...styles.sendBtn,
                                    background: (input.trim() && !isLoading) ? '#3b82f6' : '#d1d5db',
                                    cursor: (input.trim() && !isLoading) ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {isLoading ? '⏳' : '↑'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        background: '#fafbfc',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    
    // Sidebar
    sidebar: {
        width: '280px',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflowY: 'auto',
    },
    sidebarHeader: {
        padding: '20px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logoIcon: {
        fontSize: '24px',
    },
    logoText: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#111827',
        margin: 0,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#6b7280',
        display: 'none',
    },
    newChatBtn: {
        margin: '16px',
        padding: '12px 16px',
        background: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    sidebarSection: {
        flex: 1,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
    },
    sectionTitle: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#6b7280',
        textTransform: 'uppercase',
        margin: '0 0 12px 0',
        letterSpacing: '0.5px',
    },
    chatList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
        overflowY: 'auto',
    },
    chatItem: {
        padding: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.2s',
    },
    chatItemText: {
        fontSize: '14px',
        color: '#374151',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
    },
    deleteBtn: {
        background: 'none',
        border: 'none',
        color: '#9ca3af',
        cursor: 'pointer',
        fontSize: '14px',
        opacity: 0,
        transition: 'opacity 0.2s',
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: '13px',
        textAlign: 'center',
        padding: '20px 0',
    },
    confirmDialog: {
        padding: '12px',
        background: '#fef2f2',
        border: '1px solid #fee2e2',
        borderRadius: '8px',
        margin: '8px',
    },
    confirmButtons: {
        display: 'flex',
        gap: '8px',
        marginTop: '8px',
    },
    confirmBtn: {
        flex: 1,
        padding: '6px',
        background: '#ef4444',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600',
    },
    cancelBtn: {
        flex: 1,
        padding: '6px',
        background: '#f3f4f6',
        color: '#374151',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600',
    },
    sidebarFooter: {
        padding: '16px',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    dashboardBtn: {
        padding: '10px',
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        transition: 'all 0.2s',
    },
    logoutBtn: {
        padding: '10px',
        background: '#fff',
        border: '1px solid #fed7d7',
        color: '#dc2626',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        transition: 'all 0.2s',
    },
    
    // Main Content
    main: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        height: '72px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    menuBtn: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#6b7280',
    },
    headerTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#111827',
        margin: 0,
    },
    headerSub: {
        fontSize: '12px',
        color: '#9ca3af',
        margin: 0,
    },
    userProfile: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    userEmail: {
        fontSize: '13px',
        color: '#6b7280',
    },
    avatar: {
        width: '40px',
        height: '40px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: '#fff',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '14px',
    },
    
    // Chat Area
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    welcomeSection: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        textAlign: 'center',
    },
    welcomeIcon: {
        fontSize: '64px',
        marginBottom: '20px',
    },
    welcomeTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#111827',
        margin: '0 0 12px 0',
    },
    welcomeSubtitle: {
        fontSize: '16px',
        color: '#6b7280',
        margin: '0 0 40px 0',
    },
    suggestionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        maxWidth: '600px',
    },
    suggestionCard: {
        padding: '16px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    suggestionIcon: {
        fontSize: '24px',
    },
    messagesList: {
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    messageWrapper: {
        display: 'flex',
        justifyContent: 'flex-start',
    },
    messageBubble: {
        padding: '12px 16px',
        borderRadius: '12px',
        wordWrap: 'break-word',
    },
    messageText: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        lineHeight: '1.5',
    },
    messageTime: {
        fontSize: '11px',
        opacity: 0.7,
    },
    typingBubble: {
        display: 'flex',
        gap: '6px',
        padding: '12px 16px',
        background: '#f3f4f6',
        borderRadius: '12px',
        width: 'fit-content',
    },
    typingDot: {
        width: '8px',
        height: '8px',
        background: '#9ca3af',
        borderRadius: '50%',
        animation: 'pulse 1.4s infinite',
    },
    
    // Input Area
    inputSection: {
        padding: '20px 24px',
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
    },
    inputWrapper: {
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
    },
    inputField: {
        width: '100%',
        padding: '14px 16px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'none',
        maxHeight: '120px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    inputFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
    },
    inputTools: {
        display: 'flex',
        gap: '8px',
    },
    toolBtn: {
        background: 'none',
        border: 'none',
        fontSize: '18px',
        cursor: 'pointer',
        color: '#6b7280',
        padding: '4px 8px',
        transition: 'color 0.2s',
    },
    sendBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'background 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
    },
};

export default AskAI;
