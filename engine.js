/* =====================================================================
   MOTEUR DU JEU "LE SONGO"  (engine.js)
   ---------------------------------------------------------------------
   Ce fichier ne contient AUCUN code d'affichage (DOM) ni de réseau.
   Il ne fait qu'une chose : connaître les règles du Songo et calculer,
   à partir d'un état du jeu, ce qu'un coup produit comme nouvel état.

   On peut donc le réutiliser :
     - dans la version 1 (local), appelé directement par le navigateur ;
     - dans la version 2 (distante), appelé par chaque client (le serveur
       PHP ne sert que de "plateau partagé").

   On peut aussi le tester en dehors du navigateur (avec Node.js).

   --------------------------- LE PLATEAU -------------------------------
   Le plateau est un ANNEAU de 14 cases, numérotées de 0 à 13 :

       indices 0..6   = camp SUD,  cases SUD 1..7   (S1=0 ... S7=6)
       indices 7..13  = camp NORD, cases NORD 1..7  (N1=7 ... N7=13)

   Représentation à l'écran (numérotation en MIROIR, comme dans les
   règles officielles) :

       NORD :  1  2  3  4  5  6  7      (indices  7  8  9 10 11 12 13)
       SUD  :  7  6  5  4  3  2  1      (indices  6  5  4  3  2  1  0)

   POINT SUBTIL (et essentiel) : la règle "de la droite vers la gauche dans
   son camp puis de la gauche vers la droite chez l'adversaire" se lit dans
   le repère PROPRE de chaque joueur (ils sont assis face à face, d'où la
   numérotation en miroir). On le confirme avec la règle des prises : la
   case protégée est "la case n°1, la plus à VOTRE gauche" -> c'est N1 pour
   SUD et S1 pour NORD. En conséquence, dans le repère absolu de l'anneau,
   LES DEUX JOUEURS SÈMENT DANS LE MÊME SENS (on incrémente l'indice) :
           0 -> 1 -> 2 -> ... -> 13 -> 0  (boucle unique)
   Chaque joueur part d'une case de SON camp ; quand il atteint la fin de
   son camp, il entre chez l'adversaire par la case n°1 de celui-ci.
   Le jeu est ainsi parfaitement symétrique entre SUD et NORD.
   ===================================================================== */

