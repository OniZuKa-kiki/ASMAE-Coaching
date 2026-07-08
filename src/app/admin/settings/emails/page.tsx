import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { Card } from "@/components/ui/card";
import { getUserRole } from "@/lib/auth";
import { getEmailLogoAttachment } from "@/lib/email-logo";
import { renderEmailLayout, escapeHtml } from "@/lib/email-templates";
import { siteConfig } from "@/lib/constants";

export const dynamic = "force-dynamic";

function getEmailConfigSnapshot() {
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "ASMAE Coaching <onboarding@resend.dev>";
  const coachEmail = process.env.COACH_EMAIL || siteConfig.contact.email;

  return {
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    fromEmail,
    coachEmail,
  };
}

async function sendTestEmail(formData: FormData) {
  "use server";
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const to = String(formData.get("to") || "").trim();
  if (!to) return;

  const cfg = getEmailConfigSnapshot();
  if (!cfg.resendConfigured || !process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = renderEmailLayout({
    preheader: "Test email — ASMAE Coaching",
    title: "Email de test",
    subtitle: "Vérification de la configuration d’envoi",
    body: `
      <p style="margin: 0 0 1.25rem 0; line-height: 1.8;">
        Cet email confirme que l’envoi fonctionne correctement depuis votre site.
      </p>
      <p style="margin: 0 0 1.25rem 0; line-height: 1.8;">
        Destinataire : <strong>${escapeHtml(to)}</strong>
      </p>
      <p style="margin: 0; line-height: 1.8;">
        Si vous recevez ce message, la configuration Resend est OK.
      </p>
    `,
    cta: { label: "Ouvrir le site", href: siteConfig.url },
    footerNote: "Email automatique — ne pas répondre.",
  });

  await resend.emails.send({
    from: cfg.fromEmail,
    to,
    subject: "Test — Emails ASMAE Coaching",
    html,
    attachments: [getEmailLogoAttachment()],
  });

  revalidatePath("/admin/settings/emails");
}

export default async function AdminEmailSettingsPage() {
  const role = await getUserRole();
  if (role !== "admin") redirect("/dashboard");

  const cfg = getEmailConfigSnapshot();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            Emails
          </h1>
          <p className="text-sm text-text/70 mt-1">
            Statut d’envoi, test et aperçu des emails.
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
          <h2 className="font-heading text-xl text-heading mb-3">Statut</h2>
          <div className="space-y-2 text-sm text-text/80">
            <p>
              <span className="font-semibold text-heading">Resend :</span>{" "}
              {cfg.resendConfigured ? "Configuré" : "Non configuré"}
            </p>
            <p>
              <span className="font-semibold text-heading">From :</span>{" "}
              {cfg.fromEmail}
            </p>
            <p>
              <span className="font-semibold text-heading">Email coach :</span>{" "}
              {cfg.coachEmail}
            </p>
            {!cfg.resendConfigured && (
              <p className="text-text/70">
                Ajoutez <code>RESEND_API_KEY</code> dans <code>.env.local</code>{" "}
                pour activer l’envoi.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">
            Envoyer un email de test
          </h2>
          <p className="text-sm text-text/70 mb-4">
            Envoie un email de test vers une adresse de votre choix.
          </p>
          <form action={sendTestEmail} className="flex flex-col sm:flex-row gap-3">
            <input
              name="to"
              type="email"
              placeholder="Adresse email (ex: vous@gmail.com)"
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3"
              required
            />
            <button
              type="submit"
              disabled={!cfg.resendConfigured}
              className="rounded-full bg-primary px-5 py-2.5 text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Envoyer
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="font-heading text-xl text-heading mb-3">À savoir</h2>
          <ul className="space-y-2 text-sm text-text/80 list-disc pl-5">
            <li>
              Email de contact : envoyé à l’email coach (variable{" "}
              <code>COACH_EMAIL</code>).
            </li>
            <li>
              Emails de réservation / formation : envoyés au client après
              confirmation de paiement.
            </li>
            <li>
              Le logo est intégré directement dans l’email (fonctionne en local).
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

