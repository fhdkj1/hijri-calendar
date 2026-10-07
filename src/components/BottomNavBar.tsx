import React from 'react';
import { Settings, Calendar, CalendarDays, Moon } from 'lucide-react';

export type TabType = 'calendar' | 'converter' | 'events' | 'settings';

interface BottomNavBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <nav
      className="w-full bg-white/95 backdrop-blur-xl border-t border-neutral-200/70 pt-2 pb-[max(env(safe-area-inset-bottom,8px),8px)] px-3 flex items-center justify-around select-none z-30 shadow-md"
      dir="rtl"
    >
      {/* 1. التقويم الهجري (Crescent icon) */}
      <button
        onClick={() => onChangeTab('converter')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
          activeTab === 'converter'
            ? 'text-[#7a1616] font-bold'
            : 'text-neutral-500 hover:text-neutral-800'
        }`}
        title="التقويم الهجري"
      >
        <div
          className={`p-1.5 rounded-2xl transition-colors ${
            activeTab === 'converter' ? 'bg-red-50 text-[#7a1616]' : 'text-neutral-600'
          }`}
        >
          <Moon size={22} className="stroke-[1.8]" />
        </div>
        <span className="text-[11px] font-semibold mt-0.5 tracking-tight">التقويم الهجري</span>
      </button>

      {/* 2. التقويم (Main Calendar with active burgundy pill as in screenshot) */}
      <button
        onClick={() => onChangeTab('calendar')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
          activeTab === 'calendar'
            ? 'text-[#7a1616] font-bold'
            : 'text-neutral-500 hover:text-neutral-800'
        }`}
        title="التقويم"
      >
        <div
          className={`p-1.5 rounded-2xl transition-colors ${
            activeTab === 'calendar' ? 'bg-red-50 text-[#7a1616]' : 'text-neutral-600'
          }`}
        >
          <Calendar size={22} className="stroke-[2]" />
        </div>
        <span className="text-[11px] font-semibold mt-0.5 tracking-tight">التقويم</span>
      </button>

      {/* 3. المناسبات (Events icon) */}
      <button
        onClick={() => onChangeTab('events')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
          activeTab === 'events'
            ? 'text-[#7a1616] font-bold'
            : 'text-neutral-500 hover:text-neutral-800'
        }`}
        title="المناسبات"
      >
        <div
          className={`p-1.5 rounded-2xl transition-colors ${
            activeTab === 'events' ? 'bg-red-50 text-[#7a1616]' : 'text-neutral-600'
          }`}
        >
          <CalendarDays size={22} className="stroke-[1.8]" />
        </div>
        <span className="text-[11px] font-semibold mt-0.5 tracking-tight">المناسبات</span>
      </button>

      {/* 4. الإعدادات (Settings icon) */}
      <button
        onClick={() => onChangeTab('settings')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 active:scale-95 ${
          activeTab === 'settings'
            ? 'text-[#7a1616] font-bold'
            : 'text-neutral-500 hover:text-neutral-800'
        }`}
        title="الإعدادات"
      >
        <div
          className={`p-1.5 rounded-2xl transition-colors ${
            activeTab === 'settings' ? 'bg-red-50 text-[#7a1616]' : 'text-neutral-600'
          }`}
        >
          <Settings size={22} className="stroke-[1.8]" />
        </div>
        <span className="text-[11px] font-semibold mt-0.5 tracking-tight">الإعدادات</span>
      </button>
    </nav>
  );
};
