import { useState } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import {
  type HijriDateInfo,
  type UserNote,
  toArabicNumerals,
} from '../utils/hijriCalendar';
import { KaabaIcon, BalloonIcon } from './CalendarIcons';
import { EventIconRenderer, EventIconPicker } from './EventIcons';

interface RuledNotebookSectionProps {
  selectedDayInfo: HijriDateInfo | null;
  monthEvents: { day: number; event: any }[];
  userNotes: UserNote[];
  onAddNote: (note: Omit<UserNote, 'id' | 'createdAt'>) => void;
  onDeleteNote: (id: string) => void;
  useArabicDigits: boolean;
  showIslamicEvents?: boolean;
}

export const RuledNotebookSection = ({
  selectedDayInfo,
  monthEvents,
  userNotes,
  onAddNote,
  onDeleteNote,
  useArabicDigits,
  showIslamicEvents = true,
}: RuledNotebookSectionProps) => {
  const [activeSegment, setActiveSegment] = useState<'month' | 'day'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteDetails, setNewNoteDetails] = useState('');
  const [newNoteIcon, setNewNoteIcon] = useState('pin');

  const selectedDayNotes = selectedDayInfo
    ? userNotes.filter(
        (n) =>
          n.hijriYear === selectedDayInfo.year &&
          n.hijriMonth === selectedDayInfo.month &&
          n.hijriDay === selectedDayInfo.day
      )
    : [];

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
            {(!showIslamicEvents || monthEvents.length === 0) && userNotes.length === 0 ? (
              <div className="h-[42px] flex items-center justify-end text-neutral-400 text-sm italic">
                لا توجد مناسبات مسجلة لهذا الشهر
              </div>
            ) : (
              <>
                {/* Official Islamic Holidays matching screenshot */}
                {showIslamicEvents &&
                  monthEvents.map((item, idx) => (
                    <div
                      key={`${item.event.id}-${idx}`}
                      className="h-[42px] flex items-center justify-end gap-2.5 text-neutral-900 text-sm pr-1 group hover:bg-neutral-50/50 transition-colors"
                    >
                      <span className="font-semibold text-neutral-800 text-[13px] sm:text-sm">
                        {item.event.titleAr}
                      </span>
                      {item.event.icon === 'kaaba' && (
                        <KaabaIcon size={20} className="drop-shadow-2xs" />
                      )}
                      {item.event.icon === 'balloon' && (
                        <BalloonIcon size={20} className="drop-shadow-2xs" />
                      )}
                      {item.event.icon !== 'kaaba' && item.event.icon !== 'balloon' && (
                        <Sparkles size={16} className="text-amber-600" />
                      )}
                    </div>
                  ))}

                {/* User Notes for this Month with Selected Icons */}
                {userNotes
                  .filter(
                    (n) =>
                      selectedDayInfo &&
                      n.hijriYear === selectedDayInfo.year &&
                      n.hijriMonth === selectedDayInfo.month
                  )
                  .map((note) => (
                    <div
                      key={note.id}
                      className="h-[42px] flex items-center justify-between text-neutral-800 text-sm px-1 hover:bg-amber-50/40 rounded-lg transition-colors group"
                    >
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="text-neutral-300 hover:text-red-600 transition p-1"
                        title="حذف"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-800 font-medium text-xs sm:text-sm">
                          {note.title}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full font-mono font-bold">
                          {num(note.hijriDay)}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                          <EventIconRenderer icon={note.icon || 'pin'} size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
              </>
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
              selectedDayInfo?.events.map((event) => (
                <div
                  key={event.id}
                  className="h-[42px] flex items-center justify-end gap-2 text-neutral-900 text-sm pr-1"
                >
                  <span className="font-bold text-[#841c1c] text-sm">{event.titleAr}</span>
                  {event.icon === 'kaaba' && <KaabaIcon size={20} />}
                  {event.icon === 'balloon' && <BalloonIcon size={20} />}
                  {event.icon !== 'kaaba' && event.icon !== 'balloon' && (
                    <Sparkles size={16} className="text-amber-600" />
                  )}
                </div>
              ))}

            {/* Day Notes */}
            {selectedDayNotes.map((note) => (
              <div
                key={note.id}
                className="h-[42px] flex items-center justify-between text-neutral-800 text-sm px-1 hover:bg-neutral-50/60 rounded-lg transition-colors"
              >
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-neutral-300 hover:text-red-600 transition p-1"
                  title="حذف المناسبة"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex items-center gap-2.5">
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
            ))}

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
    </div>
  );
};
