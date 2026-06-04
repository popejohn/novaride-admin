import React, { useState } from 'react';
import novaLogo from '../assets/nova.png';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Input fields
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');

  // Request statuses
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password || (!isLogin && (!firstname || !lastname))) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/admin/auth/login' : '/api/admin/auth/signup';
    const payload = isLogin 
      ? { email, password } 
      : { firstname, lastname, email, password, role };

    try {
      const response = await fetch(`https://novaride-backend-staging.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(isLogin ? 'Login successful!' : 'Account registered successfully!');
        
        // Wait 1.5s then pass the token and profile up
        setTimeout(() => {
          onAuthSuccess(data.token, data.admin);
        }, 1200);
      } else {
        setErrorMsg(data.message || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Auth Request Failure:', err);
      setErrorMsg('Failed to connect to the Admin server. Ensure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            className="logo-icon-img"
            src={novaLogo}
            alt="Nova Crest"

            style={{ margin: '0 auto 12px', width: 48, height: 48, objectFit: 'contain' }}
          />
          <h2 className="auth-title">Nova Crest Admin</h2>

          <p className="auth-subtitle">
            {isLogin ? 'Sign in to access your administrative dashboard.' : 'Register a new administrator credential.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="grid-2">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. John"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Doe"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="e.g. admin@novacrest.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Administrative Role</label>
              <select
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                style={{ background: 'var(--bg-dark)' }}
              >
                <option value="admin">Standard Admin</option>
                <option value="superadmin">Super Administrator</option>
                <option value="support">Customer Support Lead</option>
              </select>
            </div>
          )}

          {errorMsg && <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '15px', fontWeight: '500', textAlign: 'center' }}>⚠️ {errorMsg}</div>}
          {successMsg && <div style={{ color: 'var(--success)', fontSize: '14px', marginBottom: '15px', fontWeight: '600', textAlign: 'center' }}>✓ {successMsg}</div>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Account')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Need a new admin account? " : "Already have an account? "}
          </span>
          <button
            onClick={handleToggleMode}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
            disabled={loading}
          >
            {isLogin ? 'Create Admin Account' : 'Sign In instead'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
