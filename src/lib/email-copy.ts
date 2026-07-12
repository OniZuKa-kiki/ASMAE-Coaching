export type EmailLang = "ar" | "fr";

export const emailLayoutCopy: Record<
  EmailLang,
  {
    signOff: string;
    signOffName: string;
    brandName: string;
    rights: string;
    messageLabel: string;
  }
> = {
  ar: {
    signOff: "بكل تقدير،",
    signOffName: "مدرّبتك",
    brandName: "كوتشينغ الحياة",
    rights: "جميع الحقوق محفوظة",
    messageLabel: "الرسالة",
  },
  fr: {
    signOff: "Bien à vous,",
    signOffName: "Votre coach",
    brandName: "Coaching de vie",
    rights: "Tous droits réservés",
    messageLabel: "Message",
  },
};

type BookingEmailCopy = {
  subject: string;
  preheader: (service: string, date: string) => string;
  title: (name: string) => string;
  subtitle: string;
  intro: string;
  serviceLabel: string;
  dateLabel: string;
  timeLabel: string;
  timeZone: string;
  videoLabel: string;
  joinLink: string;
  cancelNote: string;
  ctaJoin: string;
  ctaBookings: string;
  footerNote: string;
};

export const bookingConfirmationCopy: Record<EmailLang, BookingEmailCopy> = {
  ar: {
    subject: "تأكيد جلسة الكوتشينغ",
    preheader: (service, date) => `جلستك ${service} مؤكدة ليوم ${date}`,
    title: (name) => `مرحبًا ${name}،`,
    subtitle: "جلسة الكوتشينغ الخاصة بك مؤكدة. إليك كل التفاصيل للاستعداد باطمئنان.",
    intro:
      "يسعدني مرافقتك في هذه الجلسة. خصّص لحظة للجلوس في مكان هادئ مع اتصال مستقر.",
    serviceLabel: "الخدمة",
    dateLabel: "التاريخ",
    timeLabel: "الوقت",
    timeZone: " (توقيت المغرب)",
    videoLabel: "رابط الفيديو",
    joinLink: "انضم للجلسة",
    cancelNote: "في حال التعذر، يرجى الإبلاغ قبل 24 ساعة على الأقل.",
    ctaJoin: "انضم لجلستي",
    ctaBookings: "عرض جلساتي",
    footerNote: "تلقيت هذا البريد بعد حجزك على asmae-coaching.fr",
  },
  fr: {
    subject: "Confirmation de séance de coaching",
    preheader: (service, date) => `Votre séance ${service} est confirmée pour le ${date}`,
    title: (name) => `Bonjour ${name},`,
    subtitle:
      "Votre séance de coaching est confirmée. Voici tous les détails pour vous préparer sereinement.",
    intro:
      "Je serai ravie de vous accompagner lors de cette séance. Prévoyez un endroit calme et une connexion stable.",
    serviceLabel: "Service",
    dateLabel: "Date",
    timeLabel: "Heure",
    timeZone: " (heure du Maroc)",
    videoLabel: "Lien visio",
    joinLink: "Rejoindre la séance",
    cancelNote:
      "En cas d'empêchement, merci de me prévenir au moins 24 heures à l'avance.",
    ctaJoin: "Rejoindre ma séance",
    ctaBookings: "Voir mes séances",
    footerNote: "Vous avez reçu cet e-mail après votre réservation sur asmae-coaching.fr",
  },
};

export const bookingReminderCopy: Record<EmailLang, BookingEmailCopy> = {
  ar: {
    subject: "تذكير بجلستك غداً",
    preheader: (service, _date) => `تذكير: جلستك ${service} غداً`,
    title: (name) => `مرحبًا ${name}،`,
    subtitle: "نذكّرك بأن جلستك غداً قريبة — إليك التفاصيل للاستعداد باطمئنان.",
    intro:
      "خصّص لحظة للجلوس في مكان هادئ مع اتصال مستقر. إذا تعذّر عليك الحضور، أخبرني قبل 24 ساعة على الأقل.",
    serviceLabel: "الخدمة",
    dateLabel: "التاريخ",
    timeLabel: "الوقت",
    timeZone: " (توقيت المغرب)",
    videoLabel: "رابط الفيديو",
    joinLink: "انضم للجلسة",
    cancelNote: "",
    ctaJoin: "انضم لجلستي",
    ctaBookings: "عرض جلساتي",
    footerNote: "تذكير تلقائي قبل جلستك بيوم واحد",
  },
  fr: {
    subject: "Rappel : votre séance demain",
    preheader: (service, _date) => `Rappel : votre séance ${service} est demain`,
    title: (name) => `Bonjour ${name},`,
    subtitle:
      "Petit rappel : votre séance a lieu demain — voici les détails pour vous préparer.",
    intro:
      "Prévoyez un endroit calme et une connexion stable. Si vous ne pouvez pas venir, prévenez-moi au moins 24 heures à l'avance.",
    serviceLabel: "Service",
    dateLabel: "Date",
    timeLabel: "Heure",
    timeZone: " (heure du Maroc)",
    videoLabel: "Lien visio",
    joinLink: "Rejoindre la séance",
    cancelNote: "",
    ctaJoin: "Rejoindre ma séance",
    ctaBookings: "Voir mes séances",
    footerNote: "Rappel automatique envoyé la veille de votre séance",
  },
};

