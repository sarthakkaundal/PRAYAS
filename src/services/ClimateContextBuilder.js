import { calculateWeatherDeviation } from '../utils/weatherDeviation';
import { calculateSoilSaturation } from '../utils/historicalAnalysis';

/**
 * Constructs a clean, processed PredictionContext object for the Prediction Engine.
 * Keeps the prediction engine unaware of the API sources or raw historical data.
 */
export const buildPredictionContext = (currentWeatherData, climateIntelligence) => {
  if (!currentWeatherData || !climateIntelligence) return null;

  const { climateStats, recentRainfallData } = climateIntelligence;

  // Calculate deviations based on the 10-year monthly averages
  const deviations = calculateWeatherDeviation(currentWeatherData, climateStats);
  
  // Calculate rolling accumulation and soil saturation estimate
  const soilSaturation = calculateSoilSaturation(recentRainfallData);

  // Return standardized context object
  return {
    rainfallDeviation: deviations ? deviations.rainfallDeviation : 0,
    rainfallPercentile: deviations ? deviations.rainfallPercentile : 0,
    humidityDeviation: deviations ? deviations.humidityDeviation : 0,
    pressureDeviation: deviations ? deviations.pressureDeviation : 0,
    windDeviation: deviations ? deviations.windDeviation : 0,
    seasonalAverage: climateStats ? {
      rainfall: climateStats.monthlyAverageRainfall,
      humidity: climateStats.monthlyAverageHumidity,
      pressure: climateStats.monthlyAveragePressure,
      windSpeed: climateStats.monthlyAverageWindSpeed
    } : {},
    rollingRainfall: soilSaturation.rollingRainfall,
    soilSaturationEstimate: soilSaturation.soilSaturationEstimate
  };
};
