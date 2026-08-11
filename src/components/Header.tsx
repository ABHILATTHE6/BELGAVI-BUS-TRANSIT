import React, { useState } from 'react';
import {
  Bus,
  Bell,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Radio,
  ChevronDown
} from 'lucide-react';
import { UserRole, User, NotificationItem } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentUser: User;
  notifications: NotificationItem[];
  onOpenAIChat: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isSimulating: boolean;
  onToggleSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  currentUser,
  notifications,
  onOpenAIChat,
  isSimulating,
  onToggleSimulator,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    commuter: { label: 'Commuter', badge: 'Passenger Portal', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    driver: { label: 'Driver', badge: 'Active Duty Terminal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    depot_admin: { label: 'Depot Admin', badge: 'Fleet Ops Control', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    super_admin: { label: 'Super Admin', badge: 'System Command Center', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & City Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                BELAGAVI CITY BUS
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold tracking-wider">
                NWKRTC
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isSimulating ? 'Live Telemetry' : 'Telemetry Paused'}
              </span>
              <span>•</span>
              <span className="font-mono text-[11px] text-slate-400">Belagavi City Transit</span>
            </div>
          </div>
        </div>

        {/* Center Actions / Quick AI & Simulator Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onToggleSimulator}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isSimulating
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Live Bus Position Telemetry Stream"
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400 animate-spin' : ''}`} />
            {isSimulating ? 'GPS Stream Active' : 'Enable Stream'}
          </button>

          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition-all border border-blue-400/30 ring-1 ring-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Belagavi Transit AI</span>
          </button>
        </div>

        {/* Right Section: Role Switcher & Notifications & User Profile */}
        <div className="flex items-center gap-3">
          
          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${roleLabels[currentRole].color}`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <div className="text-left hidden sm:block">
                <div className="font-semibold leading-none">{roleLabels[currentRole].label}</div>
                <div className="text-[10px] opacity-75">{roleLabels[currentRole].badge}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-2 z-50">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Switch Role Perspective
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                      currentRole === r
                        ? 'bg-blue-600/20 text-blue-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <div>
                      <div>{roleLabels[r].label}</div>
                      <div className="text-[10px] text-slate-400">{roleLabels[r].badge}</div>
                    </div>
                    {currentRole === r && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-400" /> Live Transit Alerts
                  </h4>
                  <span className="text-[10px] text-slate-400">{notifications.length} alerts</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">No active alerts</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl text-xs border ${
                          n.type === 'delay'
                            ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                            : n.type === 'alert'
                            ? 'bg-red-950/30 border-red-500/30 text-red-200'
                            : 'bg-slate-900/60 border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="font-semibold flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] opacity-70">{n.timestamp}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed opacity-90">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full ring-2 ring-blue-500/30 object-cover"
            />
            <div className="text-xs">
              <div className="font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400">{currentUser.email}</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
