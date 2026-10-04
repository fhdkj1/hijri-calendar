/**
 * Hijri (Umm al-Qura) Calendar Calculation Engine
 * Supports Umm al-Qura conversion, day adjustments (-2 to +2),
 * Arabic numerals, Islamic holidays, and prayer times calculation.
 */

export interface HijriDateInfo {
  year: number;
  month: number;
  day: number;
  monthNameAr: string;
  monthNameEn: string;
  weekdayIndex: number; // 0 = Saturday, 1 = Sunday, ..., 6 = Friday
  weekdayAr: string;
  gregorianDate: Date;
  gregorianYear: number;
  gregorianMonth: number; // 1-12
  gregorianDay: number;
  gregorianMonthNameEn: string;
  gregorianMonthNameAr: string;
  events: IslamicEvent[];
}

export interface IslamicEvent {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: 'kaaba' | 'balloon' | 'crescent' | 'star' | 'book' | 'custom';
  description?: string;
  isHoliday?: boolean;
}

export interface UserNote {
  id: string;
  hijriYear: number;
  hijriMonth: number;
  hijriDay: number;
  title: string;
  details?: string;
  icon?: string;
  createdAt: string;
}

export const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

export const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

export const GREGORIAN_MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const GREGORIAN_MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// Weekdays starting from Sunday (الأحد)
export const ARABIC_WEEKDAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export const ENGLISH_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Convert Western digits (123) to Eastern Arabic digits (١٢٣)
export function toArabicNumerals(num: number | string): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => digits[parseInt(w, 10)]);
}

export interface MasterIslamicEvent {
  id: string;
  month: number; // 1 to 12 (or 0 for every month like white days)
  day: number; // 1 to 30
  monthNameAr: string;
  dayLabelAr: string;
  titleAr: string;
  titleEn: string;
  icon: 'kaaba' | 'balloon' | 'crescent' | 'star' | 'book' | 'custom';
  descriptionAr: string;
  isHoliday?: boolean;
}

/**
 * Perpetual Islamic fixed holidays and occasions across the entire Hijri calendar
 */
