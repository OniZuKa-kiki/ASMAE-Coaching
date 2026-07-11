import { NextResponse } from "next/server";

import {

  suggestDashboardContent,

  suggestPublicContent,

} from "@/lib/global-search";

import { getClientIp, rateLimit } from "@/lib/rate-limit";

import { isSearchQueryValid } from "@/lib/search-utils";

import { getOrCreateUser } from "@/lib/user";



const SUGGEST_LIMIT = 60;

const SUGGEST_WINDOW_MS = 60_000;



export async function GET(request: Request) {

  const ip = getClientIp(request);

  const limited = rateLimit(`search-suggest:${ip}`, SUGGEST_LIMIT, SUGGEST_WINDOW_MS);



  if (!limited.ok) {

    return NextResponse.json(

      { suggestions: [] },

      {

        status: 429,

        headers: { "Retry-After": String(limited.retryAfterSec) },

      }

    );

  }



  const { searchParams } = new URL(request.url);

  const query = (searchParams.get("q") ?? "").trim();

  const scope = searchParams.get("scope") === "dashboard" ? "dashboard" : "public";



  if (!isSearchQueryValid(query)) {

    return NextResponse.json({ suggestions: [] });

  }



  if (scope === "dashboard") {

    const user = await getOrCreateUser();

    if (!user) {

      return NextResponse.json({ suggestions: [] });

    }



    const userLimited = rateLimit(

      `search-suggest:user:${user.id}`,

      SUGGEST_LIMIT,

      SUGGEST_WINDOW_MS

    );

    if (!userLimited.ok) {

      return NextResponse.json(

        { suggestions: [] },

        {

          status: 429,

          headers: { "Retry-After": String(userLimited.retryAfterSec) },

        }

      );

    }



    const suggestions = await suggestDashboardContent(user.id, query);

    return NextResponse.json({ suggestions });

  }



  const suggestions = await suggestPublicContent(query);

  return NextResponse.json({ suggestions });

}

