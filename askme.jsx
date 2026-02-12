import React, { useState, useEffect, useRef } from 'react';

const AskSanju = () => {
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isListening, setIsListening] = useState(false);

    const messagesEndRef = useRef(null);
    const filePickerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initial Load
    useEffect(() => {
        try {
            const email = localStorage.getItem('user_email') || 'guest@asksanju.com';
            setUserEmail(email);

            const key = `asksanju_react_history_${email}`;
            const saved = JSON.parse(localStorage.getItem(key) || '[]');
            setChats(Array.isArray(saved) ? saved : []);
        } catch (e) {
            console.error("Failed to load history", e);
            setChats([]);
        }
    }, []);

    // Save History
    useEffect(() => {
        if (userEmail && chats.length > 0) {
            const key = `asksanju_react_history_${userEmail}`;
            localStorage.setItem(key, JSON.stringify(chats));
        }
    }, [chats, userEmail]);

    // Voice Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            try {
                const SpeechRecognition = window.webkitSpeechRecognition;
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.onstart = () => setIsListening(true);
                recognitionRef.current.onend = () => setIsListening(false);
                recognitionRef.current.onresult = (e) => {
                    setInput(prev => prev + ' ' + e.results[0][0].transcript);
                };
            } catch (e) {
                console.error("Speech recognition error", e);
            }
        }
    }, []);

    const toggleVoice = () => {
        if (isListening) recognitionRef.current?.stop();
        else recognitionRef.current?.start();
    };

    const handleSend = async () => {
        if (!input.trim() && !attachment || isLoading) return;

        const userMsg = input.trim();
        const newMsg = { role: 'user', content: userMsg };
        const updatedMessages = [...messages, newMsg];

        setMessages(updatedMessages);
        setInput('');
        setAttachment(null);
        setIsLoading(true);

        // Session logic
        let targetId = currentChatId;
        if (!targetId) {
            targetId = Date.now();
            setCurrentChatId(targetId);
            setChats(prev => [{ id: targetId, title: userMsg.substring(0, 25) || 'New Task', messages: [] }, ...prev]);
        }

        const isImage = userMsg.toLowerCase().includes('generate') || userMsg.toLowerCase().includes('image') || userMsg.toLowerCase().includes('draw');
        const endpoint = isImage ? 'http://127.0.0.1:8000/generate-image' : 'http://127.0.0.1:8000/ask';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    system_prompt: "You are AskSanju, a professional multilingual AI. Reply in the same language as the user."
                }),
            });
            const data = await res.json();

            const aiReply = isImage ?
                { role: 'assistant', type: 'image', content: data.image_url } :
                { role: 'assistant', content: data.response || 'Task completed.' };

            const finalMsgs = [...updatedMessages, aiReply];
            setMessages(finalMsgs);
            setChats(prev => prev.map(c => c.id === targetId ? { ...c, messages: finalMsgs } : c));
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed. Please check server.' }]);
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div style={styles.container}>
            <aside style={styles.sidebar}>
                <div style={styles.logoArea}>
                    <div style={styles.logoBox}>S</div>
                    <span style={styles.logoText}>AskSanju</span>
                </div>
                <button style={styles.newBtn} onClick={newSession}>+ New task</button>
                <div style={styles.sectionTitle}>History</div>
                <div style={styles.historyList}>
                    {chats.map(chat => (
                        <div key={chat.id}
                            style={{ ...styles.navLink, background: currentChatId === chat.id ? '#eee' : 'transparent' }}
                            onClick={() => loadChat(chat)}>
                            💬 {chat.title}
                        </div>
                    ))}
                </div>
            </aside>

            <main style={styles.main}>
                <header style={styles.header}>
                    <div style={styles.model}>AskSanju 2.0 Web</div>
                    <div style={styles.userArea}>
                        <div style={styles.email}>{userEmail}</div>
                        <div style={styles.avatar}>{userEmail[0]?.toUpperCase() || '?'}</div>
                    </div>
                </header>

                <div style={styles.scrollArea}>
                    {messages.length === 0 ? (
                        <div style={styles.hero}>
                            <h1 style={styles.heroText}>How can I help you?</h1>
                            <p style={{ color: '#666', marginTop: '10px' }}>Supported: English, Kannada, Hindi, and more.</p>
                        </div>
                    ) : (
                        <div style={styles.msgList}>
                            {messages.map((m, i) => (
                                <div key={i} style={styles.msgWrap}>
                                    <div style={{ ...styles.msgIcon, background: m.role === 'user' ? '#eee' : '#000', color: m.role === 'user' ? '#000' : '#fff' }}>{m.role === 'user' ? 'U' : 'S'}</div>
                                    <div style={styles.msgBody}>
                                        <b style={styles.msgRole}>{m.role === 'user' ? 'You' : 'AskSanju'}</b>
                                        {m.type === 'image' ? (
                                            <img src={m.content} style={styles.img} alt="AI Gen" />
                                        ) : (
                                            <div style={styles.msgTxt}>{m.content}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div style={styles.msgWrap}>
                                    <div style={{ ...styles.msgIcon, background: '#000', color: '#fff' }}>S</div>
                                    <div style={styles.msgBody}>
                                        <b style={styles.msgRole}>AskSanju</b>
                                        <div style={styles.typing}>Thinking...</div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    <div style={styles.inputStack}>
                        <div style={styles.inputBar}>
                            {attachment && <div style={styles.attachTag}>{attachment.name}</div>}
                            <textarea
                                style={styles.area}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask complex questions in any language..."
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            />
                            <div style={styles.barFooter}>
                                <div style={styles.tools}>
                                    <span onClick={() => filePickerRef.current.click()} style={{ cursor: 'pointer' }}>📎</span>
                                    <input type="file" hidden ref={filePickerRef} onChange={(e) => setAttachment(e.target.files[0])} />
                                    <span>⛓</span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <span onClick={toggleVoice} style={{ cursor: 'pointer', color: isListening ? 'red' : '#999', fontSize: '20px' }}>🎤</span>
                                    <button style={{ ...styles.send, background: (input.trim() || attachment) ? '#000' : '#ccc' }} onClick={handleSend}>↑</button>
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
    container: { display: 'flex', height: '100vh', background: '#fff', color: '#111', fontFamily: 'Inter, system-ui, sans-serif' },
    sidebar: { width: '280px', background: '#f8f8f8', borderRight: '1px solid #eee', padding: '24px', display: 'flex', flexDirection: 'column' },
    logoArea: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' },
    logoBox: { width: '32px', height: '32px', background: '#000', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    logoText: { fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' },
    newBtn: { background: '#fff', border: '1px solid #ddd', padding: '12px', borderRadius: '10px', fontWeight: '600', marginBottom: '24px', textAlign: 'left', cursor: 'pointer' },
    sectionTitle: { fontSize: '11px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' },
    historyList: { flex: 1, overflowY: 'auto' },
    navLink: { padding: '10px', borderRadius: '8px', fontSize: '14px', color: '#444', marginBottom: '4px', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
    header: { height: '64px', borderBottom: '1px solid #eee', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    model: { fontWeight: '700', color: '#111' },
    userArea: { display: 'flex', alignItems: 'center', gap: '12px' },
    email: { fontSize: '13px', color: '#666' },
    avatar: { width: '32px', height: '32px', background: '#0369a1', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    scrollArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    hero: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    heroText: { fontSize: '48px', fontWeight: '800', letterSpacing: '-2px' },
    msgList: { flex: 1, overflowY: 'auto', padding: '40px' },
    msgWrap: { display: 'flex', gap: '24px', maxWidth: '850px', margin: '0 auto 40px', width: '100%' },
    msgIcon: { width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 },
    msgBody: { flex: 1 },
    msgRole: { display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: '700' },
    msgTxt: { fontSize: '16px', lineHeight: '1.7', color: '#222' },
    typing: { fontSize: '14px', color: '#999', fontStyle: 'italic' },
    img: { maxWidth: '100%', borderRadius: '16px', border: '1px solid #eee', marginTop: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    inputStack: { padding: '0 40px 40px', width: '100%', maxWidth: '900px', margin: '0 auto' },
    inputBar: { border: '1.5px solid #eee', borderRadius: '24px', padding: '16px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', background: '#fff' },
    attachTag: { background: '#2563eb', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '12px', display: 'inline-block', marginBottom: '8px' },
    area: { border: 'none', outline: 'none', width: '100%', height: '70px', resize: 'none', fontSize: '16px', fontFamily: 'inherit' },
    barFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f9f9f9', paddingTop: '12px' },
    tools: { color: '#bbb', fontSize: '20px', display: 'flex', gap: '20px' },
    send: { width: '36px', height: '36px', borderRadius: '50%', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }
};

export default AskSanju;