export const ALL_MASTER_ISLAMIC_EVENTS: MasterIslamicEvent[] = [
  {
    id: 'islamic-new-year',
    month: 1,
    day: 1,
    monthNameAr: 'محرم',
    dayLabelAr: '١ محرم',
    titleAr: 'رأس السنة الهجرية',
    titleEn: 'Islamic New Year',
    icon: 'crescent',
    descriptionAr: 'بداية السنة الهجرية الجديدة وفاتحة العام الهجري',
    isHoliday: true,
  },
  {
    id: 'tasua',
    month: 1,
    day: 9,
    monthNameAr: 'محرم',
    dayLabelAr: '٩ محرم',
    titleAr: 'تاسوعاء',
    titleEn: "Tasu'a",
    icon: 'star',
    descriptionAr: 'اليوم التاسع من شهر محرم ويستحب صيامه مع عاشوراء',
  },
  {
    id: 'ashura',
    month: 1,
    day: 10,
    monthNameAr: 'محرم',
    dayLabelAr: '١٠ محرم',
    titleAr: 'يوم عاشوراء',
    titleEn: 'Day of Ashura',
    icon: 'star',
    descriptionAr: 'اليوم العاشر من محرم، نجّى الله فيه موسى وقومه',
    isHoliday: true,
  },
  {
    id: 'mawlid',
    month: 3,
    day: 12,
    monthNameAr: 'ربيع الأول',
    dayLabelAr: '١٢ ربيع الأول',
    titleAr: 'المولد النبوي الشريف',
    titleEn: "Prophet's Birthday (Mawlid)",
    icon: 'crescent',
    descriptionAr: 'ذكرى مولد خاتم الأنبياء والمرسلين نبينا محمد ﷺ',
    isHoliday: true,
  },
  {
    id: 'isra-miraj',
    month: 7,
    day: 27,
    monthNameAr: 'رجب',
    dayLabelAr: '٢٧ رجب',
    titleAr: 'ذكرى الإسراء والمعراج',
    titleEn: "Isra and Mi'raj",
    icon: 'star',
    descriptionAr: 'معجزة الإسراء من المسجد الحرام للأقصى والمعراج إلى السماء',
    isHoliday: true,
  },
  {
    id: 'nisf-shaban',
    month: 8,
    day: 15,
    monthNameAr: 'شعبان',
    dayLabelAr: '١٥ شعبان',
    titleAr: 'ليلة النصف من شعبان',
    titleEn: "Night of Mid-Sha'ban",
    icon: 'star',
    descriptionAr: 'ليلة مباركة في منتصف شهر شعبان المعظم',
  },
  {
    id: 'ramadan-start',
    month: 9,
    day: 1,
    monthNameAr: 'رمضان',
    dayLabelAr: '١ رمضان',
    titleAr: 'بداية شهر رمضان المبارك',
    titleEn: 'First Day of Ramadan',
    icon: 'crescent',
    descriptionAr: 'أول أيام شهر الصيام والقيام وتنزيل القرآن الكريم',
    isHoliday: true,
  },
  {
    id: 'battle-of-badr',
    month: 9,
    day: 17,
    monthNameAr: 'رمضان',
    dayLabelAr: '١٧ رمضان',
    titleAr: 'ذكرى غزوة بدر الكبرى',
    titleEn: 'Battle of Badr',
    icon: 'star',
    descriptionAr: 'يوم الفرقان يوم التقى الجمعان في السابع عشر من رمضان',
  },
  {
    id: 'laylat-al-qadr',
    month: 9,
    day: 27,
    monthNameAr: 'رمضان',
    dayLabelAr: '٢٧ رمضان',
    titleAr: 'ليلة القدر (المتحرّاة)',
    titleEn: 'Laylat al-Qadr',
    icon: 'star',
    descriptionAr: 'ليلة مباركة خير من ألف شهر - أوتار العشر الأواخر',
  },
  {
    id: 'eid-fitr-1',
    month: 10,
    day: 1,
    monthNameAr: 'شوال',
    dayLabelAr: '١ شوال',
    titleAr: 'عيد الفطر المبارك',
    titleEn: 'Eid al-Fitr (Day 1)',
    icon: 'balloon',
    descriptionAr: 'أول أيام عيد الفطر المبارك وفرحة الصائمين',
    isHoliday: true,
  },
  {
    id: 'eid-fitr-2',
    month: 10,
    day: 2,
    monthNameAr: 'شوال',
    dayLabelAr: '٢ شوال',
    titleAr: 'ثاني أيام عيد الفطر',
    titleEn: 'Eid al-Fitr (Day 2)',
    icon: 'balloon',
    descriptionAr: 'ثاني أيام عيد الفطر السعيد',
    isHoliday: true,
  },
  {
    id: 'eid-fitr-3',
    month: 10,
    day: 3,
    monthNameAr: 'شوال',
    dayLabelAr: '٣ شوال',
    titleAr: 'ثالث أيام عيد الفطر',
    titleEn: 'Eid al-Fitr (Day 3)',
    icon: 'balloon',
    descriptionAr: 'ثالث أيام عيد الفطر المبارك',
    isHoliday: true,
  },
  {
    id: 'first-ten-dhulhijjah',
    month: 12,
    day: 1,
    monthNameAr: 'ذو الحجة',
    dayLabelAr: '١ ذو الحجة',
    titleAr: 'بداية العشر الأوائل من ذي الحجة',
    titleEn: 'First 10 Days of Dhu al-Hijjah',
    icon: 'crescent',
    descriptionAr: 'أفضل أيام الدنيا، العمل الصالح فيها أحب إلى الله',
  },
  {
    id: 'arafah',
    month: 12,
    day: 9,
    monthNameAr: 'ذو الحجة',
    dayLabelAr: '٩ ذو الحجة',
    titleAr: 'يوم عرفة',
    titleEn: 'Day of Arafah',
    icon: 'kaaba',
    descriptionAr: 'يوم الحج الأكبر ووقفة عرفات، وصيامه يكفّر سنتين',
    isHoliday: true,
  },
  {
    id: 'eid-adha',
    month: 12,
    day: 10,
    monthNameAr: 'ذو الحجة',
    dayLabelAr: '١٠ ذو الحجة',
    titleAr: 'عيد الأضحى المبارك (يوم النحر)',
    titleEn: 'Eid al-Adha',
    icon: 'balloon',
    descriptionAr: 'عيد الأضحى المبارك ويوم النحر وذبح الأضاحي للحجاج والمسلمين',
    isHoliday: true,
  },
  {
    id: 'tashreeq-11',
    month: 12,
    day: 11,
    monthNameAr: 'ذو الحجة',
    dayLabelAr: '١١ ذو الحجة',
    titleAr: 'أيام التشريق (اليوم الأول)',
    titleEn: 'Days of Tashreeq (Day 1)',
    icon: 'balloon',
    descriptionAr: 'أيام أكل وشرب وذكر لله تعالى واستمرار رمي الجمرات',
    isHoliday: true,
  },
  {
    id: 'tashreeq-12',
    month: 12,
    day: 12,
    monthNameAr: 'ذو الحجة',
    dayLabelAr: '١٢ ذو الحجة',
    titleAr: 'أيام التشريق (اليوم الثاني - النفر الأول)',
    titleEn: 'Days of Tashreeq (Day 2)',
    icon: 'balloon',
    descriptionAr: 'ثاني أيام التشريق ويوم النفر الأول لمن تعجّل',
    isHoliday: true,
  },
  {
    id: 'tashreeq-13',
    month: 12,
    day: 13,
    monthNameAr: 'ذو الحجة',
    dayLabelAr: '١٣ ذو الحجة',
    titleAr: 'أيام التشريق (اليوم الثالث - النفر الثاني)',
    titleEn: 'Days of Tashreeq (Day 3)',
    icon: 'balloon',
    descriptionAr: 'ختام مناسك الحج والنفر الثاني للمتأخرين',
    isHoliday: true,
  },
  {
    id: 'white-days',
    month: 0,
    day: 13,
    monthNameAr: 'كل الشهور',
    dayLabelAr: '١٣، ١٤، ١٥ من كل شهر',
    titleAr: 'صيام الأيام البيض',
    titleEn: 'White Days',
    icon: 'star',
    descriptionAr: 'يستحب صيام الأيام البيض ١٣ و١٤ و١٥ من كل شهر هجري',
  },
];

