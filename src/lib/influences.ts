// Appendix A — the influence map. Curated from a private "Influências"
// ledger kept since 2024. Scope is deliberate: philosophy, literature,
// economics and the investors I read as thinkers — no politics, no polemics,
// no apologetics. Every edge is a real, documentable relationship (who taught
// whom, who wrote about whom, who answered whom), not a mood board. Notes are
// first-person; "read" lists only works actually read.

export type Influence = {
  id: string;
  name: string;
  dates: string;
  cluster: string;
  note: string;
  read?: string[];
  links: { to: string; label: string; strong?: boolean }[];
  /** Real scanned museum marble. It USED to be engraved client-side in WebGL;
   *  that layer is retired (see ENABLE_GL_BUST in PortraitPlate — the shader
   *  banded the stone into a topographic tangle), so these three now show the
   *  same pre-engraved static plate as everyone else and this data only feeds
   *  the figcaption credit. */
  bust?: {
    file: string; // under /busts/
    credit: string;
    /** base orientation fix for the scan's axes */
    rotation: [number, number, number];
    /** which way this face looks on a shared stone (double herm) */
    yaw: number;
    /** per-scan framing — the meshes are unit-normalized but proportioned differently */
    zoom: number;
    offsetY: number;
    /** extra ink for scans that read too pale at their framing */
    toneBias?: number;
  };
};

// One axis only: each shelf holds one KIND of thing — a school, a genre, a
// craft — never a theory that drags unlike things together. The figures reach
// across shelves by EDGES, not by cohabiting one (Girard files with the novel
// he explained and reaches the novelists by lines; Dostoevsky files with the
// Russians and reaches Girard the same way). Eleven shelves, read top to
// bottom as the arc of how I think: the old questions, the forms that carry
// them, the schools that argued them, then the people who put ideas to work.
export const clusters: { id: string; label: string }[] = [
  { id: "ancients", label: "The ancients" },
  { id: "epic", label: "The epic" },
  { id: "stage", label: "The stage" },
  { id: "novel", label: "The novel" },
  { id: "russians", label: "The Russians" },
  { id: "madrid", label: "The School of Madrid" },
  { id: "poets", label: "The poets" },
  { id: "portuguese", label: "The Portuguese" },
  { id: "austrians", label: "The Austrians" },
  { id: "investors", label: "The investors" },
  { id: "machines", label: "Mathematics & machines" },
];

