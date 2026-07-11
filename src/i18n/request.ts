import { cookies } from "next/headers";

import { getRequestConfig } from "next-intl/server";

import { getEnabledLocales, resolveAppLocale } from "@/lib/locale-settings";

import { routing, type AppLocale, localeCookieName } from "@/i18n/routing";



export default getRequestConfig(async () => {

  const [cookieStore, enabledLocales] = await Promise.all([

    cookies(),

    getEnabledLocales(),

  ]);

  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  const locale: AppLocale = resolveAppLocale(cookieLocale, enabledLocales);



  return {

    locale,

    messages: {

      ...(await import(`../../messages/${locale}.json`)).default,

      legal: (await import(`../../messages/legal-${locale}.json`)).default,

      adminPages: (await import(`../../messages/admin-pages-${locale}.json`))
        .default,

    },

  };

});

