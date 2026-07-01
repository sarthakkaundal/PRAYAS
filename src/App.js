import React, { useState, useEffect, Suspense, lazy } from 'react';
import { calculateFloodRisk, generateTrendData } from './services/floodPredictionService';
import { savePrediction, generateAlert } from './services/telemetryService';
import { getWeather, getWeatherByCity } from './services/weatherService';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { auth, db } from './pages/Auth/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import ProtectedRoute from './components/ProtectedRoute';

const Reports = lazy(() => import('./pages/Reports'));
const Map = lazy(() => import('./pages/Map'));
const Help = lazy(() => import('./pages/Help'));
const Fund = lazy(() => import('./pages/Fund'));
const Profile = lazy(() => import('./pages/Profile'));
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng, address: `${e.latlng.lat.toFixed(4)}°N, ${e.latlng.lng.toFixed(4)}°E` });
    },
  });
  return position.lat ? <Marker position={[position.lat, position.lng]} /> : null;
};

// ─── Gauge Component (ArcGIS-inspired) ──────────────────────────────
const RiskGauge = ({ value = 87, size = 160 }) => {
	const radius = 40;
	const circumference = Math.PI * radius;
	const fillPercent = value / 100;
	const offset = circumference * (1 - fillPercent);
	const color = value > 70 ? 'var(--status-danger)' : value > 40 ? 'var(--status-warning)' : 'var(--status-success)';

	return (
		<div className="relative flex flex-col items-center" style={{ width: size, height: size * 0.65 }}>
			<svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
				<path
					d="M 10 50 A 40 40 0 0 1 90 50"
					fill="none"
					stroke="var(--grid-border)"
					strokeWidth="6"
					strokeLinecap="round"
				/>
				<path
					d="M 10 50 A 40 40 0 0 1 90 50"
					fill="none"
					stroke={color}
					strokeWidth="6"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					style={{
						transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
						filter: `drop-shadow(0 0 6px ${color})`
					}}
				/>
			</svg>
			<div className="absolute bottom-0 flex flex-col items-center">
				<span className="text-4xl font-bold" style={{ color }}>{value}%</span>
			</div>
		</div>
	);
};

