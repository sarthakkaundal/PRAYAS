/**
 * Calculate deviations between current and historical weather.
 */
export const calculateWeatherDeviation = (currentData, climateStats) => {
  if (!climateStats) return null;

  // Safely extract current metrics
  const currentRainfall = currentData.rain ? (currentData.rain['1h'] || currentData.rain['3h'] || 0) : 0;
  const currentHumidity = currentData.main ? currentData.main.humidity : 0;
  const currentPressure = currentData.main ? currentData.main.pressure : 1013;
  const currentWindSpeed = currentData.wind ? currentData.wind.speed : 0;

  // Calculate percentage deviations
  const calcDev = (current, avg) => avg > 0 ? ((current - avg) / avg) * 100 : 0;

  const rainfallDeviation = calcDev(currentRainfall, climateStats.monthlyAverageRainfall);
  const humidityDeviation = calcDev(currentHumidity, climateStats.monthlyAverageHumidity);
  const pressureDeviation = calcDev(currentPressure, climateStats.monthlyAveragePressure);
  const windDeviation = calcDev(currentWindSpeed, climateStats.monthlyAverageWindSpeed);

  // Calculate rainfall percentile
  let rainfallPercentile = 0;
  if (climateStats.rainfallObservations && climateStats.rainfallObservations.length > 0) {
    const sorted = [...climateStats.rainfallObservations].sort((a, b) => (a || 0) - (b || 0));
    const index = sorted.findIndex(r => r >= currentRainfall);
    if (index === -1) {
      rainfallPercentile = 100; // higher than all historical records
    } else {
      rainfallPercentile = (index / sorted.length) * 100;
    }
  }

  return {
    rainfallDeviation,
    humidityDeviation,
    pressureDeviation,
    windDeviation,
    rainfallPercentile
  };
};
