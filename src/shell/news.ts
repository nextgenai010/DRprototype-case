// Invented, clearly illustrative demo content. Not real DR articles or quotes.

export interface Article {
  id: string
  category: string
  time: string
  bold: string
  rest?: string
  visual: string
  /** Related DR Predict question, if any. */
  predictionId?: string
}

export const TICKER = [
  { time: '16 min. siden', text: 'Storebæltsbroen er genåbnet efter planlagt vedligeholdelse' },
  { time: '44 min. siden', text: 'DMI: Kraftig regn på vej i Nordjylland i aften' },
  { time: '1 t. siden', text: 'Rekordmange unge besøgte årets bogmesse' },
  { time: '2 t. siden', text: 'Ny cykelsti mellem Odense og Svendborg åbner i dag' },
]

export const HERO: Article = {
  id: 'hero',
  category: 'Politik',
  time: '1 t. siden',
  bold: 'Bred aftale om grøn omstilling af landbruget:',
  rest: " 'Nu kan vi endelig planlægge'",
  visual: 'farm',
}

export const LIVEBLOG = {
  topic: 'Tæt på dansk politik',
  bold: 'Finanslovsforhandlingerne går ind i sidste uge:',
  rest: " 'Vi er tættere på end nogensinde'",
  updateTime: '31 min. siden',
  update: "Forhandlerne: 'Vi forventer en aftale inden jul'",
  predictionId: 'finanslov',
}

export const ARTICLES: Article[] = [
  {
    id: 'a1',
    category: 'Indland',
    time: '2 t. siden',
    bold: 'Flere cyklister på landevejen:',
    rest: ' Nu vil Cyklistforbundet have bredere cykelstier',
    visual: 'road',
  },
  {
    id: 'a2',
    category: 'Sport',
    time: '3 t. siden',
    bold: 'Landstræneren før aftenens kamp mod Norge:',
    rest: " 'Vi skal turde vinde'",
    visual: 'handball',
    predictionId: 'hb-landskamp',
  },
  {
    id: 'a3',
    category: 'Klima',
    time: '4 t. siden',
    bold: 'Rekordmeget strøm fra vindmøller:',
    rest: ' Oktober kan blive historisk',
    visual: 'wind',
    predictionId: 'vindrekord',
  },
  {
    id: 'a4',
    category: 'Kultur',
    time: '5 t. siden',
    bold: 'Kringleugen samlede familierne:',
    rest: ' Bagedysten slog seerrekord',
    visual: 'bake',
    predictionId: 'bagedyst',
  },
  {
    id: 'a5',
    category: 'Penge',
    time: '6 t. siden',
    bold: 'Priserne i supermarkedet flader ud:',
    rest: ' Men kaffen er stadig dyr',
    visual: 'grocery',
    predictionId: 'inflation',
  },
  {
    id: 'a6',
    category: 'Trafik',
    time: 'I går kl. 18:10',
    bold: 'Ny togplan fra december:',
    rest: ' Flere afgange mellem Aarhus og København',
    visual: 'train',
  },
  {
    id: 'a7',
    category: 'Vejret',
    time: 'I går kl. 16:45',
    bold: 'DMI: Første nattefrost er på vej',
    rest: ' – sådan passer du på planterne',
    visual: 'snow',
    predictionId: 'hvid-jul',
  },
]

export interface ShortNews {
  id: string
  time: string
  title: string
  author: string
  body: string[]
  predictionId?: string
}

export const SHORT_NEWS: ShortNews[] = [
  {
    id: 's1',
    time: '17 min. siden',
    title: 'Herrelandsholdet i håndbold møder Norge i aften',
    author: 'Demo-journalist Sara Holm',
    body: [
      'Danmark spiller i aften testkamp mod Norge som en del af forberedelserne til VM.',
      'Landstræneren har udtaget en trup med flere nye navne, som får chancen fra start.',
      'Kampen sendes på DR1 og DRTV fra kl. 20.15.',
    ],
    predictionId: 'hb-landskamp',
  },
  {
    id: 's2',
    time: '52 min. siden',
    title: 'Danmarks Statistik offentliggør nye pristal om to uger',
    author: 'Demo-journalist Jonas Krogh',
    body: [
      'Forbrugerprisindekset for oktober bliver offentliggjort i starten af november.',
      'Økonomer venter, at stigningstakten for priserne holder sig nogenlunde stabil.',
    ],
    predictionId: 'inflation',
  },
  {
    id: 's3',
    time: '1 t. siden',
    title: 'Ny cykelsti mellem Odense og Svendborg åbner i dag',
    author: 'Demo-journalist Maria Lund',
    body: ['Den 40 kilometer lange rute har været undervejs i tre år.', 'Kommunerne forventer, at flere vil cykle til arbejde.'],
  },
  {
    id: 's4',
    time: '2 t. siden',
    title: 'Årets julekalender har premiere 1. december',
    author: 'Demo-journalist Ali Nasser',
    body: ['De første billeder fra årets julekalender er netop blevet vist.', 'Serien optages blandt andet på Fyn.'],
    predictionId: 'julekalender',
  },
]

export interface VideoItem {
  id: string
  program: string
  date: string
  title: string
  desc: string
  caption: string
  visual: string
  chip?: { predictionId: string; label: string }
}

export const VIDEOS: VideoItem[] = [
  {
    id: 'v1',
    program: 'Sporten',
    date: '23. okt 2026',
    title: 'Her er truppen, der skal slå Norge i aften',
    desc: 'Landstræneren har valgt tre nye spillere til aftenens testkamp. Se hvem der får chancen… ',
    caption: 'VI SKAL TURDE VINDE',
    visual: 'handball',
    chip: { predictionId: 'hb-landskamp', label: 'Gæt: Hvem vinder?' },
  },
  {
    id: 'v2',
    program: 'Beredskab',
    date: '22. okt 2026',
    title: 'Kit vil gøre sin by til den mest kriseklare i Danmark',
    desc: 'Myndighederne anbefaler, at alle har proviant til tre døgn i tilfælde af… ',
    caption: 'JEG STARTER MED HAVREGRYN',
    visual: 'grocery',
  },
  {
    id: 'v3',
    program: 'MGP',
    date: '21. okt 2026',
    title: 'Årets MGP-deltagere er klar – hør de første toner',
    desc: 'Otte navne skal kæmpe om at repræsentere Danmark. Fire af dem fortæller om sangene… ',
    caption: 'DET HER ER MIN STØRSTE DRØM',
    visual: 'stage',
    chip: { predictionId: 'mgp', label: 'Gæt: Hvem vinder MGP?' },
  },
  {
    id: 'v4',
    program: 'Den Store Bagedyst',
    date: '20. okt 2026',
    title: 'Kringlerne drillede i aftenens afsnit',
    desc: 'Fire bagere er tilbage, og ugens tema er klassisk dansk wienerbrød… ',
    caption: 'DEJEN VIL IKKE HÆVE!',
    visual: 'bake',
    chip: { predictionId: 'bagedyst', label: 'Gæt: Ugens stjernebager?' },
  },
]
