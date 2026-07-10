export const siteConfig = {
  name: "ASMAE",
  tagline: "كوتشينغ",
  motto: "تجاوز • توازن • ازدهار",
  description:
    "مرافقة شخصية تساعدكِ على تجاوز التحديات، واستعادة توازنكِ، وتحقيق أهدافكِ بثقة ووضوح.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  contact: {
    email: "contact@asmae-coaching.fr",
    phone: "+33 6 00 00 00 00",
    whatsapp: "https://wa.me/33600000000",
    instagram: "https://instagram.com/asmae_coaching",
  },
};

export const navigation = [
  { label: "الرئيسية", href: "/" },
  { label: "من أنا", href: "/about" },
  { label: "الكوتشينغ", href: "/services" },
  { label: "احجز جلسة", href: "/booking" },
  { label: "البودكاست", href: "/podcasts" },
  { label: "الدورات", href: "/courses" },
  { label: "المدونة", href: "/blog" },
  { label: "آراء العميلات", href: "/testimonials" },
  { label: "تواصل", href: "/contact" },
];

/** Liens principaux affichés dans la navbar desktop */
export const primaryNavigation = [
  { label: "الرئيسية", href: "/" },
  { label: "الكوتشينغ", href: "/services" },
  { label: "الدورات", href: "/courses" },
  { label: "تواصل", href: "/contact" },
];

/** Liens dans le menu déroulant « Plus » */
export const moreNavigation = [
  { label: "من أنا", href: "/about" },
  { label: "احجز جلسة", href: "/booking" },
  { label: "البودكاست", href: "/podcasts" },
  { label: "المدونة", href: "/blog" },
  { label: "آراء العميلات", href: "/testimonials" },
];

export const footerBrowseLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "من أنا", href: "/about" },
  { label: "الكوتشينغ", href: "/services" },
  { label: "احجز جلسة", href: "/booking" },
  { label: "البودكاست", href: "/podcasts" },
  { label: "الدورات", href: "/courses" },
  { label: "الموارد", href: "/testimonials" },
  { label: "المدونة", href: "/blog" },
];

export const problemsSection = {
  title: "هل تجدين نفسك في إحدى هذه الحالات؟",
  subtitle: "أرافقكِ لتجاوز أكثر التحديات التي قد تعيق تقدمكِ.",
};

export const methodSection = {
  title: "منهجيتي",
  subtitle: "مرافقة عملية لتحقيق نتائج مستدامة",
};

export const testimonialsSection = {
  title: "آراء العميلات",
  subtitle:
    "الثقة أساس كل رحلة كوتشينغ، وهذه بعض تجارب من رافقتهن في رحلتهن نحو التغيير.",
};

export const testimonialsPageContent = {
  title: "آراء العميلات",
  subtitle:
    "الثقة أساس كل رحلة كوتشينغ، وهذه بعض تجارب من رافقتهن في رحلتهن نحو التغيير.",
  ctaTitle: "هل ستكونين صاحبة قصة النجاح التالية؟",
  ctaSubtitle:
    "ابدئي رحلتكِ نحو التغيير، وانضمي إلى من استطعن تحقيق أهدافهن واستعادة التوازن في حياتهن.",
  ctaButton: "احجزي جلسة",
};

export const finalCtaSection = {
  title: "هل أنتِ مستعدة لبدء رحلة التغيير؟",
  subtitle:
    "احجزي مكالمة تعارف مجانية لمدة 20 دقيقة لنتعرف إلى احتياجاتكِ ونرى كيف يمكنني مساعدتكِ.",
  primaryLabel: "احجزي مكالمة تعارف",
  secondaryLabel: "تواصلي معي",
};

export const servicesPageContent = {
  title: "خدمات الكوتشينغ",
  subtitle:
    "مرافقة شخصية مصممة لتلبية احتياجاتكِ ومواكبة أهدافكِ وفق إيقاعكِ الخاص.",
  bookNowLabel: "احجزي الآن",
  learnMoreLabel: "اعرفي المزيد",
  eyebrow: "خدمات الكوتشينغ",
};

