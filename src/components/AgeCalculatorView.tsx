import { useState, useMemo } from 'react';
import {
  Cake,
  Calendar,
  Clock,
  Sparkles,
  Share2,
  Check,
  Heart,
  Hourglass,
  CalendarCheck,
} from 'lucide-react';
import {
  HIJRI_MONTHS_AR,
  findHijriMonthStart,
  getHijriFromGregorian,
  toArabicNumerals,
  getArabicWeekdayIndex,
  ARABIC_WEEKDAYS,
} from '../utils/hijriCalendar';

interface AgeCalculatorViewProps {
  adjustment: number;
  useArabicDigits: boolean;
  onSelectHijriDate: (year: number, month: number, day: number) => void;
}

const GREGORIAN_MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const AgeCalculatorView = ({
  adjustment,
  useArabicDigits,
  onSelectHijriDate,
}: AgeCalculatorViewProps) => {
  const [inputMode, setInputMode] = useState<'gregorian' | 'hijri'>('gregorian');
  const [copied, setCopied] = useState(false);

  // Today
  const today = useMemo(() => new Date(), []);
  const todayHijri = useMemo(() => getHijriFromGregorian(today, adjustment), [today, adjustment]);

  // Gregorian Birthday Inputs (Default to 25 years ago)
  const [gYear, setGYear] = useState(today.getFullYear() - 25);
  const [gMonth, setGMonth] = useState(1);
  const [gDay, setGDay] = useState(1);

  // Hijri Birthday Inputs (Default to 25 Hijri years ago)
  const [hYear, setHYear] = useState(todayHijri.year - 25);
  const [hMonth, setHMonth] = useState(1);
  const [hDay, setHDay] = useState(1);

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  // Derive Birth Date & Hijri date based on mode
  const { birthDate, birthHijri, isFuture } = useMemo(() => {
    let bDate: Date;
    let bHijri: { year: number; month: number; day: number };

    if (inputMode === 'gregorian') {
      bDate = new Date(gYear, gMonth - 1, gDay, 12, 0, 0);
      bHijri = getHijriFromGregorian(bDate, adjustment);
    } else {
      const hMonthStart = findHijriMonthStart(hYear, hMonth, adjustment);
      bDate = new Date(hMonthStart.getTime() + (hDay - 1) * 86400000);
      bDate.setHours(12, 0, 0, 0);
      bHijri = { year: hYear, month: hMonth, day: hDay };
    }

    const future = bDate.getTime() > today.getTime();
    return { birthDate: bDate, birthHijri: bHijri, isFuture: future };
  }, [inputMode, gYear, gMonth, gDay, hYear, hMonth, hDay, adjustment, today]);

  // Gregorian Age Calculation (exact years, months, days)
  const gregorianAge = useMemo(() => {
    let y = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    let d = today.getDate() - birthDate.getDate();

    if (d < 0) {
      m -= 1;
      const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      d += prevMonthLastDay;
    }
    if (m < 0) {
      y -= 1;
      m += 12;
    }
    return {
      years: Math.max(0, y),
      months: Math.max(0, m),
      days: Math.max(0, d),
    };
  }, [birthDate, today]);

  // Hijri Age Calculation (exact Hijri years, months, days)
  const hijriAge = useMemo(() => {
    let y = todayHijri.year - birthHijri.year;
    let m = todayHijri.month - birthHijri.month;
    let d = todayHijri.day - birthHijri.day;

    if (d < 0) {
      m -= 1;
      d += 30; // standard hijri month span
    }
    if (m < 0) {
      y -= 1;
      m += 12;
    }
    return {
      years: Math.max(0, y),
      months: Math.max(0, m),
      days: Math.max(0, d),
    };
  }, [birthHijri, todayHijri]);

  // Total Lifetime Statistics
  const lifetimeStats = useMemo(() => {
    const diffMs = Math.max(0, today.getTime() - birthDate.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const remainingWeekDays = totalDays % 7;
    const totalMonths = Math.floor(totalDays / 30.4375);
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    // Weekday born
    const weekdayIndex = getArabicWeekdayIndex(birthDate);
    const weekdayName = ARABIC_WEEKDAYS[weekdayIndex];

    return {
      totalDays,
      totalWeeks,
      remainingWeekDays,
      totalMonths,
      totalHours,
      totalMinutes,
      weekdayName,
    };
  }, [birthDate, today]);

  // Next Birthday (Gregorian & Hijri)
  const nextBirthday = useMemo(() => {
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);

    // Next Gregorian birthday
    let nextGBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    nextGBday.setHours(0, 0, 0, 0);
    if (nextGBday.getTime() < todayMidnight.getTime()) {
      nextGBday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntilG = Math.round((nextGBday.getTime() - todayMidnight.getTime()) / 86400000);
    const nextGWeekday = ARABIC_WEEKDAYS[getArabicWeekdayIndex(nextGBday)];

    // Next Hijri birthday
    let nextHYear = todayHijri.year;
    if (
      todayHijri.month > birthHijri.month ||
      (todayHijri.month === birthHijri.month && todayHijri.day > birthHijri.day)
    ) {
      nextHYear += 1;
    }
    const nextHMonthStart = findHijriMonthStart(nextHYear, birthHijri.month, adjustment);
    const nextHBdayGregorian = new Date(
      nextHMonthStart.getTime() + (birthHijri.day - 1) * 86400000
    );
    nextHBdayGregorian.setHours(0, 0, 0, 0);
    const daysUntilH = Math.max(
      0,
      Math.round((nextHBdayGregorian.getTime() - todayMidnight.getTime()) / 86400000)
    );
    const nextHWeekday = ARABIC_WEEKDAYS[getArabicWeekdayIndex(nextHBdayGregorian)];

    return {
      daysUntilG,
      nextGWeekday,
      nextGBday,
      daysUntilH,
      nextHWeekday,
      nextHYear,
    };
  }, [birthDate, birthHijri, todayHijri, today, adjustment]);

  const handleCopyReport = () => {
    const text = `🎂 تقرير حساب العمر — تطبيق مِيعاد (MIAD)
━━━━━━━━━━━━━━━━━━━━
📅 تاريخ الميلاد:
• بالميلادي: ${num(birthDate.getDate())} ${GREGORIAN_MONTHS_AR[birthDate.getMonth()]} ${num(birthDate.getFullYear())}م
• بالهجري: ${num(birthHijri.day)} ${HIJRI_MONTHS_AR[birthHijri.month]} ${num(birthHijri.year)}هـ
🗓️ ولدت في يوم: ${lifetimeStats.weekdayName}

✨ العمر الحالي لليوم:
• بالميلادي: ${num(gregorianAge.years)} سنة و ${num(gregorianAge.months)} شهر و ${num(gregorianAge.days)} يوم
• بالهجري: ${num(hijriAge.years)} سنة و ${num(hijriAge.months)} شهر و ${num(hijriAge.days)} يوم

⏳ المتبقي ليوم ميلادك القادم:
• ميلادي: باقي ${num(nextBirthday.daysUntilG)} يوم (يوافق يوم ${nextBirthday.nextGWeekday})
• هجري: باقي ${num(nextBirthday.daysUntilH)} يوم (يوافق يوم ${nextBirthday.nextHWeekday})

📊 إجمالي الأيام المعاشة: ${num(lifetimeStats.totalDays.toLocaleString('ar-SA'))} يوم
━━━━━━━━━━━━━━━━━━━━
تطبيق مِيعاد: https://hijri-calendar-2026.web.app`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-50/70 overflow-y-auto p-4 select-none text-right smooth-scroll">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/80">
        <span className="text-[11px] bg-rose-100/80 text-rose-900 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
          <Heart size={11} className="fill-rose-700 text-rose-700" />
          <span>حاسبة العمر الذكية</span>
        </span>
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
          <span>حاسبة العمر</span>
          <Cake size={17} className="text-[#841c1c]" />
        </h2>
      </div>

      {/* Today Banner */}
      <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-2.5 mb-3.5 flex items-center justify-between text-xs">
        <span className="font-sans font-medium text-amber-900">
          الموافق {num(today.getDate())} {GREGORIAN_MONTHS_AR[today.getMonth()]} {num(today.getFullYear())}م
        </span>
        <div className="flex items-center gap-1.5 font-bold text-amber-950">
          <Clock size={13} className="text-amber-800" />
          <span>
            تاريخ اليوم: {num(todayHijri.day)} {HIJRI_MONTHS_AR[todayHijri.month]} {num(todayHijri.year)}هـ
          </span>
        </div>
      </div>

      {/* Input Mode Selector */}
      <div className="flex bg-neutral-200/70 p-1 rounded-2xl mb-3.5">
        <button
          onClick={() => setInputMode('gregorian')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            inputMode === 'gregorian'
              ? 'bg-white text-neutral-900 shadow-2xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          إدخال بالميلادي
        </button>
        <button
          onClick={() => setInputMode('hijri')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            inputMode === 'hijri'
              ? 'bg-white text-neutral-900 shadow-2xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          إدخال بالهجري (أم القرى)
        </button>
      </div>

      {/* Birthday Inputs */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs mb-3.5">
        <label className="block text-xs font-bold text-neutral-800 mb-2.5">
          {inputMode === 'gregorian' ? 'اختر تاريخ ميلادك بالميلادي:' : 'اختر تاريخ ميلادك بالهجري:'}
        </label>

        {inputMode === 'gregorian' ? (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="block text-[11px] font-medium text-neutral-500 mb-1">اليوم</span>
              <select
                value={gDay}
                onChange={(e) => setGDay(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c]"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {num(d)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-neutral-500 mb-1">الشهر</span>
              <select
                value={gMonth}
                onChange={(e) => setGMonth(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c]"
              >
                {GREGORIAN_MONTHS_AR.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {num(idx + 1)} - {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-neutral-500 mb-1">السنة</span>
              <select
                value={gYear}
                onChange={(e) => setGYear(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c]"
              >
                {Array.from({ length: 110 }, (_, i) => today.getFullYear() - i).map((y) => (
                  <option key={y} value={y}>
                    {num(y)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="block text-[11px] font-medium text-neutral-500 mb-1">اليوم</span>
              <select
                value={hDay}
                onChange={(e) => setHDay(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c]"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {num(d)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-neutral-500 mb-1">الشهر</span>
              <select
                value={hMonth}
                onChange={(e) => setHMonth(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c]"
              >
                {HIJRI_MONTHS_AR.slice(1).map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {num(idx + 1)} - {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-neutral-500 mb-1">السنة</span>
              <select
                value={hYear}
                onChange={(e) => setHYear(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c]"
              >
                {Array.from({ length: 110 }, (_, i) => todayHijri.year - i).map((y) => (
                  <option key={y} value={y}>
                    {num(y)}هـ
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Corresponding Date & Day of Birth Badge */}
        <div className="mt-3 pt-3 border-t border-neutral-150 flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg">
            يوم ولادتك: <strong className="text-neutral-950 font-bold">{lifetimeStats.weekdayName}</strong>
          </span>
          <span className="text-neutral-500 text-[11.5px]">
            {inputMode === 'gregorian' ? (
              <>
                المطابق:{' '}
                <strong className="text-[#841c1c] font-bold">
                  {num(birthHijri.day)} {HIJRI_MONTHS_AR[birthHijri.month]} {num(birthHijri.year)}هـ
                </strong>
              </>
            ) : (
              <>
                المطابق:{' '}
                <strong className="text-[#841c1c] font-bold">
                  {num(birthDate.getDate())} {GREGORIAN_MONTHS_AR[birthDate.getMonth()]}{' '}
                  {num(birthDate.getFullYear())}م
                </strong>
              </>
            )}
          </span>
        </div>
      </div>

      {isFuture ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs text-rose-800 font-semibold mb-3">
          تاريخ الميلاد المدخل في المستقبل! يرجى اختيار تاريخ ميلاد سابق لتاريخ اليوم.
        </div>
      ) : (
        <>
          {/* Main Age Result Cards (Gregorian & Hijri) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
            {/* Gregorian Age Card */}
            <div className="bg-gradient-to-br from-white to-red-50/40 p-4 rounded-2xl border border-red-200/80 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                  ميلادي
                </span>
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                  <span>عمرك بالميلادي</span>
                  <Calendar size={13} className="text-[#841c1c]" />
                </span>
              </div>

              {/* Big Numbers */}
              <div className="flex items-baseline justify-center gap-2.5 py-2 my-1 bg-white/80 rounded-xl border border-red-100">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#841c1c] leading-none">
                    {num(gregorianAge.years)}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-semibold mt-1">سنة</div>
                </div>
                <span className="text-neutral-300 font-light text-xl">و</span>
                <div className="text-center">
                  <div className="text-xl font-bold text-neutral-800 leading-none">
                    {num(gregorianAge.months)}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-semibold mt-1">شهر</div>
                </div>
                <span className="text-neutral-300 font-light text-xl">و</span>
                <div className="text-center">
                  <div className="text-xl font-bold text-neutral-800 leading-none">
                    {num(gregorianAge.days)}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-semibold mt-1">يوم</div>
                </div>
              </div>
            </div>

            {/* Hijri Age Card */}
            <div className="bg-gradient-to-br from-white to-amber-50/50 p-4 rounded-2xl border border-amber-200/80 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  تقويم أم القرى
                </span>
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                  <span>عمرك بالهجري</span>
                  <Sparkles size={13} className="text-amber-600" />
                </span>
              </div>

              {/* Big Numbers */}
              <div className="flex items-baseline justify-center gap-2.5 py-2 my-1 bg-white/80 rounded-xl border border-amber-100">
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-900 leading-none">
                    {num(hijriAge.years)}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-semibold mt-1">سنة</div>
                </div>
                <span className="text-neutral-300 font-light text-xl">و</span>
                <div className="text-center">
                  <div className="text-xl font-bold text-neutral-800 leading-none">
                    {num(hijriAge.months)}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-semibold mt-1">شهر</div>
                </div>
                <span className="text-neutral-300 font-light text-xl">و</span>
                <div className="text-center">
                  <div className="text-xl font-bold text-neutral-800 leading-none">
                    {num(hijriAge.days)}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-semibold mt-1">يوم</div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Birthday Banner */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs mb-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                باقي {num(nextBirthday.daysUntilG)} يوماً
              </span>
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <span>الموعد القادم لذكرى ميلادك</span>
                <Cake size={14} className="text-emerald-700" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-150">
                <div className="text-[10.5px] text-neutral-500 mb-0.5">بالميلادي:</div>
                <div className="font-bold text-neutral-900">
                  {num(birthDate.getDate())} {GREGORIAN_MONTHS_AR[birthDate.getMonth()]}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  يوافق يوم {nextBirthday.nextGWeekday}
                </div>
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-150">
                <div className="text-[10.5px] text-neutral-500 mb-0.5">بالهجري:</div>
                <div className="font-bold text-neutral-900">
                  {num(birthHijri.day)} {HIJRI_MONTHS_AR[birthHijri.month]}
                </div>
                <div className="text-[11px] text-amber-800 font-semibold mt-1">
                  باقي {num(nextBirthday.daysUntilH)} يوم ({nextBirthday.nextHWeekday})
                </div>
              </div>
            </div>
          </div>

          {/* Lifetime Detailed Metrics Grid */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs mb-3.5 space-y-3">
            <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 justify-between">
              <span className="text-[10.5px] text-neutral-400 font-normal">
                حساب دقيق حتى تاريخ اليوم
              </span>
              <div className="flex items-center gap-1">
                <span>إجمالي الوقت المعاش</span>
                <Hourglass size={14} className="text-[#841c1c]" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60 text-center">
                <div className="text-sm sm:text-base font-bold text-neutral-900 font-mono">
                  {num(lifetimeStats.totalDays.toLocaleString('ar-SA'))}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">إجمالي الأيام</div>
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60 text-center">
                <div className="text-sm sm:text-base font-bold text-neutral-900 font-mono">
                  {num(lifetimeStats.totalWeeks.toLocaleString('ar-SA'))}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  أسبوع و {num(lifetimeStats.remainingWeekDays)} يوم
                </div>
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60 text-center">
                <div className="text-sm sm:text-base font-bold text-neutral-900 font-mono">
                  {num(lifetimeStats.totalMonths.toLocaleString('ar-SA'))}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">إجمالي الأشهر</div>
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60 text-center">
                <div className="text-sm sm:text-base font-bold text-neutral-900 font-mono truncate">
                  {num(lifetimeStats.totalHours.toLocaleString('ar-SA'))}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">إجمالي الساعات</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
            <button
              onClick={() => onSelectHijriDate(birthHijri.year, birthHijri.month, birthHijri.day)}
              className="w-full sm:flex-1 py-2.5 px-3 bg-[#841c1c] hover:bg-[#6e1414] active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CalendarCheck size={14} />
              <span>عرض شهر ميلادك في التقويم</span>
            </button>

            <button
              onClick={handleCopyReport}
              className={`w-full sm:w-auto py-2.5 px-4 text-xs font-bold rounded-xl border transition active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer ${
                copied
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
              }`}
            >
              {copied ? <Check size={14} className="stroke-[3]" /> : <Share2 size={14} />}
              <span>{copied ? 'تم نسخ التقرير!' : 'نسخ تقرير العمر'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
