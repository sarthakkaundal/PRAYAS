import React, { useState, useEffect } from 'react';
import { db } from '../pages/Auth/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const AlertBanner = () => {
    const [alerts, setAlerts] = useState([]);
    const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

    useEffect(() => {
        const q = query(collection(db, 'alerts'), where('status', '==', 'ACTIVE'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activeAlerts = [];
            snapshot.forEach(doc => {
                activeAlerts.push({ id: doc.id, ...doc.data() });
            });
            // Sort by severity (CRITICAL/EXTREME first)
            activeAlerts.sort((a, b) => {
                const severityVal = { EXTREME: 4, CRITICAL: 3, HIGH: 2, WARNING: 2, INFO: 1 };
                return (severityVal[b.severity] || 0) - (severityVal[a.severity] || 0);
            });
            setAlerts(activeAlerts);
        }, (err) => {
            console.error("Error fetching alerts:", err);
        });

        return () => unsubscribe();
    }, []);

    const handleDismiss = (alertId) => {
        setDismissedAlerts(prev => {
            const newSet = new Set(prev);
            newSet.add(alertId);
            return newSet;
        });
    };

    const visibleAlerts = alerts.filter(a => !dismissedAlerts.has(a.id));

    if (visibleAlerts.length === 0) return null;

    return (
        <div className="fixed top-16 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none mt-2 px-4 gap-2">
            {visibleAlerts.map(alert => {
                const isCritical = alert.severity === 'CRITICAL' || alert.severity === 'EXTREME';
                const isWarning = alert.severity === 'WARNING' || alert.severity === 'HIGH';
                
                const bgColor = isCritical ? 'rgba(239, 68, 68, 0.95)' : isWarning ? 'rgba(245, 158, 11, 0.95)' : 'rgba(59, 130, 246, 0.95)';
                const borderColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6';
                
                return (
                    <div 
                        key={alert.id}
                        className="pointer-events-auto flex w-full max-w-4xl items-center justify-between p-3 rounded-lg shadow-lg border backdrop-blur-md animate-in slide-in-from-top-2"
                        style={{ backgroundColor: bgColor, borderColor: borderColor }}
                    >
                        <div className="flex items-center gap-3 text-white overflow-hidden">
                            {isCritical ? (
                                <svg className="w-6 h-6 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <div className="flex flex-col">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">
                                    {alert.type || 'EMERGENCY ALERT'} • {alert.region || 'ALL REGIONS'}
                                </span>
                                <span className="text-sm font-semibold truncate mt-0.5">{alert.message}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDismiss(alert.id)}
                            className="p-1 rounded-md hover:bg-black/20 text-white transition-colors cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default AlertBanner;
