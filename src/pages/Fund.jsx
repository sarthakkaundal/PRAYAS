import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const sampleData = {
  donations: [
    { id: 1, donor: 'AKSHAYA PATRA FND', amount: 500000, type: 'BANK_TX', date: '2024-09-20' },
    { id: 2, donor: 'MINISTRY OF HOME AFF', amount: 2500000, type: 'GOV_GRANT', date: '2024-09-18' },
    { id: 3, donor: 'SMILE FOUNDATION', amount: 750000, type: 'ONLINE', date: '2024-09-15' },
    { id: 4, donor: 'NDRF', amount: 1000000, type: 'GOV_GRANT', date: '2024-09-12' },
  ],
  allocations: [
    { id: 1, region: 'KERALA', purpose: 'FLOOD_RELIEF', amount: 800000, date: '2024-09-19' },
    { id: 2, region: 'UTTARAKHAND', purpose: 'MED_AID', amount: 600000, date: '2024-09-17' },
    { id: 3, region: 'ASSAM', purpose: 'EMERGENCY_SHELTER', amount: 450000, date: '2024-09-14' },
    { id: 4, region: 'BIHAR', purpose: 'FOOD_DISTRIBUTION', amount: 350000, date: '2024-09-12' },
  ]
};

const LoginPage = ({ onLogin }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
    <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
      <div className="card-header" style={{ justifyContent: 'center' }}>
        <h2 className="card-title">ACCESS_CONTROL</h2>
      </div>
      <p style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        AWAITING CLEARANCE LEVEL
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="btn btn-primary" onClick={() => onLogin('public')}>
          AUTH_LEVEL: PUBLIC
        </button>
        <button className="btn" style={{ borderColor: 'var(--accent-volt)', color: 'var(--accent-volt)' }} onClick={() => onLogin('admin')}>
          AUTH_LEVEL: ADMIN
        </button>
      </div>
    </div>
  </div>
);

const PublicDashboard = ({ onLogout }) => {
  const totalFunds = sampleData.donations.reduce((sum, d) => sum + d.amount, 0);
  const totalAllocated = sampleData.allocations.reduce((sum, a) => sum + a.amount, 0);

  const pieData = [
    { name: 'FLOOD_RELIEF', value: sampleData.allocations.filter(a => a.purpose === 'FLOOD_RELIEF').reduce((sum, a) => sum + a.amount, 0), color: '#ccff00' },
    { name: 'MED_AID', value: sampleData.allocations.filter(a => a.purpose === 'MED_AID').reduce((sum, a) => sum + a.amount, 0), color: '#ededed' },
    { name: 'EMERGENCY_SHELTER', value: sampleData.allocations.filter(a => a.purpose === 'EMERGENCY_SHELTER').reduce((sum, a) => sum + a.amount, 0), color: '#737373' },
    { name: 'FOOD_DISTRIBUTION', value: sampleData.allocations.filter(a => a.purpose === 'FOOD_DISTRIBUTION').reduce((sum, a) => sum + a.amount, 0), color: '#333333' }
  ];

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Relief Funds</h1>
          <p className="page-subtitle">PUBLIC_DASHBOARD_ACTIVE</p>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>TERMINATE_SESSION</button>
      </div>

      <div className="content-grid">
        <div className="card" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
          {[
            { label: 'TOTAL_INFLOW', value: totalFunds },
            { label: 'TOTAL_OUTFLOW', value: totalAllocated },
            { label: 'NET_RESERVE', value: totalFunds - totalAllocated }
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: stat.label === 'NET_RESERVE' ? 'var(--accent-volt)' : 'var(--text-primary)' }}>
                ₹{stat.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h2 className="card-title">ALLOCATION_MATRIX</h2>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} stroke="none">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--grid-border)', borderRadius: '0', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }} 
                  itemStyle={{ color: 'var(--accent-volt)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'INR']} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ overflowX: 'auto' }}>
          <div className="card-header">
            <h2 className="card-title">RECENT_INFLOWS</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>SOURCE</th>
                <th>CLASS</th>
                <th>AMOUNT</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.donations.map((d) => (
                <tr key={d.id}>
                  <td>{d.donor}</td>
                  <td>{d.type}</td>
                  <td style={{ color: 'var(--status-success)' }}>+₹{d.amount.toLocaleString()}</td>
                  <td>{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ overflowX: 'auto' }}>
          <div className="card-header">
            <h2 className="card-title">RECENT_OUTFLOWS</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>DESTINATION</th>
                <th>PURPOSE</th>
                <th>AMOUNT</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.allocations.map((a) => (
                <tr key={a.id}>
                  <td>{a.region}</td>
                  <td>{a.purpose}</td>
                  <td style={{ color: 'var(--status-danger)' }}>-₹{a.amount.toLocaleString()}</td>
                  <td>{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Extremely stripped down Admin version for aesthetics
const AdminDashboard = ({ onLogout }) => (
  <div style={{ width: '100%' }}>
    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 className="page-title">Relief Funds</h1>
        <p className="page-subtitle" style={{ color: 'var(--accent-volt)' }}>ADMIN_OVERRIDE_ACTIVE</p>
      </div>
      <button className="btn btn-danger" onClick={onLogout}>TERMINATE_SESSION</button>
    </div>
    
    <div className="content-grid">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">REGISTER_INFLOW</h2>
        </div>
        <div className="form-group">
          <label className="form-label">SOURCE_ID</label>
          <input type="text" className="form-input" placeholder="ENTER DONOR" />
        </div>
        <div className="form-group">
          <label className="form-label">QUANTITY (INR)</label>
          <input type="number" className="form-input" placeholder="0" />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }}>EXECUTE_TRANSFER</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">REGISTER_OUTFLOW</h2>
        </div>
        <div className="form-group">
          <label className="form-label">DESTINATION_ID</label>
          <input type="text" className="form-input" placeholder="ENTER REGION" />
        </div>
        <div className="form-group">
          <label className="form-label">QUANTITY (INR)</label>
          <input type="number" className="form-input" placeholder="0" />
        </div>
        <button className="btn btn-danger" style={{ width: '100%' }}>EXECUTE_TRANSFER</button>
      </div>
    </div>
  </div>
);

const Fund = () => {
  const [user, setUser] = useState(null);

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .data-table { width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
        .data-table th, .data-table td { padding: 1rem; border: 1px solid var(--grid-border); text-align: left; }
        .data-table th { background: var(--bg-surface); color: var(--text-secondary); }
        .data-table tr { transition: var(--transition-snap); }
        .data-table tr:hover { background: var(--accent-volt); color: var(--text-inverse); }
        .data-table tr:hover td { color: var(--text-inverse) !important; }
      `}</style>
      
      {!user && <LoginPage onLogin={setUser} />}
      {user === 'public' && <PublicDashboard onLogout={() => setUser(null)} />}
      {user === 'admin' && <AdminDashboard onLogout={() => setUser(null)} />}
    </div>
  );
};

export default Fund;