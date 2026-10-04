import { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  RotateCcw,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import {
  HIJRI_MONTHS_AR,
  toArabicNumerals,
} from '../utils/hijriCalendar';

interface CalendarHeaderProps {
  hijriYear: number;
  hijriMonth: number;
  selectedDay: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToDate: (year: number, month: number, day: number) => void;
  onResetToToday: () => void;
  useArabicDigits: boolean;
  isToday: boolean;
  gregorianMonthYear?: string;
}

export const CalendarHeader = ({
  hijriYear,
  hijriMonth,
  selectedDay,
  onPrevMonth,
  onNextMonth,
  onJumpToDate,
  onResetToToday,
  useArabicDigits,
  isToday,
  gregorianMonthYear,
}: CalendarHeaderProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempYear, setTempYear] = useState(hijriYear);
  const [tempMonth, setTempMonth] = useState(hijriMonth);

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  const monthName = HIJRI_MONTHS_AR[hijriMonth - 1];

  // Exact format from the user's screenshot: "ذو الحجة ١٩-١٢-١٤٣٥ هـ"
  const formattedHeader = `${monthName} ${num(selectedDay)}-${num(hijriMonth)}-${num(hijriYear)} هـ`;

  const handleApplyJump = () => {
    onJumpToDate(tempYear, tempMonth, 1);
    setShowPicker(false);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-neutral-150/80 px-3 pt-2.5 pb-2 select-none z-20">
      <div className="flex items-center justify-between">
        {/* Next Month Button (RTL: right arrow goes forward) */}
        <button
          onClick={onNextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 active:bg-neutral-200/80 text-neutral-700 transition active:scale-90"
          title="الشهر التالي"
          aria-label="الشهر التالي"
        >
          <ChevronRight size={22} className="stroke-[2.2]" />
        </button>

        {/* Center Title Pill with Hijri on top and Gregorian below */}
        <button
          onClick={() => {
            setTempYear(hijriYear);
            setTempMonth(hijriMonth);
            setShowPicker(true);
          }}
          className="group flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl hover:bg-neutral-100/90 active:bg-neutral-200/70 transition-all border border-transparent hover:border-neutral-200 text-center"
          title="انقر لتغيير الشهر أو السنة"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="text-lg sm:text-xl font-bold tracking-tight text-[#841c1c] group-hover:text-[#9e1c1c] transition-colors leading-tight"
              style={{
                fontFamily:
                  '"Cairo", "Traditional Arabic", -apple-system, sans-serif',
              }}
            >
              {formattedHeader}
            </span>
            <ChevronDown
              size={15}
              className="text-neutral-400 group-hover:text-neutral-600 transition-transform group-hover:translate-y-0.5"
            />
          </div>

          {gregorianMonthYear && (
            <span className="text-[11px] sm:text-xs font-semibold text-neutral-500 font-sans tracking-tight mt-0.5">
              {gregorianMonthYear}
            </span>
          )}
        </button>

        {/* Prev Month Button */}
        <div className="flex items-center gap-1">
          {!isToday && (
            <button
              onClick={onResetToToday}
              className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-full transition flex items-center gap-1 border border-emerald-200/60"
              title="العودة إلى اليوم"
            >
              <RotateCcw size={11} />
              <span>اليوم</span>
            </button>
          )}

          <button
            onClick={onPrevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 active:bg-neutral-200/80 text-neutral-700 transition active:scale-90"
            title="الشهر السابق"
            aria-label="الشهر السابق"
          >
            <ChevronLeft size={22} className="stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Month & Year Picker Sheet / Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 w-full max-w-sm text-right border border-neutral-100 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-150">
              <button
                onClick={() => {
                  onJumpToDate(1435, 12, 19);
                  setShowPicker(false);
                }}
                className="flex items-center gap-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold px-2.5 py-1 rounded-full border border-amber-200 transition"
              >
                <Sparkles size={12} className="text-amber-600" />
                <span>تاريخ الصورة (١٤٣٥-١٢)</span>
              </button>
              <h3 className="font-bold text-neutral-900 text-base">الانتقال إلى تاريخ</h3>
            </div>

            {/* Year Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                  السنة الهجرية
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1300}
                    max={1500}
                    value={tempYear}
                    onChange={(e) => setTempYear(parseInt(e.target.value, 10) || hijriYear)}
                    className="w-full text-center border border-neutral-200 bg-neutral-50 rounded-xl p-2.5 font-mono text-base font-bold text-neutral-900 focus:ring-2 focus:ring-[#841c1c] focus:bg-white focus:outline-none transition"
                  />
                  <span className="text-sm font-bold text-neutral-500">هـ</span>
                </div>
              </div>

              {/* Month Selection Grid */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                  الشهر الهجري
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-50 rounded-2xl border border-neutral-150">
                  {HIJRI_MONTHS_AR.map((mName, idx) => {
                    const mNum = idx + 1;
                    const isSelected = tempMonth === mNum;
                    return (
                      <button
                        key={mNum}
                        type="button"
                        onClick={() => setTempMonth(mNum)}
                        className={`text-xs py-2 px-1 rounded-xl text-center font-medium transition-all ${
                          isSelected
                            ? 'bg-[#841c1c] text-white font-bold shadow-xs'
                            : 'hover:bg-white text-neutral-700'
                        }`}
                      >
                        <div>{mName}</div>
                        <div className="text-[10px] opacity-75 font-mono">{num(mNum)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-150">
                <button
                  type="button"
                  onClick={() => {
                    onResetToToday();
                    setShowPicker(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  <CalendarDays size={14} />
                  <span>تاريخ اليوم</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPicker(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyJump}
                    className="px-5 py-2 text-xs bg-[#841c1c] text-white rounded-xl font-bold hover:bg-[#6e1414] shadow-sm transition active:scale-95"
                  >
                    تطبيق
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
