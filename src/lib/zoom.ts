/**
 * Génère un lien de visioconférence.
 *
 * Priorité :
 * 1. ZOOM_STATIC_MEETING_URL ou GOOGLE_MEET_STATIC_URL (lien fixe — mode actuel)
 * 2. Zoom API Server-to-Server (une réunion par séance, date/heure/durée du booking)
 * 3. Fallback dashboard
 */

export type CreateMeetingLinkInput = {
  topic: string;
  date: Date;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
};

function parseClockMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

export function resolveBookingDurationMinutes(input: CreateMeetingLinkInput): number {
  if (input.endTime) {
    const start = parseClockMinutes(input.startTime);
    const end = parseClockMinutes(input.endTime);
    if (start !== null && end !== null && end > start) {
      return end - start;
    }
  }

  if (input.durationMinutes && input.durationMinutes > 0) {
    return input.durationMinutes;
  }

  return 60;
}

function resolveZoomMaxDuration(): number {
  const raw = Number(process.env.ZOOM_MAX_MEETING_MINUTES ?? "40");
  return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : 40;
}

function buildMeetingStartIso(date: Date, startTime: string): string {
  const day = new Date(date);
  const [hours, minutes] = startTime.split(":").map(Number);
  day.setHours(hours, minutes, 0, 0);
  return day.toISOString();
}

function dashboardFallbackUrl(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bookings`;
}

export async function createMeetingLink(
  input: CreateMeetingLinkInput
): Promise<string> {
  const staticUrl =
    process.env.ZOOM_STATIC_MEETING_URL?.trim() ||
    process.env.GOOGLE_MEET_STATIC_URL?.trim();

  if (staticUrl) return staticUrl;

  const accountId = process.env.ZOOM_ACCOUNT_ID?.trim();
  const clientId = process.env.ZOOM_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOOM_CLIENT_SECRET?.trim();

  if (!accountId || !clientId || !clientSecret) {
    return dashboardFallbackUrl();
  }

  const duration = Math.min(
    resolveBookingDurationMinutes(input),
    resolveZoomMaxDuration()
  );

  try {
    const tokenRes = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
      }
    );

    if (!tokenRes.ok) throw new Error("Zoom auth failed");
    const { access_token } = await tokenRes.json();

    const meetingRes = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: input.topic,
        type: 2,
        start_time: buildMeetingStartIso(input.date, input.startTime),
        duration,
        timezone: "Europe/Paris",
        settings: {
          join_before_host: true,
          waiting_room: true,
        },
      }),
    });

    if (!meetingRes.ok) throw new Error("Zoom meeting creation failed");
    const meeting = await meetingRes.json();
    return meeting.join_url as string;
  } catch {
    return dashboardFallbackUrl();
  }
}
