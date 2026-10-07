import { useState, useEffect, useMemo } from 'react';
import type { User } from 'firebase/auth';
import {
  getHijriMonthCalendar,
  getHijriFromGregorian,
  HIJRI_MONTHS_AR,
  type UserNote,
} from './utils/hijriCalendar';
import {
  onAuthChanged,
  subscribeToUserNotes,
  saveNoteToCloud,
  deleteNoteFromCloud,
  syncLocalNotesToCloud,
  checkRedirectAuth,
  logOut,
} from './services/firebase';
import { ModernCalendarHeader } from './components/ModernCalendarHeader';
import { ModernCalendarGrid } from './components/ModernCalendarGrid';
import { ModernDayAgenda } from './components/ModernDayAgenda';
import { BottomNavBar, type TabType } from './components/BottomNavBar';
import { DateConverterView } from './components/DateConverterView';
import { EventsListView } from './components/EventsListView';
import { SettingsView } from './components/SettingsView';

const DEFAULT_INITIAL_NOTES: UserNote[] = [
  {
    id: 'demo-1',
    title: 'اجتماع فريق العمل',
    details: 'مناقشة خطة العمل والتحديثات',
    time: '10:00 ص – 11:00 ص',
    color: 'blue',
    icon: 'users',
    hijriYear: 1448,
    hijriMonth: 4,
    hijriDay: 26,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'مراجعة الميزانية',
    details: 'مراجعة المصروفات والتقارير المالية',
    time: '1:00 م – 2:00 م',
    color: 'amber',
    icon: 'file',
    hijriYear: 1448,
    hijriMonth: 4,
    hijriDay: 26,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'موعد عائلة',
    details: 'جلسة عائلية مسائية',
    time: '7:00 م – 9:00 م',
    color: 'rose',
    icon: 'home',
    hijriYear: 1448,
    hijriMonth: 4,
    hijriDay: 26,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    title: 'تجديد نت صالح الحج',
    time: '10:00 ص',
    color: 'blue',
    icon: 'users',
    hijriYear: 1448,
    hijriMonth: 4,
    hijriDay: 21,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    title: 'Rural Kutxa a San Seb.',
    time: '8:00 ص',
    color: 'amber',
    icon: 'users',
    hijriYear: 1448,
    hijriMonth: 4,
    hijriDay: 23,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    title: 'SPAR Budapest Mar.',
    time: '9:00 ص',
    color: 'amber',
    icon: 'users',
    hijriYear: 1448,
    hijriMonth: 4,
    hijriDay: 29,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-7',
    title: 'جدد نت اللي ت',
    time: '10:00 ص',
    color: 'blue',
    icon: 'users',
    hijriYear: 1448,
    hijriMonth: 5,
    hijriDay: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-8',
    title: 'عروض بالرياض بيجون أهلي',
    time: '5:00 م',
    color: 'blue',
    icon: 'users',
    hijriYear: 1448,
    hijriMonth: 5,
    hijriDay: 12,
    createdAt: new Date().toISOString(),
  },
];