(function (global) {
  "use strict";

  // Nombre de cases par camp et de graines par case au départ
  var CASES_PAR_CAMP = 7;
  var GRAINES_PAR_CASE = 5;
  var TOTAL_GRAINES = 2 * CASES_PAR_CAMP * GRAINES_PAR_CASE; // 70

  // Description de chaque joueur (constantes pratiques)
  //   cells      : ses propres cases (indices)
  //   step       : sens de semis (+1 = incrémenter, -1 = décrémenter)
  //   opp        : nom de l'adversaire
  //   oppCells   : cases de l'adversaire
  //   protege    : case n°1 de l'adversaire (case protégée des prises)
  //   case7      : sa propre case 7 (la plus proche de l'adversaire)
  var PLAYERS = {
    SUD: {
      cells:    [0, 1, 2, 3, 4, 5, 6],
      step:     +1,
      opp:      "NORD",
      oppCells: [7, 8, 9, 10, 11, 12, 13],
      protege:  7,   // N1
      case7:    6    // S7
    },
    NORD: {
      cells:    [7, 8, 9, 10, 11, 12, 13],
      step:     +1,
      opp:      "SUD",
      oppCells: [0, 1, 2, 3, 4, 5, 6],
      protege:  0,   // S1
      case7:    13   // N7
    }
  };

  // Case suivante / précédente dans le sens de semis du joueur
  function nextCell(i, step) { return (i + step + 14) % 14; }
  function prevCell(i, step) { return (i - step + 14) % 14; }

  // Liste des cases adverses dans l'ORDRE de semis (la 1re entrée est la
  // 1re case adverse atteinte = la case protégée "n°1", "depuis la gauche")
  function oppCellsInSowOrder(player) {
    var P = PLAYERS[player];
    var order = [];
    var pos = P.case7;                 // dernière case de mon camp
    for (var k = 0; k < CASES_PAR_CAMP; k++) {
      pos = nextCell(pos, P.step);     // j'avance dans le camp adverse
      order.push(pos);
    }
    return order;                      // ex. SUD -> [7,8,9,10,11,12,13]
  }

  /* ------------------------------------------------------------------ */
  /*  CRÉATION D'UNE PARTIE                                              */
  /* ------------------------------------------------------------------ */
  function nouvellePartie(premierJoueur) {
    var board = [];
    for (var i = 0; i < 14; i++) board.push(GRAINES_PAR_CASE);
    return {
      board: board,                     // 14 cases, 5 graines chacune
      scores: { SUD: 0, NORD: 0 },      // graines récoltées
      turn: premierJoueur || "SUD",     // à qui de jouer
      finished: false,
      winner: null,                     // "SUD" | "NORD" | "NULLE" | null
      message: "",                      // dernier événement (texte FR)
      lastMove: null                    // détails du dernier coup (pour l'UI)
    };
  }

  /* ------------------------------------------------------------------ */
  /*  SIMULATION D'UN SEMIS (sans toucher à l'état réel)                */
  /*  Renvoie : { board, last, totalSown, deliveredToOpp }              */
  /* ------------------------------------------------------------------ */
  function simulerSemis(board, player, start) {
    var P = PLAYERS[player];
    var b = board.slice();              // copie de travail
    var seeds = b[start];
    b[start] = 0;                       // on ramasse toutes les graines
    var pos = start;
    var last = start;
    var delivered = 0;                  // graines tombées chez l'adversaire
    var oppSet = new Set(P.oppCells);
    var totalSown = seeds;
    var chemin = [];                    // ordre des cases recevant une graine (pour l'animation)

    function deposer(cell) {
      b[cell] += 1;
      if (oppSet.has(cell)) delivered += 1;
      last = cell;
      chemin.push(cell);
    }

    if (seeds <= 13) {
      // Cas normal : on dépose une graine par case, en sautant la case
      // d'origine si jamais on faisait un tour complet (jamais pour <=13).
      while (seeds > 0) {
        pos = nextCell(pos, P.step);
        if (pos === start) continue;    // on ne remplit pas la case source
        deposer(pos);
        seeds -= 1;
      }
    } else {
      // Cas spécial (> 13 graines) :
      //  1) un tour complet du Songo (13 cases, sans la case source)
      for (var k = 0; k < 13; k++) {
        pos = nextCell(pos, P.step);
        if (pos === start) pos = nextCell(pos, P.step);
        deposer(pos);
      }
      seeds -= 13;
      //  2) le reste est semé UNIQUEMENT chez l'adversaire, depuis la
      //     gauche (1re case adverse), en boucle si nécessaire.
      var ordre = oppCellsInSowOrder(player);
      var idx = 0;
      while (seeds > 0) {
        deposer(ordre[idx % CASES_PAR_CAMP]);
        idx += 1;
        seeds -= 1;
      }
    }
    return { board: b, last: last, totalSown: totalSown, deliveredToOpp: delivered, chemin: chemin };
  }

  /* ------------------------------------------------------------------ */
  /*  RÉSOLUTION DES PRISES (récoltes) après un semis                   */
  /*  Modifie `board` en place ; renvoie { captured, cells }            */
  /* ------------------------------------------------------------------ */
  function resoudrePrises(board, player, last, totalSown) {
    var P = PLAYERS[player];
    var oppSet = new Set(P.oppCells);
    var fullLoop = totalSown >= 14;     // au moins un tour complet ?
    var captured = 0;
    var cells = [];

    // Pas de prise si la dernière graine n'est pas chez l'adversaire
    if (!oppSet.has(last)) return { captured: 0, cells: [] };

    // CAS A : on termine dans la case protégée (n°1) de l'adversaire
    if (last === P.protege) {
      if (fullLoop) {
        // Après >= 1 tour complet : on ne récolte QUE la dernière graine
        board[last] -= 1;
        captured = 1;
        cells.push(last);
      }
      // (sans tour complet : aucune prise dans la case protégée)
      return { captured: captured, cells: cells };
    }

    // CAS B : prise normale. La dernière case doit contenir 2 à 4 graines
    // (elle en avait 1 à 3 avant le dépôt de la dernière graine).
    if (board[last] < 2 || board[last] > 4) {
      return { captured: 0, cells: [] };
    }

    // Prise à la chaîne : on remonte les cases semées juste avant, tant
    // qu'elles sont chez l'adversaire et contiennent 2 à 4 graines.
    // La case protégée peut être prise UNIQUEMENT comme maillon de chaîne
    // (pas comme case finale, traité au CAS A).
    var pos = last;
    while (true) {
      if (!oppSet.has(pos)) break;                 // sorti du camp adverse
      if (board[pos] < 2 || board[pos] > 4) break; // condition non remplie
      captured += board[pos];
      cells.push(pos);
      board[pos] = 0;
      pos = prevCell(pos, P.step);                 // case semée juste avant
    }
    return { captured: captured, cells: cells };
  }

  /* ------------------------------------------------------------------ */
  /*  PRISE EFFECTIVE d'un coup, SANS appliquer la règle de la case 7.   */
  /*  Renvoie le nombre de graines réellement capturées (0 si aucune),   */
  /*  en tenant compte de l'annulation « grand chelem » (vider le camp). */
  /*  Sert à savoir si un coup depuis la case 7 doit rester autorisé :   */
  /*  une prise ne doit JAMAIS être bloquée par l'interdit de la case 7. */
  function captureDeCoup(board, player, c) {
    var P = PLAYERS[player];
    var sim = simulerSemis(board, player, c);
    var copie = sim.board.slice();
    var prises = resoudrePrises(copie, player, sim.last, sim.totalSown);
    if (prises.captured > 0) {
      var reste = P.oppCells.reduce(function (s, x) { return s + copie[x]; }, 0);
      if (reste === 0) return 0;        // prise annulée (viderait tout le camp adverse)
    }
    return prises.captured;
  }

  /* ------------------------------------------------------------------ */
  /*  COUPS LÉGAUX pour un joueur (gère interdits + solidarité)         */
  /*  Renvoie { moves:[indices], forced:bool, reason:string }           */
  /* ------------------------------------------------------------------ */
  function coupsLegaux(state, player) {
    var P = PLAYERS[player];
    var board = state.board;

    // Cases non vides du joueur
    var nonVides = P.cells.filter(function (c) { return board[c] > 0; });
    if (nonVides.length === 0) {
      return { moves: [], forced: false, reason: "camp-vide" };
    }

    // INTERDIT 1 : jouer sa case 7 quand elle ne contient que 1 ou 2 graines
    // (elle ne ferait que nourrir l'adversaire).  EXCEPTION : si ce coup
    // réalise une PRISE, il reste autorisé — une prise n'est jamais bloquée.
    var candidats = nonVides.filter(function (c) {
      if (c === P.case7 && (board[c] === 1 || board[c] === 2)) {
        return captureDeCoup(board, player, c) > 0;   // permis seulement s'il capture
      }
      return true;
    });
    var force = false;
    if (candidats.length === 0) {       // on n'a que la case 7 interdite
      candidats = nonVides;             // -> on est contraint de la jouer
      force = true;
    }

    // SOLIDARITÉ : si le camp adverse est entièrement vide
    var oppVide = P.oppCells.every(function (c) { return board[c] === 0; });
    if (oppVide) {
      var infos = candidats.map(function (c) {
        return { c: c, n: simulerSemis(board, player, c).deliveredToOpp };
      });
      var atteignent = infos.filter(function (d) { return d.n > 0; });
      if (atteignent.length === 0) {
        // Personne ne peut nourrir l'adversaire -> solidarité impossible
        return { moves: [], forced: false, reason: "solidarite-impossible" };
      }
      var maxN = Math.max.apply(null, atteignent.map(function (d) { return d.n; }));
      if (maxN >= 7) {
        return {
          moves: atteignent.filter(function (d) { return d.n >= 7; })
                           .map(function (d) { return d.c; }),
          forced: true, reason: "solidarite"
        };
      }
      // On ne peut pas donner 7 : on doit donner le maximum possible
      return {
        moves: atteignent.filter(function (d) { return d.n === maxN; })
                         .map(function (d) { return d.c; }),
        forced: true, reason: "solidarite-max"
      };
    }

    return { moves: candidats, forced: force, reason: force ? "case7-forcee" : "" };
  }

  /* ------------------------------------------------------------------ */
  /*  APPLIQUER UN COUP : c'est LA fonction centrale du moteur          */
  /*  Renvoie un NOUVEL état (l'ancien n'est pas modifié) ou une erreur */
  /* ------------------------------------------------------------------ */
  function jouerCoup(state, player, start) {
    if (state.finished) {
      return { error: "La partie est terminée." };
    }
    if (player !== state.turn) {
      return { error: "Ce n'est pas le tour de " + player + "." };
    }
    var legal = coupsLegaux(state, player);
    if (legal.moves.indexOf(start) === -1) {
      return { error: "Coup interdit pour la case " + start + "." };
    }

    var P = PLAYERS[player];
    var grainesDepart = state.board[start];   // graines contenues dans la case jouée

    // 1) Semis : on obtient le plateau APRÈS distribution (sans prise encore)
    var sim = simulerSemis(state.board, player, start);
    var plateauSeme = sim.board;              // plateau après semis, sans prise

    // 2) Prises : calculées sur une COPIE, pour pouvoir les annuler sans
    //    risque (on n'altère jamais `plateauSeme` tant qu'on n'est pas sûr).
    var plateauAvecPrises = plateauSeme.slice();
    var prises = resoudrePrises(plateauAvecPrises, player, sim.last, sim.totalSown);

    var priseAnnulee = false;
    var noteInterdit = "";

    // INTERDIT 1 : un coup de la case 7 ne contenant que 1-2 graines ne fait
    // que nourrir l'adversaire — SAUF s'il réalise une prise (alors on la
    // garde). On ne note donc le cas « nourrissage » que s'il n'y a AUCUNE
    // prise (coup forcé par solidarité, ou unique coup possible).
    if (start === P.case7 && (grainesDepart === 1 || grainesDepart === 2) && prises.captured === 0) {
      priseAnnulee = true;
      noteInterdit = "Case 7 (1-2 graines) : aucune prise, graines laissées à l'adversaire.";
    }

    // INTERDIT 2 : un coup ne doit pas VIDER complètement le camp adverse.
    // Si la prise viderait le camp adverse, aucune prise n'est faite.
    if (!priseAnnulee && prises.captured > 0) {
      var resteAdverse = P.oppCells.reduce(function (s, c) {
        return s + plateauAvecPrises[c];
      }, 0);
      if (resteAdverse === 0) {
        priseAnnulee = true;
        noteInterdit = "Coup viderait le camp adverse : aucune prise (interdit).";
      }
    }

    // On choisit le plateau final selon que la prise est validée ou annulée.
    var board = priseAnnulee ? plateauSeme : plateauAvecPrises;
    var capturedSeeds = priseAnnulee ? 0 : prises.captured;
    var capturedCells = priseAnnulee ? [] : prises.cells.slice();

    // 3) On construit le nouvel état
    var newState = {
      board: board,
      scores: { SUD: state.scores.SUD, NORD: state.scores.NORD },
      turn: P.opp,                      // le tour passe à l'adversaire
      finished: false,
      winner: null,
      message: "",
      lastMove: {
        player: player, from: start,
        captured: capturedSeeds, capturedCells: capturedCells,
        note: noteInterdit
      }
    };
    newState.scores[player] += capturedSeeds;

    // 4) Conditions de fin de partie
    appliquerFinDePartie(newState);
    return { state: newState };
  }

  /* ------------------------------------------------------------------ */
  /*  CONDITIONS DE FIN DE PARTIE                                        */
  /*  Modifie `state` en place : positionne finished/winner/message.    */
  /* ------------------------------------------------------------------ */
  function appliquerFinDePartie(state) {
    // a) Un joueur a au moins 40 graines -> il gagne immédiatement
    if (state.scores.SUD >= 40 || state.scores.NORD >= 40) {
      return terminer(state, "Un joueur a atteint 40 graines.");
    }

    var grainesPlateau = state.board.reduce(function (s, x) { return s + x; }, 0);

    // b) Moins de 10 graines sur le plateau -> fin, chaque camp récupère
    //    les graines de son territoire.
    if (grainesPlateau < 10) {
      ramasserReste(state);
      return terminer(state, "Moins de 10 graines sur le plateau.");
    }

    // c) Le joueur qui doit jouer ne peut pas jouer (camp vide) ou la
    //    solidarité est impossible -> fin, chaque camp récupère ses graines.
    var legal = coupsLegaux(state, state.turn);
    if (legal.reason === "camp-vide" || legal.reason === "solidarite-impossible") {
      ramasserReste(state);
      return terminer(state, legal.reason === "camp-vide"
        ? "Le joueur ne peut plus jouer."
        : "Solidarité impossible.");
    }
  }

  // Chaque camp récupère les graines présentes dans son territoire
  function ramasserReste(state) {
    var sud = 0, nord = 0;
    for (var i = 0; i < 14; i++) {
      if (i <= 6) sud += state.board[i]; else nord += state.board[i];
      state.board[i] = 0;
    }
    state.scores.SUD += sud;
    state.scores.NORD += nord;
  }

  // Désigne le vainqueur (>= 40 graines, sinon partie nulle)
  function terminer(state, cause) {
    state.finished = true;
    if (state.scores.SUD >= 40) state.winner = "SUD";
    else if (state.scores.NORD >= 40) state.winner = "NORD";
    else state.winner = "NULLE";
    state.message = cause + " Score final : SUD " + state.scores.SUD +
                    " - NORD " + state.scores.NORD + ".";
    return state;
  }

  /* ------------------------------------------------------------------ */
  /*  API PUBLIQUE DU MOTEUR                                             */
  /* ------------------------------------------------------------------ */
  var SongoEngine = {
    CASES_PAR_CAMP: CASES_PAR_CAMP,
    GRAINES_PAR_CASE: GRAINES_PAR_CASE,
    TOTAL_GRAINES: TOTAL_GRAINES,
    PLAYERS: PLAYERS,
    nouvellePartie: nouvellePartie,
    coupsLegaux: coupsLegaux,
    jouerCoup: jouerCoup,
    simulerSemis: simulerSemis,           // exposé pour l'aperçu/IA éventuelle
    oppCellsInSowOrder: oppCellsInSowOrder
  };

  // Export universel : navigateur (global window) + Node.js (module.exports)
  global.SongoEngine = SongoEngine;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = SongoEngine;
  }

})(typeof window !== "undefined" ? window : this);
