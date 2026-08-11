import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Bus, Route, Depot } from '../types';
import {
  Navigation2,
  Users,
  Gauge,
  MapPin,
  Layers,
  Search,
  Maximize2,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Info,
  Clock,
  Bus as BusIcon,
} from 'lucide-react';

interface MapViewProps {
  buses: Bus[];
  routes: Route[];
  depots: Depot[];
  selectedBusId?: string;
  onSelectBus: (busId: string) => void;
  selectedRouteId?: string;
  onSelectRoute: (routeId?: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  buses,
  routes,
  depots,
  selectedBusId,
  onSelectBus,
  selectedRouteId,
  onSelectRoute,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapInstance = useRef<L.Map | null>(null);
  const busMarkersGroup = useRef<L.LayerGroup | null>(null);
  const routePolylinesGroup = useRef<L.LayerGroup | null>(null);

  const [crowdingFilter, setCrowdingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mapStyle, setMapStyle] = useState<'dark' | 'light'>('dark');
  const [autoFollowSelected, setAutoFollowSelected] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Bus Stand Arrival Bar state
  const [selectedStandName, setSelectedStandName] = useState<string>('CBT Central Bus Terminal');

  // List of all unique stands across Belagavi network
  const allBusStands = Array.from(
    new Set([
      'CBT Central Bus Terminal',
      'Rani Chennamma Circle',
      'Tilakwadi Third Gate',
      'Peeranwadi Cross',
      'VTU Campus Machhe',
      'Camp Area Post Office',
      'Kakati Industrial Area',
      'Sambra Airport Gate',
      ...routes.flatMap((r) => (r.stops ? r.stops.map((s) => s.name) : [r.startStop, r.endStop])),
    ])
  );

  // Compute upcoming arrivals for selected stand
  const standArrivals = buses.map((bus) => {
    const routeObj = routes.find((r) => r.id === bus.routeId || r.code === bus.routeCode);
    const stopsList = routeObj?.stops || [];
    const targetStopIndex = stopsList.findIndex((s) => s.name.toLowerCase() === selectedStandName.toLowerCase());

    let estimatedEtaMin = bus.etaToNextStopMin || 5;
    if (bus.nextStopName.toLowerCase() === selectedStandName.toLowerCase()) {
      estimatedEtaMin = bus.etaToNextStopMin || 2;
    } else if (targetStopIndex > 0) {
      estimatedEtaMin = Math.max(1, (targetStopIndex + 1) * 4);
    }

    return {
      bus,
      route: routeObj,
      etaMin: estimatedEtaMin,
    };
  }).sort((a, b) => a.etaMin - b.etaMin);

  const nextArriving = standArrivals[0];

  // Pan map when selected stand changes
  const handleSelectStand = (standName: string) => {
    setSelectedStandName(standName);
    const targetStop = routes
      .flatMap((r) => r.stops || [])
      .find((s) => s.name.toLowerCase() === standName.toLowerCase());

    if (targetStop && leafletMapInstance.current) {
      leafletMapInstance.current.setView([targetStop.lat, targetStop.lng], 15, { animate: true });
    }
  };

  // Initialize Leaflet Map Instance for Belagavi City
  useEffect(() => {
    if (!mapRef.current || leafletMapInstance.current) return;

    // Center on Belagavi Rani Chennamma Circle / CBT
    const map = L.map(mapRef.current, {
      center: [15.8569, 74.5070],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrl = mapStyle === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    busMarkersGroup.current = L.layerGroup().addTo(map);
    routePolylinesGroup.current = L.layerGroup().addTo(map);

    leafletMapInstance.current = map;

    return () => {
      map.remove();
      leafletMapInstance.current = null;
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    if (!leafletMapInstance.current) return;
    const map = leafletMapInstance.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl = mapStyle === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);
  }, [mapStyle]);

  // Automatic Zoom-to-Fit Feature when a specific route is selected or changed
  useEffect(() => {
    if (!leafletMapInstance.current) return;
    const map = leafletMapInstance.current;

    if (selectedRouteId) {
      const targetRoute = routes.find((r) => r.id === selectedRouteId);
      if (targetRoute) {
        const coords: [number, number][] = [];

        if (targetRoute.pathCoordinates && targetRoute.pathCoordinates.length > 0) {
          coords.push(...targetRoute.pathCoordinates);
        }

        if (targetRoute.stops && targetRoute.stops.length > 0) {
          targetRoute.stops.forEach((s) => coords.push([s.lat, s.lng]));
        }

        // Include locations of active buses on this route
        const routeBuses = buses.filter((b) => b.routeId === targetRoute.id);
        routeBuses.forEach((b) => coords.push([b.currentLat, b.currentLng]));

        if (coords.length > 0) {
          const bounds = L.latLngBounds(coords);
          map.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: 15,
            animate: true,
          });
        }
      }
    } else {
      // Zoom to fit entire Belagavi city transit network when "All Routes" selected
      const allCoords: [number, number][] = [];
      routes.forEach((r) => {
        if (r.pathCoordinates) allCoords.push(...r.pathCoordinates);
        if (r.stops) r.stops.forEach((s) => allCoords.push([s.lat, s.lng]));
      });
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13,
          animate: true,
        });
      }
    }
  }, [selectedRouteId, routes]);

  // Render Route Polylines, Stops & Depots
  useEffect(() => {
    if (!leafletMapInstance.current || !routePolylinesGroup.current) return;
    const group = routePolylinesGroup.current;
    group.clearLayers();

    routes.forEach((route) => {
      if (selectedRouteId && selectedRouteId !== route.id) return;

      if (route.pathCoordinates && route.pathCoordinates.length > 0) {
        const polyline = L.polyline(route.pathCoordinates as L.LatLngExpression[], {
          color: route.color || '#3b82f6',
          weight: selectedRouteId === route.id ? 6 : 4,
          opacity: selectedRouteId === route.id ? 0.95 : 0.65,
        });

        polyline.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <div style="font-weight: 800; color: ${route.color}; font-size: 14px;">${route.code}</div>
            <div style="font-size: 12px; font-weight: 600; margin-top: 2px;">${route.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
              Distance: ${route.totalDistanceKm} km • Standard Fare: ₹${route.fareStandard}
            </div>
          </div>
        `);

        group.addLayer(polyline);

        // Render Stop Markers
        route.stops.forEach((stop) => {
          const stopIcon = L.divIcon({
            className: 'custom-stop-icon',
            html: `
              <div style="
                width: ${stop.isMajorHub ? '14px' : '10px'};
                height: ${stop.isMajorHub ? '14px' : '10px'};
                background: ${stop.isMajorHub ? '#38bdf8' : '#ffffff'};
                border: 2px solid ${route.color};
                border-radius: 50%;
                box-shadow: 0 0 6px rgba(0,0,0,0.5);
              "></div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          // Find active bus on this route
          const routeBus = buses.find((b) => b.routeId === route.id || b.routeCode === route.code);
          const nextBusNumber = routeBus ? routeBus.fleetNumber : 'KA-22-F-1024';
          const nextBusEta = routeBus ? (routeBus.etaToNextStopMin || 5) : 5;

          const stopMarker = L.marker([stop.lat, stop.lng], { icon: stopIcon });
          stopMarker.on('click', () => {
            setSelectedStandName(stop.name);
          });
          stopMarker.bindPopup(`
            <div style="font-family: system-ui, sans-serif; padding: 6px; min-width: 180px;">
              <div style="font-weight: 800; font-size: 13px; color: #0f172a;">📍 ${stop.name} (${stop.code})</div>
              <div style="font-size: 11px; color: #2563eb; font-weight: 700; margin-top: 3px;">Route: ${route.code} - ${route.name}</div>
              
              <div style="margin-top: 8px; padding: 6px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
                <div style="font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase;">NEXT ARRIVING BUS</div>
                <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-top: 2px;">🚌 ${nextBusNumber}</div>
                <div style="font-size: 11px; font-weight: 700; color: #15803d; margin-top: 2px;">⏱️ Arriving in ~${nextBusEta} mins</div>
              </div>

              <div style="font-size: 10px; color: #64748b; margin-top: 6px;">${stop.isMajorHub ? '★ Major Belagavi Transit Hub' : 'Belagavi City Bus Stop'}</div>
            </div>
          `);
          group.addLayer(stopMarker);
        });
      }
    });

    // Render Depot Markers
    depots.forEach((depot) => {
      const depotIcon = L.divIcon({
        className: 'custom-depot-icon',
        html: `
          <div style="
            background: #f59e0b;
            color: #ffffff;
            padding: 3px 7px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 800;
            border: 1.5px solid #ffffff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5);
            white-space: nowrap;
            font-family: system-ui, sans-serif;
          ">
            🏢 ${depot.code}
          </div>
        `,
        iconAnchor: [24, 12],
      });

      const depotMarker = L.marker([depot.lat, depot.lng], { icon: depotIcon });
      depotMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${depot.name}</div>
          <div style="font-size: 11px; color: #d97706; font-weight: 600; margin-top: 2px;">Fleet Capacity: ${depot.activeBusesCount} / ${depot.capacity} Buses</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Manager: ${depot.managerName}</div>
        </div>
      `);
      group.addLayer(depotMarker);
    });

  }, [routes, depots, selectedRouteId]);

  // Render Custom Bus Marker Icons by Bus Status (Active, Delayed, Out of Service / Workshop)
  useEffect(() => {
    if (!leafletMapInstance.current || !busMarkersGroup.current) return;
    const group = busMarkersGroup.current;
    group.clearLayers();

    const filteredBuses = buses.filter((bus) => {
      if (selectedRouteId && bus.routeId !== selectedRouteId) return false;
      if (crowdingFilter !== 'all' && bus.crowdingLevel !== crowdingFilter) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && bus.status !== 'in_transit' && bus.status !== 'at_stop') return false;
        if (statusFilter === 'delayed' && bus.status !== 'delayed') return false;
        if (statusFilter === 'out_of_service' && bus.status !== 'out_of_service' && bus.status !== 'maintenance') return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          bus.fleetNumber.toLowerCase().includes(query) ||
          bus.routeCode.toLowerCase().includes(query) ||
          bus.nextStopName.toLowerCase().includes(query) ||
          bus.status.toLowerCase().includes(query)
        );
      }
      return true;
    });

    filteredBuses.forEach((bus) => {
      const isSelected = bus.id === selectedBusId;

      // Custom marker icon variables based on bus status
      let statusBadgeBg = '#10b981'; // Green for active / in_transit / at_stop
      let statusText = 'ACTIVE';
      let statusSymbol = '🚌';
      let borderColor = bus.routeColor || '#3b82f6';
      let cardBg = isSelected ? '#1e3a8a' : '#0f172a';
      let shadowEffect = isSelected ? '0 0 20px rgba(59, 130, 246, 0.9)' : '0 4px 14px rgba(0, 0, 0, 0.5)';

      if (bus.status === 'delayed') {
        statusBadgeBg = '#f59e0b'; // Amber for delayed
        statusText = 'DELAYED';
        statusSymbol = '⚠️';
        borderColor = '#f59e0b';
        cardBg = isSelected ? '#78350f' : '#1c1917';
        shadowEffect = isSelected ? '0 0 22px rgba(245, 158, 11, 0.9)' : '0 4px 14px rgba(245, 158, 11, 0.3)';
      } else if (bus.status === 'out_of_service' || bus.status === 'maintenance') {
        statusBadgeBg = '#ef4444'; // Red for out of service / workshop
        statusText = bus.status === 'maintenance' ? 'WORKSHOP' : 'OFF DUTY';
        statusSymbol = '🛠️';
        borderColor = '#64748b';
        cardBg = isSelected ? '#450a0a' : '#1e293b';
        shadowEffect = isSelected ? '0 0 22px rgba(239, 68, 68, 0.9)' : '0 4px 12px rgba(0, 0, 0, 0.6)';
      }

      const crowdingColor =
        bus.crowdingLevel === 'high' ? '#ef4444' : bus.crowdingLevel === 'medium' ? '#f59e0b' : '#10b981';

      // HTML template for the custom bus status marker
      const busIconHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          background: ${cardBg};
          color: white;
          padding: 5px 10px;
          border-radius: 10px;
          border: 2px solid ${borderColor};
          box-shadow: ${shadowEffect};
          transform: scale(${isSelected ? '1.18' : '1.0'});
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          font-family: system-ui, -apple-system, sans-serif;
          cursor: pointer;
        ">
          <!-- Status Icon Symbol Badge -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 6px;
            background: ${statusBadgeBg};
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 0 8px ${statusBadgeBg}88;
            flex-shrink: 0;
          ">
            ${statusSymbol}
          </div>

          <!-- Bus Fleet & Status Labels -->
          <div style="display: flex; flex-direction: column; line-height: 1.15;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-weight: 900; font-size: 12px; letter-spacing: -0.01em;">${bus.fleetNumber}</span>
              <span style="
                font-size: 8px;
                font-weight: 800;
                padding: 1px 4px;
                border-radius: 4px;
                background: ${statusBadgeBg}25;
                color: ${statusBadgeBg};
                border: 1px solid ${statusBadgeBg}55;
                text-transform: uppercase;
                letter-spacing: 0.02em;
              ">${statusText}</span>
            </div>
            <div style="font-size: 9px; color: #cbd5e1; font-weight: 600; margin-top: 1px; display: flex; align-items: center; gap: 4px;">
              <span style="color: #60a5fa; font-weight: 700;">${bus.routeCode}</span>
              <span>•</span>
              <span>${bus.speed} km/h</span>
            </div>
          </div>

          <!-- Passenger Crowding Level Indicator Pill -->
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${crowdingColor};
            border: 2px solid #0f172a;
            box-shadow: 0 0 6px ${crowdingColor};
          " title="Crowding: ${bus.crowdingLevel}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: busIconHtml,
        iconSize: [145, 38],
        iconAnchor: [72, 19],
      });

      const marker = L.marker([bus.currentLat, bus.currentLng], { icon: customIcon });

      marker.on('click', () => {
        onSelectBus(bus.id);
        if (autoFollowSelected && leafletMapInstance.current) {
          leafletMapInstance.current.panTo([bus.currentLat, bus.currentLng], { animate: true });
        }
      });

      group.addLayer(marker);
    });

    if (selectedBusId && autoFollowSelected && leafletMapInstance.current) {
      const activeBus = buses.find((b) => b.id === selectedBusId);
      if (activeBus) {
        leafletMapInstance.current.panTo([activeBus.currentLat, activeBus.currentLng], { animate: true });
      }
    }
  }, [buses, selectedBusId, selectedRouteId, crowdingFilter, statusFilter, searchQuery, autoFollowSelected]);

  // Helper trigger to auto zoom-to-fit currently selected route
  const handleTriggerZoomToFit = () => {
    if (!leafletMapInstance.current) return;
    const map = leafletMapInstance.current;

    if (selectedRouteId) {
      const targetRoute = routes.find((r) => r.id === selectedRouteId);
      if (targetRoute) {
        const coords: [number, number][] = [
          ...(targetRoute.pathCoordinates || []),
          ...targetRoute.stops.map((s) => [s.lat, s.lng] as [number, number]),
        ];
        if (coords.length > 0) {
          map.fitBounds(L.latLngBounds(coords), { padding: [60, 60], maxZoom: 15, animate: true });
        }
      }
    } else {
      const allCoords: [number, number][] = [];
      routes.forEach((r) => {
        if (r.pathCoordinates) allCoords.push(...r.pathCoordinates);
        r.stops.forEach((s) => allCoords.push([s.lat, s.lng]));
      });
      if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50], maxZoom: 13, animate: true });
      }
    }
  };

  const selectedBus = buses.find((b) => b.id === selectedBusId);
  const selectedRouteObj = routes.find((r) => r.id === selectedRouteId);

  return (
    <div className="relative w-full h-[calc(100vh-8.5rem)] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col md:flex-row">
      
      {/* Map Control Bar & Bus Stand Live Telemetry Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none space-y-2">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search & Filter Controls */}
          <div className="pointer-events-auto flex items-center gap-2 flex-wrap bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl">
            
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bus, route, stop in Belagavi..."
                className="bg-slate-800 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={selectedRouteId || ''}
              onChange={(e) => onSelectRoute(e.target.value || undefined)}
              className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Routes (Network Overview)</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.name}
                </option>
              ))}
            </select>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Bus Statuses</option>
              <option value="active">🟢 Active / Running</option>
              <option value="delayed">🟡 Route Delayed</option>
              <option value="out_of_service">🔴 Out of Service / Workshop</option>
            </select>

            <select
              value={crowdingFilter}
              onChange={(e) => setCrowdingFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Passenger Loading</option>
              <option value="low">🟢 Low Load (&lt;40%)</option>
              <option value="medium">🟡 Medium Load</option>
              <option value="high">🔴 High Load (&gt;80%)</option>
            </select>

          </div>

          {/* Action Controls: Zoom to Fit, Follow & Layer Style */}
          <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl">
            
            <button
              onClick={handleTriggerZoomToFit}
              title="Auto Zoom-to-Fit Selected Route"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{selectedRouteId ? `Fit ${selectedRouteObj?.code || 'Route'}` : 'Fit All Routes'}</span>
            </button>

            <button
              onClick={() => setMapStyle(mapStyle === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>{mapStyle === 'dark' ? 'Dark Map' : 'Street Map'}</span>
            </button>

            <button
              onClick={() => setAutoFollowSelected(!autoFollowSelected)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                autoFollowSelected
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto Follow</span>
            </button>
          </div>
        </div>

        {/* --- DEDICATED BUS STAND SELECTOR & LIVE ARRIVAL ETA BAR --- */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-2.5 shadow-2xl space-y-2 max-w-full animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            
            {/* Stand Selector Dropdown & Quick Stand Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bus Stand:</span>
              </div>

              <select
                value={selectedStandName}
                onChange={(e) => handleSelectStand(e.target.value)}
                className="bg-slate-800 text-xs font-extrabold text-emerald-300 px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-inner"
              >
                {allBusStands.map((stand) => (
                  <option key={stand} value={stand}>
                    🚏 {stand}
                  </option>
                ))}
              </select>

              {/* Quick Stand Pills */}
              <div className="hidden sm:flex items-center gap-1">
                {['CBT Central Bus Terminal', 'Rani Chennamma Circle', 'Tilakwadi Third Gate', 'VTU Campus Machhe', 'Peeranwadi Cross'].map((quickStand) => (
                  <button
                    key={quickStand}
                    onClick={() => handleSelectStand(quickStand)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                      selectedStandName === quickStand
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {quickStand.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Arriving Bus & Live ETA Banner */}
            {nextArriving && (
              <div className="flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs shadow-lg">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-extrabold text-emerald-300 text-[10px] uppercase tracking-wider hidden md:inline">
                    Next Bus at {selectedStandName.split(' ')[0]}:
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[11px]">
                    {nextArriving.bus.routeCode}
                  </span>
                  <span className="font-bold text-white text-xs">{nextArriving.bus.fleetNumber}</span>
                  <span className="text-emerald-400 font-black text-xs font-mono bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
                    ⏱️ ETA: {nextArriving.etaMin} min
                  </span>
                </div>

                <div className="text-[10px] font-semibold text-slate-300 hidden lg:block">
                  To: <span className="text-amber-300 font-bold">{nextArriving.route?.endStop || 'Terminal'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Scannable Horizontal Sequence Bar of Upcoming Arrivals at this Stand */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-0.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" /> Stand Sequence:
            </span>
            {standArrivals.slice(0, 5).map(({ bus, route, etaMin }, idx) => (
              <div
                key={bus.id}
                onClick={() => onSelectBus(bus.id)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-xl border text-[11px] flex items-center gap-2 cursor-pointer transition-all ${
                  idx === 0
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200 font-bold shadow'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="font-bold text-blue-400">{bus.routeCode}</span>
                <span className="font-mono text-slate-200">{bus.fleetNumber}</span>
                <span className={`font-black font-mono px-1.5 py-0.5 rounded ${
                  idx === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/10 text-amber-300'
                }`}>
                  {etaMin}m
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Map Legend Overlay (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 text-xs space-y-2 shadow-2xl max-w-xs hidden sm:block">
        <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" /> Bus Status Icons Legend
          </span>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-[10px] text-slate-400 hover:text-slate-200"
          >
            {showLegend ? 'Hide' : 'Show'}
          </button>
        </div>

        {showLegend && (
          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">🚌</span>
              <span className="text-slate-300 font-medium">Active / Running On Schedule</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">⚠️</span>
              <span className="text-slate-300 font-medium">Route Traffic Delayed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-rose-500 text-white font-bold flex items-center justify-center text-[10px]">🛠️</span>
              <span className="text-slate-300 font-medium">Out of Service / Depot Workshop</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Leaflet Map Canvas */}
      <div ref={mapRef} className="w-full h-full min-h-[380px] z-10 bg-slate-950" />

      {/* Selected Bus Telemetry Sidebar */}
      {selectedBus && (
        <div className="w-full md:w-80 bg-slate-900/95 backdrop-blur-md border-t md:border-t-0 md:border-l border-slate-800 p-4 z-20 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
                    {selectedBus.fleetNumber}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{selectedBus.licensePlate}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-1">{selectedBus.routeCode}</h3>
              </div>
              <button
                onClick={() => onSelectBus('')}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Status Highlight Banner */}
            <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
              selectedBus.status === 'delayed'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : selectedBus.status === 'out_of_service' || selectedBus.status === 'maintenance'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            }`}>
              <div className="font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                {selectedBus.status === 'delayed' ? (
                  <><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Route Delay Reported</>
                ) : selectedBus.status === 'out_of_service' || selectedBus.status === 'maintenance' ? (
                  <><Wrench className="w-3.5 h-3.5 text-rose-400" /> Out of Service / Workshop</>
                ) : (
                  <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Operational Shift</>
                )}
              </div>
              <p className="text-[11px] opacity-90">
                {selectedBus.status === 'delayed'
                  ? 'Heavy traffic reported along route corridor.'
                  : selectedBus.status === 'out_of_service' || selectedBus.status === 'maintenance'
                  ? 'Under inspection or assigned to depot workshop.'
                  : 'Operating normally across Belagavi city transit network.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1.5">
              <div className="text-slate-400 font-medium">NWKRTC Bus & Driver</div>
              <div className="text-slate-200 font-semibold">{selectedBus.model}</div>
              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-700/60">
                <span>Driver:</span>
                <span className="text-blue-300 font-semibold">{selectedBus.driverName || 'Assigned Driver'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Gauge className="w-3.5 h-3.5 text-blue-400" /> Speed
                </div>
                <div className="text-base font-bold text-slate-100 mt-1">{selectedBus.speed} <span className="text-xs text-slate-400 font-normal">km/h</span></div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> Occupancy
                </div>
                <div className="text-base font-bold text-slate-100 mt-1">
                  {selectedBus.currentPassengers} / {selectedBus.capacity}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-800 border border-blue-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between text-blue-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> Next Stop
                </span>
                <span className="text-emerald-400 font-bold">{selectedBus.etaToNextStopMin} min ETA</span>
              </div>
              <div className="text-slate-100 font-bold text-sm">{selectedBus.nextStopName}</div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Crowding Level:</span>
                <span className="capitalize font-bold text-slate-200">{selectedBus.crowdingLevel}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    selectedBus.crowdingLevel === 'high'
                      ? 'bg-red-500'
                      : selectedBus.crowdingLevel === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.round((selectedBus.currentPassengers / selectedBus.capacity) * 100)}%` }}
                />
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
            Belagavi GPS Ping: {selectedBus.lastUpdated}
          </div>
        </div>
      )}

    </div>
  );
};
