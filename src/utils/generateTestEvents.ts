import type { UserNote } from './hijriCalendar';

interface EventTemplate {
  title: string;
  details: string;
  icon: string;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  // Health & Medical
  { title: 'موعد مراجعة الأسنان', details: 'تنظيف دوري ومتابعة تقويم الأسنان', icon: 'hospital' },
  { title: 'فحص طبي شامل', details: 'تحاليل مخبرية سنوية وفحص عام', icon: 'hospital' },
  { title: 'جلسة علاج طبيعي', details: 'متابعة فقرات الظهر والتأهيل الحركي', icon: 'heart' },
  { title: 'استشارة طب الأطفال', details: 'متابعة النمو والتطعيمات الدورية', icon: 'baby' },
  { title: 'فحص النظر والعيون', details: 'قياس درجات النظر وتجديد العدسات', icon: 'smile' },
  { title: 'استشارة طبيب جلدية', details: 'متابعة العناية بالبشرة والحساسية', icon: 'hospital' },

  // Work, Career & Tech
  { title: 'اجتماع مجلس الإدارة', details: 'مناقشة خطة النمو والموازنة الربع سنوية', icon: 'briefcase' },
  { title: 'تسليم النسخة التجريبية (Demo)', details: 'عرض المشروع والميزات الجديدة للعميل', icon: 'laptop' },
  { title: 'مقابلة توظيف مهندس برمجيات', details: 'تقييم المهارات التقنية وحل المشكلات', icon: 'briefcase' },
  { title: 'ورشة عمل هندسة الحوسبة السحابية', details: 'أفضل ممارسات بنية السحابة وأمن المعلومات', icon: 'graduation' },
  { title: 'تقديم التقرير السنوي للإنجازات', details: 'استعراض مؤشرات الأداء الرئيسية KPIs', icon: 'file' },
  { title: 'مراجعة وتوقيع اتفاقية الشراكة', details: 'مراجعة الشروط القانونية وتوقيع العقد', icon: 'file' },
  { title: 'اجتماع تخطيط سبرنت (Sprint)', details: 'توزيع المهام وجدولة أولويات التطوير', icon: 'laptop' },

  // Family, Social & Celebrations
  { title: 'عقد قران مبارك', details: 'حفل عائلي بهيج ودعوة الأهل والأصدقاء', icon: 'sparkles' },
  { title: 'حفل تخرج جامعي', details: 'الاحتفال بنيل شهادة البكالوريوس مع مرتبة الشرف', icon: 'graduation' },
  { title: 'اجتماع العائلة الشهري', details: 'لقاء الأرحام في استراحة العائلة وتبادل الأحاديث', icon: 'smile' },
  { title: 'ذكرى عائلية خاصة', details: 'عشاء احتفالي وتقديم الهدايا التذكارية', icon: 'heart' },
  { title: 'استقبال وتبريكات بمولود جديد', details: 'زيارة وتقديم التهاني للأسرة الكريمة', icon: 'baby' },
  { title: 'حفل نجاح وتفوق الأبناء', details: 'تكريم المتفوقين في نهاية الفصل الدراسي', icon: 'cake' },
  { title: 'شراء هدايا ومفاجآت', details: 'تجهيز هدايا المناسبات الخاصة وتغليفها', icon: 'gift' },

  // Travel, Trips & Outdoors
  { title: 'رحلة أداء مناسك العمرة', details: 'حجز قطار الحرمين وفندق الإقامة بجوار الحرم', icon: 'kaaba' },
  { title: 'رحلة سفر سياحية عائلية', details: 'إجازة في ربوع الطبيعة واستكشاف المعالم', icon: 'plane' },
  { title: 'رحلة برية وتخييم (كشتة)', details: 'تجهيز معدات التخييم والشواء في الأجواء الشتوية', icon: 'compass' },
  { title: 'حجز وتأكيد تذاكر الطيران', details: 'رحلة السفر المؤكدة وإصدار بطاقات صعود الطائرة', icon: 'plane' },
  { title: 'تجديد جواز السفر', details: 'سداد الرسوم عبر أبشر وتوصيل الوثيقة بالبريد', icon: 'map-pin' },
  { title: 'صيانة دورية للسيارة', details: 'فحص الإطارات وتغيير الزيت وفحص المكابح', icon: 'car' },