export const coursesPageContent = {
  title: "دورات تدريبية عبر الإنترنت",
  subtitle:
    "برامج تدريبية متكاملة تتيح لكِ التعلم بالوتيرة التي تناسبكِ، وتضم فيديوهات تعليمية، وتمارين تطبيقية، وموارد قابلة للتنزيل.",
  viewProgramLabel: "عرض البرنامج ←",
  ctaTitle: "لستِ متأكدة من الدورة الأنسب لكِ؟",
  ctaSubtitle:
    "احجزي مكالمة تعارف مجانية لنتحدث عن أهدافكِ، ونساعدكِ في اختيار البرنامج الذي يناسب احتياجاتكِ.",
  ctaButton: "احجزي مكالمة تعارف",
  filters: {
    searchLabel: "بحث",
    searchPlaceholder: "ابحثي في الدورات...",
    sortLabel: "ترتيب العرض",
    sortDefault: "الترتيب الافتراضي",
    sortPriceAsc: "السعر: من الأقل إلى الأعلى",
    sortPriceDesc: "السعر: من الأعلى إلى الأقل",
    sortTitle: "العنوان أ→ي",
    noResults: "لا توجد دورات تطابق البحث.",
    resultsCount: (count: number) =>
      count === 1 ? "دورة واحدة" : `${count} دورات`,
  },
};

export const contactPageContent = {
  title: "تواصل معي",
  subtitle:
    "هل لديكِ استفسار أو ترغبين في معرفة المزيد عن خدماتي؟ يسعدني التواصل معكِ والإجابة عن جميع أسئلتكِ.",
  channelsTitle: "لنبقَ على تواصل",
  channelsSubtitle: "اختاري وسيلة التواصل التي تناسبكِ.",
  formTitle: "أرسلي رسالة",
  messagePlaceholder: "اكتبي رسالتكِ هنا...",
  submitLabel: "إرسال",
  submittingLabel: "جارٍ الإرسال...",
};

export const bookingPageContent = {
  title: "احجزي جلسة",
  subtitle:
    "اختاري الخدمة التي تناسبكِ، وحددي الموعد المناسب، وأكملي عملية الدفع عبر الإنترنت، لتتلقين تلقائيًا رابط الجلسة عبر الفيديو.",
  steps: {
    service: "الخدمة",
    schedule: "الموعد",
    intent: "استبيان قصير",
    payment: "الدفع",
  },
  chooseServiceTitle: "اختاري الخدمة المناسبة",
  chooseScheduleTitle: "حددي الموعد المناسب",
  intentTitle: "لماذا تودين حجز هذه الجلسة؟",
  intentSubtitle:
    "اختياركِ يساعدني على الاستعداد لمرافقتكِ بشكل أفضل قبل موعدنا.",
  intentRequired: "اختاري سبباً واحداً للمتابعة.",
  intentOtherPlaceholder: "شاركي باختصار ما يدفعكِ لحجز هذه الجلسة...",
  intentReasons: {
    stress: "التوتر والضغط",
    confidence: "الثقة بالنفس",
    couple: "العلاقات والزوجية",
    career: "العمل والمهنة",
    other: "أخرى",
  },
  paymentTitle: "دفع آمن",
  nextLabel: "التالي",
  backLabel: "رجوع",
  noServices: "لا توجد خدمات متاحة حالياً. عودي قريبًا.",
  noSlots: "لا توجد مواعيد متاحة في هذا اليوم.",
  signInPrompt: "سجّلي الدخول لإتمام حجزكِ.",
  signInButton: "تسجيل الدخول",
  paymentFootnote:
    "ستتلقين تلقائيًا بريد تأكيد مع رابط الجلسة عبر الفيديو بعد الدفع.",
  payingLabel: "جاري التحويل...",
  payButton: (amount: string) => `ادفعي ${amount}`,
};

