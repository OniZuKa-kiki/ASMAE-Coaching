import { Users, Calendar, CreditCard, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  const stats = [
    { label: "Clients", value: "0", icon: Users, change: "+0%" },
    { label: "Réservations ce mois", value: "0", icon: Calendar, change: "+0%" },
    { label: "Revenus ce mois", value: "0 €", icon: CreditCard, change: "+0%" },
    { label: "Taux de conversion", value: "0%", icon: TrendingUp, change: "+0%" },
  ];

  return (
    <div>
      <h1 className="page-header-title mb-6 sm:mb-8">
        Tableau de bord
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5 text-primary" />
              <span className="text-xs text-primary font-medium">{stat.change}</span>
            </div>
            <p className="text-2xl font-semibold text-heading">{stat.value}</p>
            <p className="text-sm text-text/70">{stat.label}</p>
          </Card>
        ))}
      </div>
      <Card className="text-center py-12">
        <p className="text-text/70">
          Les statistiques détaillées seront disponibles une fois la base de
          données connectée.
        </p>
      </Card>
    </div>
  );
}
