import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './AdminDashboard.css';

const SortIcon = ({ active, desc }) => (
  <span className="adm-sort-icon">{active ? (desc ? '▼' : '▲') : ''}</span>
);

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'requests', label: 'Requests' },
  { key: 'hospitals', label: 'Hospitals' },
  { key: 'users', label: 'Users' },
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [users, setUsers] = useState([]);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);

  const [requestsSearch, setRequestsSearch] = useState('');
  const [hospitalsSearch, setHospitalsSearch] = useState('');
  const [usersSearch, setUsersSearch] = useState('');

  const [requestsSort, setRequestsSort] = useState({ field: 'id', desc: true });
  const [hospitalsSort, setHospitalsSort] = useState({ field: 'id', desc: false });
  const [usersSort, setUsersSort] = useState({ field: 'id', desc: false });

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [usersRes, donorsRes, hospRes, invRes, reqRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/donors'),
        apiClient.get('/hospitals'),
        apiClient.get('/hospitalinventory'),
        apiClient.get('/requests'),
      ]);
      setUsers(usersRes.data);
      setDonors(donorsRes.data);
      setHospitals(hospRes.data);
      setInventory(invRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      alert('Error fetching admin data. Make sure you are logged in as an admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await apiClient.put(`/requests/${requestId}/status`, { status: newStatus });
      fetchAllData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.reload();
  };

  const sortRows = (rows, sort) => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let av = a[sort.field], bv = b[sort.field];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sort.desc ? 1 : -1;
      if (av > bv) return sort.desc ? -1 : 1;
      return 0;
    });
    return copy;
  };

  const filteredRequests = sortRows(
    requests.filter((r) =>
      r.id.toString().includes(requestsSearch) ||
      r.blood_group.toLowerCase().includes(requestsSearch.toLowerCase()) ||
      r.hospital.toLowerCase().includes(requestsSearch.toLowerCase()) ||
      r.status.toLowerCase().includes(requestsSearch.toLowerCase())
    ),
    requestsSort
  );

  const filteredHospitals = sortRows(
    hospitals.filter((h) =>
      h.id.toString().includes(hospitalsSearch) ||
      h.hospital_name.toLowerCase().includes(hospitalsSearch.toLowerCase()) ||
      h.city.toLowerCase().includes(hospitalsSearch.toLowerCase())
    ),
    hospitalsSort
  );

  const filteredUsers = sortRows(
    users.filter((u) =>
      u.id.toString().includes(usersSearch) ||
      u.username.toLowerCase().includes(usersSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(usersSearch.toLowerCase())
    ),
    usersSort
  );

  const toggleSort = (setter, current, field) => {
    if (current.field === field) setter({ field, desc: !current.desc });
    else setter({ field, desc: false });
  };

  const totalBlood = inventory.reduce((total, item) => total + item.units_available, 0);
  const criticalShortages = inventory.filter((item) => item.units_available > 0 && item.units_available < 5).length;
  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Accepted' || r.status === 'Fulfilled').length;

  if (loading) {
    return (
      <div className="adm-loading">
        <div className="adm-spinner" />
        <p>Loading admin console…</p>
      </div>
    );
  }

  return (
    <div className="adm-root">
      <aside className="adm-sidebar">
        <div className="adm-brand">Admin Console</div>
        <nav className="adm-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`adm-nav-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="adm-logout" onClick={handleLogout}>Log out</button>
      </aside>

      <main className="adm-main">
        <header className="adm-topbar">
          <span className="adm-eyebrow">SYSTEM ADMINISTRATOR</span>
          <button className="adm-refresh" onClick={fetchAllData}>↻ Refresh Data</button>
        </header>

        {activeTab === 'overview' && (
          <>
            <div className="adm-stats-grid">
              <div className="adm-stat-card">
                <span className="adm-stat-label">Total Users</span>
                <span className="adm-stat-value">{users.length}</span>
                <span className="adm-stat-sub">{donors.length} donor profiles</span>
              </div>
              <div className="adm-stat-card">
                <span className="adm-stat-label">Partner Hospitals</span>
                <span className="adm-stat-value">{hospitals.length}</span>
                <span className="adm-stat-sub">Active network nodes</span>
              </div>
              <div className="adm-stat-card">
                <span className="adm-stat-label">Total Blood Units</span>
                <span className="adm-stat-value">{totalBlood}</span>
                <span className="adm-stat-sub">Across all hospitals</span>
              </div>
              <div className="adm-stat-card alert">
                <span className="adm-stat-label">Critical Shortages</span>
                <span className="adm-stat-value">{criticalShortages}</span>
                <span className="adm-stat-sub">Groups below 5 units</span>
              </div>
            </div>

            <div className="adm-panel">
              <div className="adm-panel-header">
                <h3>Recent Activity</h3>
                <p>{pendingCount} pending, {approvedCount} approved requests overall.</p>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>Group</th><th>Details</th><th>Status</th></tr></thead>
                  <tbody>
                    {requests.slice(-5).reverse().map((req) => (
                      <tr key={req.id}>
                        <td><span className="adm-type-badge">{req.blood_group}</span></td>
                        <td>{req.units_needed} units requested by {req.hospital}</td>
                        <td><span className={`adm-status adm-status-${req.status.toLowerCase()}`}>{req.status}</span></td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr><td colSpan="3" className="adm-empty-cell">No requests yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'requests' && (
          <div className="adm-panel">
            <div className="adm-panel-header adm-panel-header-flex">
              <div>
                <h3>Request Moderation</h3>
                <p>Override the status of any request in the network.</p>
              </div>
              <input type="text" className="adm-search" placeholder="Search requests…"
                value={requestsSearch} onChange={(e) => setRequestsSearch(e.target.value)} />
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort(setRequestsSort, requestsSort, 'id')}>ID <SortIcon active={requestsSort.field === 'id'} desc={requestsSort.desc} /></th>
                    <th onClick={() => toggleSort(setRequestsSort, requestsSort, 'blood_group')}>Type <SortIcon active={requestsSort.field === 'blood_group'} desc={requestsSort.desc} /></th>
                    <th onClick={() => toggleSort(setRequestsSort, requestsSort, 'units_needed')}>Units <SortIcon active={requestsSort.field === 'units_needed'} desc={requestsSort.desc} /></th>
                    <th onClick={() => toggleSort(setRequestsSort, requestsSort, 'hospital')}>Hospital <SortIcon active={requestsSort.field === 'hospital'} desc={requestsSort.desc} /></th>
                    <th onClick={() => toggleSort(setRequestsSort, requestsSort, 'status')}>Status <SortIcon active={requestsSort.field === 'status'} desc={requestsSort.desc} /></th>
                    <th>Override</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr><td colSpan="6" className="adm-empty-cell">No matching requests.</td></tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="adm-mono">#REQ-{req.id}</td>
                        <td><span className="adm-type-badge">{req.blood_group}</span></td>
                        <td>{req.units_needed}</td>
                        <td>{req.hospital}</td>
                        <td><span className={`adm-status adm-status-${req.status.toLowerCase()}`}>{req.status}</span></td>
                        <td>
                          <select className="adm-select" value={req.status}
                            onChange={(e) => handleStatusUpdate(req.id, e.target.value)}>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Fulfilled">Fulfilled</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div className="adm-panel">
            <div className="adm-panel-header adm-panel-header-flex">
              <div>
                <h3>Hospital Directory</h3>
                <p>All registered and verified clinical nodes.</p>
              </div>
              <input type="text" className="adm-search" placeholder="Search hospitals…"
                value={hospitalsSearch} onChange={(e) => setHospitalsSearch(e.target.value)} />
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort(setHospitalsSort, hospitalsSort, 'id')}>ID <SortIcon active={hospitalsSort.field === 'id'} desc={hospitalsSort.desc} /></th>
                    <th onClick={() => toggleSort(setHospitalsSort, hospitalsSort, 'hospital_name')}>Name <SortIcon active={hospitalsSort.field === 'hospital_name'} desc={hospitalsSort.desc} /></th>
                    <th>License</th>
                    <th onClick={() => toggleSort(setHospitalsSort, hospitalsSort, 'city')}>City <SortIcon active={hospitalsSort.field === 'city'} desc={hospitalsSort.desc} /></th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHospitals.length === 0 ? (
                    <tr><td colSpan="5" className="adm-empty-cell">No matching hospitals.</td></tr>
                  ) : (
                    filteredHospitals.map((h) => (
                      <tr key={h.id}>
                        <td className="adm-mono">#HSP-{h.id}</td>
                        <td><strong>{h.hospital_name}</strong></td>
                        <td className="adm-mono">{h.license_number}</td>
                        <td>{h.city}</td>
                        <td>{h.contact_phone}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="adm-panel">
            <div className="adm-panel-header adm-panel-header-flex">
              <div>
                <h3>User Database</h3>
                <p>Master registry of all system accounts.</p>
              </div>
              <input type="text" className="adm-search" placeholder="Search users…"
                value={usersSearch} onChange={(e) => setUsersSearch(e.target.value)} />
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort(setUsersSort, usersSort, 'id')}>ID <SortIcon active={usersSort.field === 'id'} desc={usersSort.desc} /></th>
                    <th onClick={() => toggleSort(setUsersSort, usersSort, 'username')}>Username <SortIcon active={usersSort.field === 'username'} desc={usersSort.desc} /></th>
                    <th onClick={() => toggleSort(setUsersSort, usersSort, 'role')}>Role <SortIcon active={usersSort.field === 'role'} desc={usersSort.desc} /></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="3" className="adm-empty-cell">No matching users.</td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="adm-mono">#USR-{u.id}</td>
                        <td><strong>{u.username}</strong></td>
                        <td><span className={`adm-role adm-role-${u.role}`}>{u.role.toUpperCase()}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;