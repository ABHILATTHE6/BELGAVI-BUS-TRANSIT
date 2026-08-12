import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  mockBuses,
  mockRoutes,
  mockDepots,
  mockSchedules,
  mockAnnouncements,
  mockNotifications,
  mockUsers,
  mockAuditLogs,
  mockAnalytics,
  mockFavorites,
  mockTripHistory
} from './src/data/mockData.js';
import { Bus, Route, AuditLog, Announcement, FavoriteItem, NotificationItem } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State
let currentBuses: Bus[] = [...mockBuses];
let currentRoutes: Route[] = [...mockRoutes];
let currentAnnouncements: Announcement[] = [...mockAnnouncements];
let currentNotifications: NotificationItem[] = [...mockNotifications];
let currentAuditLogs: AuditLog[] = [...mockAuditLogs];
let currentFavorites: FavoriteItem[] = [...mockFavorites];

let isSimulatingTelemetry = true;

// Active Telemetry Simulation Engine: Moves in-transit buses smoothly around Belagavi routes
setInterval(() => {
  if (!isSimulatingTelemetry) return;

  currentBuses = currentBuses.map((bus) => {
    if (bus.status !== 'in_transit' && bus.status !== 'delayed') return bus;

    const route = mockRoutes.find((r) => r.id === bus.routeId);
    if (!route || !route.pathCoordinates || route.pathCoordinates.length < 2) return bus;

    const speedKmH = bus.status === 'delayed' ? Math.max(10, bus.speed + (Math.random() * 4 - 2)) : Math.min(55, Math.max(20, bus.speed + (Math.random() * 6 - 3)));

    // Shift coordinates slightly around Belagavi bounds
    const currentLat = bus.currentLat + (Math.random() * 0.0003 - 0.00015);
    const currentLng = bus.currentLng + (Math.random() * 0.0003 - 0.00015);

    // Dynamic passenger update
    const passengerDelta = Math.floor(Math.random() * 5) - 2;
    const newPassengers = Math.max(5, Math.min(bus.capacity, bus.currentPassengers + passengerDelta));
    const crowdingRatio = newPassengers / bus.capacity;
    const newCrowding = crowdingRatio > 0.8 ? 'high' : crowdingRatio > 0.4 ? 'medium' : 'low';

    // Update ETA countdown
    let newEta = bus.etaToNextStopMin;
    if (Math.random() > 0.7) {
      newEta = Math.max(1, bus.etaToNextStopMin + (Math.random() > 0.5 ? -1 : 1));
    }

    return {
      ...bus,
      currentLat: Number(currentLat.toFixed(5)),
      currentLng: Number(currentLng.toFixed(5)),
      speed: Math.round(speedKmH),
      currentPassengers: newPassengers,
      crowdingLevel: newCrowding,
      etaToNextStopMin: newEta,
      lastUpdated: 'Just now',
    };
  });
}, 3000);

// --- REST API ENDPOINTS ---

// Health & System Info
app.get('/api/health', (req, res) => {
  const health = {
    status: 'online',
    system: 'Belagavi City Bus Service NWKRTC Telemetry Server',
    version: '1.0.0-belagavi',
    uptimeSec: Math.floor(process.uptime()),
    activeBuses: currentBuses.length,
    telemetrySimulator: isSimulatingTelemetry ? 'active' : 'paused',
    services: {
      database: {
        status: 'not_configured',
        provider: 'PostgreSQL / PostGIS',
        mode: 'in-memory-mock-data',
      },
      redis: {
        status: 'not_configured',
      },
      mqtt: {
        status: 'not_configured',
        broker: 'tcp://localhost:1883',
      },
    },
  };

  res.status(200).json(health);
});

