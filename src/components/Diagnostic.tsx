import BarresH from "./BarresH";
import GraphiqueMois, { type Mois } from "./GraphiqueMois";
import { compact, dateCourte } from "@/lib/format";
import type { Diagnostic as D, Reseau } from "@/lib/donnees";

const ORANGE = "#ea580c";
const ARDOISE = "#94a3b8";

const nf = (v: number, d = 0) => v.toLocaleString("fr-FR", { maximumFractionDigits: d });
const pct = (v: number) => `${nf(v, 1)} %`;
const NOMS_MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const nomMois = (m: string) => {
  const [a, mm] = m.split("-").map(Number);
  return `${NOMS_MOIS[mm - 1]} ${a}`;
};
const dateLongue = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const mediane = (l: number[]) => {
  const s = l.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

function Constat({ n, titre, children }: { n: number; titre: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-orange uppercase">
        <span className="titre grid h-6 w-6 place-items-center rounded-full bg-orange text-[11px] tracking-normal text-white">{n}</span>
        Constat {n}
      </p>
      <h3 className="mt-3 text-2xl leading-tight font-extrabold sm:text-[2.1rem]">{titre}</h3>
      <div className="mt-3 space-y-2 text-base leading-relaxed text-encre/70">{children}</div>
    </div>
  );
}

function Carte({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white p-4 shadow-sm ring-1 ring-encre/5 sm:p-6 ${className}`}>{children}</div>;
}

function Tuile({ valeur, libelle, detail, accent = false }: { valeur: string; libelle: string; detail?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? "bg-encre text-white" : "bg-white ring-1 ring-encre/5"}`}>
      <p className={`titre text-3xl font-extrabold sm:text-4xl ${accent ? "text-or" : "text-encre"}`}>{valeur}</p>
      <p className={`mt-1 text-sm font-semibold ${accent ? "text-white" : "text-encre"}`}>{libelle}</p>
      {detail && <p className={`mt-1 text-xs leading-snug ${accent ? "text-white/60" : "text-encre/55"}`}>{detail}</p>}
    </div>
  );
}

