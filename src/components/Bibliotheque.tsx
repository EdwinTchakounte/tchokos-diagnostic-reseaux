"use client";
import { useMemo, useState } from "react";
import LecteurVideo from "./LecteurVideo";
import { compact, dateCourte } from "@/lib/format";
import type { VideoHabillee } from "@/lib/donnees";

const THEME_COURT: Record<string, string> = { "Visites & communauté": "Communauté" };

const TRIS = {
  vues: { label: "Plus vues", f: (v: VideoHabillee) => v.vues ?? 0 },
  reactions: { label: "Plus de réactions", f: (v: VideoHabillee) => v.reactions ?? 0 },
  commentaires: { label: "Plus commentées", f: (v: VideoHabillee) => v.commentaires ?? 0 },
  date: { label: "Plus récentes", f: (v: VideoHabillee) => (v.date ? Date.parse(v.date) : 0) },
} as const;
type Tri = keyof typeof TRIS;

const PAS = 12;

const NOM_RESEAU: Record<string, string> = { facebook: "Facebook", tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube" };

export default function Bibliotheque({ videos, themes }: { videos: VideoHabillee[]; themes: readonly string[] }) {
  const [theme, setTheme] = useState<string>("Tous");
  const [tri, setTri] = useState<Tri>("vues");
  const [nb, setNb] = useState(PAS);

  const liste = useMemo(() => {
    const l = theme === "Tous" ? videos : videos.filter((v) => v.theme === theme);
    return l.slice().sort((a, b) => TRIS[tri].f(b) - TRIS[tri].f(a));
  }, [videos, theme, tri]);

  const compte = (t: string) => (t === "Tous" ? videos.length : videos.filter((v) => v.theme === t).length);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="defile -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Thèmes">
          {["Tous", ...themes].filter((t) => compte(t) > 0).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={theme === t}
              onClick={() => {
                setTheme(t);
                setNb(PAS);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                theme === t ? "bg-encre text-white shadow" : "bg-white text-encre/70 ring-1 ring-encre/10 hover:ring-orange/40"
              }`}
            >
              {t} <span className={theme === t ? "text-or" : "text-encre/40"}>{compte(t)}</span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-encre/60">
          Trier
          <select
            value={tri}
            onChange={(e) => setTri(e.target.value as Tri)}
            className="rounded-full bg-white px-3 py-2 font-semibold text-encre ring-1 ring-encre/10"
          >
            {Object.entries(TRIS).map(([k, t]) => (
              <option key={k} value={k}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {liste.slice(0, nb).map((v) => (
          <li key={v.cle} className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-encre/5">
            <LecteurVideo affiche={v.media.affiche!} src={v.media.extrait} titre={v.titre} arrondi="rounded-none" />
            <div className="flex flex-1 flex-col gap-2 p-3">
              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide">
                <span className="truncate text-orange">{THEME_COURT[v.theme] ?? v.theme}</span>
                <span className="shrink-0 text-encre/40">{dateCourte(v.date)}</span>
              </div>
              <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{v.titre}</h3>
              <dl className="mt-auto grid grid-cols-3 gap-1 text-center text-[11px] text-encre/50">
                <div className="rounded-lg bg-creme px-1 py-1.5">
                  <dd className="text-sm font-bold text-encre">{compact(v.vues)}</dd>
                  <dt>vues</dt>
                </div>
                <div className="rounded-lg bg-creme px-1 py-1.5">
                  <dd className="text-sm font-bold text-encre">{compact(v.reactions)}</dd>
                  <dt>réact.</dt>
                </div>
                <div className="rounded-lg bg-creme px-1 py-1.5">
                  <dd className="text-sm font-bold text-encre">{compact(v.commentaires)}</dd>
                  <dt>comm.</dt>
                </div>
              </dl>
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-orange underline-offset-2 hover:underline"
              >
                Voir sur {NOM_RESEAU[v.reseau] ?? v.reseau} ↗
              </a>
            </div>
          </li>
        ))}
      </ul>

      {nb < liste.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setNb((n) => n + PAS)}
            className="rounded-full bg-encre px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange"
          >
            Afficher plus ({liste.length - nb} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
