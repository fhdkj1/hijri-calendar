import { useState } from 'react';
import {
  Search,
  Sparkles,
  ChevronLeft,
  Trash2,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  ALL_MASTER_ISLAMIC_EVENTS,
  type MasterIslamicEvent,
  toArabicNumerals,
} from '../utils/hijriCalendar';
import { KaabaIcon, BalloonIcon } from './CalendarIcons';

interface EventsListViewProps {
  currentHijriYear: number;
  useArabicDigits: boolean;
  onSelectEventDate: (year: number, month: number, day: number) => void;
  showIslamicEvents: boolean;
  onToggleShowIslamicEvents: (show: boolean) => void;
  deletedIslamicEventIds: string[];
  onDeleteIslamicEvent: (eventId: string, titleAr: string) => void;
  onRestoreAllIslamicEvents: () => void;
}

export const EventsListView = ({
  currentHijriYear,
  useArabicDigits,
  onSelectEventDate,
  showIslamicEvents,
  onToggleShowIslamicEvents,
  deletedIslamicEventIds,
  onDeleteIslamicEvent,
  onRestoreAllIslamicEvents,
}: EventsListViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<MasterIslamicEvent | null>(null);

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSyncAndRestore = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onRestoreAllIslamicEvents();
      setIsSyncing(false);
      showToast('تمت مزامنة وتنزيل جميع الأيام والمناسبات الإسلامية بنجاح');
    }, 400);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteEvent) return;
    onDeleteIslamicEvent(confirmDeleteEvent.id, confirmDeleteEvent.titleAr);
    showToast(`تم حذف «${confirmDeleteEvent.titleAr}» من كامل التقويم`);
    setConfirmDeleteEvent(null);
  };

  // Master events filtered to exclude deleted items
  const activeEvents = ALL_MASTER_ISLAMIC_EVENTS.filter(
    (ev) => !deletedIslamicEventIds.includes(ev.id)
  );

  // Search filter
  const filteredEvents = activeEvents.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.titleAr.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.monthNameAr.toLowerCase().includes(q) ||
      item.descriptionAr.toLowerCase().includes(q) ||
      item.dayLabelAr.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-neutral-50/70 overflow-y-auto p-3.5 sm:p-4 select-none text-right smooth-scroll relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg border border-neutral-700/60 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 mb-3">
        <span className="text-[11px] bg-amber-100/90 text-amber-900 px-3 py-1 rounded-full font-bold shadow-2xs">
          التقويم الهجري الدائم
        </span>
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
          <span>المناسبات والأعياد الإسلامية</span>
          <Sparkles size={16} className="text-amber-600" />
        </h2>
      </div>

      {/* Top Action 1: Sync / Download Islamic Events Button */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-700/10 border border-amber-300/80 rounded-2xl p-3.5 mb-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <RefreshCw
              size={18}
              className={`transition-transform duration-500 ${isSyncing ? 'animate-spin' : ''}`}
            />
          </div>
          <div className="text-right flex-1">
            <div className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <span>مزامنة وتنزيل الأيام الإسلامية</span>
              {deletedIslamicEventIds.length > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                  محذوف {num(deletedIslamicEventIds.length)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-600 mt-0.5">
              {deletedIslamicEventIds.length > 0
                ? 'انقر لتنزيل واستعادة جميع الأيام الإسلامية التي قمت بحذفها'
                : 'تحديث ومزامنة كافة الأعياد والمناسبات مع التقويم'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncAndRestore}
          disabled={isSyncing}
          className="w-full sm:w-auto px-4 py-2 bg-[#841c1c] hover:bg-[#6e1616] active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
          <span>{deletedIslamicEventIds.length > 0 ? 'استعادة وتنزيل الكل' : 'مزامنة وتنزيل'}</span>
        </button>
      </div>

      {/* Top Action 2: Show/Hide Toggle in Calendar */}
      <div
        onClick={() => onToggleShowIslamicEvents(!showIslamicEvents)}
        className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs mb-3 flex items-center justify-between cursor-pointer hover:border-neutral-300 transition select-none active:scale-[0.99]"
      >
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
            {showIslamicEvents ? 'ظاهرة بالتقويم' : 'مخفية بالتقويم'}
          </span>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-neutral-900 flex items-center justify-end gap-1.5">
            <span>إظهار الأيام الإسلامية بالتقويم</span>
            <Sparkles size={13} className="text-amber-600" />
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            إظهار أيقونات المناسبات (كعبة، بالون، هلال) داخل خانات الأيام
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في الأيام الإسلامية (عرفة، الفطر، الأضحى، رمضان، عاشوراء...)"
          className="w-full bg-white border border-neutral-200/90 rounded-2xl py-2.5 pr-9 pl-3 text-xs font-medium text-neutral-900 shadow-2xs focus:ring-2 focus:ring-[#841c1c] focus:outline-none transition placeholder:text-neutral-400"
        />
        <Search size={15} className="absolute right-3 top-3 text-neutral-400" />
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center shadow-2xs">
            <AlertCircle size={32} className="mx-auto text-amber-600 mb-2.5 opacity-80" />
            <h3 className="text-sm font-bold text-neutral-800 mb-1">
              {deletedIslamicEventIds.length > 0 && searchQuery === ''
                ? 'تم حذف جميع الأيام الإسلامية من التقويم'
                : 'لم يتم العثور على مناسبات مطابقة'}
            </h3>
            <p className="text-xs text-neutral-500 mb-3.5">
              {deletedIslamicEventIds.length > 0
                ? 'يمكنك تنزيل واستعادة جميع الأيام الإسلامية بضغطة زر'
                : 'جرّب البحث بكلمة أخرى مثل «الفطر» أو «الأضحى»'}
            </p>
            {deletedIslamicEventIds.length > 0 && (
              <button
                onClick={handleSyncAndRestore}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#841c1c] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#6e1616] active:scale-95 transition cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>مزامنة وتنزيل الأيام الإسلامية الآن</span>
              </button>
            )}
          </div>
        ) : (
          filteredEvents.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-neutral-200/80 p-3 sm:p-3.5 shadow-2xs hover:border-[#841c1c]/30 hover:shadow-xs transition flex flex-col gap-2.5"
            >
              {/* Top Row: Info + Icon */}
              <div className="flex items-start justify-between gap-2">
                {/* Perpetual Hijri Day Badge */}
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 rounded-full inline-block">
                    {useArabicDigits
                      ? toArabicNumerals(item.dayLabelAr)
                      : item.dayLabelAr}
                  </span>
                  {item.isHoliday && (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                      إجازة رسمية
                    </span>
                  )}
                </div>

                {/* Title & Icon */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h3 className="font-bold text-neutral-900 text-sm leading-snug">
                      {item.titleAr}
                    </h3>
                    <div className="text-[11px] text-neutral-400 font-sans">
                      {item.titleEn}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-neutral-50 border border-neutral-150 flex items-center justify-center shrink-0">
                    {item.icon === 'kaaba' && <KaabaIcon size={22} />}
                    {item.icon === 'balloon' && <BalloonIcon size={22} />}
                    {item.icon === 'crescent' && <span className="text-lg">🌙</span>}
                    {item.icon !== 'kaaba' &&
                      item.icon !== 'balloon' &&
                      item.icon !== 'crescent' && (
                        <Sparkles size={16} className="text-amber-500" />
                      )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {item.descriptionAr && (
                <p className="text-[11.5px] text-neutral-600 bg-neutral-50/80 rounded-xl px-2.5 py-1.5 border border-neutral-100/90 leading-relaxed text-right">
                  {item.descriptionAr}
                </p>
              )}

              {/* Action Buttons: Jump to calendar + Delete from entire calendar */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                {/* Delete button from entire calendar */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteEvent(item);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 px-2.5 py-1 rounded-xl border border-rose-200/60 transition cursor-pointer active:scale-95"
                  title="حذف هذا اليوم من كامل التقويم"
                >
                  <Trash2 size={13} />
                  <span>حذف من كامل التقويم</span>
                </button>

                {/* Jump to calendar */}
                <button
                  type="button"
                  onClick={() => {
                    const jumpMonth = item.month === 0 ? 1 : item.month;
                    onSelectEventDate(currentHijriYear, jumpMonth, item.day);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#841c1c] hover:text-[#6e1616] bg-amber-50/60 hover:bg-amber-100/70 px-2.5 py-1 rounded-xl border border-amber-200/60 transition cursor-pointer active:scale-95"
                  title="عرض هذا اليوم في التقويم الهجري"
                >
                  <Calendar size={13} />
                  <span>عرض في التقويم</span>
                  <ChevronLeft size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Action: Sync & Restore button */}
      <div className="mt-4 pt-3 border-t border-neutral-200/70 text-center">
        <button
          onClick={handleSyncAndRestore}
          disabled={isSyncing}
          className="w-full py-2.5 px-4 bg-white border border-neutral-200/90 hover:border-neutral-300 text-neutral-800 text-xs font-bold rounded-2xl shadow-2xs hover:shadow-xs active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : 'text-amber-600'} />
          <span>مزامنة وتنزيل الأيام الإسلامية لكامل التقويم</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-neutral-200/80 text-right animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>

            <h3 className="text-base font-bold text-neutral-900 text-center mb-1">
              حذف مناسبة من كامل التقويم
            </h3>

            <p className="text-xs text-neutral-600 text-center mb-4 leading-relaxed">
              هل أنت متأكد من حذف «<span className="font-bold text-neutral-900">{confirmDeleteEvent.titleAr}</span>» ({confirmDeleteEvent.dayLabelAr}) من كامل التقويم لجميع السنوات؟
              <br />
              <span className="text-[11px] text-amber-700 font-semibold block mt-1">
                يمكنك استعادتها وتنزيلها في أي وقت عبر زر «مزامنة وتنزيل الأيام الإسلامية».
              </span>
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteEvent(null)}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