export function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('hijri_active_tab') as TabType;
    if (saved === ('age' as any)) return 'calendar';
    return saved || 'calendar';
  });

  // Google Auth & Cloud Sync state
  const [user, setUser] = useState<User | null>(null);

  // Umm al-Qura adjustment (-2 to +2 days)
  const [adjustment, setAdjustment] = useState<number>(() => {
    const saved = localStorage.getItem('hijri_adjustment');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // Arabic vs Western digits toggle
  const [useArabicDigits, setUseArabicDigits] = useState<boolean>(() => {
    const saved = localStorage.getItem('hijri_arabic_digits');
    return saved !== null ? saved === 'true' : true;
  });

  // Show/hide Islamic events in calendar
  const [showIslamicEvents, setShowIslamicEvents] = useState<boolean>(() => {
    const saved = localStorage.getItem('hijri_show_islamic_events');
    return saved !== null ? saved === 'true' : true;
  });

  // Timeless deleted Islamic events list across the entire calendar
  const [deletedIslamicEventIds, setDeletedIslamicEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('hijri_deleted_islamic_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      'hijri_deleted_islamic_events',
      JSON.stringify(deletedIslamicEventIds)
    );
  }, [deletedIslamicEventIds]);

  const handleDeleteIslamicEvent = (eventId: string) => {
    setDeletedIslamicEventIds((prev) => {
      if (!prev.includes(eventId)) {
        return [...prev, eventId];
      }
      return prev;
    });
  };

  const handleRestoreAllIslamicEvents = () => {
    setDeletedIslamicEventIds([]);
  };

  // User custom notes / events (cleared of test benchmark events)
  const [userNotes, setUserNotes] = useState<UserNote[]>(() => {
    localStorage.removeItem('hijri_perf_1500_initialized');
    const saved = localStorage.getItem('hijri_user_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleanNotes = parsed.filter((n) => !n.id?.startsWith('perf-test-'));
          if (cleanNotes.length > 0) {
            localStorage.setItem('hijri_user_notes', JSON.stringify(cleanNotes));
            return cleanNotes;
          }
        }
      } catch {
        // fallback
      }
    }
    localStorage.setItem('hijri_user_notes', JSON.stringify(DEFAULT_INITIAL_NOTES));
    return DEFAULT_INITIAL_NOTES;
  });

  // Gregorian date navigation matching the new screenshot design
  const [selectedGregorianDate, setSelectedGregorianDate] = useState<Date>(() => {
    const saved = localStorage.getItem('miqat_selected_g_date');
    if (saved) {
      const d = new Date(saved);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const [currentGYear, setCurrentGYear] = useState<number>(() => selectedGregorianDate.getFullYear());
  const [currentGMonth, setCurrentGMonth] = useState<number>(() => selectedGregorianDate.getMonth());
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    localStorage.setItem('miqat_selected_g_date', selectedGregorianDate.toISOString());
  }, [selectedGregorianDate]);

  // Selected date: loaded from localStorage so refresh keeps the user on the exact same date
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const saved = localStorage.getItem('hijri_selected_year');
    if (saved !== null) {
      const p = parseInt(saved, 10);
      if (!isNaN(p)) return p;
    }
    const initH = getHijriFromGregorian(new Date());
    return initH.year;
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const saved = localStorage.getItem('hijri_selected_month');
    if (saved !== null) {
      const p = parseInt(saved, 10);
      if (!isNaN(p)) return p;
    }
    const initH = getHijriFromGregorian(new Date());
    return initH.month;
  });
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const saved = localStorage.getItem('hijri_selected_day');
    if (saved !== null) {
      const p = parseInt(saved, 10);
      if (!isNaN(p)) return p;
    }
    const initH = getHijriFromGregorian(new Date());
    return initH.day;
  });


  // Persist selected date and tab locally so refresh preserves them
  useEffect(() => {
    localStorage.setItem('hijri_selected_year', currentYear.toString());
    localStorage.setItem('hijri_selected_month', currentMonth.toString());
    localStorage.setItem('hijri_selected_day', selectedDay.toString());
  }, [currentYear, currentMonth, selectedDay]);

  useEffect(() => {
    localStorage.setItem('hijri_active_tab', activeTab);
  }, [activeTab]);

  // Persist settings locally
  useEffect(() => {
    localStorage.setItem('hijri_adjustment', adjustment.toString());
  }, [adjustment]);

  useEffect(() => {
    localStorage.setItem('hijri_arabic_digits', useArabicDigits.toString());
  }, [useArabicDigits]);

  useEffect(() => {
    localStorage.setItem('hijri_show_islamic_events', showIslamicEvents.toString());
  }, [showIslamicEvents]);

  // Save notes locally as offline backup
  useEffect(() => {
    localStorage.setItem('hijri_user_notes', JSON.stringify(userNotes));
  }, [userNotes]);

  // Listen to Google Auth state
  useEffect(() => {
    checkRedirectAuth().catch(console.error);

    const unsubscribe = onAuthChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Sync any local notes into the cloud account upon login
        try {
          const localSaved = localStorage.getItem('hijri_user_notes');
          if (localSaved) {
            const parsed: UserNote[] = JSON.parse(localSaved);
            const clean = parsed.filter((n) => !n.id?.startsWith('perf-test-'));
            await syncLocalNotesToCloud(currentUser.uid, clean);
          }
        } catch (e) {
          console.error('Error syncing local notes to cloud:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Cloud Firestore synchronization when user is logged in
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserNotes(
      user.uid,
      (cloudNotes) => {
        const cleanNotes = cloudNotes.filter((n) => !n.id.startsWith('perf-test-'));
        setUserNotes(cleanNotes);

        // Asynchronously clean up any test notes from Cloud Firestore
        const testNotesInCloud = cloudNotes.filter((n) => n.id.startsWith('perf-test-'));
        if (testNotesInCloud.length > 0) {
          testNotesInCloud.forEach((t) => {
            deleteNoteFromCloud(user.uid, t.id).catch(() => {});
          });
        }
      },
      (err) => {
        console.error('Cloud notes sync error:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Generate calendar month data
  const calendarData = useMemo(() => {
    return getHijriMonthCalendar(
      currentYear,
      currentMonth,
      adjustment,
      deletedIslamicEventIds
    );
  }, [currentYear, currentMonth, adjustment, deletedIslamicEventIds]);

  // Keep selected day within valid month days
  useEffect(() => {
    if (selectedDay > calendarData.totalDays) {
      setSelectedDay(calendarData.totalDays);
    }
  }, [calendarData.totalDays, selectedDay]);

  const handleJumpToDate = (year: number, month: number, day: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    setSelectedDay(day);
    const cal = getHijriMonthCalendar(year, month, adjustment);
    const dayInfo = cal.days.find((d) => d.day === day);
    if (dayInfo) {
      setSelectedGregorianDate(dayInfo.gregorianDate);
      setCurrentGYear(dayInfo.gregorianYear);
      setCurrentGMonth(dayInfo.gregorianMonth - 1);
    }
    setActiveTab('calendar');
  };

  const handleAddNote = async (newNote: Omit<UserNote, 'id' | 'createdAt'>) => {
    const note: UserNote = {
      ...newNote,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    setUserNotes((prev) => [note, ...prev]);

    // Cloud Firestore sync if logged in
    if (user) {
      try {
        await saveNoteToCloud(user.uid, note);
      } catch (err) {
        console.error('Failed to save note to cloud:', err);
      }
    }
  };

  const handleUpdateNote = async (updatedNote: UserNote) => {
    // Optimistic local update
    setUserNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );

    // Cloud Firestore sync if logged in
    if (user) {
      try {
        await saveNoteToCloud(user.uid, updatedNote);
      } catch (err) {
        console.error('Failed to update note in cloud:', err);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    // Optimistic local update
    setUserNotes((prev) => prev.filter((n) => n.id !== id));

    // Cloud Firestore sync if logged in
    if (user) {
      try {
        await deleteNoteFromCloud(user.uid, id);
      } catch (err) {
        console.error('Failed to delete note from cloud:', err);
      }
    }
  };

  const handleSignOut = async (keepLocalEvents: boolean) => {
    if (!keepLocalEvents) {
      setUserNotes([]);
      localStorage.setItem('hijri_user_notes', '[]');
    }
    await logOut();
  };

  const selectedHijriDate = useMemo(() => {
    return getHijriFromGregorian(selectedGregorianDate, adjustment);
  }, [selectedGregorianDate, adjustment]);

  const midMonthHijri = useMemo(() => {
    return getHijriFromGregorian(new Date(currentGYear, currentGMonth, 15), adjustment);
  }, [currentGYear, currentGMonth, adjustment]);

  const G_MONTH_NAMES_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const currentGMonthAbbr = G_MONTH_NAMES_EN[currentGMonth];
  const currentHijriMonthNameAr = HIJRI_MONTHS_AR[midMonthHijri.month - 1];

  const handleSelectGregorianDate = (date: Date) => {
    setSelectedGregorianDate(date);
    setCurrentGYear(date.getFullYear());
    setCurrentGMonth(date.getMonth());
    const h = getHijriFromGregorian(date, adjustment);
    setCurrentYear(h.year);
    setCurrentMonth(h.month);
    setSelectedDay(h.day);
  };

  const handlePrevGMonth = () => {
    if (currentGMonth === 0) {
      setCurrentGMonth(11);
      setCurrentGYear((y) => y - 1);
    } else {
      setCurrentGMonth((m) => m - 1);
    }
  };

  const handleNextGMonth = () => {
    if (currentGMonth === 11) {
      setCurrentGMonth(0);
      setCurrentGYear((y) => y + 1);
    } else {
      setCurrentGMonth((m) => m + 1);
    }
  };

  const handleJumpToTodayG = () => {
    const now = new Date();
    handleSelectGregorianDate(now);
  };

  const currentSelectedEvents = useMemo(() => {
    return userNotes.filter((n) => {
      return (
        n.hijriYear === selectedHijriDate.year &&
        n.hijriMonth === selectedHijriDate.month &&
        n.hijriDay === selectedHijriDate.day
      );
    });
  }, [userNotes, selectedHijriDate]);

  return (
    <div dir="rtl" className="w-full h-full min-h-screen bg-neutral-100 flex flex-col items-center">
      {/* Native Full-Screen App Container (edge-to-edge on mobile, clean centered column on desktop) */}
      <div className="w-full max-w-md h-full min-h-screen sm:min-h-screen bg-white text-neutral-800 flex flex-col justify-between shadow-xs sm:border-x sm:border-neutral-200/80 overflow-hidden relative">

        {/* Modern Main Calendar View (Matching user's attached design) */}
        {activeTab === 'calendar' && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-white smooth-scroll pb-16">
            {/* Top Modern Header with Mihrab Arch and Mosque Art */}
            <ModernCalendarHeader
              gregorianMonthNameEn={currentGMonthAbbr}
              gregorianYear={currentGYear}
              hijriYear={midMonthHijri.year}
              hijriMonthNameAr={currentHijriMonthNameAr}
              todayDayNumber={new Date().getDate()}
              viewMode={calendarViewMode}
              onChangeViewMode={setCalendarViewMode}
              onPrevMonth={handlePrevGMonth}
              onNextMonth={handleNextGMonth}
              onJumpToToday={handleJumpToTodayG}
              onOpenSearch={() => setActiveTab('events')}
              onOpenMenu={() => setActiveTab('settings')}
              useArabicDigits={useArabicDigits}
            />

            {/* Modern Calendar Grid with S M T W T F S and event pills */}
            <ModernCalendarGrid
              currentGregorianYear={currentGYear}
              currentGregorianMonth={currentGMonth}
              selectedDate={selectedGregorianDate}
              onSelectDate={handleSelectGregorianDate}
              userNotes={userNotes}
              adjustment={adjustment}
              viewMode={calendarViewMode}
            />

            {/* Selected Day Agenda Section with Day number, title, and + Add Event */}
            <ModernDayAgenda
              selectedDate={selectedGregorianDate}
              hijriDate={selectedHijriDate}
              events={currentSelectedEvents}
              onAddEvent={handleAddNote}
              onUpdateEvent={handleUpdateNote}
              onDeleteEvent={handleDeleteNote}
              useArabicDigits={useArabicDigits}
            />
          </div>
        )}

        {/* Date Converter View */}
        {activeTab === 'converter' && (
          <DateConverterView
            adjustment={adjustment}
            useArabicDigits={useArabicDigits}
            onSelectHijriDate={handleJumpToDate}
          />
        )}

        {/* Events & Occasions List View */}
        {activeTab === 'events' && (
          <EventsListView
            currentHijriYear={currentYear}
            useArabicDigits={useArabicDigits}
            onSelectEventDate={(year, month, day) => {
              handleJumpToDate(year, month, day);
              setActiveTab('calendar');
            }}
            showIslamicEvents={showIslamicEvents}
            onToggleShowIslamicEvents={setShowIslamicEvents}
            deletedIslamicEventIds={deletedIslamicEventIds}
            onDeleteIslamicEvent={handleDeleteIslamicEvent}
            onRestoreAllIslamicEvents={handleRestoreAllIslamicEvents}
          />
        )}

        {/* Settings View */}
        {activeTab === 'settings' && (
          <SettingsView
            adjustment={adjustment}
            onSetAdjustment={setAdjustment}
            useArabicDigits={useArabicDigits}
            onToggleDigits={setUseArabicDigits}
            onJumpToScreenshotDate={() => handleJumpToDate(1435, 12, 19)}
            user={user}
            notesCount={userNotes.length}
            onSignOut={handleSignOut}
          />
        )}

        {/* Modern Bottom Navigation Bar */}
        <BottomNavBar activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
