import Bibliotheque from "@/components/Bibliotheque";
import Calendrier from "@/components/Calendrier";
import Diagnostic from "@/components/Diagnostic";
import Plan from "@/components/Plan";
import LecteurVideo from "@/components/LecteurVideo";
import MontageAuto from "@/components/MontageAuto";
import {
  THEMES,
  avantApres,
  chiffres,
  compact,
  couverture,
  dateCourte,
  diagnostic,
  genereLe,
  moisPeriode,
  legendePropre,
  logo,
  montages,
  parReseau,
  publications,
  reseaux,
  taux,
  videosHabillees,
} from "@/lib/donnees";

const NAV = [
  ["#diagnostic", "Diagnostic"],
  ["#plan", "Notre plan"],
  ["#avant-apres", "Avant / après"],
  ["#montages", "Montages"],
  ["#bibliotheque", "Bibliothèque"],
  ["#contact", "Contact"],
] as const;

const INFOS_RESEAU: Record<string, { nom: string; couleur: string; icone: React.ReactNode }> = {
  facebook: {
    nom: "Facebook",
    couleur: "bg-[#1877f2]",
    icone: <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9H17l.5-4h-4V8.8c0-.5.3-.8.5-.8Z" />,
  },
  tiktok: {
    nom: "TikTok",
    couleur: "bg-encre",
    icone: <path d="M16.5 3c.4 2.4 1.9 4 4.5 4.2v3.4c-1.6 0-3.1-.5-4.4-1.3v6.4c0 3.4-2.6 6.3-6.2 6.3S4 19.2 4 15.8s2.9-6.2 6.5-6.1v3.5c-1.6-.3-3 .9-3 2.6 0 1.5 1.2 2.7 2.8 2.7 1.6 0 2.8-1.2 2.8-3.1V3h3.4Z" />,
  },
  instagram: {
    nom: "Instagram",
    couleur: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    icone: (
      <path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM16.5 3h-9A4.5 4.5 0 0 0 3 7.5v9A4.5 4.5 0 0 0 7.5 21h9a4.5 4.5 0 0 0 4.5-4.5v-9A4.5 4.5 0 0 0 16.5 3Zm2.8 13.5a2.8 2.8 0 0 1-2.8 2.8h-9a2.8 2.8 0 0 1-2.8-2.8v-9a2.8 2.8 0 0 1 2.8-2.8h9a2.8 2.8 0 0 1 2.8 2.8v9Z" />
    ),
  },
  youtube: {
    nom: "YouTube",
    couleur: "bg-[#ff0000]",
    icone: <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />,
  },
};