export const podcastsPageContent = {
  title: "البودكاست",
  subtitle:
    "حلقات صوتية ملهمة تساعدكِ على تطوير ذاتكِ، وتعزيز وعيكِ، والمضي قدمًا في رحلتكِ نحو التغيير بالوتيرة التي تناسبكِ.",
  freeSection: {
    title: "بودكاست مجاني",
    subtitle: "متاح للجميع",
  },
  premiumSection: {
    title: "بودكاست حصري",
    subtitle: "متاح للأعضاء والعملاء",
  },
  premiumBadge: "حصري",
  filters: {
    searchLabel: "بحث",
    searchPlaceholder: "ابحثي في الحلقات...",
    typeLabel: "النوع",
    typeAll: "جميع الحلقات",
    typeFree: "مجاني",
    typePremium: "حصري",
    sortLabel: "ترتيب العرض",
    sortDefault: "الترتيب الافتراضي",
    sortNewest: "الأحدث أولًا",
    sortOldest: "الأقدم أولًا",
    sortLongest: "الأطول مدة",
    sortShortest: "الأقصر مدة",
    sortTitle: "العنوان أ→ي",
    noResults: "لا توجد حلقات تطابق البحث.",
    resultsCount: (count: number) =>
      count === 1 ? "حلقة واحدة" : `${count} حلقات`,
  },
  premiumContentLabel: "محتوى حصري",
  premiumLockedTitle: "محتوى مخصص للأعضاء",
  premiumLockedMessage:
    "احجزي جلسة أو اشتري دورة تدريبية لفتح هذا البودكاست الحصري.",
  audioComingSoon: "الصوت متاح قريبًا.",
  continueListening: {
    title: "متابعة الاستماع",
    subtitle: "استأنفي حلقاتكِ من حيث توقفتِ.",
    resumeButton: "متابعة",
    resumeFrom: (time: string) => `متابعة الاستماع من ${time}`,
  },
};

export const blogPageContent = {
  title: "المدونة",
  subtitle:
    "مقالات ونصائح وأفكار عملية تساعدكِ على تطوير ذاتكِ، وتعزيز وعيكِ، والمضي بثقة في رحلة التغيير.",
  emptyMessage: "لا توجد مقالات متاحة حالياً.",
  filters: {
    searchLabel: "بحث",
    searchPlaceholder: "ابحثي في المقالات...",
    categoryLabel: "التصنيف",
    categoryAll: "جميع التصنيفات",
    sortLabel: "ترتيب العرض",
    sortNewest: "الأحدث أولًا",
    sortOldest: "الأقدم أولًا",
    sortTitle: "العنوان أ→ي",
    noResults: "لا توجد مقالات تطابق البحث.",
    resultsCount: (count: number) =>
      count === 1 ? "مقالة واحدة" : `${count} مقالات`,
  },
};