/**
 * Standard Islamic fixed holidays and occasions by Hijri month and day.
 * Excludes any event whose id is in excludedIds.
 */
export function getIslamicEvents(
  month: number,
  day: number,
  excludedIds: string[] = []
): IslamicEvent[] {
  const events: IslamicEvent[] = [];

  // Match month and day from master list
  ALL_MASTER_ISLAMIC_EVENTS.forEach((item) => {
    if (item.month === month && item.day === day) {
      if (!excludedIds.includes(item.id)) {
        events.push({
          id: item.id,
          titleAr: item.titleAr,
          titleEn: item.titleEn,
          icon: item.icon,
          isHoliday: item.isHoliday,
        });
      }
    }
  });

  // White days (الأيام البيض) on 13, 14, 15 of any month except during Eid al-Adha tashreeq
  if ((day === 13 || day === 14 || day === 15) && !(month === 12 && day === 13)) {
    if (!excludedIds.includes('white-days') && !excludedIds.includes(`white-day-${day}`)) {
      events.push({
        id: `white-day-${day}`,
        titleAr: `الأيام البيض (${day})`,
        titleEn: `White Day (${day})`,
        icon: 'star',
      });
    }
  }

  return events;
}

/**
 * Returns Hijri year, month, and day for any Gregorian date using Intl Umm al-Qura.
 * Supports manual adjustment (-2 to +2 days).
 */
export function getHijriFromGregorian(date: Date, adjustment = 0): { year: number; month: number; day: number } {
  const adjusted = new Date(date);
  if (adjustment !== 0) {
    adjusted.setDate(adjusted.getDate() + adjustment);
  }

  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  const parts = formatter.formatToParts(adjusted);
  let day = 1;
  let month = 1;
  let year = 1446;

  for (const part of parts) {
    if (part.type === 'day') day = parseInt(part.value, 10);
    if (part.type === 'month') month = parseInt(part.value, 10);
    if (part.type === 'year') year = parseInt(part.value, 10);
  }

  return { year, month, day };
}

/**
 * Finds the Gregorian start date (day 1) for a given Hijri year and month.
 */
export function findHijriMonthStart(targetYear: number, targetMonth: number, adjustment = 0): Date {
  const approxGYear = Math.floor(621.57 + targetYear * 0.97022);
  let cur = new Date(approxGYear, 0, 1, 12, 0, 0);

  // Iteratively converge
  for (let i = 0; i < 10; i++) {
    const h = getHijriFromGregorian(cur, adjustment);
    const mDiff = (targetYear - h.year) * 12 + (targetMonth - h.month);
    const dayDiff = mDiff * 29.53 + (1 - h.day);
    const roundedDays = Math.round(dayDiff);
    if (roundedDays === 0 && h.year === targetYear && h.month === targetMonth && h.day === 1) {
      return cur;
    }
    cur = new Date(cur.getTime() + roundedDays * 86400000);
  }

  // Fine tune local window (-5 to +5 days)
  for (let shift = -5; shift <= 5; shift++) {
    const test = new Date(cur.getTime() + shift * 86400000);
    const h = getHijriFromGregorian(test, adjustment);
    if (h.year === targetYear && h.month === targetMonth && h.day === 1) {
      return test;
    }
  }

  return cur;
}

/**
 * Returns weekday index: 0 = الأحد (Sun), 1 = الإثنين (Mon), ..., 5 = الجمعة (Fri), 6 = السبت (Sat)
 */
