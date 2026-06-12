/* Générateur du RAPPORT.docx — Le Songo (orienté soutenance orale) */
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, Header, Footer, TableOfContents, PageBreak
} = require("./node_modules/docx");

const OR = "B8801F", FONCE = "3C2614", GRIS = "F2EFEA", CODEBG = "F4F1EC", ACCENT = "7A4F28";

/* ---------- helpers ---------- */
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });

function P(t, opts) {
  opts = opts || {};
  const runs = Array.isArray(t) ? t : [new TextRun({ text: t })];
  return new Paragraph(Object.assign({ children: runs, spacing: { after: 120, line: 276 }, alignment: opts.center ? AlignmentType.CENTER : (opts.justify ? AlignmentType.JUSTIFIED : AlignmentType.LEFT) }, opts.p || {}));
}
const B = (t) => new TextRun({ text: t, bold: true });
const Tn = (t) => new TextRun({ text: t });
const MONO = (t) => new TextRun({ text: t, font: "Consolas", size: 19 });

function LI(t, bold) {
  const runs = Array.isArray(t) ? t : [new TextRun({ text: t, bold: !!bold })];
  return new Paragraph({ numbering: { reference: "puces", level: 0 }, children: runs, spacing: { after: 60, line: 264 } });
}
function NUM(t, ref) {
  return new Paragraph({ numbering: { reference: ref || "nums", level: 0 }, children: [new TextRun(t)], spacing: { after: 60 } });
}
function CODE(lines, titre) {
  const kids = [];
  if (titre) kids.push(new Paragraph({ children: [new TextRun({ text: titre, italics: true, size: 18, color: ACCENT })], spacing: { after: 30 } }));
  lines.forEach((ln) => kids.push(new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: CODEBG },
    spacing: { after: 0, line: 240 },
    children: [new TextRun({ text: ln === "" ? " " : ln, font: "Consolas", size: 18 })]
  })));
  kids.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun("")] }));
  return kids;
}
function cell(text, opts) {
  opts = opts || {};
  const runs = Array.isArray(text) ? text : [new TextRun({ text: String(text), bold: !!opts.bold, color: opts.color })];
  return new TableCell({
    width: { size: opts.w, type: WidthType.DXA },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    margins: { top: 60, bottom: 60, left: 110, right: 110 },
    children: [new Paragraph({ children: runs, spacing: { after: 0 } })]
  });
}
function TABLE(headers, rows, widths) {
  const b = { style: BorderStyle.SINGLE, size: 1, color: "C9BCA6" };
  const borders = { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
  const total = widths.reduce((a, c) => a + c, 0);
  const head = new TableRow({ tableHeader: true, children: headers.map((h, i) => cell([new TextRun({ text: h, bold: true, color: "FFFFFF" })], { w: widths[i], fill: ACCENT })) });
  const body = rows.map((r) => new TableRow({ children: r.map((c, i) => cell(c, { w: widths[i], fill: i === 0 ? GRIS : undefined })) }));
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, borders, rows: [head, ...body] });
}
const SP = () => new Paragraph({ spacing: { after: 80 }, children: [new TextRun("")] });

/* ============================ CONTENU ============================ */
const children = [];

