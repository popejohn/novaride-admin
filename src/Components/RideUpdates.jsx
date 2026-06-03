import React, { useState } from 'react';

const RideUpdates = ({ rides, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRide, setSelectedRide] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0); // 0 = passenger, 1 = driver

  const filteredRides = rides?.filter(ride => {
    const userFullName = `${ride.user?.firstname} ${ride.user?.lastname}`.toLowerCase();
    const pickup = ride.pickupLocation?.toLowerCase() || '';
    const dest = ride.destination?.toLowerCase() || '';
    const driverName = `${ride.assignedDriver?.riderInfo?.firstname} ${ride.assignedDriver?.riderInfo?.lastname}`.toLowerCase();
    const query = searchTerm.toLowerCase();

    return userFullName.includes(query) || pickup.includes(query) || dest.includes(query) || driverName.includes(query);
  }) || [];

  const handleRideClick = (ride) => {
    setSelectedRide(ride);
    setCurrentSlide(0);
  };

  const handleSlideNext = () => {
    setCurrentSlide(prev => (prev + 1) % 2);
  };

  const handleSlidePrev = () => {
    setCurrentSlide(prev => (prev - 1 + 2) % 2);
  };

  const handleCloseModal = () => {
    setSelectedRide(null);
    setCurrentSlide(0);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--border-radius-md)' }}>
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="card-title-group" style={{ margin: 0 }}>
          <h2>Ongoing & Historical Rides</h2>
          <p>Displaying detailed records of trip updates and statuses across the platform.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search rides (user, location, driver)..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '250px', marginBottom: 0 }}
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
        {filteredRides.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No matching ride records found.
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Passenger</th>
                <th>Route (Pickup → Destination)</th>
                <th>Distance & Fare</th>
                <th>Assigned Driver</th>
                <th>Ride Status</th>
                <th>Payment</th>
                <th>Date / Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredRides.map((ride) => {
                const driverInfo = ride.assignedDriver?.riderInfo;
                const formattedDate = new Date(ride.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={ride._id} onClick={() => handleRideClick(ride)} style={{ cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600' }}>
                          {ride.user?.firstname} {ride.user?.lastname}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {ride.user?.phone || 'No phone'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '280px' }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                          📍 {ride.pickupLocation}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          🏁 {ride.destination}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '700', color: 'white' }}>
                          ₦{ride.fare?.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {ride.distance ? `${ride.distance.toFixed(1)} km` : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      {driverInfo ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500' }}>
                            🚗 {driverInfo.firstname} {driverInfo.lastname}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            License: {ride.assignedDriver.plateNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="badge status-pending" style={{ fontSize: '11px' }}>
                          Awaiting Accept
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge status-${ride.rideStatus}`}>
                        {ride.rideStatus?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${ride.paymentStatus}`}>
                        {ride.paymentStatus || 'pending'}
                      </span>
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

      {/* Ride Details Modal with Horizontal Slider */}
      {selectedRide && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Ride Details</h3>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>

            {/* Slider Container */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                transition: 'transform 0.3s ease-in-out',
                transform: `translateX(-${currentSlide * 100}%)`
              }}>
                {/* Slide 1: Passenger Details */}
                <div style={{ minWidth: '100%', padding: '20px 0' }}>
                  <h4 style={{ marginBottom: '16px', color: 'var(--primary)' }}>👤 Passenger Information</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
                      <span style={{ fontWeight: '600' }}>{selectedRide.user?.firstname} {selectedRide.user?.lastname}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                      <span style={{ fontWeight: '500' }}>{selectedRide.user?.email || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                      <span style={{ fontWeight: '500' }}>{selectedRide.user?.phone || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Wallet Balance:</span>
                      <span style={{ fontWeight: '600', color: 'var(--success)' }}>₦{(selectedRide.user?.wallet || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Pickup Location:</span>
                      <span style={{ fontWeight: '500' }}>{selectedRide.pickupLocation}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Destination:</span>
                      <span style={{ fontWeight: '500' }}>{selectedRide.destination}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Distance:</span>
                      <span style={{ fontWeight: '500' }}>{selectedRide.distance?.toFixed(2) || 'N/A'} km</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Fare:</span>
                      <span style={{ fontWeight: '700', color: 'var(--warning)' }}>₦{selectedRide.fare?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Slide 2: Driver/Rider Details */}
                <div style={{ minWidth: '100%', padding: '20px 0' }}>
                  <h4 style={{ marginBottom: '16px', color: 'var(--secondary)' }}>🚗 Driver Information</h4>
                  {selectedRide.assignedDriver?.riderInfo ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
                        <span style={{ fontWeight: '600' }}>{selectedRide.assignedDriver.riderInfo.firstname} {selectedRide.assignedDriver.riderInfo.lastname}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                        <span style={{ fontWeight: '500' }}>{selectedRide.assignedDriver.riderInfo.email || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                        <span style={{ fontWeight: '500' }}>{selectedRide.assignedDriver.riderInfo.phone || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Wallet Balance:</span>
                        <span style={{ fontWeight: '600', color: 'var(--success)' }}>₦{(selectedRide.assignedDriver.riderInfo.wallet || 0).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Vehicle Plate:</span>
                        <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{selectedRide.assignedDriver.plateNumber}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Vehicle Model:</span>
                        <span style={{ fontWeight: '500' }}>{selectedRide.assignedDriver.vehicleModel || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Ride Status:</span>
                        <span className={`badge status-${selectedRide.rideStatus}`} style={{ marginLeft: 'auto' }}>
                          {selectedRide.rideStatus?.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Payment Status:</span>
                        <span className={`badge status-${selectedRide.paymentStatus}`} style={{ marginLeft: 'auto' }}>
                          {selectedRide.paymentStatus || 'pending'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                      No driver assigned yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Slider Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={handleSlidePrev} className="btn-secondary" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>←</span> Previous
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {[0, 1].map(i => (
                  <div key={i} onClick={() => setCurrentSlide(i)} style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentSlide === i ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }} />
                ))}
              </div>

              <button onClick={handleSlideNext} className="btn-secondary" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Next <span>→</span>
              </button>
            </div>

            {/* Slide Indicator */}
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {currentSlide === 0 ? 'Passenger Details' : 'Driver Details'} ({currentSlide + 1} of 2)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideUpdates;
