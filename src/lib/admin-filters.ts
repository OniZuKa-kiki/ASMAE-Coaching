export const adminFilterLabels = {
  search: "بحث",
  sort: "ترتيب العرض",
  submit: "تطبيق الفلاتر",
  sortNewest: "الأحدث أولًا",
  sortOldest: "الأقدم أولًا",
  sortTitleAsc: "العنوان أ→ي",
  users: {
    title: "تصفية العملاء",
    searchPlaceholder: "ابحث بالاسم أو البريد الإلكتروني...",
  },
  bookings: {
    title: "تصفية الحجوزات",
    searchPlaceholder: "ابحث بالعميلة، البريد أو الخدمة...",
  },
  courses: {
    title: "تصفية الدورات",
    searchPlaceholder: "ابحث بالعنوان أو الرابط...",
  },
  podcasts: {
    title: "تصفية البودكاست",
    searchPlaceholder: "ابحث بالعنوان أو الرابط...",
  },
  blog: {
    title: "تصفية المقالات",
    searchPlaceholder: "ابحث بالعنوان، التصنيف أو الرابط...",
  },
  payments: {
    title: "تصفية الفواتير والمدفوعات",
    searchPlaceholder: "ابحث برقم الفاتورة، العميلة، البريد أو الخدمة...",
  },
  coupons: {
    title: "تصفية القسائم",
    searchPlaceholder: "ابحث برمز القسيمة...",
  },
  intakeForms: {
    title: "تصفية الاستبيانات",
    searchPlaceholder: "ابحث بالاسم أو البريد الإلكتروني...",
  },
} as const;

export const adminFilterSubmitClassName =
  "rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors w-full";
