import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ userDoc, allowedRoles, children }) => {
  if (!userDoc) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userDoc.role)) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="mb-6 p-4 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
          <svg className="w-12 h-12" style={{ color: 'var(--status-danger)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Access Restricted</h2>
        <p className="max-w-md font-mono text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Your current role ({userDoc.role}) does not have permission to view this page. If you believe this is an error, please contact a Regional Administrator.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