type CourseEmailCopy = {
  subject: (course: string) => string;
  preheader: (course: string) => string;
  title: (name: string) => string;
  subtitle: string;
  intro: string;
  courseLabel: string;
  paceNote: string;
  cta: string;
  footerNote: string;
};

export const coursePurchaseCopy: Record<EmailLang, CourseEmailCopy> = {
  ar: {
    subject: (course) => `الوصول إلى دورتك — ${course}`,
    preheader: (course) => `مرحبًا بك في دورة ${course}`,
    title: (name) => `مرحبًا ${name}،`,
    subtitle: "شكرًا لثقتك. دورتك جاهزة — يمكنك البدء الآن.",
    intro:
      "تهانينا على هذه الخطوة نحو ازدهارك. مساحتك الشخصية في انتظارك مع كل محتوى الدورة.",
    courseLabel: "الدورة",
    paceNote: "تقدم بوتيرتك — كل وحدة متاحة مدى الحياة من مساحتك.",
    cta: "الوصول إلى دورتي",
    footerNote: "تلقيت هذا البريد بعد شرائك على asmae-coaching.fr",
  },
  fr: {
    subject: (course) => `Accès à votre formation — ${course}`,
    preheader: (course) => `Bienvenue dans la formation ${course}`,
    title: (name) => `Bonjour ${name},`,
    subtitle: "Merci pour votre confiance. Votre formation est prête — vous pouvez commencer dès maintenant.",
    intro:
      "Félicitations pour cette étape vers votre épanouissement. Votre espace personnel vous attend avec tout le contenu de la formation.",
    courseLabel: "Formation",
    paceNote: "Avancez à votre rythme — chaque module reste accessible à vie depuis votre espace.",
    cta: "Accéder à ma formation",
    footerNote: "Vous avez reçu cet e-mail après votre achat sur asmae-coaching.fr",
  },
};

export type ClerkEmailCopy = {
  subject: string;
  preheader: (detail?: string) => string;
  title: string;
  subtitle: string;
  codeExpiryNote: string;
  ignoreNote: string;
  cta: string;
  footerNote: string;
};

export const clerkVerificationCodeCopy: Record<EmailLang, ClerkEmailCopy> = {
  ar: {
    subject: "رمز التحقق",
    preheader: (code) => `رمز التحقق الخاص بك: ${code ?? ""}`,
    title: "رمز التحقق",
    subtitle: "أدخل الرمز التالي لمتابعة تسجيل الدخول إلى مساحتك.",
    codeExpiryNote: "هذا الرمز صالح لفترة محدودة. لا تشاركه مع أي شخص.",
    ignoreNote: "إن لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد بأمان.",
    cta: "تسجيل الدخول",
    footerNote: "بريد أمان — تسجيل الدخول إلى مساحتك",
  },
  fr: {
    subject: "Code de vérification",
    preheader: (code) => `Votre code de vérification : ${code ?? ""}`,
    title: "Code de vérification",
    subtitle: "Saisissez le code ci-dessous pour poursuivre votre connexion à votre espace.",
    codeExpiryNote: "Ce code est valable pour une durée limitée. Ne le partagez avec personne.",
    ignoreNote: "Si vous n'avez pas demandé ce code, ignorez cet e-mail.",
    cta: "Se connecter",
    footerNote: "E-mail de sécurité — connexion à votre espace",
  },
};

export const clerkPasswordResetCopy: Record<EmailLang, ClerkEmailCopy> = {
  ar: {
    subject: "إعادة تعيين كلمة المرور",
    preheader: (code) => `رمز إعادة تعيين كلمة المرور: ${code ?? ""}`,
    title: "إعادة تعيين كلمة المرور",
    subtitle: "استخدم الرمز التالي لإنشاء كلمة مرور جديدة.",
    codeExpiryNote: "هذا الرمز صالح لفترة محدودة.",
    ignoreNote: "إن لم تطلب إعادة التعيين، تجاهل هذا البريد.",
    cta: "إعادة تعيين كلمة المرور",
    footerNote: "بريد أمان — إعادة تعيين كلمة المرور",
  },
  fr: {
    subject: "Réinitialisation du mot de passe",
    preheader: (code) => `Code de réinitialisation : ${code ?? ""}`,
    title: "Réinitialisation du mot de passe",
    subtitle: "Utilisez le code ci-dessous pour créer un nouveau mot de passe.",
    codeExpiryNote: "Ce code est valable pour une durée limitée.",
    ignoreNote: "Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.",
    cta: "Réinitialiser le mot de passe",
    footerNote: "E-mail de sécurité — réinitialisation du mot de passe",
  },
};

