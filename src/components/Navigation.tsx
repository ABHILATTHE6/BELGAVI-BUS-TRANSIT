import React from 'react';
import {
  MapPin,
  Route,
  Bus,
  Calendar,
  BarChart3,
  ShieldAlert,
  Building2,
  Users,
  Bookmark,
  Bell,
  Compass
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType =
  | 'map'
  | 'journey'
  | 'schedules'
  | 'favorites'
  | 'driver_hud'
  | 'fleet'
  | 'depots'
  | 'announcements'
  | 'analytics'
  | 'audit_logs'
  | 'users';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  role: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, role }) => {
  const getTabsForRole = (): { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] => {
    switch (role) {
      case 'commuter':
        return [
          { id: 'map', label: 'Live Bus Tracker', icon: MapPin },
          { id: 'journey', label: 'Smart Journey Planner', icon: Compass },
          { id: 'schedules', label: 'Routes & Fares', icon: Route },
          { id: 'favorites', label: 'Saved Favorites', icon: Bookmark },
        ];
      case 'driver':
        return [
          { id: 'driver_hud', label: 'Driver Terminal (HUD)', icon: Bus },
          { id: 'map', label: 'Live Route Map', icon: MapPin },
          { id: 'schedules', label: 'Shift Schedules', icon: Calendar },
          { id: 'announcements', label: 'Depot Broadcasts', icon: Bell },
        ];
      case 'depot_admin':
        return [
          { id: 'fleet', label: 'Fleet Management', icon: Bus },
          { id: 'map', label: 'Live Depot Map', icon: MapPin },
          { id: 'depots', label: 'Depot Operations', icon: Building2 },
          { id: 'announcements', label: 'Announcements', icon: Bell },
          { id: 'analytics', label: 'Depot Analytics', icon: BarChart3 },
        ];
      case 'super_admin':
        return [
          { id: 'analytics', label: 'System Command Center', icon: BarChart3 },
          { id: 'map', label: 'Belagavi Fleet Map', icon: MapPin },
          { id: 'fleet', label: 'All Fleet Vehicles', icon: Bus },
          { id: 'depots', label: 'City Depots', icon: Building2 },
          { id: 'audit_logs', label: 'Security Audit Logs', icon: ShieldAlert },
          { id: 'users', label: 'User Directory & Roles', icon: Users },
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center overflow-x-auto no-scrollbar gap-1 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/30'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
