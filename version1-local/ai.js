/* =====================================================================
   IA DU SONGO  (ai.js)
   ---------------------------------------------------------------------
   IA embarquée, 100 % hors-ligne. Elle s'appuie sur le moteur (engine.js)
   pour explorer les coups possibles et choisir le meilleur, à l'aide de
   l'algorithme MINIMAX avec ÉLAGAGE ALPHA-BÊTA et approfondissement itératif.

   Principe :
     - on explore l'arbre des coups jusqu'à une certaine profondeur ;
     - à chaque feuille on ÉVALUE la position (fonction heuristique) ;
     - le joueur IA cherche à MAXIMISER cette évaluation, l'adversaire à la
       MINIMISER (d'où "minimax") ;
     - l'élagage alpha-bêta coupe les branches inutiles pour aller plus vite ;
     - un budget de temps garantit que l'IA répond toujours rapidement.
   ===================================================================== */

(function (global) {
  "use strict";

  // Réglages par niveau de difficulté
  var NIVEAUX = {
    facile:    { profondeur: 1,  budgetMs: 200,  hasard: 0.35 },
    moyen:     { profondeur: 4,  budgetMs: 500,  hasard: 0.05 },
    difficile: { profondeur: 8,  budgetMs: 900,  hasard: 0.0  },
    expert:    { profondeur: 12, budgetMs: 1600, hasard: 0.0  }
  };

  var GAIN_VICTOIRE = 100000;

  // -------------------------------------------------------------------
  //  ÉVALUATION d'une position, du point de vue du joueur "moi"
  // -------------------------------------------------------------------
  function evaluer(state, moi) {
    var E = global.SongoEngine;
    var adv = (moi === "SUD") ? "NORD" : "SUD";

    if (state.finished) {
      if (state.winner === moi) return GAIN_VICTOIRE + (state.scores[moi] - state.scores[adv]);
      if (state.winner === adv) return -GAIN_VICTOIRE - (state.scores[adv] - state.scores[moi]);
      return 0; // partie nulle
    }

    var mesCases = E.PLAYERS[moi].cells;
    var sesCases = E.PLAYERS[adv].cells;
    var b = state.board;
    var mesGraines = 0, sesGraines = 0, mesVuln = 0, sesVuln = 0;

    for (var i = 0; i < mesCases.length; i++) {
      var v = b[mesCases[i]];
      mesGraines += v;
      if (v === 1 || v === 2) mesVuln++;     // cases fragiles (capturables)
    }
    for (var j = 0; j < sesCases.length; j++) {
      var w = b[sesCases[j]];
      sesGraines += w;
      if (w === 1 || w === 2) sesVuln++;
    }

    // Le score (graines récoltées) pèse le plus : c'est l'objectif (40/70).
    // On valorise un peu le fait de garder des graines de son côté, et la
    // présence de cases adverses fragiles ; on pénalise ses propres cases fragiles.
    return 8 * (state.scores[moi] - state.scores[adv])
         + 1 * (mesGraines - sesGraines)
         - 2 * mesVuln
         + 2 * sesVuln;
  }

  // -------------------------------------------------------------------
  //  MINIMAX avec élagage alpha-bêta
  // -------------------------------------------------------------------
  function minimax(state, moi, profondeur, alpha, beta, deadline) {
    var E = global.SongoEngine;
    if (profondeur === 0 || state.finished) return evaluer(state, moi);

    var aJouer = state.turn;
    var legal = E.coupsLegaux(state, aJouer);
    if (legal.moves.length === 0) return evaluer(state, moi);

    var coups = ordonner(state, aJouer, legal.moves);
    var maximise = (aJouer === moi);
    var meilleur = maximise ? -Infinity : Infinity;

    for (var k = 0; k < coups.length; k++) {
      var res = E.jouerCoup(state, aJouer, coups[k]);
      if (res.error) continue;
      var val = minimax(res.state, moi, profondeur - 1, alpha, beta, deadline);
      if (maximise) {
        if (val > meilleur) meilleur = val;
        if (meilleur > alpha) alpha = meilleur;
      } else {
        if (val < meilleur) meilleur = val;
        if (meilleur < beta) beta = meilleur;
      }
      if (beta <= alpha) break;                 // élagage
      if (deadline && Date.now() > deadline) break;
    }
    return meilleur;
  }

  // Ordonne les coups (prises immédiates d'abord) pour mieux élaguer
  function ordonner(state, joueur, moves) {
    var E = global.SongoEngine;
    var scored = moves.map(function (mv) {
      var r = E.jouerCoup(state, joueur, mv);
      var gain = (r.error || !r.state.lastMove) ? -1 : r.state.lastMove.captured;
      return { mv: mv, gain: gain };
    });
    scored.sort(function (a, b) { return b.gain - a.gain; });
    return scored.map(function (s) { return s.mv; });
  }

  // -------------------------------------------------------------------
  //  CHOIX DU COUP par l'IA (approfondissement itératif + budget temps)
  // -------------------------------------------------------------------
  function choisir(state, joueur, niveau) {
    var E = global.SongoEngine;
    var cfg = NIVEAUX[niveau] || NIVEAUX.moyen;
    var legal = E.coupsLegaux(state, joueur);
    if (legal.moves.length === 0) return { move: null, raison: "aucun-coup" };
    if (legal.moves.length === 1) return { move: legal.moves[0], profondeur: 0, score: 0 };

    // Niveau facile : un peu d'aléatoire pour rester battable
    if (Math.random() < cfg.hasard) {
      return { move: legal.moves[(Math.random() * legal.moves.length) | 0], profondeur: 0, aleatoire: true };
    }

    var deadline = Date.now() + cfg.budgetMs;
    var coups = ordonner(state, joueur, legal.moves);
    var meilleurCoup = coups[0], meilleurScoreGlobal = -Infinity, profAtteinte = 0;

    // Approfondissement itératif : profondeur 1, 2, ... jusqu'au budget
    for (var prof = 1; prof <= cfg.profondeur; prof++) {
      var alpha = -Infinity, beta = Infinity;
      var localBest = coups[0], localScore = -Infinity;
      var complete = true;

      for (var k = 0; k < coups.length; k++) {
        var res = E.jouerCoup(state, joueur, coups[k]);
        if (res.error) continue;
        var val = minimax(res.state, joueur, prof - 1, alpha, beta, deadline);
        if (val > localScore) { localScore = val; localBest = coups[k]; }
        if (localScore > alpha) alpha = localScore;
        if (Date.now() > deadline) { complete = false; break; }
      }
      // On ne retient un palier que s'il a été exploré entièrement
      if (complete) {
        meilleurCoup = localBest; meilleurScoreGlobal = localScore; profAtteinte = prof;
        // place le meilleur coup en tête pour le palier suivant (meilleur élagage)
        coups = [localBest].concat(coups.filter(function (m) { return m !== localBest; }));
        if (localScore >= GAIN_VICTOIRE) break; // victoire forcée trouvée
      } else break;
    }
    return { move: meilleurCoup, profondeur: profAtteinte, score: meilleurScoreGlobal };
  }

  var SongoAI = { choisir: choisir, NIVEAUX: NIVEAUX, evaluer: evaluer };
  global.SongoAI = SongoAI;
  if (typeof module !== "undefined" && module.exports) module.exports = SongoAI;

})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