export const clerkMagicLinkCopy: Record<EmailLang, ClerkEmailCopy & { linkNote: string }> = {
  ar: {
    subject: "رابط تسجيل الدخول",
    preheader: () => "رابط تسجيل الدخول إلى مساحة الكوتشينغ",
    title: "تسجيل الدخول",
    subtitle: "اضغط على الزر أدناه للوصول إلى مساحتك بأمان.",
    codeExpiryNote: "الرابط صالح لفترة محدودة ولمرة واحدة.",
    linkNote: "",
    ignoreNote: "",
    cta: "تسجيل الدخول",
    footerNote: "بريد أمان — رابط تسجيل الدخول",
  },
  fr: {
    subject: "Lien de connexion",
    preheader: () => "Lien de connexion à votre espace coaching",
    title: "Connexion",
    subtitle: "Cliquez sur le bouton ci-dessous pour accéder à votre espace en toute sécurité.",
    codeExpiryNote: "Ce lien est valable pour une durée limitée et à usage unique.",
    linkNote: "",
    ignoreNote: "",
    cta: "Se connecter",
    footerNote: "E-mail de sécurité — lien de connexion",
  },
};

export const clerkNewDeviceCopy: Record<EmailLang, ClerkEmailCopy> = {
  ar: {
    subject: "تسجيل دخول من جهاز جديد",
    preheader: (code) => `رمز التحقق من جهاز جديد: ${code ?? ""}`,
    title: "تسجيل دخول من جهاز جديد",
    subtitle: "لحماية حسابك، نحتاج للتحقق من هويتك قبل المتابعة.",
    codeExpiryNote: "هذا الرمز صالح لفترة محدودة.",
    ignoreNote: "إن لم تكن أنت من حاول تسجيل الدخول، تجاهل هذا البريد وغيّر كلمة المرور.",
    cta: "تسجيل الدخول",
    footerNote: "بريد أمان — جهاز جديد",
  },
  fr: {
    subject: "Connexion depuis un nouvel appareil",
    preheader: (code) => `Code de vérification (nouvel appareil) : ${code ?? ""}`,
    title: "Connexion depuis un nouvel appareil",
    subtitle: "Pour protéger votre compte, nous devons vérifier votre identité avant de continuer.",
    codeExpiryNote: "Ce code est valable pour une durée limitée.",
    ignoreNote: "Si vous n'êtes pas à l'origine de cette tentative, ignorez cet e-mail et changez votre mot de passe.",
    cta: "Se connecter",
    footerNote: "E-mail de sécurité — nouvel appareil",
  },
};

export type ClerkNoticeCopy = {
  subject: string;
  preheader: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  cta: string;
  footerNote: string;
};

export const clerkInvitationCopy: Record<EmailLang, ClerkNoticeCopy> = {
  ar: {
    subject: "دعوة للانضمام",
    preheader: "دعوة للانضمام إلى منصة الكوتشينغ",
    title: "دعوة للانضمام",
    subtitle: "لقد تمت دعوتك للانضمام إلى منصة الكوتشينغ.",
    paragraphs: [
      "اضغط على الزر أدناه لقبول الدعوة وإنشاء حسابك أو تسجيل الدخول.",
      "إن لم تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد بأمان.",
    ],
    cta: "قبول الدعوة",
    footerNote: "دعوة",
  },
  fr: {
    subject: "Invitation à rejoindre",
    preheader: "Invitation à rejoindre la plateforme",
    title: "Invitation à rejoindre",
    subtitle: "Vous avez été invité(e) à rejoindre la plateforme de coaching.",
    paragraphs: [
      "Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte ou vous connecter.",
      "Si vous n'attendiez pas cette invitation, ignorez cet e-mail.",
    ],
    cta: "Accepter l'invitation",
    footerNote: "Invitation",
  },
};

