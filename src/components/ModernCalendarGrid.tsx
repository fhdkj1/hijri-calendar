import React from 'react';
import { type UserNote, getHijriFromGregorian } from '../utils/hijriCalendar';
import { Smile } from 'lucide-react';

export interface ModernGridDay {
  gregorianDate: Date;
  gregorianDay: number;
  gregorianMonth: number; // 0-11
  gregorianYear: number;
  hijriYear: number;
  hijriMonth: number;
  hijriDay: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  weekdayIndex: number; // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  events: UserNote[];
  islamicEvents?: Array<{ id: string; titleAr: string; isHoliday?: boolean }>;
}

interface ModernCalendarGridProps {
  currentGregorianYear: number;
  currentGregorianMonth: number; // 0-11
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  userNotes: UserNote[];
  adjustment?: number;
  viewMode?: 'month' | 'week' | 'day';
}

export const ModernCalendarGrid: React.FC<ModernCalendarGridProps> = ({
  currentGregorianYear,
  currentGregorianMonth,
  selectedDate,
  onSelectDate,
  userNotes,
  adjustment = 0,
}) => {
  // Days of week header in English as shown in the screenshot: S M T W T F S
  const weekdays = [
    { label: 'S', isFri: false, isSat: false },
    { label: 'M', isFri: false, isSat: false },
    { label: 'T', isFri: false, isSat: false },
    { label: 'W', isFri: false, isSat: false },
    { label: 'T', isFri: false, isSat: false },
    { label: 'F', isFri: true, isSat: false }, // Friday = Blue
    { label: 'S', isFri: false, isSat: true }, // Saturday = Red
  ];

  // Build grid days for the given Gregorian month
  const gridDays: ModernGridDay[] = React.useMemo(() => {
    const days: ModernGridDay[] = [];

    // First day of this month
    const firstDayOfMonth = new Date(currentGregorianYear, currentGregorianMonth, 1);
    const startWeekday = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon, ...

    // Days in current month
    const daysInMonth = new Date(currentGregorianYear, currentGregorianMonth + 1, 0).getDate();

    // Days in previous month
    const daysInPrevMonth = new Date(currentGregorianYear, currentGregorianMonth, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selDateMidnight = new Date(selectedDate);
    selDateMidnight.setHours(0, 0, 0, 0);

    // 1. Previous month trailing days
    for (let i = startWeekday - 1; i >= 0; i--) {
      const gDay = daysInPrevMonth - i;
      const gDate = new Date(currentGregorianYear, currentGregorianMonth - 1, gDay);
      gDate.setHours(0, 0, 0, 0);

      const h = getHijriFromGregorian(gDate, adjustment);

      // Match user events
      const dayEvents = userNotes.filter((n) => {
        return n.hijriYear === h.year && n.hijriMonth === h.month && n.hijriDay === h.day;
      });

      days.push({
        gregorianDate: gDate,
        gregorianDay: gDay,
        gregorianMonth: currentGregorianMonth - 1,
        gregorianYear: currentGregorianYear,
        hijriYear: h.year,
        hijriMonth: h.month,
        hijriDay: h.day,
        isCurrentMonth: false,
        isToday: gDate.getTime() === today.getTime(),
        isSelected: gDate.getTime() === selDateMidnight.getTime(),
        weekdayIndex: gDate.getDay(),
        events: dayEvents,
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const gDate = new Date(currentGregorianYear, currentGregorianMonth, d);
      gDate.setHours(0, 0, 0, 0);

      const h = getHijriFromGregorian(gDate, adjustment);

      const dayEvents = userNotes.filter((n) => {
        return n.hijriYear === h.year && n.hijriMonth === h.month && n.hijriDay === h.day;
      });

      days.push({
        gregorianDate: gDate,
        gregorianDay: d,
        gregorianMonth: currentGregorianMonth,
        gregorianYear: currentGregorianYear,
        hijriYear: h.year,
        hijriMonth: h.month,
        hijriDay: h.day,
        isCurrentMonth: true,
        isToday: gDate.getTime() === today.getTime(),
        isSelected: gDate.getTime() === selDateMidnight.getTime(),
        weekdayIndex: gDate.getDay(),
        events: dayEvents,
      });
    }

    // 3. Next month leading days to complete the grid (up to 35 or 42 cells)
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const gDate = new Date(currentGregorianYear, currentGregorianMonth + 1, d);
      gDate.setHours(0, 0, 0, 0);

      const h = getHijriFromGregorian(gDate, adjustment);

      const dayEvents = userNotes.filter((n) => {
        return n.hijriYear === h.year && n.hijriMonth === h.month && n.hijriDay === h.day;
      });

      days.push({
        gregorianDate: gDate,
        gregorianDay: d,
        gregorianMonth: currentGregorianMonth + 1,
        gregorianYear: currentGregorianYear,
        hijriYear: h.year,
        hijriMonth: h.month,
        hijriDay: h.day,
        isCurrentMonth: false,
        isToday: gDate.getTime() === today.getTime(),
        isSelected: gDate.getTime() === selDateMidnight.getTime(),
        weekdayIndex: gDate.getDay(),
        events: dayEvents,
      });
    }

    return days;
  }, [currentGregorianYear, currentGregorianMonth, selectedDate, userNotes, adjustment]);

  return (
    <div className="w-full bg-white select-none">
      {/* Weekdays Header: S M T W T F S */}
      <div className="grid grid-cols-7 border-b border-neutral-100 text-center py-1.5 font-sans font-bold text-xs">
        {weekdays.map((w, idx) => (
          <div
            key={idx}
            className={`py-1 ${
              w.isFri ? 'text-blue-600' : w.isSat ? 'text-red-600' : 'text-neutral-800'
            }`}
          >
            {w.label}
          </div>
        ))}
      </div>

      {/* Grid Cells: 7 columns */}
      <div className="grid grid-cols-7 border-b border-neutral-150/80 bg-white">
        {gridDays.map((cell, idx) => {
          const isFriday = cell.weekdayIndex === 5;
          const isSaturday = cell.weekdayIndex === 6;

          // Number color based on weekday and month status
          let numberColor = 'text-neutral-900';
          if (!cell.isCurrentMonth) {
            numberColor = 'text-neutral-400';
          } else if (isFriday) {
            numberColor = 'text-blue-600';
          } else if (isSaturday) {
            numberColor = 'text-red-600';
          }

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(cell.gregorianDate)}
              className={`min-h-[64px] sm:min-h-[72px] p-1 flex flex-col justify-between border-b border-r border-neutral-100/80 cursor-pointer transition-colors relative ${
                cell.isSelected
                  ? 'bg-red-50/70 border-2 border-[#7a1616] rounded-2xl z-10 shadow-xs'
                  : 'hover:bg-neutral-50/80'
              }`}
            >
              {/* Day Number & Hijri Subdate */}
              <div className="flex flex-col items-center">
                {/* Primary Gregorian Day */}
                {cell.isSelected ? (
                  <div className="bg-[#7a1616] text-white text-[11px] font-bold px-2 py-0.5 rounded-full font-sans shadow-2xs">
                    {cell.gregorianDay}
                  </div>
                ) : (
                  <span
                    className={`text-xs sm:text-sm font-bold font-sans ${numberColor}`}
                  >
                    {cell.gregorianDay}
                  </span>
                )}

                {/* Hijri subdate in parentheses: (Month/Day) */}
                <span
                  className={`text-[9.5px] font-sans -mt-0.5 ${
                    cell.isSelected
                      ? 'text-[#7a1616] font-semibold'
                      : cell.isCurrentMonth
                      ? 'text-neutral-500'
                      : 'text-neutral-300'
                  }`}
                >
                  ({cell.hijriMonth}/{cell.hijriDay})
                </span>
              </div>

              {/* Event Chips / Pills directly inside cell */}
              <div className="flex flex-col gap-0.5 mt-0.5 overflow-hidden w-full">
                {cell.events.slice(0, 2).map((ev) => {
                  // Determine pill style (blue for Friday/tech, orange/yellow for sports/general)
                  const isBluePill = isFriday || ev.title.includes('نت') || ev.title.includes('عروض');
                  const pillClass = isBluePill
                    ? 'bg-[#38bdf8] text-white'
                    : 'bg-[#f59e0b] text-white';

                  return (
                    <div
                      key={ev.id}
                      title={ev.title}
                      className={`text-[8.5px] leading-tight font-medium px-1 py-0.5 rounded-sm truncate w-full text-center ${pillClass}`}
                    >
                      {ev.title}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Selected Indicator / Smiley badge */}
              {cell.isSelected && (
                <div className="flex justify-center mt-auto pt-0.5">
                  <Smile size={11} className="text-[#7a1616]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
