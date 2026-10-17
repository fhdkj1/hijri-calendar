import React from 'react';
import {
  Calendar as CalendarIcon,
  Sparkles,
  RefreshCw,
  Settings as SettingsIcon,
} from 'lucide-react';

export type TabType = 'calendar' | 'converter' | 'events' | 'settings';

interface BottomNavBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs: Array<{
    id: TabType;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [
    { id: 'calendar', label: 'التقويم', icon: CalendarIcon },
    { id: 'events', label: 'المناسبات', icon: Sparkles },
    { id: 'converter', label: 'المحول', icon: RefreshCw },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
  ];

  return (
    <nav className="w-full bg-[#F8F6F1]/95 backdrop-blur-xl border-t border-[#E8E4DA] pt-2 pb-[max(env(safe-area-inset-bottom,10px),10px)] px-3 flex items-center justify-around select-none z-30">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
              isActive
                ? 'bg-[#183B3A] text-white shadow-xs font-bold'
                : 'text-[#8C8C8C] hover:text-[#252525] font-medium'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-white' : 'text-[#8C8C8C]'} />
            <span className="text-xs tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