export const clerkAccountLockedCopy: Record<EmailLang, ClerkNoticeCopy> = {
  ar: {
    subject: "تم قفل الحساب مؤقتاً",
    preheader: "تم قفل حسابك مؤقتاً",
    title: "تم قفل الحساب مؤقتاً",
    subtitle: "لحماية حسابك، تم تقييد الوصول بعد عدة محاولات دخول فاشلة.",
    paragraphs: [
      "انتظر بضع دقائق ثم حاول مجدداً، أو أعد تعيين كلمة المرور إن نسيتها.",
      "إن لم تكن أنت من حاول تسجيل الدخول، تواصل معنا فوراً.",
    ],
    cta: "",
    footerNote: "بريد أمان — قفل الحساب",
  },
  fr: {
    subject: "Compte verrouillé temporairement",
    preheader: "Votre compte a été verrouillé temporairement",
    title: "Compte verrouillé temporairement",
    subtitle: "Pour protéger votre compte, l'accès a été restreint après plusieurs tentatives de connexion échouées.",
    paragraphs: [
      "Attendez quelques minutes puis réessayez, ou réinitialisez votre mot de passe si vous l'avez oublié.",
      "Si vous n'êtes pas à l'origine de ces tentatives, contactez-nous immédiatement.",
    ],
    cta: "",
    footerNote: "E-mail de sécurité — verrouillage du compte",
  },
};

export const clerkPasswordChangedCopy: Record<EmailLang, ClerkNoticeCopy> = {
  ar: {
    subject: "تم تغيير كلمة المرور",
    preheader: "تم تغيير كلمة المرور",
    title: "تم تغيير كلمة المرور",
    subtitle: "نؤكد لك أن كلمة مرور حسابك قد تم تحديثها بنجاح.",
    paragraphs: [
      "إن قمت بهذا التغيير، لا يلزم أي إجراء إضافي.",
      "إن لم تكن أنت من غيّر كلمة المرور، تواصل معنا فوراً لحماية حسابك.",
    ],
    cta: "",
    footerNote: "بريد أمان — تغيير كلمة المرور",
  },
  fr: {
    subject: "Mot de passe modifié",
    preheader: "Mot de passe modifié",
    title: "Mot de passe modifié",
    subtitle: "Nous confirmons que le mot de passe de votre compte a bien été mis à jour.",
    paragraphs: [
      "Si vous êtes à l'origine de ce changement, aucune action supplémentaire n'est requise.",
      "Sinon, contactez-nous immédiatement pour protéger votre compte.",
    ],
    cta: "",
    footerNote: "E-mail de sécurité — changement de mot de passe",
  },
};

export const clerkPasswordRemovedCopy: Record<EmailLang, ClerkNoticeCopy> = {
  ar: {
    subject: "تمت إزالة كلمة المرور",
    preheader: "تمت إزالة كلمة المرور",
    title: "تمت إزالة كلمة المرور",
    subtitle: "لم يعد بإمكانك تسجيل الدخول بكلمة المرور على هذا الحساب.",
    paragraphs: [
      "إن قمت بهذا الإجراء، يمكنك متابعة الدخول بالطريقة البديلة المفعّلة على حسابك.",
      "إن لم تكن أنت من قام بذلك، تواصل معنا فوراً.",
    ],
    cta: "",
    footerNote: "بريد أمان — إزالة كلمة المرور",
  },
  fr: {
    subject: "Mot de passe supprimé",
    preheader: "Mot de passe supprimé",
    title: "Mot de passe supprimé",
    subtitle: "Vous ne pouvez plus vous connecter avec un mot de passe sur ce compte.",
    paragraphs: [
      "Si vous êtes à l'origine de cette action, vous pouvez continuer à vous connecter via la méthode alternative activée.",
      "Sinon, contactez-nous immédiatement.",
    ],
    cta: "",
    footerNote: "E-mail de sécurité — suppression du mot de passe",
  },
};

export const clerkPrimaryEmailChangedCopy: Record<EmailLang, ClerkNoticeCopy & { newEmailLabel: string; updatedFallback: string }> = {
  ar: {
    subject: "تم تغيير البريد الإلكتروني",
    preheader: "تم تغيير البريد الإلكتروني",
    title: "تغيير البريد الإلكتروني",
    subtitle: "نؤكد لك تحديث بريدك الإلكتروني الرئيسي على حسابك.",
    newEmailLabel: "البريد الجديد",
    updatedFallback: "تم تحديث بريدك الإلكتروني الرئيسي.",
    paragraphs: ["إن لم تكن أنت من طلب هذا التغيير، تواصل معنا فوراً."],
    cta: "",
    footerNote: "بريد أمان — البريد الإلكتروني",
  },
  fr: {
    subject: "Adresse e-mail modifiée",
    preheader: "Adresse e-mail modifiée",
    title: "Modification de l'adresse e-mail",
    subtitle: "Nous confirmons la mise à jour de votre adresse e-mail principale.",
    newEmailLabel: "Nouvelle adresse",
    updatedFallback: "Votre adresse e-mail principale a été mise à jour.",
    paragraphs: ["Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement."],
    cta: "",
    footerNote: "E-mail de sécurité — adresse e-mail",
  },
};
