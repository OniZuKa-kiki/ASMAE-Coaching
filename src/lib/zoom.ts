/**
 * Génère un lien de visioconférence.
 * - ZOOM_STATIC_MEETING_URL : lien fixe (simple, pour démarrer)
 * - Zoom API Server-to-Server : si les clés sont configurées
 */
export async function createMeetingLink(
  topic: string,
  startTime: Date
): Promise<string> {
  const staticUrl =
    process.env.ZOOM_STATIC_MEETING_URL ||
    process.env.GOOGLE_MEET_STATIC_URL;

  if (staticUrl) return staticUrl;

  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings`;
  }

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
        topic,
        type: 2,
        start_time: startTime.toISOString(),
        duration: 60,
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
    return staticUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings`;
  }
}
