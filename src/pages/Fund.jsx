import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
  <div className="flex justify-center items-center min-h-[80vh]">
    <div className="flex flex-col bg-base border border-grid w-full max-w-[500px]">
      <div className="flex justify-center items-center p-6 border-b border-grid bg-base">
        <h2 className="text-sm font-mono text-secondary uppercase tracking-widest">ACCESS_CONTROL</h2>
      </div>
      <div className="p-8 flex flex-col gap-6">
        <p className="font-mono text-sm text-secondary text-center uppercase tracking-widest mb-2">
          AWAITING CLEARANCE LEVEL
        </p>
        <div className="flex flex-col gap-4">
          <button className="bg-transparent border border-grid px-6 py-4 text-primary font-mono uppercase font-bold cursor-pointer transition-snap hover:bg-surface" onClick={() => onLogin('public')}>
            AUTH_LEVEL: PUBLIC
          </button>
          <button className="bg-transparent border border-volt px-6 py-4 text-volt font-mono uppercase font-bold cursor-pointer transition-snap hover:bg-volt-dim" onClick={() => onLogin('admin')}>
            AUTH_LEVEL: ADMIN
          </button>
        </div>
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
      <div className="p-8 border-b border-grid bg-base flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Relief Funds</h1>
          <p className="font-mono text-sm text-secondary uppercase tracking-widest">PUBLIC_DASHBOARD_ACTIVE</p>
        </div>
        <button className="bg-transparent border border-red-500/50 text-red-500 px-6 py-3 font-mono text-sm uppercase font-bold hover:bg-red-500/10 transition-snap" onClick={onLogout}>TERMINATE_SESSION</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-grid mb-[1px]">
          {[
            { label: 'TOTAL_INFLOW', value: totalFunds },
            { label: 'TOTAL_OUTFLOW', value: totalAllocated },
            { label: 'NET_RESERVE', value: totalFunds - totalAllocated }
          ].map(stat => (
            <div key={stat.label} className="bg-base p-8 text-center flex flex-col justify-center">
              <div className="font-mono text-xs text-secondary uppercase tracking-widest mb-4">
                {stat.label}
              </div>
              <div className={`text-4xl font-bold ${stat.label === 'NET_RESERVE' ? 'text-volt' : 'text-primary'}`}>
                ₹{stat.value.toLocaleString()}
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-[1px] bg-grid">
        <div className="flex flex-col bg-base mb-[1px]">
          <div className="flex items-center p-4 border-b border-grid bg-base">
            <h2 className="text-[10px] font-mono text-secondary uppercase tracking-widest">ALLOCATION_MATRIX</h2>
          </div>
          <div className="h-[400px] py-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={120} innerRadius={80} dataKey="value" stroke="none">
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
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-grid mt-[1px]">
        <div className="flex flex-col bg-base" style={{ overflowX: 'auto' }}>
          <div className="flex justify-between items-center p-4 border-b border-grid bg-base">
            <h2 className="text-sm font-mono text-secondary uppercase flex items-center gap-2">RECENT_INFLOWS</h2>
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

        <div className="flex flex-col bg-base" style={{ overflowX: 'auto' }}>
          <div className="flex justify-between items-center p-4 border-b border-grid bg-base">
            <h2 className="text-sm font-mono text-secondary uppercase flex items-center gap-2">RECENT_OUTFLOWS</h2>
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

const AdminDashboard = ({ onLogout }) => (
  <div style={{ width: '100%' }}>
    <div className="p-8 border-b border-grid bg-base flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Relief Funds</h1>
        <p className="font-mono text-sm uppercase tracking-widest text-volt">ADMIN_OVERRIDE_ACTIVE</p>
      </div>
      <button className="bg-transparent border border-red-500 text-red-500 px-6 py-3 font-mono text-sm uppercase font-bold hover:bg-red-500 hover:text-white transition-snap" onClick={onLogout}>TERMINATE_SESSION</button>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-grid mt-[1px]">
      <div className="flex flex-col bg-base p-8">
        <div className="flex items-center mb-8">
          <h2 className="text-[10px] font-mono text-secondary uppercase tracking-widest">REGISTER_INFLOW</h2>
        </div>
        <div className="mb-6">
          <label className="block font-mono text-[10px] text-secondary mb-2 uppercase tracking-widest">SOURCE_ID</label>
          <input type="text" className="w-full bg-transparent border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap" placeholder="ENTER DONOR" />
        </div>
        <div className="mb-8">
          <label className="block font-mono text-[10px] text-secondary mb-2 uppercase tracking-widest">QUANTITY (INR)</label>
          <input type="number" className="w-full bg-transparent border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap" placeholder="0" />
        </div>
        <button className="w-full bg-transparent border border-primary px-6 py-4 text-primary font-mono uppercase font-bold hover:bg-primary hover:text-base transition-snap">EXECUTE_TRANSFER</button>
      </div>

      <div className="flex flex-col bg-base p-8">
        <div className="flex items-center mb-8">
          <h2 className="text-[10px] font-mono text-secondary uppercase tracking-widest">REGISTER_OUTFLOW</h2>
        </div>
        <div className="mb-6">
          <label className="block font-mono text-[10px] text-secondary mb-2 uppercase tracking-widest">DESTINATION_ID</label>
          <input type="text" className="w-full bg-transparent border border-grid p-4 text-primary font-mono outline-none focus:border-red-500 transition-snap" placeholder="ENTER REGION" />
        </div>
        <div className="mb-8">
          <label className="block font-mono text-[10px] text-secondary mb-2 uppercase tracking-widest">QUANTITY (INR)</label>
          <input type="number" className="w-full bg-transparent border border-grid p-4 text-primary font-mono outline-none focus:border-red-500 transition-snap" placeholder="0" />
        </div>
        <button className="w-full bg-transparent border border-red-500 text-red-500 px-6 py-4 font-mono uppercase font-bold hover:bg-red-500 hover:text-white transition-snap">EXECUTE_TRANSFER</button>
      </div>
    </div>
  </div>
);

const Fund = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .data-table { width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
        .data-table th, .data-table td { padding: 1rem; border-bottom: 1px solid var(--grid-border); text-align: left; }
        .data-table th { background: var(--bg-surface); color: var(--text-secondary); font-size: 0.75rem; }
        .data-table tr { transition: var(--transition-snap); }
        .data-table tr:hover { background: var(--accent-volt); color: var(--text-inverse); }
        .data-table tr:hover td { color: var(--text-inverse) !important; }
      `}</style>
      
      <Routes>
        <Route path="/" element={<LoginPage onLogin={(role) => navigate(`/funds/${role}`)} />} />
        <Route path="/public" element={<PublicDashboard onLogout={() => navigate('/funds')} />} />
        <Route path="/admin" element={<AdminDashboard onLogout={() => navigate('/funds')} />} />
      </Routes>
    </div>
  );
};

export default Fund;