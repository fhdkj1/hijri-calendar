import { useState, useEffect, useMemo, useRef } from 'react';
import type { User } from 'firebase/auth';
import {
  getHijriMonthCalendar,
  getHijriFromGregorian,
  toArabicNumerals,
  type UserNote,
} from './utils/hijriCalendar';
import {
  onAuthChanged,
  subscribeToUserNotes,
  saveNoteToCloud,
  deleteNoteFromCloud,
  syncLocalNotesToCloud,
  checkRedirectAuth,
} from './services/firebase';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarGrid } from './components/CalendarGrid';
import { RuledNotebookSection } from './components/RuledNotebookSection';
import { BottomNavBar, type TabType } from './components/BottomNavBar';
import { DateConverterView } from './components/DateConverterView';
import { EventsListView } from './components/EventsListView';
import { SettingsView } from './components/SettingsView';

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
        if (Array.isArray(parsed)) {
          // Remove all test benchmark events (preserving any custom user notes)
          const cleanNotes = parsed.filter((n) => !n.id?.startsWith('perf-test-'));
          localStorage.setItem('hijri_user_notes', JSON.stringify(cleanNotes));
          return cleanNotes;
        }
      } catch {
        // fallback
      }
    }
    return [];
  });

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

  // Today's actual date
  const todayHijri = useMemo(() => {
    return getHijriFromGregorian(new Date(), adjustment);
  }, [adjustment]);

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

  // Gregorian month & year corresponding to this Hijri month
  const gregorianMonthYear = useMemo(() => {
    if (!calendarData.days || calendarData.days.length === 0) return '';
    const first = calendarData.days[0];
    const last = calendarData.days[calendarData.days.length - 1];

    const num = (v: number | string) =>
      useArabicDigits ? toArabicNumerals(v) : String(v);

    if (first.gregorianYear === last.gregorianYear) {
      if (first.gregorianMonth === last.gregorianMonth) {
        return `${first.gregorianMonthNameAr} ${num(first.gregorianYear)} م`;
      }
      return `${first.gregorianMonthNameAr} - ${last.gregorianMonthNameAr} ${num(first.gregorianYear)} م`;
    }
    return `${first.gregorianMonthNameAr} ${num(first.gregorianYear)} - ${last.gregorianMonthNameAr} ${num(last.gregorianYear)} م`;
  }, [calendarData.days, useArabicDigits]);

  // Keep selected day within valid month days
  useEffect(() => {
    if (selectedDay > calendarData.totalDays) {
      setSelectedDay(calendarData.totalDays);
    }
  }, [calendarData.totalDays, selectedDay]);

  const selectedDayInfo = useMemo(() => {
    return calendarData.days.find((d) => d.day === selectedDay) || null;
  }, [calendarData.days, selectedDay]);

  const isToday =
    currentYear === todayHijri.year &&
    currentMonth === todayHijri.month &&
    selectedDay === todayHijri.day;

  // Map of days with user notes (count + chosen icon + title)
  const notesDayMap = useMemo(() => {
    const map: Record<number, { count: number; icon?: string; title?: string }> = {};
    userNotes.forEach((n) => {
      if (n.hijriYear === currentYear && n.hijriMonth === currentMonth) {
        if (!map[n.hijriDay]) {
          map[n.hijriDay] = { count: 1, icon: n.icon || 'pin', title: n.title };
        } else {
          map[n.hijriDay].count += 1;
        }
      }
    });
    return map;
  }, [userNotes, currentYear, currentMonth]);

  // Month events collection
  const monthEvents = useMemo(() => {
    const events: { day: number; event: any }[] = [];
    calendarData.days.forEach((dayInfo) => {
      dayInfo.events.forEach((ev) => {
        events.push({ day: dayInfo.day, event: ev });
      });
    });
    return events;
  }, [calendarData.days]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(1);
  };

  // Swipe gesture handling for month navigation (Right = Next, Left = Previous)
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartXRef.current;
    const diffY = touchEndY - touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Threshold: at least 40px horizontal movement, and horizontal distance > vertical distance
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
      if (diffX > 0) {
        // Swiped Right -> Next Month
        handleNextMonth();
      } else {
        // Swiped Left -> Previous Month
        handlePrevMonth();
      }
    }
  };

  const handleJumpToDate = (year: number, month: number, day: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    setSelectedDay(day);
    setActiveTab('calendar');
  };

  const handleResetToToday = () => {
    setCurrentYear(todayHijri.year);
    setCurrentMonth(todayHijri.month);
    setSelectedDay(todayHijri.day);
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

  const todayDayInGrid = useMemo(() => {
    if (currentYear === todayHijri.year && currentMonth === todayHijri.month) {
      return todayHijri.day;
    }
    if (currentYear === 1435 && currentMonth === 12) {
      return 4;
    }
    return null;
  }, [currentYear, currentMonth, todayHijri.year, todayHijri.month, todayHijri.day]);

  return (
    <div dir="rtl" className="w-full h-full min-h-screen bg-neutral-100 flex flex-col items-center">
      {/* Native Full-Screen App Container (edge-to-edge on mobile, clean centered column on desktop) */}
      <div className="w-full max-w-md h-full min-h-screen sm:min-h-screen bg-white text-neutral-800 flex flex-col justify-between shadow-xs sm:border-x sm:border-neutral-200/80 overflow-hidden relative">

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Swipable Calendar Area (Header + Grid) */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="flex flex-col select-none touch-pan-y"
            >
              {/* Modern Header */}
              <CalendarHeader
                hijriYear={currentYear}
                hijriMonth={currentMonth}
                selectedDay={selectedDay}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onJumpToDate={handleJumpToDate}
                onResetToToday={handleResetToToday}
                useArabicDigits={useArabicDigits}
                isToday={isToday}
                gregorianMonthYear={gregorianMonthYear}
                todayDay={todayHijri.day}
                userNotes={userNotes}
                deletedIslamicEventIds={deletedIslamicEventIds}
              />

              {/* Modern Calendar Grid */}
              <CalendarGrid
                days={calendarData.days}
                startWeekday={calendarData.startWeekday}
                selectedDay={selectedDay}
                onSelectDay={(day) => setSelectedDay(day)}
                useArabicDigits={useArabicDigits}
                notesDayMap={notesDayMap}
                showIslamicEvents={showIslamicEvents}
                todayDay={todayDayInGrid}
              />
            </div>

            {/* Modern Ruled Notebook / Occasions & Notes Section */}
            <RuledNotebookSection
              selectedDayInfo={selectedDayInfo}
              monthEvents={monthEvents}
              userNotes={userNotes}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              useArabicDigits={useArabicDigits}
              showIslamicEvents={showIslamicEvents}
              selectedDay={selectedDay}
              onSelectDay={(day) => setSelectedDay(day)}
              calendarDays={calendarData.days}
              todayHijri={todayHijri}
              currentYear={currentYear}
              currentMonth={currentMonth}
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
          />
        )}

        {/* Modern Bottom Navigation Bar */}
        <BottomNavBar activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
