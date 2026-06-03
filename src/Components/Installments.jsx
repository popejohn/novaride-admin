import React, { useState } from 'react';

const Installments = ({ installments = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInstallments = installments.filter(item => {
    const userFullName = `${item.user?.firstname} ${item.user?.lastname}`.toLowerCase();
    const email = item.user?.email?.toLowerCase() || '';
    const vehicle = item.vehicleName?.toLowerCase() || '';
    const plate = item.vehiclePlate?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();

    return userFullName.includes(query) || email.includes(query) || vehicle.includes(query) || plate.includes(query);
  });

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--border-radius-md)' }}>
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="card-title-group" style={{ margin: 0 }}>
          <h2>Partner Installment Payment Tracker</h2>
          <p>Monitor vehicle details, paid sums, lease plan progress, and default statuses for leasing partners.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search lease agreements..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '240px', marginBottom: 0 }}
          />

          <button onClick={onRefresh} className="btn-secondary" style={{ width: 'auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="table-container">
        {filteredInstallments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No lease/installment records found.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Leased Vehicle</th>
                <th>Agreement Values (Paid / Total)</th>
                <th>Repayment Progress</th>
                <th>Next Due Date</th>
                <th>Plan Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstallments.map((item) => {
                const total = item.totalAmount || 0;
                const paid = item.paidAmount || 0;
                const remaining = total - paid;
                const progressPercent = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0;
                
                const formattedDate = new Date(item.nextPaymentDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600' }}>
                          {item.user?.firstname} {item.user?.lastname}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {item.user?.email || 'No email'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '500' }}>
                          🚘 {item.vehicleName}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Plate: {item.vehiclePlate}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '700', color: 'white' }}>
                          ₦{paid.toLocaleString()} <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>/ ₦{total.toLocaleString()}</span>
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Remaining: ₦{remaining.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '120px' }}>
                        <div className="flex-between" style={{ fontSize: '12px' }}>
                          <span>{progressPercent}% Repaid</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                          <div style={{
                            height: '100%',
                            width: `${progressPercent}%`,
                            background: progressPercent > 75 
                              ? 'var(--success)' 
                              : progressPercent > 40 
                                ? 'var(--primary)' 
                                : 'var(--warning)',
                            borderRadius: '10px',
                            transition: 'width 0.4s ease'
                          }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '500', color: 'white' }}>
                        {formattedDate}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                        {item.installmentPlan || 'Monthly'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Installments;
