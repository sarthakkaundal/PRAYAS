import { CONTEXT_WEIGHTS } from '../constants/predictionWeights';

/**
 * Computes soil saturation based on historical recent observations.
 * Note: Since Open-Meteo Archive might have a few days lag, we approximate using the most recent data available in the payload.
 * If live recent data is available, it should be passed in.
 */
export const calculateSoilSaturation = (recentRainfallData) => {
  // recentRainfallData expected to be an array of daily precipitation sums for the last 30 days
  if (!recentRainfallData || recentRainfallData.length === 0) {
    return { soilSaturationEstimate: 0, rollingRainfall: { day3: 0, day7: 0, day14: 0, day30: 0 } };
  }

  // Ensure data is sorted oldest to newest
  const days = recentRainfallData.length;
  
  const getSum = (daysBack) => {
    const startIndex = Math.max(0, days - daysBack);
    return recentRainfallData.slice(startIndex).reduce((sum, val) => sum + (val || 0), 0);
  };

  const day3 = getSum(3);
  const day7 = getSum(7);
  const day14 = getSum(14);
  const day30 = getSum(30);

  const w = CONTEXT_WEIGHTS.SOIL_SATURATION;
  const soilSaturationEstimate = (day3 * w.DAY_3) + (day7 * w.DAY_7) + (day14 * w.DAY_14) + (day30 * w.DAY_30);

  return {
    soilSaturationEstimate,
    rollingRainfall: { day3, day7, day14, day30 }
  };
};
