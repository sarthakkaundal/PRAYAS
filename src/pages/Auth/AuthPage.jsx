import React, { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import logo from "./LOGO.jpg"; 

export default function AuthPage({ setUserLoggedIn }) {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleTab = (tab) => {
    setError("");
    setActiveTab(tab);
    setEmail(""); setPassword(""); setFirstName(""); setLastName(""); setPhone("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
      const database = getDatabase();
      await set(ref(database, "users/" + user.uid), {
        firstName,
        lastName,
        phone,
        email: user.email,
        createdAt: new Date().toISOString(),
      });
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
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                  {...inputFocusHandlers}
                />
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
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} {...inputFocusHandlers} />
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