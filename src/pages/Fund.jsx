import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const sampleData = {
  donations: [
    { id: 1, donor: 'Akshaya Patra Foundation', amount: 500000, type: 'Bank Transfer', date: '2024-09-20' },
    { id: 2, donor: 'Ministry of Home Affairs', amount: 2500000, type: 'Gov. Grant', date: '2024-09-18' },
    { id: 3, donor: 'Smile Foundation', amount: 750000, type: 'Online', date: '2024-09-15' },
    { id: 4, donor: 'NDRF', amount: 1000000, type: 'Gov. Grant', date: '2024-09-12' },
  ],
  allocations: [
    { id: 1, region: 'Kerala', purpose: 'Flood Relief', amount: 800000, date: '2024-09-19' },
    { id: 2, region: 'Uttarakhand', purpose: 'Medical Aid', amount: 600000, date: '2024-09-17' },
    { id: 3, region: 'Assam', purpose: 'Emergency Shelter', amount: 450000, date: '2024-09-14' },
    { id: 4, region: 'Bihar', purpose: 'Food Distribution', amount: 350000, date: '2024-09-12' },
  ]
};

const LoginPage = ({ onLogin }) => (
  <div className="flex justify-center items-center min-h-[70vh] p-4">
    <div className="rounded-xl border overflow-hidden w-full max-w-[420px]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-elevated)' }}>
      <div className="p-5 border-b text-center" style={{ borderColor: 'var(--grid-border)' }}>
        <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-volt)' }} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Financial Operations Access</h2>
        <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>Select your access level to continue</p>
      </div>
      <div className="p-5 flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-base)' }}>
        <button
          onClick={() => onLogin('public')}
          className="w-full p-3.5 rounded-lg border text-left transition-all duration-200"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-volt)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-volt-dim)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--grid-border)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div className="font-semibold mb-0.5">Public Dashboard</div>
          <div className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>View transparency reports and allocations</div>
        </button>
        <button
          onClick={() => onLogin('admin')}
          className="w-full p-3.5 rounded-lg border text-left transition-all duration-200"
          style={{ backgroundColor: 'var(--accent-volt-dim)', borderColor: 'rgba(204,255,0,0.2)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-volt)'; e.currentTarget.style.color = 'var(--text-inverse)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-volt-dim)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        >
          <div className="font-semibold mb-0.5">Admin Operations</div>
          <div className="font-mono text-[10px]" style={{ color: 'inherit', opacity: 0.7 }}>Manage fund inflows and outflows</div>
        </button>
      </div>
    </div>
  </div>
);

const PublicDashboard = ({ onLogout }) => {
  const totalFunds = sampleData.donations.reduce((sum, d) => sum + d.amount, 0);
  const totalAllocated = sampleData.allocations.reduce((sum, a) => sum + a.amount, 0);
  const utilization = ((totalAllocated / totalFunds) * 100).toFixed(0);

  const pieData = [
    { name: 'Flood Relief', value: 800000, color: '#ef4444' },
    { name: 'Medical Aid', value: 600000, color: '#f59e0b' },
    { name: 'Emergency Shelter', value: 450000, color: '#22c55e' },
    { name: 'Food Distribution', value: 350000, color: '#3b82f6' }
  ];

  const barData = sampleData.allocations.map(a => ({ name: a.region, amount: a.amount }));

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="opacity-0 animate-in">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>01</span>
          <span className="font-mono text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Financial Operations</span>
        </div>
        <div className="rounded-xl p-5 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-0.5">Financial Operations</h1>
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Public Transparency Dashboard</p>
          </div>
          <button onClick={onLogout} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.2)', backgroundColor: 'rgba(239,68,68,0.06)', color: 'var(--status-danger)', fontSize: '12px', fontFamily: 'inherit', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--status-danger)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; e.currentTarget.style.color = 'var(--status-danger)'; }}>End Session</button>
        </div>
      </div>

      {/* Financial Metrics — ArcGIS style with progress bars */}
      <div className="opacity-0 animate-in grid grid-cols-1 md:grid-cols-3 gap-4" style={{ animationDelay: '0.05s' }}>
        {[
          { label: 'Total Inflow', value: totalFunds, color: 'var(--text-primary)', bar: null },
          { label: 'Total Outflow', value: totalAllocated, color: 'var(--status-danger)', bar: { width: `${utilization}%`, color: 'var(--status-danger)' } },
          { label: 'Net Reserve', value: totalFunds - totalAllocated, color: 'var(--accent-volt)', bar: { width: `${100 - utilization}%`, color: 'var(--accent-volt)' } }
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-6 border relative overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
            <span className="font-mono text-[10px] tracking-wider uppercase block mb-3" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
            <span className="text-3xl font-bold block mb-3" style={{ color: stat.color }}>₹{stat.value.toLocaleString()}</span>
            {stat.bar && (
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: stat.bar.width, backgroundColor: stat.bar.color, boxShadow: `0 0 6px ${stat.bar.color}30` }}></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="opacity-0 animate-in grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
            <h2 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Purpose Allocation</h2>
          </div>
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={60} dataKey="value" stroke="none" paddingAngle={3}>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--grid-border)', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '11px' }} itemStyle={{ color: 'var(--accent-volt)' }} formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
            <h2 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Regional Distribution</h2>
          </div>
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} fontFamily="JetBrains Mono" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--grid-border)', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '11px' }} cursor={{ fill: 'var(--grid-border)', opacity: 0.15 }} formatter={(value) => [`₹${value.toLocaleString()}`, 'Allocated']} />
                <Bar dataKey="amount" fill="var(--accent-volt)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables — Linear-style clean */}
      <div className="opacity-0 animate-in grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ animationDelay: '0.15s' }}>
        {/* Inflows */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
            <h2 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Recent Inflows</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--grid-border)' }}>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider font-normal" style={{ color: 'var(--text-tertiary)' }}>Source</th>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider font-normal" style={{ color: 'var(--text-tertiary)' }}>Type</th>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider font-normal" style={{ color: 'var(--text-tertiary)' }}>Amount</th>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider font-normal" style={{ color: 'var(--text-tertiary)' }}>Date</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {sampleData.donations.map((d) => (
                  <tr key={d.id} className="transition-colors duration-150" style={{ borderBottom: '1px solid var(--border-subtle)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-base)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="p-3 text-sm" style={{ color: 'var(--text-primary)' }}>{d.donor}</td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{d.type}</td>
                    <td className="p-3 font-semibold" style={{ color: 'var(--status-success)' }}>+₹{d.amount.toLocaleString()}</td>
                    <td className="p-3" style={{ color: 'var(--text-tertiary)' }}>{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Outflows */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
            <h2 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Recent Outflows</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--grid-border)' }}>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider font-normal" style={{ color: 'var(--text-tertiary)' }}>Region</th>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider font-normal" style={{ color: 'var(--text-tertiary)' }}>Purpose</th>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider font-normal" style={{ color: 'var(--text-tertiary)' }}>Amount</th>
                  <th className="p-3 font-mono text-[10px] uppercase tracking-wider font-normal" style={{ color: 'var(--text-tertiary)' }}>Date</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {sampleData.allocations.map((a) => (
                  <tr key={a.id} className="transition-colors duration-150" style={{ borderBottom: '1px solid var(--border-subtle)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-base)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="p-3 text-sm" style={{ color: 'var(--text-primary)' }}>{a.region}</td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{a.purpose}</td>
                    <td className="p-3 font-semibold" style={{ color: 'var(--status-danger)' }}>-₹{a.amount.toLocaleString()}</td>
                    <td className="p-3" style={{ color: 'var(--text-tertiary)' }}>{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--grid-border)',
    backgroundColor: 'var(--bg-base)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  const focusHandlers = {
    onFocus: (e) => { e.target.style.borderColor = 'var(--accent-volt)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-volt-dim)'; },
    onBlur: (e) => { e.target.style.borderColor = 'var(--grid-border)'; e.target.style.boxShadow = 'none'; },
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="opacity-0 animate-in">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>01</span>
          <span className="font-mono text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Admin Operations</span>
        </div>
        <div className="rounded-xl p-5 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--accent-volt)', borderWidth: '1px', boxShadow: 'var(--shadow-glow-volt)' }}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-0.5">Financial Operations</h1>
            <p className="font-mono text-xs" style={{ color: 'var(--accent-volt)' }}>Admin Override Active</p>
          </div>
          <button onClick={onLogout} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--status-danger)', color: '#fff', fontSize: '12px', fontFamily: 'inherit', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-glow-danger)'; }} onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; }}>End Session</button>
        </div>
      </div>
      
      <div className="opacity-0 animate-in grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ animationDelay: '0.05s' }}>
        {/* Register Inflow */}
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--status-success)' }}></div>
            Register Inflow
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Source Entity</label>
              <input type="text" placeholder="Donor name or ID" style={inputStyle} {...focusHandlers} />
            </div>
            <div>
              <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Amount (INR)</label>
              <input type="number" placeholder="0" style={{...inputStyle, fontSize: '18px'}} {...focusHandlers} />
            </div>
            <button style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--accent-volt)', color: 'var(--text-inverse)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', marginTop: '4px' }} onMouseOver={(e) => { e.target.style.boxShadow = 'var(--shadow-glow-volt)'; }} onMouseOut={(e) => { e.target.style.boxShadow = 'none'; }}>Execute Transfer</button>
          </div>
        </div>

        {/* Register Outflow */}
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--status-danger)' }}></div>
            Register Outflow
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Destination Region</label>
              <input type="text" placeholder="Region name" style={inputStyle} onFocus={(e) => { e.target.style.borderColor = 'var(--status-danger)'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = 'var(--grid-border)'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Amount (INR)</label>
              <input type="number" placeholder="0" style={{...inputStyle, fontSize: '18px'}} onFocus={(e) => { e.target.style.borderColor = 'var(--status-danger)'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = 'var(--grid-border)'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <button style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--status-danger)', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', marginTop: '4px' }} onMouseOver={(e) => { e.target.style.boxShadow = 'var(--shadow-glow-danger)'; }} onMouseOut={(e) => { e.target.style.boxShadow = 'none'; }}>Execute Transfer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Fund = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%' }}>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={(role) => navigate(`/funds/${role}`)} />} />
        <Route path="/public" element={<PublicDashboard onLogout={() => navigate('/funds')} />} />
        <Route path="/admin" element={<AdminDashboard onLogout={() => navigate('/funds')} />} />
      </Routes>
    </div>
  );
};

export default Fund;