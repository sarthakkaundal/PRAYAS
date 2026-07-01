import { FACTOR_WEIGHTS } from '../constants/floodWeights';
import { getRiskCategory } from '../constants/riskLevels';
import { calculateRainfallScore } from '../utils/rainfallScore';
import { calculateHumidityScore } from '../utils/humidityScore';
import { calculatePressureScore } from '../utils/pressureScore';
import { calculateWindScore } from '../utils/windScore';
import { calculateCloudScore } from '../utils/cloudScore';

/**
 * Generates an explanation based on the top contributing risk factors.
 */
const generateXAI = (scores, finalScore, categoryLevel) => {
  if (finalScore < 20) {
    return {
      primaryDriver: "None",
      primaryExplanation: "Stable atmospheric conditions and minimal precipitation indicate a safe environment.",
      secondaryFactors: []
    };
  }

  const contributions = [
    { name: "Heavy Rainfall", value: scores.rainfall * FACTOR_WEIGHTS.RAINFALL, desc: "recent intense precipitation" },
    { name: "Low Pressure", value: scores.pressure * FACTOR_WEIGHTS.PRESSURE, desc: "a cyclonic/low-pressure system" },
    { name: "High Humidity", value: scores.humidity * FACTOR_WEIGHTS.HUMIDITY, desc: "highly saturated atmospheric moisture" },
    { name: "Strong Winds", value: scores.wind * FACTOR_WEIGHTS.WIND, desc: "high wind speeds" },
    { name: "Cloud Cover", value: scores.cloud * FACTOR_WEIGHTS.CLOUD, desc: "dense storm clouds" }
  ];

  contributions.sort((a, b) => b.value - a.value);

  const primary = contributions[0];
  const secondary = contributions.slice(1).filter(c => c.value > 5).map(c => c.name);

  return {
    primaryDriver: primary.name,
    primaryExplanation: `${primary.name} (${primary.desc}) is the most significant factor driving the current ${categoryLevel} risk level.`,
    secondaryFactors: secondary
  };
};

/**
 * Main prediction engine: evaluates live weather data to return a flood risk profile.
 */
export const calculateFloodRisk = (weatherData) => {
  if (!weatherData) {
    return {
      score: 0,
      level: "Unknown",
      confidence: "0%",
      explanation: "No weather data available.",
      factors: {},
      recommendations: ["Check connection or API keys"],
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

  // Calculate individual heuristic scores
  const scores = {
    rainfall: calculateRainfallScore(rain1h, rain3h),
    humidity: calculateHumidityScore(humidity),
    pressure: calculatePressureScore(pressure),
    wind: calculateWindScore(windSpeed),
    cloud: calculateCloudScore(clouds)
  };

  // Combine scores using configured weights
  const weightedScore = 
    (scores.rainfall * FACTOR_WEIGHTS.RAINFALL) +
    (scores.humidity * FACTOR_WEIGHTS.HUMIDITY) +
    (scores.pressure * FACTOR_WEIGHTS.PRESSURE) +
    (scores.wind * FACTOR_WEIGHTS.WIND) +
    (scores.cloud * FACTOR_WEIGHTS.CLOUD);

  const finalScore = Math.min(100, Math.round(weightedScore));

  // Determine risk category
  const category = getRiskCategory(finalScore);
  const xai = generateXAI(scores, finalScore, category.level);

  // Future inputs (e.g. riverLevel, soilMoisture) can be appended to factors and increase confidence
  return {
    score: finalScore,
    level: category.level,
    confidence: "65%", // Weather only
    explanation: xai.primaryExplanation,
    xai: xai,
    factors: {
      rainfall: rain1h || rain3h || 0,
      humidity,
      pressure,
      windSpeed
    },
    recommendations: category.recommendations,
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
