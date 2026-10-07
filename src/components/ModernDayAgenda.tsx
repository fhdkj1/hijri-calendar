import React, { useState } from 'react';
import { Plus, Users, FileText, Home, Trash2, Pencil, Clock, Check, X } from 'lucide-react';
import { type UserNote, HIJRI_MONTHS_AR, GREGORIAN_MONTHS_AR, toArabicNumerals } from '../utils/hijriCalendar';

interface ModernDayAgendaProps {
  selectedDate: Date;
  hijriDate: { year: number; month: number; day: number };
  events: UserNote[];
  onAddEvent: (note: Omit<UserNote, 'id' | 'createdAt'> & { time?: string; color?: string }) => void;
  onUpdateEvent: (note: UserNote) => void;
  onDeleteEvent: (id: string) => void;
  useArabicDigits?: boolean;
}

const COLOR_OPTIONS = [
  { id: 'blue', bg: 'bg-sky-500', dot: 'bg-sky-500', border: 'border-sky-200', text: 'text-sky-700' },
  { id: 'amber', bg: 'bg-amber-500', dot: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-700' },
  { id: 'rose', bg: 'bg-rose-500', dot: 'bg-rose-500', border: 'border-rose-200', text: 'text-rose-700' },
  { id: 'emerald', bg: 'bg-emerald-500', dot: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-700' },
];

export const ModernDayAgenda: React.FC<ModernDayAgendaProps> = ({
  selectedDate,
  hijriDate,
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  useArabicDigits = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UserNote | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [details, setDetails] = useState('');
  const [icon, setIcon] = useState('users');
  const [selectedColor, setSelectedColor] = useState('blue');

  const num = (v: number | string) =>
    useArabicDigits ? toArabicNumerals(v) : String(v);

  // Weekday name in Arabic
  const weekdayIndex = selectedDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  // Map JS Sunday=0 to Arabic weekdays: Sun=الأحد, Mon=الإثنين, Tue=الثلاثاء, Wed=الأربعاء, Thu=الخميس, Fri=الجمعة, Sat=السبت
  const AR_WEEKDAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayNameAr = AR_WEEKDAY_NAMES[weekdayIndex];

  const hijriMonthName = HIJRI_MONTHS_AR[hijriDate.month - 1];
  const gMonthName = GREGORIAN_MONTHS_AR[selectedDate.getMonth()];

  const handleOpenAdd = () => {
    setTitle('');
    setTime('10:00 ص – 11:00 ص');
    setDetails('');
    setIcon('users');
    setSelectedColor('blue');
    setShowAddModal(true);
  };

  const handleOpenEdit = (ev: UserNote) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setTime((ev as any).time || '');
    setDetails(ev.details || '');
    setIcon(ev.icon || 'users');
    setSelectedColor((ev as any).color || 'blue');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEvent) {
      onUpdateEvent({
        ...editingEvent,
        title: title.trim(),
        details: details.trim(),
        icon,
        ...({ time, color: selectedColor } as any),
      });
      setEditingEvent(null);
    } else {
      onAddEvent({
        title: title.trim(),
        details: details.trim(),
        icon,
        hijriYear: hijriDate.year,
        hijriMonth: hijriDate.month,
        hijriDay: hijriDate.day,
        time,
        color: selectedColor,
      });
      setShowAddModal(false);
    }
  };

  const renderEventIcon = (ic?: string) => {
    switch (ic) {
      case 'file':
        return <FileText size={17} className="text-neutral-500" />;
      case 'home':
        return <Home size={17} className="text-neutral-500" />;
      case 'users':
      default:
        return <Users size={17} className="text-neutral-500" />;
    }
  };

  return (
    <div className="w-full bg-neutral-50/50 p-4 select-none">
      {/* Header Row: Big Number, Day Name, Full Date, Add Button */}
      <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-neutral-200/60" dir="rtl">
        {/* Day Number and Full Date Description */}
        <div className="flex items-center gap-3">
          {/* Big Day Number */}
          <span className="text-3xl sm:text-4xl font-extrabold text-[#7a1616] font-sans leading-none">
            {selectedDate.getDate()}
          </span>

          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base font-extrabold text-[#7a1616] leading-snug">
              {dayNameAr}
            </h3>
            <p className="text-[11px] text-neutral-500 font-medium">
              <span>{num(hijriDate.day)} {hijriMonthName} {num(hijriDate.year)} هـ</span>
              <span className="mx-1.5 text-neutral-300">|</span>
              <span>{num(selectedDate.getDate())} {gMonthName} {selectedDate.getFullYear()} م</span>
            </p>
          </div>
        </div>

        {/* Add Event Button */}
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-[#7a1616] border border-red-200/80 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs"
        >
          <Plus size={14} className="stroke-[2.5]" />
          <span>إضافة مناسبة</span>
        </button>
      </div>

      {/* Events List (Agenda Cards) */}
      <div className="space-y-2.5">
        {events.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-neutral-200/70 shadow-2xs">
            <p className="text-xs text-neutral-500 mb-2 font-medium">
              لا توجد مناسبات مسجلة لهذا اليوم ({selectedDate.getDate()} {gMonthName})
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7a1616] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200/60 transition"
            >
              <Plus size={13} />
              <span>إضافة أول مناسبة اليوم</span>
            </button>
          </div>
        ) : (
          events.map((ev, idx) => {
            const evColor = (ev as any).color || (idx % 3 === 0 ? 'blue' : idx % 3 === 1 ? 'amber' : 'rose');
            const colorOption = COLOR_OPTIONS.find((c) => c.id === evColor) || COLOR_OPTIONS[0];

            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl p-3 border border-neutral-200/80 shadow-2xs flex items-center justify-between transition hover:shadow-xs group"
                dir="rtl"
              >
                {/* Left side: Colored Dot + Event Title */}
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${colorOption.dot} shrink-0`} />
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-[#7a1616] transition">
                      {ev.title}
                    </span>
                    {ev.details && (
                      <span className="text-[10px] text-neutral-500 truncate max-w-[160px] sm:max-w-xs">
                        {ev.details}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side: Time range + Action buttons + Category Icon */}
                <div className="flex items-center gap-2.5">
                  {(ev as any).time && (
                    <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-50 px-2 py-0.5 rounded-lg border border-neutral-150/70" dir="rtl">
                      {(ev as any).time}
                    </span>
                  )}

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(ev)}
                      className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition"
                      title="تعديل"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="p-1 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                      title="حذف"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Category Icon */}
                  <div className="p-1 rounded-lg bg-neutral-50 text-neutral-500 border border-neutral-150/60">
                    {renderEventIcon(ev.icon)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {(showAddModal || editingEvent) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          dir="rtl"
        >
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">
                {editingEvent ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEvent(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">عنوان المناسبة</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: اجتماع فريق العمل، مراجعة الميزانية..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:border-[#7a1616] focus:ring-1 focus:ring-[#7a1616] outline-none"
                  autoFocus
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1">
                  <Clock size={12} />
                  <span>الوقت (اختياري)</span>
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="مثال: 10:00 ص – 11:00 ص"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:border-[#7a1616] outline-none"
                />
              </div>

              {/* Color Dot & Category Icon */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">اللون</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setSelectedColor(c.id)}
                        className={`w-6 h-6 rounded-full ${c.dot} transition flex items-center justify-center ${
                          selectedColor === c.id ? 'ring-2 ring-offset-2 ring-neutral-800 scale-110' : ''
                        }`}
                      >
                        {selectedColor === c.id && <Check size={11} className="text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">الرمز</label>
                  <div className="flex items-center gap-1 pt-0.5">
                    {[
                      { id: 'users', label: 'فريق', Icon: Users },
                      { id: 'file', label: 'مستند', Icon: FileText },
                      { id: 'home', label: 'منزل', Icon: Home },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setIcon(item.id)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center justify-center ${
                          icon === item.id
                            ? 'border-[#7a1616] bg-red-50 text-[#7a1616]'
                            : 'border-neutral-200 text-neutral-600'
                        }`}
                      >
                        <item.Icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">تفاصيل إضافية (اختياري)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="ملاحظات أو موقع الاجتماع..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 focus:border-[#7a1616] outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#7a1616] hover:bg-[#681212] text-white py-2.5 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  {editingEvent ? 'حفظ التعديلات' : 'إضافة المناسبة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEvent(null);
                  }}
                  className="py-2.5 px-4 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
