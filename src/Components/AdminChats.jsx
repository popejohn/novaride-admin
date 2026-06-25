import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const AdminChats = ({ token, admin }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all'); // all, open, active
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const getApiBase = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
    }
    return 'https://novaride-backend-staging.onrender.com/api';
  };

  const API_BASE = getApiBase();

  const getSocketUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      return envUrl.replace(/\/api$/, '');
    }
    return 'https://novaride-backend-staging.onrender.com';
  };

  const socketUrl = getSocketUrl();

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  // Fetch support chats on mount and when filter changes
  const fetchChats = async () => {
    try {
      setLoading(true);
      const url = filter === 'all'
        ? `${API_BASE}/support/admin/chats`
        : `${API_BASE}/support/admin/chats?status=${filter}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error('Error fetching support chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [filter]);

  // General socket connection to monitor list updates and join active chat room
  useEffect(() => {
    const socket = io(socketUrl, {
      auth: { token },
      reconnection: true
    });

    socket.on('connect', () => {
      console.log('[Socket] Admin connected for support monitoring');
    });

    socket.on('supportChatsUpdated', () => {
      fetchChats();
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync active chat messages and socket subscription when activeChat changes
  useEffect(() => {
    if (!activeChat || !socketRef.current) return;

    // Join room for this chat session
    socketRef.current.emit('joinSupportChat', activeChat._id);

    // Register active-chat-specific socket listeners
    const handleNewMessage = (message) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    const handleClaimed = (data) => {
      setActiveChat((prev) => {
        if (!prev || prev._id !== activeChat._id) return prev;
        return {
          ...prev,
          adminId: data.adminId,
          adminName: data.adminName,
          status: 'active'
        };
      });
      fetchChats();
    };

    const handleClosed = () => {
      setActiveChat((prev) => {
        if (!prev || prev._id !== activeChat._id) return prev;
        return {
          ...prev,
          status: 'closed'
        };
      });
      fetchChats();
    };

    socketRef.current.on('supportMessage', handleNewMessage);
    socketRef.current.on('chatClaimed', handleClaimed);
    socketRef.current.on('chatClosed', handleClosed);

    return () => {
      socketRef.current.off('supportMessage', handleNewMessage);
      socketRef.current.off('chatClaimed', handleClaimed);
      socketRef.current.off('chatClosed', handleClosed);
    };
  }, [activeChat]);

  const selectChat = (chat) => {
    setActiveChat(chat);
    setMessages(chat.messages || []);
    setErrorMessage('');
  };

  const claimChat = async (chatId) => {
    try {
      setErrorMessage('');
      const res = await fetch(`${API_BASE}/support/admin/claim/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActiveChat(data.chat);
        fetchChats();
      } else {
        setErrorMessage(data.message || 'Failed to claim chat session');
      }
    } catch (err) {
      console.error('Error claiming chat:', err);
      setErrorMessage('Server connection error. Failed to claim chat.');
    }
  };

  const closeChat = async (chatId) => {
    try {
      const res = await fetch(`${API_BASE}/support/admin/close/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActiveChat((prev) => prev ? { ...prev, status: 'closed' } : null);
        fetchChats();
      } else {
        setErrorMessage(data.message || 'Failed to close chat session');
      }
    } catch (err) {
      console.error('Error closing chat:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      const res = await fetch(`${API_BASE}/support/admin/message/${activeChat._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: messageText })
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending support message:', err);
    }
  };

  // Search filter
  const filteredChats = chats.filter(chat => {
    const userName = chat.userName.toLowerCase();
    const userPhone = chat.userPhone;
    const query = searchQuery.toLowerCase();
    return userName.includes(query) || userPhone.includes(query);
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: 'calc(100vh - 120px)', marginTop: '8px' }}>
      {/* Left Pane - Chats list */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>Support Inbox</h2>
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', fontSize: '13px', marginBottom: '12px' }}
          />

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px' }}>
            {['all', 'open', 'active'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: filter === t ? 'var(--primary)' : 'transparent',
                  color: filter === t ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Chats list items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          {loading && chats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading inbox...</div>
          ) : filteredChats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>No support chats.</div>
          ) : (
            filteredChats.map(chat => {
              const isActive = activeChat && activeChat._id === chat._id;
              const isClaimedByMe = chat.adminId && chat.adminId.toString() === admin.id;
              const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;

              return (
                <div
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.02)',
                    border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s hover'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'white' }}>{chat.userName}</span>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: chat.status === 'open' ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)',
                      color: chat.status === 'open' ? 'var(--primary)' : 'var(--blue)'
                    }}>
                      {chat.status === 'open' ? 'Open' : isClaimedByMe ? 'Claimed By Me' : 'Assigned'}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    📞 {chat.userPhone}
                  </div>

                  {lastMessage ? (
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      <span style={{ fontWeight: '600' }}>{lastMessage.senderModel === 'User' ? 'User: ' : 'Admin: '}</span>
                      {lastMessage.text}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', italic: 'true' }}>No messages yet.</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane - Chat Dialog */}
      <div className="glass-panel" style={{ padding: '0px', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {!activeChat ? (
          /* Select Placeholder */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', padding: '24px' }}>
            <span style={{ fontSize: '48px', marginBottom: '16px' }}>💬</span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>No Chat Session Selected</h3>
            <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '360px', lineHeight: 'relaxed' }}>
              Select an incoming support request from the inbox sidebar to start chatting, review complaints, or claim sessions.
            </p>
          </div>
        ) : (
          /* Active Chat Window */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>{activeChat.userName}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Phone: {activeChat.userPhone} | Session ID: {activeChat._id}
                </p>
              </div>

              {/* Action buttons based on lock/status */}
              <div>
                {activeChat.status === 'closed' ? (
                  <span className="badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>RESOLVED / CLOSED</span>
                ) : !activeChat.adminId ? (
                  <button
                    onClick={() => claimChat(activeChat._id)}
                    className="btn-primary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: '12px', fontWeight: '700' }}
                  >
                    Claim & Respond
                  </button>
                ) : activeChat.adminId.toString() === admin.id ? (
                  <button
                    onClick={() => closeChat(activeChat._id)}
                    className="btn-secondary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: '12px', fontWeight: '700', borderColor: 'var(--warning)', color: 'var(--warning)' }}
                  >
                    Mark Resolved & Close
                  </button>
                ) : (
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                    Locked by Admin {activeChat.adminName}
                  </span>
                )}
              </div>
            </div>

            {/* Error notifications */}
            {errorMessage && (
              <div style={{ padding: '12px 24px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '12px', fontWeight: '600' }}>
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Messages box */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No messages exchanged in this session yet.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderModel === 'Admin' && msg.senderId === admin.id;
                  const isUser = msg.senderModel === 'User';

                  return (
                    <div
                      key={msg._id || index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        width: '100%'
                      }}
                    >
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase', tracking: '0.05em' }}>
                        {isMe ? 'You' : isUser ? 'User' : msg.senderName}
                      </span>
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          borderTopRightRadius: isMe ? '0px' : '16px',
                          borderTopLeftRadius: !isMe ? '0px' : '16px',
                          background: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                          border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)',
                          color: isMe ? 'white' : 'var(--text-secondary)',
                          fontSize: '13px',
                          lineHeight: 'relaxed'
                        }}
                      >
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            {activeChat.status !== 'closed' && (
              <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {activeChat.adminId && activeChat.adminId.toString() === admin.id ? (
                  /* Form input if claimed */
                  <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Type a response to the user..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="input-field"
                      style={{ flexGrow: 1, marginBottom: 0, padding: '12px 16px', fontSize: '13px' }}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="btn-primary"
                      style={{ width: 'auto', padding: '12px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      Send
                    </button>
                  </form>
                ) : (
                  /* Blocked info if unclaimed or claimed by another */
                  <div style={{ padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {!activeChat.adminId
                      ? '👉 You must claim this chat session before you can send responses.'
                      : `🔒 This session is being handled by Admin ${activeChat.adminName}. Only the assigned administrator can reply.`}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChats;
