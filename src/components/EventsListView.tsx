import { useState } from 'react';
import { Search, Sparkles, ChevronLeft } from 'lucide-react';
import {
  HIJRI_MONTHS_AR,
  findHijriMonthStart,
  getIslamicEvents,
  toArabicNumerals,
} from '../utils/hijriCalendar';
import { KaabaIcon, BalloonIcon } from './CalendarIcons';

interface EventsListViewProps {
  currentHijriYear: number;
  adjustment: number;
  useArabicDigits: boolean;
  onSelectEventDate: (year: number, month: number, day: number) => void;
  showIslamicEvents: boolean;
  onToggleShowIslamicEvents: (show: boolean) => void;
}

export const EventsListView = ({
  currentHijriYear,
  adjustment,
  useArabicDigits,
  onSelectEventDate,
  showIslamicEvents,
  onToggleShowIslamicEvents,
}: EventsListViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  // Collect all Islamic events for the entire Hijri year
  const allEvents: {
    month: number;
    day: number;
    monthName: string;
    event: any;
    gregorianDate: Date;
  }[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthStart = findHijriMonthStart(currentHijriYear, m, adjustment);
    for (let d = 1; d <= 30; d++) {
      const events = getIslamicEvents(m, d);
      if (events.length > 0) {
        const gDate = new Date(monthStart.getTime() + (d - 1) * 86400000);
        events.forEach((ev) => {
          allEvents.push({
            month: m,
            day: d,
            monthName: HIJRI_MONTHS_AR[m - 1],
            event: ev,
            gregorianDate: gDate,
          });
        });
      }
    }
  }

  const filtered = allEvents.filter(
    (item) =>
      item.event.titleAr.includes(searchQuery) ||
      item.monthName.includes(searchQuery) ||
      item.event.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-neutral-50/70 overflow-y-auto p-4 select-none text-right smooth-scroll">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 mb-3">
        <span className="text-[11px] bg-amber-100/80 text-amber-900 px-2.5 py-1 rounded-full font-bold">
          عام {num(currentHijriYear)} هـ
        </span>
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
          <span>المناسبات والأعياد الإسلامية</span>
          <Sparkles size={16} className="text-amber-600" />
        </h2>
      </div>

      {/* Toggle Option: Show/Hide Islamic Events in Calendar */}
      <div
        onClick={() => onToggleShowIslamicEvents(!showIslamicEvents)}
        className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs mb-3.5 flex items-center justify-between cursor-pointer hover:border-neutral-300 transition select-none active:scale-[0.99]"
      >
        {/* Toggle Switch & Status Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center duration-200 ease-in-out ${
              showIslamicEvents ? 'bg-[#841c1c] justify-end' : 'bg-neutral-300 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform" />
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
              showIslamicEvents
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {showIslamicEvents ? 'ظاهرة' : 'مخفية'}
          </span>
        </div>

        {/* Label & Description */}
        <div className="text-right">
          <div className="text-xs font-bold text-neutral-900 flex items-center justify-end gap-1.5">
            <span>إظهار المناسبات بالتقويم</span>
            <Sparkles size={14} className="text-amber-600" />
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            عرض الأيقونات (مثل الكعبة والبالون) بالتقويم
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن مناسبة (عرفة، الأضحى، الفطر، رمضان...)"
          className="w-full bg-white border border-neutral-200/90 rounded-2xl py-2.5 pr-9 pl-3 text-xs font-medium text-neutral-900 shadow-2xs focus:ring-2 focus:ring-[#841c1c] focus:outline-none transition placeholder:text-neutral-400"
        />
        <Search size={15} className="absolute right-3 top-3 text-neutral-400" />
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {filtered.map((item, idx) => (
          <div
            key={`${item.month}-${item.day}-${idx}`}
            onClick={() => onSelectEventDate(currentHijriYear, item.month, item.day)}
            className="bg-white p-3 rounded-2xl border border-neutral-200/80 hover:border-[#841c1c]/40 hover:shadow-xs active:scale-[0.98] transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-1 text-neutral-400 group-hover:text-neutral-700 transition">
              <ChevronLeft size={16} />
              <div className="text-left">
                <span className="text-[11px] font-sans text-neutral-500 block font-medium">
                  {item.gregorianDate.toLocaleDateString('ar-SA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 inline-block font-bold">
                  {num(item.day)} {item.monthName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold text-neutral-900 text-sm">
                  {item.event.titleAr}
                </div>
                <div className="text-[11px] text-neutral-400">{item.event.titleEn}</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-neutral-50 border border-neutral-150 flex items-center justify-center shrink-0">
                {item.event.icon === 'kaaba' && <KaabaIcon size={22} />}
                {item.event.icon === 'balloon' && <BalloonIcon size={22} />}
                {item.event.icon === 'crescent' && <span className="text-lg">🌙</span>}
                {item.event.icon !== 'kaaba' &&
                  item.event.icon !== 'balloon' &&
                  item.event.icon !== 'crescent' && (
                    <Sparkles size={16} className="text-amber-500" />
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
