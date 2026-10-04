import { useState, useMemo } from 'react';
import {
  Search,
  X,
  ChevronDown,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import {
  HIJRI_MONTHS_AR,
  toArabicNumerals,
  getIslamicEvents,
  type UserNote,
} from '../utils/hijriCalendar';
import { KaabaIcon, BalloonIcon } from './CalendarIcons';
import { EventIconRenderer } from './EventIcons';

interface CalendarHeaderProps {
  hijriYear: number;
  hijriMonth: number;
  selectedDay?: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToDate: (year: number, month: number, day: number) => void;
  onResetToToday: () => void;
  useArabicDigits: boolean;
  isToday: boolean;
  gregorianMonthYear?: string;
  todayDay: number;
  userNotes?: UserNote[];
  deletedIslamicEventIds?: string[];
}

function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '');
}

export const CalendarHeader = ({
  hijriYear,
  hijriMonth,
  onJumpToDate,
  onResetToToday,
  useArabicDigits,
  isToday,
  gregorianMonthYear,
  todayDay,
  userNotes = [],
  deletedIslamicEventIds = [],
}: CalendarHeaderProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempYear, setTempYear] = useState(hijriYear);
  const [tempMonth, setTempMonth] = useState(hijriMonth);

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  const monthName = HIJRI_MONTHS_AR[hijriMonth - 1];

  // Hijri Month label: only month and year (e.g. "ذو الحجة ١٤٣٥ هـ")
  const formattedHeader = `${monthName} ${num(hijriYear)} هـ`;

  // Searchable events across all 12 Hijri months + user notes
  const searchableEvents = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      details?: string;
      year: number;
      month: number;
      day: number;
      monthName: string;
      isIslamic: boolean;
      icon?: string;
    }> = [];

    // Islamic events
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= 30; d++) {
        const evs = getIslamicEvents(m, d, deletedIslamicEventIds);
        evs.forEach((ev) => {
          list.push({
            id: `islamic-${m}-${d}-${ev.id}`,
            title: ev.titleAr,
            details: ev.titleEn,
            year: hijriYear,
            month: m,
            day: d,
            monthName: HIJRI_MONTHS_AR[m - 1],
            isIslamic: true,
            icon: ev.icon,
          });
        });
      }
    }

    // User personal notes
    userNotes.forEach((n) => {
      list.push({
        id: n.id,
        title: n.title,
        details: n.details,
        year: n.hijriYear,
        month: n.hijriMonth,
        day: n.hijriDay,
        monthName: HIJRI_MONTHS_AR[n.hijriMonth - 1] || '',
        isIslamic: false,
        icon: n.icon || 'pin',
      });
    });

    return list;
  }, [hijriYear, userNotes, deletedIslamicEventIds]);

  // Filter search results by keyword
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const qNorm = normalizeArabic(searchQuery.trim());
    return searchableEvents.filter((item) => {
      const matchTitle = normalizeArabic(item.title).includes(qNorm);
      const matchDetails = item.details ? normalizeArabic(item.details).includes(qNorm) : false;
      const matchMonth = normalizeArabic(item.monthName).includes(qNorm);
      return matchTitle || matchDetails || matchMonth;
    });
  }, [searchQuery, searchableEvents]);

  const handleApplyJump = () => {
    onJumpToDate(tempYear, tempMonth, 1);
    setShowPicker(false);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-neutral-150/80 px-3.5 pt-3 pb-2.5 select-none z-20">
      {/* Header matching user uploaded screenshot: Title on right, Search & Today badge on left */}
      <div className="flex items-center justify-between">
        {/* Right side (start in RTL): Month and Year Title */}
        <button
          onClick={() => {
            setTempYear(hijriYear);
            setTempMonth(hijriMonth);
            setShowPicker(true);
          }}
          className="group flex flex-col items-start text-right hover:opacity-85 transition-opacity"
          title="انقر لتغيير الشهر أو السنة"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 group-hover:text-[#841c1c] transition-colors leading-tight whitespace-nowrap"
              style={{
                fontFamily:
                  '"Cairo", "Traditional Arabic", -apple-system, sans-serif',
              }}
            >
              {formattedHeader}
            </span>
            <ChevronDown
              size={16}
              className="text-neutral-400 group-hover:text-neutral-700 transition-transform group-hover:translate-y-0.5"
            />
          </div>

          {gregorianMonthYear && (
            <span className="text-[11px] sm:text-xs font-semibold text-neutral-500 font-sans tracking-tight mt-0.5 whitespace-nowrap">
              {gregorianMonthYear}
            </span>
          )}
        </button>

        {/* Left side (end in RTL): Search Icon & Today [4] Badge Icon */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Find words in any event */}
          <button
            onClick={() => setShowSearch(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200/80 transition active:scale-95 cursor-pointer"
            title="بحث عن كلمة في المناسبات والأحداث"
            aria-label="بحث عن كلمة في المناسبات والأحداث"
          >
            <Search size={22} className="stroke-[2.2] text-neutral-900" />
          </button>

          {/* Today Date Badge Icon: Outlined rounded square with today's date */}
          <button
            onClick={onResetToToday}
            className={`w-8 h-8 rounded-[8px] border-2 flex items-center justify-center font-black text-xs sm:text-sm font-mono transition-all active:scale-95 cursor-pointer ${
              isToday
                ? 'border-[#841c1c] text-[#841c1c] bg-red-50/60 shadow-2xs'
                : 'border-neutral-900 text-neutral-900 hover:bg-neutral-100'
            }`}
            title="الانتقال السريع إلى تاريخ اليوم"
            aria-label="الانتقال السريع إلى تاريخ اليوم"
          >
            <span>{num(todayDay)}</span>
          </button>
        </div>
      </div>

      {/* Event Words Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md text-right border border-neutral-150 overflow-hidden flex flex-col max-h-[85vh] mt-8 sm:mt-0">
            {/* Search Input Bar */}
            <div className="p-3 border-b border-neutral-200/80 bg-neutral-50/70 flex items-center gap-2">
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200/70 transition shrink-0 cursor-pointer"
                title="إغلاق"
              >
                <X size={18} />
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن كلمة في أي مناسبة أو ملاحظة..."
                  className="w-full bg-white border border-neutral-200 rounded-xl py-2 pr-9 pl-3 text-xs sm:text-sm font-medium text-neutral-900 shadow-2xs focus:ring-2 focus:ring-[#841c1c] focus:outline-none transition placeholder:text-neutral-400 text-right"
                />
                <Search size={16} className="absolute right-2.5 top-2.5 sm:top-3 text-neutral-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 smooth-scroll min-h-[160px] max-h-[60vh]">
              {searchQuery.trim() === '' ? (
                <div className="py-8 text-center text-neutral-400 text-xs sm:text-sm space-y-1">
                  <Search size={28} className="mx-auto mb-2 text-neutral-300" />
                  <p className="font-semibold text-neutral-600">البحث في المناسبات والملاحظات</p>
                  <p className="text-[11px] text-neutral-400">
                    اكتب أي كلمة (مثل: عرفة، العيد، رمضان، موعد...) للوصول المباشر إليها
                  </p>
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-xs sm:text-sm">
                  لا توجد مناسبات أو ملاحظات تحتوي على "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-neutral-400 px-1 pb-1">
                    {filteredSearchResults.length} نتيجة مطابقة:
                  </div>
                  {filteredSearchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onJumpToDate(item.year, item.month, item.day);
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                      className="p-2.5 rounded-xl border border-neutral-150 hover:border-[#841c1c]/50 hover:bg-amber-50/30 active:scale-[0.98] transition cursor-pointer flex items-center justify-between group"
                    >
                      <span className="text-[11px] bg-neutral-100 group-hover:bg-amber-100 text-neutral-700 group-hover:text-amber-900 px-2 py-0.5 rounded-md font-mono font-bold shrink-0">
                        {num(item.day)} {item.monthName} {num(item.year)} هـ
                      </span>

                      <div className="flex items-center gap-2 pr-1">
                        <div className="text-right">
                          <div className="font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-[#841c1c]">
                            {item.title}
                          </div>
                          {item.details && (
                            <div className="text-[10px] text-neutral-500 font-sans line-clamp-1">
                              {item.details}
                            </div>
                          )}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                          {item.isIslamic ? (
                            item.icon === 'kaaba' ? (
                              <KaabaIcon size={16} />
                            ) : item.icon === 'balloon' ? (
                              <BalloonIcon size={16} />
                            ) : (
                              <Sparkles size={14} className="text-amber-600" />
                            )
                          ) : (
                            <EventIconRenderer icon={item.icon || 'pin'} size={14} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
