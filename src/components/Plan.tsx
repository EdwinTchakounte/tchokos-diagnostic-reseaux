// « Notre plan » : une réponse pour chaque constat du diagnostic.
const ETAPES: { constat: string; reponse: string; detail: string }[] = [
  {
    constat: "Plus de vidéos, moins de vues chacune",
    reponse: "Moins, mais mieux",
    detail: "Un rythme régulier de vidéos finies plutôt qu'un flux continu : chaque publication a le temps de trouver son public.",
  },
  {
    constat: "Des vidéos sans habillage commun",
    reponse: "Habillage systématique",
    detail: "Logo, titre d'ouverture, WhatsApp, site et boutique à l'écran, carte de fin, son harmonisé. Le client sait toujours qui parle et où acheter.",
  },
  {
    constat: "Les vidéos produits sont les moins vues",
    reponse: "Montages produits chaque semaine",
    detail: "Les arrivages racontés avec la même énergie que vos messages : 36 secondes rythmées, prix et contact à l'écran.",
  },
  {
    constat: "Le dimanche délaissé, le matin peu efficace",
    reponse: "Un calendrier éditorial",
    detail: "Les bons jours, les bons créneaux, les bons formats (dont vos histoires longues), planifiés un mois à l'avance avec vous.",
  },
  {
    constat: "1 vidéo sur 9 seulement dit où acheter",
    reponse: "Un appel à l'action partout",
    detail: "Légende soignée et « Commandez sur WhatsApp » sur chaque vidéo, avec un lien vers la fiche produit sur tchokos-sarl.com.",
  },
  {
    constat: "Instagram et YouTube à l'abandon",
    reponse: "4 réseaux, les mêmes vidéos",
    detail: "Chaque vidéo retapée part aussi sur Instagram et YouTube Shorts, et vos formats longs nourrissent votre chaîne YouTube.",
  },
  {
    constat: "Des chiffres à suivre de près",
    reponse: "Un bilan chaque mois",
    detail: "Vues, abonnés, commentaires, clics vers WhatsApp et le site : on garde ce qui marche, on corrige le reste.",
  },
];

export default function Plan() {
  return (
    <section id="plan" className="relative overflow-hidden bg-encre py-16 text-white sm:py-20">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-orange/25 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-or uppercase">Notre plan</p>
          <h2 className="mt-2 text-[1.9rem] leading-tight font-extrabold sm:text-5xl">Une réponse pour chaque constat.</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            Vous avez déjà l&apos;essentiel : une audience immense et une communauté qui vous aime. Notre rôle est de faire en sorte que chaque vue
            rapproche un client de la boutique.
          </p>
        </div>
        <ol className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ETAPES.map((e, i) => (
            <li key={e.reponse} className="flex flex-col rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10">
              <p className="text-xs leading-snug text-white/50">
                <span className="font-semibold text-or/80">Constat :</span> {e.constat}
              </p>
              <p className="mt-2 flex items-center gap-2.5">
                <span className="titre grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange text-sm font-extrabold">{i + 1}</span>
                <span className="titre text-lg leading-tight font-extrabold">{e.reponse}</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{e.detail}</p>
            </li>
          ))}
          <li className="flex flex-col justify-center rounded-3xl bg-orange p-5 lg:col-span-2">
            <p className="titre text-lg leading-tight font-extrabold">Vous filmez. On s&apos;occupe du reste.</p>
            <a href="#offre" className="mt-3 text-sm font-semibold text-white/90 underline underline-offset-4">
              Voir le détail de l&apos;offre ↓
            </a>
          </li>
        </ol>
      </div>
    </section>
  );
}
