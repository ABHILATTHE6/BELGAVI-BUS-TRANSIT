import React, { useState } from 'react';
import { Depot, Bus, Route, Announcement } from '../types';
import {
  Building2,
  Bus as BusIcon,
  Plus,
  CheckCircle2,
  Bell,
  Search,
  Route as RouteIcon,
  X,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface DepotAdminViewProps {
  depots: Depot[];
  buses: Bus[];
  routes: Route[];
  announcements: Announcement[];
  onAddAnnouncement: (ann: Partial<Announcement>) => void;
  onUpdateBusStatus: (busId: string, status: string) => void;
  onAddBus?: (newBus: Partial<Bus>) => void;
  onAddRoute?: (newRoute: Partial<Route>) => void;
}

export const DepotAdminView: React.FC<DepotAdminViewProps> = ({
  depots,
  buses,
  routes,
  announcements,
  onAddAnnouncement,
  onUpdateBusStatus,
  onAddBus,
  onAddRoute,
}) => {
  const currentDepot = depots[0] || { id: 'depot-cbt', name: 'CBT Central Bus Terminal Depot', code: 'DPT-BGM-01', managerName: 'Basavaraj Kulkarni', contactPhone: '+91 831 2422001' };

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'delay' | 'general' | 'route_change' | 'maintenance'>('general');
  const [annPriority, setAnnPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [annSuccess, setAnnSuccess] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // Modal toggle states
  const [isAddBusModalOpen, setIsAddBusModalOpen] = useState(false);
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Bus form state
  const [busFleetNumber, setBusFleetNumber] = useState('');
  const [busLicensePlate, setBusLicensePlate] = useState('');
  const [busModel, setBusModel] = useState('Tata Starbus EV Zero Emission');
  const [busCapacity, setBusCapacity] = useState('65');
  const [busRouteId, setBusRouteId] = useState(routes[0]?.id || 'route-101');
  const [busDepotId, setBusDepotId] = useState(currentDepot.id || 'depot-cbt');
  const [busDriverName, setBusDriverName] = useState('');
  const [busStatus, setBusStatus] = useState<'in_transit' | 'at_stop' | 'maintenance' | 'out_of_service'>('at_stop');

  // New Route form state
  const [routeCode, setRouteCode] = useState('');
  const [routeName, setRouteName] = useState('');
  const [routeColor, setRouteColor] = useState('#2563eb');
  const [routeStartStop, setRouteStartStop] = useState('CBT Central Bus Terminal');
  const [routeEndStop, setRouteEndStop] = useState('');
  const [routeDistance, setRouteDistance] = useState('12.5');
  const [routeDuration, setRouteDuration] = useState('30');
  const [routeFareStandard, setRouteFareStandard] = useState('15');
  const [routeFareExpress, setRouteFareExpress] = useState('20');
  const [routeStopsInput, setRouteStopsInput] = useState('CBT Central Bus Terminal, Rani Chennamma Circle, Tilakwadi Third Gate');

  const depotBuses = buses.filter((b) => b.depotId === currentDepot.id || b.depotId === 'depot-cbt');

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    onAddAnnouncement({
      title: annTitle,
      content: annContent,
      category: annCategory,
      priority: annPriority,
      author: `${currentDepot.name} Dispatch`,
      targetRole: 'all',
      depotId: currentDepot.id,
    });

    setAnnTitle('');
    setAnnContent('');
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  const handleCreateBusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRouteObj = routes.find((r) => r.id === busRouteId) || routes[0];
    const generatedFleet = busFleetNumber || `KA-22-F-${Math.floor(1000 + Math.random() * 9000)}`;

    if (onAddBus) {
      onAddBus({
        fleetNumber: generatedFleet,
        licensePlate: busLicensePlate || generatedFleet,
        model: busModel,
        capacity: Number(busCapacity) || 60,
        currentPassengers: 0,
        routeId: selectedRouteObj?.id || 'route-101',
        routeCode: selectedRouteObj?.code || 'KA-22-R01',
        depotId: busDepotId,
        driverName: busDriverName || 'Assigned Driver',
        status: busStatus,
        nextStopName: selectedRouteObj?.startStop || 'CBT Central Bus Terminal',
        etaToNextStopMin: 5,
        routeColor: selectedRouteObj?.color || '#2563eb',
      });
    }

    setIsAddBusModalOpen(false);
    setBusFleetNumber('');
    setBusLicensePlate('');
    setBusDriverName('');
    setSuccessMessage(`Bus ${generatedFleet} added to Depot fleet successfully!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleCreateRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedCode = routeCode || `KA-22-R0${routes.length + 1}`;
    const generatedName = routeName || `${routeStartStop} to ${routeEndStop || 'Belagavi Suburb'}`;

    const parsedStops = routeStopsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((stopName, idx) => ({
        stopId: `stop-${Date.now()}-${idx}`,
        name: stopName,
        code: `${stopName.substring(0, 3).toUpperCase()}-0${idx + 1}`,
        lat: 15.8583 - idx * 0.01,
        lng: 74.5078 + idx * 0.008,
        sequence: idx + 1,
        isMajorHub: idx === 0 || idx === routeStopsInput.split(',').length - 1,
        avgStopDurationSec: 60,
      }));

    if (onAddRoute) {
      onAddRoute({
        code: generatedCode,
        name: generatedName,
        color: routeColor,
        startStop: routeStartStop,
        endStop: routeEndStop || parsedStops[parsedStops.length - 1]?.name || 'Destination Stop',
        totalDistanceKm: Number(routeDistance) || 10,
        avgDurationMin: Number(routeDuration) || 25,
        fareStandard: Number(routeFareStandard) || 15,
        fareExpress: Number(routeFareExpress) || 20,
        stops: parsedStops,
      });
    }

    setIsAddRouteModalOpen(false);
    setRouteCode('');
    setRouteName('');
    setRouteEndStop('');
    setSuccessMessage(`New Belagavi Route ${generatedCode} (${generatedName}) created successfully!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const filteredFleet = depotBuses.filter((b) =>
    b.fleetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100">
      
      {/* Depot Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> NWKRTC Belagavi Depot Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">Code: {currentDepot.code}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {currentDepot.name}
          </h1>

          <p className="text-xs text-slate-300">
            Manager: <span className="font-semibold text-slate-100">{currentDepot.managerName}</span> • Phone: {currentDepot.contactPhone}
          </p>
        </div>

        {/* Action Buttons: Add Bus & Add Route */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsAddBusModalOpen(true)}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bus to Fleet</span>
          </button>

          <button
            onClick={() => setIsAddRouteModalOpen(true)}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <RouteIcon className="w-4 h-4" />
            <span>Create New Route</span>
          </button>
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Grid: Fleet Management & Announcement Publisher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Fleet Status Roster */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BusIcon className="w-4 h-4 text-amber-400" /> Belagavi Bus Fleet Roster ({filteredFleet.length})
              </h3>
              <p className="text-xs text-slate-400">Monitor fuel levels, active driver assignments, and maintenance status.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bus fleet..."
                  className="bg-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 w-44"
                />
              </div>

              <button
                onClick={() => setIsAddBusModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-600/30 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bus</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-3 px-3">Fleet ID</th>
                  <th className="py-3 px-3">Model</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Fuel %</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredFleet.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-bold font-mono text-blue-300">
                      {bus.fleetNumber}
                      <div className="text-[10px] text-slate-500">{bus.licensePlate}</div>
                    </td>
                    <td className="py-3 px-3 font-medium max-w-[140px] truncate">{bus.model}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold">
                        {bus.routeCode}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        bus.status === 'in_transit'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : bus.status === 'delayed'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {bus.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-emerald-400">
                      {bus.fuelLevel}%
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      {bus.status === 'maintenance' ? (
                        <button
                          onClick={() => onUpdateBusStatus(bus.id, 'in_transit')}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                        >
                          Clear Maintenance
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateBusStatus(bus.id, 'maintenance')}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[10px] font-semibold"
                        >
                          Send to Workshop
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Depot Announcement Publisher & Active Routes List */}
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Publish Depot Notice</span>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Notice Title
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. CBT Platform 2 Maintenance Notice..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 px-2.5 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="general">General</option>
                    <option value="delay">Delay Advisory</option>
                    <option value="route_change">Route Adjustment</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Priority
                  </label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 px-2.5 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Notice Body
                </label>
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  rows={3}
                  placeholder="Detailed message for drivers and passengers..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Broadcast Announcement</span>
              </button>
            </form>

            {annSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Announcement published successfully!
              </div>
            )}
          </div>

          {/* Quick Active Routes List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <RouteIcon className="w-4 h-4 text-blue-400" /> Configured Routes ({routes.length})
              </h4>
              <button
                onClick={() => setIsAddRouteModalOpen(true)}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> New Route
              </button>
            </div>

            <div className="space-y-2">
              {routes.map((r) => (
                <div key={r.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white font-mono px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: r.color }}>
                      {r.code}
                    </span>
                    <span className="ml-2 font-medium text-slate-200">{r.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">₹{r.fareStandard}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* --- MODAL 1: ADD BUS FORM --- */}
      {isAddBusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <BusIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Bus to Depot Fleet</h3>
                  <p className="text-xs text-slate-400">Register new NWKRTC vehicle to Belagavi roster</p>
                </div>
              </div>
              <button onClick={() => setIsAddBusModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBusSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Fleet Number</label>
                  <input
                    type="text"
                    value={busFleetNumber}
                    onChange={(e) => setBusFleetNumber(e.target.value)}
                    placeholder="e.g. KA-22-F-1088"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">License Plate</label>
                  <input
                    type="text"
                    value={busLicensePlate}
                    onChange={(e) => setBusLicensePlate(e.target.value)}
                    placeholder="e.g. KA-22-F-1088"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Vehicle Model</label>
                  <select
                    value={busModel}
                    onChange={(e) => setBusModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Tata Starbus EV Zero Emission">Tata Starbus EV (Zero Emission)</option>
                    <option value="Ashok Leyland JanBus Low-Floor">Ashok Leyland JanBus Low-Floor</option>
                    <option value="Eicher Skyline Pro Express">Eicher Skyline Pro Express</option>
                    <option value="Volvo 8400 City AC Bus">Volvo 8400 City AC Bus</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Passenger Capacity</label>
                  <input
                    type="number"
                    value={busCapacity}
                    onChange={(e) => setBusCapacity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Assigned Route</label>
                  <select
                    value={busRouteId}
                    onChange={(e) => setBusRouteId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>{r.code} - {r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Assigned Depot</label>
                  <select
                    value={busDepotId}
                    onChange={(e) => setBusDepotId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {depots.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Assigned Driver Name</label>
                  <input
                    type="text"
                    value={busDriverName}
                    onChange={(e) => setBusDriverName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Initial Status</label>
                  <select
                    value={busStatus}
                    onChange={(e) => setBusStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="at_stop">At Stop / Terminal</option>
                    <option value="in_transit">In Transit (Active)</option>
                    <option value="maintenance">Depot Workshop</option>
                    <option value="out_of_service">Off Duty</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30"
                >
                  Confirm & Register Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD ROUTE FORM --- */}
      {isAddRouteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <RouteIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Belagavi City Route</h3>
                  <p className="text-xs text-slate-400">Configure route line, fares, and bus stop sequences</p>
                </div>
              </div>
              <button onClick={() => setIsAddRouteModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRouteSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Route Code</label>
                  <input
                    type="text"
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value)}
                    placeholder="e.g. KA-22-R05"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Route Display Name</label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g. CBT to Tilakwadi First Gate via Camp"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Route Line Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={routeColor}
                      onChange={(e) => setRouteColor(e.target.value)}
                      className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <span className="font-mono text-slate-300 text-[11px]">{routeColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={routeDistance}
                    onChange={(e) => setRouteDistance(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Avg Duration (mins)</label>
                  <input
                    type="number"
                    value={routeDuration}
                    onChange={(e) => setRouteDuration(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Start Terminal Stop</label>
                  <input
                    type="text"
                    value={routeStartStop}
                    onChange={(e) => setRouteStartStop(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">End Terminal Stop</label>
                  <input
                    type="text"
                    value={routeEndStop}
                    onChange={(e) => setRouteEndStop(e.target.value)}
                    placeholder="e.g. Camp Area Post Office"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Standard Fare (₹)</label>
                  <input
                    type="number"
                    value={routeFareStandard}
                    onChange={(e) => setRouteFareStandard(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Express Fare (₹)</label>
                  <input
                    type="number"
                    value={routeFareExpress}
                    onChange={(e) => setRouteFareExpress(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Bus Stops Sequence (Comma-separated list)
                </label>
                <textarea
                  value={routeStopsInput}
                  onChange={(e) => setRouteStopsInput(e.target.value)}
                  rows={2}
                  placeholder="e.g. CBT Central Bus Terminal, Rani Chennamma Circle, Tilakwadi Third Gate, Peeranwadi Cross"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRouteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30"
                >
                  Create & Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
