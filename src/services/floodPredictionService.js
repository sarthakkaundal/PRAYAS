import { FACTOR_WEIGHTS } from '../constants/floodWeights';
import { getRiskCategory } from '../constants/riskLevels';
import { calculateRainfallScore } from '../utils/rainfallScore';
import { calculateHumidityScore } from '../utils/humidityScore';
import { calculatePressureScore } from '../utils/pressureScore';
import { calculateWindScore } from '../utils/windScore';
import { calculateCloudScore } from '../utils/cloudScore';
import { applyRiskModifiers } from '../utils/riskModifiers';
import { generateContextualExplanation } from '../utils/predictionExplanation';

/**
 * Main prediction engine: evaluates live weather data to return a flood risk profile.
 * Now context-aware: consumes processed historical intelligence via PredictionContext.
 */
export const calculateFloodRisk = (weatherData, predictionContext = null) => {
  if (!weatherData) {
    return {
      score: 0,
      level: "Unknown",
      confidence: "0%",
      explanation: "No weather data available.",
      recommendations: ["Check connection or API keys"],
      contributors: [],
      context: null,
      color: "var(--text-secondary)"
    };
  }

  // Extract variables safely
  const rain1h = weatherData.rain ? weatherData.rain['1h'] : 0;
  const rain3h = weatherData.rain ? weatherData.rain['3h'] : 0;
  const humidity = weatherData.main ? weatherData.main.humidity : 0;
  const pressure = weatherData.main ? weatherData.main.pressure : 1013;
  const windSpeed = weatherData.wind ? weatherData.wind.speed : 0;
  const clouds = weatherData.clouds ? weatherData.clouds.all : 0;

  // Calculate individual heuristic base scores
  const baseScores = {
    rainfall: calculateRainfallScore(rain1h, rain3h),
    humidity: calculateHumidityScore(humidity),
    pressure: calculatePressureScore(pressure),
    wind: calculateWindScore(windSpeed),
    cloud: calculateCloudScore(clouds)
  };

  // Apply risk modifiers based on historical context
  const { modifiedScores, soilSaturationModifier } = applyRiskModifiers(baseScores, predictionContext);

  // Combine scores using configured weights
  const weightedScore = 
    (modifiedScores.rainfall * FACTOR_WEIGHTS.RAINFALL) +
    (modifiedScores.humidity * FACTOR_WEIGHTS.HUMIDITY) +
    (modifiedScores.pressure * FACTOR_WEIGHTS.PRESSURE) +
    (modifiedScores.wind * FACTOR_WEIGHTS.WIND) +
    (modifiedScores.cloud * FACTOR_WEIGHTS.CLOUD) + 
    (soilSaturationModifier || 0);

  const finalScore = Math.min(100, Math.round(weightedScore));

  // Determine risk category
  const category = getRiskCategory(finalScore);
  
  // Generate advanced explainable AI text using both current + historical context
  const xai = generateContextualExplanation(modifiedScores, finalScore, category.level, predictionContext);

  // Dynamic confidence calculation based on data availability
  let confidence = 65; // Base confidence with just live weather
  if (predictionContext) confidence += 20; // High confidence if historical context is applied
  // Future: +5 for soil sensors, +10 for ML models...

  return {
    score: finalScore,
    level: category.level,
    confidence: `${confidence}%`,
    explanation: xai.primaryExplanation,
    recommendations: category.recommendations,
    contributors: xai.secondaryFactors,
    context: predictionContext,
    xai: xai, // Keeping backward compatibility if UI needs it
    factors: {
      rainfall: rain1h || rain3h || 0,
      humidity,
      pressure,
      windSpeed
    },
    color: category.color
  };
};

/**
 * Generates an array of historical/projected risk points for the trend chart.
 * Uses the current score as a baseline and simulates a small trend based on pressure (falling pressure = rising risk).
 */
export const generateTrendData = (currentScore, pressure) => {
  const trend = [];
  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
  let simulatedScore = Math.max(10, currentScore - 15); // Start lower and approach current
  
  // If pressure is low, risk is rising. If high, risk is dropping.
  const modifier = pressure < 1000 ? 5 : (pressure > 1015 ? -2 : 2);

  for (let i = 0; i < hours.length; i++) {
    // Last point is exactly the current live score
    if (i === hours.length - 1) {
      trend.push({ time: hours[i], prob: currentScore });
    } else {
      trend.push({ time: hours[i], prob: Math.max(0, Math.min(100, simulatedScore)) });
      simulatedScore += modifier + Math.floor(Math.random() * 5); // Add slight noise
    }
  }

  return trend;
};
