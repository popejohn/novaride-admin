import React, { useState } from 'react';
import { withdrawRiderWallet } from '../api/adminService';

const WalletUpdates = ({ logs = [], riders = [], onRefresh, token }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Withdrawal Form State
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [selectedRider, setSelectedRider] = useState(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const filteredLogs = logs.filter(log => {
    const userFullName = `${log.user?.firstname} ${log.user?.lastname}`.toLowerCase();
    const email = log.user?.email?.toLowerCase() || '';
    const phone = log.user?.phone || '';
    const desc = log.description?.toLowerCase() || '';
    const ref = log.reference?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();

    return userFullName.includes(query) || email.includes(query) || phone.includes(query) || desc.includes(query) || ref.includes(query);
  });

  const handleOpenModal = () => {
    setSelectedRiderId('');
    setSelectedRider(null);
    setAmount('');
    setAccountNumber('');
    setBankCode('');
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleRiderSelect = (e) => {
    const riderId = e.target.value;
    setSelectedRiderId(riderId);
    
    const rider = riders.find(r => r.riderInfo?._id === riderId);
    setSelectedRider(rider);
    setAmount('');
    setFormError('');
  };

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!selectedRiderId) return setFormError('Please select a rider');
    if (!amount || Number(amount) <= 0) return setFormError('Enter a valid amount greater than 0');
    if (!accountNumber.trim()) return setFormError('Bank account number is required');
    if (!bankCode.trim()) return setFormError('Bank code is required');

    // Validate withdrawal amount against rider's wallet balance
    const riderWallet = selectedRider?.riderInfo?.wallet || 0;
    if (Number(amount) > riderWallet) {
      return setFormError(`Insufficient wallet balance. Available: ₦${riderWallet.toLocaleString()}`);
    }

    setIsSubmitting(true);
    try {
      const result = await withdrawRiderWallet(
        selectedRiderId,
        Number(amount),
        accountNumber.trim(),
        bankCode.trim(),
        token
      );

      setFormSuccess(result.message || 'Withdrawal initiated successfully');
      setTimeout(() => {
        setIsModalOpen(false);
        onRefresh();
      }, 2000);
    } catch (err) {
      setFormError(err.message || 'Failed to process withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--border-radius-md)' }}>
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="card-title-group" style={{ margin: 0 }}>
          <h2>Wallet Balances & Transaction Audit Logs</h2>
          <p>Monitor rider withdrawals and system transaction history.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search transactions..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '220px', marginBottom: 0 }}
          />

          <button onClick={handleOpenModal} className="btn-primary" style={{ width: 'auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Withdraw Rider Wallet
          </button>
        </div>
      </div>

      <div className="table-container">
        {filteredLogs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No transaction logs found.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Transaction Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Audit Reference</th>
                <th>Date / Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const formattedDate = new Date(log.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={log._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600' }}>
                          {log.user?.firstname} {log.user?.lastname}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {log.user?.email || 'No email'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', textTransform: 'capitalize' }}>
                        {log.user?.role || 'user'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${log.type}`}>
                        {log.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: (log.type === 'credit' || log.type === 'funding') ? 'var(--success)' : 'var(--danger)' }}>
                        {(log.type === 'credit' || log.type === 'funding') ? '+' : '-'} ₦{log.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.description}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {log.reference || 'N/A'}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {formattedDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Rider Withdrawal Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Withdraw Rider Wallet to Bank</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSubmitWithdrawal}>
              <div className="form-group">
                <label>Select Rider</label>
                <select
                  className="input-field"
                  value={selectedRiderId}
                  onChange={handleRiderSelect}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">-- Choose a Rider --</option>
                  {riders.map(rider => (
                    <option key={rider.riderInfo?._id} value={rider.riderInfo?._id}>
                      {rider.riderInfo?.firstname} {rider.riderInfo?.lastname} (₦{rider.riderInfo?.wallet?.toLocaleString() || 0})
                    </option>
                  ))}
                </select>
              </div>

              {selectedRider && (
                <div style={{ 
                  padding: '12px', 
                  background: 'rgba(76, 175, 80, 0.1)', 
                  border: '1px solid var(--success)', 
                  borderRadius: '6px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current Wallet Balance</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--success)' }}>
                    ₦{(selectedRider.riderInfo?.wallet || 0).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Withdrawal Amount (₦) *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting || !selectedRider}
                  required
                />
                {selectedRider && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                    Max: ₦{(selectedRider.riderInfo?.wallet || 0).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Bank Account Number *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bank Code *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 044 (Access Bank)"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {formError && <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '15px', fontWeight: '500' }}>⚠️ {formError}</div>}
              {formSuccess && <div style={{ color: 'var(--success)', fontSize: '14px', marginBottom: '15px', fontWeight: '600' }}>✓ {formSuccess}</div>}

              <div className="grid-2" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || !selectedRider}>
                  {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletUpdates;