// Authentication
app.get('/api/auth/me', (req, res) => {
  const role = (req.query.role as string) || 'commuter';
  const user = mockUsers.find((u) => u.role === role) || mockUsers[0];
  res.json({ user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  const user = mockUsers.find((u) => u.email === email || u.role === role) || mockUsers[0];

  currentAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'USER_LOGIN',
    userId: user.id,
    userName: user.name,
    role: user.role,
    target: 'AUTH_SESSION',
    details: `User logged in under role ${user.role}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ipAddress: '127.0.0.1',
  });

  res.json({ token: 'mock-jwt-token-xyz987', user });
});

// Buses & Live Telemetry
app.get('/api/buses', (req, res) => {
  const { routeId, depotId, status } = req.query;
  let filtered = currentBuses;
  if (routeId) filtered = filtered.filter((b) => b.routeId === routeId);
  if (depotId) filtered = filtered.filter((b) => b.depotId === depotId);
  if (status) filtered = filtered.filter((b) => b.status === status);
  res.json(filtered);
});

app.get('/api/buses/:id', (req, res) => {
  const bus = currentBuses.find((b) => b.id === req.params.id || b.fleetNumber === req.params.id);
  if (!bus) {
    return res.status(404).json({ error: 'Bus not found' });
  }
  res.json(bus);
});

app.post('/api/buses/:id/status', (req, res) => {
  const { status, currentPassengers, driverName } = req.body;
  const index = currentBuses.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Bus not found' });

  currentBuses[index] = {
    ...currentBuses[index],
    status: status || currentBuses[index].status,
    currentPassengers: currentPassengers ?? currentBuses[index].currentPassengers,
    driverName: driverName || currentBuses[index].driverName,
    lastUpdated: 'Just now',
  };

  currentAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'BUS_STATUS_CHANGE',
    userId: 'system',
    userName: 'Operator',
    role: 'driver',
    target: currentBuses[index].fleetNumber,
    details: `Status updated to ${status}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ipAddress: '127.0.0.1',
  });

  res.json(currentBuses[index]);
});

