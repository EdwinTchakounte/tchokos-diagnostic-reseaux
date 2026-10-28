"use client";
import { useState } from "react";

// Petits multiples alignés sur le même axe des mois (un axe Y par panneau, jamais deux échelles sur un même tracé).
// Survol ou toucher d'un mois : la colonne est mise en avant et ses chiffres s'affichent au-dessus.

export type Mois = { mois: string; videos: number; vues: number; vues_mediane: number; engagement_pct: number; partiel?: boolean };

type Panneau = {
  titre: string;
  cle: "videos" | "vues" | "vues_mediane" | "engagement_pct";
  type: "barres" | "ligne";
  couleur: string;
  /** indices des points étiquetés directement */
  etiquettes?: number[];
  /** l'axe Y part de zéro (toujours pour des barres) */
  min?: number;
};

const ORANGE = "#ea580c";
const ENCRE = "#0f172a";
const GRILLE = "#e7e2da";
const TEXTE2 = "#64748b";

const NOMS_MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const INITIALES = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function nomMois(m: string) {
  const [a, mm] = m.split("-").map(Number);
  return `${NOMS_MOIS[mm - 1]} ${a}`;
}

function fmt(cle: Panneau["cle"], v: number): string {
  if (cle === "engagement_pct") return `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
  if (cle === "vues") return `${(v / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  return Math.round(v).toLocaleString("fr-FR");
}

function graduations(max: number, n = 3): number[] {
  const brut = max / n;
  const p = 10 ** Math.floor(Math.log10(brut));
  const pas = [1, 2, 2.5, 5, 10].map((k) => k * p).find((k) => k >= brut) ?? brut;
  const t: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += pas) t.push(v);
  if (t[t.length - 1] < max) t.push(t[t.length - 1] + pas);
  return t;
}

export default function GraphiqueMois({ donnees, panneaux, legende }: { donnees: Mois[]; panneaux: Panneau[]; legende?: string }) {
  const [actif, setActif] = useState<number | null>(null);
  const L = 360;
  const G = 34; // marge gauche (axe)
  const D = 8;
  const HP = 92; // hauteur d'un tracé
  const ENT = 26; // titre du panneau
  const ESP = 14;
  const AXE = 30;
  const n = donnees.length;
  const pasX = (L - G - D) / n;
  const x = (i: number) => G + pasX * i + pasX / 2;
  const hauteur = panneaux.length * (ENT + HP + ESP) + AXE;
  const sel = actif ?? null;
  const m = sel != null ? donnees[sel] : null;

  return (
    <figure className="w-full">
      <div className="min-h-[3.25rem] rounded-xl bg-creme px-3 py-2 text-sm" aria-live="polite">
        {m ? (
          <>
            <p className="font-semibold">
              {nomMois(m.mois)}
              {m.partiel && <span className="ml-1 text-xs font-normal text-encre/50">(mois incomplet)</span>}
            </p>
            <p className="text-encre/70">
              {m.videos} vidéos · {fmt("vues_mediane", m.vues_mediane)} vues médianes · {fmt("vues", m.vues)} vues · engagement{" "}
              {fmt("engagement_pct", m.engagement_pct)}
            </p>
          </>
        ) : (
          <p className="pt-1.5 text-encre/50">Touchez ou survolez un mois pour voir ses chiffres.</p>
        )}
      </div>
      <svg
        viewBox={`0 0 ${L} ${hauteur}`}
        className="mt-2 block h-auto w-full select-none"
        role="img"
        aria-label={legende}
        onMouseLeave={() => setActif(null)}
      >
        <defs>
          <pattern id="hachures" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="4" fill="#cbd5e1" />
            <line x1="0" y1="0" x2="0" y2="4" stroke="#f8fafc" strokeWidth="2" />
          </pattern>
        </defs>
        {panneaux.map((p, k) => {
          const y0 = k * (ENT + HP + ESP);
          const base = y0 + ENT + HP;
          const valeurs = donnees.map((d) => d[p.cle]);
          const max = Math.max(...valeurs);
          const ticks = graduations(max);
          const top = ticks[ticks.length - 1];
          const lo = p.type === "barres" ? 0 : p.min ?? 0;
          const y = (v: number) => base - ((v - lo) / (top - lo)) * HP;
          const largeur = Math.max(4, pasX - 4);
          const chemin = donnees
            .map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d[p.cle]).toFixed(1)}`)
            .join(" ");
          return (
            <g key={p.cle}>
              <text x={0} y={y0 + 14} fontSize="11.5" fontWeight="600" fill={ENCRE}>
                {p.titre}
              </text>
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={G} x2={L - D} y1={y(t)} y2={y(t)} stroke={GRILLE} strokeWidth="1" />
                  <text x={G - 5} y={y(t) + 3.5} fontSize="9" textAnchor="end" fill={TEXTE2}>
                    {p.cle === "engagement_pct" ? `${t} %` : t >= 1e6 ? `${t / 1e6} M` : t >= 1e3 ? `${t / 1e3} K` : t}
                  </text>
                </g>
              ))}
              {sel != null && (
                <rect x={x(sel) - pasX / 2} y={y0 + ENT - 4} width={pasX} height={HP + 4} fill={ORANGE} opacity="0.07" rx="3" />
              )}
              {p.type === "barres" &&
                donnees.map((d, i) => {
                  const h = base - y(d[p.cle]);
                  const r = Math.min(4, largeur / 2, h);
                  const xg = x(i) - largeur / 2;
                  // barre à bout arrondi (4 px) ancrée sur la ligne de base
                  const dPath = `M${xg},${base} V${base - h + r} Q${xg},${base - h} ${xg + r},${base - h} H${xg + largeur - r} Q${xg + largeur},${base - h} ${xg + largeur},${base - h + r} V${base} Z`;
                  return (
                    <path
                      key={d.mois}
                      d={dPath}
                      fill={d.partiel ? "url(#hachures)" : sel === i ? ORANGE : p.couleur}
                    />
                  );
                })}
              {p.type === "ligne" && (
                <>
                  <path d={chemin} fill="none" stroke={p.couleur} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  {donnees.map((d, i) => (
                    <circle
                      key={d.mois}
                      cx={x(i)}
                      cy={y(d[p.cle])}
                      r={sel === i ? 4.5 : 3.2}
                      fill={d.partiel ? "#fff" : p.couleur}
                      stroke={d.partiel ? p.couleur : "#fff"}
                      strokeWidth={d.partiel ? 1.5 : 1.5}
                    />
                  ))}
                </>
              )}
              {(p.etiquettes ?? []).map((i) => {
                const d = donnees[i];
                if (!d) return null;
                const yy = y(d[p.cle]) - 7;
                const ancre = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
                return (
                  <text
                    key={i}
                    x={i === 0 ? x(i) - pasX / 2 + 1 : x(i)}
                    y={Math.max(y0 + ENT + 6, yy)}
                    fontSize="10.5"
                    fontWeight="700"
                    textAnchor={ancre}
                    fill={ENCRE}
                    stroke="#fff"
                    strokeWidth="3"
                    paintOrder="stroke"
                  >
                    {fmt(p.cle, d[p.cle])}
                  </text>
                );
              })}
            </g>
          );
        })}
        {/* axe des mois */}
        {donnees.map((d, i) => {
          const [a, mm] = d.mois.split("-").map(Number);
          const yb = hauteur - AXE + 12;
          return (
            <g key={d.mois}>
              <text x={x(i)} y={yb} fontSize="9.5" textAnchor="middle" fill={sel === i ? ORANGE : TEXTE2} fontWeight={sel === i ? 700 : 400}>
                {INITIALES[mm - 1]}
              </text>
              {(i === 0 || mm === 1) && (
                <text x={x(i) - pasX / 2 + 1} y={yb + 13} fontSize="9.5" fill={ENCRE} fontWeight="600">
                  {a}
                </text>
              )}
            </g>
          );
        })}
        {/* zones de survol / toucher, plus larges que les marques */}
        {donnees.map((d, i) => (
          <rect
            key={d.mois}
            x={x(i) - pasX / 2}
            y={0}
            width={pasX}
            height={hauteur}
            fill="transparent"
            onMouseEnter={() => setActif(i)}
            onClick={() => setActif(i)}
          >
            <title>{nomMois(d.mois)}</title>
          </rect>
        ))}
      </svg>
      {legende && <figcaption className="mt-2 text-xs leading-snug text-encre/50">{legende}</figcaption>}
    </figure>
  );
}
