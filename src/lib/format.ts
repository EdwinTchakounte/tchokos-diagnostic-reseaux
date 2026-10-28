// Formats français (sans données : importable côté client).
export function compact(n: number | null | undefined): string {
  if (n == null) return "—";
  const f = (x: number) => x.toLocaleString("fr-FR", { maximumFractionDigits: x < 10 ? 1 : 0 });
  if (n >= 1e6) return `${(n / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  if (n >= 1e4) return `${f(n / 1e3)} K`;
  return n.toLocaleString("fr-FR");
}

export function dateCourte(d: string | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