  // Finance, Shopping & Banking
  { title: 'إيداع وتوزيع الراتب الشهري', details: 'سداد الالتزامات والتحويل إلى حساب الادخار', icon: 'wallet' },
  { title: 'سداد فواتير الخدمات العامة', details: 'سداد فواتير الكهرباء والمياه والإنترنت', icon: 'credit-card' },
  { title: 'التسوق وشراء المستلزمات الشهرية', details: 'شراء المواد الغذائية والاحتياجات المنزلية', icon: 'cart' },
  { title: 'سداد قسط التمويل الشهري', details: 'الخصم التلقائي المجدول من الحساب البنكي', icon: 'wallet' },
  { title: 'مراجعة أداء المحفظة الاستثمارية', details: 'متابعة العوائد وصناديق الاستثمار والأسهم', icon: 'wallet' },

  // Religious, Personal & Routine Reminders
  { title: 'صيام يوم الخميس المبارك', details: 'سنة نبوية حميدة ترفع فيها الأعمال', icon: 'star' },
  { title: 'قراءة سورة الكهف والذكر', details: 'سنن يوم الجمعة المبارك وكثرة الصلاة على النبي', icon: 'book' },
  { title: 'صيانة وتكييف المنزل', details: 'تنظيف الفلاتر والتأكد من كفاءة الأجهزة', icon: 'clock' },
  { title: 'تجديد اشتراك النادي الرياضي', details: 'متابعة اللياقة البدنية والتمارين الأسبوعية', icon: 'check' },
  { title: 'تجديد رخصة القيادة', details: 'إجراء الفحص الطبي المعتمد وتجديد الوثيقة', icon: 'timer' },
  { title: 'قراءة في كتاب السيرة النبوية', details: 'تخصيص ساعة يومية للمطالعة وتنمية المعرفة', icon: 'book' },
  { title: 'موعد تغيير فلتر مياه الشرب', details: 'الصيانة الدورية لمحطة التنقية المنزلية', icon: 'clock' },
  { title: 'متابعة خطة حفظ القرآن الكريم', details: 'تسميع ومراجعة الأجزاء المقررة أسبوعياً', icon: 'star' },
  { title: 'جلسة تدريب على مهارات جديدة', details: 'دورة تدريبية مكثفة عبر الإنترنت', icon: 'flag' },
  { title: 'تحديث النسخ الاحتياطي للبيانات', details: 'حفظ وتأمين الملفات والصور على السحابة المشفرة', icon: 'pin' },
  { title: 'موعد دفع رسوم الدراسة', details: 'سداد الرسوم الدراسية للفصل الجديد', icon: 'bell' },
  { title: 'موعد فحص بطارية السيارة', details: 'التأكد من جهد البطارية ونظام الشحن', icon: 'car' },
];

/**
 * Generates exactly 1,500 realistic, well-distributed test events
 * across different Hijri years, months, and days for benchmarking system performance.
 */
export function generate1500TestEvents(): UserNote[] {
  const events: UserNote[] = [];
  const totalTarget = 1500;

  // Years to distribute events across (1434 AH to 1448 AH: 15 years)
  const years = [
    1434, 1435, 1436, 1437, 1438, 1439, 1440,
    1441, 1442, 1443, 1444, 1445, 1446, 1447, 1448
  ];

  // Specific high-density years: 1435 (reference year), 1446, 1447 (current years)
  let count = 0;

  while (count < totalTarget) {
    const yearIndex = count % years.length;
    const year = years[yearIndex];

    // Distribute across all 12 months
    const month = (Math.floor(count / years.length) % 12) + 1;

    // Distribute across days 1 to 29 (safe for all Hijri months)
    const day = (Math.floor(count * 7) % 29) + 1;

    // Select template cyclically
    const templateIndex = (count * 13 + day) % EVENT_TEMPLATES.length;
    const tmpl = EVENT_TEMPLATES[templateIndex];

    // Deterministic timestamp
    const approxGYear = Math.floor(621.57 + year * 0.97022);
    const dateStr = new Date(approxGYear, month - 1, day, 10, 0, 0).toISOString();

    events.push({
      id: `perf-test-${count + 1}`,
      hijriYear: year,
      hijriMonth: month,
      hijriDay: day,
      title: `${tmpl.title} #${count + 1}`,
      details: `${tmpl.details} - مناسبة مجدولة في ${day}/${month}/${year} هـ`,
      icon: tmpl.icon,
      createdAt: dateStr,
    });

    count++;
  }

  return events;
}