// Create New Bus for Depot Fleet
app.post('/api/buses', (req, res) => {
  const newBus: Bus = {
    id: `bus-${Date.now()}`,
    fleetNumber: req.body.fleetNumber || `KA-22-F-${Math.floor(1000 + Math.random() * 9000)}`,
    licensePlate: req.body.licensePlate || `KA-22-F-${Math.floor(1000 + Math.random() * 9000)}`,
    model: req.body.model || 'Ashok Leyland JanBus Low-Floor',
    capacity: Number(req.body.capacity) || 60,
    currentPassengers: Number(req.body.currentPassengers) || 0,
    routeId: req.body.routeId || 'route-101',
    routeCode: req.body.routeCode || 'KA-22-R01',
    depotId: req.body.depotId || 'depot-cbt',
    driverId: req.body.driverId || 'u-driver-1',
    driverName: req.body.driverName || 'Assigned Driver',
    status: req.body.status || 'at_stop',
    currentLat: req.body.currentLat || 15.8583,
    currentLng: req.body.currentLng || 74.5078,
    speed: 0,
    heading: 90,
    nextStopId: req.body.nextStopId || 'stop-1',
    nextStopName: req.body.nextStopName || 'CBT Central Bus Terminal',
    etaToNextStopMin: req.body.etaToNextStopMin || 5,
    crowdingLevel: 'low',
    fuelLevel: 100,
    lastUpdated: 'Just now',
    routeColor: req.body.routeColor || '#2563eb',
  };

  currentBuses.unshift(newBus);

  currentAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'BUS_CREATED',
    userId: 'depot-admin',
    userName: 'Depot Administrator',
    role: 'depot_admin',
    target: newBus.fleetNumber,
    details: `Added new bus ${newBus.fleetNumber} (${newBus.model}) to depot fleet ${newBus.depotId}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ipAddress: '127.0.0.1',
  });

  res.status(201).json(newBus);
});

app.post('/api/telemetry/toggle-simulator', (req, res) => {
  isSimulatingTelemetry = !isSimulatingTelemetry;
  res.json({ isSimulatingTelemetry });
});

// Routes & Stops
app.get('/api/routes', (req, res) => {
  res.json(currentRoutes);
});

app.get('/api/routes/:id', (req, res) => {
  const route = currentRoutes.find((r) => r.id === req.params.id || r.code === req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json(route);
});

app.post('/api/routes', (req, res) => {
  const newRoute: Route = {
    id: `route-${Date.now()}`,
    code: req.body.code || `KA-22-R0${currentRoutes.length + 1}`,
    name: req.body.name || 'New Belagavi City Route',
    color: req.body.color || '#ec4899',
    startStop: req.body.startStop || 'CBT Central Bus Terminal',
    endStop: req.body.endStop || 'Peeranwadi Cross',
    totalDistanceKm: Number(req.body.totalDistanceKm) || 12.0,
    avgDurationMin: Number(req.body.avgDurationMin) || 30,
    fareStandard: Number(req.body.fareStandard) || 15.0,
    fareExpress: Number(req.body.fareExpress) || 20.0,
    activeBusesCount: 1,
    pathCoordinates: req.body.pathCoordinates || [
      [15.8583, 74.5078],
      [15.8569, 74.5070],
      [15.8360, 74.5030],
    ],
    stops: req.body.stops || [
      { stopId: `stop-${Date.now()}-1`, name: req.body.startStop || 'CBT Central Bus Terminal', code: 'CBT-01', lat: 15.8583, lng: 74.5078, sequence: 1, isMajorHub: true, avgStopDurationSec: 60 },
      { stopId: `stop-${Date.now()}-2`, name: req.body.endStop || 'Peeranwadi Cross', code: 'PWC-02', lat: 15.8360, lng: 74.5030, sequence: 2, isMajorHub: true, avgStopDurationSec: 60 },
    ],
  };

  currentRoutes.unshift(newRoute);

  currentAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    action: 'ROUTE_CREATED',
    userId: 'depot-admin',
    userName: 'Depot Administrator',
    role: 'depot_admin',
    target: newRoute.code,
    details: `Created new route ${newRoute.code} (${newRoute.name}) with ${newRoute.stops.length} stops`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ipAddress: '127.0.0.1',
  });

  res.status(201).json(newRoute);
});

// Depots
app.get('/api/depots', (req, res) => {
  res.json(mockDepots);
});

// Schedules
app.get('/api/schedules', (req, res) => {
  res.json(mockSchedules);
});

// Announcements
app.get('/api/announcements', (req, res) => {
  res.json(currentAnnouncements);
});

app.post('/api/announcements', (req, res) => {
  const { title, content, priority, category, author, targetRole } = req.body;
  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title: title || 'New Announcement',
    content: content || '',
    priority: priority || 'normal',
    category: category || 'general',
    author: author || 'Belagavi Transit Control',
    targetRole: targetRole || 'all',
    createdAt: 'Just now',
  };
  currentAnnouncements.unshift(newAnn);

  res.json(newAnn);
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json(currentNotifications);
});

// Audit Logs & Analytics
app.get('/api/audit-logs', (req, res) => {
  res.json(currentAuditLogs);
});

app.get('/api/analytics', (req, res) => {
  res.json(mockAnalytics);
});

app.get('/api/user/favorites', (req, res) => {
  res.json(currentFavorites);
});

app.post('/api/user/favorites', (req, res) => {
  const { type, targetId, targetName, targetCode } = req.body;
  const newFav: FavoriteItem = {
    id: `fav-${Date.now()}`,
    userId: 'u-commuter-1',
    type,
    targetId,
    targetName,
    targetCode,
    createdAt: new Date().toISOString().split('T')[0],
  };
  currentFavorites.push(newFav);
  res.json(newFav);
});

app.get('/api/user/trip-history', (req, res) => {
  res.json(mockTripHistory);
});

// --- AI FEATURES WITH GEMINI API FOR BELAGAVI ---

app.post('/api/ai/chat', async (req, res) => {
  const { prompt } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      text: `Namaskara! I am your Belagavi City Bus AI Assistant. Live info for "${prompt}": Route KA-22-R01 (CBT to VTU Machhe) bus KA-22-F-1022 is arriving in 3 mins at Tilakwadi Third Gate (Fare: ₹15). Route KA-22-R03 connects directly from CBT to Sambra Airport (Fare: ₹25).`,
      suggestions: ['How to go to VTU Machhe Campus?', 'What is the fare for Route KA-22-R01?', 'Bus timing for Sambra Airport'],
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const contextPrompt = `You are "Belagavi City Bus AI Assistant", an expert NWKRTC city bus guide for Belagavi (Belgaum), Karnataka, India.
Current Belagavi City Context:
- Route KA-22-R01: CBT Central Bus Stand -> Rani Chennamma Circle -> Belagavi Railway Station -> Tilakwadi Third Gate -> Peeranwadi -> VTU Campus Machhe. Active bus KA-22-F-1022 (Fare ₹15 standard, ₹20 express).
- Route KA-22-R02: KLE Hospital (Nehru Nagar) -> Fort Lake -> Chennamma Circle -> CBT -> Suvarna Vidhana Soudha (Halaga). Active bus KA-22-F-2045 (Fare ₹20 standard).
- Route KA-22-R03: CBT Central Bus Stand -> Sambra Belagavi Airport. Active bus KA-22-F-3091 (Fare ₹25 standard).
- Route KA-22-R04: CBT -> Belagavi Station -> Tilakwadi -> Udyambag Industrial Estate (Fare ₹12 standard).

User Question: "${prompt}"

Provide a concise, helpful, friendly answer in 2-4 sentences using Belagavi local landmarks, bus numbers, ETAs, and fares in ₹ (rupees).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
    });

    res.json({
      text: response.text || 'Unable to fetch Belagavi transit response.',
      suggestions: [
        'Bus to VTU Machhe Campus',
        'Bus to KLE Hospital',
        'Bus to Sambra Airport',
      ],
    });
  } catch (error: any) {
    res.json({
      text: `Belagavi City Bus Assistant: Route KA-22-R01 from CBT to VTU Machhe Campus operates every 10 mins with standard fare ₹15.`,
      suggestions: ['Check live map', 'View full schedule', 'Show CBT depot info'],
    });
  }
});

