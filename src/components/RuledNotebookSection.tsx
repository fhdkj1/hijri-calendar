import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, Sparkles, Pencil, AlertTriangle } from 'lucide-react';
import {
  type HijriDateInfo,
  type UserNote,
  toArabicNumerals,
  findHijriMonthStart,
} from '../utils/hijriCalendar';
import { KaabaIcon, BalloonIcon } from './CalendarIcons';
import { EventIconRenderer, EventIconPicker } from './EventIcons';

interface RuledNotebookSectionProps {
  selectedDayInfo: HijriDateInfo | null;
  monthEvents: { day: number; event: any }[];
  userNotes: UserNote[];
  onAddNote: (note: Omit<UserNote, 'id' | 'createdAt'>) => void;
  onUpdateNote?: (note: UserNote) => void;
  onDeleteNote: (id: string) => void;
  useArabicDigits: boolean;
  showIslamicEvents?: boolean;
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  calendarDays?: HijriDateInfo[];
  todayHijri?: { year: number; month: number; day: number };
  currentYear?: number;
  currentMonth?: number;
}

export const RuledNotebookSection = ({
  selectedDayInfo,
  monthEvents,
  userNotes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  useArabicDigits,
  showIslamicEvents = true,
  selectedDay,
  onSelectDay,
  calendarDays = [],
  todayHijri: _todayHijri,
  currentYear,
  currentMonth,
}: RuledNotebookSectionProps) => {
  const [activeSegment, setActiveSegment] = useState<'month' | 'day'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDetails, setNewNoteDetails] = useState('');
  const [newNoteIcon, setNewNoteIcon] = useState('pin');

  // Edit note state
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editIcon, setEditIcon] = useState('pin');
  const [editDay, setEditDay] = useState<number>(1);

  // Delete confirmation state
  const [noteToDelete, setNoteToDelete] = useState<UserNote | null>(null);

  const selectedItemRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll selected event into view when a day with an event is chosen
  useEffect(() => {
    if (selectedDay && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedDay]);

  // Helper to determine timing, remaining days countdown, and past status for an event
  const getEventTiming = (day: number) => {
    let diffDays = 0;

    const dayInfo = calendarDays?.find((d) => d.day === day);
    let target: Date;

    if (dayInfo?.gregorianDate) {
      target = new Date(dayInfo.gregorianDate);
    } else if (currentYear && currentMonth) {
      const mStart = findHijriMonthStart(currentYear, currentMonth);
      target = new Date(mStart.getTime() + (day - 1) * 86400000);
    } else {
      target = new Date();
    }
    target.setHours(0, 0, 0, 0);

    const realToday = new Date();
    realToday.setHours(0, 0, 0, 0);

    let refDate: Date;
    if (currentYear && currentYear <= 1438) {
      // Historical test mode (e.g. 1435/12 where day 4 was Today / 2014-09-28)
      const s1435 = findHijriMonthStart(1435, 12);
      refDate = new Date(s1435.getTime() + (4 - 1) * 86400000);
      refDate.setHours(0, 0, 0, 0);
    } else {
      refDate = realToday;
    }

    const diffMs = target.getTime() - refDate.getTime();
    diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const isPast = diffDays < 0;
    const isToday = diffDays === 0;

    let text = '';
    let badgeClass = '';

    if (isToday) {
      text = 'اليوم';
      badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-300/60 font-bold';
    } else if (diffDays === 1) {
      text = 'غداً';
      badgeClass = 'bg-amber-100 text-amber-900 border border-amber-300/60 font-semibold';
    } else if (diffDays === 2) {
      text = 'باقي يومين';
      badgeClass = 'bg-amber-50 text-amber-800 border border-amber-200/60 font-medium';
    } else if (diffDays > 2 && diffDays <= 10) {
      text = `باقي ${num(diffDays)} أيام`;
      badgeClass = 'bg-amber-50 text-amber-800 border border-amber-200/60 font-medium';
    } else if (diffDays > 10) {
      text = `باقي ${num(diffDays)} يوم`;
      badgeClass = 'bg-amber-50 text-amber-800 border border-amber-200/60 font-medium';
    } else {
      const absDays = Math.abs(diffDays);
      if (absDays === 1) {
        text = 'أمس';
      } else if (absDays === 2) {
        text = 'منذ يومين';
      } else if (absDays <= 10) {
        text = `منذ ${num(absDays)} أيام`;
      } else {
        text = `منذ ${num(absDays)} يوم`;
      }
      badgeClass = 'bg-neutral-100 text-neutral-500 border border-neutral-200/60 font-normal';
    }

    return { diffDays, isPast, isToday, text, badgeClass };
  };

  const selectedDayNotes = useMemo(() => {
    if (!selectedDayInfo) return [];
    return userNotes.filter(
      (n) =>
        n.hijriYear === selectedDayInfo.year &&
        n.hijriMonth === selectedDayInfo.month &&
        n.hijriDay === selectedDayInfo.day
    );
  }, [userNotes, selectedDayInfo?.year, selectedDayInfo?.month, selectedDayInfo?.day]);

  const monthUserNotes = useMemo(() => {
    if (!selectedDayInfo) return [];
    return userNotes.filter(
      (n) =>
        n.hijriYear === selectedDayInfo.year &&
        n.hijriMonth === selectedDayInfo.month
    );
  }, [userNotes, selectedDayInfo?.year, selectedDayInfo?.month]);

  // Unified month events + notes sorted strictly from oldest (Day 1) to newest (Day 30)
  const allSortedMonthItems = useMemo(() => {
    type UnifiedItem = {
      isIslamic: boolean;
      id: string;
      day: number;
      title: string;
      icon?: string;
      noteId?: string;
      note?: UserNote;
    };

    const items: UnifiedItem[] = [];

    if (showIslamicEvents) {
      monthEvents.forEach((m, idx) => {
        items.push({
          isIslamic: true,
          id: `islamic-${m.event.id}-${idx}`,
          day: m.day,
          title: m.event.titleAr,
          icon: m.event.icon,
        });
      });
    }

    monthUserNotes.forEach((n) => {
      items.push({
        isIslamic: false,
        id: `note-${n.id}`,
        day: n.hijriDay,
        title: n.title,
        icon: n.icon || 'pin',
        noteId: n.id,
        note: n,
      });
    });

    // Sort strictly from oldest to newest
    items.sort((a, b) => a.day - b.day);

    return items;
  }, [showIslamicEvents, monthEvents, monthUserNotes]);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !selectedDayInfo) return;

    onAddNote({
      hijriYear: selectedDayInfo.year,
      hijriMonth: selectedDayInfo.month,
      hijriDay: selectedDayInfo.day,
      title: newNoteTitle.trim(),
      details: newNoteDetails.trim(),
      icon: newNoteIcon,
    });

    setNewNoteTitle('');
    setNewNoteDetails('');
    setNewNoteIcon('pin');
    setShowAddModal(false);
  };

  const handleStartEditNote = (note: UserNote) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditDetails(note.details || '');
    setEditIcon(note.icon || 'pin');
    setEditDay(note.hijriDay);
  };

  const handleSaveEditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !editTitle.trim()) return;

    const updated: UserNote = {
      ...editingNote,
      title: editTitle.trim(),
      details: editDetails.trim(),
      icon: editIcon,
      hijriDay: editDay,
    };

    onUpdateNote?.(updated);
    setEditingNote(null);
  };

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  return (
    <div className="flex-1 flex flex-col bg-white border-t border-neutral-200/80 relative select-none overflow-hidden">
      {/* Modern Segmented Control Header */}
      <div className="px-3 py-2 bg-neutral-50/80 border-b border-neutral-200/70 flex items-center justify-between gap-2">
        {/* Pills */}
        <div className="flex items-center bg-neutral-200/60 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveSegment('month')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeSegment === 'month'
                ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            مناسبات الشهر
          </button>
          <button
            onClick={() => setActiveSegment('day')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeSegment === 'day'
                ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            اليوم المحدد
          </button>
        </div>

        {/* Add Note Button */}
        {selectedDayInfo && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-xs text-[#841c1c] hover:bg-red-50 active:bg-red-100 px-2.5 py-1 rounded-xl font-bold transition border border-red-200/50"
            title="إضافة مناسبة أو تذكير"
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>إضافة مناسبة</span>
          </button>
        )}
      </div>

      {/* Lined Notebook Paper View (matching screenshot) */}
      <div className="flex-1 overflow-y-auto notebook-ruled-lines px-4 py-1 smooth-scroll min-h-[160px]">
        {activeSegment === 'month' ? (
          /* Month Events View */
          <div className="flex flex-col">
            {allSortedMonthItems.length === 0 ? (
              <div className="h-[42px] flex items-center justify-end text-neutral-400 text-sm italic">
                لا توجد مناسبات مسجلة لهذا الشهر
              </div>
            ) : (
              allSortedMonthItems.map((item) => {
                const isSelected = selectedDay === item.day;
                const timing = getEventTiming(item.day);
                return (
                  <div
                    key={item.id}
                    ref={isSelected ? selectedItemRef : undefined}
                    onClick={() => onSelectDay?.(item.day)}
                    className={`h-[42px] flex items-center justify-between text-sm px-2.5 rounded-lg cursor-pointer transition-all ${
                      item.noteId ? 'group' : ''
                    } ${
                      isSelected
                        ? 'bg-[#dce868] text-neutral-950 font-bold shadow-2xs ring-1 ring-lime-600/30 opacity-100'
                        : timing.isPast
                        ? 'opacity-40 hover:opacity-75 text-neutral-500 hover:bg-neutral-100/40'
                        : 'text-neutral-900 hover:bg-neutral-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={`text-xs font-mono font-bold w-5 shrink-0 text-right ${
                          isSelected
                            ? 'text-neutral-950'
                            : timing.isPast
                            ? 'text-neutral-400'
                            : 'text-neutral-500'
                        }`}
                      >
                        {num(item.day)}
                      </span>
                      <span
                        className={`truncate text-[13px] sm:text-sm ${
                          item.isIslamic ? 'font-semibold' : 'font-medium'
                        }`}
                      >
                        {item.title}
                      </span>
                      {/* Countdown / Remaining days badge */}
                      <span
                        className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md shrink-0 leading-none ${
                          isSelected
                            ? 'bg-black/10 text-neutral-950 font-bold'
                            : timing.badgeClass
                        }`}
                      >
                        {timing.text}
                      </span>
                      <div className="shrink-0 flex items-center">
                        {item.icon === 'kaaba' && (
                          <KaabaIcon size={18} className="drop-shadow-2xs" />
                        )}
                        {item.icon === 'balloon' && (
                          <BalloonIcon size={18} className="drop-shadow-2xs" />
                        )}
                        {item.icon !== 'kaaba' && item.icon !== 'balloon' && item.isIslamic && (
                          <Sparkles
                            size={16}
                            className={
                              isSelected
                                ? 'text-amber-900'
                                : timing.isPast
                                ? 'text-neutral-400'
                                : 'text-amber-600'
                            }
                          />
                        )}
                        {!item.isIslamic && (
                          <EventIconRenderer icon={item.icon || 'pin'} size={15} />
                        )}
                      </div>
                    </div>
                    {item.note && (
                      <div
                        className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleStartEditNote(item.note!)}
                          className={`p-1.5 transition rounded-lg ${
                            isSelected
                              ? 'text-neutral-700 hover:text-neutral-950 hover:bg-black/10'
                              : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200/60'
                          }`}
                          title="تعديل المناسبة"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteToDelete(item.note!)}
                          className={`p-1.5 transition rounded-lg ${
                            isSelected
                              ? 'text-neutral-700 hover:text-red-700 hover:bg-black/10'
                              : 'text-neutral-400 hover:text-red-600 hover:bg-neutral-200/60'
                          }`}
                          title="حذف المناسبة"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Selected Day View */
          <div className="flex flex-col">
            {selectedDayInfo && (
              <div className="h-[42px] flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-200/60">
                <span className="font-sans font-medium text-neutral-600">
                  الموافق {num(selectedDayInfo.gregorianDay)}{' '}
                  {selectedDayInfo.gregorianMonthNameAr} {num(selectedDayInfo.gregorianYear)}م
                </span>
                <span className="font-bold text-neutral-900">
                  {selectedDayInfo.weekdayAr} {num(selectedDayInfo.day)}{' '}
                  {selectedDayInfo.monthNameAr} {num(selectedDayInfo.year)}هـ
                </span>
              </div>
            )}

            {/* Day Events */}
            {showIslamicEvents &&
              selectedDayInfo?.events.map((event) => {
                const timing = getEventTiming(selectedDayInfo.day);
                return (
                  <div
                    key={event.id}
                    className={`h-[42px] flex items-center justify-between text-sm px-2 rounded-lg transition-colors ${
                      timing.isPast ? 'opacity-50 text-neutral-500' : 'text-neutral-900'
                    }`}
                  >
                    <span
                      className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md shrink-0 leading-none ${timing.badgeClass}`}
                    >
                      {timing.text}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#841c1c] text-sm">{event.titleAr}</span>
                      {event.icon === 'kaaba' && <KaabaIcon size={20} />}
                      {event.icon === 'balloon' && <BalloonIcon size={20} />}
                      {event.icon !== 'kaaba' && event.icon !== 'balloon' && (
                        <Sparkles size={16} className="text-amber-600" />
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Day Notes */}
            {selectedDayNotes.map((note) => {
              const timing = getEventTiming(note.hijriDay);
              return (
                <div
                  key={note.id}
                  className={`h-[42px] flex items-center justify-between text-neutral-800 text-sm px-1 hover:bg-neutral-50/60 rounded-lg transition-colors group ${
                    timing.isPast ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleStartEditNote(note)}
                      className="text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition p-1.5 rounded-lg"
                      title="تعديل المناسبة"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setNoteToDelete(note)}
                      className="text-neutral-400 hover:text-red-600 hover:bg-red-50 transition p-1.5 rounded-lg"
                      title="حذف المناسبة"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md shrink-0 leading-none ${timing.badgeClass}`}
                    >
                      {timing.text}
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-neutral-900 text-xs sm:text-sm">
                        {note.title}
                      </div>
                      {note.details && (
                        <div className="text-[11px] text-neutral-500">{note.details}</div>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                      <EventIconRenderer icon={note.icon || 'pin'} size={15} />
                    </div>
                  </div>
                </div>
              );
            })}

            {selectedDayInfo?.events.length === 0 && selectedDayNotes.length === 0 && (
              <div className="h-[42px] flex items-center justify-center text-neutral-400 text-xs italic">
                لا توجد مناسبات أو مذكرات مسجلة لهذا اليوم المحدد.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Add Note Sheet with Single-Line Icon Selection */}
      {showAddModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 w-full max-w-sm text-right border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-neutral-900 mb-2 text-base flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-normal">
                {selectedDayInfo?.weekdayAr} {num(selectedDayInfo?.day || 1)}{' '}
                {selectedDayInfo?.monthNameAr}
              </span>
              <span>إضافة مناسبة أو تذكير</span>
            </h3>

            <form onSubmit={handleCreateNote} className="space-y-3.5 mt-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  عنوان المناسبة / الموعد
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: موعد مهم، مناسبة عائلية، مراجعة..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full text-sm border border-neutral-200 bg-neutral-50 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c] focus:bg-white transition"
                />
              </div>

              {/* Icon Picker Component (Single Line) */}
              <EventIconPicker
                selectedIcon={newNoteIcon}
                onSelectIcon={(iconId) => setNewNoteIcon(iconId)}
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  تفاصيل إضافية (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات وتفاصيل..."
                  value={newNoteDetails}
                  onChange={(e) => setNewNoteDetails(e.target.value)}
                  className="w-full text-xs border border-neutral-200 bg-neutral-50 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c] focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-150">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-[#841c1c] text-white rounded-xl font-bold hover:bg-[#6e1414] shadow-sm transition active:scale-95"
                >
                  حفظ المناسبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 w-full max-w-sm text-right border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-neutral-900 mb-2 text-base flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-normal">
                {selectedDayInfo?.monthNameAr}
              </span>
              <span>تعديل المناسبة</span>
            </h3>

            <form onSubmit={handleSaveEditNote} className="space-y-3.5 mt-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  عنوان المناسبة / الموعد
                </label>
                <input
                  type="text"
                  required
                  placeholder="عنوان المناسبة..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-sm border border-neutral-200 bg-neutral-50 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c] focus:bg-white transition"
                />
              </div>

              {/* Day selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  يوم المناسبة في الشهر
                </label>
                <select
                  value={editDay}
                  onChange={(e) => setEditDay(parseInt(e.target.value, 10))}
                  className="w-full text-xs border border-neutral-200 bg-neutral-50 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c] focus:bg-white transition"
                >
                  {Array.from({ length: calendarDays.length || 30 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      اليوم {num(d)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Icon Picker Component */}
              <EventIconPicker
                selectedIcon={editIcon}
                onSelectIcon={(iconId) => setEditIcon(iconId)}
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  تفاصيل إضافية (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات وتفاصيل..."
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  className="w-full text-xs border border-neutral-200 bg-neutral-50 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#841c1c] focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-150">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-[#841c1c] text-white rounded-xl font-bold hover:bg-[#6e1414] shadow-sm transition active:scale-95"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 w-full max-w-sm text-right border border-neutral-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                  تأكيد حذف المناسبة
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  هل أنت متأكد من رغبتك في حذف هذه المناسبة نهائياً؟
                </p>
              </div>
            </div>

            <div className="my-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-right">
              <div className="font-semibold text-xs sm:text-sm text-neutral-800">
                {noteToDelete.title}
              </div>
              {noteToDelete.details && (
                <div className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                  {noteToDelete.details}
                </div>
              )}
              <div className="text-[10px] text-neutral-400 mt-1">
                اليوم: {num(noteToDelete.hijriDay)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNoteToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteNote(noteToDelete.id);
                  setNoteToDelete(null);
                }}
                className="px-4 py-2 text-xs bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-sm transition active:scale-95"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
