import React from 'react';
import novaLogo from '../assets/nova.png';

const Sidebar = ({ activeTab, setActiveTab, admin, handleLogout, isOpen, onClose }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
    },
    {
      id: 'rides',
      label: 'Rides List',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v9c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      ),
    },
    {
      id: 'wallet',
      label: 'Wallet Audits',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: 'installments',
      label: 'Installments',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="16" y1="2" x2="16" y2="4" />
          <line x1="8" y1="2" x2="8" y2="4" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'User Directory',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    onClose?.();
  };

  return (
    <div className={`sidebar glass-panel ${isOpen ? 'active' : ''}`}>
      <div className="logo-section">
        <img className="logo-icon-img" src={novaLogo} alt="Nova Crest" />
        <span className="logo-text">Nova Crest</span>
      </div>

      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '15px',
          }}
        >
          <div className="avatar">
            {admin?.firstname?.[0]}
            {admin?.lastname?.[0]}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {admin?.firstname} {admin?.lastname}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {admin?.role}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{
            padding: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
