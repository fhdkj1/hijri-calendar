import React from 'react';
import { Menu, Search, Sun, Calendar as CalendarIcon, ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import { MihrabLogo } from './MihrabLogo';
import { toArabicNumerals } from '../utils/hijriCalendar';

interface ModernCalendarHeaderProps {
  gregorianMonthNameEn: string; // e.g. "OCT"
  gregorianYear: number;
  hijriYear: number;
  hijriMonthNameAr: string; // e.g. "ربيع الآخر"
  todayDayNumber: number; // e.g. 7
  viewMode: 'month' | 'week' | 'day';
  onChangeViewMode: (mode: 'month' | 'week' | 'day') => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToToday: () => void;
  onOpenSearch: () => void;
  onOpenMenu: () => void;
  useArabicDigits?: boolean;
}

export const ModernCalendarHeader: React.FC<ModernCalendarHeaderProps> = ({
  gregorianMonthNameEn,
  gregorianYear,
  hijriYear,
  hijriMonthNameAr,
  todayDayNumber,
  viewMode,
  onChangeViewMode,
  onPrevMonth,
  onNextMonth,
  onJumpToToday,
  onOpenSearch,
  onOpenMenu,
  useArabicDigits = false,
}) => {
  const num = (v: number | string) =>
    useArabicDigits ? toArabicNumerals(v) : String(v);

  return (
    <div className="relative w-full bg-linear-to-b from-amber-50/50 via-orange-50/20 to-white pt-2.5 pb-2 px-4 select-none overflow-hidden border-b border-neutral-150/70">
      {/* Mosque Minarets & Crescent Silhouette Background Art */}
      <div className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none opacity-20 overflow-hidden">
        <svg viewBox="0 0 240 140" fill="none" className="w-full h-full object-cover">
          {/* Crescent Moon */}
          <path
            d="M 120 20 A 18 18 0 1 0 140 44 A 14 14 0 1 1 120 20 Z"
            fill="#d97706"
            opacity="0.8"
          />
          {/* Mosque Domes and Minarets silhouette */}
          <g fill="#78350f" opacity="0.6">
            {/* Left minaret */}
            <rect x="40" y="35" width="6" height="85" />
            <polygon points="43,20 38,35 48,35" />
            <rect x="36" y="55" width="14" height="4" rx="1" />
            {/* Center Dome */}
            <path d="M 80 120 C 80 75, 130 75, 130 120 Z" />
            <line x1="105" y1="65" x2="105" y2="76" stroke="#78350f" strokeWidth="2" />
            {/* Tall Right Minaret */}
            <rect x="150" y="22" width="7" height="98" />
            <polygon points="153.5,8 148,22 159,22" />
            <rect x="146" y="42" width="15" height="4" rx="1" />
            <rect x="147" y="70" width="13" height="3" rx="1" />
            {/* Palm tree silhouette */}
            <path d="M 195 120 Q 200 80 205 60 Q 185 62 175 75 Q 188 55 205 58 Q 205 45 215 55 Q 225 50 215 62 Q 228 68 215 78 Z" opacity="0.7" />
          </g>
        </svg>
      </div>

      {/* Top Bar: Menu, Mihrab Logo, Search + Today Badge */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        {/* Left: Hamburger Menu */}
        <button
          onClick={onOpenMenu}
          className="p-2 text-neutral-800 hover:text-neutral-950 active:scale-95 transition rounded-xl hover:bg-neutral-100/60"
          title="القائمة"
        >
          <Menu size={22} className="stroke-[2.2]" />
        </button>

        {/* Center: Mihrab Arch Icon */}
        <div className="flex items-center justify-center">
          <MihrabLogo size={38} />
        </div>

        {/* Right: Search & Today Date Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 text-neutral-800 hover:text-neutral-950 active:scale-95 transition rounded-xl hover:bg-neutral-100/60"
            title="بحث"
          >
            <Search size={21} className="stroke-[2.2]" />
          </button>

          {/* Today Day Box with Number */}
          <button
            onClick={onJumpToToday}
            className="w-8 h-8 rounded-xl border border-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-900 hover:bg-neutral-100/80 active:scale-95 transition font-sans"
            title="العودة لليوم"
          >
            {todayDayNumber}
          </button>
        </div>
      </div>

      {/* Second Row: Month Title (with arrows) & View Mode Selector */}
      <div className="relative z-10 flex items-center justify-between gap-2 mt-1">
        {/* Left: Month Navigation & Dual Calendar Label */}
        <div className="flex flex-col text-left">
          {/* Big English Month abbreviation with navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevMonth}
              className="p-1 text-neutral-600 hover:text-neutral-900 active:scale-90 transition rounded-lg hover:bg-neutral-100"
              title="الشهر السابق"
            >
              <ChevronLeft size={20} className="stroke-[2.5]" />
            </button>

            <span className="text-2xl font-black text-neutral-950 tracking-wider font-sans uppercase">
              {gregorianMonthNameEn}
            </span>

            <button
              onClick={onNextMonth}
              className="p-1 text-neutral-600 hover:text-neutral-900 active:scale-90 transition rounded-lg hover:bg-neutral-100"
              title="الشهر القادم"
            >
              <ChevronRight size={20} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Hijri Month & Year + Gregorian Year Subtitle */}
          <div className="text-xs font-bold text-neutral-600 -mt-0.5 tracking-tight flex items-center gap-1.5" dir="rtl">
            <span>{hijriMonthNameAr}</span>
            <span>{num(hijriYear)} هـ</span>
            <span className="text-neutral-400 font-sans">•</span>
            <span className="font-sans">{gregorianYear}</span>
          </div>
        </div>

        {/* Right: View Mode Segmented Control (اليوم / الأسبوع / الشهر) */}
        <div className="flex items-center bg-neutral-100/90 p-1 rounded-2xl border border-neutral-200/70 shadow-2xs text-xs font-bold" dir="rtl">
          {/* Month Button */}
          <button
            onClick={() => onChangeViewMode('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              viewMode === 'month'
                ? 'bg-[#7a1616] text-white shadow-xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <CalendarIcon size={13} className="stroke-[2.5]" />
            <span>الشهر</span>
          </button>

          {/* Week Button */}
          <button
            onClick={() => onChangeViewMode('week')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
              viewMode === 'week'
                ? 'bg-[#7a1616] text-white shadow-xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ListFilter size={13} className="stroke-[2.5]" />
            <span>الأسبوع</span>
          </button>

          {/* Day Button */}
          <button
            onClick={() => onChangeViewMode('day')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
              viewMode === 'day'
                ? 'bg-[#7a1616] text-white shadow-xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Sun size={13} className="stroke-[2.5]" />
            <span>اليوم</span>
          </button>
        </div>
      </div>
    </div>
  );
};
