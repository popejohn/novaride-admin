import React, { useState, useEffect } from 'react';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import DashboardHome from './Components/DashboardHome';
import RideUpdates from './Components/RideUpdates';
import WalletUpdates from './Components/WalletUpdates';
import Installments from './Components/Installments';
import Users from './Components/Users';
import Auth from './Components/Auth';

const API_BASE = 'https://novaride-backend-staging.onrender.com/api/admin';

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingProfile, setLoadingProfile] = useState(!!localStorage.getItem('adminToken'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard state caches
  const [stats, setStats] = useState(null);
  const [rides, setRides] = useState([]);
  const [walletLogs, setWalletLogs] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [riders, setRiders] = useState([]);

  // Auto load profile on boot
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Periodic polling for real-time updates when logged in
  useEffect(() => {
    if (token && admin) {
      fetchAllData();
      
      const interval = setInterval(() => {
        fetchStatsSilently();
      }, 15000); // refresh aggregates every 15s

      return () => clearInterval(interval);
    }
  }, [token, admin]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAdmin(data.admin);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      handleLogout();
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchAllData = () => {
    fetchStats();
    fetchRides();
    fetchWalletLogs();
    fetchInstallments();
    fetchUsers();
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchStatsSilently = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (err) {}
  };

  const fetchRides = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/rides`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRides(data);
    } catch (err) {
      console.error('Error fetching rides:', err);
    }
  };

  const fetchWalletLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/wallet/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setWalletLogs(data);
    } catch (err) {
      console.error('Error fetching wallet logs:', err);
    }
  };

  const fetchInstallments = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/partners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setInstallments(data);
    } catch (err) {
      console.error('Error fetching installments:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [passengersRes, ridersRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/passengers`, { headers }),
        fetch(`${API_BASE}/dashboard/riders`, { headers })
      ]);

      const passengersData = await passengersRes.json();
      const ridersData = await ridersRes.json();

      if (passengersRes.ok) setPassengers(passengersData);
      if (ridersRes.ok) setRiders(ridersData);
    } catch (err) {
      console.error('Error fetching user directories:', err);
    }
  };

  const handleFundWallet = async ({ userIdentifier, amount, description }) => {
    try {
      const response = await fetch(`${API_BASE}/wallet/fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userIdentifier, amount, description })
      });
      const data = await response.json();
      if (response.ok) {
        // Trigger manual local data updates
        fetchWalletLogs();
        fetchStats();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Server connection failed.' };
    }
  };

  const handleAuthSuccess = (newToken, newAdmin) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    setAdmin(newAdmin);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdmin(null);
    setStats(null);
    setRides([]);
    setWalletLogs([]);
    setInstallments([]);
    setPassengers([]);
    setRiders([]);
  };

  if (loadingProfile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#090a0f', color: '#9ca3af' }}>
        <h2>Verifying session. Please wait...</h2>
      </div>
    );
  }

  // Not authenticated
  if (!token || !admin) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div 
          className="sidebar-overlay active" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        admin={admin} 
        handleLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="main-content">
        <Header 
          activeTab={activeTab} 
          admin={admin}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {activeTab === 'dashboard' && <DashboardHome stats={stats} />}
        {activeTab === 'rides' && <RideUpdates rides={rides} onRefresh={fetchRides} />}
        {activeTab === 'wallet' && (
          <WalletUpdates 
            logs={walletLogs} 
            riders={riders}
            onRefresh={fetchWalletLogs} 
            token={token}
          />
        )}
        {activeTab === 'installments' && (
          <Installments 
            installments={installments} 
            onRefresh={fetchInstallments} 
          />
        )}
        {activeTab === 'users' && (
          <Users 
            passengers={passengers} 
            riders={riders} 
            partners={installments} 
            onRefresh={fetchAllData} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