export default function Diagnostic({ d, reseaux, releve }: { d: D; reseaux: Reseau[]; releve?: string | null }) {
  const t = d.tiktok;
  const [debut, fin] = d.periode_tiktok;
  const finMois = fin.slice(0, 7);
  const debutMois = debut.slice(0, 7);
  // Mois complets seulement pour les comparaisons ; le premier (démarre le 27) est écarté, le dernier est signalé comme incomplet.
  const mois: Mois[] = d.par_mois
    .filter((m) => m.mois !== debutMois || debut.endsWith("-01"))
    .map((m) => ({ ...m, partiel: m.mois === finMois }));
  const complets = mois.filter((m) => !m.partiel);
  const premier = complets[0];
  const dernier = complets[complets.length - 1];
  const rVideos = Math.round(dernier.videos / premier.videos);
  const rMediane = Math.round(premier.vues_mediane / dernier.vues_mediane);
  const totalMedian = mediane(complets.map((m) => m.vues));
  const engMin = complets.reduce((a, b) => (b.engagement_pct < a.engagement_pct ? b : a));
  const engMax = complets.reduce((a, b) => (b.engagement_pct > a.engagement_pct ? b : a));
  const iPremier = mois.indexOf(premier);
  const iDernier = mois.indexOf(dernier);

  const themes = d.par_theme.filter((x) => x.videos >= 10).sort((a, b) => b.vues_mediane - a.vues_mediane);
  const exclus = d.par_theme.filter((x) => x.videos < 10);
  const produits = themes.find((x) => /produit|arrivage/i.test(x.theme));
  const meilleurTheme = themes[0];

  const jours = d.par_jour;
  const meilleurJour = jours.reduce((a, b) => (b.vues_mediane > a.vues_mediane ? b : a));
  const moinsUtilise = jours.reduce((a, b) => (b.videos < a.videos ? b : a));
  const autresJours = jours.filter((j) => j !== meilleurJour);
  const moyAutres = autresJours.reduce((s, j) => s + j.videos, 0) / autresJours.length;
  const creneaux = d.par_creneau.filter((c) => c.videos >= 50);
  const pireCreneau = creneaux.reduce((a, b) => (b.vues_mediane < a.vues_mediane ? b : a));
  const rangUsage = creneaux.slice().sort((a, b) => b.videos - a.videos).indexOf(pireCreneau) + 1;
  const durees = d.par_duree;
  const meilleureDuree = durees.reduce((a, b) => (b.vues_mediane > a.vues_mediane ? b : a));

  const ig = reseaux.find((r) => r.reseau === "instagram");
  const yt = reseaux.find((r) => r.reseau === "youtube");
  const gainCta = Math.round((t.vues_mediane_avec_appel_action / t.vues_mediane - 1) * 100);

  return (
    <section id="diagnostic" className="bg-creme py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        {/* ---------------------------------------------------------------- intro */}
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-orange uppercase">Diagnostic de votre marketing digital</p>
          <h2 className="mt-2 text-[1.9rem] leading-tight font-extrabold sm:text-5xl">
            Nous avons regardé vos {nf(t.videos)} vidéos TikTok, une par une.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-encre/70">
            Tchokos, votre parcours inspire toute une jeunesse, au Cameroun et partout en Afrique : <em>«&nbsp;C&apos;est difficile, mais c&apos;est
            possible&nbsp;»</em>. Vos chiffres le prouvent. Voici ce qu&apos;ils disent, sur {nf(Math.round((Date.parse(fin) - Date.parse(debut)) / (30.44 * 864e5)))}{" "}
            mois, et où se trouve le potentiel pour aller encore plus loin.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tuile accent valeur={compact(t.commentaires)} libelle="commentaires" detail={`et ${compact(t.partages)} partages : votre public vous répond`} />
          <Tuile valeur={`${t.engagement_pct.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`} libelle="d'engagement" detail="j'aime + commentaires + partages, rapportés aux vues" />
          <Tuile valeur={nf(t.vues_mediane)} libelle="vues médianes par vidéo" detail={`la moitié des vidéos fait plus, l'autre moitié moins`} />
          <Tuile valeur={nf(t.publications_par_jour, 1)} libelle="vidéos par jour" detail="un rythme que peu de marques tiennent" />
        </div>

        {/* ---------------------------------------------------------------- 1 */}
        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <Constat
            n={1}
            titre={
              <>
                Vous publiez {rVideos}× plus… <span className="text-orange">mais chaque vidéo est {rMediane}× moins vue.</span>
              </>
            }
          >
            <p>
              De {premier.videos} vidéos en {nomMois(premier.mois)} à {dernier.videos} en {nomMois(dernier.mois)}. Dans le même temps, la vidéo
              «&nbsp;typique&nbsp;» (la médiane) est passée de <strong className="text-encre">{nf(premier.vues_mediane)}</strong> à{" "}
              <strong className="text-encre">{nf(dernier.vues_mediane)}</strong> vues.
            </p>
            <p>
              Le total du mois, lui, ne décolle pas : autour de <strong className="text-encre">{compact(totalMedian)} de vues</strong> par mois.
              Publier davantage partage la même audience entre plus de vidéos. La solution : moins de vidéos, mais mieux finies.
            </p>
          </Constat>
          <Carte>
            <GraphiqueMois
              donnees={mois}
              panneaux={[
                { titre: "Vidéos publiées par mois", cle: "videos", type: "barres", couleur: ARDOISE, etiquettes: [iPremier, iDernier] },
                { titre: "Vues médianes par vidéo", cle: "vues_mediane", type: "ligne", couleur: ORANGE, etiquettes: [iPremier, iDernier] },
                { titre: "Vues totales du mois", cle: "vues", type: "barres", couleur: "#cbd5e1" },
              ]}
              legende={`TikTok, ${nomMois(mois[0].mois)} – ${nomMois(finMois)}. ${nomMois(finMois).replace(/^./, (c) => c.toUpperCase())} est incomplet (relevé jusqu'au ${dateCourte(fin)}) : barre hachurée, point creux.`}
            />
          </Carte>
        </div>

        {/* ---------------------------------------------------------------- 2 */}
        <div className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <Constat n={2} titre={<>Votre communauté vous adore.</>}>
            <p>
              Sur 100 personnes qui voient une vidéo, près de <strong className="text-encre">{nf(t.engagement_pct)}</strong> aiment, commentent ou
              partagent. C&apos;est un niveau très élevé, et il <strong className="text-encre">monte</strong> : de {pct(engMin.engagement_pct)} en{" "}
              {nomMois(engMin.mois)} à {pct(engMax.engagement_pct)} en {nomMois(engMax.mois)}, alors même que les vues par vidéo baissent.
            </p>
            <p>
              Votre audience est fidèle. Ce n&apos;est pas l&apos;attachement qui s&apos;essouffle, c&apos;est la diffusion : il faut donner à
              l&apos;algorithme des vidéos plus fortes, et les publier aussi ailleurs.
            </p>
          </Constat>
          <Carte>
            <GraphiqueMois
              donnees={mois}
              panneaux={[
                { titre: "Taux d'engagement", cle: "engagement_pct", type: "ligne", couleur: ORANGE, etiquettes: [mois.indexOf(engMin), mois.indexOf(engMax)] },
                { titre: "Vues médianes par vidéo", cle: "vues_mediane", type: "ligne", couleur: ARDOISE },
              ]}
              legende="Engagement = (j'aime + commentaires + partages) ÷ vues, par mois de publication."
            />
          </Carte>
        </div>

        {/* ---------------------------------------------------------------- 3 */}
        <div className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <Constat
            n={3}
            titre={
              <>
                Ce qui marche : vos messages. <span className="text-orange">Ce qui vend est le moins vu.</span>
              </>
            }
          >
            <p>
              {meilleurTheme.theme} : <strong className="text-encre">{nf(meilleurTheme.vues_mediane)}</strong> vues médianes. Vos leçons de vie
              touchent, elles sont votre signature.
            </p>
            {produits && (
              <p>
                {produits.theme} : seulement <strong className="text-encre">{nf(produits.vues_mediane)}</strong>, soit{" "}
                {nf(meilleurTheme.vues_mediane / produits.vues_mediane, 1)}× moins, sur {produits.videos} vidéos. Ce sont pourtant celles qui montrent
                ce que vous vendez. C&apos;est exactement ce que corrigent l&apos;habillage et les montages produits : donner à vos arrivages la même
                force qu&apos;à vos messages.
              </p>
            )}
          </Constat>
          <Carte>
            <BarresH
              titre="Vues médianes par thème"
              unite="TikTok"
              barres={themes.map((x) => ({
                libelle: x.theme,
                detail: `${x.videos} vidéos`,
                valeur: x.vues_mediane,
                accent: x === produits,
                note: x === produits ? "Les vidéos qui vendent" : undefined,
              }))}
            />
            {exclus.length > 0 && (
              <p className="mt-3 text-xs text-encre/50">
                Non affiché faute de volume : {exclus.map((x) => `${x.theme} (${x.videos} vidéos, ${nf(x.vues_mediane)} vues médianes)`).join(", ")}.
              </p>
            )}
          </Carte>
        </div>

        {/* ---------------------------------------------------------------- 4 */}
        <div className="mt-20">
          <Constat n={4} titre={<>Quand et comment : le bon moment compte autant que la bonne vidéo.</>}>
            <p>
              Le <strong className="text-encre">{meilleurJour.jour.toLowerCase()}</strong> est votre meilleur jour ({nf(meilleurJour.vues_mediane)} vues
              médianes){moinsUtilise === meilleurJour && <> mais le moins utilisé : {meilleurJour.videos} vidéos, contre {nf(moyAutres)} en moyenne les autres jours</>}.
              Le <strong className="text-encre">{pireCreneau.creneau.split(" (")[0].toLowerCase()}</strong> est le créneau le plus faible (
              {nf(pireCreneau.vues_mediane)}){rangUsage <= 2 ? <>, alors que c&apos;est le {rangUsage === 1 ? "plus utilisé" : "deuxième plus utilisé"} ({pireCreneau.videos} vidéos)</> : <>, alors que {pireCreneau.videos} vidéos y sont publiées</>}.
              Et vos formats de <strong className="text-encre">{meilleureDuree.duree.replace(">", "plus de").replace("<", "moins de")}</strong> font{" "}
              {nf(meilleureDuree.vues_mediane)} vues médianes : vos histoires longues captivent.
            </p>
          </Constat>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Carte>
              <BarresH
                titre="Par jour de publication"
                unite="vues médianes"
                barres={jours.map((j) => ({
                  libelle: j.jour,
                  detail: `${j.videos} vidéos`,
                  valeur: j.vues_mediane,
                  accent: j === meilleurJour,
                  note: j === meilleurJour && j === moinsUtilise ? "Le meilleur jour, le moins utilisé" : undefined,
                }))}
              />
            </Carte>
            <Carte>
              <BarresH
                titre="Par créneau horaire"
                unite="vues médianes"
                barres={creneaux.map((c) => ({
                  libelle: c.creneau,
                  detail: `${c.videos} vidéos`,
                  valeur: c.vues_mediane,
                  accent: c === pireCreneau,
                  note: c === pireCreneau ? "Le plus faible, pourtant très utilisé" : undefined,
                }))}
              />
              {d.par_creneau.length > creneaux.length && (
                <p className="mt-3 text-xs text-encre/50">
                  Nuit non affichée : {d.par_creneau.filter((c) => c.videos < 50).map((c) => `${c.videos} vidéos`).join(", ")}, trop peu pour conclure.
                </p>
              )}
            </Carte>
            <Carte>
              <BarresH
                titre="Par durée de vidéo"
                unite="vues médianes"
                barres={durees.map((x) => ({
                  libelle: x.duree,
                  detail: `${x.videos} vidéos`,
                  valeur: x.vues_mediane,
                  accent: x === meilleureDuree,
                  note: x === meilleureDuree ? "Vos histoires longues captivent" : undefined,
                }))}
              />
            </Carte>
          </div>
        </div>

        {/* ---------------------------------------------------------------- 5 */}
        <div className="mt-20">
          <Constat
            n={5}
            titre={
              <>
                Vos vidéos donnent envie… <span className="text-orange">mais ne disent pas où acheter.</span>
              </>
            }
          >
            <p>
              Les vidéos qui invitent à commander font pourtant mieux : <strong className="text-encre">{nf(t.vues_mediane_avec_appel_action)}</strong>{" "}
              vues médianes, contre {nf(t.vues_mediane)} pour l&apos;ensemble ({gainCta > 0 ? `+${gainCta} %` : `${gainCta} %`}).
            </p>
          </Constat>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-6">
            <div className="col-span-2 rounded-2xl bg-white p-4 ring-1 ring-encre/5">
              <p className="titre text-3xl font-extrabold sm:text-4xl">{pct(t.part_avec_appel_action_pct)}</p>
              <p className="mt-1 text-sm font-semibold">des vidéos ont un appel à l&apos;action</p>
              <div
                className="mt-3 flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
                role="img"
                aria-label={`${pct(t.part_avec_appel_action_pct)} avec appel à l'action`}
              >
                <div className="h-full rounded-l-full bg-orange" style={{ width: `${t.part_avec_appel_action_pct}%` }} />
                <div className="h-full flex-1 rounded-r-full bg-encre/10" />
              </div>
              <p className="mt-2 text-xs text-encre/55">«&nbsp;Commandez sur WhatsApp&nbsp;», «&nbsp;passez en boutique&nbsp;»… : environ 1 vidéo sur 9.</p>
            </div>
            <Tuile valeur={pct(t.part_sans_legende_pct)} libelle="sans légende" detail="ni texte, ni mots-clés pour être trouvé" />
            <Tuile valeur={nf(ig?.abonnes ?? 0)} libelle="abonnés Instagram" detail={ig?.note ?? "compte peu actif"} />
            <Tuile valeur={compact(yt?.abonnes ?? 0)} libelle="abonnés YouTube" detail={`${yt?.publications ?? 0} vidéos, ${compact(yt?.vues_cumulees ?? 0)} vues au total`} />
            <Tuile valeur="0" libelle="lien vers une boutique en ligne" detail="le client cherche seul un numéro, et peut tomber sur une fausse page" />
          </div>

        </div>

        {/* ---------------------------------------------------------------- méthode */}
        <p className="mt-12 border-t border-encre/10 pt-4 text-xs leading-relaxed text-encre/45">
          Méthode : {nf(t.videos)} vidéos du profil TikTok @tchokos.sarl publiées du {dateLongue(debut)} au {dateLongue(fin)}, chiffres publics
          captés le {releve ? dateLongue(releve) : "28 octobre 2026"}, plus {d.facebook.reels_releves} reels Facebook et les profils publics
          Instagram et YouTube. Médiane = la vidéo «&nbsp;du milieu&nbsp;», moins sensible aux rares vidéos virales que la moyenne. Thèmes et appels à
          l&apos;action repérés par mots-clés dans les légendes : un classement indicatif. Les vidéos plus récentes ont eu moins de temps pour
          accumuler des vues.
        </p>
      </div>
    </section>
  );
}
