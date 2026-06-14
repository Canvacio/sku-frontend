'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = 'https://sku-backend-production.up.railway.app';

function Avatar({ email, role, size = 36 }) {
  const initials = email ? email[0].toUpperCase() : 'G';
  const bg = role === 'admin' ? '#3B1F0F' : role === 'agent' ? '#5C3317' : '#8B5E3C';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0
    }}>
      {initials}
    </div>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
}

export default function ChatPage() {
  const router = useRouter();

  const [token, setToken] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );
  const [role, setRole] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('role') : null
  );
  const [email, setEmail] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('email') : null
  );

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your Cofibean AI assistant. Ask me about inventory with #stock, place an order with #buy, or just ask anything about coffee.',
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: text, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const history = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: text, history }),
    });

      const data = await res.json();
      const reply = data.reply || data.error || 'No response';

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: reply,
        time: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Connection error. Please try again.',
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleLogout() {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setEmail(null);
    router.push('/login');
  }

  function handleNewChat() {
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: 'New conversation started. How can I help you today?',
      time: new Date(),
    }]);
  }

  const quickCommands = role === 'admin'
  ? ['#stock', '#buy', '#update', '#confirm', '#pending', '#setusdrate']
  : role === 'agent'
  ? ['#stock', '#buy', '#update', '#pending', '#confirm']
  : ['#stock', '#buy'];
  
  const displayName = email
    ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Cofi Enthusiast';

  const displayRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : 'Guest account';

  return (
    <>
      <style>{`
        .chat-root {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--cream);
        }

        /* ── Sidebar ── */
        .sidebar {
          width: var(--sidebar-width);
          flex-shrink: 0;
          background: var(--cream);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 20px 16px;
          gap: 4px;
          transition: transform 0.25s ease;
          z-index: 50;
        }
        @media (max-width: 767px) {
          .sidebar { position: fixed; top: 0; left: 0; bottom: 0; transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(44,24,16,0.15); }
        }
        .sidebar-logo { display: flex; align-items: center; gap: 10px; font-size: 1.05rem; font-weight: 700; color: var(--brown-900); padding: 8px 4px 16px; }
        .sidebar-user { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 12px; background: var(--peach); border: 1px solid var(--border); margin-bottom: 8px; }
        .sidebar-user-info { flex: 1; min-width: 0; }
        .sidebar-user-name { font-size: 0.875rem; font-weight: 600; color: var(--brown-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-user-role { font-size: 0.75rem; color: var(--text-muted); margin-top: 1px; }
        .sidebar-btn { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 10px; border: none; background: transparent; cursor: pointer; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); width: 100%; text-align: left; transition: background 0.12s; text-decoration: none; }
        .sidebar-btn:hover { background: var(--cream-dark); color: var(--brown-900); }
        .sidebar-btn.active { background: var(--peach-tag); color: var(--brown-800); font-weight: 600; }
        .sidebar-spacer { flex: 1; }
        .sidebar-divider { height: 1px; background: var(--border); margin: 8px 0; }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(44,24,16,0.3); z-index: 40; }
        @media (max-width: 767px) { .sidebar-overlay.show { display: block; } }

        /* ── Main ── */
        .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--cream); overflow: hidden; }
        .chat-topbar { display: none; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border); background: var(--cream); flex-shrink: 0; }
        @media (max-width: 767px) { .chat-topbar { display: flex; } }
        .topbar-menu { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px; display: flex; }
        .topbar-logo { font-size: 1rem; font-weight: 700; color: var(--brown-900); flex: 1; }
        .topbar-icons { display: flex; align-items: center; gap: 12px; }
        .topbar-icon-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px; display: flex; }

        /* ── Messages ── */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-height: 0;
        }
        @media (max-width: 767px) { .chat-messages { padding: 20px 16px; gap: 20px; } }

        .msg-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          width: 100%;
        }
        .msg-row.user {
          flex-direction: row-reverse;
        }

        .msg-content-wrap {
          max-width: 68%;
          display: flex;
          flex-direction: column;
        }
        .msg-row.user .msg-content-wrap {
          align-items: flex-end;
        }
        .msg-row.assistant .msg-content-wrap {
          align-items: flex-start;
        }
        @media (max-width: 767px) { .msg-content-wrap { max-width: 82%; } }

        .msg-bubble {
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 0.9rem;
          line-height: 1.65;
          word-break: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
        }
        .msg-bubble.assistant {
          background: #fff;
          border: 1px solid var(--border);
          border-top-left-radius: 4px;
          color: var(--text-primary);
        }
        .msg-bubble.user {
          background: var(--brown-800);
          color: #fff;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 14px;
        }

        .msg-time { font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; }
        .msg-row.user .msg-time { text-align: right; }
        .msg-row.assistant .msg-time { text-align: left; }

        .msg-date-label { text-align: center; font-size: 0.75rem; color: var(--text-muted); font-weight: 500; letter-spacing: 0.04em; }

        /* ── Typing ── */
        .typing-indicator { display: flex; align-items: center; gap: 10px; }
        .typing-dots { background: #fff; border: 1px solid var(--border); border-radius: 16px; border-top-left-radius: 4px; padding: 14px 18px; display: flex; gap: 5px; align-items: center; }
        .typing-dots span { width: 7px; height: 7px; border-radius: 50%; background: var(--brown-300); animation: bounce 1.2s infinite; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

        /* ── Input ── */
        .chat-input-area { border-top: 1px solid var(--border); padding: 16px 24px 20px; background: var(--cream); flex-shrink: 0; }
        @media (max-width: 767px) { .chat-input-area { padding: 12px 16px 16px; } }
        .quick-commands { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .quick-cmd { padding: 5px 12px; border-radius: 20px; border: 1.5px solid var(--peach-tag-border); background: var(--peach-tag); color: var(--brown-700); font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: background 0.12s; font-family: 'Courier New', monospace; }
        .quick-cmd:hover { background: var(--brown-100); }
        .input-row { display: flex; align-items: flex-end; gap: 10px; background: #fff; border: 1.5px solid var(--border); border-radius: 14px; padding: 8px 8px 8px 16px; transition: border-color 0.15s; }
        .input-row:focus-within { border-color: var(--brown-500); }
        .input-attach { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 6px; display: flex; align-items: center; flex-shrink: 0; }
        .chat-textarea { flex: 1; border: none; outline: none; background: transparent; font-size: 0.9rem; color: var(--text-primary); resize: none; max-height: 120px; min-height: 24px; line-height: 1.5; padding: 6px 0; font-family: inherit; }
        .chat-textarea::placeholder { color: var(--text-muted); }
        .input-send { width: 36px; height: 36px; border-radius: 10px; border: none; background: var(--brown-800); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.12s, opacity 0.12s; }
        .input-send:hover:not(:disabled) { background: var(--brown-900); }
        .input-send:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="chat-root">
        <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <Link href="/chat" className="sidebar-logo" style={{ textDecoration: 'none' }}><span>☕</span><span>Cofibean AI</span></Link>
          <div className="sidebar-user">
            <Avatar email={email} role={role} size={36} />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">{displayRole}</div>
            </div>
          </div>
          {/*<button className="sidebar-btn active" onClick={() => { handleNewChat(); setSidebarOpen(false); }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            New chat
          </button>
          <Link href="/chat/history" className="sidebar-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Chat History
          </Link>*/}
          <div className="sidebar-spacer" />
          <div className="sidebar-divider" />
          <Link href="#" className="sidebar-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
            Settings
          </Link>
          <Link href="#" className="sidebar-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Support
          </Link>
          {token && (
            <button className="sidebar-btn" onClick={handleLogout} style={{ color: '#991b1b' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          )}
          {!token && (
            <Link href="/login" className="sidebar-btn" style={{ color: 'var(--brown-800)', fontWeight: 600 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign in
            </Link>
          )}
        </aside>

        <main className="chat-main">
          <div className="chat-topbar">
            <button className="topbar-menu" onClick={() => setSidebarOpen(true)}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span className="topbar-logo">☕ Cofibean AI</span>
            <div className="topbar-icons">
              <button className="topbar-icon-btn">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </button>
            </div>
          </div>

          <div className="chat-messages">
            <div className="msg-date-label">Today, {formatTime(new Date())}</div>

            {messages.map(msg => (
              <div key={msg.id} className={`msg-row ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brown-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>☕</div>
                )}
                <div className="msg-content-wrap">
                  <div className={`msg-bubble ${msg.role}`}>{msg.content}</div>
                  <div className="msg-time">{formatTime(msg.time)}</div>
                </div>
                {msg.role === 'user' && <Avatar email={email} role={role} size={32} />}
              </div>
            ))}

            {loading && (
              <div className="typing-indicator">
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brown-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>☕</div>
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            <div className="quick-commands">
              {quickCommands.map(cmd => (
              <button key={cmd} className="quick-cmd" onClick={() => {
                const templates = {
                  '#stock': '#stock ',
                  '#buy': '#buy name: , email: , phone: , item: , amount: kg, address: ',
                  '#update': '#update ',
                  '#confirm': '#confirm INV-',
                  '#pending': '#pending',
                  '#setusdrate': '#setusdrate ',
                };
                setInput(templates[cmd] || cmd + ' ');
                inputRef.current?.focus();
              }}>{cmd}</button>
            ))}
            </div>
            <div className="input-row">
              <button className="input-attach">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <textarea
                ref={inputRef}
                className="chat-textarea"
                placeholder="Ask about beans, roasts, or type a command…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button className="input-send" onClick={sendMessage} disabled={!input.trim() || loading}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}