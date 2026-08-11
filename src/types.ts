export type UserRole = 'commuter' | 'driver' | 'depot_admin' | 'super_admin';

export type BusStatus = 'in_transit' | 'at_stop' | 'delayed' | 'out_of_service' | 'maintenance';
export type CrowdingLevel = 'low' | 'medium' | 'high';
export type PriorityLevel = 'normal' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  assignedDepotId?: string;
  assignedBusId?: string;
  driverLicenseNumber?: string;
  rating?: number;
}

export interface Depot {
  id: string;
  name: string;
  code: string;
  city: string;
  lat: number;
  lng: number;
  capacity: number;
  activeBusesCount: number;
  totalDriversCount: number;
  managerName: string;
  contactPhone: string;
  status: 'operational' | 'busy' | 'maintenance';
}

export interface RouteStop {
  stopId: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  sequence: number;
  isMajorHub: boolean;
  avgStopDurationSec: number;
}

export interface Route {
  id: string;
  code: string;
  name: string;
  color: string;
  startStop: string;
  endStop: string;
  totalDistanceKm: number;
  avgDurationMin: number;
  fareStandard: number;
  fareExpress: number;
  stops: RouteStop[];
  activeBusesCount: number;
  pathCoordinates: [number, number][]; // [lat, lng][]
}

export interface Bus {
  id: string;
  fleetNumber: string;
  licensePlate: string;
  model: string;
  capacity: number;
  currentPassengers: number;
  routeId: string;
  routeCode: string;
  depotId: string;
  driverId: string;
  driverName?: string;
  status: BusStatus;
  currentLat: number;
  currentLng: number;
  speed: number; // km/h
  heading: number; // degrees 0-360
  nextStopId: string;
  nextStopName: string;
  etaToNextStopMin: number;
  crowdingLevel: CrowdingLevel;
  fuelLevel: number; // percentage
  lastUpdated: string;
  routeColor?: string;
}

export interface Schedule {
  id: string;
  routeId: string;
  routeCode: string;
  busId: string;
  busFleetNumber: string;
  driverId: string;
  driverName: string;
  departureTime: string; // e.g. "07:30 AM"
  arrivalTime: string;   // e.g. "08:45 AM"
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  frequencyMinutes: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: PriorityLevel;
  targetRole: 'all' | 'commuter' | 'driver' | 'depot_admin';
  depotId?: string;
  createdAt: string;
  author: string;
  category: 'delay' | 'route_change' | 'general' | 'maintenance' | 'weather';
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'delay' | 'schedule' | 'alert' | 'announcement' | 'system';
  read: boolean;
  timestamp: string;
  targetRole?: UserRole | 'all';
}

export interface FavoriteItem {
  id: string;
  userId: string;
  type: 'route' | 'stop';
  targetId: string;
  targetName: string;
  targetCode: string;
  createdAt: string;
}

export interface TripHistoryItem {
  id: string;
  userId: string;
  routeCode: string;
  routeName: string;
  busFleetNumber: string;
  fromStop: string;
  toStop: string;
  fare: number;
  timestamp: string;
  status: 'completed' | 'ongoing' | 'cancelled';
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  role: UserRole;
  target: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  routeCard?: {
    routeCode: string;
    routeName: string;
    duration: string;
    fare: string;
    transfers: number;
    crowding: CrowdingLevel;
  };
}

export interface RouteRecommendationRequest {
  origin: string;
  destination: string;
  preference?: 'fastest' | 'cheapest' | 'fewest_transfers';
}

export interface RouteRecommendationResult {
  routeCode: string;
  routeName: string;
  estimatedTimeMin: number;
  fare: number;
  transfers: number;
  crowding: CrowdingLevel;
  carbonSavedKg: number;
  steps: {
    type: 'walk' | 'bus';
    detail: string;
    durationMin: number;
    busCode?: string;
  }[];
}

export interface SystemAnalytics {
  activeBuses: number;
  totalRoutes: number;
  totalDepots: number;
  totalPassengersToday: number;
  onTimePerformancePct: number;
  totalRevenueToday: number;
  activeAlertsCount: number;
  fleetUtilizationPct: number;
  delayHeatmap: {
    region: string;
    avgDelayMin: number;
    delayCount: number;
  }[];
  hourlyPassengerTraffic: {
    hour: string;
    count: number;
  }[];
  driverRatings: {
    driverId: string;
    name: string;
    rating: number;
    onTimePct: number;
    tripsCompleted: number;
  }[];
}
