// Lecture et mise en forme des données (src/data, recopiées par `npm run donnees`).
import site from "@/data/site.json";
import medias from "@/data/medias.json";

export type Reseau = {
  reseau: string;
  nom: string;
  url: string;
  abonnes: number | null;
  likes?: number | null;
  publications?: number | null;
  vues_cumulees?: number | null;
  releve_le?: string | null;
  note?: string;
};

export type Publication = {
  reseau: string;
  id: string;
  url: string;
  date: string | null;
  legende: string;
  duree_s?: number | null;
  vues: number | null;
  reactions?: number | null;
  commentaires?: number | null;
  partages?: number | null;
  video_source?: string | null;
  video_habillee?: string | null;
};

export type Couverture = { chaine: string; titre: string; vues: number | null; url: string };

export type Media = { affiche?: string; extrait?: string; original?: string };

export type VideoHabillee = Publication & {
  cle: string;
  titre: string;
  theme: Theme;
  media: Media;
};

export type Agregat = { publications: number; vues: number; reactions: number; commentaires: number; partages: number };
type Stat = { videos: number; vues: number; vues_mediane: number; vues_moyenne: number; engagement_pct: number };
export type Diagnostic = {
  periode_tiktok: [string, string];
  tiktok: {
    videos: number; vues: number; vues_mediane: number; vues_moyenne: number; engagement_pct: number; likes: number;
    commentaires: number; partages: number; publications_par_jour: number; seuil_top10_vues: number;
    part_avec_appel_action_pct: number; vues_mediane_avec_appel_action: number; part_sans_legende_pct: number;
  };
  facebook: { reels_releves: number; vues: number; reactions: number; commentaires: number; partages: number };
  par_mois: (Stat & { mois: string; par_jour: number })[];
  par_jour: (Stat & { jour: string })[];
  par_creneau: (Stat & { creneau: string })[];
  par_theme: (Stat & { theme: string })[];
  par_duree: (Stat & { duree: string })[];
  top_tiktok: { id: string; date: string; vues: number; likes: number; commentaires: number; partages: number; legende: string; url: string }[];
};

type Contenus = {
  genere_le?: string;
  agregats?: Record<string, Agregat>;
  diagnostic?: Diagnostic | null;
  reseaux: Reseau[];
  publications: Publication[] | Record<string, Publication[]>;
  montages: { fichier: string; titre: string }[];
  couverture?: Couverture[];
};

const C = site as unknown as Contenus;
const M = medias as unknown as {
  logo: string | null;
  publications: Record<string, Media>;
  montages: Record<string, { affiche?: string; video?: string }>;
};

export const genereLe = C.genere_le ?? null;
export const reseaux: Reseau[] = C.reseaux ?? [];
export const publications: Publication[] = Array.isArray(C.publications)
  ? C.publications
  : Object.entries(C.publications).flatMap(([reseau, liste]) => liste.map((p) => ({ ...p, reseau: p.reseau ?? reseau })));
export const couverture: Couverture[] = (C.couverture ?? []).slice().sort((a, b) => (b.vues ?? 0) - (a.vues ?? 0));
export const logo = M.logo;
export const agregats = C.agregats ?? {};
export const diagnostic = C.diagnostic ?? null;

export const parReseau = (r: string) => publications.filter((p) => p.reseau === r);

const somme = (l: Publication[], k: "vues" | "reactions" | "commentaires" | "partages") =>
  l.reduce((t, p) => t + (p[k] ?? 0), 0);

// ------------------------------------------------------------------ chiffres clés
const fbA = agregats.facebook;
const ttD = diagnostic?.tiktok;
export const chiffres = {
  abonnes: reseaux.reduce((t, r) => t + (r.abonnes ?? 0), 0),
  likesProfilTiktok: reseaux.find((r) => r.reseau === "tiktok")?.likes ?? 0,
  vuesTiktok: ttD?.vues ?? agregats.tiktok?.vues ?? 0,
  videosTiktok: ttD?.videos ?? agregats.tiktok?.publications ?? 0,
  likesTiktok: ttD?.likes ?? 0,
  commentairesTiktok: ttD?.commentaires ?? 0,
  engagementTiktok: ttD?.engagement_pct ?? null,
  reactionsFb: fbA?.reactions ?? somme(parReseau("facebook"), "reactions"),
  commentairesFb: fbA?.commentaires ?? somme(parReseau("facebook"), "commentaires"),
  vuesFb: fbA?.vues ?? 0,
  nbFacebook: fbA?.publications ?? parReseau("facebook").length,
  nbYoutube: agregats.youtube?.publications ?? 0,
};

