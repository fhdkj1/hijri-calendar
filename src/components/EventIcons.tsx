import React, { useState } from 'react';
import {
  Bell,
  Star,
  Gift,
  Cake,
  Briefcase,
  Heart,
  Plane,
  BookOpen,
  Car,
  Stethoscope,
  Moon,
  Pin,
  Clock,
  Sparkles,
  Flag,
  CheckCircle2,
  Smile,
  Baby,
  Laptop,
  GraduationCap,
  FileText,
  Compass,
  MapPin,
  Timer,
  Calendar,
  Wallet,
  ShoppingCart,
  CreditCard,
} from 'lucide-react';
import { KaabaIcon, BalloonIcon } from './CalendarIcons';

export interface IconCategory {
  id: string;
  icons: string[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  { id: 'reminder', icons: ['pin', 'bell', 'star', 'flag', 'check'] },
  { id: 'religious', icons: ['kaaba', 'moon', 'book'] },
  { id: 'celebration', icons: ['balloon', 'gift', 'cake', 'sparkles'] },
  { id: 'personal', icons: ['heart', 'hospital', 'smile', 'baby'] },
  { id: 'work', icons: ['briefcase', 'laptop', 'graduation', 'file'] },
  { id: 'travel', icons: ['plane', 'car', 'compass', 'map-pin'] },
  { id: 'time', icons: ['clock', 'timer', 'calendar'] },
  { id: 'finance', icons: ['wallet', 'cart', 'credit-card'] },
];

// Find which category an icon belongs to
export function getCategoryForIcon(iconId: string): IconCategory {
  const found = ICON_CATEGORIES.find((cat) => cat.icons.includes(iconId));
  return found || ICON_CATEGORIES[0];
}

interface EventIconRendererProps {
  icon?: string;
  size?: number;
  className?: string;
}

export const EventIconRenderer: React.FC<EventIconRendererProps> = ({
  icon = 'pin',
  size = 16,
  className = '',
}) => {
  switch (icon) {
    case 'kaaba':
      return <KaabaIcon size={size} className={className} />;
    case 'balloon':
      return <BalloonIcon size={size} className={className} />;
    case 'moon':
      return <Moon size={size} className={`text-indigo-600 fill-indigo-100 ${className}`} />;
    case 'book':
      return <BookOpen size={size} className={`text-teal-600 ${className}`} />;
    case 'bell':
      return <Bell size={size} className={`text-red-500 fill-red-50 ${className}`} />;
    case 'star':
      return <Star size={size} className={`text-amber-500 fill-amber-400 ${className}`} />;
    case 'flag':
      return <Flag size={size} className={`text-rose-500 fill-rose-100 ${className}`} />;
    case 'check':
      return <CheckCircle2 size={size} className={`text-emerald-600 fill-emerald-50 ${className}`} />;
    case 'gift':
      return <Gift size={size} className={`text-rose-500 ${className}`} />;
    case 'cake':
      return <Cake size={size} className={`text-purple-600 ${className}`} />;
    case 'sparkles':
      return <Sparkles size={size} className={`text-amber-500 ${className}`} />;
    case 'heart':
      return <Heart size={size} className={`text-red-500 fill-red-400 ${className}`} />;
    case 'hospital':
      return <Stethoscope size={size} className={`text-emerald-600 ${className}`} />;
    case 'smile':
      return <Smile size={size} className={`text-amber-500 ${className}`} />;
    case 'baby':
      return <Baby size={size} className={`text-pink-500 ${className}`} />;
    case 'briefcase':
      return <Briefcase size={size} className={`text-blue-600 ${className}`} />;
    case 'laptop':
      return <Laptop size={size} className={`text-slate-600 ${className}`} />;
    case 'graduation':
      return <GraduationCap size={size} className={`text-indigo-600 ${className}`} />;
    case 'file':
      return <FileText size={size} className={`text-neutral-600 ${className}`} />;
    case 'plane':
      return <Plane size={size} className={`text-sky-600 ${className}`} />;
    case 'car':
      return <Car size={size} className={`text-orange-600 ${className}`} />;
    case 'compass':
      return <Compass size={size} className={`text-cyan-600 ${className}`} />;
    case 'map-pin':
      return <MapPin size={size} className={`text-red-500 ${className}`} />;
    case 'clock':
      return <Clock size={size} className={`text-neutral-700 ${className}`} />;
    case 'timer':
      return <Timer size={size} className={`text-amber-600 ${className}`} />;
    case 'calendar':
      return <Calendar size={size} className={`text-blue-600 ${className}`} />;
    case 'wallet':
      return <Wallet size={size} className={`text-emerald-600 ${className}`} />;
    case 'cart':
      return <ShoppingCart size={size} className={`text-violet-600 ${className}`} />;
    case 'credit-card':
      return <CreditCard size={size} className={`text-indigo-600 ${className}`} />;
    case 'pin':
    default:
      return <Pin size={size} className={`text-amber-700 ${className}`} />;
  }
};

interface EventIconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconId: string) => void;
}

export const EventIconPicker: React.FC<EventIconPickerProps> = ({
  selectedIcon,
  onSelectIcon,
}) => {
  // Track which variant of each category is currently showing on that button
  const [categoryVariants, setCategoryVariants] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ICON_CATEGORIES.forEach((cat) => {
      const idx = cat.icons.indexOf(selectedIcon);
      initial[cat.id] = idx >= 0 ? idx : 0;
    });
    return initial;
  });

  const activeCategory = getCategoryForIcon(selectedIcon);

  // Handle click on category button:
  // If clicked category is already active, cycle to next variant in that category!
  // If different category, switch to that category's current variant.
  const handleCategoryClick = (cat: IconCategory) => {
    const currentVarIdx = categoryVariants[cat.id] || 0;

    if (activeCategory.id === cat.id) {
      // Clicked on the same category icon again: cycle to next variant of that type!
      const nextIdx = (currentVarIdx + 1) % cat.icons.length;
      setCategoryVariants((prev) => ({ ...prev, [cat.id]: nextIdx }));
      onSelectIcon(cat.icons[nextIdx]);
    } else {
      // First click: select current variant of this category
      onSelectIcon(cat.icons[currentVarIdx]);
    }
  };

  return (
    <div className="w-full select-none">
      {/* Strictly ONE SINGLE LINE of icons with NO labels */}
      <div className="w-full flex items-center justify-between gap-1.5 p-1.5 bg-neutral-100/80 rounded-2xl border border-neutral-200/80 overflow-x-auto smooth-scroll">
        {ICON_CATEGORIES.map((cat) => {
          const varIdx = categoryVariants[cat.id] || 0;
          const currentIcon = cat.icons[varIdx];
          const isCategorySelected = activeCategory.id === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`relative flex-1 min-w-[36px] max-w-[46px] h-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 ${
                isCategorySelected
                  ? 'bg-white shadow-xs ring-2 ring-[#841c1c] scale-105'
                  : 'bg-white/70 hover:bg-white text-neutral-600 hover:shadow-2xs'
              }`}
            >
              <EventIconRenderer icon={currentIcon} size={18} />

              {/* Cycle indicator dot on the active category icon */}
              {isCategorySelected && cat.icons.length > 1 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#841c1c] rounded-full ring-2 ring-white shadow-xs" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
