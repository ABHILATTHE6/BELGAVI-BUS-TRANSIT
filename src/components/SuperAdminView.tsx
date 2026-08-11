import React, { useState } from 'react';
import { AuditLog, User, SystemAnalytics, Bus, Depot } from '../types';
import {
  ShieldAlert,
  Users,
  IndianRupee,
  Activity,
} from 'lucide-react';

interface SuperAdminViewProps {
  auditLogs: AuditLog[];
  users: User[];
  analytics: SystemAnalytics;
  buses: Bus[];
  depots: Depot[];
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  auditLogs,
  users,
  analytics,
  buses,
  depots,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'audit' | 'users' | 'hubs'>('metrics');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100">
      
      {/* Super Admin Top Command Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" /> Super Admin Command Center
            </span>
            <span className="text-xs text-slate-400 font-mono">Belagavi Division NWKRTC</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Belagavi City Bus Transit System
          </h1>

          <p className="text-xs text-slate-300">
            Real-Time Audit Logging • Multi-Depot Orchestration • NWKRTC Telematics & Security Control
          </p>
        </div>

        {/* Navigation Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveSubTab('metrics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'metrics' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Metrics
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'audit' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'users' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Users & RBAC
          </button>
          <button
            onClick={() => setActiveSubTab('hubs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'hubs' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Belagavi Depots
          </button>
        </div>

      </div>

      {/* SUB TAB: METRICS */}
      {activeSubTab === 'metrics' && (
        <div className="space-y-6">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Daily Commuters</div>
              <div className="text-2xl font-black text-blue-400 font-mono">{analytics.totalPassengersToday.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-400 font-medium">↑ 14% vs yesterday</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">On-Time Reliability</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{analytics.onTimePerformancePct}%</div>
              <div className="text-[11px] text-slate-400">NWKRTC Target &gt;90%</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-amber-400" /> Today's Revenue
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono">₹{analytics.totalRevenueToday.toLocaleString()}</div>
              <div className="text-[11px] text-emerald-400 font-medium">Auto fare clearing active</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
              <div className="text-xs text-slate-400 font-semibold uppercase">Fleet Utilization</div>
              <div className="text-2xl font-black text-purple-400 font-mono">{analytics.fleetUtilizationPct}%</div>
              <div className="text-[11px] text-slate-400">{buses.length} active Belagavi buses</div>
            </div>
          </div>

          {/* Delay Heatmap Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Belagavi Traffic Delay Heatmap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.delayHeatmap.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-200">{item.region}</div>
                    <div className="text-[11px] text-slate-400">{item.delayCount} traffic delay pings reported</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-amber-400 text-sm">+{item.avgDelayMin} min</div>
                    <div className="text-[10px] text-slate-500 uppercase">Avg Delay</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB TAB: AUDIT LOGS */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" /> Security Audit Logs ({auditLogs.length})
            </h3>
            <span className="text-xs font-mono text-slate-400">Belagavi Transit Session Audit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">User & Role</th>
                  <th className="py-3 px-3">Target</th>
                  <th className="py-3 px-3">Details</th>
                  <th className="py-3 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                    <td className="py-3 px-3 font-bold font-mono text-purple-300">{log.action}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold">{log.userName}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{log.role}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-blue-300">{log.target}</td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs">{log.details}</td>
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB: USERS */}
      {activeSubTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Registered Users & RBAC Permissions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((u) => (
              <div key={u.id} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-4">
                <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-100">{u.name}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB: DEPOT HUBS */}
      {activeSubTab === 'hubs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {depots.map((depot) => (
            <div key={depot.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">
                  {depot.code}
                </span>
                <span className="text-xs text-emerald-400 font-bold capitalize">{depot.status}</span>
              </div>
              <h4 className="font-bold text-slate-100 text-sm">{depot.name}</h4>
              <div className="text-xs text-slate-400 space-y-1">
                <div>City: {depot.city}</div>
                <div>Capacity: {depot.activeBusesCount} / {depot.capacity} Buses</div>
                <div>Manager: {depot.managerName}</div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
