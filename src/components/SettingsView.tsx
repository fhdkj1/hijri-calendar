import { useState, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import {
  ChevronLeft,
  Settings,
  Globe,
  Calendar,
  CalendarDays,
  MapPin,
  Sliders,
  Hash,
  Palette,
  Sun,
  Bell,
  Clock,
  Music,
  Layers,
  Landmark,
  Link as LinkIcon,
  Database,
  Cloud,
  CloudCheck,
  Download,
  Upload,
  Trash2,
  Tag,
  HelpCircle,
  FileText,
  Smartphone,
  LogOut,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { toArabicNumerals, type UserNote } from '../utils/hijriCalendar';
import { signInWithGoogle } from '../services/firebase';

export type SettingsSection =
  | 'general'
  | 'appearance'
  | 'notifications'
  | 'calendar'
  | 'backup'
  | 'about';

export interface SettingsViewProps {
  adjustment: number;
  onSetAdjustment: (adj: number) => void;
  useArabicDigits: boolean;
  onToggleDigits: (useArabic: boolean) => void;
  onJumpToScreenshotDate?: () => void;
  user: User | null;
  notesCount: number;
  onSignOut: (keepLocalEvents: boolean) => Promise<void>;
  onBack?: () => void;
  userNotes?: UserNote[];
  onImportNotes?: (notes: UserNote[]) => void;
  onClearAllNotes?: () => void;
}

// iOS Style Burgundy Toggle Switch matching the screenshot
const ToggleSwitch = ({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) => (
  <div dir="ltr" className="inline-flex items-center">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
        checked ? 'bg-[#7a1616]' : 'bg-neutral-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export const SettingsView = ({
  adjustment,
  onSetAdjustment,
  useArabicDigits,
  onToggleDigits,
  user,
  notesCount,
  onSignOut,
  onBack,
  userNotes = [],
  onImportNotes,
  onClearAllNotes,
}: SettingsViewProps) => {
  // Navigation: activeSection is null when viewing sections menu, or holds the current inner page
  const [activeSection, setActiveSection] = useState<SettingsSection | null>(null);

  // General Settings State
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('miqat_setting_lang') as 'ar' | 'en') || 'ar';
  });
  const [defaultCalendar, setDefaultCalendar] = useState<string>(() => {
    return localStorage.getItem('miqat_setting_default_cal') || 'هجري - ميلادي';
  });
  const [timezone, setTimezone] = useState<string>(() => {
    return localStorage.getItem('miqat_setting_timezone') || 'الرياض';
  });
  const [startWeekOnSunday, setStartWeekOnSunday] = useState<boolean>(() => {
    const saved = localStorage.getItem('miqat_setting_start_sunday');
    return saved !== null ? saved === 'true' : true;
  });

  // Appearance Settings State
  const [themeMode, setThemeMode] = useState<string>(() => {
    return localStorage.getItem('miqat_setting_theme') || 'فاتح';
  });
  const [themeColor, setThemeColor] = useState<string>(() => {
    return localStorage.getItem('miqat_setting_color') || 'العنوان';
  });

  // Notifications Settings State
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('miqat_setting_reminders');
    return saved !== null ? saved === 'true' : true;
  });
  const [upcomingEventsNotification, setUpcomingEventsNotification] = useState<boolean>(() => {
    const saved = localStorage.getItem('miqat_setting_upcoming');
    return saved !== null ? saved === 'true' : true;
  });
  const [defaultReminderTime, setDefaultReminderTime] = useState<string>(() => {
    return localStorage.getItem('miqat_setting_reminder_time') || 'قبل 10 دقائق';
  });
  const [notificationSound, setNotificationSound] = useState<string>(() => {
    return localStorage.getItem('miqat_setting_notif_sound') || 'صوت افتراضي';
  });

  // Events & Calendar Settings State
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('miqat_setting_categories');
    return saved ? JSON.parse(saved) : ['عمل', 'عائلة', 'سفر', 'عبادات', 'شخصي'];
  });
  const [religiousEventsVisibility, setReligiousEventsVisibility] = useState<string>(() => {
    return localStorage.getItem('miqat_setting_religious_events') || 'الأعياد والمناسبات الإسلامية';
  });
  const [connectedServicesEvents, setConnectedServicesEvents] = useState<boolean>(() => {
    const saved = localStorage.getItem('miqat_setting_connected_services');
    return saved !== null ? saved === 'true' : true;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('miqat_setting_lang', language);
  }, [language]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_default_cal', defaultCalendar);
  }, [defaultCalendar]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_timezone', timezone);
  }, [timezone]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_start_sunday', String(startWeekOnSunday));
  }, [startWeekOnSunday]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_theme', themeMode);
  }, [themeMode]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_color', themeColor);
  }, [themeColor]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_reminders', String(remindersEnabled));
  }, [remindersEnabled]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_upcoming', String(upcomingEventsNotification));
  }, [upcomingEventsNotification]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_reminder_time', defaultReminderTime);
  }, [defaultReminderTime]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_notif_sound', notificationSound);
  }, [notificationSound]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_categories', JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_religious_events', religiousEventsVisibility);
  }, [religiousEventsVisibility]);
  useEffect(() => {
    localStorage.setItem('miqat_setting_connected_services', String(connectedServicesEvents));
  }, [connectedServicesEvents]);

  // Auth & Sync State
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals for Options Selection
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [newCategoryText, setNewCategoryText] = useState('');
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      showToast('قم بالنقر على مشاركة ثم "إضافة إلى الصفحة الرئيسية"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsStandalone(true);
      showToast('تم تثبيت التطبيق بنجاح');
    }
    setDeferredPrompt(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      showToast('تم تسجيل الدخول وربط السحابة بنجاح');
    } catch (err: any) {
      console.error('Sign-in error:', err);
      let message = 'تعذر تسجيل الدخول بحساب Google. يرجى المحاولة مرة أخرى.';
      if (err?.code === 'auth/unauthorized-domain') {
        message = 'النطاق الحالي قيد التحديث في Firebase.';
      } else if (err?.code === 'auth/popup-blocked') {
        message = 'المتصفح حظر النافذة المنبثقة. يرجى السماح بها أو فتح الرابط في Safari / Chrome.';
      } else if (err?.message) {
        message = `خطأ: ${err.message}`;
      }
      showToast(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const confirmSignOut = async (keepLocalEvents: boolean) => {
    try {
      setIsSigningOut(true);
      await onSignOut(keepLocalEvents);
      setShowSignOutModal(false);
      showToast(
        keepLocalEvents
          ? 'تم تسجيل الخروج مع الاحتفاظ بالمناسبات على هذا الجهاز'
          : 'تم تسجيل الخروج ومسح المناسبات من هذا الجهاز'
      );
    } catch (err) {
      console.error('Sign-out error:', err);
      showToast('حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Export User Notes to JSON File
  const handleExportData = () => {
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(userNotes, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `miqat-backup-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('تم تصدير النسخة الاحتياطية بنجاح');
    } catch (err) {
      console.error('Export error:', err);
      showToast('تعذر تصدير البيانات');
    }
  };

  // Import User Notes from JSON File
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && onImportNotes) {
          onImportNotes(parsed);
          showToast(`تم استيراد ${parsed.length} مناسبة بنجاح`);
        } else {
          showToast('تنسيق الملف غير صحيح');
        }
      } catch (err) {
        console.error('Import error:', err);
        showToast('فشل في قراءة ملف النسخة الاحتياطية');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Danger: Reset / Clear All Data
  const handleConfirmReset = () => {
    if (onClearAllNotes) {
      onClearAllNotes();
    }
    localStorage.removeItem('hijri_user_notes');
    setShowResetConfirmModal(false);
    showToast('تم مسح جميع البيانات بنجاح');
  };

  // Titles for section headers
  const getSectionTitle = (sec: SettingsSection): string => {
    switch (sec) {
      case 'general':
        return 'عام';
      case 'appearance':
        return 'المظهر';
      case 'notifications':
        return 'التنبيهات';
      case 'calendar':
        return 'الأحداث والتقويم';
      case 'backup':
        return 'البيانات والنسخ الاحتياطي';
      case 'about':
        return 'حول التطبيق';
    }
  };

  return (
    <div
      dir="rtl"
      className="flex-1 flex flex-col bg-[#faf8f5] overflow-y-auto select-none text-right smooth-scroll relative"
    >
      {/* Hidden File Input for Data Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Top Header Bar matching Screenshot */}
      <header className="sticky top-0 z-20 bg-[#faf8f5]/90 backdrop-blur-md px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3.5 flex items-center justify-between border-b border-neutral-200/40">
        {/* Left Back Arrow in Deep Burgundy */}
        <button
          type="button"
          onClick={() => {
            if (activeSection !== null) {
              setActiveSection(null);
            } else if (onBack) {
              onBack();
            }
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#7a1616] hover:bg-neutral-200/50 active:scale-95 transition"
          aria-label="الرجوع"
        >
          <ChevronLeft size={24} className="stroke-[2.5]" />
        </button>

        {/* Center Title */}
        <h1 className="text-base sm:text-lg font-bold text-neutral-900">
          {activeSection ? getSectionTitle(activeSection) : 'الإعدادات'}
        </h1>

        {/* Right balance spacer */}
        <div className="w-9" />
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-4 pb-20 max-w-lg mx-auto w-full">
        {/* ============================================================ */}
        {/* LEVEL 1: Main Settings Menu (Shows all sections as cards)   */}
        {/* ============================================================ */}
        {activeSection === null && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-150">
            {/* Section 1: عام */}
            <button
              type="button"
              onClick={() => setActiveSection('general')}
              className="w-full bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-[#7a1616]/30 active:scale-[0.99] transition flex items-center justify-between group text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7a1616] flex items-center justify-center shrink-0">
                  <Settings size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900 group-hover:text-[#7a1616] transition">
                    عام
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    اللغة، التقويم، المنطقة الزمنية، بداية الأسبوع، أم القرى
                  </div>
                </div>
              </div>
              <ChevronLeft size={18} className="text-[#7a1616] group-hover:-translate-x-0.5 transition" />
            </button>

            {/* Section 2: المظهر */}
            <button
              type="button"
              onClick={() => setActiveSection('appearance')}
              className="w-full bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-[#7a1616]/30 active:scale-[0.99] transition flex items-center justify-between group text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7a1616] flex items-center justify-center shrink-0">
                  <Palette size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900 group-hover:text-[#7a1616] transition">
                    المظهر
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    الوضع ({themeMode})، ألوان التطبيق
                  </div>
                </div>
              </div>
              <ChevronLeft size={18} className="text-[#7a1616] group-hover:-translate-x-0.5 transition" />
            </button>

            {/* Section 3: التنبيهات */}
            <button
              type="button"
              onClick={() => setActiveSection('notifications')}
              className="w-full bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-[#7a1616]/30 active:scale-[0.99] transition flex items-center justify-between group text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7a1616] flex items-center justify-center shrink-0">
                  <Bell size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900 group-hover:text-[#7a1616] transition">
                    التنبيهات
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    التذكيرات، إشعارات الأحداث، الوقت الافتراضي للتنبيه
                  </div>
                </div>
              </div>
              <ChevronLeft size={18} className="text-[#7a1616] group-hover:-translate-x-0.5 transition" />
            </button>

            {/* Section 4: الأحداث والتقويم */}
            <button
              type="button"
              onClick={() => setActiveSection('calendar')}
              className="w-full bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-[#7a1616]/30 active:scale-[0.99] transition flex items-center justify-between group text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7a1616] flex items-center justify-center shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900 group-hover:text-[#7a1616] transition">
                    الأحداث والتقويم
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    إدارة الفئات، إظهار المناسبات الدينية، الخدمات المتصلة
                  </div>
                </div>
              </div>
              <ChevronLeft size={18} className="text-[#7a1616] group-hover:-translate-x-0.5 transition" />
            </button>

            {/* Section 5: البيانات والنسخ الاحتياطي */}
            <button
              type="button"
              onClick={() => setActiveSection('backup')}
              className="w-full bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-[#7a1616]/30 active:scale-[0.99] transition flex items-center justify-between group text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7a1616] flex items-center justify-center shrink-0">
                  <Database size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900 group-hover:text-[#7a1616] transition">
                    البيانات والنسخ الاحتياطي
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    المزامنة السحابية عبر Google، تصدير واستيراد، إعادة التعيين
                  </div>
                </div>
              </div>
              <ChevronLeft size={18} className="text-[#7a1616] group-hover:-translate-x-0.5 transition" />
            </button>

            {/* Section 6: حول التطبيق */}
            <button
              type="button"
              onClick={() => setActiveSection('about')}
              className="w-full bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-[#7a1616]/30 active:scale-[0.99] transition flex items-center justify-between group text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#7a1616] flex items-center justify-center shrink-0">
                  <Tag size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900 group-hover:text-[#7a1616] transition">
                    حول التطبيق
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    إصدار التطبيق 1.0.0، المساعدة والدعم، سياسة الخصوصية
                  </div>
                </div>
              </div>
              <ChevronLeft size={18} className="text-[#7a1616] group-hover:-translate-x-0.5 transition" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* LEVEL 2: Dedicated Inner Pages (Exactly styled as screenshot) */}
        {/* ============================================================ */}

        {/* 1. صفحة: عام */}
        {activeSection === 'general' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-150">
            {/* Header Tag */}
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#7a1616]">
              <span>عام</span>
              <Settings size={15} />
            </div>

            {/* Settings Card */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {/* Row 1: اللغة */}
              <button
                type="button"
                onClick={() => setActiveModal('language')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">
                    {language === 'ar' ? 'العربية' : 'English'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">اللغة</span>
                  <Globe size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 2: التقويم الافتراضي */}
              <button
                type="button"
                onClick={() => setActiveModal('defaultCalendar')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">{defaultCalendar}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    التقويم الافتراضي
                  </span>
                  <Calendar size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 3: المنطقة الزمنية */}
              <button
                type="button"
                onClick={() => setActiveModal('timezone')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">{timezone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    المنطقة الزمنية
                  </span>
                  <MapPin size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 4: البداية بيوم الأحد (Toggle Switch) */}
              <div className="p-4 flex items-center justify-between text-right">
                <ToggleSwitch
                  checked={startWeekOnSunday}
                  onChange={setStartWeekOnSunday}
                />
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    البداية بيوم الأحد
                  </span>
                  <CalendarDays size={18} className="text-[#7a1616]" />
                </div>
              </div>

              {/* Row 5: تعديل تقويم أم القرى */}
              <button
                type="button"
                onClick={() => setActiveModal('adjustment')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">
                    {adjustment === 0 ? 'تلقائي (0)' : `${adjustment > 0 ? '+' : ''}${num(adjustment)} يوم`}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    تعديل تقويم أم القرى
                  </span>
                  <Sliders size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 6: نمط كتابة الأرقام */}
              <button
                type="button"
                onClick={() => onToggleDigits(!useArabicDigits)}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">
                    {useArabicDigits ? 'عربية مشرقية (١، ٢، ٣)' : 'غربية (1, 2, 3)'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    نمط كتابة الأرقام
                  </span>
                  <Hash size={18} className="text-[#7a1616]" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 2. صفحة: المظهر */}
        {activeSection === 'appearance' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-150">
            {/* Header Tag */}
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#7a1616]">
              <span>المظهر</span>
              <Palette size={15} />
            </div>

            {/* Appearance Card */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {/* Row 1: الوضع */}
              <button
                type="button"
                onClick={() => setActiveModal('themeMode')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">{themeMode}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">الوضع</span>
                  <Sun size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 2: ألوان التطبيق */}
              <button
                type="button"
                onClick={() => setActiveModal('themeColor')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">{themeColor}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    ألوان التطبيق
                  </span>
                  <Palette size={18} className="text-[#7a1616]" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 3. صفحة: التنبيهات */}
        {activeSection === 'notifications' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-150">
            {/* Header Tag */}
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#7a1616]">
              <span>التنبيهات</span>
              <Bell size={15} />
            </div>

            {/* Notifications Card */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {/* Row 1: التذكيرات (Toggle) */}
              <div className="p-4 flex items-center justify-between text-right">
                <ToggleSwitch
                  checked={remindersEnabled}
                  onChange={setRemindersEnabled}
                />
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    التذكيرات
                  </span>
                  <Bell size={18} className="text-[#7a1616]" />
                </div>
              </div>

              {/* Row 2: إشعارات الأحداث القادمة (Toggle) */}
              <div className="p-4 flex items-center justify-between text-right">
                <ToggleSwitch
                  checked={upcomingEventsNotification}
                  onChange={setUpcomingEventsNotification}
                />
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    إشعارات الأحداث القادمة
                  </span>
                  <Calendar size={18} className="text-[#7a1616]" />
                </div>
              </div>

              {/* Row 3: الوقت الافتراضي للتنبيه */}
              <button
                type="button"
                onClick={() => setActiveModal('reminderTime')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">{defaultReminderTime}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    الوقت الافتراضي للتنبيه
                  </span>
                  <Clock size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 4: صوت الإشعار */}
              <button
                type="button"
                onClick={() => setActiveModal('notifSound')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">{notificationSound}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    صوت الإشعار
                  </span>
                  <Music size={18} className="text-[#7a1616]" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 4. صفحة: الأحداث والتقويم */}
        {activeSection === 'calendar' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-150">
            {/* Header Tag */}
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#7a1616]">
              <span>الأحداث والتقويم</span>
              <Calendar size={15} />
            </div>

            {/* Events Card */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {/* Row 1: إدارة الفئات */}
              <button
                type="button"
                onClick={() => setActiveModal('categories')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500 truncate max-w-[130px]">
                    {categories.slice(0, 3).join('، ')} ...
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    إدارة الفئات
                  </span>
                  <Layers size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 2: إظهار المناسبات الدينية */}
              <button
                type="button"
                onClick={() => setActiveModal('religiousEvents')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">
                    {religiousEventsVisibility}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    إظهار المناسبات الدينية
                  </span>
                  <Landmark size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 3: إظهار الأحداث من الخدمات المتصلة (Toggle) */}
              <div className="p-4 flex items-center justify-between text-right">
                <ToggleSwitch
                  checked={connectedServicesEvents}
                  onChange={setConnectedServicesEvents}
                />
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    إظهار الأحداث من الخدمات المتصلة
                  </span>
                  <LinkIcon size={18} className="text-[#7a1616]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. صفحة: البيانات والنسخ الاحتياطي */}
        {activeSection === 'backup' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-150">
            {/* Header Tag */}
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#7a1616]">
              <span>البيانات والنسخ الاحتياطي</span>
              <Database size={15} />
            </div>

            {/* Cloud Status Card */}
            {user ? (
              <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowSignOutModal(true)}
                  className="flex items-center gap-1 text-xs text-red-600 bg-white hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 font-medium transition active:scale-95 shadow-2xs"
                >
                  <LogOut size={13} />
                  <span>تسجيل الخروج</span>
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <div className="font-bold text-neutral-900 text-xs">{user.displayName}</div>
                    <div className="text-[10px] text-neutral-500 font-sans">{user.email}</div>
                  </div>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full border border-neutral-200 shadow-2xs"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Rows Card */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {/* Row 1: النسخ الاحتياطي السحابي (Google Cloud Sync) */}
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    showToast(`المزامنة نشطة! يتم حفظ ${notesCount} مناسبة بأمان في السحابة.`);
                  } else {
                    handleSignIn();
                  }
                }}
                disabled={isSigningIn}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">
                    {isSigningIn ? (
                      <span className="flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" />
                        <span>جارٍ الاتصال...</span>
                      </span>
                    ) : user ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CloudCheck size={13} />
                        <span>متزامن ({notesCount})</span>
                      </span>
                    ) : (
                      'نسخ احتياطي الآن'
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    النسخ الاحتياطي
                  </span>
                  <Cloud size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 2: تصدير واستيراد */}
              <button
                type="button"
                onClick={() => setActiveModal('exportImport')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                  <span className="text-xs text-neutral-500">تصدير واستيراد</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    تصدير واستيراد
                  </span>
                  <Download size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 3: إعادة تعيين التطبيق */}
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-red-50/50 active:bg-red-50 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-red-600" />
                  <span className="text-xs text-red-600 font-medium">حذف جميع البيانات</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-red-700">
                    إعادة تعيين التطبيق
                  </span>
                  <Trash2 size={18} className="text-red-600" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 6. صفحة: حول التطبيق */}
        {activeSection === 'about' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-150">
            {/* Header Tag */}
            <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#7a1616]">
              <span>حول التطبيق</span>
              <Tag size={15} />
            </div>

            {/* About Card */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
              {/* Row 1: إصدار التطبيق */}
              <div className="p-4 flex items-center justify-between text-right">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-500 font-mono font-bold bg-neutral-100 px-2.5 py-0.5 rounded-full">
                    1.0.0
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    إصدار التطبيق
                  </span>
                  <Tag size={18} className="text-[#7a1616]" />
                </div>
              </div>

              {/* Row 2: المساعدة والدعم */}
              <button
                type="button"
                onClick={() => setActiveModal('help')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    المساعدة والدعم
                  </span>
                  <HelpCircle size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 3: سياسة الخصوصية */}
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronLeft size={17} className="text-[#7a1616]" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900">
                    سياسة الخصوصية
                  </span>
                  <FileText size={18} className="text-[#7a1616]" />
                </div>
              </button>

              {/* Row 4: تثبيت التطبيق PWA */}
              {!isStandalone && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full p-4 flex items-center justify-between hover:bg-neutral-50/80 active:bg-neutral-100 transition text-right"
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronLeft size={17} className="text-[#7a1616]" />
                    <span className="text-xs text-[#7a1616] font-medium">تثبيت الآن</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs sm:text-sm font-medium text-neutral-900">
                      تثبيت التطبيق على جهازك
                    </span>
                    <Smartphone size={18} className="text-[#7a1616]" />
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SELECTION MODALS & DIALOGS                                   */}
      {/* ============================================================ */}

      {/* Modal: اللغة */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">اختر اللغة</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setLanguage('ar');
                  setActiveModal(null);
                }}
                className={`w-full p-3 rounded-2xl border text-right text-xs font-bold flex items-center justify-between transition ${
                  language === 'ar'
                    ? 'border-[#7a1616] bg-red-50/50 text-[#7a1616]'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {language === 'ar' && <Check size={16} />}
                <span>العربية</span>
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setActiveModal(null);
                }}
                className={`w-full p-3 rounded-2xl border text-right text-xs font-bold flex items-center justify-between transition ${
                  language === 'en'
                    ? 'border-[#7a1616] bg-red-50/50 text-[#7a1616]'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {language === 'en' && <Check size={16} />}
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: التقويم الافتراضي */}
      {activeModal === 'defaultCalendar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">التقويم الافتراضي</h3>
            </div>
            <div className="space-y-2">
              {['هجري - ميلادي', 'هجري فقط', 'ميلادي فقط'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDefaultCalendar(opt);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3 rounded-2xl border text-right text-xs font-bold flex items-center justify-between transition ${
                    defaultCalendar === opt
                      ? 'border-[#7a1616] bg-red-50/50 text-[#7a1616]'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {defaultCalendar === opt && <Check size={16} />}
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: المنطقة الزمنية */}
      {activeModal === 'timezone' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">المنطقة الزمنية</h3>
            </div>
            <div className="space-y-2">
              {['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'دبي', 'القاهرة', 'القدس'].map((tz) => (
                <button
                  key={tz}
                  onClick={() => {
                    setTimezone(tz);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3 rounded-2xl border text-right text-xs font-bold flex items-center justify-between transition ${
                    timezone === tz
                      ? 'border-[#7a1616] bg-red-50/50 text-[#7a1616]'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {timezone === tz && <Check size={16} />}
                  <span>{tz}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: تعديل تقويم أم القرى */}
      {activeModal === 'adjustment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">تعديل تقويم أم القرى</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              يمكنك تقديم أو تأخير التاريخ بيوم أو يومين لمطابقة ثبوت رؤية الهلال في منطقتك.
            </p>
            <div className="grid grid-cols-5 gap-1.5 bg-neutral-100/80 p-1.5 rounded-2xl">
              {[-2, -1, 0, 1, 2].map((adj) => (
                <button
                  key={adj}
                  type="button"
                  onClick={() => {
                    onSetAdjustment(adj);
                    setActiveModal(null);
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                    adjustment === adj
                      ? 'bg-[#7a1616] text-white shadow-2xs'
                      : 'text-neutral-700 hover:bg-neutral-200/80'
                  }`}
                >
                  {adj === 0 ? 'تلقائي' : `${adj > 0 ? '+' : ''}${num(adj)}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: الوضع (المظهر) */}
      {activeModal === 'themeMode' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">وضع المظهر</h3>
            </div>
            <div className="space-y-2">
              {['فاتح', 'داكن', 'تلقائي (حسب النظام)'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setThemeMode(mode);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3 rounded-2xl border text-right text-xs font-bold flex items-center justify-between transition ${
                    themeMode === mode
                      ? 'border-[#7a1616] bg-red-50/50 text-[#7a1616]'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {themeMode === mode && <Check size={16} />}
                  <span>{mode}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: ألوان التطبيق */}
      {activeModal === 'themeColor' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">ألوان التطبيق</h3>
            </div>
            <div className="space-y-2">
              {[
                { name: 'العنوان', color: '#7a1616' },
                { name: 'أخضر زمردي', color: '#047857' },
                { name: 'أزرق كحلي', color: '#1d4ed8' },
                { name: 'كهرماني كلاسيكي', color: '#d97706' },
              ].map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setThemeColor(c.name);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3 rounded-2xl border text-right text-xs font-bold flex items-center justify-between transition ${
                    themeColor === c.name
                      ? 'border-[#7a1616] bg-red-50/50 text-[#7a1616]'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {themeColor === c.name && <Check size={16} />}
                    <div
                      className="w-4 h-4 rounded-full border border-neutral-300 shadow-2xs"
                      style={{ backgroundColor: c.color }}
                    />
                  </div>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: الوقت الافتراضي للتنبيه */}
      {activeModal === 'reminderTime' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">الوقت الافتراضي للتنبيه</h3>
            </div>
            <div className="space-y-2">
              {['قبل 5 دقائق', 'قبل 10 دقائق', 'قبل 15 دقيقة', 'قبل 30 دقيقة', 'قبل ساعة', 'قبل يوم'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setDefaultReminderTime(t);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3 rounded-2xl border text-right text-xs font-bold flex items-center justify-between transition ${
                    defaultReminderTime === t
                      ? 'border-[#7a1616] bg-red-50/50 text-[#7a1616]'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {defaultReminderTime === t && <Check size={16} />}
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: صوت الإشعار */}
      {activeModal === 'notifSound' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">صوت الإشعار</h3>
            </div>
            <div className="space-y-2">
              {['صوت افتراضي', 'تكبيرات الأذان', 'تنبيه هادئ', 'نغمة لطيفة'].map((snd) => (
                <button
                  key={snd}
                  onClick={() => {
                    setNotificationSound(snd);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3 rounded-2xl border text-right text-xs font-bold flex items-center justify-between transition ${
                    notificationSound === snd
                      ? 'border-[#7a1616] bg-red-50/50 text-[#7a1616]'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {notificationSound === snd && <Check size={16} />}
                  <span>{snd}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: إدارة الفئات */}
      {activeModal === 'categories' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">إدارة الفئات</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اسم الفئة الجديدة..."
                value={newCategoryText}
                onChange={(e) => setNewCategoryText(e.target.value)}
                className="flex-1 px-3 py-2 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:border-[#7a1616]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCategoryText.trim()) {
                    setCategories((prev) => [...prev, newCategoryText.trim()]);
                    setNewCategoryText('');
                  }
                }}
                className="bg-[#7a1616] text-white p-2 rounded-xl active:scale-95 transition"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-neutral-100 text-neutral-800 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-neutral-200/70"
                >
                  <span>{cat}</span>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCategories((prev) => prev.filter((c) => c !== cat))
                      }
                      className="text-neutral-400 hover:text-red-600 transition"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: إظهار المناسبات الدينية */}
      {activeModal === 'religiousEvents' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">المناسبات الدينية</h3>
            </div>
            <div className="space-y-2">
              {['الأعياد والمناسبات الإسلامية', 'الأعياد الرسمية فقط', 'إخفاء المناسبات الدينية'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setReligiousEventsVisibility(opt);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3 rounded-2xl border text-right text-xs font-bold flex items-center justify-between transition ${
                    religiousEventsVisibility === opt
                      ? 'border-[#7a1616] bg-red-50/50 text-[#7a1616]'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {religiousEventsVisibility === opt && <Check size={16} />}
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: تصدير واستيراد */}
      {activeModal === 'exportImport' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">تصدير واستيراد البيانات</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              يمكنك تصدير نسخة احتياطية من مناسباتك ومواعيدك بصيغة JSON، أو استيرادها على أي جهاز آخر.
            </p>
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleExportData();
                  setActiveModal(null);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-bold transition active:scale-98"
              >
                <Download size={16} className="text-[#7a1616]" />
                <span>تصدير البيانات (تحميل ملف JSON)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-900 text-xs font-bold transition active:scale-98"
              >
                <Upload size={16} className="text-[#7a1616]" />
                <span>استيراد بيانات من ملف JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: المساعدة والدعم */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">المساعدة والدعم</h3>
            </div>
            <div className="space-y-2.5 text-xs text-neutral-600 leading-relaxed">
              <p>
                <strong>تطبيق ميقات (MIQAT)</strong> هو تقويم هجري وميلادي ذكي مصمم وفق معايير تقويم أم القرى بالمملكة العربية السعودية.
              </p>
              <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/60 space-y-1.5">
                <div className="font-bold text-neutral-900">مميزات رئيسية:</div>
                <div>• حساب دقيق للتاريخ الهجري والميلادي.</div>
                <div>• مزامنة سحابية فورية بحساب Google بين عدة هواتف.</div>
                <div>• إمكانية العمل بدون اتصال بالإنترنت وحفظ المواعيد محلياً.</div>
                <div>• تخصيص التنبيهات والألوان وتقويم أم القرى.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: سياسة الخصوصية */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
              <h3 className="text-sm font-bold text-neutral-900">سياسة الخصوصية</h3>
            </div>
            <div className="space-y-2.5 text-xs text-neutral-600 leading-relaxed">
              <p>
                نولي خصوصية بياناتك اهتماماً بالغاً. جميع مناسباتك وملاحظاتك تحفظ محلياً على جهازك، وفي حال تسجيل الدخول بحساب Google تحفظ مشفرة على قاعدة بياناتك السحابية الخاصة ولا يمكن لأي طرف ثالث الاطلاع عليها.
              </p>
              <p>
                لا يقوم التطبيق بجمع أو مشاركة أي بيانات شخصية أو استهداف إعلاني.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Danger Modal: إعادة تعيين جميع البيانات */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4 text-right">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">حذف جميع البيانات</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف جميع الملاحظات والمناسبات المحفوظة محلياً؟ هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 active:scale-95 transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 active:scale-95 transition shadow-xs"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign-Out Options Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200/90 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#7a1616] flex items-center justify-center shrink-0 border border-red-100">
                <LogOut size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-900">تسجيل الخروج من الحساب</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  هل ترغب في الاحتفاظ بجميع مناسباتك وأحداثك على هذا الجهاز، أم مسحها؟
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3 text-[11px] text-emerald-900 flex items-center gap-2.5">
              <CloudCheck size={18} className="text-emerald-700 shrink-0" />
              <span className="leading-relaxed">
                مناسباتك ستبقى محفوظة دائماً بأمان في حساب Google السحابي.
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => confirmSignOut(true)}
                disabled={isSigningOut}
                className="w-full text-right p-3 rounded-2xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 active:scale-98 transition flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Smartphone size={13} className="text-[#7a1616]" />
                    <span>الاحتفاظ بالمناسبات على هذا الجهاز</span>
                  </div>
                  <div className="text-[10.5px] text-neutral-500">
                    تبقى المناسبات ظاهرة في التقويم على هاتفك بعد الخروج.
                  </div>
                </div>
                <Check size={16} className="text-neutral-400 shrink-0 mr-2" />
              </button>

              <button
                onClick={() => confirmSignOut(false)}
                disabled={isSigningOut}
                className="w-full text-right p-3 rounded-2xl border border-red-200 bg-red-50/40 hover:bg-red-50 hover:border-red-300 active:scale-98 transition flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                    <Trash2 size={13} className="text-red-600" />
                    <span>مسح المناسبات من هذا الجهاز</span>
                  </div>
                  <div className="text-[10.5px] text-red-600/80">
                    إفراغ التقويم على هذا الجهاز فقط (محفوظة في السحابة).
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-1 flex items-center justify-center">
              <button
                onClick={() => setShowSignOutModal(false)}
                disabled={isSigningOut}
                className="w-full py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition rounded-xl hover:bg-neutral-100"
              >
                إلغاء والتراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 text-white text-xs py-2 px-4 rounded-xl shadow-lg border border-neutral-700/50 backdrop-blur-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