export const influences: Influence[] = [
  // ── The ancients ───────────────────────────────────────────────────────
  {
    id: "socrates",
    name: "Socrates",
    dates: "c. 470–399 BC",
    cluster: "ancients",
    note: "He wrote nothing. What we call Socrates is mostly Plato writing him — the most influential man on this map published zero times.",
    links: [{ to: "plato", label: "wrote him into history" }],
    bust: {
      file: "herm-r1.glb",
      credit:
        "Double herm of Socrates and Seneca — Antikensammlung Berlin · scan: threedscans.com, 2016",
      rotation: [0, 0, 0],
      yaw: 0,
      zoom: 1.12,
      offsetY: -0.03,
      toneBias: 0.05,
    },
  },
  {
    id: "plato",
    name: "Plato",
    dates: "c. 428–348 BC",
    cluster: "ancients",
    note: "The cave half of the sentence at the top of this appendix. It asks what is real and answers: less than you see. I picked a degree that lives between his question and Turing's.",
    read: ["The Republic (the cave, endlessly)"],
    links: [
      { to: "turing", label: "the cave and the machine", strong: true },
      { to: "socrates", label: "his life's transcript" },
      { to: "fonseca", label: "read through the scholastics" },
    ],
    bust: {
      file: "plato-r1.glb",
      credit:
        "Herm of Plato — Institut für Klassische Archäologie, Vienna · scan: threedscans.com, 2016",
      rotation: [0, 0, 0],
      yaw: 0,
      zoom: 1.35,
      offsetY: -0.4,
    },
  },
  {
    id: "seneca",
    name: "Seneca",
    dates: "c. 4 BC–AD 65",
    cluster: "ancients",
    note: "Letters from a Stoic, read one letter at a time. Advice survives when it is addressed to one person instead of an audience. Berlin keeps him carved back-to-back with Socrates in a single stone — one block, two philosophers, facing opposite ways.",
    read: ["Letters from a Stoic"],
    links: [{ to: "socrates", label: "back-to-back in one stone" }],
    bust: {
      file: "herm-r1.glb",
      credit:
        "Double herm of Socrates and Seneca — Antikensammlung Berlin · scan: threedscans.com, 2016",
      rotation: [0, 0, 0],
      yaw: 3.14159,
      zoom: 1.12,
      offsetY: -0.03,
      toneBias: 0.05,
    },
  },

  // ── The epic ───────────────────────────────────────────────────────────
  {
    id: "homer",
    name: "Homer",
    dates: "c. 8th century BC",
    cluster: "epic",
    note: "The Iliad and the Odyssey are the source code. Most of what I admire in literature is a fork of one of the two.",
    read: ["The Iliad", "The Odyssey"],
    links: [{ to: "camoes", label: "the epic line, Aegean to Tagus" }],
  },
  {
    id: "virgil",
    name: "Virgil",
    dates: "70–19 BC",
    cluster: "epic",
    note: "The Aeneid is Homer rewritten by a man who worked for the state — the same sea, now carrying duty and paperwork. Dante trusted him enough to make him his guide out of Hell, which is the largest compliment one writer has ever paid another.",
    read: ["The Aeneid"],
    links: [
      { to: "homer", label: "the Odyssey, answered in Latin" },
      { to: "dante", label: "led him out of Hell" },
    ],
  },
  {
    id: "dante",
    name: "Dante",
    dates: "1265–1321",
    cluster: "epic",
    note: "The Divine Comedy is proof that the strictest structure can carry the most feeling — one hundred cantos of rhymed constraint. Engineers should find that reassuring.",
    read: ["The Divine Comedy"],
    links: [],
  },
  {
    id: "camoes",
    name: "Luís de Camões",
    dates: "c. 1524–1580",
    cluster: "epic",
    note: "Os Lusíadas — the epic of leaving home by sea. Required reading for anyone from the interior who left by the A23.",
    read: ["Os Lusíadas"],
    links: [
      { to: "homer", label: "the epic he answers" },
      { to: "pessoa", label: "answered four centuries later" },
    ],
  },

  // ── The stage ──────────────────────────────────────────────────────────
  {
    id: "sophocles",
    name: "Sophocles",
    dates: "c. 497–406 BC",
    cluster: "stage",
    note: "Oedipus the King is the first detective story, and the detective turns out to be the murderer. Every plot that runs on a man investigating himself is a footnote to it.",
    read: ["Oedipus the King"],
    links: [{ to: "seneca", label: "reworked into Latin tragedy" }],
  },
  {
    id: "shakespeare",
    name: "William Shakespeare",
    dates: "1564–1616",
    cluster: "stage",
    note: "Four tragedies so far, and each finds a different way for a strong man to wreck himself. I keep Macbeth closest — the shortest, and the one that understands ambition from the inside.",
    read: ["Hamlet", "Macbeth", "Othello", "King Lear", "Romeo and Juliet"],
    links: [{ to: "seneca", label: "the revenge-tragedy debt" }],
  },
  {
    id: "goethe",
    name: "Johann Wolfgang von Goethe",
    dates: "1749–1832",
    cluster: "stage",
    note: "Faust is the bargain every ambitious person recognises — knowledge and power now, the bill later. Werther I read younger, when its self-pity still passed for depth.",
    read: ["Faust", "The Sorrows of Young Werther"],
    links: [{ to: "shakespeare", label: "the model he measured himself against" }],
  },
  {
    id: "beckett",
    name: "Samuel Beckett",
    dates: "1906–1989",
    cluster: "stage",
    note: "Waiting for Godot is two acts in which nothing happens, twice, and it is the most honest thing I have read about waiting for anything. He wrote himself down to almost nothing and found the floor was solid.",
    read: ["Waiting for Godot"],
    links: [{ to: "yeats", label: "closed a play on a line of his" }],
  },

  // ── The novel (and the critic who read it) ─────────────────────────────
  {
    id: "girard",
    name: "René Girard",
    dates: "1923–2015",
    cluster: "novel",
    note: "Deceit, Desire and the Novel reorganised my shelves: Cervantes, Stendhal, Flaubert, Proust and Dostoevsky stopped being separate authors and became one system with one insight — we borrow our desires from others.",
    read: ["Deceit, Desire and the Novel"],
    links: [
      { to: "cervantes", label: "the first diagnosis" },
      { to: "stendhal", label: "vanity, dissected" },
      { to: "flaubert", label: "bovarysme" },
      { to: "proust", label: "the deepest case study" },
      { to: "machado", label: "jealousy, before it was named" },
      { to: "dostoevsky", label: "the underground of desire" },
    ],
  },
  {
    id: "cervantes",
    name: "Miguel de Cervantes",
    dates: "1547–1616",
    cluster: "novel",
    note: "Don Quixote: a man who outsourced his desires to the books he read. The first novel is already the whole warning.",
    read: ["Don Quixote"],
    links: [{ to: "girard", label: "reread through his eyes" }],
  },
  {
    id: "stendhal",
    name: "Stendhal",
    dates: "1783–1842",
    cluster: "novel",
    note: "The Red and the Black — ambition as imitation, two centuries before anyone called it status games.",
    read: ["The Red and the Black"],
    links: [{ to: "girard", label: "reread through his eyes" }],
  },
  {
    id: "flaubert",
    name: "Gustave Flaubert",
    dates: "1821–1880",
    cluster: "novel",
    note: "Madame Bovary names the disease: wanting a life because you read about it somewhere. A useful caution for people who read too much.",
    read: ["Madame Bovary"],
    links: [{ to: "girard", label: "reread through his eyes" }],
  },
  {
    id: "proust",
    name: "Marcel Proust",
    dates: "1871–1922",
    cluster: "novel",
    note: "In Search of Lost Time, read in full at nineteen — my longest-running project to date, and the best study of memory I know in any medium.",
    read: ["In Search of Lost Time"],
    links: [{ to: "girard", label: "reread through his eyes" }],
  },
  {
    id: "machado",
    name: "Machado de Assis",
    dates: "1839–1908",
    cluster: "novel",
    note: "Dom Casmurro is a whole novel built on a suspicion that may be borrowed — jealousy as a desire caught from others, decades before Girard named it. He watched people want what someone else has and wrote it colder than anyone.",
    read: ["Dom Casmurro", "Memórias Póstumas de Brás Cubas"],
    links: [{ to: "girard", label: "mimetic jealousy, avant la lettre" }],
  },

  // ── The Russians ───────────────────────────────────────────────────────
  {
    id: "dostoevsky",
    name: "Fyodor Dostoevsky",
    dates: "1821–1881",
    cluster: "russians",
    note: "Six of his books so far. Nobody maps the underground of human motive better — every villain I believe in descends from his notebooks.",
    read: [
      "Crime and Punishment",
      "The Brothers Karamazov",
      "Notes from Underground",
      "The House of the Dead",
      "The Adolescent",
      "White Nights",
    ],
    links: [{ to: "girard", label: "his best modern reader" }],
  },
  {
    id: "tolstoy",
    name: "Leo Tolstoy",
    dates: "1828–1910",
    cluster: "russians",
    note: "The Death of Ivan Ilyich asks one question — what if my whole life was wrong? — and refuses to let you leave without an answer. Worth more than most courses I've taken.",
    read: ["Anna Karenina", "The Death of Ivan Ilyich"],
    links: [],
  },
  {
    id: "nabokov",
    name: "Vladimir Nabokov",
    dates: "1899–1977",
    cluster: "russians",
    note: "Lolita, for the prose. He would have despised half of this diagram — he judged writers one sentence at a time — which is exactly why he belongs on it.",
    read: ["Lolita"],
    links: [],
  },
  {
    id: "solzhenitsyn",
    name: "Aleksandr Solzhenitsyn",
    dates: "1918–2008",
    cluster: "russians",
    note: "The Gulag Archipelago, read in full — the longest book on this shelf and the one that made the consequences of ideas feel least theoretical.",
    read: ["The Gulag Archipelago"],
    links: [],
  },

  // ── The School of Madrid ───────────────────────────────────────────────
  {
    id: "ortega",
    name: "José Ortega y Gasset",
    dates: "1883–1955",
    cluster: "madrid",
    note: "The finest essayist I have read in any language. His definition — an essay is science minus the explicit proof — is the operating principle of every annotation on this site.",
    links: [
      { to: "marias", label: "master to disciple" },
      { to: "unamuno", label: "the generation's argument" },
    ],
  },
  {
    id: "marias",
    name: "Julián Marías",
    dates: "1914–2005",
    cluster: "madrid",
    note: "Ortega's student and the clearest guide into the school of Madrid — proof that fidelity to a teacher can be a form of originality.",
    links: [{ to: "ortega", label: "his teacher" }],
  },
  {
    id: "unamuno",
    name: "Miguel de Unamuno",
    dates: "1864–1936",
    cluster: "madrid",
    note: "The tragic sense of life: reason and longing refusing to release each other. He loses every argument and wins every reader.",
    links: [],
  },

  // ── The poets ──────────────────────────────────────────────────────────
  {
    id: "machado_poet",
    name: "Antonio Machado",
    dates: "1875–1939",
    cluster: "poets",
    note: "“Caminante, no hay camino: se hace camino al andar.” The line I reach for whenever a plan turns out to be a map of a country that was never there. He wrote the plainest Spanish of his generation, and it has worn the best.",
    read: ["Poesías completas"],
    links: [{ to: "unamuno", label: "the same Spain, argued and sung" }],
  },
  {
    id: "yeats",
    name: "W. B. Yeats",
    dates: "1865–1939",
    cluster: "poets",
    note: "The best argument that a poet can keep getting better to the end. “The Second Coming” gets quoted whenever the news is bad, usually by people who would fail its own stricter charge: that the worst are full of passionate intensity.",
    read: ["The Collected Poems of W. B. Yeats"],
    links: [],
  },

  // ── The Portuguese ─────────────────────────────────────────────────────
  {
    id: "pessoa",
    name: "Fernando Pessoa",
    dates: "1888–1935",
    cluster: "portuguese",
    note: "A Mensagem replies to Camões four centuries later; the Book of Disquiet is the private counter-argument. One man shipped a whole literature under different names.",
    read: ["A Mensagem", "O Livro do Desassossego"],
    links: [
      { to: "camoes", label: "the reply to Os Lusíadas" },
      { to: "vieira", label: "‘Emperor of the Portuguese language’" },
    ],
  },
  {
    id: "vieira",
    name: "Padre António Vieira",
    dates: "1608–1697",
    cluster: "portuguese",
    note: "The Sermon of Saint Anthony to the Fish is the sharpest rhetoric I know aimed at an audience that could not clap. Pessoa crowned him emperor of the language; the title stands.",
    read: ["Sermão de Santo António aos Peixes"],
    links: [{ to: "pessoa", label: "crowned by him" }],
  },
  {
    id: "fonseca",
    name: "Pedro da Fonseca",
    dates: "1528–1599",
    cluster: "portuguese",
    note: "The ‘Portuguese Aristotle’, born in Proença-a-Nova — the same municipality as me. The dashed line in fig. 0 drives past his statue on its way to Porto; the plate here is engraved from that statue.",
    links: [{ to: "plato", label: "the tradition he systematised" }],
  },

  // ── The Austrians ──────────────────────────────────────────────────────
  {
    id: "mises",
    name: "Ludwig von Mises",
    dates: "1881–1973",
    cluster: "austrians",
    note: "Value is not declared; it is demonstrated in exchange. The claim at the top of this dossier — production over promises — is his before it is mine.",
    links: [
      { to: "hayek", label: "the Privatseminar, Vienna" },
      { to: "rothbard", label: "his New York seminar" },
    ],
  },
  {
    id: "hayek",
    name: "Friedrich Hayek",
    dates: "1899–1992",
    cluster: "austrians",
    note: "The knowledge problem: no central planner can gather what a price already knows. Every over-centralised architecture I've had to fix was a small planned economy.",
    read: ["The Road to Serfdom"],
    links: [{ to: "mises", label: "his mentor" }],
  },
  {
    id: "rothbard",
    name: "Murray Rothbard",
    dates: "1926–1995",
    cluster: "austrians",
    note: "The system-builder of the school — took Mises's axioms and derived everything, at full speed, in public.",
    links: [
      { to: "mises", label: "his teacher" },
      { to: "hoppe", label: "mentor at UNLV" },
    ],
  },
  {
    id: "hoppe",
    name: "Hans-Hermann Hoppe",
    dates: "b. 1949",
    cluster: "austrians",
    note: "The strictest arguer of the four. I read him the way I read type systems: for the discipline, whatever I end up shipping.",
    links: [{ to: "rothbard", label: "his mentor" }],
  },

  // ── The investors (read as thinkers, not tip sheets) ───────────────────
  {
    id: "simons",
    name: "Jim Simons",
    dates: "1938–2024",
    cluster: "investors",
    note: "A geometer who left a mathematics chair, decided the market was a very noisy dataset, and was right enough for thirty years to prove it. The rare hero who did both of the things I care about — the proof and the machine.",
    links: [],
  },
  {
    id: "munger",
    name: "Charlie Munger",
    dates: "1924–2023",
    cluster: "investors",
    note: "“Take a simple idea and take it seriously.” His latticework of mental models is the only investing advice that reads like engineering: hold a small number of true things and reason from them.",
    links: [],
  },
  {
    id: "bogle",
    name: "John Bogle",
    dates: "1929–2019",
    cluster: "investors",
    note: "He worked out that the surest way to beat almost every professional was to stop paying them, then built the fund that proved it. The most consequential act of subtraction in modern finance.",
    links: [],
  },

  // ── Mathematics & machines ─────────────────────────────────────────────
  {
    id: "hardy",
    name: "G. H. Hardy",
    dates: "1877–1947",
    cluster: "machines",
    note: "A Mathematician's Apology is the honest version of every ‘why mathematics’ argument. My own attempt at one is downstream of his.",
    links: [],
  },
  {
    id: "turing",
    name: "Alan Turing",
    dates: "1912–1954",
    cluster: "machines",
    note: "The machine half of the sentence I keep repeating. A formal answer to a metaphysical question — which is why it still unsettles philosophers, and me.",
    links: [{ to: "plato", label: "the cave and the machine", strong: true }],
  },
  {
    id: "knuth",
    name: "Donald Knuth",
    dates: "b. 1938",
    cluster: "machines",
    note: "Literate programming's founding claim: programs are written for people, and only incidentally for machines. He has been right for fifty years and most of the industry still hasn't conceded.",
    links: [{ to: "lamport", label: "typesetting as respect" }],
  },
  {
    id: "lamport",
    name: "Leslie Lamport",
    dates: "b. 1941",
    cluster: "machines",
    note: "TLA+ and LaTeX: the same man decided that programs deserve proofs and documents deserve typesetting. He was right both times.",
    links: [{ to: "knuth", label: "TeX, extended" }],
  },
];
