"use client";
import { useState } from "react";

type Jour = { jour: string; format: string; sujet: string; reseaux: string; vedette?: boolean };

const SEMAINES: { titre: string; fil: string; jours: Jour[] }[] = [
  {
    titre: "Tchokos Plus arrive",
    fil: "Teasing du nouveau magasin : chantier, compte à rebours, emplacement.",
    jours: [
      { jour: "Lun", format: "Reel habillé", sujet: "Le chantier Tchokos Plus, J-28", reseaux: "FB · TikTok · IG" },
      { jour: "Mar", format: "Story + sondage", sujet: "« Quel rayon voulez-vous en premier ? »", reseaux: "FB · IG" },
      { jour: "Mer", format: "Reel produit", sujet: "Prix grossiste du jour, lien vers la fiche", reseaux: "FB · TikTok · IG" },
      { jour: "Jeu", format: "Montage 36 s", sujet: "Montage de la semaine", reseaux: "4 réseaux + Shorts", vedette: true },
      { jour: "Ven", format: "Reel habillé", sujet: "Visite de la semaine (#jour)", reseaux: "FB · TikTok" },
      { jour: "Sam", format: "Live boutique", sujet: "Direct depuis Akwa, questions-réponses", reseaux: "TikTok · FB" },
      { jour: "Dim", format: "Carte citation", sujet: "« C'est difficile, mais c'est possible »", reseaux: "FB · IG" },
    ],
  },
  {
    titre: "Arrivages chaussures",
    fil: "Le mur de chaussures, les nouveautés, les prix au carton.",
    jours: [
      { jour: "Lun", format: "Reel habillé", sujet: "Déballage du nouvel arrivage", reseaux: "FB · TikTok · IG" },
      { jour: "Mar", format: "Carrousel", sujet: "5 modèles, 5 prix, tailles dispo", reseaux: "FB · IG" },
      { jour: "Mer", format: "Reel produit", sujet: "Mocassins en cuir, lien vers la fiche", reseaux: "FB · TikTok · IG" },
      { jour: "Jeu", format: "Montage 36 s", sujet: "« Arrivages » de la semaine", reseaux: "4 réseaux + Shorts", vedette: true },
      { jour: "Ven", format: "Reel habillé", sujet: "Un revendeur raconte son achat", reseaux: "FB · TikTok" },
      { jour: "Sam", format: "Live boutique", sujet: "Vente en direct, commande WhatsApp", reseaux: "TikTok · FB" },
      { jour: "Dim", format: "Story", sujet: "Coulisses : la boutique se prépare", reseaux: "FB · IG" },
    ],
  },
  {
    titre: "Sacs, vêtements, maison",
    fil: "Montrer tout le catalogue, au-delà des chaussures.",
    jours: [
      { jour: "Lun", format: "Reel habillé", sujet: "Arrivage sacs et ceintures", reseaux: "FB · TikTok · IG" },
      { jour: "Mar", format: "Story + quiz", sujet: "« Devinez le prix »", reseaux: "FB · IG" },
      { jour: "Mer", format: "Reel produit", sujet: "Draps et taies à petit prix, lien fiche", reseaux: "FB · TikTok · IG" },
      { jour: "Jeu", format: "Montage 36 s", sujet: "Le catalogue en 36 secondes", reseaux: "4 réseaux + Shorts", vedette: true },
      { jour: "Ven", format: "Reel habillé", sujet: "Partenaire ou visite de la semaine", reseaux: "FB · TikTok" },
      { jour: "Sam", format: "Live boutique", sujet: "Spécial revendeurs : prix de gros", reseaux: "TikTok · FB" },
      { jour: "Dim", format: "Vidéo longue", sujet: "Le meilleur du mois en 5 min", reseaux: "YouTube" },
    ],
  },
  {
    titre: "La famille Tchokos",
    fil: "La communauté, les visites, le bilan du mois.",
    jours: [
      { jour: "Lun", format: "Reel habillé", sujet: "Merci pour la visite", reseaux: "FB · TikTok · IG" },
      { jour: "Mar", format: "Story", sujet: "Vos photos avec Tchokos (repartage)", reseaux: "FB · IG" },
      { jour: "Mer", format: "Reel produit", sujet: "Le best-seller du mois, lien fiche", reseaux: "FB · TikTok · IG" },
      { jour: "Jeu", format: "Montage 36 s", sujet: "« La famille Tchokos »", reseaux: "4 réseaux + Shorts", vedette: true },
      { jour: "Ven", format: "Reel jeu", sujet: "Concours : qui sera le prochain gagnant ?", reseaux: "FB · TikTok" },
      { jour: "Sam", format: "Live boutique", sujet: "Tirage du gagnant en direct", reseaux: "TikTok · FB" },
      { jour: "Dim", format: "Bilan", sujet: "Les chiffres du mois, partagés avec vous", reseaux: "Rapport privé" },
    ],
  },
];

export default function Calendrier() {
  const [s, setS] = useState(0);
  const sem = SEMAINES[s];
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-encre/5 sm:p-6">
      <div className="defile -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Semaines">
        {SEMAINES.map((x, i) => (
          <button
            key={x.titre}
            type="button"
            role="tab"
            aria-selected={i === s}
            onClick={() => setS(i)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-left transition ${
              i === s ? "bg-orange text-white shadow" : "bg-creme text-encre/70 hover:bg-orange/10"
            }`}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-wider opacity-80">Semaine {i + 1}</span>
            <span className="block text-sm font-semibold whitespace-nowrap">{x.titre}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-encre/60">{sem.fil}</p>
      <ol className="mt-4 grid gap-2 md:grid-cols-7">
        {sem.jours.map((j) => (
          <li
            key={j.jour}
            className={`flex gap-3 rounded-2xl p-3 md:flex-col md:gap-2 ${j.vedette ? "bg-encre text-white" : "bg-creme"}`}
          >
            <span
              className={`titre grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
                j.vedette ? "bg-or text-encre" : "bg-white text-orange"
              }`}
            >
              {j.jour}
            </span>
            <div className="min-w-0">
              <p className={`text-[11px] font-semibold uppercase tracking-wide ${j.vedette ? "text-or" : "text-orange"}`}>{j.format}</p>
              <p className="text-sm leading-snug font-semibold">{j.sujet}</p>
              <p className={`mt-1 text-xs ${j.vedette ? "text-white/60" : "text-encre/50"}`}>{j.reseaux}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
