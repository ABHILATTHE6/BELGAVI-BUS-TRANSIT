import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { MapView } from './components/MapView';
import { CommuterView } from './components/CommuterView';
import { DriverView } from './components/DriverView';
import { DepotAdminView } from './components/DepotAdminView';
import { SuperAdminView } from './components/SuperAdminView';
import { AnalyticsView } from './components/AnalyticsView';
import { AIChatbotModal } from './components/AIChatbotModal';

import {
  mockBuses,
  mockRoutes,
  mockDepots,
  mockAnnouncements,
  mockNotifications,
  mockUsers,
  mockAuditLogs,
  mockAnalytics,
  mockFavorites,
  mockTripHistory
} from './data/mockData';
import { UserRole, Bus, Route, Depot, Announcement, NotificationItem, FavoriteItem, AuditLog } from './types';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('commuter');
  const [activeTab, setActiveTab] = useState<TabType>('map');

  const [buses, setBuses] = useState<Bus[]>(mockBuses);
  const [routes, setRoutes] = useState<Route[]>(mockRoutes);
  const [depots] = useState<Depot[]>(mockDepots);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [notifications] = useState<NotificationItem[]>(mockNotifications);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(mockFavorites);
  const [tripHistory] = useState(mockTripHistory);
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [analytics] = useState(mockAnalytics);

  const [selectedBusId, setSelectedBusId] = useState<string>('bus-101');
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>(undefined);

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Poll Backend /api/buses & /api/routes
  useEffect(() => {
    const fetchBusesAndRoutes = async () => {
      try {
        const busRes = await fetch('/api/buses');
        if (busRes.ok) {
          const busData = await busRes.json();
          setBuses(busData);
        }

        const routeRes = await fetch('/api/routes');
        if (routeRes.ok) {
          const routeData = await routeRes.json();
          setRoutes(routeData);
        }
      } catch (err) {
        // Fallback to local state if offline
      }
    };

    fetchBusesAndRoutes();
    const interval = setInterval(fetchBusesAndRoutes, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync role-based initial tabs
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    switch (role) {
      case 'commuter':
        setActiveTab('map');
        break;
      case 'driver':
        setActiveTab('driver_hud');
        break;
      case 'depot_admin':
        setActiveTab('fleet');
        break;
      case 'super_admin':
        setActiveTab('analytics');
        break;
    }
  };

  const handleToggleSimulator = async () => {
    try {
      const res = await fetch('/api/telemetry/toggle-simulator', { method: 'POST' });
      const data = await res.json();
      setIsSimulating(data.isSimulatingTelemetry);
    } catch (err) {
      setIsSimulating(!isSimulating);
    }
  };

  const handleUpdateBusStatus = async (busId: string, status: string, passengers?: number) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status: status as any, currentPassengers: passengers ?? b.currentPassengers } : b))
    );

    try {
      await fetch(`/api/buses/${busId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, currentPassengers: passengers }),
      });
    } catch (err) {
      // Handled in state
    }
  };

  const handleAddBus = async (newBusData: Partial<Bus>) => {
    try {
      const res = await fetch('/api/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBusData),
      });
      if (res.ok) {
        const createdBus = await res.json();
        setBuses((prev) => [createdBus, ...prev]);
      }
    } catch (err) {
      // Local fallback
      const fallbackBus: Bus = {
        id: `bus-${Date.now()}`,
        fleetNumber: newBusData.fleetNumber || `KA-22-F-${Math.floor(1000 + Math.random() * 9000)}`,
        licensePlate: newBusData.licensePlate || `KA-22-F-${Math.floor(1000 + Math.random() * 9000)}`,
        model: newBusData.model || 'Ashok Leyland JanBus Low-Floor',
        capacity: newBusData.capacity || 60,
        currentPassengers: 0,
        routeId: newBusData.routeId || 'route-101',
        routeCode: newBusData.routeCode || 'KA-22-R01',
        depotId: newBusData.depotId || 'depot-cbt',
        driverId: 'u-driver-1',
        driverName: newBusData.driverName || 'Assigned Driver',
        status: newBusData.status || 'at_stop',
        currentLat: 15.8583,
        currentLng: 74.5078,
        speed: 0,
        heading: 90,
        nextStopId: 'stop-1',
        nextStopName: newBusData.nextStopName || 'CBT Central Bus Terminal',
        etaToNextStopMin: 5,
        crowdingLevel: 'low',
        fuelLevel: 100,
        lastUpdated: 'Just now',
        routeColor: newBusData.routeColor || '#2563eb',
      };
      setBuses((prev) => [fallbackBus, ...prev]);
    }
  };

  const handleAddRoute = async (newRouteData: Partial<Route>) => {
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRouteData),
      });
      if (res.ok) {
        const createdRoute = await res.json();
        setRoutes((prev) => [createdRoute, ...prev]);
      }
    } catch (err) {
      // Local fallback
      const fallbackRoute: Route = {
        id: `route-${Date.now()}`,
        code: newRouteData.code || `KA-22-R0${routes.length + 1}`,
        name: newRouteData.name || 'Belagavi City Route',
        color: newRouteData.color || '#ec4899',
        startStop: newRouteData.startStop || 'CBT Central Bus Terminal',
        endStop: newRouteData.endStop || 'Peeranwadi Cross',
        totalDistanceKm: newRouteData.totalDistanceKm || 12.0,
        avgDurationMin: newRouteData.avgDurationMin || 30,
        fareStandard: newRouteData.fareStandard || 15,
        fareExpress: newRouteData.fareExpress || 20,
        activeBusesCount: 1,
        pathCoordinates: [[15.8583, 74.5078], [15.8360, 74.5030]],
        stops: newRouteData.stops || [],
      };
      setRoutes((prev) => [fallbackRoute, ...prev]);
    }
  };

  const handleAddAnnouncement = (ann: Partial<Announcement>) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: ann.title || 'Depot Notice',
      content: ann.content || '',
      priority: ann.priority || 'normal',
      category: ann.category || 'general',
      author: ann.author || 'Belagavi Depot Control',
      targetRole: 'all',
      createdAt: 'Just now',
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const handleAddFavorite = (type: 'route' | 'stop', id: string, name: string, code: string) => {
    const newFav: FavoriteItem = {
      id: `fav-${Date.now()}`,
      userId: 'u-commuter-1',
      type,
      targetId: id,
      targetName: name,
      targetCode: code,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setFavorites((prev) => [newFav, ...prev]);
  };

  const currentUser = mockUsers.find((u) => u.role === currentRole) || mockUsers[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Application Bar */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        currentUser={currentUser}
        notifications={notifications}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isSimulating={isSimulating}
        onToggleSimulator={handleToggleSimulator}
      />

      {/* Role-adaptive Tab Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        role={currentRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-2 sm:p-4 md:p-6">
        
        {/* TAB 1: LIVE MAP TRACKER */}
        {activeTab === 'map' && (
          <MapView
            buses={buses}
            routes={routes}
            depots={depots}
            selectedBusId={selectedBusId}
            onSelectBus={(busId) => setSelectedBusId(busId)}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(routeId) => setSelectedRouteId(routeId)}
          />
        )}

        {/* TAB 2: JOURNEY PLANNER / COMMUTER */}
        {activeTab === 'journey' && (
          <CommuterView
            routes={routes}
            buses={buses}
            favorites={favorites}
            tripHistory={tripHistory}
            onSelectBus={(busId) => {
              setSelectedBusId(busId);
              setActiveTab('map');
            }}
            onSelectRoute={(routeId) => {
              setSelectedRouteId(routeId);
              setActiveTab('map');
            }}
            onOpenAIChat={() => setIsAIChatOpen(true)}
            onAddFavorite={handleAddFavorite}
          />
        )}

        {/* TAB 3: ROUTES & SCHEDULES (COMMUTER / DRIVER) */}
        {activeTab === 'schedules' && (
          <CommuterView
            routes={routes}
            buses={buses}
            favorites={favorites}
            tripHistory={tripHistory}
            onSelectBus={(busId) => {
              setSelectedBusId(busId);
              setActiveTab('map');
            }}
            onSelectRoute={(routeId) => {
              setSelectedRouteId(routeId);
              setActiveTab('map');
            }}
            onOpenAIChat={() => setIsAIChatOpen(true)}
            onAddFavorite={handleAddFavorite}
          />
        )}

        {/* TAB 4: SAVED FAVORITES */}
        {activeTab === 'favorites' && (
          <CommuterView
            routes={routes}
            buses={buses}
            favorites={favorites}
            tripHistory={tripHistory}
            onSelectBus={(busId) => {
              setSelectedBusId(busId);
              setActiveTab('map');
            }}
            onSelectRoute={(routeId) => {
              setSelectedRouteId(routeId);
              setActiveTab('map');
            }}
            onOpenAIChat={() => setIsAIChatOpen(true)}
            onAddFavorite={handleAddFavorite}
          />
        )}

        {/* TAB 5: DRIVER TERMINAL HUD */}
        {activeTab === 'driver_hud' && (
          <DriverView
            currentUser={currentUser}
            buses={buses}
            routes={routes}
            onUpdateBusStatus={handleUpdateBusStatus}
            isSimulating={isSimulating}
            onToggleSimulator={handleToggleSimulator}
          />
        )}

        {/* TAB 6: FLEET MANAGEMENT */}
        {activeTab === 'fleet' && (
          <DepotAdminView
            depots={depots}
            buses={buses}
            routes={routes}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateBusStatus={handleUpdateBusStatus}
            onAddBus={handleAddBus}
            onAddRoute={handleAddRoute}
          />
        )}

        {/* TAB 7: DEPOT OPERATIONS */}
        {activeTab === 'depots' && (
          <DepotAdminView
            depots={depots}
            buses={buses}
            routes={routes}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateBusStatus={handleUpdateBusStatus}
            onAddBus={handleAddBus}
            onAddRoute={handleAddRoute}
          />
        )}

        {/* TAB 8: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <DepotAdminView
            depots={depots}
            buses={buses}
            routes={routes}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onUpdateBusStatus={handleUpdateBusStatus}
            onAddBus={handleAddBus}
            onAddRoute={handleAddRoute}
          />
        )}

        {/* TAB 9: ANALYTICS & SYSTEM PERFORMANCE */}
        {activeTab === 'analytics' && (
          <AnalyticsView analytics={analytics} buses={buses} />
        )}

        {/* TAB 10: AUDIT LOGS */}
        {activeTab === 'audit_logs' && (
          <SuperAdminView
            auditLogs={auditLogs}
            users={mockUsers}
            analytics={analytics}
            buses={buses}
            depots={depots}
          />
        )}

        {/* TAB 11: USER DIRECTORY & RBAC */}
        {activeTab === 'users' && (
          <SuperAdminView
            auditLogs={auditLogs}
            users={mockUsers}
            analytics={analytics}
            buses={buses}
            depots={depots}
          />
        )}

      </main>

      {/* AI Assistant Chatbot Modal */}
      <AIChatbotModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

    </div>
  );
}