function Icone({ reseau, className = "h-5 w-5" }: { reseau: string; className?: string }) {
  const i = INFOS_RESEAU[reseau];
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-white`} aria-hidden>
      {i?.icone ?? <circle cx="12" cy="12" r="6" />}
    </svg>
  );
}

function Entete({ surtitre, titre, children, clair = false }: { surtitre: string; titre: React.ReactNode; children?: React.ReactNode; clair?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className={`text-xs font-semibold tracking-[0.2em] uppercase ${clair ? "text-or" : "text-orange"}`}>{surtitre}</p>
      <h2 className={`mt-2 text-[1.75rem] leading-tight font-extrabold sm:text-4xl ${clair ? "text-white" : "text-encre"}`}>{titre}</h2>
      {children && <div className={`mt-3 text-base leading-relaxed ${clair ? "text-white/70" : "text-encre/65"}`}>{children}</div>}
    </div>
  );
}

export default function Page() {
  const fb = parReseau("facebook");
  const tt = parReseau("tiktok");
  const topFb = fb.slice().sort((a, b) => (b.vues ?? 0) - (a.vues ?? 0)).slice(0, 6);
  const topTt = (diagnostic?.top_tiktok ?? tt.map((p) => ({ ...p, likes: p.reactions ?? 0, commentaires: p.commentaires ?? 0, date: p.date ?? "" })))
    .slice()
    .sort((a, b) => (b.vues ?? 0) - (a.vues ?? 0))
    .slice(0, 6);
  const nbMois = moisPeriode();
  const afficheDe = (id: string) => videosHabillees.find((v) => v.id === id)?.media.affiche;
  const aa = avantApres(3);
  const vitrine = videosHabillees.slice().sort((a, b) => (b.vues ?? 0) - (a.vues ?? 0)).slice(0, 3);
  const grands = reseaux.filter((r) => (r.abonnes ?? 0) >= 100000);
  const petits = reseaux.filter((r) => (r.abonnes ?? 0) < 100000);
  const vuesCouverture = couverture.reduce((t, c) => t + (c.vues ?? 0), 0);
  const nbYoutube = chiffres.nbYoutube;


  return (
    <>
      {/* ------------------------------------------------------------ en-tête */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-encre/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
          <a href="#" className="flex min-w-0 items-center gap-2 text-white">
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Tchokos" width={40} height={40} className="h-10 w-10 rounded-full ring-2 ring-or/70" />
            )}
            <span className="titre truncate text-sm font-extrabold tracking-wide">
              TCHOKOS <span className="text-or">×</span> ZAYRA
            </span>
          </a>
          <nav className="hidden items-center gap-5 text-sm text-white/70 lg:flex">
            {NAV.map(([h, l]) => (
              <a key={h} href={h} className="hover:text-white">
                {l}
              </a>
            ))}
          </nav>
          <a href="#contact" className="shrink-0 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-vif">
            Nous contacter
          </a>
        </div>
      </header>

      <main>
        {/* ------------------------------------------------------------ accroche */}
        <section className="relative overflow-hidden bg-encre text-white">
          <div className="pointer-events-none absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-orange/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-or/15 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pt-12 pb-14 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pt-20 lg:pb-20">
            <div>
              {logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Logo Tchokos SARL" width={96} height={96} className="mb-5 h-20 w-20 rounded-full shadow-xl ring-4 ring-or/60 sm:h-24 sm:w-24" />
              )}
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-or" /> Conçu pour Tchokos SARL · Akwa, Douala
              </p>
              <h1 className="mt-5 text-[2.35rem] leading-[1.08] font-extrabold sm:text-6xl">
                Votre audience est énorme. <span className="degrade-texte">Faisons-la vendre.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                Près d&apos;un million de personnes suivent Tchokos. Nous reprenons toutes vos vidéos, nous les retapons avec un habillage pro qui
                donne envie d&apos;acheter, et nous gérons vos publications sur tous vos réseaux. Vous filmez, on s&apos;occupe du reste.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#avant-apres" className="rounded-full bg-orange px-5 py-3 text-sm font-semibold shadow-lg shadow-orange/30 transition hover:bg-orange-vif">
                  Voir l&apos;avant / après
                </a>
                <a href="#offre" className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white/15">
                  Ce qu&apos;on propose
                </a>
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-sm justify-center lg:max-w-md">
              {vitrine.map((v, i) => (
                <div
                  key={v.cle}
                  className={`w-1/3 shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15 ${
                    i === 1 ? "z-10 -mx-3 scale-110" : i === 0 ? "translate-y-4 -rotate-6" : "translate-y-4 rotate-6"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.media.affiche} alt={v.titre} className="aspect-[9/16] w-full object-cover" fetchPriority={i === 1 ? "high" : "auto"} />
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto max-w-6xl px-5 pb-14">
            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                [compact(chiffres.abonnes), "abonnés", `cumulés sur ${reseaux.length} réseaux`],
                [compact(chiffres.vuesTiktok), "vues TikTok", `${chiffres.videosTiktok.toLocaleString("fr-FR")} vidéos${nbMois ? ` en ${nbMois} mois` : ""}`],
                [compact(chiffres.likesTiktok), "j'aime", `${compact(chiffres.commentairesTiktok)} commentaires sur ces vidéos`],
                [compact(chiffres.vuesFb), "vues Facebook", `sur les ${chiffres.nbFacebook} derniers reels relevés`],
              ].map(([n, l, s]) => (
                <div key={l} className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 sm:p-5">
                  <dd className="titre text-3xl font-extrabold text-or sm:text-4xl">{n}</dd>
                  <dt className="mt-1 text-sm font-semibold text-white">{l}</dt>
                  <p className="mt-1 text-xs leading-snug text-white/50">{s}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {diagnostic && <Diagnostic d={diagnostic} reseaux={reseaux} releve={genereLe} />}
        <Plan />

        {/* ------------------------------------------------------------ réseaux */}
        <section id="reseaux" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <Entete surtitre="Vos réseaux" titre="Une audience de star, répartie de façon inégale">
            Facebook et TikTok portent {compact(grands.reduce((t, r) => t + (r.abonnes ?? 0), 0))} abonnés. Instagram et YouTube en comptent à peine{" "}
            {compact(petits.reduce((t, r) => t + (r.abonnes ?? 0), 0))}. Les mêmes vidéos, retapées et publiées partout, c&apos;est de la croissance
            immédiate sur 4 réseaux, sans tourner une minute de plus.
          </Entete>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reseaux.map((r) => {
              const info = INFOS_RESEAU[r.reseau];
              const fort = (r.abonnes ?? 0) >= 100000;
              const second: [string, string][] = [];
              if (r.likes) second.push([compact(r.likes), "j'aime"]);
              if (r.publications) second.push([compact(r.publications), "publications"]);
              if (r.vues_cumulees) second.push([compact(r.vues_cumulees), "vues cumulées"]);
              if (r.reseau === "facebook") second.push([compact(chiffres.reactionsFb), `réactions (${chiffres.nbFacebook} reels)`]);
              return (
                <li key={r.reseau} className="flex flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-encre/5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`grid h-10 w-10 place-items-center rounded-xl ${info?.couleur ?? "bg-encre"}`}>
                      <Icone reseau={r.reseau} />
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${fort ? "bg-green-100 text-green-800" : "bg-or/15 text-amber-800"}`}
                    >
                      {fort ? "Audience forte" : "À relancer"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-encre/60">{info?.nom ?? r.reseau}</p>
                  <p className="titre text-3xl font-extrabold">{compact(r.abonnes)}</p>
                  <p className="text-sm text-encre/50">abonnés</p>
                  {second.length > 0 && (
                    <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {second.map(([n, l]) => (
                        <div key={l}>
                          <dd className="inline font-bold">{n}</dd> <dt className="inline text-encre/50">{l}</dt>
                        </div>
                      ))}
                    </dl>
                  )}
                  {r.note && <p className="mt-3 text-xs leading-snug text-encre/50">{r.note}</p>}
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-4 text-sm font-semibold [overflow-wrap:anywhere] text-orange hover:underline"
                  >
                    {r.nom} ↗
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ------------------------------------------------------------ ce qui marche */}
        <section id="records" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <Entete surtitre="Vos records" titre={`Des vidéos jusqu'à ${compact(topTt[0]?.vues ?? 0).replace(" M", " million").replace(" K", " 000")} de vues`}>
              Vos meilleures vidéos TikTok{nbMois ? ` des ${nbMois} derniers mois` : ""} et vos meilleurs reels Facebook récents. La preuve que le
              contenu est là : il lui manque une vitrine qui transforme ces vues en commandes.
            </Entete>

            <div className="mt-10 grid gap-10">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-extrabold">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#1877f2]">
                    <Icone reseau="facebook" className="h-4 w-4" />
                  </span>
                  Top Facebook
                </h3>
                <ol className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {topFb.map((p, i) => {
                    const aff = afficheDe(p.id);
                    const t = taux(p);
                    const titre = videosHabillees.find((v) => v.id === p.id)?.titre ?? (legendePropre(p.legende, 60) || "Reel");
                    return (
                      <li key={p.id} className="flex gap-3 rounded-2xl bg-creme/60 p-2.5 ring-1 ring-encre/5 sm:gap-4 sm:p-3">
                        <div className="relative w-16 shrink-0 sm:w-20">
                          {aff ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={aff} alt="" loading="lazy" className="aspect-[9/16] w-full rounded-xl object-cover" />
                          ) : (
                            <div className="grid aspect-[9/16] w-full place-items-center rounded-xl bg-[#1877f2]"><Icone reseau="facebook" className="h-6 w-6" /></div>
                          )}
                          <span className="titre absolute -top-1.5 -left-1.5 grid h-7 w-7 place-items-center rounded-full bg-orange text-xs font-extrabold text-white ring-2 ring-white">
                            {i + 1}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold leading-snug">{titre}</p>
                          <p className="text-xs text-encre/50">{dateCourte(p.date)}</p>
                          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                            <div>
                              <dd className="inline font-extrabold text-orange">{compact(p.vues)}</dd> <dt className="inline text-encre/50">vues</dt>
                            </div>
                            <div>
                              <dd className="inline font-bold">{compact(p.reactions)}</dd> <dt className="inline text-encre/50">réact.</dt>
                            </div>
                            <div>
                              <dd className="inline font-bold">{compact(p.commentaires)}</dd> <dt className="inline text-encre/50">comm.</dt>
                            </div>
                            <div>
                              <dd className="inline font-bold">{compact(p.partages)}</dd> <dt className="inline text-encre/50">partages</dt>
                            </div>
                          </dl>
                          {t != null && (
                            <p className="mt-1.5 text-xs text-encre/50">
                              Engagement : <strong className="text-encre">{(t * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %</strong>
                              {" · "}
                              <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-orange hover:underline">
                                voir ↗
                              </a>
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-lg font-extrabold">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-encre">
                    <Icone reseau="tiktok" className="h-4 w-4" />
                  </span>
                  Top TikTok
                </h3>
                <ol className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {topTt.map((p, i) => (
                    <li key={p.id}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-2xl bg-encre p-3 text-white transition hover:bg-encre/90"
                      >
                        <span className="titre grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-extrabold text-or">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-sm leading-snug">{legendePropre(p.legende, 80) || "Vidéo TikTok"}</span>
                          <span className="mt-0.5 block text-[11px] text-white/50">
                            {compact(p.likes)} j&apos;aime · {compact(p.commentaires)} comm. · {dateCourte(p.date)} {p.date?.slice(0, 4)}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="titre block font-extrabold text-or">{compact(p.vues)}</span>
                          <span className="block text-[11px] text-white/50">vues</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ avant / après */}
        <section id="avant-apres" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <Entete surtitre="Avant / après" titre="La même vidéo, retapée pour vendre">
            Même tournage, même son, même énergie. On ajoute votre identité, un titre clair, et sur chaque image vos contacts : WhatsApp, site,
            boutique. Touchez l&apos;image « Après » pour voir un extrait.
          </Entete>
          <ul className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-encre/70">
            {["Bandeau avec logo", "Titre d'ouverture", "WhatsApp · site · boutique", "Rayons et slogan", "Carte de fin", "Son harmonisé"].map((x) => (
              <li key={x} className="rounded-full bg-white px-3 py-1.5 ring-1 ring-encre/10">
                ✓ {x}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {aa.map((v) => (
              <article key={v.cle} className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-encre/5 sm:p-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <figure>
                    <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-encre">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.media.original} alt={`Avant : ${v.titre}`} loading="lazy" className="h-full w-full object-cover opacity-90 grayscale-[30%]" />
                    </div>
                    <figcaption className="mt-2 text-center text-xs font-semibold tracking-wider text-encre/50 uppercase">Avant</figcaption>
                  </figure>
                  <figure>
                    <LecteurVideo affiche={v.media.affiche!} src={v.media.extrait} titre={v.titre} className="ring-2 ring-orange" />
                    <figcaption className="mt-2 text-center text-xs font-semibold tracking-wider text-orange uppercase">Après ▸</figcaption>
                  </figure>
                </div>
                <div className="mt-3 px-1">
                  <p className="text-[11px] font-semibold tracking-wide text-orange uppercase">{v.theme}</p>
                  <h3 className="font-semibold leading-snug">{v.titre}</h3>
                  <p className="text-sm text-encre/50">
                    {compact(v.vues)} vues · {compact(v.reactions)} réactions · {compact(v.commentaires)} commentaires
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------ montages */}
        {montages.length > 0 && (
          <section id="montages" className="relative overflow-hidden bg-encre py-16 text-white sm:py-20">
            <div className="pointer-events-none absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-orange/25 blur-3xl" />
            <div className="relative mx-auto max-w-6xl px-5">
              <Entete surtitre="Les montages" titre="Le meilleur de la semaine en 36 secondes" clair>
                Nous assemblons les meilleurs moments de vos vidéos en un montage court, rythmé, avec musique libre de droits. Parfait pour Reels,
                Stories, TikTok et YouTube Shorts.
              </Entete>
              <div className="defile -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
                {montages.map((m, i) => (
                  <figure key={m.fichier} className="w-[72%] shrink-0 snap-center sm:w-[45%] md:w-auto">
                    <MontageAuto src={m.media.video!} affiche={m.media.affiche} titre={m.titre} />
                    <figcaption className="mt-3 flex items-center gap-2">
                      <span className="titre grid h-7 w-7 place-items-center rounded-full bg-orange text-xs font-extrabold">{i + 1}</span>
                      <span className="font-semibold">{m.titre}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ bibliothèque */}
        <section id="bibliotheque" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <Entete surtitre="La bibliothèque" titre={`${videosHabillees.length} vidéos déjà retapées`}>
            Toutes vos vidéos Facebook récentes, au nouvel habillage, prêtes à republier sur Instagram, YouTube Shorts et TikTok. Touchez une vidéo pour
            voir un extrait.
          </Entete>
          <div className="mt-8">
            <Bibliotheque videos={videosHabillees} themes={THEMES} />
          </div>
        </section>

        {/* ------------------------------------------------------------ on parle de vous */}
        {couverture.length > 0 && (
          <section id="on-parle-de-vous" className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-5">
              <Entete surtitre="On parle de vous" titre="Votre histoire intéresse, racontons-la nous-mêmes">
                {couverture.length} vidéos de chaînes YouTube tierces parlent de Tchokos ({compact(vuesCouverture)} vues), alors que votre propre chaîne
                compte {nbYoutube} vidéos. Interviews, coulisses, parcours : ce récit a sa place sur votre chaîne et dans vos formats longs.
              </Entete>
              <ul className="mt-8 grid gap-3 md:grid-cols-2">
                {couverture.filter((c) => !/burn|fire|incend|br[uû]l|loss|perte|interpel|arrest|accus/i.test(c.titre)).slice(0, 6).map((c) => (
                  <li key={c.url}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl bg-creme p-3 ring-1 ring-encre/5 transition hover:ring-orange/40"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ff0000]">
                        <Icone reseau="youtube" className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-encre/50">{c.chaine}</span>
                        <span className="line-clamp-2 text-sm leading-snug font-semibold">{legendePropre(c.titre, 110)}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="titre block font-extrabold text-orange">{compact(c.vues)}</span>
                        <span className="block text-[11px] text-encre/50">vues</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ offre */}
        <section id="offre" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <Entete surtitre="Ce qu'on propose" titre="Vous filmez. Zayra fait vendre.">
            Une gestion complète de votre marketing digital, pensée pour vos clients : sur mobile, souvent en 3G, et qui commandent sur WhatsApp.
          </Entete>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["📅", "Gestion des publications", "Un calendrier éditorial chaque mois, la publication sur Facebook, TikTok, Instagram et YouTube, les réponses aux commentaires et aux messages."],
              ["🎬", "Habillage systématique", "Chaque vidéo que vous tournez est retapée à votre image : logo, titre, contacts, carte de fin, son propre."],
              ["✂️", "Montages hebdo", "Chaque semaine, un montage de 36 s avec les meilleurs moments : arrivages, visites, Tchokos Plus."],
              ["📈", "Suivi des chiffres", "Un bilan mensuel clair : vues, abonnés, commentaires, clics vers WhatsApp et le site. On garde ce qui marche."],
              ["🛍️", "Catalogue relié aux vidéos", "Chaque produit montré en vidéo a sa fiche sur tchokos-sarl.com, avec prix, tailles et commande WhatsApp. La vue devient une vente."],
              ["🛡️", "Une présence officielle", "Des pages officielles bien identifiées et les mêmes liens partout, pour couper l'herbe sous le pied des fausses pages qui arnaquent vos clients."],
            ].map(([ic, t, d]) => (
              <li key={t} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-encre/5">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-creme text-xl" aria-hidden>
                  {ic}
                </span>
                <h3 className="mt-4 text-lg font-extrabold">{t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-encre/65">{d}</p>
              </li>
            ))}
          </ul>

          <div className="mt-14">
            <h3 className="text-xl font-extrabold sm:text-2xl">Un mois type, semaine par semaine</h3>
            <p className="mt-1 text-sm text-encre/60">Exemple de calendrier éditorial, ajusté chaque mois avec vous selon les arrivages et l&apos;actualité.</p>
            <div className="mt-5">
              <Calendrier />
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              ["1", "On se voit", "Accès aux pages, choix des priorités, numéro WhatsApp officiel à mettre partout."],
              ["2", "Première semaine", "Republication des meilleures vidéos retapées sur les 4 réseaux, premier montage."],
              ["3", "Bilan à 30 jours", "Les chiffres avant / après, et le plan du mois suivant."],
            ].map(([n, t, d]) => (
              <div key={n} className="flex gap-4 rounded-3xl bg-encre p-5 text-white">
                <span className="titre grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange font-extrabold">{n}</span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-2xl bg-or/10 p-4 text-sm text-encre/75 ring-1 ring-or/30">
            <strong>Budget :</strong> à discuter ensemble, selon le volume de vidéos et les réseaux retenus.
          </p>
        </section>

        {/* ------------------------------------------------------------ contact */}
        <section id="contact" className="relative overflow-hidden bg-encre py-16 text-white sm:py-20">
          <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-orange/30 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2 lg:items-center">
            <Entete surtitre="Parlons-en" titre="Prêt à faire vendre votre audience ?" clair>
              Zayra Technologies, agence digitale à Douala. Appelez-nous ou écrivez-nous : on vous montre le plan en détail, en boutique ou au
              téléphone.
            </Entete>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Téléphone", "+237 673 398 046", "tel:+237673398046"],
                ["Téléphone", "+237 696 902 054", "tel:+237696902054"],
                ["E-mail", "contact@horus-lab.com", "mailto:contact@horus-lab.com"],
                ["Site", "horus-lab.com", "https://horus-lab.com"],
              ].map(([l, v, h]) => (
                <a
                  key={v}
                  href={h}
                  {...(h.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-orange/60"
                >
                  <span className="block text-xs font-semibold tracking-wider text-or uppercase">{l}</span>
                  <span className="mt-1 block font-semibold [overflow-wrap:anywhere]">{v}</span>
                </a>
              ))}
              <p className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 sm:col-span-2">
                <span className="block text-xs font-semibold tracking-wider text-or uppercase">Adresse</span>
                <span className="mt-1 block font-semibold">Douala, Cameroun</span>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-encre pb-10 text-center text-xs text-white/40">
        <div className="mx-auto max-w-6xl border-t border-white/10 px-5 pt-6">
          <p>Maquette de présentation — contenus © Tchokos SARL</p>
          <p className="mt-1">
            Conception : Zayra Technologies · Document privé, non indexé · Chiffres relevés publiquement fin octobre 2026 ({publications.length}{" "}
            publications).
          </p>
        </div>
      </footer>
    </>
  );
}
