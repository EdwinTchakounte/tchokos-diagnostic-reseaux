#!/usr/bin/env node
// Réduit donnees/contenus.json + donnees/diagnostic.json à ce que le site affiche
// (src/data/site.json : agrégats, tops, vidéos habillées) et génère les médias web légers
// (affiches JPG, extraits MP4, montages). Idempotent : saute ce qui existe déjà.
// ffmpeg est lancé UN À LA FOIS, en `nice -n 10` et `-threads 2` (machine chargée).
//
// Usage : npm run donnees            (tout)
//         npm run donnees -- --sans-video   (ne copie que les données et les affiches)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RACINE = path.resolve(process.env.TCHOKOS_RACINE || path.join(SITE, ".."));
const SOURCE_JSON = path.join(RACINE, "donnees", "contenus.json");
const SOURCE_DIAG = path.join(RACINE, "donnees", "diagnostic.json");
const LOGO = process.env.TCHOKOS_LOGO || path.join(process.env.HOME || "", "Desktop", "tchokos", "logo_tchokos.jpeg");
const MEDIA = path.join(SITE, "public", "media");
const DATA_DIR = path.join(SITE, "src", "data");
const SANS_VIDEO = process.argv.includes("--sans-video");

// Réglages
const EXTRAIT_DEBUT = 4; // s : après le titre d'ouverture (3,5 s)
const EXTRAIT_DUREE = 13; // s
const AFFICHE_HAB_T = 1.8; // s : le titre d'ouverture est visible
const AFFICHE_ORIG_T = 1.8; // s : même instant sur l'original

function trouverFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  const py = spawnSync("python3", ["-P", "-c", "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"], { encoding: "utf8" });
  if (py.status === 0 && py.stdout.trim()) return py.stdout.trim();
  const w = spawnSync("which", ["ffmpeg"], { encoding: "utf8" });
  if (w.status === 0 && w.stdout.trim()) return w.stdout.trim();
  throw new Error("ffmpeg introuvable (définir FFMPEG=/chemin/vers/ffmpeg)");
}

const FF = trouverFfmpeg();
const stats = { faits: 0, sautes: 0, echecs: [] };

function existe(f) {
  try {
    return fs.statSync(f).size > 0;
  } catch {
    return false;
  }
}

// Lance ffmpeg vers un fichier temporaire puis renomme (un rendu tué ne laisse rien de partiel).
function ffmpeg(sortie, args) {
  if (existe(sortie)) {
    stats.sautes++;
    return true;
  }
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  const ext = path.extname(sortie);
  const tmp = sortie.slice(0, -ext.length) + ".tmp" + ext;
  const r = spawnSync("nice", ["-n", "10", FF, "-hide_banner", "-loglevel", "error", "-y", ...args, tmp], {
    stdio: ["ignore", "inherit", "inherit"],
  });
  if (r.status === 0 && existe(tmp)) {
    fs.renameSync(tmp, sortie);
    stats.faits++;
    console.log("  ✓", path.relative(SITE, sortie));
    return true;
  }
  try {
    fs.unlinkSync(tmp);
  } catch {}
  stats.echecs.push(path.relative(SITE, sortie) + (r.signal ? ` (tué : ${r.signal})` : ` (code ${r.status})`));
  console.warn("  ✗", path.relative(SITE, sortie), r.signal || r.status);
  return false;
}

function affiche(src, sortie, t, largeur = 540) {
  return ffmpeg(sortie, [
    "-threads", "2", ...(t > 0 ? ["-ss", String(t)] : []), "-i", src,
    "-frames:v", "1", "-update", "1", "-vf", `scale=${largeur}:-2`, "-q:v", "5", "-threads", "2",
  ]);
}

function videoLegere(src, sortie, { debut = null, duree = null, largeur, hauteur, maxrate, crf = 28 }) {
  const avant = debut != null ? ["-ss", String(debut)] : [];
  const apres = duree != null ? ["-t", String(duree)] : [];
  return ffmpeg(sortie, [
    "-threads", "2", ...avant, "-i", src, ...apres,
    "-vf", `scale=${largeur}:${hauteur}:force_original_aspect_ratio=decrease,pad=${largeur}:${hauteur}:(ow-iw)/2:(oh-ih)/2,fps=30`,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", String(crf), "-maxrate", maxrate, "-bufsize", "2M",
    "-pix_fmt", "yuv420p", "-profile:v", "main",
    "-c:a", "aac", "-b:a", "64k", "-ac", "2",
    "-movflags", "+faststart", "-threads", "2",
  ]);
}

function duree(src) {
  const r = spawnSync(FF, ["-hide_banner", "-i", src], { encoding: "utf8" });
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr || "");
  return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : null;
}

// Nettoie les fichiers temporaires laissés par un rendu interrompu
function nettoyer(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) nettoyer(f);
    else if (/\.tmp\.[a-z0-9]+$/i.test(e.name)) fs.unlinkSync(f);
  }
}
nettoyer(MEDIA);

// ------------------------------------------------------------------ données
const contenus = JSON.parse(fs.readFileSync(SOURCE_JSON, "utf8"));
const diagnostic = fs.existsSync(SOURCE_DIAG) ? JSON.parse(fs.readFileSync(SOURCE_DIAG, "utf8")) : null;
const toutes = Array.isArray(contenus.publications)
  ? contenus.publications
  : Object.entries(contenus.publications || {}).flatMap(([r, l]) => l.map((p) => ({ reseau: r, ...p })));

