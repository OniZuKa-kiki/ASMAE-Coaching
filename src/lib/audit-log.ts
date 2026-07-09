type AuditEvent = {
  action: string;
  actorId?: string | null;
  actorEmail?: string | null;
  target?: string;
  meta?: Record<string, string | number | boolean | null>;
};

/** Journal structuré — sans données sensibles (pas de mots de passe, cartes, etc.) */
export function auditLog(event: AuditEvent) {
  const entry = {
    ts: new Date().toISOString(),
    ...event,
  };
  console.info("[audit]", JSON.stringify(entry));
}
