/**
 * Calculates a flood risk score (0-100) based on atmospheric pressure.
 * Low pressure indicates storm systems (cyclones/hurricanes) which bring intense rain and storm surges.
 * @param {number} pressure - Atmospheric pressure in hPa
 * @returns {number} Score from 0 to 100
 */
export const calculatePressureScore = (pressure) => {
  if (pressure === undefined || pressure === null || pressure <= 0) return 0;
  
  // Standard atmospheric pressure is ~1013 hPa.
  // < 980 hPa indicates a severe storm/cyclone (Score 100)
  // 980 - 1000 hPa indicates depression/rain (60-90)
  // 1000 - 1010 hPa indicates unstable weather (30-60)
  // > 1010 hPa indicates fair weather (0-30)
  
  if (pressure < 980) return 100;
  if (pressure > 1020) return 0;
  
  // Inverse relationship: lower pressure = higher risk
  const normalized = 1 - ((pressure - 980) / (1020 - 980));
  return Math.min(100, Math.round(normalized * 100));
};
