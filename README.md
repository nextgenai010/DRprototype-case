# DR Predict i DR Nyheder – hackathon-prototype

Prototype – ikke et officielt DR-produkt. En genskabelse af DR Nyheder-appen med en ny feature: **DR Predict**, et dagligt forudsigelsesspil uden penge, kun point og ære.

## Kør

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build → dist/
npm run lint
npm run typecheck
```

På desktop vises appen i en telefonramme (390×844). På mobil fylder den hele skærmen.

## Demo-manus (60–90 sek.)

1. Åbn appen → DR Forside.
2. Efter 1 sek. glider **Dagens forudsigelse** op → tryk **Danmark vinder**.
3. **Log ind med DR** → login.dr.dk (demo-konto) → sæt flueben → **Opret spilprofil** → vælg **Sport** → **Gem og fortsæt**. Resultatet viser 62 % fordelingen.
4. **Se flere forudsigelser** → Spil: Mine gæt, Sket siden sidst, Mine ligaer, Hele Danmark gætter.
5. Åbn en forudsigelse → relateret indhold fra DRTV/DR Lyd, "Ret mit gæt", boost, "Udfordr en ven".
6. **Studiegruppen** → bevægelsespile (▲2) → **Tilføj reaktion**.
7. Langt tryk på DR-logoet (eller Menu → Demo) → **Spring til næste dag** → Forside: "Sket siden sidst – Du fik 150 point · Du rykkede 2 pladser op i Studiegruppen".
8. Spil → avatar (Profil) → skift interesser → feedet og dagens forudsigelse skifter.

Demo-panel: Vis dagens pop-up igen · Spring til næste dag · Afgør alle åbne forudsigelser · Nulstil demo.
Ligakoder: `DR2026` (Studiegruppen – demo-kontoen er allerede med), `HAND26` (Håndboldholdet).

## Arkitektur

```
src/
  App.tsx            telefonramme + tab-state (værten)
  shell/             DR Nyheder: header, bundmenu, Forside, Seneste nyt, Video, Menu, demo-artikler
  shared/            DR-logo, illustrationer (SVG, ingen eksterne billeder)
  predict/           selvstændigt modul ("mikrofrontend")
    index.tsx        eneste offentlige flade: PredictTab, PredictBanner, PredictWidget,
                     ArticleCta, VideoChip, PredictOverlays, usePredictHost
    config/events.json  alle 18 forudsigelser som data – nye events uden kodeændringer
    config/leagues.ts   demo-ligaer · config/meta.ts  kategorier, interesser, regioner
    logic/           scoring, personalisering, aggregater, selectors, tid
    store.tsx        state + localStorage (`drpredict:state:v1`), demo-ur, navigation, overlays
```

Shell'en importerer kun fra `src/predict/index.tsx`, ligesom DR ville montere spillet som webview/mikrofrontend flere steder i appen.

## Hvad er simuleret

- **Login** (login.dr.dk-skærmen og demo-kontoen "Alex").
- **Al data**: forudsigelser, fordelinger, ligaer, regionale og aldersfordelte tal ("Demodata").
- **Tid**: "Spring til næste dag" rykker et demo-ur. Forudsigelser, der er lukket, afgøres ud fra `result` i JSON.
  Dagens håndboldspørgsmål har `"result": "@userChoice"`, så det afgøres i spillerens favør – det gør recap'en forudsigelig på scenen.
- **Fotos** er frit licenserede billeder fra Wikimedia Commons (CC0, public domain eller Creative Commons), gemt lokalt i `src/assets/photos/`. Kreditering står i `src/assets/photos/CREDITS.md`. Mangler et foto, vises en tegnet SVG-illustration i stedet.
- **Video** er stillbilleder. Links til DR-indhold går til forsiderne på dr.dk/nyheder, /drtv og /lyd (mærket "Demo-link").

## Integration med DR (næste skridt)

- **Login**: erstat `completeLogin` med DR Login (OIDC via login.dr.dk). Spilprofilen (spilnavn, aldersgruppe, postnummer) gemmes på DR-kontoen. Samtykke følger DR's eksisterende cookie- og samtykkeflow.
- **Indhold**: `related[].url` bliver til artikel-, DRTV- og DR Lyd-ID'er, som appen åbner nativt. Events kan oprettes i et redaktionelt CMS i samme JSON-format.
- **Resultater**: `result` sættes automatisk fra sportsdatafeeds (fx kampresultater) og officielle kilder (DST, DMI, ft.dk). Historikken over ændringer logges.
- **Aggregater**: beregnes på backend ud fra rigtige gæt med k-anonymitet (ingen visning under fx 50 spillere pr. gruppe).
- **Tracking**: modulets handlinger (guess, edit, login, league_join, popup_shown/dismissed/disabled) sendes som events til DR's eksisterende analyseværktøj.
- **Notifikationer**: højst én om dagen, kun ved opt-in.
