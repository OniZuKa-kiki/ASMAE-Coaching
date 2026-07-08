import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        Paramètres
      </h1>
      <div className="space-y-6">
        <Card>
          <h3 className="font-semibold text-heading mb-2">Disponibilités</h3>
          <p className="text-text/70 text-sm">
            Configurez vos créneaux de consultation disponibles.
          </p>
          <div className="mt-3">
            <Link
              href="/admin/settings/availability"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Gérer
            </Link>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-heading mb-2">Zoom / Google Meet</h3>
          <p className="text-text/70 text-sm">
            Vérifiez comment les liens de visioconférence sont générés pour les
            réservations confirmées.
          </p>
          <div className="mt-3">
            <Link
              href="/admin/settings/visio"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Gérer
            </Link>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-heading mb-2">Questionnaires clients</h3>
          <p className="text-text/70 text-sm">
            Consultez les réponses des clients avant les séances.
          </p>
          <div className="mt-3">
            <Link
              href="/admin/settings/intake-forms"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Gérer
            </Link>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-heading mb-2">Emails</h3>
          <p className="text-text/70 text-sm">
            Personnalisez les emails de confirmation et de rappel.
          </p>
          <div className="mt-3">
            <Link
              href="/admin/settings/emails"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              Gérer
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
