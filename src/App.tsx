import { useState, useEffect, useMemo } from 'react';
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
  const [activeTab, setActiveTab] = useState<TabType>('calendar');

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

  // Selected city for prayer times
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('hijri_prayer_city') || 'مكة المكرمة';
  });

  // Show/hide Islamic events in calendar
  const [showIslamicEvents, setShowIslamicEvents] = useState<boolean>(() => {
    const saved = localStorage.getItem('hijri_show_islamic_events');
    return saved !== null ? saved === 'true' : true;
  });

  // User custom notes / events
  const [userNotes, setUserNotes] = useState<UserNote[]>(() => {
    const saved = localStorage.getItem('hijri_user_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'sample-1',
        hijriYear: 1435,
        hijriMonth: 12,
        hijriDay: 19,
        title: 'يوم الإثنين - موعد متابعة',
        details: 'ملاحظة مسجلة في يوم 19 ذو الحجة',
        icon: 'pin',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Initial date: set to Dhu al-Hijjah 1435, Day 19 (matching screenshot)
  const [currentYear, setCurrentYear] = useState<number>(1435);
  const [currentMonth, setCurrentMonth] = useState<number>(12);
  const [selectedDay, setSelectedDay] = useState<number>(19);

  // Today's actual date
  const todayHijri = useMemo(() => {
    return getHijriFromGregorian(new Date(), adjustment);
  }, [adjustment]);

  // Persist settings locally
  useEffect(() => {
    localStorage.setItem('hijri_adjustment', adjustment.toString());
  }, [adjustment]);

  useEffect(() => {
    localStorage.setItem('hijri_arabic_digits', useArabicDigits.toString());
  }, [useArabicDigits]);

  useEffect(() => {
    localStorage.setItem('hijri_prayer_city', selectedCity);
  }, [selectedCity]);

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
            await syncLocalNotesToCloud(currentUser.uid, parsed);
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
        setUserNotes(cloudNotes);
      },
      (err) => {
        console.error('Cloud notes sync error:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Generate calendar month data
  const calendarData = useMemo(() => {
    return getHijriMonthCalendar(currentYear, currentMonth, adjustment);
  }, [currentYear, currentMonth, adjustment]);

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

  // Map of days with user notes (count + chosen icon)
  const notesDayMap = useMemo(() => {
    const map: Record<number, { count: number; icon?: string }> = {};
    userNotes.forEach((n) => {
      if (n.hijriYear === currentYear && n.hijriMonth === currentMonth) {
        if (!map[n.hijriDay]) {
          map[n.hijriDay] = { count: 1, icon: n.icon || 'pin' };
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

  return (
    <div dir="rtl" className="w-full h-full min-h-screen bg-neutral-100 flex flex-col items-center">
      {/* Native Full-Screen App Container (edge-to-edge on mobile, clean centered column on desktop) */}
      <div className="w-full max-w-md h-full min-h-screen sm:min-h-screen bg-white text-neutral-800 flex flex-col justify-between shadow-xs sm:border-x sm:border-neutral-200/80 overflow-hidden relative">

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
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
            />

            {/* Modern Ruled Notebook / Occasions & Notes Section */}
            <RuledNotebookSection
              selectedDayInfo={selectedDayInfo}
              monthEvents={monthEvents}
              userNotes={userNotes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              useArabicDigits={useArabicDigits}
              showIslamicEvents={showIslamicEvents}
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
            adjustment={adjustment}
            useArabicDigits={useArabicDigits}
            onSelectEventDate={handleJumpToDate}
            showIslamicEvents={showIslamicEvents}
            onToggleShowIslamicEvents={setShowIslamicEvents}
          />
        )}

        {/* Settings View */}
        {activeTab === 'settings' && (
          <SettingsView
            adjustment={adjustment}
            onSetAdjustment={setAdjustment}
            useArabicDigits={useArabicDigits}
            onToggleDigits={setUseArabicDigits}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
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
