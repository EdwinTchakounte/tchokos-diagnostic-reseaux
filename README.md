# Site vitrine Tchokos × Zayra (maquette privée, noindex)

- `npm run donnees` : réduit `../donnees/contenus.json` + `diagnostic.json` à `src/data/site.json` (~40 Ko) et génère les médias web
  dans `public/media/` (affiches, extraits 540x960, montages 720x1280). Idempotent : saute ce qui existe.
  ffmpeg un à la fois, `nice -n 10`, `-threads 2`. Option `--sans-video` pour ne refaire que données + affiches.
- `npm run build` : export statique dans `out/` (Vercel : `vercel.json`, dossier `out`).
- `npm run apercu` : sert `out/` sur http://localhost:4321.
