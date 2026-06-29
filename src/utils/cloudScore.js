/**
 * Calculates a flood risk score (0-100) based on cloud cover.
 * Heavy cloud cover limits evaporation and suggests sustained weather.
 * @param {number} clouds - Cloud cover percentage (0-100)
 * @returns {number} Score from 0 to 100
 */
export const calculateCloudScore = (clouds) => {
  if (clouds === undefined || clouds === null) return 0;
  
  const c = Math.max(0, Math.min(100, clouds));
  
  // Scoring logic
  // < 30% is mostly clear (0-20)
  // 30 - 70% is partly cloudy (20-50)
  // 70 - 100% is overcast (50-100)
  
  return Math.round(c);
};
