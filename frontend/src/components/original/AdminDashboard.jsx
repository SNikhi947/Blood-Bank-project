import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [users, setUsers] = useState([]);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [usersRes, donorsRes, hospRes, invRes, reqRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/donors'),
        apiClient.get('/hospitals'),
        apiClient.get('/hospitalinventory'),
        apiClient.get('/requests')
      ]);

      setUsers(usersRes.data);
      setDonors(donorsRes.data);
      setHospitals(hospRes.data);
      setInventory(invRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      alert("Error fetching admin data. Make sure you are logged in as an admin.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await apiClient.put(`/requests/${requestId}/status`, { status: newStatus });
      fetchAllData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const calculateTotalBlood = () => {
    return inventory.reduce((total, item) => total + item.units_available, 0);
  };

  const getCriticalShortages = () => {
    return inventory.filter(item => item.units_available > 0 && item.units_available < 5).length;
  };

  if (loading) return <div className="admin-loading">Initializing Secure Admin Network...</div>;

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div className="admin-title-group">
          <span className="admin-shield">🛡️</span>
          <div>
            <h1>System Administrator</h1>
            <p>Master Control & Moderation Hub</p>
          </div>
        </div>
        <button className="admin-refresh-btn" onClick={fetchAllData}>↻ Refresh Data</button>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Network Overview</button>
        <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>Request Moderation</button>
        <button className={activeTab === 'hospitals' ? 'active' : ''} onClick={() => setActiveTab('hospitals')}>Hospital Directory</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>User Database</button>
      </div>

      <div className="admin-content">
        
        {activeTab === 'overview' && (
          <div className="admin-overview">
            <div className="stat-grid">
              <div className="stat-card">
                <h3>Total Registered Users</h3>
                <div className="stat-number">{users.length}</div>
                <div className="stat-subtext">{donors.length} active donor profiles</div>
              </div>
              <div className="stat-card">
                <h3>Partner Hospitals</h3>
                <div className="stat-number">{hospitals.length}</div>
                <div className="stat-subtext">Active network nodes</div>
              </div>
              <div className="stat-card">
                <h3>Total Blood Units</h3>
                <div className="stat-number">{calculateTotalBlood()}</div>
                <div className="stat-subtext">Available across all hospitals</div>
              </div>
              <div className="stat-card alert-card">
                <h3>Critical Shortages</h3>
                <div className="stat-number">{getCriticalShortages()}</div>
                <div className="stat-subtext">Inventory groups below 5 units</div>
              </div>
            </div>

            <div className="admin-panel">
              <div className="panel-header"><h3>Recent Network Activity</h3></div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(-5).reverse().map(req => (
                    <tr key={req.id}>
                      <td><span className="badge-request">Emergency Request</span></td>
                      <td>{req.units_needed} Units of {req.blood_group} requested by Hospital: {req.hospital}</td>
                      <td><span className={`status-${req.status.toLowerCase().replace(' ', '-')}`}>{req.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="admin-panel">
            <div className="panel-header">
              <h3>Global Request Moderation</h3>
              <p>Override controls for all network blood requests.</p>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Units</th>
                    <th>Hospital</th>
                    <th>Current Status</th>
                    <th>Admin Override</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.slice().reverse().map(req => (
                    <tr key={req.id}>
                      <td className="bold-id">#{req.id}</td>
                      <td><span className="blood-badge">{req.blood_group}</span></td>
                      <td>{req.units_needed}</td>
                      <td>{req.hospital}</td>
                      <td><span className={`status-${req.status.toLowerCase().replace(' ', '-')}`}>{req.status}</span></td>
                      <td className="action-cell">
                        <select 
                          value={req.status} 
                          onChange={(e) => handleStatusUpdate(req.id, e.target.value)}
                          className="status-dropdown"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Fulfilled">Fulfilled</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div className="admin-panel">
            <div className="panel-header"><h3>Hospital Network Directory</h3></div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hospital Name</th>
                    <th>License Number</th>
                    <th>City</th>
                    <th>Contact Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map(h => (
                    <tr key={h.id}>
                      <td className="bold-id">#{h.id}</td>
                      <td className="primary-text">{h.hospital_name}</td>
                      <td>{h.license_number}</td>
                      <td>{h.city}</td>
                      <td>{h.contact_phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-panel">
            <div className="panel-header"><h3>System User Database</h3></div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>System Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="bold-id">#{u.id}</td>
                      <td className="primary-text">{u.username}</td>
                      <td><span className={`role-badge role-${u.role}`}>{u.role.toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;