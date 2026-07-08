export const siteConfig = {
  name: "ASMAE",
  tagline: "كوتشينغ",
  motto: "تجاوز • توازن • ازدهار",
  description:
    "كوتشينغ مخصص لمساعدتك على تجاوز عوائقك، استعادة توازنك، وتحقيق أهدافك.",
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
  { label: "احجز", href: "/booking" },
  { label: "بودكاست", href: "/podcasts" },
  { label: "الدورات", href: "/courses" },
  { label: "المدونة", href: "/blog" },
  { label: "شهادات", href: "/testimonials" },
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
  { label: "احجز", href: "/booking" },
  { label: "بودكاست", href: "/podcasts" },
  { label: "المدونة", href: "/blog" },
  { label: "شهادات", href: "/testimonials" },
];

export const heroContent = {
  title: "استعد ثقتك بنفسك واستلم زمام حياتك من جديد.",
  subtitle:
    "كوتشينغ مخصص لمساعدتك على تجاوز عوائقك، استعادة توازنك، وتحقيق أهدافك.",
  ctaPrimary: { label: "احجز استشارة", href: "/booking" },
  ctaSecondary: { label: "اكتشف برامجي", href: "/courses" },
};

export const problems = [
  {
    title: "نقص الثقة بالنفس",
    description:
      "تشك في قدراتك وتتردد في المبادرة أمام الفرص التي تطرأ في حياتك.",
    icon: "heart",
  },
  {
    title: "التوتر والضغط النفسي",
    description:
      "تشعر بالإرهاق والتعب وتواجه صعوبة في إيجاد توازن مستدام.",
    icon: "brain",
  },
  {
    title: "علاقات صعبة",
    description:
      "تمر بصراعات أو انفصالات أو أنماط علاقات تتكرر دون حل.",
    icon: "users",
  },
  {
    title: "عوائق مهنية",
    description:
      "تشعر بالركود في مسيرتك ولا تعرف كيف توائم بين العمل والإشباع الشخصي.",
    icon: "briefcase",
  },
];

export const methodSteps = [
  {
    step: "01",
    title: "الاستماع والتشخيص",
    description:
      "لقاء أول لفهم وضعك، أهدافك، وتوقعاتك العميقة.",
  },
  {
    step: "02",
    title: "خطة مخصصة",
    description:
      "مسار مصمم على مقاسك، بأدوات عملية وتمارين تطبيقية.",
  },
  {
    step: "03",
    title: "المرافقة",
    description:
      "جلسات منتظمة للتقدم، تجاوز العوائق، والاحتفال بكل إنجاز.",
  },
  {
    step: "04",
    title: "الاستقلالية",
    description:
      "تغادر وأنت تمتلك المفاتيح للاستمرار بثقة ووعي.",
  },
];

export const stats = [
  { value: "+200", label: "عميل مرافق" },
  { value: "95%", label: "نسبة الرضا" },
  { value: "8 سنوات", label: "من الخبرة" },
  { value: "+1500", label: "ساعة كوتشينغ" },
];

export const testimonials = [
  {
    name: "سارة م.",
    role: "رائدة أعمال",
    content:
      "بفضل أسماء، استعدت ثقتي بنفسي وجرأت على إطلاق مشروعي. مرافقتها كانت محوِّلة.",
    rating: 5,
  },
  {
    name: "كريم ب.",
    role: "مدير تنفيذي",
    content:
      "كوتشينغ مهني وحنون. تعلمت إدارة توتري ووضع حدودي بشكل أفضل.",
    rating: 5,
  },
  {
    name: "ليلى د.",
    role: "في مرحلة إعادة التوجيه",
    content:
      "ساعدتني أسماء على توضيح رغباتي والمبادرة. أشعر أخيراً بأنني متوافقة مع حياتي.",
    rating: 5,
  },
];

export const faqs = [
  {
    question: "كيف تسير الجلسة الأولى؟",
    answer:
      "الجلسة الأولى هي لقاء معمّق. نتعارف، تشارك وضعك، ونحدد أهدافك معاً. إنها مساحة سرية بلا أحكام.",
  },
  {
    question: "هل الجلسات حضورية أم عن بُعد؟",
    answer:
      "الخياران متاحان. أغلب الجلسات تتم عبر الفيديو (Zoom أو Google Meet) لمرونة أكبر، ويمكن ترتيب لقاءات حضورية عند الطلب.",
  },
  {
    question: "كم عدد الجلسات اللازمة؟",
    answer:
      "يعتمد على أهدافك. بعض العملاء يحققون أهدافهم في 3 إلى 5 جلسات، وآخرون يفضلون مرافقة على عدة أشهر. نضبط الإيقاع معاً.",
  },
  {
    question: "هل تقدمون مكالمة تعارف مجانية؟",
    answer:
      "نعم، مكالمة تعارف مدتها 20 دقيقة مجانية للتعارف ومعرفة إن كانت مرافقتنا مناسبة لك.",
  },
  {
    question: "كيف يتم الدفع؟",
    answer:
      "الدفع يتم عبر الإنترنت بشكل آمن (بطاقة مغربية أو دولية). تتلقى تأكيداً بالبريد مع رابط الفيديو.",
  },
];

