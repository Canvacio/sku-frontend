'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

const SAMPLE_HISTORY = {
  TODAY: [
    { id: 1, icon: '☕', title: 'Stock Check', preview: 'Checked current inventory levels and USD rate…', time: '10:45 AM', tags: ['#STOCK', 'INVENTORY'] },
    { id: 2, icon: '📦', title: 'Order Placement', preview: 'Placed order for 50kg Arabica Green Beans…', time: '08:12 AM', tags: ['#BUY', 'PENDING'] },
  ],
  YESTERDAY: [
    { id: 3, icon: '🔄', title: 'Inventory Update', preview: 'Updated Robusta stock +30kg via #update command…', time: 'Yesterday, 4:20 PM', tags: ['#UPDATE', 'ROBUSTA'] },
  ],
  'LAST WEEK': [
    { id: 4, icon: '✅', title: 'Order Confirmed', preview: 'Confirmed invoice INV-1718293847 as paid…', time: 'Oct 12', tags: ['#CONFIRM'] },
    { id: 5, icon: '💱', title: 'USD Rate Update', preview: 'Set USD rate to 16,500 IDR…', time: 'Oct 10', tags: ['#SETUSDRATE', 'ADMIN'] },
  ],
};

export default function ChatHistoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [email, setEmail] = useState(() =>
  typeof window !== 'undefined' ? localStorage.getItem('email') : null
);
const [role, setRole] = useState(() =>
  typeof window !== 'undefined' ? localStorage.getItem('role') : null
);
const [token, setToken] = useState(() =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null
);

  function handleLogout() {
    localStorage.clear();
    router.push('/login');
  }

  const displayName = email
    ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Cofi Enthusiast';
  const displayRole = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : 'Guest account';

  const filtered = Object.entries(SAMPLE_HISTORY).reduce((acc, [group, items]) => {
    const f = items.filter(item =>
      !search || item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.preview.toLowerCase().includes(search.toLowerCase())
    );
    if (f.length) acc[group] = f;
    return acc;
  }, {});

  return (
    <>
      <style>{`
        .history-root { display: flex; height: 100vh; overflow: hidden; background: var(--cream); }
        .sidebar { width: var(--sidebar-width); flex-shrink: 0; background: var(--cream); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 20px 16px; transition: transform 0.25s ease; z-index: 50; }
        @media (max-width: 767px) {
          .sidebar { position: fixed; top: 0; left: 0; bottom: 0; transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(44,24,16,0.15); }
        }
        .sidebar-logo { display: flex; align-items: center; gap: 10px; font-size: 1.05rem; font-weight: 700; color: var(--brown-900); padding: 8px 4px 16px; }
        .sidebar-user { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 12px; background: var(--peach); border: 1px solid var(--border); margin-bottom: 8px; }
        .sidebar-user-name { font-size: 0.875rem; font-weight: 600; color: var(--brown-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sidebar-user-role { font-size: 0.75rem; color: var(--text-muted); margin-top: 1px; }
        .sidebar-btn { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 10px; border: none; background: transparent; cursor: pointer; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); width: 100%; text-align: left; transition: background 0.12s; text-decoration: none; }
        .sidebar-btn:hover { background: var(--cream-dark); color: var(--brown-900); }
        .sidebar-btn.active { background: var(--peach-tag); color: var(--brown-800); font-weight: 600; }
        .sidebar-spacer { flex: 1; }
        .sidebar-divider { height: 1px; background: var(--border); margin: 8px 0; }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(44,24,16,0.3); z-index: 40; }
        @media (max-width: 767px) { .sidebar-overlay.show { display: block; } }
        .history-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow-y: auto; }
        .history-topbar { display: none; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border); background: var(--cream); position: sticky; top: 0; z-index: 10; }
        @media (max-width: 767px) { .history-topbar { display: flex; } }
        .topbar-menu { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px; display: flex; }
        .topbar-logo { font-size: 1rem; font-weight: 700; color: var(--brown-900); flex: 1; }
        .mobile-tabs { display: none; border-bottom: 1px solid var(--border); background: var(--cream); }
        @media (max-width: 767px) { .mobile-tabs { display: flex; } }
        .mobile-tab { flex: 1; padding: 12px; text-align: center; font-size: 0.85rem; font-weight: 500; color: var(--text-muted); border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; }
        .mobile-tab.active { color: var(--brown-800); border-bottom-color: var(--brown-800); font-weight: 600; }
        .history-content { padding: 40px 48px; max-width: 900px; }
        @media (max-width: 767px) { .history-content { padding: 24px 16px; } }
        .history-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
        .history-title { font-size: 2rem; font-weight: 700; color: var(--brown-900); font-family: Georgia, 'Times New Roman', serif; margin-bottom: 6px; }
        .history-subtitle { font-size: 0.875rem; color: var(--text-muted); }
        .search-wrap { position: relative; flex-shrink: 0; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .search-input { padding: 10px 16px 10px 40px; border: 1.5px solid var(--border); border-radius: 10px; background: #fff; font-size: 0.875rem; color: var(--text-primary); outline: none; width: 220px; transition: border-color 0.15s; }
        .search-input:focus { border-color: var(--brown-500); }
        .search-input::placeholder { color: var(--text-muted); }
        .history-group-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 12px; margin-top: 32px; }
        .history-cards-grid { display: grid; gap: 12px; }
        .history-cards-grid.two-col { grid-template-columns: 1fr 1fr; }
        @media (max-width: 600px) { .history-cards-grid.two-col { grid-template-columns: 1fr; } }
        .history-card { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; background: #fff; border: 1px solid var(--border); border-radius: 14px; cursor: pointer; transition: border-color 0.12s, box-shadow 0.12s; text-decoration: none; }
        .history-card:hover { border-color: var(--brown-300); box-shadow: 0 2px 12px rgba(44,24,16,0.08); }
        .history-card-icon { width: 42px; height: 42px; border-radius: 10px; background: var(--peach); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .history-card-body { flex: 1; min-width: 0; }
        .history-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; gap: 8px; }
        .history-card-title { font-size: 0.9rem; font-weight: 600; color: var(--brown-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .history-card-time { font-size: 0.75rem; color: var(--text-muted); flex-shrink: 0; }
        .history-card-preview { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .history-tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .history-tag { padding: 2px 8px; border-radius: 20px; background: var(--peach-tag); border: 1px solid var(--peach-tag-border); font-size: 0.68rem; font-weight: 600; color: var(--brown-700); font-family: 'Courier New', monospace; }
        .empty-state { padding: 64px 24px; text-align: center; color: var(--text-muted); }
        .empty-state p { margin-top: 8px; font-size: 0.875rem; }
      `}</style>

      <div className="history-root">
        <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">☕ Cofibean AI</div>
          <div className="sidebar-user">
            <Avatar email={email} role={role} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">{displayRole}</div>
            </div>
          </div>
          <Link href="/chat" className="sidebar-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            New chat
          </Link>
          <button className="sidebar-btn active">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Chat History
          </button>
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
        </aside>

        <main className="history-main">
          <div className="history-topbar">
            <button className="topbar-menu" onClick={() => setSidebarOpen(true)}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span className="topbar-logo">☕ Cofibean AI</span>
          </div>
          <div className="mobile-tabs">
            <button className="mobile-tab active">All Chats</button>
            <button className="mobile-tab">Favorites</button>
            <button className="mobile-tab">Archived</button>
          </div>
          <div className="history-content">
            <div className="history-header">
              <div>
                <h1 className="history-title">Chat History</h1>
                <p className="history-subtitle">Revisit your past commands and conversations.</p>
              </div>
              <div className="search-wrap">
                <span className="search-icon">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input className="search-input" placeholder="Search past conversations..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            {Object.keys(filtered).length === 0 ? (
              <div className="empty-state"><div style={{ fontSize: '2rem' }}>🔍</div><p>No conversations found.</p></div>
            ) : (
              Object.entries(filtered).map(([group, items]) => (
                <div key={group}>
                  <div className="history-group-label">{group}</div>
                  <div className={`history-cards-grid ${group === 'LAST WEEK' && items.length > 1 ? 'two-col' : ''}`}>
                    {items.map(item => (
                      <Link href="/chat" key={item.id} className="history-card">
                        <div className="history-card-icon">{item.icon}</div>
                        <div className="history-card-body">
                          <div className="history-card-top">
                            <span className="history-card-title">{item.title}</span>
                            <span className="history-card-time">{item.time}</span>
                          </div>
                          <p className="history-card-preview">{item.preview}</p>
                          <div className="history-tags">
                            {item.tags.map(tag => <span key={tag} className="history-tag">{tag}</span>)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}