import {
  ARABIC_WEEKDAYS,
  type HijriDateInfo,
  toArabicNumerals,
} from '../utils/hijriCalendar';
import { EventIconRenderer } from './EventIcons';

interface CalendarGridProps {
  days: HijriDateInfo[];
  startWeekday: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  selectedDay: number;
  onSelectDay: (day: number) => void;
  useArabicDigits: boolean;
  notesDayMap: Record<number, { count: number; icon?: string; title?: string }>;
  showIslamicEvents?: boolean;
  todayDay?: number | null;
}

export const CalendarGrid = ({
  days,
  startWeekday,
  selectedDay,
  onSelectDay,
  useArabicDigits,
  notesDayMap,
  showIslamicEvents = true,
  todayDay,
}: CalendarGridProps) => {
  // Build grid cells: blank leading cells + month days
  const leadingBlanks = Array.from({ length: startWeekday });

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  return (
    <div className="w-full bg-[#F8F6F1] select-none px-2 sm:px-3 pt-0.5 pb-2 shrink-0">
      {/* Weekday Row (RTL: الأحد to السبت, الجمعة highlighted in subtle gold #B68B4C) */}
      <div className="grid grid-cols-7 text-center mb-0.5">
        {ARABIC_WEEKDAYS.map((name) => {
          const isFriday = name === 'الجمعة';
          return (
            <div
              key={name}
              className={`py-1 text-[11px] sm:text-xs font-medium tracking-tight ${
                isFriday ? 'text-[#B68B4C] font-semibold' : 'text-[#8C8C8C]'
              }`}
            >
              {name}
            </div>
          );
        })}
      </div>

      {/* Days Grid: 7 columns, breathable compact cells without heavy borders */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {/* Leading blank cells */}
        {leadingBlanks.map((_, idx) => (
          <div
            key={`blank-${idx}`}
            className="min-h-[44px] sm:min-h-[52px] rounded-xl opacity-0"
          />
        ))}

        {/* Hijri month days */}
        {days.map((dayInfo) => {
          const isSelected = dayInfo.day === selectedDay;
          const isToday = todayDay !== null && todayDay !== undefined && dayInfo.day === todayDay;
          const noteInfo = notesDayMap[dayInfo.day];
          const isFriday = dayInfo.weekdayIndex === 5;
          const hasEvent = showIslamicEvents && dayInfo.events && dayInfo.events.length > 0;

          // Determine the first event on this date
          let firstEventIcon: string | null = null;
          let firstEventTitle: string | null = null;

          if (hasEvent) {
            firstEventIcon = dayInfo.events[0].icon || 'sparkles';
            firstEventTitle = dayInfo.events[0].titleAr;
          } else if (noteInfo) {
            firstEventIcon = noteInfo.icon || 'pin';
            firstEventTitle = noteInfo.title || 'حدث مسجل';
          }

          return (
            <div
              key={dayInfo.day}
              onClick={() => onSelectDay(dayInfo.day)}
              className={`relative min-h-[44px] sm:min-h-[52px] py-0.5 px-0.5 rounded-xl flex flex-col items-center justify-between cursor-pointer transition-all duration-150 active:scale-95 ${
                isSelected
                  ? 'bg-[#F1EEE7] border border-[#183B3A]/25 shadow-2xs'
                  : isToday
                  ? 'bg-[#F1EEE7]/60 hover:bg-[#F1EEE7]'
                  : 'bg-transparent hover:bg-[#F1EEE7]/50'
              }`}
            >
              {/* Top/Center: Hijri Day Number in Circular Badge if Selected/Today */}
              <div className="flex flex-col items-center justify-center">
                {isSelected || isToday ? (
                  <span
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#183B3A] text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs leading-none"
                    title={isToday ? 'اليوم' : 'اليوم المحدد'}
                  >
                    {num(dayInfo.day)}
                  </span>
                ) : (
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-semibold leading-none ${
                      isFriday ? 'text-[#B68B4C] font-bold' : 'text-[#252525]'
                    }`}
                  >
                    {num(dayInfo.day)}
                  </span>
                )}
              </div>

              {/* Bottom: Smaller Gregorian Date + Tiny Event Indicator */}
              <div className="w-full flex items-center justify-center gap-1">
                {/* Gregorian Day Number */}
                <span className="font-sans text-[9px] sm:text-[10px] text-[#8C8C8C] font-medium leading-none">
                  {dayInfo.gregorianDay}
                </span>

                {/* Small indicator: Flag or tiny sand-gold dot for occasions */}
                {firstEventIcon === 'flag' ? (
                  <div className="shrink-0 -mt-0.5" title={firstEventTitle || ''}>
                    <EventIconRenderer icon="flag" size={10} />
                  </div>
                ) : hasEvent || noteInfo ? (
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#B68B4C] shrink-0"
                    title={firstEventTitle || ''}
                  />
                ) : null}
              </div>
            </div>
          );
        })}

        {/* Trailing blank cells to complete the grid */}
        {Array.from({
          length: (7 - ((leadingBlanks.length + days.length) % 7)) % 7,
        }).map((_, idx) => (
          <div
            key={`trailing-blank-${idx}`}
            className="min-h-[44px] sm:min-h-[52px] rounded-xl opacity-0"
          />
        ))}
      </div>
    </div>
  );
};
