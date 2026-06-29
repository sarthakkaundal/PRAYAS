/**
 * Calculates a flood risk score (0-100) based on rainfall intensity.
 * @param {number} rainfall1h - Rainfall in the last 1 hour (mm)
 * @param {number} rainfall3h - Rainfall in the last 3 hours (mm)
 * @returns {number} Score from 0 to 100
 */
export const calculateRainfallScore = (rainfall1h, rainfall3h) => {
  let rainfall = 0;
  
  if (rainfall1h !== undefined && rainfall1h !== null) {
    rainfall = rainfall1h;
  } else if (rainfall3h !== undefined && rainfall3h !== null) {
    // Approximate 1h rainfall from 3h
    rainfall = rainfall3h / 3;
  }
  
  // Scoring logic
  // < 2mm/h is minor (0-10)
  // 2 - 10mm/h is moderate (10-40)
  // 10 - 50mm/h is heavy (40-90)
  // > 50mm/h is violent (100)
  
  if (rainfall <= 0) return 0;
  if (rainfall > 50) return 100;
  
  return Math.min(100, Math.round((rainfall / 50) * 100));
};