/* ----- Page de garde ----- */
children.push(
  new Paragraph({ spacing: { before: 1600, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TRAVAUX PRATIQUES", bold: true, size: 28, color: ACCENT, allCaps: true })] }),
  new Paragraph({ spacing: { before: 200, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Le Songo", bold: true, size: 72, color: FONCE })] }),
  new Paragraph({ spacing: { before: 120, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Implémentation web du jeu de semailles du peuple Ekang / Béti", italics: true, size: 26, color: ACCENT })] }),
  new Paragraph({ spacing: { before: 80, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "« les échecs africains »", italics: true, size: 22, color: "888888" })] }),
  new Paragraph({ spacing: { before: 700, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Version 1 — jeu local à deux joueurs + intelligence artificielle", size: 24 })] }),
  new Paragraph({ spacing: { before: 60, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Version 2 — jeu en réseau entre sites distants (Ajax)", size: 24 })] }),
  new Paragraph({ spacing: { before: 700, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Technologies : HTML5 · CSS3 · JavaScript · PHP · Ajax · Web Audio", size: 22, color: ACCENT })] }),
  new Paragraph({ spacing: { before: 900, after: 0 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Niveau Licence 2 — Informatique", size: 22 })] }),
  new Paragraph({ children: [new PageBreak()] })
);

/* ----- Sommaire ----- */
children.push(H1("Sommaire"));
children.push(new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-2" }));
children.push(new Paragraph({ children: [new TextRun({ text: "(Dans Word : clic droit sur le sommaire → « Mettre à jour les champs » pour générer les numéros de page.)", italics: true, size: 18, color: "888888" })] }));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* ===== 1. Présentation ===== */
children.push(H1("1. Présentation du projet et du jeu"));
children.push(P([B("Objectif du TP. "), Tn("Réaliser, sur le Web, le jeu africain « Le Songo » en deux versions : une "), B("Version 1 locale"), Tn(" (deux joueurs sur le même écran, plus un mode contre l\u2019ordinateur) et une "), B("Version 2 distante"), Tn(" (deux joueurs sur deux sites/navigateurs différents communiquant par le réseau). Un rapport accompagne le code et explique le fonctionnement, le principe, les algorithmes et l\u2019organisation des fichiers.")], { justify: true }));
children.push(P([B("Le Songo (ou Songo\u2019o). "), Tn("C\u2019est un jeu de stratégie de la grande famille des "), B("mancala"), Tn(" (jeux de semailles), pratiqué par le peuple "), B("Ekang / Béti"), Tn(" (Cameroun, Gabon, Guinée équatoriale). On le surnomme « les échecs africains » pour sa profondeur tactique. Le plateau, appelé "), B("mbek"), Tn(", comporte 14 cavités (les "), B("nda"), Tn(", « maisons ») ; les graines (les "), B("songo"), Tn(") sont traditionnellement celles de l\u2019arbre "), B("ezezang"), Tn(", parfois remplacées par des billes. Chaque joueur range ses prises dans un grenier.")], { justify: true }));
children.push(P([B("But du jeu. "), Tn("70 graines au total ; le premier joueur qui en récolte au moins "), B("40"), Tn(" gagne la partie.")]));

/* ===== 2. Technologies — quel langage pour quoi ===== */
children.push(H1("2. Technologies utilisées : quel langage pour quoi ?"));
children.push(P([Tn("Cette section répond directement à la question « tu as utilisé quel langage pour faire telle chose ? ». "), B("Chaque technologie a un rôle précis :")], { justify: true }));
children.push(TABLE(
  ["Technologie", "À quoi elle sert ici", "Où (fichiers)"],
  [
    ["HTML5", "Structure des pages : titres, boutons, plateau, fenêtres. C\u2019est le « squelette ».", "index.html (V1 et V2)"],
    ["CSS3", "Présentation : couleurs, texture bois, motifs béti, mise en page, animations.", "style.css"],
    ["JavaScript", "Toute la logique côté navigateur : règles du jeu, IA, chrono, statistiques, son, interactions.", "engine.js, ai.js, local.js, stats.js, sound.js, remote.js"],
    ["PHP", "Côté serveur (V2) : un petit relais qui stocke et partage l\u2019état de la partie entre les deux joueurs.", "api.php"],
    ["Ajax (fetch)", "Communication navigateur \u2194 serveur SANS recharger la page : envoyer un coup, lire l\u2019état adverse.", "remote.js (appels), api.php (réponses JSON)"],
    ["JSON", "Format d\u2019échange des données entre client et serveur (plateau, scores, tour\u2026).", "réponses de api.php"],
    ["Web Audio API", "Génère la musique et les effets sonores directement dans le navigateur (aucun fichier audio).", "sound.js"],
    ["SVG (dans le CSS)", "Dessine les motifs géométriques béti (losanges gravés) en vectoriel.", "style.css (data-URI)"]
  ],
  [1700, 5160, 2500]
));
children.push(SP());
children.push(P([B("Phrase à retenir pour l\u2019oral : "), Tn("« HTML pour la structure, CSS pour l\u2019apparence, JavaScript pour la logique et l\u2019interactivité, PHP côté serveur pour partager la partie entre deux sites distants, et Ajax pour les échanges réseau sans recharger la page. »")], { justify: true }));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* ===== 3. Règles ===== */
children.push(H1("3. Les règles du Songo (telles qu\u2019implémentées)"));
children.push(H2("3.1 Plateau et mise en place"));
children.push(LI([B("2 camps"), Tn(" : NORD (en haut) et SUD (en bas).")]));
children.push(LI([B("7 cases par camp"), Tn(", numérotées de 1 (la plus à VOTRE gauche) à 7 (la plus proche de l\u2019adversaire).")]));
children.push(LI([B("5 graines par case"), Tn(" au départ, soit 7 × 5 × 2 = "), B("70 graines"), Tn(".")]));
children.push(H2("3.2 Le semis (comment on joue)"));
children.push(P([Tn("On choisit une case de SON camp, on en retire toutes les graines et on les sème "), B("une par une"), Tn(" dans les cases suivantes, dans le sens du jeu. Si une case contient plus de 13 graines, on fait un tour complet du plateau "), B("sans"), Tn(" re-remplir la case de départ.")], { justify: true }));
children.push(H2("3.3 La prise (récolte)"));
children.push(LI([Tn("On récolte "), B("uniquement"), Tn(" si la "), B("dernière"), Tn(" graine tombe "), B("chez l\u2019adversaire"), Tn(" dans une case qui atteint "), B("2, 3 ou 4"), Tn(" graines.")]));
children.push(LI([B("Prise à la chaîne"), Tn(" : on remonte ensuite les cases adverses précédentes tant qu\u2019elles contiennent 2 à 4 graines, et on récolte tout.")]));
children.push(LI([B("Case n°1 adverse protégée"), Tn(" : elle ne peut pas être la case finale d\u2019un semis normal (sauf après un tour complet), mais peut être prise comme maillon d\u2019une chaîne.")]));
children.push(H2("3.4 Interdits et solidarité"));
children.push(LI([B("Solidarité"), Tn(" : si le camp adverse est entièrement vide, on est obligé de lui « donner » des graines (au moins 7 si possible).")]));
children.push(LI([B("Grand chelem interdit"), Tn(" : un coup ne doit pas vider tout le camp adverse ; si une prise le ferait, le coup est joué mais la prise est annulée.")]));
children.push(LI([B("Petit coup de la case 7"), Tn(" : on ne joue pas sa case 7 si elle ne contient que 1 ou 2 graines\u2026 "), B("SAUF si ce coup réalise une prise"), Tn(" (voir §13, correction d\u2019un bug).")]));
children.push(P([B("Fin de partie"), Tn(" : un joueur atteint 40 graines (victoire) ; ou il reste moins de 10 graines sur le plateau (chacun récupère son camp) ; ou la solidarité est impossible. À 35-35, partie nulle.")], { justify: true }));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* ===== 4. Architecture / fichiers ===== */
children.push(H1("4. Organisation du code : rôle de chaque fichier"));
children.push(P([Tn("Cette section répond à « explique-moi tel fichier ». L\u2019architecture sépare nettement "), B("la logique du jeu"), Tn(" (le moteur, réutilisé par les deux versions) et "), B("l\u2019interface"), Tn(".")], { justify: true }));
children.push(H2("4.1 Arborescence"));
children.push(...CODE([
  "songo-tp/",
  "  engine.js                 (moteur de règles — copie de référence)",
  "  RAPPORT.docx              (ce document)",
  "  version1-local/           VERSION 1 (locale + IA)",
  "    index.html              structure de la page",
  "    style.css               apparence (bois + motifs béti)",
  "    engine.js               moteur de règles (règles du Songo)",
  "    ai.js                   intelligence artificielle (minimax)",
  "    stats.js                statistiques + historique (localStorage)",
  "    sound.js                musique + effets (Web Audio)",
  "    local.js                chef d\u2019orchestre de l\u2019interface",
  "  version2-distante/        VERSION 2 (réseau, Ajax)",
  "    index.html / style.css  interface",
  "    engine.js               MÊME moteur de règles",
  "    api.php                 serveur-relais (PHP) : stocke l\u2019état partagé",
  "    remote.js               communication Ajax client \u2194 serveur",
  "    Dockerfile              déploiement sur Render",
  "  tests/test-engine.js      tests automatiques des règles"
]));
children.push(H2("4.2 Rôle de chaque fichier (résumé défendable à l\u2019oral)"));
children.push(TABLE(
  ["Fichier", "Langage", "Rôle"],
  [
    ["engine.js", "JavaScript", "Le cœur : applique les règles (semis, prises, fins de partie). Ne touche pas à l\u2019affichage."],
    ["ai.js", "JavaScript", "Décide du coup de l\u2019ordinateur (minimax + alpha-bêta). Utilise engine.js pour explorer."],
    ["local.js", "JavaScript", "Relie l\u2019interface au moteur : clics, affichage, chrono, langues, tutoriel, déclenche l\u2019IA et les sons."],
    ["stats.js", "JavaScript", "Enregistre chaque partie (noms, scores, durée) et calcule les statistiques."],
    ["sound.js", "JavaScript", "Synthétise la musique et les bruitages avec la Web Audio API."],
    ["index.html", "HTML", "Déclare les éléments visibles (plateau, boutons, fenêtres)."],
    ["style.css", "CSS", "Donne l\u2019apparence (texture bois, frises béti, animations)."],
    ["api.php", "PHP", "V2 : reçoit les coups, stocke l\u2019état de la partie dans un fichier, le renvoie à l\u2019autre joueur."],
    ["remote.js", "JavaScript", "V2 : envoie/lit l\u2019état via Ajax (fetch) et synchronise les deux écrans."]
  ],
  [1700, 1500, 6160]
));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* ===== 5. Moteur ===== */
children.push(H1("5. Le moteur de jeu (engine.js) — fonction par fonction"));
children.push(P([Tn("Le plateau est représenté par un "), B("tableau de 14 entiers"), Tn(" (un anneau) : indices 0 à 6 = cases SUD, indices 7 à 13 = cases NORD. Chaque entier est le nombre de graines dans la case. Cette représentation simple rend les règles faciles à coder et à tester.")], { justify: true }));
children.push(H2("5.1 simulerSemis() — distribuer les graines"));
children.push(P([Tn("Elle "), B("simule"), Tn(" un semis sans modifier l\u2019état réel (elle travaille sur une "), MONO("copie"), Tn("). Elle renvoie le plateau obtenu, la "), B("dernière"), Tn(" case atteinte (essentielle pour les prises) et le "), B("chemin"), Tn(" des graines (pour l\u2019animation).")], { justify: true }));
children.push(...CODE([
  "function simulerSemis(board, player, start) {",
  "  var b = board.slice();      // copie de travail (on ne casse rien)",
  "  var seeds = b[start];",
  "  b[start] = 0;               // on ramasse toutes les graines",
  "  while (seeds > 0) {",
  "    pos = nextCell(pos, P.step);   // case suivante (sens du jeu)",
  "    if (pos === start) continue;   // on ne re-remplit pas la source",
  "    deposer(pos); seeds -= 1;      // une graine déposée",
  "  }",
  "  return { board:b, last:last, totalSown:..., chemin:chemin };",
  "}"
], "Extrait simplifié (cas courant ≤ 13 graines)"));
children.push(H2("5.2 resoudrePrises() — récolter"));
children.push(P([Tn("Après le semis, elle vérifie la "), B("dernière case"), Tn(" : si elle est chez l\u2019adversaire avec 2 à 4 graines, on récolte, puis on "), B("remonte"), Tn(" les cases précédentes (prise à la chaîne) tant qu\u2019elles ont 2 à 4 graines.")], { justify: true }));
children.push(...CODE([
  "var pos = last;",
  "while (true) {",
  "  if (!oppSet.has(pos)) break;                 // sorti du camp adverse",
  "  if (board[pos] < 2 || board[pos] > 4) break; // condition non remplie",
  "  captured += board[pos]; cells.push(pos);",
  "  board[pos] = 0;",
  "  pos = prevCell(pos, P.step);                 // case semée juste avant",
  "}"
], "Boucle de prise à la chaîne (extrait réel)"));
children.push(H2("5.3 coupsLegaux() — quels coups sont permis"));
children.push(P([Tn("Elle renvoie la liste des cases jouables en tenant compte des interdits (case 7, grand chelem) et de la solidarité. C\u2019est elle qui surligne les cases jouables et qui empêche un coup illégal.")], { justify: true }));
children.push(H2("5.4 jouerCoup() — LA fonction centrale"));
children.push(P([Tn("Elle vérifie que le coup est légal, appelle "), MONO("simulerSemis"), Tn(" puis "), MONO("resoudrePrises"), Tn(", applique (ou annule) la prise selon les interdits, met à jour les scores, change le tour et teste la fin de partie. "), B("Important : elle renvoie un NOUVEL état"), Tn(" sans modifier l\u2019ancien — ce qui permet à l\u2019IA d\u2019explorer des coups « pour voir » sans casser la partie en cours.")], { justify: true }));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* ===== 6. IA ===== */
children.push(H1("6. L\u2019intelligence artificielle (ai.js)"));
children.push(P([Tn("Le mode « Contre l\u2019IA » utilise l\u2019algorithme "), B("Minimax"), Tn(" avec "), B("élagage alpha-bêta"), Tn(" et "), B("approfondissement itératif"), Tn(", entièrement hors-ligne.")], { justify: true }));
children.push(H2("6.1 Le principe Minimax"));
children.push(LI([Tn("On explore l\u2019arbre des coups possibles jusqu\u2019à une certaine "), B("profondeur"), Tn(".")]));
children.push(LI([Tn("À chaque position finale, on "), B("évalue"), Tn(" qui est avantagé (fonction heuristique).")]));
children.push(LI([Tn("L\u2019IA cherche à "), B("maximiser"), Tn(" son évaluation ; elle suppose que l\u2019adversaire cherche à la "), B("minimiser"), Tn(" (d\u2019où « mini-max »).")]));
children.push(LI([B("Alpha-bêta"), Tn(" : on coupe les branches qui ne peuvent plus changer la décision \u2192 beaucoup plus rapide.")]));
children.push(LI([B("Approfondissement itératif + budget de temps"), Tn(" : on explore profondeur 1, 2, 3\u2026 et on s\u2019arrête quand le temps imparti est écoulé \u2192 l\u2019IA répond toujours vite.")]));
children.push(H2("6.2 La fonction d\u2019évaluation (le « jugement » de l\u2019IA)"));
children.push(...CODE([
  "return 8 * (state.scores[moi] - state.scores[adv])  // le score compte le plus",
  "     + 1 * (mesGraines - sesGraines)                // garder des graines",
  "     - 2 * mesVuln                                   // mes cases fragiles (1-2) = danger",
  "     + 2 * sesVuln;                                  // ses cases fragiles = opportunités"
], "Extrait réel — fonction evaluer()"));
children.push(P([Tn("Traduction : « l\u2019écart de graines récoltées (objectif 40) pèse 8 fois plus ; on aime garder ses graines, éviter ses propres cases capturables (1 ou 2 graines) et viser celles de l\u2019adversaire. »")], { justify: true }));
children.push(H2("6.3 Les niveaux de difficulté"));
children.push(TABLE(
  ["Niveau", "Profondeur", "Temps max", "Hasard"],
  [["Facile", "1", "200 ms", "35 % (reste battable)"], ["Moyen", "4", "500 ms", "5 %"], ["Difficile", "8", "900 ms", "0 %"], ["Expert", "12", "1600 ms", "0 %"]],
  [2340, 2340, 2340, 2340]
));
children.push(SP());
children.push(P([B("Astuce d\u2019oral : "), Tn("« La fonction "), MONO("ordonner()"), Tn(" met les coups qui capturent en premier : l\u2019alpha-bêta coupe alors plus tôt et l\u2019IA réfléchit plus loin dans le même temps. »")], { justify: true }));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* ===== 7. Son ===== */
children.push(H1("7. Le son et la musique (sound.js)"));
children.push(P([B("Pourquoi de l\u2019audio synthétisé et non un fichier MP3 ? "), Tn("Les enregistrements de musique traditionnelle béti sont protégés par le droit d\u2019auteur : on ne peut pas les embarquer librement. On "), B("recrée donc nous-mêmes"), Tn(" une ambiance ORIGINALE avec la "), B("Web Audio API"), Tn(" du navigateur, inspirée du style d\u2019Afrique centrale (sonorités de "), B("balafon"), Tn(" — xylophone à lames de bois — et de percussions), bâtie sur une gamme "), B("pentatonique"), Tn(" (5 notes), très présente dans ces musiques. Avantage : aucun fichier à charger, ça marche hors-ligne, et c\u2019est une vraie création.")], { justify: true }));
children.push(H2("7.1 Comment un son est fabriqué"));
children.push(LI([Tn("Un "), B("oscillateur"), Tn(" produit une fréquence (une note) ; on additionne quelques harmoniques pour imiter le bois.")]));
children.push(LI([Tn("Une "), B("enveloppe"), Tn(" de volume qui décroît vite donne l\u2019attaque « boisée » du balafon.")]));
children.push(LI([Tn("Un "), B("séquenceur"), Tn(" (technique du « lookahead ») programme les notes à l\u2019avance pour un rythme régulier.")]));
children.push(H2("7.2 Effets reliés au jeu"));
children.push(LI([B("Semis"), Tn(" : un petit « tok » à chaque graine déposée.")]));
children.push(LI([B("Prise"), Tn(" : un arpège ascendant (d\u2019autant plus long que la prise est grosse).")]));
children.push(LI([B("Victoire"), Tn(" : une courte ritournelle pentatonique.")]));
children.push(P([B("Détail technique défendable : "), Tn("les navigateurs interdisent le son tant que l\u2019utilisateur n\u2019a pas cliqué. On « débloque » donc le contexte audio au premier clic (fonction "), MONO("unlock()"), Tn("). Deux boutons (♪ et 🔊) permettent d\u2019activer/couper musique et effets.")], { justify: true }));

/* ===== 8. Interface & design ===== */
children.push(H1("8. L\u2019interface et le design (index.html, style.css, local.js)"));
children.push(H2("8.1 local.js : le chef d\u2019orchestre"));
children.push(P([Tn("Ce fichier ne contient "), B("aucune"), Tn(" règle du jeu : il "), B("relie"), Tn(" l\u2019interface au moteur. Au clic sur une case, il appelle "), MONO("coupsLegaux"), Tn(" puis "), MONO("jouerCoup"), Tn(", anime le semis, joue les sons, met à jour scores et chrono, puis (en mode IA) déclenche le coup de l\u2019ordinateur.")], { justify: true }));
children.push(H2("8.2 Fonctionnalités de l\u2019interface"));
children.push(LI([B("Bilingue FR / EN"), Tn(" : tous les textes proviennent d\u2019un dictionnaire ; un bouton bascule la langue.")]));
children.push(LI([B("Chronomètre"), Tn(" façon pendule : le camp au trait voit son temps tourner.")]));
children.push(LI([B("Tutoriel guidé"), Tn(" en 6 étapes (dont une prise animée) et "), B("Guide"), Tn(" complet de toutes les règles.")]));
children.push(LI([B("Machine à deux états"), Tn(" : "), MONO("config"), Tn(" (réglages modifiables) et "), MONO("partie"), Tn(" (réglages verrouillés, chrono actif).")]));
children.push(LI([B("Greniers, noms des joueurs, confirmation d\u2019abandon"), Tn(" : confort et clarté.")]));
children.push(H2("8.3 Le design : bois sculpté + motifs béti"));
children.push(P([Tn("L\u2019apparence évoque un plateau "), B("mbek"), Tn(" en bois : dégradés et « grain » dessinés en CSS, cases creusées (ombres internes), et une "), B("frise géométrique originale"), Tn(" en losanges gravés — inspirée des décors d\u2019Afrique centrale — dessinée en "), B("SVG"), Tn(" et répétée le long du plateau et sous le titre. Tout est vectoriel (net à toute taille) et sans image externe.")], { justify: true }));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* ===== 9. Stats ===== */
children.push(H1("9. Les statistiques et l\u2019historique (stats.js)"));
children.push(P([Tn("À la "), B("fin de chaque partie"), Tn(", le jeu enregistre : la date, le "), B("mode"), Tn(", les "), B("noms"), Tn(" des deux joueurs, les "), B("scores"), Tn(", le gagnant, la "), B("durée"), Tn(", le nombre de coups et la plus grosse prise.")], { justify: true }));
children.push(H2("9.1 Où sont stockées les données ?"));
children.push(P([Tn("Dans le "), B("localStorage"), Tn(" du navigateur (stockage local persistant). Pour rester robuste si le navigateur bloque ce stockage (cookies désactivés, navigation privée), une "), B("copie en mémoire de session"), Tn(" prend le relais : la partie apparaît quand même dans l\u2019historique pendant la session.")], { justify: true }));
children.push(H2("9.2 Ce que la fenêtre « Statistiques » affiche"));
children.push(LI([B("Par joueur"), Tn(" : parties, victoires, nuls, défaites, taux de victoire, meilleur score, temps moyen par coup, meilleure série.")]));
children.push(LI([B("Records"), Tn(" : meilleur score, victoire la plus rapide, partie la plus longue, plus de coups, plus grosse prise.")]));
children.push(LI([B("Dernières parties"), Tn(" : la liste des matchs avec noms, score et résultat.")]));
children.push(P([B("Note importante (à dire si on pose la question) : "), Tn("si la fenêtre affiche « Aucune partie enregistrée », c\u2019est qu\u2019aucune partie n\u2019a encore été "), B("terminée"), Tn(" — l\u2019enregistrement se fait à la fin d\u2019une partie, pas avant. Le mécanisme a été vérifié automatiquement (voir §12).")], { justify: true }));

/* ===== 10. V2 ===== */
children.push(H1("10. Version 2 — jeu entre sites distants (PHP + Ajax)"));
children.push(P([Tn("La V2 permet à "), B("deux joueurs sur deux machines/navigateurs différents"), Tn(" de jouer la même partie. La logique de jeu reste le "), B("même engine.js"), Tn(" (côté navigateur) ; le serveur PHP ne fait que "), B("partager l\u2019état"), Tn(" entre les deux.")], { justify: true }));
children.push(H2("10.1 Pourquoi PHP côté serveur ?"));
children.push(P([Tn("PHP est simple à héberger et suffit pour un "), B("relais"), Tn(" : il reçoit un coup, l\u2019écrit dans un fichier "), MONO("games/<id>.json"), Tn(", et renvoie l\u2019état courant à qui le demande. Pas besoin de base de données pour ce TP.")], { justify: true }));
children.push(H2("10.2 Qu\u2019est-ce qu\u2019Ajax et où l\u2019utilise-t-on ?"));
children.push(P([B("Ajax"), Tn(" = échanger des données avec le serveur "), B("sans recharger la page"), Tn(". Le client appelle "), MONO("api.php"), Tn(" via "), MONO("fetch()"), Tn(" et reçoit du "), B("JSON"), Tn(". Un "), B("sondage régulier"), Tn(" (polling, toutes ~1,5 s) lit l\u2019état : dès que l\u2019adversaire a joué, l\u2019écran se met à jour tout seul.")], { justify: true }));
children.push(H2("10.3 Les points d\u2019entrée du serveur (api.php)"));
children.push(TABLE(
  ["Action", "Rôle", "Renvoie"],
  [
    ["creer", "Créer une nouvelle partie et son code.", "code de partie + état initial"],
    ["rejoindre", "Rejoindre une partie par son code.", "le camp attribué + état"],
    ["etat", "Lire l\u2019état courant (appelé en boucle).", "plateau, scores, tour, fin"],
    ["jouer", "Envoyer un coup ; le serveur applique et enregistre.", "nouvel état partagé"]
  ],
  [1500, 4860, 3000]
));
children.push(SP());
children.push(P([B("Schéma à dessiner au tableau : "), Tn("Joueur A (navigateur + engine.js) \u2192 fetch \u2192 api.php \u2192 fichier JSON \u2190 fetch \u2190 Joueur B (navigateur + engine.js).")], { justify: true }));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* ===== 11. Déploiement ===== */
children.push(H1("11. Mise en route et déploiement"));
children.push(H2("11.1 En local"));
children.push(LI([B("V1"), Tn(" : ouvrir "), MONO("version1-local/index.html"), Tn(" dans un navigateur (idéalement via l\u2019extension Live Server de VS Code).")]));
children.push(LI([B("V2"), Tn(" : nécessite PHP (un serveur). En local : "), MONO("php -S localhost:8000"), Tn(" dans "), MONO("version2-distante/"), Tn(".")]));
children.push(H2("11.2 En ligne (accessible partout)"));
children.push(LI([B("Code source"), Tn(" : GitHub \u2014 "), MONO("github.com/nonoandre-ndre/songo-tp"), Tn(".")]));
children.push(LI([B("V1"), Tn(" hébergée sur "), B("GitHub Pages"), Tn(" : "), MONO("nonoandre-ndre.github.io/songo-tp/version1-local/"), Tn(".")]));
children.push(LI([B("V2"), Tn(" hébergée sur "), B("Render"), Tn(" (conteneur Docker + PHP) : "), MONO("songo-v2.onrender.com"), Tn(".")]));
children.push(P([B("À savoir pour la démo : "), Tn("l\u2019hébergement gratuit de Render « s\u2019endort » après 15 min d\u2019inactivité ; le premier chargement peut prendre ~50 s. "), B("Ouvrir l\u2019adresse 1 à 2 minutes avant la présentation"), Tn(" pour le réveiller.")], { justify: true }));

/* ===== 12. Tests ===== */
children.push(H1("12. Tests et validation"));
children.push(P([Tn("La qualité a été vérifiée par des tests automatiques (preuve de sérieux à mentionner) :")], { justify: true }));
children.push(LI([B("9 tests unitaires des règles"), Tn(" (prise simple, prise à la chaîne, case protégée, solidarité, interdits, semis > 13, victoire à 40) : 9/9 réussis.")]));
children.push(LI([B("30 000 parties aléatoires"), Tn(" : 0 plantage, "), B("70 graines toujours conservées"), Tn(", 100 % des parties se terminent.")]));
children.push(LI([B("14 vérifications d\u2019interface"), Tn(" (avec jsdom) : déroulé de 3 parties, "), B("noms et scores correctement enregistrés"), Tn(" dans l\u2019historique, agrégats cohérents.")]));
children.push(LI([B("Tests de l\u2019IA"), Tn(" : niveaux « moyen » et « difficile » battent un joueur aléatoire dans 100 % des parties testées.")]));

/* ===== 13. Difficultés ===== */
children.push(H1("13. Difficultés rencontrées et solutions"));
children.push(H2("13.1 Un coup qui devait capturer était bloqué (bug corrigé)"));
children.push(P([B("Symptôme observé en test : "), Tn("dans une position, jouer la case 7 aurait dû "), B("capturer"), Tn(" des graines de l\u2019adversaire, mais le système refusait le coup.")], { justify: true }));
children.push(P([B("Cause : "), Tn("la règle « interdit de jouer la case 7 avec 1 ou 2 graines » était appliquée "), B("même quand le coup réalisait une prise"), Tn(". Or une prise ne doit jamais être bloquée.")], { justify: true }));
children.push(P([B("Solution : "), Tn("on ajoute une exception — la case 7 reste interdite avec 1-2 graines "), B("seulement si elle ne capture rien"), Tn(". Une petite fonction "), MONO("captureDeCoup()"), Tn(" calcule la prise effective d\u2019un coup (en tenant compte du grand chelem) et sert à autoriser le coup s\u2019il capture.")], { justify: true }));
children.push(...CODE([
  "// Avant : case 7 (1-2 graines) toujours interdite",
  "// Après : autorisée si elle réalise une prise",
  "if (c === P.case7 && (board[c] === 1 || board[c] === 2)) {",
  "  return captureDeCoup(board, player, c) > 0;   // permis seulement s\u2019il capture",
  "}"
], "Correctif dans coupsLegaux()"));
children.push(P([B("Vérification : "), Tn("après correction, la position de test capture bien 6 graines, et le test « interdit conservé sans prise » passe toujours ; les 30 000 parties restent sans erreur.")], { justify: true }));
children.push(H2("13.2 Autres points"));
children.push(LI([Tn("Statistiques vides : compris comme un effet du blocage des cookies ET du fait que l\u2019enregistrement n\u2019a lieu qu\u2019en "), B("fin"), Tn(" de partie. Robustesse ajoutée (copie en mémoire).")]));
children.push(LI([Tn("Audio bloqué par le navigateur : résolu en débloquant le contexte au premier clic.")]));
children.push(LI([Tn("Déploiement PHP : résolu avec un "), MONO("Dockerfile"), Tn(" (PHP + Apache) sur Render.")]));
children.push(new Paragraph({ children: [new PageBreak()] }));

/* ===== 14. FAQ soutenance ===== */
children.push(H1("14. Préparation à la soutenance : questions probables et réponses"));
children.push(P([Tn("Réponses courtes à connaître par cœur. (Q = question possible du prof, R = réponse modèle.)")], { italics: true }));
const faq = [
  ["Quel langage as-tu utilisé pour la Version 1 ?", "HTML pour la structure, CSS pour l\u2019apparence, et JavaScript pour toute la logique (règles, IA, chrono, sons). Aucun serveur : tout tourne dans le navigateur."],
  ["Et pour la Version 2 ?", "Les mêmes HTML/CSS/JavaScript côté navigateur, plus PHP côté serveur comme relais, et Ajax pour les échanges réseau sans recharger la page."],
  ["Qu\u2019est-ce qu\u2019Ajax, concrètement, dans ton projet ?", "C\u2019est l\u2019envoi/réception de données avec le serveur sans recharger la page. J\u2019utilise fetch() dans remote.js pour envoyer un coup à api.php et lire l\u2019état adverse en JSON, en boucle (polling)."],
  ["Pourquoi PHP côté serveur et pas autre chose ?", "PHP est simple à héberger et suffit pour un relais : recevoir un coup, l\u2019enregistrer dans un fichier JSON, et renvoyer l\u2019état. Pas besoin de base de données ici."],
  ["Explique la fonction jouerCoup().", "C\u2019est la fonction centrale du moteur : elle vérifie que le coup est légal, simule le semis, résout les prises, gère les interdits, met à jour les scores et le tour, teste la fin de partie, et renvoie un NOUVEL état sans modifier l\u2019ancien."],
  ["Comment l\u2019IA choisit-elle son coup ?", "Avec Minimax + élagage alpha-bêta : elle explore les coups jusqu\u2019à une profondeur, évalue les positions, maximise son avantage en supposant que l\u2019adversaire minimise le sien. Un budget de temps garantit une réponse rapide."],
  ["Que fait la fonction d\u2019évaluation ?", "Elle donne une note à une position : surtout l\u2019écart de graines récoltées (objectif 40), un peu les graines gardées, en évitant mes cases fragiles (1-2 graines) et en visant celles de l\u2019adversaire."],
  ["Explique simulerSemis().", "Elle distribue les graines d\u2019une case une par une sur une copie du plateau, sans toucher l\u2019état réel, et renvoie la dernière case atteinte (clé pour les prises) et le chemin (pour l\u2019animation)."],
  ["Comment se fait une prise ?", "Si ma dernière graine tombe chez l\u2019adversaire dans une case qui atteint 2 à 4 graines, je la récolte, puis je remonte les cases adverses précédentes tant qu\u2019elles ont 2 à 4 graines (prise à la chaîne)."],
  ["Où sont stockées les statistiques ?", "Dans le localStorage du navigateur, avec une copie en mémoire de secours si le stockage est bloqué. L\u2019enregistrement a lieu en fin de partie."],
  ["Pourquoi la musique est-elle générée et pas un fichier audio ?", "Pour éviter le droit d\u2019auteur sur les enregistrements traditionnels : je recrée une ambiance originale de balafon avec la Web Audio API, sur une gamme pentatonique. Aucun fichier, ça marche hors-ligne."],
  ["Montre où sont les règles dans le code.", "Toutes les règles sont dans engine.js (coupsLegaux, jouerCoup, simulerSemis, resoudrePrises). local.js ne fait que l\u2019interface : c\u2019est une séparation nette logique/affichage."],
  ["Comment les deux versions partagent-elles les règles ?", "engine.js est identique dans les deux versions (même fichier copié). Seule la façon de jouer change : local en V1, via le serveur en V2."]
];
faq.forEach(([q, r]) => {
  children.push(new Paragraph({ spacing: { before: 100, after: 30 }, children: [new TextRun({ text: "Q. ", bold: true, color: ACCENT }), new TextRun({ text: q, bold: true })] }));
  children.push(new Paragraph({ spacing: { after: 60, line: 264 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: "R. ", bold: true, color: ACCENT }), new TextRun({ text: r })] }));
});
children.push(new Paragraph({ children: [new PageBreak()] }));

/* ===== 15. Conclusion ===== */
children.push(H1("15. Conclusion"));
children.push(P([Tn("Le projet implémente fidèlement les règles du Songo et les met en \u0153uvre dans deux versions web : une version "), B("locale"), Tn(" riche (deux joueurs, IA à quatre niveaux, bilingue, tutoriel, statistiques, son et design soigné) et une version "), B("distante"), Tn(" en réseau (PHP + Ajax). L\u2019architecture sépare clairement la "), B("logique"), Tn(" (moteur réutilisable, testé sur 30 000 parties) de l\u2019"), B("interface"), Tn(". L\u2019ensemble est documenté et déployé en ligne, prêt pour la démonstration et la défense orale.")], { justify: true }));
children.push(P([B("Valorise le peuple Ekang / Béti"), Tn(" en faisant découvrir un patrimoine ludique africain par le numérique, avec un vocabulaire authentique (mbek, nda, songo) et une ambiance sonore et visuelle inspirée de la culture d\u2019Afrique centrale.")], { justify: true }));

/* ============================ DOCUMENT ============================ */
const doc = new Document({
  creator: "TP Songo",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: "222222" } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Calibri", color: FONCE },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: OR, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Calibri", color: ACCENT },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 23, bold: true, font: "Calibri", color: "555555" },
        paragraph: { spacing: { before: 140, after: 80 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "puces", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 280 } } } }] },
      { reference: "nums", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 280 } } } }] }
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Le Songo — Rapport de TP", size: 16, color: "999999" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ["Page ", PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES], size: 18, color: "999999" })] })] }) },
    children
  }]
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync("RAPPORT.docx", buf); console.log("RAPPORT.docx généré (" + (buf.length / 1024).toFixed(0) + " Ko)"); });