/** Nombre de mois couverts par la période TikTok (ex. 27/08/2025 → 12/10/2026 ≈ 14 mois). */
export function moisPeriode(): number | null {
  if (!diagnostic) return null;
  const [a, b] = diagnostic.periode_tiktok.map((d) => new Date(d + "T12:00:00"));
  return Math.round((b.getTime() - a.getTime()) / (30.44 * 864e5));
}

export { compact, dateCourte } from "./format";

export function taux(p: Publication): number | null {
  if (!p.vues || p.reactions == null) return null;
  return ((p.reactions ?? 0) + (p.commentaires ?? 0) + (p.partages ?? 0)) / p.vues;
}

// ------------------------------------------------------------------ titres et thèmes
const ACCENTS: Record<string, string> = {
  a: "à", merite: "mérité", journee: "journée", debut: "début", dejeuner: "déjeuner", determine: "détermine",
  recu: "reçu", ingenieurs: "ingénieurs", apprecie: "apprécie", apprecions: "apprécions", phenix: "Phénix",
  mbappe: "Mbappé", graces: "grâces", tchokos: "Tchokos", apres: "après", profondement: "profondément", logpom: "Logpom", reve: "rêve",
  equipe: "équipe", fete: "fête", deja: "déjà", etoile: "Étoile", ou: "où", tres: "très", annee: "année",
  premiere: "première", cote: "côté", noel: "Noël", ete: "été", rentree: "rentrée", qualite: "qualité",
};

const sansAccent = (m: string) => m.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function titreDepuisFichier(chemin: string, legende = ""): string {
  const base = chemin.split("/").pop()!.replace(/\.mp4$/i, "");
  const slug = base.replace(/^\d+-/, "").replace(/^\d+-/, "");
  // Noms propres : on reprend la graphie de la légende quand elle est en majuscule (Akezouu, Yvan Grill…)
  const formes = new Map<string, string>();
  for (const [i, m] of legende.split(/[^\p{L}\d]+/u).filter(Boolean).entries()) {
    if (i > 0 && /^\p{Lu}/u.test(m) && !formes.has(sansAccent(m))) formes.set(sansAccent(m), m.length > 3 && m === m.toUpperCase() ? m.charAt(0) + m.slice(1).toLowerCase() : m);
  }
  let t = slug
    .split("-")
    .map((m) => formes.get(m) || ACCENTS[m] || m)
    .join(" ")
    .replace(/\b([cdjlmnst]|qu) (?=[aeiouyhéèêàâ])/gi, "$1'");
  t = t.replace(/tchokos plus/gi, "Tchokos Plus");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export const THEMES = ["Tchokos Plus", "Arrivages", "Visites & communauté", "Inspiration"] as const;
export type Theme = (typeof THEMES)[number];

export function theme(titre: string, legende = ""): Theme {
  const t = (titre + " " + legende).toLowerCase();
  if (/tchokos plus|chantier|travail continue|nouveau logo|fausses pages|logpom/.test(t)) return "Tchokos Plus";
  if (/arrivage|draps|taies|petit prix|chaussure|\bsacs?\b|mocassin/.test(t)) return "Arrivages";
  if (/merci|visite|famille|partenaire|rencontre|repas|cadeau|voisin|jeunes|ingénieur|directeur|akezouu|gagnant|pain poulet|borrador|kids|visiteurs|cosmetics|ballon/.test(t))
    return "Visites & communauté";
  return "Inspiration";
}

export const videosHabillees: VideoHabillee[] = publications
  .filter((p) => p.video_habillee)
  .map((p) => {
    const cle = `${p.reseau}-${p.id}`;
    const titre = titreDepuisFichier(p.video_habillee!, p.legende);
    return { ...p, cle, titre, theme: theme(titre, p.legende), media: M.publications[cle] ?? {} };
  })
  .filter((v) => v.media.affiche);

export const montages = (C.montages ?? []).map((m) => {
  const titre = m.titre.charAt(0).toUpperCase() + m.titre.slice(1);
  return {
    ...m,
    titre: titre.replace(/^Tchokos plus/i, "Tchokos Plus").replace(/tchokos$/i, "Tchokos"),
    media: M.montages[m.fichier] ?? {},
  };
}).filter((m) => m.media.video);

// Avant / après : une vidéo par thème parmi les plus vues, avec original et extrait.
export function avantApres(n = 3): VideoHabillee[] {
  const dispo = videosHabillees.filter((v) => v.media.original && v.media.extrait).sort((a, b) => (b.vues ?? 0) - (a.vues ?? 0));
  const choix: VideoHabillee[] = [];
  for (const th of THEMES) {
    const v = dispo.find((x) => x.theme === th && !choix.includes(x));
    if (v) choix.push(v);
    if (choix.length >= n) break;
  }
  for (const v of dispo) if (choix.length < n && !choix.includes(v)) choix.push(v);
  return choix;
}

export function legendePropre(l: string, max = 90): string {
  const t = l.replace(/#\S+/g, "").replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}
