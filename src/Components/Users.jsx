import React, { useState } from 'react';

const Users = ({ passengers = [], riders = [], partners = [], onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState('passengers');
  const [searchTerm, setSearchTerm] = useState('');

  const getFilteredList = () => {
    let list = [];
    if (activeSubTab === 'passengers') list = passengers;
    else if (activeSubTab === 'riders') list = riders;
    else if (activeSubTab === 'partners') list = partners;

    return list.filter(item => {
      // Riders lists represent rider mongoose objects containing riderInfo property
      const targetUser = activeSubTab === 'riders' ? item.riderInfo : (activeSubTab === 'partners' ? item.user : item);
      if (!targetUser) return false;

      const userFullName = `${targetUser.firstname} ${targetUser.lastname}`.toLowerCase();
      const email = targetUser.email?.toLowerCase() || '';
      const phone = targetUser.phone || '';
      const query = searchTerm.toLowerCase();

      return userFullName.includes(query) || email.includes(query) || phone.includes(query);
    });
  };

  const filteredList = getFilteredList();

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--border-radius-md)' }}>
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="card-title-group" style={{ margin: 0 }}>
          <h2>Platform User Directory</h2>
          <p>Browse registered passenger accounts, rider validations, and leasing partners.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search users..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '220px', marginBottom: 0 }}
          />

          <button onClick={onRefresh} className="btn-secondary" style={{ width: 'auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <button
          className={`nav-link ${activeSubTab === 'passengers' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('passengers')}
          style={{ background: 'none', border: 'none', borderRadius: '0', padding: '12px 16px', cursor: 'pointer' }}
        >
          Passengers ({passengers.length})
        </button>
        <button
          className={`nav-link ${activeSubTab === 'riders' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('riders')}
          style={{ background: 'none', border: 'none', borderRadius: '0', padding: '12px 16px', cursor: 'pointer' }}
        >
          Riders ({riders.length})
        </button>
        <button
          className={`nav-link ${activeSubTab === 'partners' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('partners')}
          style={{ background: 'none', border: 'none', borderRadius: '0', padding: '12px 16px', cursor: 'pointer' }}
        >
          Partners ({partners.length})
        </button>
      </div>

      <div className="table-container">
        {filteredList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No matching users found in this directory.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              {activeSubTab === 'passengers' && (
                <tr>
                  <th>Passenger Name</th>
                  <th>Contact Email</th>
                  <th>Phone Number</th>
                  <th>Wallet Balance</th>
                  <th>Profile Status</th>
                  <th>Registration Date</th>
                </tr>
              )}
              {activeSubTab === 'riders' && (
                <tr>
                  <th>Rider Name</th>
                  <th>Vehicle Details</th>
                  <th>Driver License</th>
                  <th>Availability</th>
                  <th>Verification</th>
                  <th>Wallet Balance</th>
                </tr>
              )}
              {activeSubTab === 'partners' && (
                <tr>
                  <th>Partner Name</th>
                  <th>Phone Number</th>
                  <th>Leased Vehicle</th>
                  <th>Repayment Status</th>
                  <th>Wallet Balance</th>
                  <th>Plan Details</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredList.map((item) => {
                if (activeSubTab === 'passengers') {
                  const regDate = new Date(item.createdAt).toLocaleDateString();
                  return (
                    <tr key={item._id}>
                      <td style={{ fontWeight: '600' }}>{item.firstname} {item.lastname}</td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td style={{ fontWeight: '700', color: 'white' }}>₦{item.wallet?.toLocaleString() || 0}</td>
                      <td>
                        <span className={`badge ${item.profileCompleted ? 'status-completed' : 'status-pending'}`}>
                          {item.profileCompleted ? 'complete' : 'incomplete'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{regDate}</td>
                    </tr>
                  );
                }

                if (activeSubTab === 'riders') {
                  const userInfo = item.riderInfo || {};
                  return (
                    <tr key={item._id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{userInfo.firstname} {userInfo.lastname}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{userInfo.email}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>🚗 {item.vehicleType}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Plate: {item.plateNumber}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{item.driverLicenseNumber}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Exp: {new Date(item.driverLicenseExpiry).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${item.isAvailable ? 'status-completed' : 'status-failed'}`}>
                          {item.isAvailable ? 'available' : 'busy'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${item.isVerified ? 'status-completed' : 'status-failed'}`}>
                          {item.isVerified ? 'verified' : 'unverified'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700', color: 'white' }}>₦{userInfo.wallet?.toLocaleString() || 0}</td>
                    </tr>
                  );
                }

                if (activeSubTab === 'partners') {
                  const userInfo = item.user || {};
                  return (
                    <tr key={item._id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{userInfo.firstname} {userInfo.lastname}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{userInfo.email}</span>
                        </div>
                      </td>
                      <td>{userInfo.phone}</td>
                      <td>🚘 {item.vehicleName}</td>
                      <td>
                        <span className={`badge status-${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700', color: 'white' }}>₦{userInfo.wallet?.toLocaleString() || 0}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{item.installmentPlan}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Total: ₦{item.totalAmount?.toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return null;
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;
