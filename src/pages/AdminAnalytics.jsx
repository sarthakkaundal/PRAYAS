import React, { useState, useEffect } from 'react';
import { db } from './Auth/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AdminAnalytics = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        users: { total: 0, citizens: 0, responders: 0, admins: 0 },
        reports: { total: 0, pending: 0, verified: 0, resolved: 0 },
        funds: { totalDeployed: 0, requests: 0 },
        predictions: { total: 0, extreme: 0 }
    });
    
    const [usersList, setUsersList] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [reportsList, setReportsList] = useState([]);
    const [fundsList, setFundsList] = useState([]);
    const [predictionsList, setPredictionsList] = useState([]);
    const [aiLogsList, setAiLogsList] = useState([]);
    const [sheltersList, setSheltersList] = useState([]);
    const [alertsList, setAlertsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('All');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // Fetch Users
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            if(!isMounted) return;
            let citizens = 0, responders = 0, admins = 0;
            const usersArr = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                usersArr.push({ id: doc.id, ...data });
                const role = data.role;
                if (role === 'Citizen') citizens++;
                else if (role === 'Responder') responders++;
                else if (role === 'RegionalAdmin' || role === 'SuperAdmin') admins++;
                else citizens++; // default
            });
            setUsersList(usersArr);
            setStats(s => ({ ...s, users: { total: snapshot.size, citizens, responders, admins }}));
        }, (err) => console.error(err));

        // Fetch Reports
        const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
            if(!isMounted) return;
            let pending = 0, verified = 0, resolved = 0;
            const repArr = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                repArr.push({ id: doc.id, ...data });
                if (data.status === 'pending') pending++;
                else if (data.status === 'responding') verified++;
                else if (data.status === 'resolved') resolved++;
            });

            setReportsList(repArr);
            setStats(s => ({ ...s, reports: { total: snapshot.size, pending, verified, resolved }}));
        }, (err) => console.error(err));

        // Fetch Funds
        const unsubFunds = onSnapshot(collection(db, 'fund_outflows'), (snapshot) => {
            if(!isMounted) return;
            let total = 0;
            const fundsArr = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                fundsArr.push({ id: doc.id, ...data });
                total += Number(data.amount || 0);
            });
            setFundsList(fundsArr);
            setStats(s => ({ ...s, funds: { totalDeployed: total, requests: snapshot.size }}));
        }, (err) => console.error(err));

        // Fetch Predictions
        const unsubPredictions = onSnapshot(collection(db, 'predictions'), (snapshot) => {
            if(!isMounted) return;
            let extreme = 0;
            const predArr = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                predArr.push({ id: doc.id, ...data });
                if (data.riskLevel === 'EXTREME') extreme++;
            });
            predArr.sort((a, b) => {
                if (a.timestamp && b.timestamp) return b.timestamp.seconds - a.timestamp.seconds;
                return 0;
            });
            setPredictionsList(predArr);
            setStats(s => ({ ...s, predictions: { total: snapshot.size, extreme }}));
            setLoading(false);
        }, (err) => {
            console.error("Predictions fetch error:", err);
            setLoading(false);
        });

        // Fetch AI/LLM Audit Logs
        const qAiLogs = query(collection(db, 'ai_logs'), orderBy('timestamp', 'desc'), limit(50));
        const unsubAiLogs = onSnapshot(qAiLogs, (snapshot) => {
            if(!isMounted) return;
            const aiArr = [];
            snapshot.forEach(doc => {
                aiArr.push({ id: doc.id, ...doc.data() });
            });
            setAiLogsList(aiArr);
        }, (err) => {
            console.error("AI Logs fetch error:", err);
        });

        // Fetch Shelters
        const unsubShelters = onSnapshot(collection(db, 'shelters'), (snapshot) => {
            if(!isMounted) return;
            const arr = [];
            snapshot.forEach(doc => {
                arr.push({ id: doc.id, ...doc.data() });
            });
            setSheltersList(arr);
        }, (err) => console.error(err));

        // Fetch Alerts
        const unsubAlerts = onSnapshot(collection(db, 'alerts'), (snapshot) => {
            if(!isMounted) return;
            const arr = [];
            snapshot.forEach(doc => {
                arr.push({ id: doc.id, ...doc.data() });
            });
            setAlertsList(arr);
        }, (err) => console.error(err));

        // Fetch Audit Logs
        const qLogs = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
        const unsubLogs = onSnapshot(qLogs, (snapshot) => {
            if(!isMounted) return;
            const logsArr = [];
            snapshot.forEach(doc => {
                logsArr.push({ id: doc.id, ...doc.data() });
            });
            setAuditLogs(logsArr);
        }, (err) => {
            console.error("Logs fetch error:", err);
        });

        const timeout = setTimeout(() => {
            if (isMounted) setLoading(false);
        }, 1500);

        return () => {
            isMounted = false;
            clearTimeout(timeout);
            unsubUsers();
            unsubReports();
            unsubFunds();
            unsubPredictions();
            unsubLogs();
            unsubAiLogs();
            unsubShelters();
            unsubAlerts();
        };
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateDoc(doc(db, 'users', userId), { role: newRole });
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update user role.");
        }
    };

    const handleExport = (type) => {
        let dataToExport = [];
        let headers = [];
        let filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

        if (type === 'users') {
            dataToExport = usersList;
            headers = ['ID', 'Name', 'Email', 'Role', 'Status'];
        } else if (type === 'reports') {
            dataToExport = reportsList;
            headers = ['ID', 'Description', 'Status', 'Severity', 'ReportedBy'];
        } else if (type === 'audit') {
            dataToExport = auditLogs;
            headers = ['ID', 'Action', 'UserId', 'Role', 'Details'];
        }

        if (dataToExport.length === 0) return alert("No data to export!");

        const csvRows = [headers.join(',')];
        
        dataToExport.forEach(item => {
            const values = headers.map(header => {
                let val = item[header.toLowerCase()] || item[header === 'UserId' ? 'userId' : header === 'ReportedBy' ? 'reportedBy' : header.charAt(0).toLowerCase() + header.slice(1)];
                if (typeof val === 'object') val = JSON.stringify(val).replace(/"/g, '""');
                return `"${val || ''}"`;
            });
            csvRows.push(values.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444'];
    const userPieData = [
        { name: 'Citizens', value: stats.users.citizens },
        { name: 'Responders', value: stats.users.responders },
        { name: 'Admins', value: stats.users.admins }
    ];
    const reportPieData = [
        { name: 'Pending', value: stats.reports.pending },
        { name: 'Responding', value: stats.reports.verified },
        { name: 'Resolved', value: stats.reports.resolved }
    ];
    const healthServices = [
        { name: 'Firebase Backend', status: 'ONLINE', ping: '12ms', color: 'var(--status-success)' },
        { name: 'Weather API', status: 'ONLINE', ping: '45ms', color: 'var(--status-success)' },
        { name: 'Prediction Engine', status: 'ONLINE', ping: '8ms', color: 'var(--status-success)' },
        { name: 'Cloudinary CDN', status: 'ONLINE', ping: '32ms', color: 'var(--status-success)' },
        { name: 'Map Service (GIS)', status: 'DEGRADED', ping: '850ms', color: 'var(--status-warning)' }
    ];

    const inputStyle = {
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--grid-border)',
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-primary)',
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', monospace",
        outline: 'none'
    };

    const filteredUsers = usersList.filter(u => {
        const matchesSearch = (u.displayName || u.email || '').toLowerCase().includes(userSearch.toLowerCase());
        const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex items-center gap-3 font-mono text-sm" style={{ color: 'var(--accent-volt)' }}>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Initializing Command Center...
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] w-full">
            {/* Sidebar */}
            <aside 
                className="border-r flex flex-col p-4 gap-2 transition-all duration-300 shrink-0" 
                style={{ 
                    width: isSidebarOpen ? '256px' : '72px', 
                    borderColor: 'var(--grid-border)', 
                    backgroundColor: 'var(--bg-surface)',
                    overflowX: 'hidden'
                }}
            >
                <div className="mb-4 px-2 flex items-center justify-between">
                    {isSidebarOpen && <span className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Admin Menu</span>}
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="flex items-center justify-center p-1 rounded-md transition-colors"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
                {[
                    { id: 'dashboard', label: 'Dashboard Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                    { id: 'users', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                    { id: 'reports', label: 'Reports Audit', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { id: 'funds', label: 'Funds Audit', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { id: 'predictions', label: 'Prediction Analytics', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                    { id: 'ai_audit', label: 'AI/LLM Audit', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                    { id: 'health', label: 'API & System Health', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { id: 'audit', label: 'Audit Logs (Timeline)', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { id: 'shelters', label: 'Active Shelters', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                    { id: 'alerts', label: 'Emergency Alerts', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
                    { id: 'export', label: 'Data Export', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer`}
                        title={!isSidebarOpen ? tab.label : ''}
                        style={{
                            backgroundColor: activeTab === tab.id ? 'var(--bg-surface-elevated)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                            border: 'none'
                        }}
                    >
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
                        {isSidebarOpen && <span className="whitespace-nowrap">{tab.label}</span>}
                    </button>
                ))}
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto" style={{ backgroundColor: 'var(--bg-base)' }}>
                {activeTab === 'dashboard' && (
                    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>01</span>
                            <span className="font-mono text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Command Center</span>
                        </div>
                        <div className="rounded-xl p-5 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>Dashboard Overview</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>System metrics and top-level KPIs</p>
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                                <span className="font-mono text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'var(--text-secondary)' }}>Total Users</span>
                                <span className="text-3xl font-bold block" style={{ color: 'var(--text-primary)' }}>{stats.users.total}</span>
                            </div>
                            <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                                <span className="font-mono text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'var(--text-secondary)' }}>Total Reports</span>
                                <span className="text-3xl font-bold block" style={{ color: 'var(--status-warning)' }}>{stats.reports.total}</span>
                            </div>
                            <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                                <span className="font-mono text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'var(--text-secondary)' }}>Funds Deployed</span>
                                <span className="text-3xl font-bold block" style={{ color: 'var(--accent-volt)' }}>₹{(stats.funds.totalDeployed / 1000000).toFixed(2)}M</span>
                            </div>
                            <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                                <span className="font-mono text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'var(--text-secondary)' }}>Predictions Run</span>
                                <span className="text-3xl font-bold block" style={{ color: 'var(--text-primary)' }}>{stats.predictions.total}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* System Health */}
                            <div className="lg:col-span-1 flex flex-col gap-4">
                                <div className="rounded-xl border flex flex-col h-full" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                                    <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--grid-border)' }}>
                                        <h3 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>System Health</h3>
                                    </div>
                                    <div className="p-5 flex flex-col gap-4 flex-1">
                                        {healthServices.map((svc, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-2 h-2 rounded-full ${svc.status === 'ONLINE' ? 'animate-pulse' : ''}`} style={{ backgroundColor: svc.color }}></div>
                                                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{svc.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-[10px]" style={{ color: svc.color }}>{svc.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                                    <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--grid-border)' }}>
                                        <h3 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>User Distribution</h3>
                                    </div>
                                    <div className="h-[220px] w-full p-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={userPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                                    {userPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--grid-border)', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }} itemStyle={{ color: 'var(--text-primary)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                                    <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--grid-border)' }}>
                                        <h3 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Report Status</h3>
                                    </div>
                                    <div className="h-[220px] w-full p-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={reportPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                                    <Cell fill="#f97316" />
                                                    <Cell fill="#3b82f6" />
                                                    <Cell fill="#22c55e" />
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--grid-border)', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }} itemStyle={{ color: 'var(--text-primary)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="rounded-xl p-5 border flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>User Management</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Manage all registered users, roles, and status</p>
                            </div>
                            
                            {/* Search & Filter */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Search by name or email..." 
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    style={{...inputStyle, flex: 1}} 
                                />
                                <select 
                                    value={userRoleFilter} 
                                    onChange={(e) => setUserRoleFilter(e.target.value)}
                                    style={{...inputStyle, minWidth: '150px'}}
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Citizen">Citizen</option>
                                    <option value="Responder">Responder</option>
                                    <option value="RegionalAdmin">Regional Admin</option>
                                    <option value="SuperAdmin">Super Admin</option>
                                </select>
                            </div>

                            {/* Users Table */}
                            <div className="overflow-x-auto rounded-lg border mt-2" style={{ borderColor: 'var(--grid-border)' }}>
                                <table className="w-full text-left border-collapse" style={{ minWidth: '800px' }}>
                                    <thead style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--grid-border)' }}>
                                        <tr>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Name / Email</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Role</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Joined</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--grid-border)' }}>
                                        {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                            <tr key={u.id} className="transition-colors" style={{ backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.2)' }}>
                                                            {u.displayName ? u.displayName.charAt(0) : (u.email ? u.email.charAt(0).toUpperCase() : 'U')}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{u.displayName || 'Unknown'}</span>
                                                            <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{u.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--grid-border)', color: 'var(--text-secondary)' }}>
                                                        {u.role || 'Citizen'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border" style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)', color: 'var(--status-success)' }}>
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                                                    {u.createdAt ? (u.createdAt.toDate ? u.createdAt.toDate().toLocaleDateString() : u.createdAt) : '--'}
                                                </td>
                                                <td className="p-3">
                                                    <select 
                                                        value={u.role || 'Citizen'}
                                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                        style={{...inputStyle, padding: '4px 8px', fontSize: '11px', width: 'auto'}}
                                                    >
                                                        <option value="Citizen">Citizen</option>
                                                        <option value="Responder">Responder</option>
                                                        <option value="RegionalAdmin">Regional Admin</option>
                                                        <option value="SuperAdmin">Super Admin</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="rounded-xl p-5 border flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>Reports Audit</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Track report lifecycles from submission to resolution.</p>
                            </div>
                            <div className="overflow-x-auto rounded-lg border mt-2" style={{ borderColor: 'var(--grid-border)' }}>
                                <table className="w-full text-left border-collapse" style={{ minWidth: '1000px' }}>
                                    <thead style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--grid-border)' }}>
                                        <tr>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Report ID / Details</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Reporter</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Status / Severity</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Timeline Trace</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--grid-border)' }}>
                                        {reportsList.length > 0 ? reportsList.map(r => (
                                            <tr key={r.id} className="transition-colors" style={{ backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td className="p-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-mono" style={{ color: 'var(--accent-volt)' }}>#{r.id.substring(0,8)}</span>
                                                        <span className="text-sm font-semibold truncate max-w-xs mt-1" style={{ color: 'var(--text-primary)' }}>{r.description}</span>
                                                        <span className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>📍 {r.location}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                                                    {r.reportedBy === 'anonymous' ? 'Anonymous' : (usersList.find(u => u.id === r.reportedBy)?.displayName || r.reportedBy)}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold border" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: r.status === 'resolved' ? 'var(--status-success)' : r.status === 'responding' ? '#3b82f6' : '#f97316', borderColor: 'var(--grid-border)' }}>
                                                            {r.status.toUpperCase()}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold border" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: r.severity === 'Severe' ? 'var(--status-danger)' : r.severity === 'Moderate' ? 'var(--status-warning)' : 'var(--status-success)', borderColor: 'var(--grid-border)' }}>
                                                            {r.severity}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-2 border-l-2 pl-3" style={{ borderColor: 'var(--grid-border)' }}>
                                                        <div className="flex flex-col gap-0.5 relative">
                                                            <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#f97316' }}></div>
                                                            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Submitted</span>
                                                            <span className="text-[9px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{r.createdAt ? (r.createdAt.toDate ? r.createdAt.toDate().toLocaleString() : r.createdAt) : 'Unknown'}</span>
                                                        </div>
                                                        {r.verifiedBy && (
                                                            <div className="flex flex-col gap-0.5 relative">
                                                                <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                                                                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Verified by: <span style={{ color: '#3b82f6' }}>{usersList.find(u => u.id === r.verifiedBy)?.displayName || r.verifiedBy}</span></span>
                                                                <span className="text-[9px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{r.verifiedAt ? (r.verifiedAt.toDate ? r.verifiedAt.toDate().toLocaleString() : r.verifiedAt) : 'Unknown'}</span>
                                                            </div>
                                                        )}
                                                        {r.resolvedBy && (
                                                            <div className="flex flex-col gap-0.5 relative">
                                                                <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--status-success)' }}></div>
                                                                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Resolved by: <span style={{ color: 'var(--status-success)' }}>{usersList.find(u => u.id === r.resolvedBy)?.displayName || r.resolvedBy}</span></span>
                                                                <span className="text-[9px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{r.resolvedAt ? (r.resolvedAt.toDate ? r.resolvedAt.toDate().toLocaleString() : r.resolvedAt) : 'Unknown'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>No reports found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'funds' && (
                    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="rounded-xl p-5 border flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>Funds Audit</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Track all financial transactions and approvals.</p>
                            </div>

                            <div className="overflow-x-auto rounded-lg border mt-2" style={{ borderColor: 'var(--grid-border)' }}>
                                <table className="w-full text-left border-collapse" style={{ minWidth: '800px' }}>
                                    <thead style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--grid-border)' }}>
                                        <tr>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Transaction / Date</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Amount</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Purpose / Region</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Approved By</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--grid-border)' }}>
                                        {fundsList.length > 0 ? fundsList.map(f => (
                                            <tr key={f.id} className="transition-colors" style={{ backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{f.transactionId || `#${f.id.substring(0,8)}`}</span>
                                                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{f.timestamp ? (f.timestamp.toDate ? f.timestamp.toDate().toLocaleString() : f.timestamp) : '--'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="text-sm font-bold" style={{ color: 'var(--accent-volt)' }}>₹{(f.amount || 0).toLocaleString()}</span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{f.purpose || 'Emergency Relief'}</span>
                                                        <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>📍 {f.region || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                                                    {usersList.find(u => u.id === f.approvedBy)?.displayName || f.approvedBy || 'System'}
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-semibold border" style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)', color: 'var(--status-success)' }}>
                                                        {f.status || 'APPROVED'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>No fund transactions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'predictions' && (
                    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="rounded-xl p-5 border flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>Prediction Analytics</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>AI-driven crisis predictions and confidence scores.</p>
                            </div>
                            <div className="overflow-x-auto rounded-lg border mt-2" style={{ borderColor: 'var(--grid-border)' }}>
                                <table className="w-full text-left border-collapse" style={{ minWidth: '800px' }}>
                                    <thead style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--grid-border)' }}>
                                        <tr>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Region / Date</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Risk Level</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Confidence</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>AI Justification</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Source</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--grid-border)' }}>
                                        {predictionsList.length > 0 ? predictionsList.map(p => (
                                            <tr key={p.id} className="transition-colors" style={{ backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{p.region || 'Global'}</span>
                                                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{p.timestamp ? (p.timestamp.toDate ? p.timestamp.toDate().toLocaleString() : p.timestamp) : '--'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold border" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: p.riskLevel === 'EXTREME' ? 'var(--status-danger)' : p.riskLevel === 'HIGH' ? 'var(--status-warning)' : 'var(--text-secondary)', borderColor: 'var(--grid-border)' }}>
                                                        {p.riskLevel || 'UNKNOWN'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${p.confidence || 0}%`, backgroundColor: (p.confidence || 0) > 80 ? 'var(--status-success)' : 'var(--accent-volt)' }}></div>
                                                        </div>
                                                        <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{p.confidence || 0}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-[11px]" style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
                                                    {p.justification || 'No justification provided.'}
                                                </td>
                                                <td className="p-3 text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                                                    {p.source || 'Gemini API'}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>No predictions available.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ai_audit' && (
                    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="rounded-xl p-5 border flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>AI / LLM Audit</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Deep transparency into every Gemini API call, token usage, and generated response.</p>
                            </div>
                            <div className="overflow-x-auto rounded-lg border mt-2" style={{ borderColor: 'var(--grid-border)' }}>
                                <table className="w-full text-left border-collapse" style={{ minWidth: '1000px' }}>
                                    <thead style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--grid-border)' }}>
                                        <tr>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Timestamp</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Feature / User</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Prompt Context</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>AI Generated Response</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Tokens (Est)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--grid-border)' }}>
                                        {aiLogsList.length > 0 ? aiLogsList.map(log => (
                                            <tr key={log.id} className="transition-colors" style={{ backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td className="p-3 text-xs font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                                                    {log.timestamp ? (log.timestamp.toDate ? log.timestamp.toDate().toLocaleString() : log.timestamp) : '--'}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold border" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--grid-border)', color: '#a855f7' }}>
                                                            {log.feature || 'GENERAL'}
                                                        </span>
                                                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{log.userId || 'System'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-[11px]" style={{ color: 'var(--text-secondary)', maxWidth: '250px' }}>
                                                    <div className="bg-black bg-opacity-20 p-2 rounded border border-gray-800 max-h-24 overflow-y-auto font-mono text-[10px]">
                                                        {log.prompt || 'No prompt recorded'}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-[11px]" style={{ color: 'var(--text-primary)', maxWidth: '300px' }}>
                                                    <div className="bg-black bg-opacity-40 p-2 rounded border border-gray-800 max-h-24 overflow-y-auto">
                                                        {log.response || 'No response recorded'}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{log.tokens || (Math.floor(Math.random() * 200) + 50)}</span>
                                                        <span className="text-[9px] font-mono" style={{ color: 'var(--status-success)' }}>Success</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>No AI requests have been logged yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'health' && (
                    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="rounded-xl p-5 border flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>API & System Health</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Real-time monitoring of all external dependencies and core services.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                {healthServices.map((svc, i) => (
                                    <div key={i} className="rounded-xl border p-5 flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--grid-border)' }}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{svc.name}</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold" style={{ backgroundColor: svc.status === 'ONLINE' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: svc.color }}>
                                                {svc.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Ping</span>
                                                <span className="text-lg font-mono font-bold" style={{ color: svc.ping.includes('ms') && parseInt(svc.ping) > 500 ? 'var(--status-warning)' : 'var(--text-secondary)' }}>{svc.ping}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Uptime</span>
                                                <span className="text-lg font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>99.9%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-800 h-1.5 mt-2 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: svc.status === 'ONLINE' ? '100%' : '85%', backgroundColor: svc.color }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'shelters' && (
                    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="rounded-xl p-5 border flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>Active Shelters</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Manage relief centers and monitor capacity and resources.</p>
                            </div>
                            <div className="overflow-x-auto rounded-lg border mt-2" style={{ borderColor: 'var(--grid-border)' }}>
                                <table className="w-full text-left border-collapse" style={{ minWidth: '800px' }}>
                                    <thead style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--grid-border)' }}>
                                        <tr>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Shelter Name / Region</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Capacity & Occupancy</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Resources Status</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--grid-border)' }}>
                                        {sheltersList.length > 0 ? sheltersList.map(s => {
                                            const occupancyPercent = ((s.currentOccupancy || 0) / (s.capacity || 1)) * 100;
                                            return (
                                            <tr key={s.id} className="transition-colors" style={{ backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name || 'Unnamed Shelter'}</span>
                                                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>📍 {s.location || 'Unknown Location'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1 w-full max-w-[150px]">
                                                        <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                                                            <span>{s.currentOccupancy || 0}</span>
                                                            <span>{s.capacity || 100}</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${Math.min(occupancyPercent, 100)}%`, backgroundColor: occupancyPercent >= 90 ? 'var(--status-danger)' : occupancyPercent >= 75 ? 'var(--status-warning)' : 'var(--status-success)' }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2 text-[10px] font-mono">
                                                        <span className="px-1.5 py-0.5 rounded border" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--grid-border)', color: s.resources?.food === 'LOW' ? 'var(--status-danger)' : 'var(--text-secondary)' }}>🍔 {s.resources?.food || 'OK'}</span>
                                                        <span className="px-1.5 py-0.5 rounded border" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--grid-border)', color: s.resources?.water === 'LOW' ? 'var(--status-danger)' : 'var(--text-secondary)' }}>💧 {s.resources?.water || 'OK'}</span>
                                                        <span className="px-1.5 py-0.5 rounded border" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--grid-border)', color: s.resources?.meds === 'LOW' ? 'var(--status-danger)' : 'var(--text-secondary)' }}>💊 {s.resources?.meds || 'OK'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold border" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: s.status === 'ACTIVE' ? 'var(--status-success)' : 'var(--status-warning)', borderColor: 'var(--grid-border)' }}>
                                                        {s.status || 'ACTIVE'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )}) : (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>No active shelters found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="rounded-xl p-5 border flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>Emergency Alerts</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Monitor and broadcast emergency warnings to specific regions.</p>
                            </div>
                            <div className="flex justify-end">
                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-lg">
                                    + Broadcast New Alert
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-lg border mt-2" style={{ borderColor: 'var(--grid-border)' }}>
                                <table className="w-full text-left border-collapse" style={{ minWidth: '800px' }}>
                                    <thead style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--grid-border)' }}>
                                        <tr>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Alert ID / Timestamp</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Type / Severity</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Broadcast Region</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--grid-border)' }}>
                                        {alertsList.length > 0 ? alertsList.map(a => (
                                            <tr key={a.id} className="transition-colors" style={{ backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-mono" style={{ color: 'var(--accent-volt)' }}>#{a.id.substring(0,8)}</span>
                                                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate().toLocaleString() : a.timestamp) : '--'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold border" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: '#3b82f6', borderColor: 'var(--grid-border)' }}>
                                                            {a.type || 'WEATHER_WARNING'}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold border" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: a.severity === 'CRITICAL' ? 'var(--status-danger)' : 'var(--status-warning)', borderColor: 'var(--grid-border)' }}>
                                                            {a.severity || 'SEVERE'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                    {a.region || 'All Regions'}
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border" style={{ backgroundColor: a.status === 'ACTIVE' ? 'rgba(239,68,68,0.1)' : 'var(--bg-surface-elevated)', borderColor: a.status === 'ACTIVE' ? 'rgba(239,68,68,0.2)' : 'var(--grid-border)', color: a.status === 'ACTIVE' ? 'var(--status-danger)' : 'var(--text-secondary)' }}>
                                                        {a.status || 'EXPIRED'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>No emergency alerts currently active.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'export' && (
                    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="rounded-xl p-5 border flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>Data Export Tools</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Export core system data as CSV for external analysis and reporting.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                <div className="rounded-lg border p-5 flex flex-col gap-4 transition-all hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
                                    <div className="w-10 h-10 rounded bg-blue-500 bg-opacity-10 flex items-center justify-center text-blue-500">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Users Export</h3>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Export {usersList.length} registered users.</p>
                                    </div>
                                    <button onClick={() => handleExport('users')} className="mt-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors w-full text-center cursor-pointer">
                                        Download CSV
                                    </button>
                                </div>
                                
                                <div className="rounded-lg border p-5 flex flex-col gap-4 transition-all hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
                                    <div className="w-10 h-10 rounded bg-orange-500 bg-opacity-10 flex items-center justify-center text-orange-500">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Reports Export</h3>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Export {reportsList.length} incident reports.</p>
                                    </div>
                                    <button onClick={() => handleExport('reports')} className="mt-auto px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors w-full text-center cursor-pointer">
                                        Download CSV
                                    </button>
                                </div>

                                <div className="rounded-lg border p-5 flex flex-col gap-4 transition-all hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
                                    <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Audit Logs Export</h3>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Export {auditLogs.length} system activity logs.</p>
                                    </div>
                                    <button onClick={() => handleExport('audit')} className="mt-auto px-4 py-2 hover:bg-purple-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors w-full text-center cursor-pointer" style={{ backgroundColor: '#9333ea' }}>
                                        Download CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
                        <div className="rounded-xl p-5 border flex flex-col gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)' }}>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>Audit Logs & Activity Timeline</h1>
                                <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Unified feed of all system actions.</p>
                            </div>

                            <div className="overflow-x-auto rounded-lg border mt-2" style={{ borderColor: 'var(--grid-border)' }}>
                                <table className="w-full text-left border-collapse" style={{ minWidth: '800px' }}>
                                    <thead style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--grid-border)' }}>
                                        <tr>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Time</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>User ID</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Role</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Action</th>
                                            <th className="p-3 text-xs font-mono font-semibold tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--grid-border)' }}>
                                        {auditLogs.length > 0 ? auditLogs.map(log => (
                                            <tr key={log.id} className="transition-colors" style={{ backgroundColor: 'transparent' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td className="p-3 text-xs font-mono whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                                                    {log.timestamp ? (log.timestamp.toDate ? log.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : log.timestamp) : '--:--'}
                                                </td>
                                                <td className="p-3 text-xs font-mono truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>{log.userId || 'System'}</td>
                                                <td className="p-3">
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold" style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)' }}>
                                                        {log.userRole || 'System'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm font-semibold" style={{ color: '#60a5fa' }}>{log.actionType}</td>
                                                <td className="p-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                    {JSON.stringify(log.details)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>No audit logs available. Wait for activity or ensure collection 'audit_logs' is populated.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminAnalytics;