export const dashboardContent = {
  spaceTitle: "مساحتي",
  backToSite: "العودة إلى الموقع",
  welcome: (firstName?: string | null) =>
    firstName ? `مرحبًا، ${firstName}` : "مرحبًا",
  overviewSubtitle:
    "كل ما تحتاجينه من جلسات، ودورات، ومكتبة في مكان واحد.",
  stats: {
    upcomingSessions: "الجلسات القادمة",
    activeCourses: "الدورات النشطة",
    currentGoals: "الأهداف الحالية",
    payments: "المدفوعات",
  },
  noUpcomingSessions: "لا توجد جلسات قادمة",
  bookNextSession:
    "احجزي جلستكِ القادمة وابدئي رحلتكِ نحو التغيير.",
  bookSession: "احجزي جلسة",
  upcomingSessionsTitle: "الجلسات القادمة",
  joinSession: "الانضمام إلى الجلسة عبر الفيديو",
  bookingsTitle: "جلساتي",
  bookingsUpcoming: "القادمة",
  bookingsHistory: "السجل",
  noScheduledSessions: "لا توجد جلسات قادمة",
  sessionLink: "رابط الجلسة عبر الفيديو",
  bookingsHistoryEmpty: "سيظهر سجلكِ هنا بعد جلستكِ الأولى.",
  bookingsCalendarLabel: "تقويم الجلسات",
  bookingsNoSessionsDay: "لا توجد جلسات في هذا اليوم.",
  sessionReview: {
    promptTitle: "كيف كانت جلستكِ؟",
    promptSubtitle: "تقييمكِ يساعدنا على تحسين المرافقة وتخصيص تجربتكِ.",
    ratingLabel: "التقييم",
    commentLabel: "تعليق (اختياري)",
    commentPlaceholder: "شاركي ما أعجبكِ أو ما يمكن تحسينه...",
    submit: "إرسال التقييم",
    submittedLabel: "تقييمكِ",
    leaveReview: "قيّمي الجلسة",
    pendingTitle: "بانتظار تقييمكِ",
  },
  courses: {
    subtitle: "تابعي تقدمكِ، واكتشفي الدورات الجديدة، وارجعي بسهولة إلى محتواكِ.",
    stats: {
      purchased: "مشترياتي",
      inProgress: "قيد التقدم",
      completed: "مكتملة",
      available: "متاحة للشراء",
    },
    searchPlaceholder: "ابحثي في الدورات...",
    sectionLabel: "العرض",
    sectionAll: "جميع الدورات",
    sectionPurchased: "مشترياتي",
    sectionAvailable: "للشراء",
    progressLabel: "التقدم",
    progressAll: "كل الحالات",
    progressNotStarted: "لم تبدئي بعد",
    progressInProgress: "قيد المتابعة",
    progressCompleted: "مكتملة",
    sortLabel: "ترتيب العرض",
    sortRecent: "الأحدث شراءً",
    sortTitle: "العنوان أ→ي",
    sortProgressDesc: "الأكثر تقدماً",
    sortProgressAsc: "الأقل تقدماً",
    sortPriceAsc: "السعر: من الأقل",
    sortPriceDesc: "السعر: من الأعلى",
    resultsCount: (count: number) =>
      count === 1 ? "دورة واحدة" : `${count} دورات`,
    noResults: "لا توجد دورات تطابق البحث.",
    noPurchases: "لم تشتري أي دورة تدريبية بعد.",
    discoverCourses: "اكتشفي الدورات التدريبية",
    progressLabelShort: "التقدم",
    lessonsCompleted: (done: number, total: number) =>
      `${done}/${total} دروس مكتملة`,
    lastLesson: (title: string) => `آخر درس: ${title}`,
    notStartedYet: "لم تُكمِلي أي درس بعد",
    progressNote: "يُحسب تلقائيًا وفق الدروس المعلّمة كمكتملة في مكتبتي.",
    continue: "متابعة",
    viewProgram: "عرض البرنامج",
    badgePurchased: "مشترياتي",
    badgeAvailable: "للشراء",
    badgeCompleted: "مكتملة",
    badgeInProgress: "قيد التقدم",
    badgeNotStarted: "لم تبدئي",
  },
  journal: {
    searchPlaceholder: "ابحثي في يومياتكِ...",
    moodLabel: "المزاج",
    moodAll: "جميع المزاجات",
    moodNone: "بدون مزاج",
    sortLabel: "ترتيب العرض",
    sortRecent: "الأحدث",
    sortOldest: "الأقدم",
    resultsCount: (count: number) =>
      count === 1 ? "ملاحظة واحدة" : `${count} ملاحظات`,
    noResults: "لا توجد ملاحظات تطابق البحث.",
    edit: "تعديل",
  },
  goals: {
    searchPlaceholder: "ابحثي في أهدافكِ...",
    statusLabel: "الحالة",
    statusAll: "جميع الأهداف",
    statusActive: "قيد المتابعة",
    statusCompleted: "مكتملة",
    dateLabel: "التاريخ",
    dateAll: "الكل",
    dateWithTarget: "بتاريخ مستهدف",
    dateWithoutTarget: "بدون تاريخ",
    sortLabel: "ترتيب العرض",
    sortRecent: "الأحدث تحديثاً",
    sortTitle: "العنوان أ→ي",
    sortProgressDesc: "الأكثر تقدماً",
    sortProgressAsc: "الأقل تقدماً",
    sortTargetDate: "التاريخ المستهدف",
    resultsCount: (count: number) =>
      count === 1 ? "هدف واحد" : `${count} أهداف`,
    noResults: "لا توجد أهداف تطابق البحث.",
    edit: "تعديل",
    progressLabel: "التقدم",
    completedBadge: "مكتمل",
    targetDate: (date: string) => `التاريخ المستهدف: ${date}`,
    noTargetDate: "بدون تاريخ مستهدف",
  },
  notifications: {
    subtitle: "تابعي تذكيرات الجلسات، تقييماتكِ، ودوراتكِ في مكان واحد.",
    searchPlaceholder: "ابحثي في الإشعارات...",
    statusLabel: "الحالة",
    statusAll: "الكل",
    statusUnread: "غير مقروءة",
    statusRead: "مقروءة",
    typeLabel: "النوع",
    typeAll: "جميع الأنواع",
    sortLabel: "ترتيب العرض",
    sortRecent: "الأحدث",
    sortOldest: "الأقدم",
    markAllRead: "تحديد الكل كمقروء",
    markRead: "تحديد كمقروء",
    open: "فتح",
    empty: "لا توجد إشعارات حالياً.",
    noResults: "لا توجد إشعارات تطابق البحث.",
    resultsCount: (count: number) =>
      count === 1 ? "إشعار واحد" : `${count} إشعارات`,
    unreadCount: (count: number) =>
      count === 1 ? "إشعار غير مقروء" : `${count} إشعارات غير مقروءة`,
    types: {
      BOOKING_CONFIRMED: "تأكيد جلسة",
      BOOKING_REMINDER: "تذكير جلسة",
      SESSION_REVIEW: "تقييم جلسة",
      COURSE_PURCHASE: "شراء دورة",
      GOAL_DEADLINE: "موعد هدف",
      PODCAST_CONTINUE: "متابعة بودكاست",
      SYSTEM: "نظام",
    },
  },
};

