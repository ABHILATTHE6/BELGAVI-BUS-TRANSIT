import React from 'react';
import { SystemAnalytics, Bus } from '../types';
import {
  BarChart3,
  TrendingUp,
  Users,
  IndianRupee,
  Clock,
  Zap,
  Award
} from 'lucide-react';

interface AnalyticsViewProps {
  analytics: SystemAnalytics;
  buses: Bus[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Belagavi Transit Intelligence & Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time telematics dashboard, passenger throughput, delay heatmaps & driver scores for Belagavi Division.</p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-mono font-semibold">
          Auto Refresh 5s • Belagavi NWKRTC Telematics
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" /> Daily Belagavi Commuters
          </div>
          <div className="text-2xl font-black text-white font-mono">{analytics.totalPassengersToday.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 font-medium">↑ 14% vs yesterday</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" /> Daily Fare Revenue
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">₹{analytics.totalRevenueToday.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Electronic ticketing clearing</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> On-Time Performance
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{analytics.onTimePerformancePct}%</div>
          <div className="text-[11px] text-slate-400">NWKRTC Target &gt; 90%</div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" /> Active City Fleet
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{analytics.activeBuses} <span className="text-xs text-slate-400">buses</span></div>
          <div className="text-[11px] text-emerald-400 font-medium">{analytics.fleetUtilizationPct}% Utilization</div>
        </div>
      </div>

      {/* Visual Chart: Hourly Passenger Traffic Bar Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Hourly Passenger Traffic in Belagavi
          </h3>
          <span className="text-xs text-slate-400">Peak hours: 08:00 AM - 09:00 AM</span>
        </div>

        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-800">
          {analytics.hourlyPassengerTraffic.map((item, idx) => {
            const maxVal = 13000;
            const heightPct = Math.min(100, Math.round((item.count / maxVal) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count.toLocaleString()}
                </div>
                <div className="w-full bg-slate-800 rounded-t-xl overflow-hidden h-32 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-blue-700 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-400 transition-all rounded-t-xl"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono rotate-[-45%] sm:rotate-0">{item.hour}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Ratings & Performance */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> NWKRTC Driver Ratings & Safety Index
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.driverRatings.map((driver) => (
            <div key={driver.driverId} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-100">{driver.name}</div>
                <div className="text-[11px] text-slate-400">{driver.tripsCompleted} Belagavi trips completed</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-400 text-xs">⭐ {driver.rating} Rating</div>
                <div className="text-[11px] text-emerald-400 font-mono">{driver.onTimePct}% On-Time</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