export function getArabicWeekdayIndex(date: Date): number {
  // JS getDay(): 0 = Sun (الأحد), 1 = Mon, ..., 5 = Fri (الجمعة), 6 = Sat (السبت)
  return date.getDay();
}

/**
 * Generates the full month calendar data for a given Hijri year and month.
 */
export function getHijriMonthCalendar(
  targetYear: number,
  targetMonth: number,
  adjustment = 0,
  excludedEventIds: string[] = []
) {
  const startDate = findHijriMonthStart(targetYear, targetMonth, adjustment);
  const days: HijriDateInfo[] = [];

  let curDate = new Date(startDate);

  while (true) {
    const h = getHijriFromGregorian(curDate, adjustment);
    if (h.month !== targetMonth || h.year !== targetYear) {
      break;
    }

    const weekdayIndex = getArabicWeekdayIndex(curDate);
    const gYear = curDate.getFullYear();
    const gMonth = curDate.getMonth() + 1;
    const gDay = curDate.getDate();

    days.push({
      year: h.year,
      month: h.month,
      day: h.day,
      monthNameAr: HIJRI_MONTHS_AR[h.month - 1],
      monthNameEn: HIJRI_MONTHS_EN[h.month - 1],
      weekdayIndex,
      weekdayAr: ARABIC_WEEKDAYS[weekdayIndex],
      gregorianDate: new Date(curDate),
      gregorianYear: gYear,
      gregorianMonth: gMonth,
      gregorianDay: gDay,
      gregorianMonthNameEn: GREGORIAN_MONTHS_EN[gMonth - 1],
      gregorianMonthNameAr: GREGORIAN_MONTHS_AR[gMonth - 1],
      events: getIslamicEvents(h.month, h.day, excludedEventIds),
    });

    curDate = new Date(curDate.getTime() + 86400000);
  }

  const startWeekday = days[0].weekdayIndex; // 0 to 6
  const totalDays = days.length; // 29 or 30

  return {
    year: targetYear,
    month: targetMonth,
    monthNameAr: HIJRI_MONTHS_AR[targetMonth - 1],
    monthNameEn: HIJRI_MONTHS_EN[targetMonth - 1],
    days,
    startWeekday,
    totalDays,
  };
}

/**
 * Calculates prayer times for a given date and coordinates (default: Makkah al-Mukarramah).
 */
export function calculatePrayerTimes(
  date: Date,
  latitude = 21.4225,
  longitude = 39.8262,
  timezoneOffsetHours = 3
) {
  // Simplified astronomical calculation for prayer times
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Sun declination and equation of time
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81)) * (Math.PI / 180);

  const latRad = latitude * (Math.PI / 180);

  // Solar noon
  const noon = 12 + (timezoneOffsetHours - longitude / 15) - eot / 60;

  // Helper for sun angle
  const getHourAngle = (angleDeg: number) => {
    const angleRad = angleDeg * (Math.PI / 180);
    const cosHA = (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(declination)) /
      (Math.cos(latRad) * Math.cos(declination));
    if (cosHA > 1 || cosHA < -1) return 0;
    return Math.acos(cosHA) * (180 / Math.PI) / 15;
  };

  // Umm al-Qura standard: Fajr at 18.5 degrees, Isha is 90 mins after Maghrib (120 mins in Ramadan)
  const fajrHA = getHourAngle(-18.5);
  const sunriseHA = getHourAngle(-0.833);
  
  // Asr: shadow length + 1 (Shafi'i/Hanbali/Maliki standard)
  const asrAltRad = Math.atan(1 / (1 + Math.tan(Math.abs(latRad - declination))));
  const asrHA = getHourAngle(asrAltRad * (180 / Math.PI));

  const formatHours = (hVal: number) => {
    let normalized = (hVal + 24) % 24;
    const hours = Math.floor(normalized);
    const minutes = Math.floor((normalized - hours) * 60);
    const period = hours >= 12 ? 'م' : 'ص';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const fajrTime = noon - fajrHA;
  const sunriseTime = noon - sunriseHA;
  const dhuhrTime = noon + (2 / 60); // 2 minutes after zenith
  const asrTime = noon + asrHA;
  const maghribTime = noon + sunriseHA + (2 / 60);
  const ishaTime = maghribTime + 1.5; // 90 minutes after Maghrib

  return {
    fajr: formatHours(fajrTime),
    sunrise: formatHours(sunriseTime),
    dhuhr: formatHours(dhuhrTime),
    asr: formatHours(asrTime),
    maghrib: formatHours(maghribTime),
    isha: formatHours(ishaTime),
  };
}
