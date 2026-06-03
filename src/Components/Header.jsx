import React from 'react';

const Header = ({ activeTab, admin, onMenuToggle }) => {
  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'System Dashboard',
          subtitle: 'Real-time overview of users, rides, revenue metrics, and installments.'
        };
      case 'rides':
        return {
          title: 'Rides Monitoring & Updates',
          subtitle: 'Follow ongoing and historical passenger rides, driver assignments, and fares.'
        };
      case 'wallet':
        return {
          title: 'Wallet Balances & Funding Audit',
          subtitle: 'Audit user wallets, view credit/debit transaction history, or credit user balances.'
        };
      case 'installments':
        return {
          title: 'Partner Installments Tracking',
          subtitle: 'Track payment plans, total sums, repayment amounts, and payment status for partners.'
        };
      case 'users':
        return {
          title: 'User Directory',
          subtitle: 'List passengers, riders, and partner accounts registered in the database.'
        };
      default:
        return {
          title: 'Nova Crest Management Console',
          subtitle: 'Platform controls and diagnostic information.'
        };
    }
  };

  const { title, subtitle } = getHeaderDetails();

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <button className="menu-toggle" onClick={onMenuToggle} title="Toggle Menu">
          ☰
        </button>
        <div className="header-title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="user-profile">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
            {admin?.firstname} {admin?.lastname}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            System Administrator
          </span>
        </div>
        <div className="avatar">
          {admin?.firstname?.[0]}{admin?.lastname?.[0]}
        </div>
      </div>
    </div>
  );
};

export default Header;