export const services = [
  {
    slug: "individuel",
    title: "كوتشينغ فردي",
    description:
      "مرافقة مخصصة لاستكشاف عوائقك، توضيح أهدافك، والتقدم نحو الحياة التي تستحقها.",
    duration: "60 د",
    price: 12000,
    results: [
      "وضوح في أهداف حياتك",
      "أدوات عملية للتقدم",
      "استعادة الثقة",
      "خطة عمل مخصصة",
    ],
  },
  {
    slug: "couple",
    title: "كوتشينغ الأزواج",
    description:
      "استعيدوا الانسجام في علاقتكم عبر مساحة استماع حنونة وأدوات تواصل فعّالة.",
    duration: "90 د",
    price: 18000,
    results: [
      "تواصل أفضل",
      "تفاهم متبادل",
      "حل النزاعات",
      "تعزيز الرابط",
    ],
  },
  {
    slug: "carriere",
    title: "كوتشينغ مهني",
    description:
      "وائم مسارك المهني مع قيمك وأعطِ دفعة جديدة لمسيرتك.",
    duration: "60 د",
    price: 14000,
    results: [
      "رؤية مهنية واضحة",
      "استراتيجية انتقال",
      "ثقة في المقابلات",
      "توازن العمل والحياة",
    ],
  },
  {
    slug: "bien-etre",
    title: "تطوير شخصي",
    description:
      "مسار لرعاية رفاهك الداخلي، إدارة مشاعرك، وتنمية وعيك الكامل.",
    duration: "60 د",
    price: 12000,
    results: [
      "إدارة التوتر",
      "تعزيز تقدير الذات",
      "توازن عاطفي",
      "عادات إيجابية",
    ],
  },
];

export const aboutContent = {
  story:
    "منذ دائماً، أدهشني القدرة البشرية على التحول. بعد أن مررت بتحدياتي الخاصة — لحظات شك وإعادة تقييم عميقة — اكتشفت قوة الكوتشينغ. ليس مصادفة أن أصبحت كوتش: إنه رسالة ولدت من تجربتي الشخصية.",
  why:
    "اخترت هذا المهنة لأنني عشت ما يعيشه عملائي: الشعور بالتوقف، وعدم معرفة من أين نبدأ. الكوتشينغ ساعدني على إعادة الاتصال بنفسي. اليوم، أرافق كل شخص بنفس الحنان الذي كنت أتمنى تلقيه.",
  mission:
    "مهمتي بسيطة: مساعدتك لتصبح أفضل نسخة من نفسك. ليس نسخة يفرضها الآخرون، بل التي تتوافق مع قيمك وأحلامك وأصالتك.",
  values: [
    {
      title: "الحنان",
      description: "مساحة بلا أحكام حيث يمكنك أن تكون على طبيعتك.",
    },
    {
      title: "الأصالة",
      description: "علاقة حقيقية مبنية على الثقة والشفافية.",
    },
    {
      title: "السرية",
      description: "حواراتك تبقى خاصة ومحمية تماماً.",
    },
    {
      title: "الالتزام",
      description: "أستثمر كاملاً في نجاحك وازدهارك.",
    },
  ],
};

export const courses = [
  {
    slug: "confiance-en-soi",
    title: "اكتساب الثقة بالنفس",
    description:
      "برنامج متكامل لبناء ثقة دائمة وأصيلة بنفسك.",
    price: 19700,
    modules: 6,
    lessons: 24,
    includes: ["فيديوهات", "PDF", "تمارين عملية", "شهادة"],
  },
  {
    slug: "gestion-stress",
    title: "إتقان إدارة التوتر",
    description:
      "تقنيات عملية لإدارة التوتر يومياً واستعادة هدوئك.",
    price: 14700,
    modules: 4,
    lessons: 16,
    includes: ["فيديوهات", "تأملات صوتية", "أوراق عمل"],
  },
  {
    slug: "objectifs-vie",
    title: "تحديد الأهداف وتحقيقها",
    description:
      "منهج مجرب لتحديد أهداف واضحة وتحقيقها بعزيمة.",
    price: 16700,
    modules: 5,
    lessons: 20,
    includes: ["فيديوهات", "دفتر عمل", "تمارين", "متابعة"],
  },
];

export const podcasts = [
  {
    slug: "premiers-pas",
    title: "الخطوات الأولى نحو التغيير",
    description: "كيف تبدأ تحولك الشخصي من اليوم.",
    duration: "25 د",
    isPremium: false,
  },
  {
    slug: "meditation-matin",
    title: "تأمل الصباح",
    description: "جلسة موجهة لبدء يومك بوعي كامل.",
    duration: "15 د",
    isPremium: false,
  },
  {
    slug: "relations-saines",
    title: "بناء علاقات صحية",
    description: "مفاتيح علاقات متوازنة ومُشبِعة.",
    duration: "35 د",
    isPremium: true,
  },
  {
    slug: "affirmation-soi",
    title: "التأكيد على الذات بلا ذنب",
    description: "تعلم وضع حدودك بحنان وحزم.",
    duration: "30 د",
    isPremium: true,
  },
];

export const blogPosts = [
  {
    slug: "gerer-son-stress",
    title: "كيف تدير توترك يومياً",
    excerpt:
      "تقنيات بسيطة وفعّالة لاستعادة هدوئك أمام تحديات الحياة اليومية.",
    category: "الرفاهية",
    readTime: "5 د",
    date: "2026-03-15",
  },
  {
    slug: "relation-toxique",
    title: "كيف تخرج من علاقة سامة",
    excerpt:
      "التعرف على العلامات، أخذ مسافة، واستعادة حريتك العاطفية.",
    category: "العلاقات",
    readTime: "7 د",
    date: "2026-03-01",
  },
  {
    slug: "reprendre-confiance",
    title: "استعادة الثقة بعد الفشل",
    excerpt:
      "الفشل ليس نهاية، بل مرحلة. إليك كيف تعود أقوى.",
    category: "الثقة",
    readTime: "6 د",
    date: "2026-02-20",
  },
  {
    slug: "fixer-objectifs",
    title: "تحديد أهداف تعكسك",
    excerpt:
      "منهج SMART بصيغة جديدة لأهداف متوافقة مع قيمك العميقة.",
    category: "التطوير",
    readTime: "8 د",
    date: "2026-02-10",
  },
];