export const libraryPageContent = {
  subtitle: "هنا تجدين فيديوهات، تمارين، تنزيلات وصوتيات جميع دوراتكِ.",
  selectedCourseLabel: "دورة تدريبية",
  selectedCourseFallback: "دورة تدريبية",
  noCourseContent: "لا يوجد محتوى لهذه الدورة بعد.",
  completedCount: (done: number, total: number) =>
    `${done}/${total} دروس مكتملة`,
  coursesLink: "دوراتي",
  viewAllLink: "عرض الكل",
  searchPlaceholder: "ابحثي في مكتبتكِ...",
  categoryLabel: "الفئة",
  allCategories: "جميع الفئات",
  statusLabel: "الحالة",
  allStatuses: "الكل",
  completedStatus: "مكتملة",
  pendingStatus: "قيد المتابعة",
  sortLabel: "ترتيب العرض",
  sortCourse: "حسب الدورة",
  sortTitle: "حسب العنوان",
  sortCategory: "حسب الفئة",
  oneResult: "مورد واحد",
  resultsCount: (count: number) => `${count} موارد`,
  noResults: "لا توجد موارد تطابق البحث.",
  openCourse: "فتح",
  moduleLabel: "وحدة",
  completedShort: "مكتملة",
  lessonCompleted: "درس مكتمل",
  markComplete: "تحديد كمكتمل",
  markIncomplete: "إلغاء الإكمال",
  watchVideo: "مشاهدة الفيديو",
  listenAudio: "الاستماع",
  openPdf: "فتح ملف PDF",
  openSheet: "فتح البطاقة",
  emptyLibrary: "ستظهر دوراتكِ ومحتواها هنا.",
};

