/**
 * Computes summary statistics from raw historical data.
 */
export const calculateClimateStatistics = (historicalData) => {
  if (!historicalData || !historicalData.time || historicalData.time.length === 0) {
    return null;
  }

  const rainfalls = historicalData.precipitation_sum || [];
  const humidities = historicalData.relative_humidity_2m_mean || [];
  const pressures = historicalData.surface_pressure_mean || [];
  const windSpeeds = historicalData.wind_speed_10m_max || [];

  const average = (arr) => arr.reduce((a, b) => a + (b || 0), 0) / (arr.length || 1);
  const max = (arr) => Math.max(...arr.map(v => v || 0));

  return {
    monthlyAverageRainfall: average(rainfalls),
    maxRainfall: max(rainfalls),
    monthlyAverageHumidity: average(humidities),
    monthlyAveragePressure: average(pressures),
    monthlyAverageWindSpeed: average(windSpeeds),
    rainfallObservations: rainfalls // useful for percentiles later
  };
};
