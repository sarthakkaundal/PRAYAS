import React, { useState, useEffect } from 'react';
import { db, auth } from './Auth/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Fund = () => {
  const [userRole, setUserRole] = useState('Citizen');
  const [inflows, setInflows] = useState([]);
  const [outflows, setOutflows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin form state
  const [inflowSource, setInflowSource] = useState('');
  const [inflowType, setInflowType] = useState('Donation');
  const [inflowAmount, setInflowAmount] = useState('');
  
  const [outflowRegion, setOutflowRegion] = useState('');
  const [outflowPurpose, setOutflowPurpose] = useState('');
  const [outflowAmount, setOutflowAmount] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists() && snapshot.data().role) {
          setUserRole(snapshot.data().role);
        }
      } else {
        setUserRole('Citizen');
      }
    });

    const qIn = query(collection(db, "fund_inflows"), orderBy("createdAt", "desc"));
    const unsubscribeIn = onSnapshot(qIn, (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setInflows(data);
    });

    const qOut = query(collection(db, "fund_outflows"), orderBy("createdAt", "desc"));
    const unsubscribeOut = onSnapshot(qOut, (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setOutflows(data);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeIn();
      unsubscribeOut();
    };
  }, []);

  const totalFunds = inflows.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalAllocated = outflows.reduce((sum, a) => sum + Number(a.amount), 0);
  const utilization = totalFunds > 0 ? ((totalAllocated / totalFunds) * 100).toFixed(0) : 0;

  // Aggregate purposes for PieChart
  const purposeMap = {};
  outflows.forEach(o => {
    purposeMap[o.purpose] = (purposeMap[o.purpose] || 0) + Number(o.amount);
  });
  const pieData = Object.keys(purposeMap).map((key, i) => {
    const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
    return { name: key, value: purposeMap[key], color: colors[i % colors.length] };
  });

  // Aggregate regions for BarChart
  const regionMap = {};
  outflows.forEach(o => {
    regionMap[o.region] = (regionMap[o.region] || 0) + Number(o.amount);
  });
  const barData = Object.keys(regionMap).map(key => ({ name: key, amount: regionMap[key] }));

  const handleAddInflow = async () => {
    if (!inflowSource || !inflowAmount) return alert("Please fill all fields");
    try {
      await addDoc(collection(db, "fund_inflows"), {
        donor: inflowSource,
        type: inflowType,
        amount: Number(inflowAmount),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid
      });
      setInflowSource('');
      setInflowAmount('');
    } catch (err) {
      console.error(err);
      alert("Failed to add inflow");
    }
  };

  const handleAddOutflow = async () => {
    if (!outflowRegion || !outflowPurpose || !outflowAmount) return alert("Please fill all fields");
    try {
      await addDoc(collection(db, "fund_outflows"), {
        region: outflowRegion,
        purpose: outflowPurpose,
        amount: Number(outflowAmount),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid
      });
      setOutflowRegion('');
      setOutflowPurpose('');
      setOutflowAmount('');
    } catch (err) {
      console.error(err);
      alert("Failed to add outflow");
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <div className="flex items-center gap-3 font-mono text-sm" style={{ color: 'var(--accent-volt)' }}>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Loading Funds Data...
        </div>
      </div>
    );
  }

  const isAdmin = userRole === 'RegionalAdmin' || userRole === 'SuperAdmin';

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
          {isAdmin && (
             <div className="px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-widest font-bold" style={{ backgroundColor: 'rgba(204,255,0,0.1)', color: 'var(--accent-volt)', border: '1px solid rgba(204,255,0,0.2)' }}>
               Admin Override Active
             </div>
          )}
        </div>
      </div>

      {/* Financial Metrics */}
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

      {/* Admin Panel */}
      {isAdmin && (
        <div className="opacity-0 animate-in grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ animationDelay: '0.08s' }}>
          {/* Register Inflow */}
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--status-success)' }}></div>
              Register Inflow
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Source Entity</label>
                <input type="text" placeholder="Donor name or ID" value={inflowSource} onChange={e => setInflowSource(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Type</label>
                <select value={inflowType} onChange={e => setInflowType(e.target.value)} style={inputStyle}>
                  <option value="Donation">Donation</option>
                  <option value="Gov. Grant">Gov. Grant</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Amount (INR)</label>
                <input type="number" placeholder="0" value={inflowAmount} onChange={e => setInflowAmount(e.target.value)} style={{...inputStyle, fontSize: '18px'}} />
              </div>
              <button onClick={handleAddInflow} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--accent-volt)', color: 'var(--text-inverse)', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', marginTop: '4px' }} onMouseOver={(e) => { e.target.style.boxShadow = 'var(--shadow-glow-volt)'; }} onMouseOut={(e) => { e.target.style.boxShadow = 'none'; }}>Execute Transfer</button>
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
                <input type="text" placeholder="Region name" value={outflowRegion} onChange={e => setOutflowRegion(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Purpose</label>
                <input type="text" placeholder="e.g. Flood Relief" value={outflowPurpose} onChange={e => setOutflowPurpose(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Amount (INR)</label>
                <input type="number" placeholder="0" value={outflowAmount} onChange={e => setOutflowAmount(e.target.value)} style={{...inputStyle, fontSize: '18px'}} />
              </div>
              <button onClick={handleAddOutflow} style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--status-danger)', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', marginTop: '4px' }} onMouseOver={(e) => { e.target.style.boxShadow = 'var(--shadow-glow-danger)'; }} onMouseOut={(e) => { e.target.style.boxShadow = 'none'; }}>Execute Transfer</button>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="opacity-0 animate-in grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
            <h2 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Purpose Allocation</h2>
          </div>
          <div className="h-[280px] p-4 flex justify-center items-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={60} dataKey="value" stroke="none" paddingAngle={3}>
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--grid-border)', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '11px' }} itemStyle={{ color: 'var(--accent-volt)' }} formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <span className="text-xs text-gray-500">No outflows yet</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
            <h2 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Regional Distribution</h2>
          </div>
          <div className="h-[280px] p-4 flex justify-center items-center">
             {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                  <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} fontFamily="JetBrains Mono" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--grid-border)', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '11px' }} cursor={{ fill: 'var(--grid-border)', opacity: 0.15 }} formatter={(value) => [`₹${value.toLocaleString()}`, 'Allocated']} />
                  <Bar dataKey="amount" fill="var(--accent-volt)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <span className="text-xs text-gray-500">No outflows yet</span>
             )}
          </div>
        </div>
      </div>

      {/* Tables */}
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
                {inflows.map((d) => (
                  <tr key={d.id} className="transition-colors duration-150" style={{ borderBottom: '1px solid var(--border-subtle)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-base)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="p-3 text-sm" style={{ color: 'var(--text-primary)' }}>{d.donor}</td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{d.type}</td>
                    <td className="p-3 font-semibold" style={{ color: 'var(--status-success)' }}>+₹{d.amount.toLocaleString()}</td>
                    <td className="p-3" style={{ color: 'var(--text-tertiary)' }}>{d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : ''}</td>
                  </tr>
                ))}
                {inflows.length === 0 && (
                  <tr><td colSpan="4" className="p-4 text-center text-xs" style={{color: 'var(--text-tertiary)'}}>No inflows recorded</td></tr>
                )}
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
                {outflows.map((a) => (
                  <tr key={a.id} className="transition-colors duration-150" style={{ borderBottom: '1px solid var(--border-subtle)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-base)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="p-3 text-sm" style={{ color: 'var(--text-primary)' }}>{a.region}</td>
                    <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{a.purpose}</td>
                    <td className="p-3 font-semibold" style={{ color: 'var(--status-danger)' }}>-₹{a.amount.toLocaleString()}</td>
                    <td className="p-3" style={{ color: 'var(--text-tertiary)' }}>{a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString() : ''}</td>
                  </tr>
                ))}
                {outflows.length === 0 && (
                  <tr><td colSpan="4" className="p-4 text-center text-xs" style={{color: 'var(--text-tertiary)'}}>No outflows recorded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fund;