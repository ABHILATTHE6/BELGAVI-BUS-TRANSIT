import React, { useState } from 'react';
import { Bus, User, Route } from '../types';
import {
  Gauge,
  Users,
  AlertTriangle,
  Play,
  Square,
  Radio,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Navigation2
} from 'lucide-react';

interface DriverViewProps {
  currentUser: User;
  buses: Bus[];
  routes: Route[];
  onUpdateBusStatus: (busId: string, status: string, passengers?: number) => void;
  isSimulating: boolean;
  onToggleSimulator: () => void;
}

export const DriverView: React.FC<DriverViewProps> = ({
  currentUser,
  buses,
  routes,
  onUpdateBusStatus,
  isSimulating,
  onToggleSimulator,
}) => {
  const driverBus = buses.find((b) => b.driverId === currentUser.id) || buses[0];
  const assignedRoute = routes.find((r) => r.id === driverBus?.routeId) || routes[0];

  const [passengers, setPassengers] = useState<number>(driverBus?.currentPassengers || 35);
  const [tripState, setTripState] = useState<'idle' | 'active' | 'break'>('active');
  const [delayMessage, setDelayMessage] = useState<string>('');
  const [delaySent, setDelaySent] = useState<boolean>(false);

  const handlePassengerChange = (delta: number) => {
    const nextVal = Math.max(0, Math.min(driverBus.capacity, passengers + delta));
    setPassengers(nextVal);
    onUpdateBusStatus(driverBus.id, driverBus.status, nextVal);
  };

  const handleBroadcastDelay = () => {
    if (!delayMessage) return;
    onUpdateBusStatus(driverBus.id, 'delayed', passengers);
    setDelaySent(true);
    setTimeout(() => setDelaySent(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100">
      
      {/* Driver Active Trip HUD Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> NWKRTC Active Shift Terminal
            </span>
            <span className="text-xs text-slate-400 font-mono">Driver License: {currentUser.driverLicenseNumber || 'KA22-2018-00921'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <span>{currentUser.name}</span>
            <span className="text-sm font-semibold px-3 py-1 rounded-xl bg-slate-800 text-blue-400 border border-slate-700">
              {driverBus.fleetNumber}
            </span>
          </h1>

          <div className="text-xs text-slate-300 flex items-center gap-2">
            <span className="font-bold text-emerald-400">{assignedRoute.code}</span>
            <span>•</span>
            <span>{assignedRoute.name}</span>
            <span>•</span>
            <span className="text-slate-400">Rating: ⭐ {currentUser.rating || 4.9}</span>
          </div>
        </div>

        {/* Trip Controls & Telemetry Stream Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onToggleSimulator}
            className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
              isSimulating
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Radio className={`w-4 h-4 ${isSimulating ? 'text-emerald-400 animate-spin' : ''}`} />
            <span>{isSimulating ? 'Live Telemetry Transmitting' : 'Simulator Paused'}</span>
          </button>

          {tripState === 'active' ? (
            <button
              onClick={() => {
                setTripState('idle');
                onUpdateBusStatus(driverBus.id, 'out_of_service');
              }}
              className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Square className="w-4 h-4 text-red-400" />
              <span>End Shift</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setTripState('active');
                onUpdateBusStatus(driverBus.id, 'in_transit');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Play className="w-4 h-4" />
              <span>Start Trip Route</span>
            </button>
          )}
        </div>

      </div>

      {/* Main HUD Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Digital Speedometer & Occupancy Counter */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Telematics Gauge</span>
            <span className="text-xs font-mono text-emerald-400">100% Signal</span>
          </div>

          {/* Speed Gauge Display */}
          <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800">
            <Gauge className="w-12 h-12 text-blue-400 mb-2" />
            <div className="text-5xl font-black tracking-tight text-white font-mono">
              {driverBus.speed}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">KM / HOUR</div>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">Heading: {driverBus.heading}° South-West</div>
          </div>

          {/* Passenger Load Adjuster */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" /> Current Passengers
              </span>
              <span className="text-emerald-400 font-mono">{passengers} / {driverBus.capacity}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePassengerChange(-5)}
                className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-colors"
              >
                -5 Boarded
              </button>
              <button
                onClick={() => handlePassengerChange(5)}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-colors"
              >
                +5 Boarded
              </button>
            </div>

            {/* Load bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  passengers / driverBus.capacity > 0.8
                    ? 'bg-red-500'
                    : passengers / driverBus.capacity > 0.4
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.round((passengers / driverBus.capacity) * 100)}%` }}
              />
            </div>
          </div>

        </div>

        {/* Center/Right: Route Checklist & Stop Progress */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Stop Progress Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Navigation2 className="w-4 h-4 text-blue-400" /> Route Stop Progress
                </h3>
                <p className="text-xs text-slate-400">Next stop: <span className="text-emerald-400 font-bold">{driverBus.nextStopName}</span> ({driverBus.etaToNextStopMin} min ETA)</p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-mono font-bold">
                {assignedRoute.stops.length} Total Stops
              </span>
            </div>

            <div className="space-y-3">
              {assignedRoute.stops.map((stop, idx) => {
                const isNext = stop.name === driverBus.nextStopName;
                const isPassed = idx < 2;

                return (
                  <div
                    key={stop.stopId}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isNext
                        ? 'bg-blue-950/40 border-blue-500/50 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                        : isPassed
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                        isNext ? 'bg-blue-600 text-white' : isPassed ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs">{stop.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{stop.code} • {stop.isMajorHub ? 'Major Belagavi Transit Hub' : 'Standard Stop'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {isNext ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] animate-pulse">
                          Approaching ({driverBus.etaToNextStopMin} m)
                        </span>
                      ) : isPassed ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">Upcoming</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delay Broadcast Trigger Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Broadcast Route Delay / Traffic Advisory</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={delayMessage}
                onChange={(e) => setDelayMessage(e.target.value)}
                placeholder="e.g. Heavy traffic at Rani Chennamma Circle (+5 min delay)..."
                className="flex-1 bg-slate-800 text-xs text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleBroadcastDelay}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all whitespace-nowrap"
              >
                <Bell className="w-4 h-4" />
                <span>Send Alert to Control Room</span>
              </button>
            </div>

            {delaySent && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Alert broadcasted to Belagavi Depot Dispatcher!
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
