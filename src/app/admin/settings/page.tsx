import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  Globe,
  Mail,
  MessageSquare,
  Video,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { adminUrl } from "@/lib/admin-path";
import { cn } from "@/lib/utils";

type SettingsItem = {
  href: string;
  titleKey: string;
  descriptionKey: string;
  actionKey: "manage" | "view";
  icon: LucideIcon;
};

type SettingsGroup = {
  titleKey: string;
  descriptionKey: string;
  items: SettingsItem[];
};

const settingsGroups: SettingsGroup[] = [
  {
    titleKey: "bookings.title",
    descriptionKey: "bookings.description",
    items: [
      {
        href: adminUrl("/settings/availability"),
        titleKey: "availability.title",
        descriptionKey: "availability.description",
        actionKey: "manage",
        icon: CalendarClock,
      },
      {
        href: adminUrl("/settings/visio"),
        titleKey: "visio.title",
        descriptionKey: "visio.description",
        actionKey: "manage",
        icon: Video,
      },
    ],
  },
  {
    titleKey: "clients.title",
    descriptionKey: "clients.description",
    items: [
      {
        href: adminUrl("/settings/intake-forms"),
        titleKey: "intakeForms.title",
        descriptionKey: "intakeForms.description",
        actionKey: "view",
        icon: ClipboardList,
      },
    ],
  },
  {
    titleKey: "communication.title",
    descriptionKey: "communication.description",
    items: [
      {
        href: adminUrl("/settings/communication"),
        titleKey: "communication.title",
        descriptionKey: "communication.description",
        actionKey: "manage",
        icon: MessageSquare,
      },
      {
        href: adminUrl("/settings/emails"),
        titleKey: "emails.title",
        descriptionKey: "emails.description",
        actionKey: "manage",
        icon: Mail,
      },
    ],
  },
  {
    titleKey: "languages.title",
    descriptionKey: "languages.description",
    items: [
      {
        href: adminUrl("/settings/languages"),
        titleKey: "languages.title",
        descriptionKey: "languages.description",
        actionKey: "manage",
        icon: Globe,
      },
    ],
  },
  {
    titleKey: "analytics.title",
    descriptionKey: "analytics.description",
    items: [
      {
        href: adminUrl("/settings/search-insights"),
        titleKey: "searchInsights.title",
        descriptionKey: "searchInsights.description",
        actionKey: "view",
        icon: BarChart3,
      },
    ],
  },
];

function SettingsCard({
  item,
  title,
  description,
  actionLabel,
}: {
  item: SettingsItem;
  title: string;
  description: string;
  actionLabel: string;
}) {
  const Icon = item.icon;

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-heading">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-text/70">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-auto pt-2">
        <Link
          href={item.href}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {actionLabel}
        </Link>
      </div>
    </Card>
  );
}

export default async function AdminSettingsPage() {
  const [t, tGroups, tItems, tCommon] = await Promise.all([
    getTranslations("admin.settingsHub"),
    getTranslations("admin.settingsHub.groups"),
    getTranslations("admin.settingsHub.items"),
    getTranslations("admin.common"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-header-title">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-text/70">{t("subtitle")}</p>
      </div>

      <div className="space-y-10">
        {settingsGroups.map((group) => (
          <section key={group.titleKey}>
            <div className="mb-4">
              <h2 className="font-heading text-xl font-semibold text-heading">
                {tGroups(group.titleKey)}
              </h2>
              <p className="mt-1 text-sm text-text/60">
                {tGroups(group.descriptionKey)}
              </p>
            </div>
            <div
              className={cn(
                "grid gap-4",
                group.items.length > 1 ? "md:grid-cols-2" : "max-w-xl"
              )}
            >
              {group.items.map((item) => (
                <SettingsCard
                  key={item.href}
                  item={item}
                  title={tItems(item.titleKey)}
                  description={tItems(item.descriptionKey)}
                  actionLabel={tCommon(item.actionKey)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
