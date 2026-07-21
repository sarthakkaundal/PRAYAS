import React, { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import logo from "./LOGO.jpg"; 
import { logAuditAction } from "../../services/telemetryService";

export default function AuthPage({ setUserLoggedIn }) {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleTab = (tab) => {
    setError("");
    setActiveTab(tab);
    setEmail(""); setPassword(""); setFirstName(""); setLastName(""); setPhone("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Auto-migrate existing users from Realtime DB to Firestore
      let userRole = "Citizen";
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            role: "Citizen",
            firstName: "Migrated",
            lastName: "User",
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          });
        } else {
          userRole = userDocSnap.data().role || "Citizen";
          await updateDoc(userDocRef, {
            lastLogin: serverTimestamp()
          });
        }
      } catch (migrationErr) {
        console.error("Migration check failed:", migrationErr);
      }

      logAuditAction(user.uid, userRole, 'USER_LOGIN', { email: user.email });
      setUserLoggedIn(true);
      setError("");
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        phone,
        email: user.email,
        role: "Citizen",
        createdAt: new Date().toISOString(),
      });
      logAuditAction(user.uid, 'Citizen', 'USER_REGISTER', { email: user.email, firstName, lastName });
      setUserLoggedIn(true);
      setError("");
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
    setLoading(false);
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

  const inputFocusHandlers = {
    onFocus: (e) => {
      e.target.style.borderColor = 'var(--accent-volt)';
      e.target.style.boxShadow = '0 0 0 3px var(--accent-volt-dim)';
    },
    onBlur: (e) => {
      e.target.style.borderColor = 'var(--grid-border)';
      e.target.style.boxShadow = 'none';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <div style={{
        display: 'flex',
        gap: '0',
        maxWidth: '900px',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--grid-border)',
        boxShadow: 'var(--shadow-elevated)',
        backgroundColor: 'var(--bg-surface)',
      }}>

        {/* Left Branding Panel — Palantir-style cinematic */}
        <div style={{
          flex: '1',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'var(--bg-base)',
          borderRight: '1px solid var(--grid-border)',
          textAlign: 'center',
          minWidth: '0',
        }} className="hidden md:flex">
          
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: '28px',
            border: '2px solid var(--grid-border)',
          }}>
            <img 
              src={logo} 
              alt="PRAYAS Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '12px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>PRAYAS</h1>

          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
          }}>
            Disaster Intelligence Platform
          </p>

          <div style={{
            width: '40px',
            height: '1px',
            backgroundColor: 'var(--grid-border)',
            marginBottom: '24px',
          }}></div>

          <p style={{
            fontSize: '13px',
            lineHeight: '1.7',
            color: 'var(--text-secondary)',
            maxWidth: '280px',
          }}>
            Real-time flood prediction, GIS mapping, and emergency coordination for disaster management across India.
          </p>
        </div>

        {/* Right Auth Form — Linear-style clean */}
        <div style={{
          flex: '1',
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minWidth: '0',
        }}>
          
          {/* Tab Toggle — Linear pill style */}
          <div style={{
            display: 'flex',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-base)',
            marginBottom: '28px',
            border: '1px solid var(--grid-border)',
          }}>
            <button
              onClick={() => toggleTab("login")}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                backgroundColor: activeTab === "login" ? 'var(--bg-surface-elevated)' : 'transparent',
                color: activeTab === "login" ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === "login" ? 'var(--shadow-card)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => toggleTab("signup")}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                backgroundColor: activeTab === "signup" ? 'var(--bg-surface-elevated)' : 'transparent',
                color: activeTab === "signup" ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === "signup" ? 'var(--shadow-card)' : 'none',
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error Message — Palantir-style danger strip */}
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239,68,68,0.08)',
              borderLeft: '3px solid var(--status-danger)',
              color: 'var(--status-danger)',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  {...inputFocusHandlers}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{...inputStyle, paddingRight: '40px'}}
                    {...inputFocusHandlers}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.688-1.55c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-volt)',
                  color: 'var(--text-inverse)',
                  fontWeight: '600',
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  marginTop: '4px',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseOver={(e) => { if (!loading) e.target.style.boxShadow = 'var(--shadow-glow-volt)'; }}
                onMouseOut={(e) => { e.target.style.boxShadow = 'none'; }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Don't have an account?{' '}
                <span
                  onClick={() => toggleTab("signup")}
                  style={{ color: 'var(--accent-volt)', cursor: 'pointer', fontWeight: '600' }}
                >
                  Create one
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>First Name</label>
                  <input type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} {...inputFocusHandlers} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Last Name</label>
                  <input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} {...inputFocusHandlers} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email Address</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} {...inputFocusHandlers} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone Number</label>
                <input type="tel" placeholder="+91 ..." value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} {...inputFocusHandlers} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{...inputStyle, paddingRight: '40px'}} {...inputFocusHandlers} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.688-1.55c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" /></svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-volt)',
                  color: 'var(--text-inverse)',
                  fontWeight: '600',
                  cursor: loading ? 'wait' : 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  marginTop: '4px',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseOver={(e) => { if (!loading) e.target.style.boxShadow = 'var(--shadow-glow-volt)'; }}
                onMouseOut={(e) => { e.target.style.boxShadow = 'none'; }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Already have an account?{' '}
                <span
                  onClick={() => toggleTab("login")}
                  style={{ color: 'var(--accent-volt)', cursor: 'pointer', fontWeight: '600' }}
                >
                  Sign in
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}