/**
 * Calculates a flood risk score (0-100) based on humidity.
 * High humidity limits evaporation of standing water.
 * @param {number} humidity - Relative humidity percentage (0-100)
 * @returns {number} Score from 0 to 100
 */
export const calculateHumidityScore = (humidity) => {
  if (humidity === undefined || humidity === null) return 0;
  
  const h = Math.max(0, Math.min(100, humidity));
  
  // Scoring logic
  // < 40% limits flood risk as water evaporates quickly (0-10)
  // 40% - 70% is normal (10-40)
  // 70% - 90% is humid (40-80)
  // > 90% is extreme, saturated air (80-100)
  
  if (h < 40) return 10;
  if (h > 90) return 100;
  
  return Math.min(100, Math.round(((h - 40) / 50) * 90) + 10);
};
