import React from 'react';
import {
  CrescentTabIcon,
  GlobeTabIcon,
  CakeTabIcon,
  NotepadTabIcon,
  MoreTabIcon,
} from './CalendarIcons';

export type TabType = 'calendar' | 'converter' | 'age' | 'events' | 'settings';

interface BottomNavBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <nav className="w-full bg-white/95 backdrop-blur-xl border-t border-neutral-200/60 pt-2 pb-[max(env(safe-area-inset-bottom,8px),8px)] px-2 flex items-center justify-around select-none z-30 shadow-lg">
      {/* Tab 1: Calendar */}
      <button
        onClick={() => onChangeTab('calendar')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
          activeTab === 'calendar'
            ? 'text-[#841c1c] font-bold'
            : 'text-neutral-400 hover:text-neutral-700'
        }`}
        title="التقويم الهجري"
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === 'calendar' ? 'bg-red-50/80' : ''}`}>
          <CrescentTabIcon active={activeTab === 'calendar'} />
        </div>
        <span className="text-[10.5px] font-semibold mt-0.5 tracking-tight truncate">التقويم</span>
      </button>

      {/* Tab 2: Converter */}
      <button
        onClick={() => onChangeTab('converter')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
          activeTab === 'converter'
            ? 'text-[#841c1c] font-bold'
            : 'text-neutral-400 hover:text-neutral-700'
        }`}
        title="محول التاريخ"
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === 'converter' ? 'bg-red-50/80' : ''}`}>
          <GlobeTabIcon active={activeTab === 'converter'} />
        </div>
        <span className="text-[10.5px] font-semibold mt-0.5 tracking-tight truncate">المحول</span>
      </button>

      {/* Tab 3: Age Calculator */}
      <button
        onClick={() => onChangeTab('age')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
          activeTab === 'age'
            ? 'text-[#841c1c] font-bold'
            : 'text-neutral-400 hover:text-neutral-700'
        }`}
        title="حاسبة العمر"
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === 'age' ? 'bg-red-50/80' : ''}`}>
          <CakeTabIcon active={activeTab === 'age'} />
        </div>
        <span className="text-[10.5px] font-semibold mt-0.5 tracking-tight truncate">حاسبة العمر</span>
      </button>

      {/* Tab 4: Events */}
      <button
        onClick={() => onChangeTab('events')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
          activeTab === 'events'
            ? 'text-[#841c1c] font-bold'
            : 'text-neutral-400 hover:text-neutral-700'
        }`}
        title="المناسبات والأعياد"
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === 'events' ? 'bg-red-50/80' : ''}`}>
          <NotepadTabIcon active={activeTab === 'events'} />
        </div>
        <span className="text-[10.5px] font-semibold mt-0.5 tracking-tight truncate">المناسبات</span>
      </button>

      {/* Tab 4: Settings */}
      <button
        onClick={() => onChangeTab('settings')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 ${
          activeTab === 'settings'
            ? 'text-[#841c1c] font-bold'
            : 'text-neutral-400 hover:text-neutral-700'
        }`}
        title="الإعدادات والتعديل"
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-red-50/80' : ''}`}>
          <MoreTabIcon active={activeTab === 'settings'} />
        </div>
        <span className="text-[11px] font-semibold mt-0.5 tracking-tight">الإعدادات</span>
      </button>
    </nav>
  );
};
