import { useState } from 'react';
import type { User } from 'firebase/auth';
import { LogOut, CloudCheck, CloudOff, Loader2 } from 'lucide-react';
import { signInWithGoogle, logOut } from '../services/firebase';

interface SyncAccountBarProps {
  user: User | null;
  isLoading: boolean;
  notesCount: number;
}

// Google "G" Colorful SVG Icon
export const GoogleIcon = ({
  size = 18,
  className = '',
}: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`inline-block ${className}`}
  >
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
    />
  </svg>
);

export const SyncAccountBar: React.FC<SyncAccountBarProps> = ({
  user,
  isLoading,
  notesCount,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setErrorMessage(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMessage('تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-neutral-50 px-3 py-1.5 border-b border-neutral-200/70 flex items-center justify-center text-xs text-neutral-500 gap-1.5">
        <Loader2 size={13} className="animate-spin text-neutral-600" />
        <span>جارٍ التحقق من المزامنة السحابية...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-b border-neutral-200/70 px-3 py-1.5 text-xs select-none">
      {user ? (
        /* Connected / Logged in state */
        <div className="flex items-center justify-between">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-red-600 hover:bg-red-50 px-2 py-0.5 rounded-lg transition"
            title="تسجيل الخروج"
          >
            <LogOut size={12} />
            <span>خروج</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-neutral-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate max-w-[130px] sm:max-w-[180px]">
                  {user.displayName || user.email}
                </span>
              </div>
              <div className="text-[10px] text-emerald-700 flex items-center justify-end gap-1">
                <CloudCheck size={11} className="text-emerald-600" />
                <span>المزامنة السحابية نشطة ({notesCount} مناسبة)</span>
              </div>
            </div>

            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-7 h-7 rounded-full border border-neutral-200 shadow-2xs"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200">
                {user.displayName ? user.displayName[0] : 'U'}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Not logged in / Call to action state */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 py-0.5">
          <div className="flex items-center gap-1.5 text-neutral-600 text-[11px]">
            <CloudOff size={13} className="text-amber-600 shrink-0" />
            <span>للمزامنة بين هاتفين: سجّل بحساب Google لحفظ مناسباتك سحابياً</span>
          </div>

          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition"
          >
            {isSigningIn ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>جارٍ الربط...</span>
              </>
            ) : (
              <>
                <GoogleIcon size={14} />
                <span>ربط بحساب Google</span>
              </>
            )}
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mt-1 text-[10px] text-red-600 text-center font-medium">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
