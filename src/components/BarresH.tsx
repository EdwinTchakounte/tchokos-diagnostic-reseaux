// Barres horizontales en HTML/CSS (texte net sur mobile). Une seule couleur pour la série,
// la barre dont on parle est mise en avant en orange ; valeurs écrites en encre, jamais dans la couleur de la série.

export type Barre = { libelle: string; detail?: string; valeur: number; accent?: boolean; note?: string };

export default function BarresH({
  barres,
  format = (v: number) => Math.round(v).toLocaleString("fr-FR"),
  unite,
  titre,
}: {
  barres: Barre[];
  format?: (v: number) => string;
  unite?: string;
  titre: string;
}) {
  const max = Math.max(...barres.map((b) => b.valeur));
  return (
    <figure>
      <figcaption className="text-sm font-semibold text-encre">
        {titre}
        {unite && <span className="font-normal text-encre/50"> · {unite}</span>}
      </figcaption>
      <ul className="mt-3 space-y-2.5">
        {barres.map((b) => (
          <li key={b.libelle} className="group" title={`${b.libelle} : ${format(b.valeur)}${b.detail ? ` (${b.detail})` : ""}`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={`min-w-0 leading-snug ${b.accent ? "font-semibold text-encre" : "text-encre/75"}`}>
                {b.libelle}
                {b.detail && <span className="ml-1.5 text-xs whitespace-nowrap text-encre/45">{b.detail}</span>}
              </span>
              <span className={`shrink-0 tabular-nums ${b.accent ? "font-bold text-encre" : "font-semibold text-encre/70"}`}>{format(b.valeur)}</span>
            </div>
            <div className="mt-1 h-2.5 w-full rounded-full bg-encre/[0.05]">
              <div
                className={`h-full rounded-full transition-[filter] group-hover:brightness-90 ${b.accent ? "bg-orange" : "bg-slate-400"}`}
                style={{ width: `${Math.max(2, (b.valeur / max) * 100)}%` }}
              />
            </div>
            {b.note && <p className="mt-1 text-xs font-semibold text-orange">{b.note}</p>}
          </li>
        ))}
      </ul>
    </figure>
  );
}