app.post('/api/ai/predict-eta', async (req, res) => {
  const { routeCode, stopName, currentTraffic, weather } = req.body;

  const baseMinutes = 4;
  const trafficDelay = currentTraffic === 'heavy' ? 5 : currentTraffic === 'moderate' ? 2 : 0;
  const weatherDelay = weather === 'rain' ? 3 : 0;
  const predictedMin = baseMinutes + trafficDelay + weatherDelay;

  res.json({
    routeCode: routeCode || 'KA-22-R01',
    stopName: stopName || 'Tilakwadi Third Gate',
    predictedEtaMin: predictedMin,
    confidenceScorePct: 97.2,
    factors: [
      { name: 'Historical Telemetry', impactMin: baseMinutes },
      { name: 'Chennamma Circle Traffic', impactMin: trafficDelay },
      { name: 'Monsoon Weather Impact', impactMin: weatherDelay },
    ],
    recommendation: predictedMin > 8 ? 'Consider taking Route KA-22-R04 as an alternative route.' : 'Bus is arriving on schedule.',
  });
});

app.post('/api/ai/route-recommend', (req, res) => {
  const { origin, destination, preference } = req.body;

  if (preference === 'cheapest') {
    return res.json([
      {
        routeCode: 'KA-22-R01',
        routeName: 'CBT to VTU Machhe Campus (Standard Bus)',
        estimatedTimeMin: 35,
        fare: 15.00,
        transfers: 0,
        crowding: 'medium',
        carbonSavedKg: 1.8,
        steps: [
          { type: 'walk', detail: `Walk 2 mins to ${origin || 'CBT Bus Stand'}`, durationMin: 2 },
          { type: 'bus', detail: 'Board NWKRTC City Bus KA-22-F-1022 towards VTU', durationMin: 30, busCode: 'KA-22-R01' },
          { type: 'walk', detail: `Arrive at ${destination || 'VTU Campus Machhe'}`, durationMin: 3 },
        ],
      },
    ]);
  }

  // Default: Fastest option
  res.json([
    {
      routeCode: 'KA-22-R01',
      routeName: 'CBT to VTU Machhe Campus (Express Shuttle)',
      estimatedTimeMin: 25,
      fare: 20.00,
      transfers: 0,
      crowding: 'medium',
      carbonSavedKg: 2.1,
      steps: [
        { type: 'walk', detail: `Walk 1 min to ${origin || 'CBT Central Bus Terminal'}`, durationMin: 1 },
        { type: 'bus', detail: 'Board Express Bus KA-22-F-1022 via Tilakwadi Third Gate', durationMin: 22, busCode: 'KA-22-R01' },
        { type: 'walk', detail: `Arrive at ${destination || 'VTU Campus Machhe'}`, durationMin: 2 },
      ],
    },
    {
      routeCode: 'KA-22-R04',
      routeName: 'Tilakwadi Industrial Connecting Line',
      estimatedTimeMin: 28,
      fare: 12.00,
      transfers: 1,
      crowding: 'low',
      carbonSavedKg: 1.5,
      steps: [
        { type: 'walk', detail: `Walk 3 mins to ${origin || 'Belagavi Railway Station'}`, durationMin: 3 },
        { type: 'bus', detail: 'Board City Bus KA-22-F-4012', durationMin: 22, busCode: 'KA-22-R04' },
        { type: 'walk', detail: 'Walk 3 mins to destination', durationMin: 3 },
      ],
    },
  ]);
});

// --- VITE / STATIC MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚌 BELAGAVI CITY BUS SERVICE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
