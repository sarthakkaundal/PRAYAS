import { CONTEXT_WEIGHTS } from '../constants/predictionWeights';

/**
 * Applies dynamic risk modifiers based on historical context.
 */
export const applyRiskModifiers = (baseScores, predictionContext) => {
  const { rainfall, humidity, pressure, wind, cloud } = baseScores;
  
  if (!predictionContext) {
    return {
      modifiedScores: baseScores,
      soilSaturationModifier: 0
    };
  }

  const { rainfallDeviation, rainfallPercentile, pressureDeviation, soilSaturationEstimate } = predictionContext;
  const { DEVIATION_MODIFIERS, THRESHOLDS } = CONTEXT_WEIGHTS;

  let modRainfall = rainfall;
  let modPressure = pressure;
  let soilSaturationModifier = 0;

  // Rainfall modifier based on deviation & percentile
  if (rainfallPercentile > THRESHOLDS.RAINFALL_PERCENTILE_EXTREME) {
    modRainfall *= DEVIATION_MODIFIERS.RAINFALL_EXTREME;
  } else if (rainfallPercentile > THRESHOLDS.RAINFALL_PERCENTILE_HIGH || rainfallDeviation > 100) {
    modRainfall *= DEVIATION_MODIFIERS.RAINFALL_HIGH;
  }

  // Pressure modifier based on historical drop
  if (pressureDeviation < -2) { // 2% below historical average is significant for pressure
    modPressure *= DEVIATION_MODIFIERS.PRESSURE_LOW;
  }

  // Soil saturation directly adds to overall risk as it represents existing ground condition
  if (soilSaturationEstimate > THRESHOLDS.SOIL_SATURATION_EXTREME) {
    soilSaturationModifier = 20;
  } else if (soilSaturationEstimate > THRESHOLDS.SOIL_SATURATION_HIGH) {
    soilSaturationModifier = 10;
  }

  return {
    modifiedScores: {
      rainfall: Math.min(100, modRainfall),
      humidity,
      pressure: Math.min(100, modPressure),
      wind,
      cloud
    },
    soilSaturationModifier
  };
};