// ─── Header Component (Linear + Palantir) ──────────────────────────
const Header = ({ theme, toggleTheme, user }) => {
	const [currentTime, setCurrentTime] = useState('');
	const [isProfileHovered, setIsProfileHovered] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const currentPage = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);
	const isAdmin = user && (user.role === 'RegionalAdmin' || user.role === 'SuperAdmin');

	const handleLogout = async () => {
		try {
			await signOut(auth);
			navigate('/');
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			const dateOptions = {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			};
			const timeOptions = {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			};

			const dateStr = now.toLocaleDateString('en-CA', dateOptions);
			const timeStr = now.toLocaleTimeString('en-US', timeOptions);

			setCurrentTime(`${dateStr}  ·  ${timeStr}`);
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, []);

	const navItems = [
		{ path: '/report', label: 'Reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
		{ path: '/funds', label: 'Funds', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
		{ path: '/map', label: 'Map', icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11a2 2 0 100-4 2 2 0 000 4z' },
		{ path: '/help', label: 'Contact', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.5 4.5a1 1 0 01-.217 1.013l-2.1 2.1a11.042 11.042 0 005.516 5.516l2.1-2.1a1 1 0 011.013-.217l4.5 1.5a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z' },
	];

	if (isAdmin) {
		navItems.push({ path: '/admin', label: 'Admin', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' });
	}

	return (
		<header className="sticky top-0 z-[100] border-b border-grid" style={{ backgroundColor: 'var(--bg-surface)', backdropFilter: 'blur(16px)' }}>
			<div className="flex justify-between items-center h-16 px-6">
				{/* Logo & Time */}
				<div className="flex items-center gap-5">
					<Link to="/" className="flex items-center gap-3 no-underline" style={{ textDecoration: 'none', color: 'inherit' }}>
						<div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: 'var(--accent-volt)', color: 'var(--text-inverse)' }}>
							P
						</div>
						<span className="text-lg font-bold tracking-wide">PRAYAS</span>
					</Link>
					<div className="hidden md:block h-5 w-px" style={{ backgroundColor: 'var(--grid-border)' }}></div>
					<span className="hidden md:block font-mono text-xs" style={{ color: 'var(--text-tertiary)' }}>{currentTime}</span>
				</div>

				{/* Nav Items — Linear-style pills */}
				<nav className="flex items-center gap-1">
					{currentPage !== 'dashboard' && (
						<Link
							to="/"
							className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 no-underline"
							style={{
								textDecoration: 'none',
								color: 'var(--text-secondary)',
								backgroundColor: 'transparent',
							}}
							onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
							onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
							</svg>
							<span className="hidden lg:inline">Dashboard</span>
						</Link>
					)}

					{navItems.map(item => {
						const isActive = currentPage === item.path.substring(1) || (item.path === '/funds' && currentPage.startsWith('funds'));
						return (
							<Link
								key={item.path}
								to={item.path}
								className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 no-underline"
								style={{
									textDecoration: 'none',
									color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
									backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
								}}
								onMouseOver={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
								onMouseOut={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
									<path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
								</svg>
								<span className="hidden lg:inline">{item.label}</span>
							</Link>
						);
					})}

					{/* Theme Toggle */}
					<button
						className="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150"
						onClick={toggleTheme}
						style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
						onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
						onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
							<path strokeLinecap="round" strokeLinejoin="round" d={theme === 'light' ? "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" : "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"} />
						</svg>
					</button>

					<div className="h-5 w-px mx-1" style={{ backgroundColor: 'var(--grid-border)' }}></div>

					{/* Profile Dropdown */}
					<div 
						className="relative ml-1 flex items-center border"
						onMouseEnter={() => setIsProfileHovered(true)}
						onMouseLeave={() => setIsProfileHovered(false)}
					>
						<button
							className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-transparent transition-all duration-150 focus:outline-none cursor-pointer"
							style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: isProfileHovered ? 'var(--text-secondary)' : 'transparent' }}
						>
							{user && user.photoURL ? (
								<img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
							) : (
								<span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
									{user && user.displayName ? user.displayName.charAt(0).toUpperCase() : (user && user.email ? user.email.charAt(0).toUpperCase() : 'U')}
								</span>
							)}
						</button>
						
						{/* Dropdown Menu */}
						<div 
							className="absolute transition-all duration-200"
							style={{ 
								zIndex: 110,
								right: 0,
								top: '100%',
								paddingTop: '0.5rem',
								opacity: isProfileHovered ? 1 : 0,
								visibility: isProfileHovered ? 'visible' : 'hidden',
								pointerEvents: isProfileHovered ? 'auto' : 'none'
							}}
						>
							<div 
								className="rounded-md shadow-lg py-1 overflow-hidden"
								style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--grid-border)', minWidth: '130px' }}
							>
								<Link
									to="/profile"
									className="block px-4 py-2 text-sm transition-colors duration-150 no-underline"
									style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}
									onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
									onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
									onClick={() => setIsProfileHovered(false)}
								>
									Profile
								</Link>
								<button
									onClick={() => { setIsProfileHovered(false); handleLogout(); }}
									className="block w-full text-left px-4 py-2 text-sm transition-colors duration-150 border-t"
									style={{ color: 'var(--status-danger)', borderTopColor: 'var(--grid-border)', border: 'none', borderTop: '1px solid var(--grid-border)', cursor: 'pointer', whiteSpace: 'nowrap' }}
									onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
									onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
								>
									Log Out
								</button>
							</div>
						</div>
					</div>
				</nav>
			</div>
		</header>
	);
};

// ─── Dashboard (Palantir + ArcGIS + Windy + Linear) ────────────────
const DashboardView = () => {
	const [weather, setWeather] = useState({
		city: 'DELHI NCR',
		temperature: '--',
		condition: '--',
		humidity: '--',
		rainfall: '--',
		wind: '--',
		pressure: '1012 hPa'
	});

	const [prediction, setPrediction] = useState(null);
	const [trendData, setTrendData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const [locationMode, setLocationMode] = useState('browser');
	const [showMapModal, setShowMapModal] = useState(false);
	const [customLocation, setCustomLocation] = useState({ lat: null, lng: null, address: '' });
	const [searchCity, setSearchCity] = useState('');

	const [recentAlerts, setRecentAlerts] = useState([]);
	const [historicalPredictions, setHistoricalPredictions] = useState([]);

	const fetchWeatherAndPredict = async (lat, lon) => {
		setIsLoading(true);
		const weatherData = await getWeather(lat, lon);
		if (weatherData) {
			setWeather({
				city: weatherData.name.toUpperCase(),
				temperature: `${Math.round(weatherData.main.temp)}°`,
				condition: weatherData.weather[0].description.toUpperCase(),
				humidity: `${weatherData.main.humidity}%`,
				rainfall: weatherData.rain ? `${weatherData.rain['1h'] || weatherData.rain['3h'] || 0}mm` : '0.0mm',
				wind: `${weatherData.wind.speed} m/s`,
				pressure: `${weatherData.main.pressure} hPa`
			});
			
			// Calculate prediction based on live weather data
			const result = calculateFloodRisk(weatherData);
			setPrediction(result);
			setTrendData(generateTrendData(result.score, weatherData.main.pressure));
			
			// Telemetry Tracking
			savePrediction(result, weatherData);
			generateAlert(result, weatherData);
		}
		setIsLoading(false);
	};

	const fetchWeatherAndPredictByCity = async (city) => {
		setIsLoading(true);
		const weatherData = await getWeatherByCity(city);
		if (weatherData) {
			setWeather({
				city: weatherData.name.toUpperCase(),
				temperature: `${Math.round(weatherData.main.temp)}°`,
				condition: weatherData.weather[0].description.toUpperCase(),
				humidity: `${weatherData.main.humidity}%`,
				rainfall: weatherData.rain ? `${weatherData.rain['1h'] || weatherData.rain['3h'] || 0}mm` : '0.0mm',
				wind: `${weatherData.wind.speed} m/s`,
				pressure: `${weatherData.main.pressure} hPa`
			});
			
			// Calculate prediction based on live weather data
			const result = calculateFloodRisk(weatherData);
			setPrediction(result);
			setTrendData(generateTrendData(result.score, weatherData.main.pressure));
			
			// Telemetry Tracking
			savePrediction(result, weatherData);
			generateAlert(result, weatherData);
		} else {
			alert(`Could not find weather data for "${city}".`);
		}
		setIsLoading(false);
	};

	const detectLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => fetchWeatherAndPredict(pos.coords.latitude, pos.coords.longitude),
				() => fetchWeatherAndPredict() // Fallback
			);
		} else {
			fetchWeatherAndPredict();
		}
	};

	const handleCitySearch = () => {
		if (searchCity.trim()) {
			fetchWeatherAndPredictByCity(searchCity.trim());
		} else {
			alert("Please enter a city or region name.");
		}
	};

	const handleMapLocationConfirm = () => {
		if (customLocation.lat && customLocation.lng) {
			fetchWeatherAndPredict(customLocation.lat, customLocation.lng);
			setShowMapModal(false);
		} else {
			alert("Please click on the map to drop a pin.");
		}
	};

	useEffect(() => {
		detectLocation();

		const qAlerts = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'), limit(3));
		const unsubAlerts = onSnapshot(qAlerts, (snapshot) => {
			const arr = [];
			snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
			setRecentAlerts(arr);
		});

		const qPred = query(collection(db, 'predictions'), orderBy('timestamp', 'desc'), limit(50));
		const unsubPred = onSnapshot(qPred, (snapshot) => {
			const arr = [];
			snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
			setHistoricalPredictions(arr);
		});

		return () => {
			unsubAlerts();
			unsubPred();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!weather.city || weather.city === '--') return;
		const regionPreds = historicalPredictions.filter(p => p.region && p.region.toUpperCase() === weather.city.toUpperCase());
		if (regionPreds.length > 0) {
			const arr = regionPreds.slice(0, 12).reverse().map(p => {
				const timeStr = p.timestamp ? p.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '00:00';
				return {
					time: timeStr,
					prob: p.riskScore,
					rainfall: p.weatherSnapshot?.rainfall || 0
				};
			});
			setTrendData(arr);
		}
	}, [historicalPredictions, weather.city]);

	const inputStyle = {
		width: '100%',
		padding: '10px 14px',
		borderRadius: 'var(--radius-md)',
		border: '1px solid var(--grid-border)',
		backgroundColor: 'var(--bg-base)',
		color: 'var(--text-primary)',
		fontSize: '13px',
		fontFamily: "'JetBrains Mono', monospace",
		outline: 'none',
		transition: 'border-color 0.2s, box-shadow 0.2s',
		boxSizing: 'border-box',
	};

	// Replaced static chart data with trendData state

	const weatherMetrics = [
		{ label: 'Temperature', value: weather.temperature, trend: '↑ 2°', color: '#f97316', icon: '🌡' },
		{ label: 'Rainfall', value: weather.rainfall, trend: '↑ 15mm', color: '#3b82f6', icon: '🌧' },
		{ label: 'Humidity', value: weather.humidity, trend: 'Stable', color: '#14b8a6', icon: '💧' },
		{ label: 'Wind', value: weather.wind, trend: '↑ 5km/h', color: '#8b5cf6', icon: '💨' },
		{ label: 'Pressure', value: weather.pressure, trend: '↓ 2hPa', color: '#64748b', icon: '📊' }
	];

	const operationalStats = [
		{ label: 'Active Shelters', value: '42', max: 60, color: 'var(--status-success)' },
		{ label: 'Active Alerts', value: '3', max: 10, color: 'var(--status-danger)' },
		{ label: 'Safe Zones', value: '18', max: 25, color: 'var(--status-info)' },
		{ label: 'Reports Today', value: '156', max: 200, color: 'var(--status-warning)' },
		{ label: 'Funds Deployed', value: '₹1.2M', max: null, color: 'var(--accent-volt)' },
	];

	return (
		<div className="p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">

			{/* Location Selector */}
			<div className="opacity-0 animate-in">
				<div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div>
							<h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Target Region</h3>
							<p className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>Select location to predict flood risk</p>
						</div>
						
						<div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
							<div className="flex gap-1 p-1 rounded-md" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--grid-border)' }}>
								<button onClick={() => setLocationMode('browser')} className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors" style={{ backgroundColor: locationMode === 'browser' ? 'var(--bg-surface-elevated)' : 'transparent', color: locationMode === 'browser' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Auto (GPS)</button>
								<button onClick={() => setLocationMode('map')} className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors" style={{ backgroundColor: locationMode === 'map' ? 'var(--bg-surface-elevated)' : 'transparent', color: locationMode === 'map' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Map Pin</button>
								<button onClick={() => setLocationMode('search')} className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors" style={{ backgroundColor: locationMode === 'search' ? 'var(--bg-surface-elevated)' : 'transparent', color: locationMode === 'search' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Search Region</button>
							</div>

							<div className="flex gap-2 w-full md:w-auto min-w-[200px]">
								{locationMode === 'browser' && (
									<button onClick={detectLocation} disabled={isLoading} style={{...inputStyle, fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', cursor: isLoading ? 'wait' : 'pointer', opacity: isLoading ? 0.5 : 1, backgroundColor: 'var(--accent-volt)', color: 'var(--text-inverse)', border: 'none' }}>
										{isLoading ? 'Syncing...' : 'Sync Current Location'}
									</button>
								)}

								{locationMode === 'map' && (
									<button onClick={() => setShowMapModal(true)} style={{...inputStyle, fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', cursor: 'pointer', backgroundColor: 'var(--bg-surface-elevated)' }}>
										Open Interactive Map
									</button>
								)}

								{locationMode === 'search' && (
									<div className="flex gap-2 w-full">
										<input type="text" placeholder="e.g. Mumbai, Assam" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleCitySearch(); }} style={{...inputStyle, padding: '8px', flex: 1}} />
										<button onClick={handleCitySearch} disabled={isLoading} style={{...inputStyle, padding: '8px 12px', width: 'auto', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', cursor: isLoading ? 'wait' : 'pointer', opacity: isLoading ? 0.5 : 1, backgroundColor: 'var(--accent-volt)', color: 'var(--text-inverse)', border: 'none' }}>Search</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ── SECTION 01: CRITICAL ALERT ── */}
			<div className="opacity-0 animate-in">
				<div className="flex items-center gap-2 mb-3">
					<span className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>01</span>
					<span className="font-mono text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Critical Alert</span>
				</div>

				<div className="rounded-xl p-6 md:p-8 border relative overflow-hidden flex flex-col gap-6" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: prediction?.score > 60 ? 'var(--shadow-glow-danger)' : 'var(--shadow-card)' }}>
					<div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: prediction?.color || 'var(--text-tertiary)' }}></div>

					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pl-3">
						<div>
							<div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full mb-4" style={{ backgroundColor: prediction?.color ? `${prediction.color}15` : 'transparent', border: `1px solid ${prediction?.color ? prediction.color + '40' : 'transparent'}` }}>
								<div className={`w-1.5 h-1.5 rounded-full ${prediction?.score > 60 ? 'animate-pulse' : ''}`} style={{ backgroundColor: prediction?.color || 'var(--text-tertiary)' }}></div>
								<span className="font-mono text-[10px] font-semibold tracking-wider uppercase" style={{ color: prediction?.color || 'var(--text-tertiary)' }}>
									{prediction?.level || 'Analyzing'} RISK
								</span>
							</div>
							<h2 className="text-4xl md:text-5xl font-bold mb-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>
								{prediction?.level?.toUpperCase() || 'UNKNOWN'} RISK
							</h2>
							<p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
								Region: {weather.city}  ·  Live Telemetry  ·  Confidence: {prediction?.confidence || '--'}
							</p>
						</div>
						<div className="flex flex-col items-center">
							<RiskGauge value={prediction?.score || 0} size={180} />
							<p className="font-mono text-[10px] tracking-wider uppercase mt-1" style={{ color: 'var(--text-secondary)' }}>Flood Probability</p>
						</div>
					</div>
					
					{prediction && prediction.xai && (
						<div className="pl-3 mt-2 border-t pt-4" style={{ borderColor: 'var(--grid-border)' }}>
							<p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
								<span className="font-semibold">AI Analysis:</span> {prediction.xai.primaryExplanation}
							</p>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
								<div className="flex flex-col gap-1.5 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-base)' }}>
									<span className="font-mono text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-secondary)' }}>Primary Driver</span>
									<span className="text-xs font-bold" style={{ color: 'var(--status-danger)' }}>{prediction.xai.primaryDriver}</span>
								</div>
								<div className="flex flex-col gap-1.5 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-base)' }}>
									<span className="font-mono text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-secondary)' }}>Secondary Factors</span>
									<span className="text-xs font-semibold" style={{ color: 'var(--status-warning)' }}>
										{prediction.xai.secondaryFactors.length > 0 ? prediction.xai.secondaryFactors.join(', ') : 'None'}
									</span>
								</div>
							</div>

							{/* Limitations Panel */}
							<div className="p-3 mb-4 rounded-md border" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderColor: 'var(--grid-border)' }}>
								<div className="flex items-center gap-2 mb-2">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
									<span className="font-mono text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-secondary)' }}>Prediction Limitations</span>
								</div>
								<p className="font-mono text-[9px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
									Current model computes risk using heuristic weights on live weather data (Rainfall, Humidity, Pressure, Wind, Clouds).<br/><br/>
									Future pipeline integrations: River Water Level APIs, Soil Moisture sensors, DEM Analysis, and ensemble ML models.
								</p>
							</div>
							
							<div className="flex flex-col gap-1.5">
								<span className="font-mono text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Emergency Recommendations</span>
								{prediction.recommendations.map((rec, idx) => (
									<div key={idx} className="flex items-center gap-2">
										<div className="w-1 h-1 rounded-full" style={{ backgroundColor: prediction.color }}></div>
										<span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{rec}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* ── SECTION 02: WEATHER INTELLIGENCE ── */}
			<div className="opacity-0 animate-in" style={{ animationDelay: '0.05s' }}>
				<div className="flex items-center gap-2 mb-3">
					<span className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>02</span>
					<span className="font-mono text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Weather Intelligence</span>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
					{weatherMetrics.map((metric, i) => (
						<div
							key={i}
							className="rounded-lg p-4 border transition-all duration-200 group"
							style={{
								backgroundColor: 'var(--bg-surface)',
								borderColor: 'var(--grid-border)',
								boxShadow: 'var(--shadow-card)',
							}}
							onMouseOver={(e) => { e.currentTarget.style.borderColor = metric.color + '40'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
							onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--grid-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
						>
							<div className="flex items-center gap-2 mb-2">
								<span className="text-sm">{metric.icon}</span>
								<span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>{metric.label}</span>
							</div>
							<span className="text-xl font-bold block mb-1" style={{ color: metric.color }}>{metric.value}</span>
							<span className="font-mono text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{metric.trend}</span>
						</div>
					))}
				</div>
			</div>

			{/* ── SECTION 03: OPERATIONAL OVERVIEW ── */}
			<div className="opacity-0 animate-in" style={{ animationDelay: '0.1s' }}>
				<div className="flex items-center gap-2 mb-3">
					<span className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>03</span>
					<span className="font-mono text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Operational Overview</span>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
					{operationalStats.map((stat, i) => (
						<div key={i} className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
							<span className="font-mono text-[10px] tracking-wider uppercase block mb-2" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
							<span className="text-xl font-bold block mb-2" style={{ color: 'var(--text-primary)' }}>{stat.value}</span>
							{stat.max && (
								<div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
									<div
										className="h-full rounded-full transition-all duration-1000 ease-out"
										style={{
											width: `${(parseInt(stat.value) / stat.max) * 100}%`,
											backgroundColor: stat.color,
											boxShadow: `0 0 6px ${stat.color}40`,
										}}
									></div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* ── SECTION 04: MONITORING ── */}
			<div className="opacity-0 animate-in" style={{ animationDelay: '0.15s' }}>
				<div className="flex items-center gap-2 mb-3">
					<span className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>04</span>
					<span className="font-mono text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Live Monitoring</span>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					{/* Chart */}
					<div className="lg:col-span-2 rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
						<div className="flex justify-between items-center mb-4">
							<h3 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Flood Probability Trend</h3>
							<span className="font-mono text-[10px] px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--status-danger)' }}>LIVE</span>
						</div>
						<div className="h-[220px] w-full">
							<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={trendData.length ? trendData : [{time: '00:00', prob: 0}]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
									<defs>
										<linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor={prediction?.color || "#ef4444"} stopOpacity={0.2}/>
										<stop offset="95%" stopColor={prediction?.color || "#ef4444"} stopOpacity={0}/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="var(--grid-border)" vertical={false} />
									<XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
									<YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" domain={[0, 100]} />
									<ReferenceLine y={70} stroke="var(--status-danger)" strokeDasharray="6 4" strokeOpacity={0.4} label={{ value: 'DANGER', position: 'right', fontSize: 9, fill: 'var(--status-danger)', fontFamily: 'JetBrains Mono' }} />
									<Tooltip
										contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--grid-border)', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
										itemStyle={{ color: 'var(--text-primary)' }}
										labelStyle={{ color: 'var(--text-secondary)', fontSize: '10px' }}
									/>
									<Area type="monotone" dataKey="prob" stroke={prediction?.color || "#ef4444"} strokeWidth={2} fillOpacity={1} fill="url(#colorProb)" dot={false} activeDot={{ r: 4, fill: prediction?.color || "#ef4444", stroke: 'var(--bg-surface)', strokeWidth: 2 }} />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Recent Alerts */}
					<div className="rounded-xl border flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
						<div className="flex justify-between items-center px-4 py-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
							<h3 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Recent Alerts</h3>
							<span className="font-mono text-[9px] px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--status-danger)' }}>{recentAlerts.length} Active</span>
						</div>
						<div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto max-h-[220px]">
							{recentAlerts.length > 0 ? recentAlerts.map(alert => (
								<div key={alert.id} className="p-3 rounded-md border" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--grid-border)', borderLeft: `3px solid var(--status-danger)` }}>
									<div className="flex justify-between items-center mb-1">
										<span className="font-mono text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--status-danger)' }}>{alert.severity} RISK</span>
										<span className="font-mono text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{alert.timestamp ? alert.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
									</div>
									<p className="text-xs" style={{ color: 'var(--text-primary)' }}>{alert.message}</p>
								</div>
							)) : (
								<div className="flex flex-col items-center justify-center h-full opacity-50">
									<span className="text-xl mb-2">✅</span>
									<span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>No Active Alerts</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Map Modal */}
			{showMapModal && (
				<div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
					<div className="rounded-xl overflow-hidden flex flex-col w-full max-w-2xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', height: '60vh' }}>
						<div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--grid-border)' }}>
							<h3 className="text-sm font-semibold">Select Prediction Target</h3>
							<button onClick={() => setShowMapModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
						</div>
						<div className="flex-1">
							<MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
								<TileLayer
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								/>
								<LocationMarker position={customLocation} setPosition={setCustomLocation} />
							</MapContainer>
						</div>
						<div className="p-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--grid-border)' }}>
							<span className="font-mono text-[10px]" style={{ color: 'var(--text-secondary)' }}>
								{customLocation.lat ? `Selected: ${customLocation.lat.toFixed(4)}, ${customLocation.lng.toFixed(4)}` : 'Click anywhere on the map'}
							</span>
							<button 
								onClick={handleMapLocationConfirm}
								style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--accent-volt)', color: 'var(--text-inverse)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
							>
								Run Prediction Engine
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

// ─── Footer (Linear-minimal) ───────────────────────────────────────
const Footer = () => (
	<footer className="flex justify-between items-center px-6 py-4 border-t" style={{ borderColor: 'var(--grid-border)', backgroundColor: 'var(--bg-surface)' }}>
		<span className="font-mono text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
			© {new Date().getFullYear()} PRAYAS Initiative
		</span>
		<div className="flex gap-5 font-mono text-[10px]">
			<Link to="/" className="transition-colors hover:underline" style={{ textDecoration: 'none', color: 'var(--text-tertiary)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>Privacy</Link>
			<Link to="/" className="transition-colors hover:underline" style={{ textDecoration: 'none', color: 'var(--text-tertiary)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>Terms</Link>
			<Link to="/help" className="transition-colors hover:underline" style={{ textDecoration: 'none', color: 'var(--text-tertiary)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>Contact</Link>
		</div>
	</footer>
);

// ─── Main App ───────────────────────────────────────────────────────
const App = () => {
	const [theme, setTheme] = useState(localStorage.getItem('prayas-theme') || 'dark');
	const [user, setUser] = useState(null);
	const [userDoc, setUserDoc] = useState(null);
	const [authChecked, setAuthChecked] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setUser(currentUser);
			if (currentUser) {
				try {
					const snapshot = await getDoc(doc(db, 'users', currentUser.uid));
					if (snapshot.exists()) {
						setUserDoc(snapshot.data());
					}
				} catch (err) {
					console.error("Failed to fetch user role", err);
				}
			} else {
				setUserDoc(null);
			}
			setAuthChecked(true);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('prayas-theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme(prev => prev === 'light' ? 'dark' : 'light');
	};

	if (!authChecked) {
		return (
			<div className="w-full min-h-screen flex justify-center items-center font-mono text-sm" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--accent-volt)' }}>
				<div className="flex items-center gap-3">
					<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
					Initializing...
				</div>
			</div>
		);
	}

	if (!user) {
		return <AuthPage setUserLoggedIn={() => {}} />;
	}

	return (
		<div className="w-full min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }}>
			<Header
				theme={theme}
				toggleTheme={toggleTheme}
				user={userDoc ? { ...user, role: userDoc.role } : user}
			/>

			<div className="flex-1">
				<Suspense fallback={
					<div className="flex justify-center items-center h-full min-h-[50vh]">
						<div className="flex items-center gap-3 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
							<svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
							Loading Module...
						</div>
					</div>
				}>
					<Routes>
						<Route path="/" element={<DashboardView />} />
						<Route path="/report" element={<Reports />} />
						<Route path="/funds/*" element={
							<ProtectedRoute userDoc={userDoc} allowedRoles={['Citizen', 'Responder', 'RegionalAdmin', 'SuperAdmin']}>
								<Fund />
							</ProtectedRoute>
						} />
						<Route path="/admin" element={
							<ProtectedRoute userDoc={userDoc} allowedRoles={['RegionalAdmin', 'SuperAdmin']}>
								<AdminAnalytics />
							</ProtectedRoute>
						} />
						<Route path="/map" element={<Map />} />
						<Route path="/help" element={<Help />} />
						<Route path="/profile" element={<Profile />} />
					</Routes>
				</Suspense>
			</div>

			<Footer />
		</div>
	);
};

export default App;
