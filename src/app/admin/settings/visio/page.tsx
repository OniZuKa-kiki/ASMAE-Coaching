import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getUserRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getMeetingMode() {
  const staticZoomUrl = process.env.ZOOM_STATIC_MEETING_URL?.trim();
  const staticMeetUrl = process.env.GOOGLE_MEET_STATIC_URL?.trim();
  const zoomAccountId = process.env.ZOOM_ACCOUNT_ID?.trim();
  const zoomClientId = process.env.ZOOM_CLIENT_ID?.trim();
  const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET?.trim();

  if (staticZoomUrl) {
    return {
      title: "Lien Zoom fixe configuré",
      description:
        "Chaque réservation confirmée recevra le même lien Zoom. C'est la solution la plus simple pour démarrer.",
      status: "Actif",
      provider: "Zoom (lien fixe)",
    };
  }

  if (staticMeetUrl) {
    return {
      title: "Lien Google Meet fixe configuré",
      description:
        "Chaque réservation confirmée recevra le même lien Google Meet.",
      status: "Actif",
      provider: "Google Meet (lien fixe)",
    };
  }

  if (zoomAccountId && zoomClientId && zoomClientSecret) {
    return {
      title: "Création automatique Zoom activable",
      description:
        "Le projet dispose des variables nécessaires pour créer un lien Zoom unique par séance via l'API Zoom.",
      status: "Configuré",
      provider: "Zoom API",
    };
  }

  return {
    title: "Aucune visioconférence configurée",
    description:
      "Aucun lien Zoom/Meet n'est configuré. Le système utilisera un lien de secours vers le dashboard tant qu'une config de visio n'est pas définie.",
    status: "À compléter",
    provider: "Aucun",
  };
}

export default async function AdminVisioSettingsPage() {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const mode = getMeetingMode();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            Visioconférence
          </h1>
          <p className="text-sm text-text/70 mt-1">
            Gestion des liens envoyés après confirmation d&apos;une réservation.
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-heading hover:border-primary hover:text-primary transition-colors"
        >
          Retour
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">{mode.title}</h2>
          <div className="space-y-2 text-sm text-text/80">
            <p>
              <span className="font-semibold text-heading">Statut :</span> {mode.status}
            </p>
            <p>
              <span className="font-semibold text-heading">Mode actuel :</span>{" "}
              {mode.provider}
            </p>
            <p>{mode.description}</p>
          </div>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">Comment cela fonctionne</h2>
          <ul className="space-y-2 text-sm text-text/80 list-disc pl-5">
            <li>Quand un paiement de réservation est validé, la réservation passe en confirmé.</li>
            <li>À ce moment-là, le système génère ou récupère le lien de visio.</li>
            <li>Le lien est enregistré dans la réservation et envoyé dans l&apos;email client.</li>
            <li>Le client retrouve aussi ce lien dans son dashboard, section consultations.</li>
          </ul>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">Conseil</h2>
          <p className="text-sm text-text/80">
            Pour démarrer rapidement, le lien fixe est suffisant. Plus tard, vous pourrez
            passer à un lien Zoom unique par séance si vous activez l&apos;API Zoom complète.
          </p>
        </Card>
      </div>
    </div>
  );
}

