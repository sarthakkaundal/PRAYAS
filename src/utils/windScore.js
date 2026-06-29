/**
 * Calculates a flood risk score (0-100) based on wind speed.
 * High wind speeds can cause storm surges and block drainage.
 * @param {number} windSpeed - Wind speed in m/s (OpenWeatherMap default)
 * @returns {number} Score from 0 to 100
 */
export const calculateWindScore = (windSpeed) => {
  if (windSpeed === undefined || windSpeed === null) return 0;
  
  // Convert m/s to km/h for easier mental mapping if needed, 
  // but OpenWeatherMap returns m/s by default in standard mode, 
  // and metric mode returns m/s.
  // Let's assume input is m/s. 
  // 1 m/s = 3.6 km/h
  // < 5 m/s (18 km/h) = Low (0-20)
  // 5 - 15 m/s (18-54 km/h) = Moderate (20-60)
  // 15 - 25 m/s (54-90 km/h) = High (60-90)
  // > 25 m/s (90+ km/h) = Extreme storm (90-100)
  
  if (windSpeed < 2) return 5;
  if (windSpeed > 30) return 100;
  
  return Math.min(100, Math.round((windSpeed / 30) * 100));
};
