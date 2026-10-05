import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  Settings,
  Sliders,
  Check,
  HelpCircle,
  Sparkles,
  CloudCheck,
  CloudOff,
  LogOut,
  Loader2,
  Smartphone,
  Download,
} from 'lucide-react';
import { toArabicNumerals } from '../utils/hijriCalendar';
import { signInWithGoogle, logOut } from '../services/firebase';
import { GoogleIcon } from './SyncAccountBar';

interface SettingsViewProps {
  adjustment: number;
  onSetAdjustment: (adj: number) => void;
  useArabicDigits: boolean;
  onToggleDigits: (useArabic: boolean) => void;
  onJumpToScreenshotDate: () => void;
  user: User | null;
  notesCount: number;
}

export const SettingsView = ({
  adjustment,
  onSetAdjustment,
  useArabicDigits,
  onToggleDigits,
  onJumpToScreenshotDate,
  user,
  notesCount,
}: SettingsViewProps) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });

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
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsStandalone(true);
    }
    setDeferredPrompt(null);
  };

  const num = (val: number | string) =>
    useArabicDigits ? toArabicNumerals(val) : String(val);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-50/70 overflow-y-auto p-4 select-none text-right smooth-scroll">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 mb-4">
        <span className="text-[11px] font-mono text-neutral-400 bg-neutral-200/60 px-2 py-0.5 rounded-full">
          v2.5 Cloud Sync
        </span>
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
          <span>الإعدادات والمزامنة</span>
          <Settings size={17} className="text-neutral-700" />
        </h2>
      </div>

      <div className="space-y-3.5">
        {/* Google Cloud Sync Card */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              user ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {user ? (
                <>
                  <CloudCheck size={12} />
                  <span>متصل بالسحابة</span>
                </>
              ) : (
                <>
                  <CloudOff size={12} />
                  <span>غير متصل</span>
                </>
              )}
            </span>
            <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <span>المزامنة السحابية عبر Google</span>
              <GoogleIcon size={14} />
            </div>
          </div>

          {user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-neutral-50 p-2.5 rounded-xl border border-neutral-150">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 p-1.5 rounded-lg font-medium transition"
                >
                  <LogOut size={13} />
                  <span>تسجيل الخروج</span>
                </button>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-bold text-neutral-900 text-xs">{user.displayName}</div>
                    <div className="text-[10px] text-neutral-500 font-sans">{user.email}</div>
                  </div>
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-neutral-200 shadow-2xs"
                    />
                  )}
                </div>
              </div>

              <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/60 leading-relaxed">
                ✓ تم تفعيل المزامنة السحابية بنجاح! يتم حفظ {notesCount} مناسبة على قاعدة البيانات السحابية، وستظهر تلقائياً على أي هاتف آخر عند تسجيل الدخول بنفس هذا الحساب.
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                سجّل الدخول بحساب Google لربط ومزامنة جميع مناسباتك ومواعيدك تلقائياً بين هاتفين أو أكثر في نفس الوقت.
              </p>

              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>جارٍ الربط بحساب Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon size={16} />
                    <span>تسجيل الدخول والربط بحساب Google</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* PWA App Installation Card (only shown when NOT installed; if installed, completely omitted) */}
        {!isStandalone && (
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                تطبيق ويب متقدم (PWA)
              </span>
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <span>تثبيت تطبيق مِيعاد على الشاشة الرئيسية</span>
                <Smartphone size={14} className="text-[#841c1c]" />
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                يمكنك تثبيت تطبيق مِيعاد (MIAD) على هاتفك لفتحه بضغطة واحدة من الشاشة الرئيسية كأي تطبيق أصلي، بملء الشاشة وبسرعة فائقة.
              </p>

              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 bg-[#841c1c] hover:bg-[#6e1414] active:scale-98 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition"
                >
                  <Download size={14} />
                  <span>تثبيت تطبيق مِيعاد الآن على جهازك</span>
                </button>
              ) : (
                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/70 text-[11px] text-neutral-700 space-y-1">
                  <div className="font-bold text-neutral-900 text-xs">طريقة الإضافة السريعة:</div>
                  <div className="text-neutral-600 leading-relaxed">
                    • <strong>آيفون (Safari):</strong> اضغط على زر المشاركة <span className="font-mono bg-neutral-200/70 px-1 py-0.5 rounded text-[10px]">⎋ Share</span> ثم اختر <strong>«إضافة إلى الصفحة الرئيسية (Add to Home Screen)»</strong>.
                  </div>
                  <div className="text-neutral-600 leading-relaxed">
                    • <strong>أندرويد (Chrome):</strong> اضغط على قائمة الثلاث نقاط <span className="font-mono bg-neutral-200/70 px-1 py-0.5 rounded text-[10px]">⋮</span> ثم اختر <strong>«تثبيت التطبيق (Install app)»</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Screenshot Preset Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-4 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onJumpToScreenshotDate}
              className="bg-[#841c1c] hover:bg-[#6e1414] active:scale-95 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs transition shrink-0"
            >
              عرض الآن
            </button>
            <div className="text-right">
              <div className="text-sm font-bold text-[#841c1c] flex items-center justify-end gap-1">
                <span>عرض شهر ذو الحجة ١٤٣٥ هـ</span>
                <Sparkles size={14} className="text-amber-600" />
              </div>
              <div className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                تطابق فوري مع التقويم المرفق (يوم عرفة وعيد الأضحى)
              </div>
            </div>
          </div>
        </div>

        {/* Umm al-Qura Adjustment Section */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600 font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded-md">
              {adjustment > 0 ? `+${adjustment}` : adjustment} يوم
            </span>
            <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <span>تعديل تقويم أم القرى (مزامنة الرؤية)</span>
              <Sliders size={15} className="text-[#841c1c]" />
            </label>
          </div>
          <p className="text-[11px] text-neutral-500 mb-3 leading-relaxed">
            يُمكن تقديم أو تأخير التاريخ بيوم أو يومين لمطابقة ثبوت رؤية الهلال في منطقتك.
          </p>

          <div className="grid grid-cols-5 gap-1.5 bg-neutral-100/80 p-1 rounded-xl">
            {[-2, -1, 0, 1, 2].map((adj) => (
              <button
                key={adj}
                type="button"
                onClick={() => onSetAdjustment(adj)}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  adjustment === adj
                    ? 'bg-[#841c1c] text-white shadow-2xs'
                    : 'text-neutral-700 hover:bg-neutral-200/80'
                }`}
              >
                {adj === 0 ? 'تلقائي' : `${adj > 0 ? '+' : ''}${num(adj)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Numerals Format */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <label className="block text-xs font-bold text-neutral-900 mb-2.5">
            نمط كتابة الأرقام
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onToggleDigits(true)}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                useArabicDigits
                  ? 'border-[#841c1c] bg-red-50/50 text-[#841c1c]'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {useArabicDigits && <Check size={15} className="stroke-[2.5]" />}
              <span className="font-bold text-sm">عربية مشرقية (١، ٢، ٣)</span>
            </button>
            <button
              onClick={() => onToggleDigits(false)}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                !useArabicDigits
                  ? 'border-[#841c1c] bg-red-50/50 text-[#841c1c]'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {!useArabicDigits && <Check size={15} className="stroke-[2.5]" />}
              <span className="font-bold text-sm font-sans">غربية (1, 2, 3)</span>
            </button>
          </div>
        </div>

        {/* About Card */}
        <div className="p-3.5 bg-neutral-100/70 rounded-2xl text-[11px] text-neutral-600 leading-relaxed border border-neutral-200/60">
          <div className="font-bold text-neutral-900 mb-1 flex items-center gap-1 justify-end">
            <span>MIAD — مِيعاد</span>
            <HelpCircle size={13} />
          </div>
          تطبيق مِيعاد (MIAD) للتقويم الهجري والميلادي وحفظ المناسبات والأحداث وفق حسابات تقويم أم القرى بدقة عالية.
        </div>
      </div>
    </div>
  );
};