export const aboutPageContent = {
  eyebrow: "من أنا",
  title: "مدربة تحمل رسالة... وقصة تستحق أن تُروى",
  subtitle:
    "اختيار الكوتش لا يعتمد فقط على الخبرة، بل أيضًا على الثقة والانسجام. لذلك أشارك معكِ قصتي، وما دفعني لاختيار هذا المسار، والقيم التي ألتزم بها في مرافقة كل شخص.",
  storyTitle: "قصتي",
  videoLabel: "فيديو تعريفي",
  whyTitle: "لماذا اخترت أن أصبح كوتش؟",
  missionTitle: "رسالتي",
  valuesTitle: "قيمي",
  ctaTitle: "هل ترغبين في التعرف إليّ أكثر؟",
  ctaSubtitle:
    "احجزي مكالمة تعارف مجانية لنتحدث عن احتياجاتكِ، ونكتشف معًا كيف يمكنني مساعدتكِ.",
  ctaButton: "احجزي مكالمة تعارف",
};

export const heroContent = {
  eyebrow: "كوتشينغ حياة يساعدكِ على استعادة التوازن والانطلاق بثقة",
  title: "استعيدي ثقتكِ بنفسكِ واستعيدي زمام حياتكِ.",
  subtitle:
    "مرافقة شخصية تساعدكِ على تجاوز التحديات، واستعادة توازنكِ، وتحقيق أهدافكِ بثقة ووضوح.",
  ctaPrimary: { label: "احجزي جلسة", href: "/booking" },
  ctaSecondary: { label: "اكتشفي برامجي", href: "/courses" },
};

export const problems = [
  {
    title: "ضعف الثقة بالنفس",
    description:
      "تشكين في قدراتكِ، وتترددين في اغتنام الفرص أو اتخاذ المبادرة.",
    icon: "heart",
  },
  {
    title: "التوتر والضغط النفسي",
    description:
      "تشعرين بالإرهاق والاستنزاف، وتبحثين عن توازن صحي ومستدام في حياتكِ.",
    icon: "brain",
  },
  {
    title: "صعوبات في العلاقات",
    description:
      "تواجهين خلافات، أو انفصالًا، أو تجدين نفسكِ تكررين أنماطًا من العلاقات لا تحقق لكِ الاستقرار.",
    icon: "users",
  },
  {
    title: "تحديات مهنية",
    description:
      "تشعرين بأنكِ عالقة في مسيرتكِ المهنية، وتسعين إلى تحقيق التوازن بين النجاح المهني والرضا الشخصي.",
    icon: "briefcase",
  },
];

export const methodSteps = [
  {
    step: "01",
    title: "الاستماع والتقييم",
    description:
      "نبدأ بلقاء معمق لفهم وضعكِ الحالي، وتحديد أهدافكِ، واستكشاف احتياجاتكِ وتطلعاتكِ.",
  },
  {
    step: "02",
    title: "خطة مخصصة",
    description:
      "نضع معًا خطة تناسب احتياجاتكِ، تعتمد على أدوات عملية وتمارين قابلة للتطبيق.",
  },
  {
    step: "03",
    title: "المرافقة والمتابعة",
    description:
      "جلسات منتظمة تساعدكِ على التقدم، وتجاوز العقبات، والاحتفاء بكل خطوة نحو هدفكِ.",
  },
  {
    step: "04",
    title: "الاستقلالية",
    description:
      "تنهين رحلتكِ وأنتِ تمتلكين الأدوات والثقة التي تمكّنكِ من مواصلة التقدم بنفسكِ.",
  },
];