// Le site ne charge pas les ~2 000 publications : seulement les agrégats, les tops et les vidéos habillées.
const somme = (l, k) => l.reduce((t, p) => t + (p[k] ?? 0), 0);
const parReseau = {};
for (const p of toutes) (parReseau[p.reseau] ??= []).push(p);
const agregats = Object.fromEntries(
  Object.entries(parReseau).map(([r, l]) => [
    r,
    { publications: l.length, vues: somme(l, "vues"), reactions: somme(l, "reactions"), commentaires: somme(l, "commentaires"), partages: somme(l, "partages") },
  ]),
);
const leger = ({ reseau, id, url, date, legende, duree_s, vues, reactions, commentaires, partages, video_habillee }) => ({
  reseau, id, url, date, legende: (legende || "").slice(0, 160), duree_s, vues, reactions, commentaires, partages, video_habillee,
});
const parVues = (a, b) => (b.vues ?? 0) - (a.vues ?? 0);
const garder = new Map();
for (const p of toutes.filter((p) => p.video_habillee)) garder.set(`${p.reseau}-${p.id}`, p);
for (const [r, l] of Object.entries(parReseau)) for (const p of l.slice().sort(parVues).slice(0, r === "facebook" ? 12 : 10)) garder.set(`${p.reseau}-${p.id}`, p);

const site = {
  genere_le: contenus.genere_le ?? null,
  reseaux: contenus.reseaux ?? [],
  agregats,
  publications: [...garder.values()].map(leger),
  montages: contenus.montages ?? [],
  couverture: contenus.couverture ?? [],
  diagnostic: diagnostic ? { ...diagnostic, top_tiktok: (diagnostic.top_tiktok || []).slice(0, 10) } : null,
};
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, "site.json"), JSON.stringify(site));
try { fs.unlinkSync(path.join(DATA_DIR, "contenus.json")); } catch {}
console.log(`Données réduites : ${toutes.length} publications → ${site.publications.length} gardées (src/data/site.json, ${(fs.statSync(path.join(DATA_DIR, "site.json")).size / 1024).toFixed(0)} Ko)`);

const medias = { publications: {}, montages: {} , logo: null };

// Logo
// Logo rond détouré (identite/logo-tchokos-rond.png), copié tel quel dans public/media/logo-tchokos.png
const LOGO_ROND = path.join(RACINE, "identite", "logo-tchokos-rond.png");
const logoSortie = path.join(MEDIA, "logo-tchokos.png");
if (fs.existsSync(logoSortie) || (fs.existsSync(LOGO_ROND) && affiche(LOGO_ROND, logoSortie, 0, 240))) {
  medias.logo = "/media/logo-tchokos.png";
}

// ------------------------------------------------------------------ publications
const pubs = toutes;

for (const p of pubs) {
  if (!p.video_habillee) continue;
  const reseau = p.reseau || "facebook";
  const hab = path.join(RACINE, p.video_habillee);
  if (!fs.existsSync(hab)) continue;
  const base = `${reseau}-${p.id}`;
  console.log("•", base);
  const m = {};
  const aff = path.join(MEDIA, "habillees", `${base}.jpg`);
  if (affiche(hab, aff, AFFICHE_HAB_T)) m.affiche = `/media/habillees/${base}.jpg`;
  if (!SANS_VIDEO) {
    const d = duree(hab) || 30;
    const debut = d > EXTRAIT_DEBUT + EXTRAIT_DUREE + 4 ? EXTRAIT_DEBUT : Math.max(0, Math.min(EXTRAIT_DEBUT, d - EXTRAIT_DUREE - 4));
    const ext = path.join(MEDIA, "habillees", `${base}.mp4`);
    if (videoLegere(hab, ext, { debut, duree: EXTRAIT_DUREE, largeur: 540, hauteur: 960, maxrate: "1000k" })) {
      m.extrait = `/media/habillees/${base}.mp4`;
    }
  } else if (existe(path.join(MEDIA, "habillees", `${base}.mp4`))) {
    m.extrait = `/media/habillees/${base}.mp4`;
  }
  if (p.video_source && fs.existsSync(path.join(RACINE, p.video_source))) {
    const orig = path.join(MEDIA, "originaux", `${base}.jpg`);
    if (affiche(path.join(RACINE, p.video_source), orig, AFFICHE_ORIG_T)) m.original = `/media/originaux/${base}.jpg`;
  }
  medias.publications[base] = m;
}

// ------------------------------------------------------------------ montages
for (const mt of contenus.montages || []) {
  const src = path.join(RACINE, mt.fichier);
  if (!fs.existsSync(src)) continue;
  const nom = path.basename(mt.fichier, path.extname(mt.fichier));
  console.log("• montage", nom);
  const m = {};
  const aff = path.join(MEDIA, "montages", `${nom}.jpg`);
  if (affiche(src, aff, 6, 720)) m.affiche = `/media/montages/${nom}.jpg`;
  const vid = path.join(MEDIA, "montages", `${nom}.mp4`);
  if (!SANS_VIDEO ? videoLegere(src, vid, { largeur: 720, hauteur: 1280, maxrate: "1400k" }) : existe(vid)) {
    m.video = `/media/montages/${nom}.mp4`;
  }
  medias.montages[mt.fichier] = m;
}

fs.writeFileSync(path.join(DATA_DIR, "medias.json"), JSON.stringify(medias, null, 1));

// ------------------------------------------------------------------ bilan
function poids(dir) {
  let t = 0;
  if (!fs.existsSync(dir)) return 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    t += e.isDirectory() ? poids(f) : fs.statSync(f).size;
  }
  return t;
}
console.log(`\nFaits : ${stats.faits} · déjà présents : ${stats.sautes} · échecs : ${stats.echecs.length}`);
for (const e of stats.echecs) console.log("  échec :", e);
console.log(`Poids de public/media : ${(poids(MEDIA) / 1048576).toFixed(1)} Mo`);
if (stats.echecs.length) process.exitCode = 1;
