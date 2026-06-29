import React, { useState, useEffect } from 'react';
import { calculateFloodRisk, generateTrendData } from './services/floodPredictionService';
import { getWeather } from './services/weatherService';

import Reports from './pages/Reports';
import Map from './pages/Map';
import Help from './pages/Help';
import Fund from './pages/Fund';
import Profile from './pages/Profile';
import AuthPage from './pages/Auth/AuthPage';
import { auth } from './pages/Auth/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './pages/Auth/firebase';
import ProtectedRoute from './components/ProtectedRoute';

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
	const location = useLocation();
	const navigate = useNavigate();
	const currentPage = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);

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

					<Link
						to="/profile"
						className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 no-underline"
						style={{
							textDecoration: 'none',
							color: currentPage === 'profile' ? 'var(--text-primary)' : 'var(--text-secondary)',
							backgroundColor: currentPage === 'profile' ? 'var(--bg-surface-elevated)' : 'transparent',
						}}
						onMouseOver={(e) => { if (currentPage !== 'profile') { e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
						onMouseOut={(e) => { if (currentPage !== 'profile') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						<span className="hidden lg:inline">Profile</span>
					</Link>

					<div className="h-5 w-px mx-1" style={{ backgroundColor: 'var(--grid-border)' }}></div>

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

					{/* Logout */}
					<button
						className="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150"
						onClick={handleLogout}
						style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
						onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--status-danger)'; }}
						onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
					</button>
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

	const fetchWeatherAndPredict = async (lat, lon) => {
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
		}
	};

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => fetchWeatherAndPredict(pos.coords.latitude, pos.coords.longitude),
				() => fetchWeatherAndPredict() // Fallback
			);
		} else {
			fetchWeatherAndPredict();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
					
					{prediction && (
						<div className="pl-3 mt-2 border-t pt-4" style={{ borderColor: 'var(--grid-border)' }}>
							<p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
								<span className="font-semibold">AI Analysis:</span> {prediction.explanation}
							</p>
							
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

					{/* GIS Preview */}
					<div className="rounded-xl border overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
						<div className="flex justify-between items-center px-4 py-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
							<h3 className="font-mono text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>GIS Preview</h3>
							<Link to="/map" className="font-mono text-[10px] tracking-wide no-underline transition-all hover:underline" style={{ color: 'var(--accent-volt)', textDecoration: 'none' }}>OPEN MAP →</Link>
						</div>
						<div className="flex-1 min-h-[220px] relative">
							{/* Floating overlay labels — Zoom Earth style */}
							<div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ backgroundColor: 'var(--bg-overlay)', backdropFilter: 'blur(8px)' }}>
								<div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--status-success)' }}></div>
								<span className="font-mono text-[9px] font-semibold tracking-wider uppercase" style={{ color: 'var(--text-primary)' }}>LIVE</span>
							</div>
							<iframe 
								title="Map Preview"
								src={`/MAP/map61.html?maptiler=${process.env.REACT_APP_MAPTILER_API_KEY || ''}`} 
								width="100%" 
								height="100%" 
								style={{ border: 0, display: 'block', position: 'absolute', inset: 0 }} 
								className="pointer-events-none"
							/>
						</div>
					</div>
				</div>
			</div>
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
				user={user}
			/>

			<div className="flex-1">
				<Routes>
					<Route path="/" element={<DashboardView />} />
					<Route path="/report" element={<Reports />} />
					<Route path="/funds/*" element={
						<ProtectedRoute userDoc={userDoc} allowedRoles={['Citizen', 'Responder', 'RegionalAdmin', 'SuperAdmin']}>
							<Fund />
						</ProtectedRoute>
					} />
					<Route path="/map" element={<Map />} />
					<Route path="/help" element={<Help />} />
					<Route path="/profile" element={<Profile />} />
				</Routes>
			</div>

			<Footer />
		</div>
	);
};

export default App;