export const stats = [
  { value: "+200", label: "عميلة تمت مرافقتها" },
  { value: "95٪", label: "نسبة رضا العميلات" },
  { value: "8 سنوات", label: "من الخبرة" },
  { value: "+1500", label: "ساعة كوتشينغ" },
];

export const faqs = [
  {
    question: "كيف تسير الجلسة الأولى؟",
    answer:
      "الجلسة الأولى هي لقاء تعارف وتقييم. نتعرف إلى بعضنا، ونناقش وضعكِ الحالي، ونحدد أهدافكِ بوضوح. كل ما يُطرح خلالها يبقى سريًا وفي بيئة آمنة وخالية من الأحكام.",
  },
  {
    question: "هل تُعقد الجلسات حضوريًا أم عن بُعد؟",
    answer:
      "الخياران متاحان. أغلب الجلسات تتم عبر الفيديو (Zoom أو Google Meet) لمرونة أكبر، ويمكن ترتيب لقاءات حضورية عند الطلب.",
  },
  {
    question: "كم عدد الجلسات التي سأحتاج إليها؟",
    answer:
      "يعتمد على أهدافكِ. بعض العميلات يحققن أهدافهن في 3 إلى 5 جلسات، وأخريات يفضلن مرافقة على عدة أشهر. نضبط الإيقاع معًا.",
  },
  {
    question: "هل تقدمين جلسة تعارف مجانية؟",
    answer:
      "نعم، جلسة تعارف مدتها 20 دقيقة مجانية للتعارف ومعرفة إن كانت مرافقتي مناسبة لكِ.",
  },
  {
    question: "كيف يتم الدفع؟",
    answer:
      "الدفع يتم عبر الإنترنت بشكل آمن (بطاقة مغربية أو دولية). تتلقين تأكيدًا بالبريد مع رابط الفيديو.",
  },
];

export const aboutContent = {
  story:
    "لطالما آمنت بقدرة الإنسان على التغيير والنمو. وبعد أن خضتُ تجارب شخصية مليئة بالتحديات، ولحظات من الشك وإعادة اكتشاف الذات، أدركت الأثر العميق الذي يمكن أن يحدثه الكوتشينغ في حياة الإنسان.\n\nلم يكن اختياري لهذه المهنة مجرد صدفة، بل كان امتدادًا طبيعيًا لتجربتي الشخصية ورغبتي الصادقة في مرافقة الآخرين خلال رحلتهم نحو التغيير.",
  why:
    "لأنني مررت بمراحل شعرت فيها بالحيرة، وعدم الوضوح، وصعوبة اتخاذ الخطوة التالية.\n\nلقد ساعدني الكوتشينغ على استعادة توازني، وفهم نفسي بشكل أعمق، والانطلاق بثقة نحو أهدافي.\n\nواليوم، أرافق كل شخص بنفس الاهتمام والتعاطف والدعم الذي كنت أتمنى أن أجده في تلك المرحلة من حياتي.",
  mission:
    "رسالتي هي مساعدتكِ على اكتشاف إمكاناتكِ، وبناء حياة تنسجم مع قيمكِ، وتطلعاتكِ، وما يمنحكِ شعورًا حقيقيًا بالرضا والاتزان.",
  values: [
    {
      title: "التعاطف",
      description:
        "أوفر لكِ مساحة آمنة، خالية من الأحكام، حيث يمكنكِ التعبير عن نفسكِ بكل راحة وصدق.",
    },
    {
      title: "الأصالة",
      description:
        "أؤمن بعلاقة إنسانية قائمة على الثقة، والشفافية، والاحترام المتبادل.",
    },
    {
      title: "السرية",
      description:
        "كل ما تشاركينه يبقى سريًا، ويُعامل بأقصى درجات الخصوصية والاحترام.",
    },
    {
      title: "الالتزام",
      description:
        "أرافقكِ بكل جدية واهتمام، وأسعى إلى دعمكِ في كل خطوة من رحلتكِ نحو التغيير.",
    },
  ],
};
