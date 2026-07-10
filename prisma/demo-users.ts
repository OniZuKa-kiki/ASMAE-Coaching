export type DemoUserAccount = {
  key: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "CLIENT";
  clerkRole: "admin" | "client";
  description: string;
};

/** Comptes de démonstration — dev / staging uniquement. */
export const demoUserAccounts: DemoUserAccount[] = [
  {
    key: "admin",
    email: "saadsaidi0207@gmail.com",
    password: "AsmaeDemo2026!",
    firstName: "أسماء",
    lastName: "المدربة",
    role: "ADMIN",
    clerkRole: "admin",
    description: "Accès admin complet (/admin)",
  },
  {
    key: "cliente",
    email: "mariosaadsaidi22@gmail.com",
    password: "ClienteDemo2026!",
    firstName: "نادية",
    lastName: "تجريبي",
    role: "CLIENT",
    clerkRole: "client",
    description:
      "Cliente avec données complètes : جلسات، دورات، مكتبتي، بودكاست، تقييم",
  },
  {
    key: "cliente-nouvelle",
    email: "chawarmamks@gmail.com",
    password: "ClienteDemo2026!",
    firstName: "ليلى",
    lastName: "جديدة",
    role: "CLIENT",
    clerkRole: "client",
    description: "Cliente vide pour tester le parcours nouvelle inscrite",
  },
];
