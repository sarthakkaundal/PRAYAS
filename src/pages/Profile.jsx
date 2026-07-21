import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './Auth/firebase';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportsSubmitted, setReportsSubmitted] = useState(0);
  const [reportsVerified, setReportsVerified] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    let unsubSubmitted = () => {};
    let unsubVerified = () => {};
    let unsubActivity = () => {};

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubSubmitted();
      unsubVerified();
      unsubActivity();
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const snapshot = await getDoc(userRef);
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }

        // Fetch reports stats
        const qSubmitted = query(collection(db, 'reports'), where('reportedBy', '==', user.uid));
        unsubSubmitted = onSnapshot(qSubmitted, (snapshot) => {
          setReportsSubmitted(snapshot.size);
        });

        const qVerified = query(collection(db, 'reports'), where('verifiedBy', '==', user.uid));
        unsubVerified = onSnapshot(qVerified, (snapshot) => {
          setReportsVerified(snapshot.size);
        });

        // Fetch activity logs
        const qActivity = query(collection(db, 'audit_logs'), where('userId', '==', user.uid));
        unsubActivity = onSnapshot(qActivity, (snapshot) => {
          const logs = [];
          snapshot.forEach(doc => logs.push({ id: doc.id, ...doc.data() }));
          // Sort client-side if no index, else order by timestamp desc
          logs.sort((a, b) => {
            const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
            const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
            return timeB - timeA;
          });
          setActivityLogs(logs.slice(0, 10)); // keep last 10
        });

      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubSubmitted();
      unsubVerified();
      unsubActivity();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <div className="flex items-center gap-3 font-mono text-sm" style={{ color: 'var(--accent-volt)' }}>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Loading profile...
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-12">
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No profile data found</p>
      </div>
    );
  }

  const badges = [
    { name: 'First Aid L1', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: '#ef4444', active: true },
    { name: 'Comms Ops', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: '#3b82f6', active: true },
    { name: 'Water Rescue', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', color: '#14b8a6', active: false },
    { name: 'Logistics', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z', color: '#f97316', active: false },
  ];

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="opacity-0 animate-in">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>01</span>
          <span className="font-mono text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>User Profile</span>
        </div>
        <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">Operative Profile</h1>
          <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Citizen & Volunteer Portal</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ID Card — Palantir credential style */}
        <div className="lg:col-span-1 opacity-0 animate-in" style={{ animationDelay: '0.05s' }}>
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-elevated)' }}>
            
            {/* Card Header — gradient */}
            <div className="p-5 flex justify-between items-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, var(--bg-base) 100%)', borderBottom: '1px solid var(--grid-border)' }}>
              <div>
                <h2 className="font-mono text-[10px] tracking-wider uppercase font-semibold" style={{ color: '#14b8a6' }}>PRAYAS Identity</h2>
                <div className="font-mono text-[9px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>ID #{auth.currentUser?.uid?.substring(0, 8)}</div>
              </div>
              <div className="w-10 h-10 rounded-lg flex justify-center items-center" style={{ backgroundColor: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)' }}>
                <svg className="w-5 h-5" fill="none" stroke="#14b8a6" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
            </div>

            {/* Avatar + Name */}
            <div className="p-6 flex flex-col items-center border-b" style={{ borderColor: 'var(--grid-border)', backgroundColor: 'var(--bg-base)' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-xl font-bold" style={{ backgroundColor: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: '2px solid rgba(20,184,166,0.2)' }}>
                {userData.firstName?.[0]}{userData.lastName?.[0]}
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{userData.firstName} {userData.lastName}</h3>
              <span className="font-mono text-[10px] mt-1.5 px-2.5 py-0.5 rounded-full tracking-wider uppercase" style={{ backgroundColor: 'var(--accent-volt-dim)', color: 'var(--accent-volt)', border: '1px solid rgba(204,255,0,0.15)' }}>{userData.role || 'Citizen'}</span>
            </div>

            {/* Details */}
            <div className="p-5 flex flex-col gap-4">
              {[
                { label: 'Email', value: userData.email },
                { label: 'Phone', value: userData.phone || 'Not provided' },
                { label: 'Member Since', value: new Date(userData.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'Last Login', value: userData.lastLogin ? (userData.lastLogin.toDate ? userData.lastLogin.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date(userData.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})) : 'Unknown' },
                { label: 'Reports Submitted', value: reportsSubmitted.toString() },
                ...(userData.role !== 'Citizen' ? [{ label: 'Reports Verified', value: reportsVerified.toString() }] : [])
              ].map((item, i) => (
                <div key={i}>
                  <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.label}</div>
                  <div className="text-sm font-medium font-mono truncate" style={{ color: 'var(--text-primary)' }} title={item.value}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Activity Statistics */}
            <div className="p-5 border-t" style={{ borderColor: 'var(--grid-border)' }}>
              <h2 className="text-[10px] font-mono tracking-wider uppercase font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                Recent Activity
              </h2>
              <div className="flex flex-col gap-3">
                {activityLogs.length > 0 ? activityLogs.map(log => (
                  <div key={log.id} className="flex gap-2 items-start border-b pb-2 last:border-0 last:pb-0" style={{ borderColor: 'var(--grid-border)' }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: 'var(--accent-volt)' }}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{log.actionType}</span>
                        <span className="font-mono text-[8px]" style={{ color: 'var(--text-tertiary)' }}>
                          {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center font-mono text-[9px]" style={{ color: 'var(--text-tertiary)' }}>No recent activity.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          
          {/* Deployment Status */}
          <div className="opacity-0 animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-volt)' }}></div>
                Current Status
              </h2>
              
              <div className="rounded-lg p-5 flex flex-col md:flex-row gap-5 items-start md:items-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--grid-border)' }}>
                <div className="absolute right-0 top-0 h-full w-1" style={{ backgroundColor: 'var(--accent-volt)' }}></div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-volt-dim)', border: '1px solid rgba(204,255,0,0.12)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-volt)' }} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-1" style={{ color: 'var(--accent-volt)' }}>Standby — Local Sector</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    You are in a designated safe zone. Awaiting further instructions. Keep communication channels open.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications — Linear-style badges */}
          <div className="opacity-0 animate-in" style={{ animationDelay: '0.15s' }}>
            <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Certifications & Capabilities
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center p-4 rounded-lg border transition-all duration-200"
                    style={{
                      backgroundColor: badge.active ? `${badge.color}08` : 'var(--bg-base)',
                      borderColor: badge.active ? `${badge.color}20` : 'var(--grid-border)',
                      opacity: badge.active ? 1 : 0.4,
                      filter: badge.active ? 'none' : 'grayscale(1)',
                      cursor: badge.active ? 'default' : 'not-allowed',
                    }}
                    onMouseOver={(e) => { if (badge.active) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${badge.color}15`; }}}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <svg className="w-7 h-7 mb-2.5" fill="none" stroke={badge.active ? badge.color : 'var(--text-secondary)'} viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={badge.icon}></path></svg>
                    <span className="text-[10px] font-mono text-center uppercase tracking-wider font-semibold" style={{ color: 'var(--text-primary)' }}>{badge.name}</span>
                    {!badge.active && <span className="text-[8px] font-mono mt-1" style={{ color: 'var(--text-tertiary)' }}>Locked</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
