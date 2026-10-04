import {
  ARABIC_WEEKDAYS,
  type HijriDateInfo,
  toArabicNumerals,
} from '../utils/hijriCalendar';
import { KaabaIcon, BalloonIcon } from './CalendarIcons';
import { EventIconRenderer } from './EventIcons';

interface CalendarGridProps {
  days: HijriDateInfo[];
  startWeekday: number; // 0 = Sat, 1 = Sun, ..., 6 = Fri
  selectedDay: number;
  onSelectDay: (day: number) => void;
  useArabicDigits: boolean;
  notesDayMap: Record<number, { count: number; icon?: string }>;
  showIslamicEvents?: boolean;
}

export const CalendarGrid = ({
  days,
  startWeekday,
  selectedDay,
  onSelectDay,
  useArabicDigits,
  notesDayMap,
  showIslamicEvents = true,
}: CalendarGridProps) => {
  // Find weekday index of selected day
  const selectedDayObj = days.find((d) => d.day === selectedDay);
  const activeWeekdayIndex = selectedDayObj ? selectedDayObj.weekdayIndex : -1;

  // Build grid cells: blank leading cells + month days
  const leadingBlanks = Array.from({ length: startWeekday });

  // Map first occurrence of Gregorian months
  const firstDayOfGMonthMap = new Map<number, { isFirstDayOfMonth: boolean; monthAbbr: string }>();

  if (days.length > 0) {
    firstDayOfGMonthMap.set(days[0].day, {
      isFirstDayOfMonth: false,
      monthAbbr: days[0].gregorianMonthNameEn,
    });
  }

  days.forEach((dayInfo) => {
    if (dayInfo.gregorianDay === 1) {
      firstDayOfGMonthMap.set(dayInfo.day, {
        isFirstDayOfMonth: true,
        monthAbbr: dayInfo.gregorianMonthNameEn,
      });
    }
  });

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  return (
    <div className="w-full bg-white select-none border-b border-neutral-200/80 shadow-2xs">
      {/* Weekday Row (RTL: السبت to الجمعة) */}
      <div className="grid grid-cols-7 border-b border-neutral-200/70 text-center text-xs">
        {ARABIC_WEEKDAYS.map((name, idx) => {
          const isSelectedCol = idx === activeWeekdayIndex;
          return (
            <div
              key={name}
              className={`py-2 text-[11px] sm:text-xs font-semibold border-l border-neutral-200/50 first:border-r-0 last:border-l-0 transition-colors ${
                isSelectedCol
                  ? 'bg-[#d8cebf] text-neutral-900 font-bold'
                  : 'bg-neutral-50/80 text-neutral-500'
              }`}
            >
              {name}
            </div>
          );
        })}
      </div>

      {/* Days Grid: 7 columns, RTL order */}
      <div className="grid grid-cols-7 border-l border-neutral-200/60 bg-neutral-100/40">
        {/* Leading blank cells */}
        {leadingBlanks.map((_, idx) => (
          <div
            key={`blank-${idx}`}
            className="min-h-[48px] sm:min-h-[52px] border-b border-r border-neutral-200/60 bg-neutral-50/50"
          />
        ))}

        {/* Hijri month days */}
        {days.map((dayInfo) => {
          const isSelected = dayInfo.day === selectedDay;
          const gInfo = firstDayOfGMonthMap.get(dayInfo.day);
          const hasKaaba = showIslamicEvents && dayInfo.events.some((e) => e.icon === 'kaaba');
          const hasBalloon = showIslamicEvents && dayInfo.events.some((e) => e.icon === 'balloon');
          const noteInfo = notesDayMap[dayInfo.day];
          const hasNotes = !!noteInfo;
          const isFriday = dayInfo.weekdayIndex === 6;

          return (
            <div
              key={dayInfo.day}
              onClick={() => onSelectDay(dayInfo.day)}
              className={`relative min-h-[48px] sm:min-h-[52px] p-1 sm:p-1.5 border-b border-r border-neutral-200/60 flex flex-col justify-between cursor-pointer transition-all duration-150 active:scale-95 ${
                isSelected
                  ? 'bg-[#d8cebf] shadow-inner text-neutral-900'
                  : isFriday
                  ? 'bg-amber-50/20 hover:bg-neutral-50'
                  : 'bg-white hover:bg-neutral-50'
              }`}
            >
              {/* Top Row: Hijri Day Number + Event Icons */}
              <div className="flex items-start justify-between">
                {/* Hijri day number in rich maroon font */}
                <span
                  className={`text-base sm:text-lg font-bold leading-none ${
                    isSelected
                      ? 'text-[#621113]'
                      : isFriday
                      ? 'text-[#841c1c]'
                      : 'text-[#8c1d1f]'
                  }`}
                  style={{
                    fontFamily:
                      '"Cairo", "Traditional Arabic", -apple-system, sans-serif',
                  }}
                >
                  {num(dayInfo.day)}
                </span>

                {/* Event icons inside cell */}
                <div className="flex items-center space-x-0.5 space-x-reverse">
                  {hasKaaba && <KaabaIcon size={15} className="drop-shadow-xs" />}
                  {hasBalloon && <BalloonIcon size={15} className="drop-shadow-xs" />}
                  {hasNotes && (
                    <div className="flex items-center gap-0.5">
                      <EventIconRenderer
                        icon={noteInfo.icon || 'pin'}
                        size={13}
                        className="drop-shadow-2xs"
                      />
                      {noteInfo.count > 1 && (
                        <span className="text-[8px] font-bold text-amber-900 bg-amber-200/90 rounded-full px-0.5 leading-none">
                          {noteInfo.count}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row: Gregorian Date / Month Badge */}
              <div className="flex items-end justify-between mt-1 text-[11px] leading-none">
                {gInfo ? (
                  gInfo.isFirstDayOfMonth ? (
                    // Oct 1 style blue badge matching screenshot
                    <div className="bg-[#2563eb] text-white text-[9px] rounded-xs px-1 py-0.5 font-bold flex flex-col items-center shadow-xs -mb-0.5 -mr-0.5">
                      <span className="text-[8px] leading-tight font-medium opacity-90">
                        {gInfo.monthAbbr}
                      </span>
                      <span className="leading-tight font-bold">{dayInfo.gregorianDay}</span>
                    </div>
                  ) : (
                    // Sep 25 style grey badge matching screenshot
                    <div className="bg-neutral-500 text-white text-[9px] rounded-xs px-1 py-0.5 font-semibold flex flex-col items-center shadow-2xs -mb-0.5 -mr-0.5">
                      <span className="text-[8px] leading-tight font-medium opacity-90">
                        {gInfo.monthAbbr}
                      </span>
                      <span className="leading-tight">{dayInfo.gregorianDay}</span>
                    </div>
                  )
                ) : (
                  // Regular Gregorian day number
                  <span
                    className={`font-sans text-[11px] mr-auto font-medium ${
                      isSelected ? 'text-neutral-700 font-bold' : 'text-neutral-400'
                    }`}
                  >
                    {dayInfo.gregorianDay}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Trailing blank cells to complete the grid */}
        {Array.from({
          length: (7 - ((leadingBlanks.length + days.length) % 7)) % 7,
        }).map((_, idx) => (
          <div
            key={`trailing-${idx}`}
            className="min-h-[48px] sm:min-h-[52px] border-b border-r border-neutral-200/60 bg-neutral-50/50"
          />
        ))}
      </div>
    </div>
  );
};
