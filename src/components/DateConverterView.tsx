import { useState } from 'react';
import { ArrowLeftRight, Calendar, Sparkles, Cake } from 'lucide-react';
import {
  HIJRI_MONTHS_AR,
  findHijriMonthStart,
  getHijriFromGregorian,
  toArabicNumerals,
  getArabicWeekdayIndex,
  ARABIC_WEEKDAYS,
  getIslamicEvents,
} from '../utils/hijriCalendar';
import { KaabaIcon, BalloonIcon } from './CalendarIcons';

interface DateConverterViewProps {
  adjustment: number;
  useArabicDigits: boolean;
  onSelectHijriDate: (year: number, month: number, day: number) => void;
  onOpenAgeCalculator?: () => void;
}

export const DateConverterView = ({
  adjustment,
  useArabicDigits,
  onSelectHijriDate,
  onOpenAgeCalculator,
}: DateConverterViewProps) => {
  const [mode, setMode] = useState<'g2h' | 'h2g'>('g2h');

  // Gregorian inputs
  const today = new Date();
  const [gYear, setGYear] = useState(today.getFullYear());
  const [gMonth, setGMonth] = useState(today.getMonth() + 1);
  const [gDay, setGDay] = useState(today.getDate());

  // Hijri inputs
  const initialH = getHijriFromGregorian(today, adjustment);
  const [hYear, setHYear] = useState(initialH.year);
  const [hMonth, setHMonth] = useState(initialH.month);
  const [hDay, setHDay] = useState(initialH.day);

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  // Result for Gregorian to Hijri
  const gTargetDate = new Date(gYear, gMonth - 1, gDay, 12, 0, 0);
  const convertedHijri = getHijriFromGregorian(gTargetDate, adjustment);
  const gWeekdayIndex = getArabicWeekdayIndex(gTargetDate);
  const gEvents = getIslamicEvents(convertedHijri.month, convertedHijri.day);

  // Result for Hijri to Gregorian
  const hMonthStart = findHijriMonthStart(hYear, hMonth, adjustment);
  const convertedGregorian = new Date(hMonthStart.getTime() + (hDay - 1) * 86400000);
  const hWeekdayIndex = getArabicWeekdayIndex(convertedGregorian);
  const hEvents = getIslamicEvents(hMonth, hDay);

  return (
    <div className="flex-1 flex flex-col bg-neutral-50/70 overflow-y-auto p-4 select-none text-right smooth-scroll">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/80">
        <span className="text-[11px] bg-amber-100/80 text-amber-900 px-2.5 py-1 rounded-full font-bold">
          تقويم أم القرى
        </span>
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
          <span>محول التاريخ الذكي</span>
          <ArrowLeftRight size={17} className="text-[#841c1c]" />
        </h2>
      </div>

      {/* Quick link to Age Calculator */}
      {onOpenAgeCalculator && (
        <button
          type="button"
          onClick={onOpenAgeCalculator}
          className="mb-3 w-full p-2.5 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 hover:from-rose-100/70 hover:to-amber-100/70 border border-rose-200/80 rounded-2xl flex items-center justify-between transition cursor-pointer text-xs group"
        >
          <span className="font-bold text-[#841c1c] flex items-center gap-1.5">
            <Cake size={14} className="text-[#841c1c]" />
            <span>حاسبة العمر الذكية</span>
          </span>
          <span className="text-[11px] text-neutral-600 flex items-center gap-1 group-hover:text-neutral-900 font-medium">
            <span>احسب عمرك بالتفصيل لليوم</span>
            <span className="font-bold text-[#841c1c]">←</span>
          </span>
        </button>
      )}

      {/* Segmented Control */}
      <div className="flex bg-neutral-200/70 p-1 rounded-2xl mb-4">
        <button
          onClick={() => setMode('g2h')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'g2h'
              ? 'bg-white text-neutral-900 shadow-2xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          من ميلادي إلى هجري
        </button>
        <button
          onClick={() => setMode('h2g')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'h2g'
              ? 'bg-white text-neutral-900 shadow-2xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          من هجري إلى ميلادي
        </button>
      </div>

      {mode === 'g2h' ? (
        /* Gregorian to Hijri */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <label className="block text-xs font-bold text-neutral-700 mb-2.5">
              التاريخ الميلادي:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="block text-[11px] font-medium text-neutral-500 mb-1">اليوم</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={gDay}
                  onChange={(e) => setGDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-center border border-neutral-200 bg-neutral-50 rounded-xl p-2 text-sm font-bold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#841c1c] focus:outline-none transition"
                />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-neutral-500 mb-1">الشهر</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={gMonth}
                  onChange={(e) => setGMonth(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-center border border-neutral-200 bg-neutral-50 rounded-xl p-2 text-sm font-bold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#841c1c] focus:outline-none transition"
                />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-neutral-500 mb-1">السنة</span>
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={gYear}
                  onChange={(e) => setGYear(parseInt(e.target.value, 10) || today.getFullYear())}
                  className="w-full text-center border border-neutral-200 bg-neutral-50 rounded-xl p-2 text-sm font-bold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#841c1c] focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white p-4 rounded-2xl border border-amber-200/80 shadow-xs text-right">
            <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-1.5">
              <Sparkles size={14} className="text-amber-600" />
              <span>المطابق بالتقويم الهجري:</span>
            </div>
            <div
              className="text-xl sm:text-2xl font-bold text-[#841c1c] mb-1.5"
              style={{ fontFamily: '"Cairo", -apple-system, sans-serif' }}
            >
              {ARABIC_WEEKDAYS[gWeekdayIndex]} {num(convertedHijri.day)}{' '}
              {HIJRI_MONTHS_AR[convertedHijri.month - 1]} {num(convertedHijri.year)} هـ
            </div>
            <div className="text-xs text-neutral-500 font-medium">
              الموافق بالميلادي: {gYear}/{gMonth}/{gDay}م
            </div>

            {gEvents.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-end gap-2 text-xs text-amber-950 font-semibold">
                <span>{gEvents[0].titleAr}</span>
                {gEvents[0].icon === 'kaaba' && <KaabaIcon size={18} />}
                {gEvents[0].icon === 'balloon' && <BalloonIcon size={18} />}
              </div>
            )}

            <button
              onClick={() => onSelectHijriDate(convertedHijri.year, convertedHijri.month, convertedHijri.day)}
              className="mt-3 w-full py-2.5 bg-[#841c1c] text-white text-xs font-bold rounded-xl hover:bg-[#6e1414] shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Calendar size={14} />
              <span>عرض هذا اليوم في التقويم</span>
            </button>
          </div>
        </div>
      ) : (
        /* Hijri to Gregorian */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <label className="block text-xs font-bold text-neutral-700 mb-2.5">
              التاريخ الهجري:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="block text-[11px] font-medium text-neutral-500 mb-1">اليوم</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={hDay}
                  onChange={(e) => setHDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-center border border-neutral-200 bg-neutral-50 rounded-xl p-2 text-sm font-bold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#841c1c] focus:outline-none transition"
                />
              </div>
              <div>
                <span className="block text-[11px] font-medium text-neutral-500 mb-1">الشهر</span>
                <select
                  value={hMonth}
                  onChange={(e) => setHMonth(parseInt(e.target.value, 10))}
                  className="w-full text-center border border-neutral-200 bg-neutral-50 rounded-xl p-2 text-xs font-bold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#841c1c] focus:outline-none transition"
                >
                  {HIJRI_MONTHS_AR.map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {mName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-[11px] font-medium text-neutral-500 mb-1">السنة الهجرية</span>
                <input
                  type="number"
                  min={1300}
                  max={1500}
                  value={hYear}
                  onChange={(e) => setHYear(parseInt(e.target.value, 10) || initialH.year)}
                  className="w-full text-center border border-neutral-200 bg-neutral-50 rounded-xl p-2 text-sm font-bold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#841c1c] focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white p-4 rounded-2xl border border-blue-200/80 shadow-xs text-right">
            <div className="flex items-center justify-between text-xs text-blue-900 font-bold mb-1.5">
              <Sparkles size={14} className="text-blue-600" />
              <span>المطابق بالتقويم الميلادي:</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-950 mb-1.5">
              {ARABIC_WEEKDAYS[hWeekdayIndex]} {convertedGregorian.getDate()}{' '}
              {convertedGregorian.toLocaleString('ar-SA', { month: 'long' })}{' '}
              {convertedGregorian.getFullYear()}م
            </div>
            <div className="text-xs text-neutral-500 font-mono">
              {convertedGregorian.getFullYear()}-{String(convertedGregorian.getMonth() + 1).padStart(2, '0')}-{String(convertedGregorian.getDate()).padStart(2, '0')}
            </div>

            {hEvents.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-blue-200/60 flex items-center justify-end gap-2 text-xs text-blue-950 font-semibold">
                <span>{hEvents[0].titleAr}</span>
                {hEvents[0].icon === 'kaaba' && <KaabaIcon size={18} />}
                {hEvents[0].icon === 'balloon' && <BalloonIcon size={18} />}
              </div>
            )}

            <button
              onClick={() => onSelectHijriDate(hYear, hMonth, hDay)}
              className="mt-3 w-full py-2.5 bg-[#841c1c] text-white text-xs font-bold rounded-xl hover:bg-[#6e1414] shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Calendar size={14} />
              <span>عرض هذا الشهر في التقويم</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
