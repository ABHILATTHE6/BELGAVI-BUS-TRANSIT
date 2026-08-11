import React, { useState } from 'react';
import { Route, Bus, FavoriteItem, TripHistoryItem, RouteRecommendationResult } from '../types';
import {
  Search,
  Compass,
  ArrowRight,
  Clock,
  Users,
  Bookmark,
  History,
  Sparkles,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface CommuterViewProps {
  routes: Route[];
  buses: Bus[];
  favorites: FavoriteItem[];
  tripHistory: TripHistoryItem[];
  onSelectBus: (busId: string) => void;
  onSelectRoute: (routeId: string) => void;
  onOpenAIChat: () => void;
  onAddFavorite: (type: 'route' | 'stop', id: string, name: string, code: string) => void;
}

export const CommuterView: React.FC<CommuterViewProps> = ({
  routes,
  buses,
  favorites,
  tripHistory,
  onSelectRoute,
  onOpenAIChat,
  onAddFavorite,
}) => {
  const [origin, setOrigin] = useState<string>('CBT Central Bus Terminal');
  const [destination, setDestination] = useState<string>('VTU Campus Machhe');
  const [preference, setPreference] = useState<'fastest' | 'cheapest' | 'fewest_transfers'>('fastest');
  const [journeyResults, setJourneyResults] = useState<RouteRecommendationResult[] | null>(null);
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Stop Arrivals Board state
  const [selectedArrivalStop, setSelectedArrivalStop] = useState<string>('CBT Central Bus Terminal');

  // Extract all unique bus stops across Belagavi routes
  const allStops = Array.from(
    new Set(
      routes.flatMap((r) => r.stops ? r.stops.map((s) => s.name) : [r.startStop, r.endStop])
    )
  );

  // Compute upcoming bus arrivals for the selected stop
  const stopArrivals = buses.map((bus) => {
    const routeObj = routes.find((r) => r.id === bus.routeId || r.code === bus.routeCode);
    const stopsList = routeObj?.stops || [];
    const targetStopIndex = stopsList.findIndex((s) => s.name.toLowerCase() === selectedArrivalStop.toLowerCase());

    // Approximate ETA calculation based on stop distance/sequence or current nextStop
    let estimatedEtaMin = bus.etaToNextStopMin || 4;
    if (bus.nextStopName.toLowerCase() === selectedArrivalStop.toLowerCase()) {
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

  const handlePlanJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanning(true);

    try {
      const res = await fetch('/api/ai/route-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, preference }),
      });
      const data = await res.json();
      setJourneyResults(data);
    } catch (err) {
      console.error('Failed to plan journey', err);
    } finally {
      setIsPlanning(false);
    }
  };

  const filteredRoutes = routes.filter(
    (r) =>
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.startStop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.endStop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-100">
      
      {/* Top Banner & Quick AI Launcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> NWKRTC Belagavi Commuter Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Where are you traveling in Belagavi?
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Real-time bus tracking, live passenger occupancy, and ticket fare calculator across Belagavi city.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onOpenAIChat}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Ask Belagavi AI Transit Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Journey Planner & Quick Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Smart Journey Planner */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Smart Route Planner</span>
          </div>

          <form onSubmit={handlePlanJourney} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Origin Stop
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-emerald-400" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Enter origin stop e.g. CBT Central Bus Stand..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 pl-8 pr-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Destination Stop
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-red-400" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination e.g. VTU Machhe Campus..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 pl-8 pr-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Route Priority
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPreference('fastest')}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    preference === 'fastest' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fastest
                </button>
                <button
                  type="button"
                  onClick={() => setPreference('cheapest')}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    preference === 'cheapest' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cheapest
                </button>
                <button
                  type="button"
                  onClick={() => setPreference('fewest_transfers')}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    preference === 'fewest_transfers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Direct
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPlanning}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isPlanning ? (
                <span>Calculating Optimal Routes...</span>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Find Best Bus Options</span>
                </>
              )}
            </button>
          </form>

          {/* Journey Recommendations Results */}
          {journeyResults && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-300">Suggested Routes ({journeyResults.length})</div>
              {journeyResults.map((res, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/30">
                      {res.routeCode}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">₹{res.fare.toFixed(2)}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-100">{res.routeName}</div>
                  
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" /> {res.estimatedTimeMin} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-amber-400" /> {res.crowding} occupancy
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      🌱 -{res.carbonSavedKg}kg CO₂
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                    {res.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>{step.detail}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({step.durationMin}m)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Stop Arrivals Board & Routes Directory */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Stop Arrivals Board */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                  Live Stop Telemetry
                </span>
                <h3 className="text-base font-extrabold text-white mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Belagavi Bus Stop Arrivals Board
                </h3>
                <p className="text-xs text-slate-400">Which bus arrives next at your chosen stop & estimated time</p>
              </div>

              {/* Stop Selector Dropdown */}
              <div className="min-w-[200px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Select Bus Stop
                </label>
                <select
                  value={selectedArrivalStop}
                  onChange={(e) => setSelectedArrivalStop(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-emerald-300 px-3 py-2 focus:outline-none focus:border-emerald-500 shadow-inner"
                >
                  <option value="CBT Central Bus Terminal">CBT Central Bus Terminal</option>
                  <option value="Rani Chennamma Circle">Rani Chennamma Circle</option>
                  <option value="Tilakwadi Third Gate">Tilakwadi Third Gate</option>
                  <option value="Peeranwadi Cross">Peeranwadi Cross</option>
                  <option value="VTU Campus Machhe">VTU Campus Machhe</option>
                  <option value="Camp Post Office">Camp Area Post Office</option>
                  <option value="Kakati Industrial Area">Kakati Industrial Area</option>
                  <option value="Sombra Airport Gate">Sambra Airport Gate</option>
                  {allStops.map((stopName) => (
                    <option key={stopName} value={stopName}>{stopName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Arrivals List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stopArrivals.slice(0, 4).map(({ bus, route, etaMin }) => (
                <div key={bus.id} className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3 shadow-md hover:border-emerald-500/40 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-extrabold text-xs font-mono">
                        {bus.routeCode}
                      </span>
                      <span className="font-bold text-slate-200 text-xs font-mono">{bus.fleetNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium truncate max-w-[160px]">
                      {route?.name || bus.nextStopName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      To: <span className="text-slate-200 font-semibold">{route?.endStop || 'Terminal'}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-sm font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>{etaMin} min</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 capitalize mt-1">
                      {bus.crowdingLevel} occupancy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Directory & Live Occupancy */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Live Belagavi Routes & Fares</h3>
                <p className="text-xs text-slate-400">Select a route to highlight on map or check active bus crowding.</p>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter Belagavi routes..."
                  className="bg-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 w-44 sm:w-52"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredRoutes.map((route) => {
                const activeBusesForRoute = buses.filter((b) => b.routeId === route.id);
                return (
                  <div
                    key={route.id}
                    className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded-md text-white font-extrabold text-xs"
                          style={{ backgroundColor: route.color }}
                        >
                          {route.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-100">{route.name}</h4>
                        <button
                          onClick={() => onAddFavorite('route', route.id, route.name, route.code)}
                          className="text-slate-500 hover:text-amber-400 p-1"
                          title="Save to Favorites"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span>{route.startStop}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span>{route.endStop}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <div className="text-slate-300 font-semibold">₹{route.fareStandard.toFixed(2)} Standard</div>
                        <div className="text-[11px] text-blue-400 font-mono">{activeBusesForRoute.length} Active Buses</div>
                      </div>

                      <button
                        onClick={() => onSelectRoute(route.id)}
                        className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>View Route</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Favorites & Trip History Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Favorites Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Bookmark className="w-4 h-4" />
                <span>Saved Favorites ({favorites.length})</span>
              </div>

              <div className="space-y-2">
                {favorites.map((fav) => (
                  <div key={fav.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{fav.targetName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{fav.targetCode} • Saved {fav.createdAt}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                      {fav.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trip History Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <History className="w-4 h-4" />
                <span>Recent Trip History</span>
              </div>

              <div className="space-y-2">
                {tripHistory.map((trip) => (
                  <div key={trip.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{trip.routeCode} ({trip.busFleetNumber})</span>
                      <span className="font-semibold text-emerald-400">₹{trip.fare.toFixed(2)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {trip.fromStop} → {trip.toStop}
                    </div>
                    <div className="text-[10px] text-slate-500">{trip.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
