import React from 'react';
import { LineChart, BarChart, DonutChart } from './Charts';

const DashboardHome = ({ stats }) => {
  if (!stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <span className="text-secondary">Loading statistics aggregates...</span>
      </div>
    );
  }

  // Prepping chart datasets
  const months = stats.monthlyActivity?.map(d => d.month) || [];
  const passengerData = stats.monthlyActivity?.map(d => d.passengers) || [];
  const riderData = stats.monthlyActivity?.map(d => d.riders) || [];
  const partnerData = stats.monthlyActivity?.map(d => d.partners) || [];
  const revenueData = stats.monthlyActivity?.map(d => d.revenue) || [];

  const userDatasets = [
    { label: 'Passengers', data: passengerData, color: 'var(--success)' },
    { label: 'Riders', data: riderData, color: 'var(--secondary)' },
    { label: 'Partners', data: partnerData, color: 'var(--primary)' }
  ];

  const installmentProgress = [
    { label: 'Paid', value: stats.installments?.totalPaid || 0, color: 'var(--success)' },
    { label: 'Pending', value: stats.installments?.totalPending || 0, color: 'var(--danger)' }
  ];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel" style={{ borderLeft: '4px solid var(--secondary)' }}>

          <div className="metric-info">
            <h3>Total Riders</h3>
            <div className="value">{stats.users?.riders || 0}</div>
            <div className="change up">
              <span>↑ Active Drivers</span>
            </div>
          </div>
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v9c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
            </svg>

          </div>
        </div>

        <div className="metric-card glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>

          <div className="metric-info">
            <h3>Passengers</h3>
            <div className="value">{stats.users?.passengers || 0}</div>
            <div className="change up">
              <span>↑ Daily Commuters</span>
            </div>
          </div>
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>

          <div className="metric-info">
            <h3>Partners (Installment)</h3>
            <div className="value">{stats.users?.partners || 0}</div>
            <div className="change up">
              <span>↑ Active Vehicles</span>
            </div>
          </div>
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

              <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="16" y1="2" x2="16" y2="4" /><line x1="8" y1="2" x2="8" y2="4" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ borderLeft: '4px solid var(--warning)' }}>

          <div className="metric-info">
            <h3>Wallet Revenue</h3>
            <div className="value">₦{(stats.wallets?.totalRevenue || 0).toLocaleString()}</div>
            <div className="change up">
              <span>↑ System Deposits</span>
            </div>
          </div>
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Primary Graphs section */}
      <div className="charts-grid">
        <div className="chart-card glass-panel">
          <div className="card-title-group">
            <h2>User Registration Breakdown</h2>
            <p>Monthly sign-ups comparing commuters, riders, and lease-to-own partners.</p>
          </div>
          <BarChart datasets={userDatasets} categories={months} />
        </div>

        <div className="chart-card glass-panel">
          <div className="card-title-group">
            <h2>Partner Repayments</h2>
            <p>Percentage ratio of paid vs. pending vehicle installment payments.</p>
          </div>
          <DonutChart data={installmentProgress} />
        </div>
      </div>

      {/* Secondary Graphs and Activity logs */}
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="chart-card glass-panel">
          <div className="card-title-group">
            <h2>System Funding Growth</h2>
            <p>Total user balance injections (wallet credit funding logs) over months.</p>
          </div>
          <LineChart data={revenueData} categories={months} />
        </div>

        <div className="chart-card glass-panel">
          <div className="card-title-group">
            <h2>System Activity Overview</h2>
            <p>Current distribution totals of ride statuses and partner vehicle profiles.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="flex-between" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Active Rides:</span>
              <span style={{ fontWeight: '700', color: 'var(--warning)' }}>{stats.rides?.active || 0}</span>
            </div>
            <div className="flex-between" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Completed Trips:</span>
              <span style={{ fontWeight: '700', color: 'var(--success)' }}>{stats.rides?.completed || 0}</span>
            </div>
            <div className="flex-between" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Cancelled Trips:</span>
              <span style={{ fontWeight: '700', color: 'var(--danger)' }}>{stats.rides?.cancelled || 0}</span>
            </div>
            <div className="flex-between" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Installment Plans:</span>
              <span style={{ fontWeight: '700', color: 'white' }}>{stats.installments?.total || 0} total</span>
            </div>
            <div className="flex-between" style={{ paddingBottom: '10px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Active / Completed Plans:</span>
              <span style={{ fontWeight: '700', color: 'var(--success)' }}>
                {stats.installments?.active || 0} / {stats.installments?.completed || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
