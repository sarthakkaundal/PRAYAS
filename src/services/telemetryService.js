import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../pages/Auth/firebase';

export const savePrediction = async (predictionResult, weatherData) => {
    try {
        const predictionsRef = collection(db, 'predictions');
        await addDoc(predictionsRef, {
            region: weatherData.name || 'Unknown Region',
            lat: weatherData.coord?.lat || null,
            lon: weatherData.coord?.lon || null,
            riskScore: predictionResult.score,
            riskLevel: predictionResult.level,
            confidence: 65, // Hardcoded for now based on engine limits
            weatherSnapshot: {
                temp: weatherData.main?.temp || null,
                humidity: weatherData.main?.humidity || null,
                pressure: weatherData.main?.pressure || null,
                rainfall: weatherData.rain ? (weatherData.rain['1h'] || weatherData.rain['3h'] || 0) : 0,
                wind: weatherData.wind?.speed || null,
                clouds: weatherData.clouds?.all || null
            },
            explanation: predictionResult.explanation,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving prediction telemetry:", error);
    }
};

export const generateAlert = async (predictionResult, weatherData) => {
    // Only generate alerts for High or Extreme risk
    if (predictionResult.level !== 'HIGH' && predictionResult.level !== 'EXTREME') {
        return;
    }

    try {
        const alertsRef = collection(db, 'alerts');
        await addDoc(alertsRef, {
            severity: predictionResult.level,
            region: weatherData.name || 'Unknown Region',
            lat: weatherData.coord?.lat || null,
            lon: weatherData.coord?.lon || null,
            riskScore: predictionResult.score,
            message: `Auto-generated alert: Flood risk is ${predictionResult.level} in ${weatherData.name || 'this region'}. Score: ${predictionResult.score}/100.`,
            status: 'Active',
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error generating alert telemetry:", error);
    }
};

export const logAuditAction = async (actorId, actorRole, action, details) => {
    try {
        const auditRef = collection(db, 'audit_logs');
        await addDoc(auditRef, {
            actorId: actorId || 'system',
            actorRole: actorRole || 'unknown',
            action: action,
            details: details,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error logging audit action:", error);
    }
};
