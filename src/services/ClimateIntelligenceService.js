import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../pages/Auth/firebase';
import { calculateClimateStatistics } from '../utils/climateStatistics';

const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

const fetchMonthDataForYear = async (lat, lon, year, monthStr) => {
  // Determine days in month
  const daysInMonth = new Date(year, parseInt(monthStr, 10), 0).getDate();
  const startDate = `${year}-${monthStr}-01`;
  const endDate = `${year}-${monthStr}-${daysInMonth}`;
  
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=precipitation_sum,wind_speed_10m_max&hourly=relative_humidity_2m,surface_pressure&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch historical data');
  const data = await response.json();
  
  // Average hourly data to daily to match format for stats calculation
  const getDailyAvg = (hourlyArr, hoursPerDay = 24) => {
    const daily = [];
    if (!hourlyArr) return daily;
    for (let i = 0; i < hourlyArr.length; i += hoursPerDay) {
      const chunk = hourlyArr.slice(i, i + hoursPerDay);
      const avg = chunk.reduce((a, b) => a + (b || 0), 0) / (chunk.length || 1);
      daily.push(avg);
    }
    return daily;
  };

  return {
    precipitation_sum: data.daily?.precipitation_sum || [],
    wind_speed_10m_max: data.daily?.wind_speed_10m_max || [],
    relative_humidity_2m_mean: getDailyAvg(data.hourly?.relative_humidity_2m),
    surface_pressure_mean: getDailyAvg(data.hourly?.surface_pressure)
  };
};

const fetchLast30DaysRainfall = async (lat, lon) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1); // yesterday
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 31);
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=precipitation_sum&timezone=auto`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.daily?.precipitation_sum || [];
  } catch (error) {
    console.error('Error fetching 30 day rainfall', error);
    return [];
  }
};

export const getClimateIntelligence = async (lat, lon) => {
  if (!lat || !lon) return null;

  const roundedLat = Number(lat).toFixed(2);
  const roundedLon = Number(lon).toFixed(2);
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentYear = now.getFullYear();
  const todayStr = now.toISOString().split('T')[0];

  const monthCacheKey = `${roundedLat}_${roundedLon}_${currentMonth}`;
  const docRef = doc(db, 'historicalClimate', monthCacheKey);
  
  let climateStats = null;
  let recentRainfallData = null;
  let needsUpdate = false;

  try {
    let docSnap = null;
    try {
      docSnap = await getDoc(docRef);
    } catch (e) {
      console.warn("Firestore cache read failed (possible permission issue). Bypassing cache:", e);
    }

    if (docSnap && docSnap.exists()) {
      const cachedData = docSnap.data();
      climateStats = cachedData.stats;
      
      if (cachedData.lastUpdatedRainfall === todayStr) {
        recentRainfallData = cachedData.recentRainfallData;
      } else {
        needsUpdate = true;
      }
    } else {
      needsUpdate = true;
    }

    if (needsUpdate) {
      if (!climateStats) {
        const promises = [];
        for (let i = 1; i <= 10; i++) {
          promises.push(fetchMonthDataForYear(lat, lon, currentYear - i, currentMonth));
        }
        
        const yearlyData = await Promise.all(promises);
        
        const aggregated = {
          precipitation_sum: [],
          wind_speed_10m_max: [],
          relative_humidity_2m_mean: [],
          surface_pressure_mean: []
        };
        
        yearlyData.forEach(yd => {
          aggregated.precipitation_sum.push(...(yd.precipitation_sum || []));
          aggregated.wind_speed_10m_max.push(...(yd.wind_speed_10m_max || []));
          aggregated.relative_humidity_2m_mean.push(...(yd.relative_humidity_2m_mean || []));
          aggregated.surface_pressure_mean.push(...(yd.surface_pressure_mean || []));
        });

        climateStats = calculateClimateStatistics(aggregated);
      }

      if (!recentRainfallData) {
        recentRainfallData = await fetchLast30DaysRainfall(lat, lon);
      }

      try {
        await setDoc(docRef, {
          stats: climateStats,
          recentRainfallData: recentRainfallData,
          lastUpdatedRainfall: todayStr,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore cache write failed. Proceeding without caching:", e);
      }
    }

    return {
      climateStats,
      recentRainfallData
    };
  } catch (error) {
    console.error("Error in ClimateIntelligenceService:", error);
    return null;
  }
};
