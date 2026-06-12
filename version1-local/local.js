/* =====================================================================
   CONTRÔLEUR — Le Songo, Version 1
   Deux phases bien distinctes :
     • CONFIG  : on règle la partie (réglages modifiables, plateau en
                 aperçu non cliquable, chronomètre à l'arrêt) ;
     • PARTIE  : lancée par le bouton « Lancer la partie ». Les réglages
                 sont alors VERROUILLÉS (on ne peut les changer qu'en
                 abandonnant, avec confirmation). Le chronomètre tourne
                 pour le camp au trait (humain OU IA).
   Modes 2 joueurs / IA · bilingue FR-EN · animation · tutoriel ·
   guide complet · statistiques/historique · records.
   ===================================================================== */
(function () {
  "use strict";

  /* =================== 1. Dictionnaire bilingue =================== */
  var T = {
    fr: {
      sous_titre: "Jeu de semailles du peuple Ekang (Cameroun) — « les échecs africains »",
      origine_btn: "À propos du jeu",
      origine_txt: "Le Songo (ou Songo'o) est un jeu de stratégie de la famille des mancalas, pratiqué par le peuple Ekang/Béti (Cameroun, Gabon, Guinée équatoriale). On le surnomme « les échecs africains ». Le plateau (mbek) compte 14 cases (nda, « maisons ») ; les graines (songo) sont traditionnellement celles de l'arbre ezezang, parfois remplacées par des billes. Chaque joueur récolte ses prises dans un grenier. But : récolter au moins 40 graines sur 70.",
      mode_label: "Mode :", mode_2j: "2 joueurs", mode_ia: "Contre l'IA",
      cote_label: "Vous jouez :", diff_label: "Difficulté :",
      diff_facile: "Facile", diff_moyen: "Moyen", diff_difficile: "Difficile", diff_expert: "Expert",
      premier_label: "Premier à jouer :",
      btn_lancer: "Lancer la partie", btn_abandonner: "Abandonner la partie",
      btn_tuto: "Tutoriel", btn_guide: "Guide", btn_stats: "Statistiques",
      recoltees: "graines récoltées", objectif: "objectif : 40 / 70", grenier: "Grenier",
      temps_partie: "Temps de partie",
      nom_sud: "Joueur SUD :", nom_nord: "Joueur NORD :", votre_nom: "Votre nom :", joueur_ia: "Adversaire :",
      ia_nom: "IA ({0})",
      tuto_prec: "Précédent", tuto_suiv: "Suivant", tuto_quitter: "Quitter", tuto_terminer: "Terminer",
      config_prompt: "Configurez la partie, puis cliquez « Lancer la partie ».",
      turn_of: "Au tour de {0}", your_turn: "À vous de jouer ({0})", ai_thinking: "L'IA réfléchit…",
      finished: "Partie terminée", win: "{0} gagne !", draw: "Partie nulle.",
      start_msg: "Partie lancée ! Cliquez une case verte de votre camp.",
      start_ai: "Partie lancée contre l'IA — vous jouez {0}.",
      not_move: "Ce n'est pas un coup possible. Cases en vert = coups autorisés.",
      capture: "Prise de {0} graine{1} !", no_capture: "Aucune prise.",
      plays: "{0} joue.", you_play: "Vous jouez.",
      enregistre: "(partie enregistrée dans les statistiques)",
      enregistre_session: "(enregistrée pour cette session — le stockage local est bloqué par le navigateur)",
      fermer: "Fermer",
      confirm_abandon_titre: "Abandonner la partie en cours ?",
      confirm_abandon_txt: "Une partie est en cours. Si vous continuez, elle sera perdue et ne sera pas enregistrée. Voulez-vous vraiment l'abandonner ?",
      oui_abandonner: "Oui, abandonner", non_continuer: "Non, continuer",
      guide_titre: "Guide complet du Songo",
      stats_titre: "Statistiques & historique",
      stats_aucune: "Aucune partie enregistrée pour l'instant. Lancez et terminez une partie : elle apparaîtra ici.",
      stats_joueurs: "Par joueur", stats_records: "Records", stats_histo: "Dernières parties", stats_reset: "Effacer les statistiques",
      confirm_reset_titre: "Tout effacer ?",
      confirm_reset_txt: "Cela supprimera définitivement tout l'historique et les statistiques enregistrés. Continuer ?",
      oui_effacer: "Oui, effacer", non: "Annuler",
      col_joueur: "Joueur", col_parties: "Parties", col_v: "V", col_n: "N", col_d: "D",
      col_tauxv: "% vict.", col_meilleur: "Meilleur", col_tempscoup: "s/coup", col_serie: "Série",
      rec_meilleur_score: "Meilleur score", rec_victoire_rapide: "Victoire la plus rapide",
      rec_partie_longue: "Partie la plus longue", rec_plus_coups: "Plus de coups", rec_grosse_prise: "Plus grosse prise",
      rec_graines: "{0} graines", rec_coups: "{0} coups", rec_par: "par {0}",
      badge_n: "Nulle",
      note_temps: "Le chronomètre mesure le temps de chaque camp pendant son tour (il se met en pause quand une fenêtre est ouverte ou que l'onglet est masqué)."
    },
    en: {
      sous_titre: "A sowing game of the Ekang people (Cameroon) — \"African chess\"",
      origine_btn: "About the game",
      origine_txt: "Songo (or Songo'o) is a strategy game of the mancala family, played by the Ekang/Beti people (Cameroon, Gabon, Equatorial Guinea). It is nicknamed \"African chess\". The board (mbek) has 14 pits (nda, \"houses\"); the seeds (songo) are traditionally those of the ezezang tree, sometimes replaced by marbles. Each player collects captures in a store. Goal: capture at least 40 of the 70 seeds.",
      mode_label: "Mode:", mode_2j: "2 players", mode_ia: "Vs Computer",
      cote_label: "You play:", diff_label: "Difficulty:",
      diff_facile: "Easy", diff_moyen: "Medium", diff_difficile: "Hard", diff_expert: "Expert",
      premier_label: "First to play:",
      btn_lancer: "Start game", btn_abandonner: "Abandon game",
      btn_tuto: "Tutorial", btn_guide: "Guide", btn_stats: "Statistics",
      recoltees: "seeds captured", objectif: "goal: 40 / 70", grenier: "Store",
      temps_partie: "Game time",
      nom_sud: "SOUTH player:", nom_nord: "NORTH player:", votre_nom: "Your name:", joueur_ia: "Opponent:",
      ia_nom: "AI ({0})",
      tuto_prec: "Back", tuto_suiv: "Next", tuto_quitter: "Quit", tuto_terminer: "Finish",
      config_prompt: "Set up the game, then click \"Start game\".",
      turn_of: "{0} to play", your_turn: "Your turn ({0})", ai_thinking: "Computer is thinking…",
      finished: "Game over", win: "{0} wins!", draw: "Draw.",
      start_msg: "Game started! Click a green pit on your side.",
      start_ai: "Game started vs Computer — you play {0}.",
      not_move: "Not a legal move. Green pits = allowed moves.",
      capture: "Captured {0} seed{1}!", no_capture: "No capture.",
      plays: "{0} plays.", you_play: "You play.",
      enregistre: "(game saved to statistics)",
      enregistre_session: "(saved for this session — local storage is blocked by the browser)",
      fermer: "Close",
      confirm_abandon_titre: "Abandon the current game?",
      confirm_abandon_txt: "A game is in progress. If you continue, it will be lost and not saved. Do you really want to abandon it?",
      oui_abandonner: "Yes, abandon", non_continuer: "No, keep playing",
      guide_titre: "Complete Songo guide",
      stats_titre: "Statistics & history",
      stats_aucune: "No game recorded yet. Start and finish a game and it will show up here.",
      stats_joueurs: "By player", stats_records: "Records", stats_histo: "Recent games", stats_reset: "Clear statistics",
      confirm_reset_titre: "Clear everything?",
      confirm_reset_txt: "This permanently deletes all saved history and statistics. Continue?",
      oui_effacer: "Yes, clear", non: "Cancel",
      col_joueur: "Player", col_parties: "Games", col_v: "W", col_n: "D", col_d: "L",
      col_tauxv: "Win%", col_meilleur: "Best", col_tempscoup: "s/move", col_serie: "Streak",
      rec_meilleur_score: "Best score", rec_victoire_rapide: "Fastest win",
      rec_partie_longue: "Longest game", rec_plus_coups: "Most moves", rec_grosse_prise: "Biggest capture",
      rec_graines: "{0} seeds", rec_coups: "{0} moves", rec_par: "by {0}",
      badge_n: "Draw",
      note_temps: "The clock measures each side's time during its turn (it pauses while a window is open or the tab is hidden)."
    }
  };
  var lang = "fr";
  function t(key) {
    var s = T[lang][key];
    if (typeof s !== "string") return s;
    for (var i = 1; i < arguments.length; i++) s = s.replace("{" + (i - 1) + "}", arguments[i]);
    return s;
  }

  /* =================== 2. Contenu du GUIDE =================== */
  var GUIDE = [
    { t:{fr:"But du jeu",en:"Goal"}, p:[
      {fr:"Le plateau contient 70 graines (2 camps de 7 cases, 5 graines par case).",en:"The board holds 70 seeds (2 sides of 7 pits, 5 seeds each)."},
      {fr:"Le premier joueur qui récolte 40 graines gagne immédiatement.",en:"The first player to capture 40 seeds wins immediately."},
      {fr:"Si le plateau se vide (moins de 10 graines) sans que personne n'ait 40, la partie est déclarée nulle.",en:"If the board empties (fewer than 10 seeds) without anyone reaching 40, the game is a draw."}
    ]},
    { t:{fr:"Le plateau et la numérotation",en:"Board & numbering"}, p:[
      {fr:"NORD est en haut, SUD en bas. Chacun possède la rangée de 7 cases de son côté.",en:"NORTH is on top, SOUTH at the bottom. Each owns the row of 7 pits on their side."},
      {fr:"Vos cases vont de 1 à 7 ; la case n°1 est la plus à VOTRE gauche (numérotation en miroir car les joueurs se font face).",en:"Your pits go from 1 to 7; pit #1 is farthest to YOUR left (mirrored numbering as players face each other)."},
      {fr:"Le grenier de chaque joueur (aux extrémités) reçoit les graines récoltées.",en:"Each player's store (at the ends) holds captured seeds."}
    ]},
    { t:{fr:"Jouer un coup : le semis",en:"Making a move: sowing"}, p:[
      {fr:"À votre tour, choisissez une de VOS cases non vides.",en:"On your turn, pick one of YOUR non-empty pits."},
      {fr:"Toutes ses graines sont ramassées puis semées une par une dans les cases suivantes, en suivant la boucle : la fin de votre camp, puis le camp adverse.",en:"All its seeds are picked up then sown one by one into the following pits, around the loop: the rest of your side, then the opponent's side."},
      {fr:"On ne redépose jamais une graine dans la case de départ.",en:"You never drop a seed back into the starting pit."},
      {fr:"Quand peut-on jouer une case ? Toute case de son camp avec au moins 1 graine — sauf les restrictions ci-dessous.",en:"When can you play a pit? Any pit on your side with at least 1 seed — except the restrictions below."}
    ]},
    { t:{fr:"Les prises (récoltes)",en:"Captures"}, p:[
      {fr:"Vous récoltez UNIQUEMENT si votre dernière graine tombe CHEZ L'ADVERSAIRE dans une case qui atteint 2, 3 ou 4 graines. Vous prenez cette case.",en:"You capture ONLY if your last seed lands on the OPPONENT's side in a pit reaching 2, 3 or 4 seeds. You take that pit."},
      {fr:"Prise à la chaîne : on remonte ensuite les cases adverses semées juste avant, tant qu'elles contiennent 2 à 4 graines. Tout est récolté.",en:"Chained capture: you then walk back through the opponent pits sown just before, while they hold 2 to 4 seeds. All of it is collected."},
      {fr:"On s'arrête dès qu'une case n'a pas 2-4 graines, ou dès qu'on sort du camp adverse.",en:"It stops as soon as a pit isn't 2-4, or you leave the opponent's side."},
      {fr:"Aucune prise si la dernière graine reste dans votre camp, ou atteint 1 ou 5 et plus chez l'adversaire.",en:"No capture if the last seed stays on your side, or reaches 1 or 5+ on the opponent's side."}
    ]},
    { t:{fr:"La case protégée (n°1 de l'adversaire)",en:"The protected pit (opponent's #1)"}, p:[
      {fr:"La case n°1 de l'adversaire (la plus à votre gauche) ne peut PAS être prise comme case finale d'un semis normal.",en:"The opponent's pit #1 (farthest to your left) CANNOT be captured as the final pit of a normal sow."},
      {fr:"Exception : si votre semis a fait au moins un tour complet (≥ 14 graines) et s'y termine, vous ne récoltez que la dernière graine déposée.",en:"Exception: if your sow made at least a full loop (≥ 14 seeds) and ends there, you collect only the last seed dropped."},
      {fr:"Elle peut en revanche être prise comme maillon d'une chaîne (commencée sur une autre case).",en:"It can however be taken as a chain link (started on another pit)."}
    ]},
    { t:{fr:"Les semis longs (plus de 13 graines)",en:"Long sows (more than 13 seeds)"}, p:[
      {fr:"Si une case contient plus de 13 graines, on fait d'abord un tour complet du plateau (en sautant la case de départ, qui reste vide).",en:"If a pit holds more than 13 seeds, you first go once fully around (skipping the starting pit, which stays empty)."},
      {fr:"Le reste est ensuite semé uniquement chez l'adversaire, à partir de sa case n°1.",en:"The remainder is then sown only on the opponent's side, starting at their pit #1."}
    ]},
    { t:{fr:"Nourrir l'adversaire : la solidarité",en:"Feeding the opponent: solidarity"}, p:[
      {fr:"Si le camp adverse est entièrement vide, vous DEVEZ jouer un coup qui lui apporte des graines.",en:"If the opponent's side is completely empty, you MUST play a move that brings seeds to it."},
      {fr:"Si possible, un coup qui lui donne au moins 7 graines ; sinon celui qui lui en donne le plus.",en:"If possible, a move giving at least 7 seeds; otherwise the one giving the most."},
      {fr:"Si aucun coup ne peut le nourrir, la partie s'arrête et chacun récupère ses graines.",en:"If no move can feed it, the game ends and each side collects its seeds."}
    ]},
    { t:{fr:"Les coups interdits",en:"Forbidden moves"}, p:[
      {fr:"On ne peut pas jouer sa case 7 (la plus proche de l'adversaire) si elle ne contient que 1 ou 2 graines — sauf si c'est le seul coup possible (et alors sans prise).",en:"You cannot play your pit 7 (closest to the opponent) if it holds only 1 or 2 seeds — unless it's your only legal move (then no capture)."},
      {fr:"On ne peut pas « affamer » l'adversaire : si une prise viderait tout son camp, le coup est joué mais la prise est annulée (les graines lui restent).",en:"You cannot \"starve\" the opponent: if a capture would empty their whole side, the move is played but the capture is cancelled (seeds stay with them)."}
    ]},
    { t:{fr:"Fin de partie",en:"End of the game"}, p:[
      {fr:"Un joueur atteint 40 graines → victoire immédiate.",en:"A player reaches 40 seeds → immediate win."},
      {fr:"Moins de 10 graines restent → chaque camp récupère les graines de son territoire, puis on compare les scores.",en:"Fewer than 10 seeds remain → each side collects the seeds in its territory, then scores are compared."},
      {fr:"Un joueur ne peut plus jouer ou la solidarité est impossible → fin, chacun récupère ses graines.",en:"A player can no longer move or solidarity is impossible → game ends, each collects its seeds."}
    ]},
    { t:{fr:"Conseils de stratégie",en:"Strategy tips"}, p:[
      {fr:"Surveillez vos cases à 1 ou 2 graines : elles sont vulnérables.",en:"Watch your pits with 1 or 2 seeds: they are vulnerable."},
      {fr:"Visez les cases adverses à 1 ou 3 graines : un dépôt les amène à 2 ou 4 → prise.",en:"Target opponent pits with 1 or 3 seeds: one drop brings them to 2 or 4 → capture."},
      {fr:"Accumuler beaucoup de graines (>13) prépare un grand tour aux longues chaînes.",en:"Building up many seeds (>13) sets up a big loop with long chains."}
    ]}
  ];

  /* =================== 3. Raccourcis & état =================== */
  var ORDRE_NORD = [{idx:7,l:"1"},{idx:8,l:"2"},{idx:9,l:"3"},{idx:10,l:"4"},{idx:11,l:"5"},{idx:12,l:"6"},{idx:13,l:"7"}];
  var ORDRE_SUD  = [{idx:6,l:"7"},{idx:5,l:"6"},{idx:4,l:"5"},{idx:3,l:"4"},{idx:2,l:"3"},{idx:1,l:"2"},{idx:0,l:"1"}];
  var $ = function (id) { return document.getElementById(id); };
  var cellules = {};

  var etat = null;
  var phase = "config";          // "config" | "partie"
  var mode = "2j";
  var coteHumain = "SUD";
  var niveau = "moyen";
  var busy = false;
  var movesPlayed = 0;
  var modalOuverte = false;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function aiSide() { return coteHumain === "SUD" ? "NORD" : "SUD"; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* =================== 4. Chronomètre =================== */
  var chrono = { acc:{SUD:0,NORD:0}, moves:{SUD:0,NORD:0}, active:null, last:0, maxCapture:0 };
  function chronoEnPause() { return modalOuverte || (typeof document !== "undefined" && document.hidden); }
  function chronoFlush() {
    var now = Date.now();
    if (chrono.active && !chronoEnPause()) chrono.acc[chrono.active] += now - chrono.last;
    chrono.last = now;
  }
  function chronoSetActive(side) { chronoFlush(); chrono.active = side; chrono.last = Date.now(); }
  function chronoReset() { chrono.acc = {SUD:0,NORD:0}; chrono.moves = {SUD:0,NORD:0}; chrono.active = null; chrono.last = Date.now(); chrono.maxCapture = 0; }
  function fmtDur(ms) {
    var s = Math.round(ms / 1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
    function z(n){ return (n<10?"0":"")+n; }
    return h>0 ? h+":"+z(m)+":"+z(ss) : z(m)+":"+z(ss);
  }
  function majChrono() {
    $("chrono-val-SUD").textContent = fmtDur(chrono.acc.SUD);
    $("chrono-val-NORD").textContent = fmtDur(chrono.acc.NORD);
    $("chrono-total").textContent = fmtDur(chrono.acc.SUD + chrono.acc.NORD);
    $("chrono-cote-SUD").classList.toggle("actif", chrono.active === "SUD");
    $("chrono-cote-NORD").classList.toggle("actif", chrono.active === "NORD");
  }
  setInterval(function () { chronoFlush(); majChrono(); }, 300);

  /* =================== 5. Plateau =================== */
  function construirePlateau() {
    var n = $("rangee-nord"), s = $("rangee-sud");
    n.innerHTML = ""; s.innerHTML = ""; cellules = {};
    ORDRE_NORD.forEach(function (c) { n.appendChild(creerCase(c)); });
    ORDRE_SUD.forEach(function (c) { s.appendChild(creerCase(c)); });
  }
  function creerCase(c) {
    var btn = document.createElement("button");
    btn.className = "case"; btn.dataset.index = c.idx;
    btn.innerHTML = '<div class="graines"></div><span class="nombre">0</span><span class="etiquette-case">' + c.l + '</span>';
    btn.addEventListener("click", function () { onClicCase(c.idx); });
    cellules[c.idx] = btn;
    return btn;
  }
  function dessinerGraines(container, nb) {
    container.innerHTML = "";
    var k = Math.min(nb, 10);
    for (var i = 0; i < k; i++) {
      var pt = document.createElement("span"); pt.className = "graine-pt";
      if (k === 1) { pt.style.left = "42%"; pt.style.top = "42%"; }
      else { var a = (2*Math.PI*i)/k - Math.PI/2; pt.style.left = (42+30*Math.cos(a))+"%"; pt.style.top = (42+30*Math.sin(a))+"%"; }
      container.appendChild(pt);
    }
  }
  function majCase(i, valeur) {
    cellules[i].querySelector(".nombre").textContent = valeur;
    dessinerGraines(cellules[i].querySelector(".graines"), valeur);
  }

  /* =================== 6. Affichage =================== */
  function nomDe(side) {
    if (mode === "ia" && side === aiSide()) return t("ia_nom", t("diff_" + niveau));
    var v = ($("nom-" + side).value || "").trim();
    return v || side;
  }
  function afficher() {
    var et0 = tuto.actif ? tuto.etapes[tuto.i] : null;
    var tutoCible = (et0 && et0.cible != null) ? et0.cible : null;
    var jouables = new Set();
    if (phase === "partie" && !etat.finished && !tuto.actif) {
      if (mode === "2j" || etat.turn === coteHumain) jouables = new Set(SongoEngine.coupsLegaux(etat, etat.turn).moves);
    }
    var lm = etat.lastMove;
    var recoltees = lm ? new Set(lm.capturedCells) : new Set();
    for (var i = 0; i < 14; i++) {
      majCase(i, etat.board[i]);
      var el = cellules[i];
      el.classList.remove("jouable", "depart", "recoltee", "cible");
      if (tutoCible != null) { if (i === tutoCible) el.classList.add("cible"); }
      else if (jouables.has(i)) el.classList.add("jouable");
      if (lm && lm.from === i) el.classList.add("depart");
      if (recoltees.has(i)) el.classList.add("recoltee");
    }
    $("aff-nom-SUD").textContent = nomDe("SUD");
    $("aff-nom-NORD").textContent = nomDe("NORD");
    $("chrono-nom-SUD").textContent = nomDe("SUD");
    $("chrono-nom-NORD").textContent = nomDe("NORD");
    $("score-SUD").textContent = etat.scores.SUD;
    $("score-NORD").textContent = etat.scores.NORD;
    $("grenier-SUD").textContent = etat.scores.SUD;
    $("grenier-NORD").textContent = etat.scores.NORD;
    var enJeu = (phase === "partie" && !etat.finished);
    $("carte-SUD").classList.toggle("actif", enJeu && etat.turn === "SUD");
    $("carte-NORD").classList.toggle("actif", enJeu && etat.turn === "NORD");

    var tour = $("indicateur-tour"); tour.classList.remove("penser");
    if (etat.finished) tour.textContent = t("finished");
    else if (phase === "config" || tuto.actif) tour.textContent = "";
    else if (mode === "ia" && etat.turn === aiSide()) { tour.innerHTML = "<strong>" + t("ai_thinking") + "</strong>"; tour.classList.add("penser"); }
    else if (mode === "ia") tour.innerHTML = t("your_turn", "<strong>" + nomDe(etat.turn) + "</strong>");
    else tour.innerHTML = t("turn_of", "<strong>" + nomDe(etat.turn) + "</strong>");
    majChrono();
  }

  /* =================== 7. Jouer un coup (animé) =================== */
  function jouerCoupAnime(player, start) {
    return new Promise(function (resolve) {
      busy = true;
      var sim = SongoEngine.simulerSemis(etat.board, player, start);
      var chemin = sim.chemin, aff = etat.board.slice();
      function appliquer() {
        var res = SongoEngine.jouerCoup(etat, player, start);
        if (res.error) { busy = false; note(res.error); resolve(res); return; }
        etat = res.state; afficher(); raconterCoup(player, etat.lastMove);
        if (window.SongoSound && etat.lastMove && etat.lastMove.captured > 0) SongoSound.capture(etat.lastMove.captured);
        busy = false; resolve(res);
      }
      if (reduceMotion || chemin.length === 0) { appliquer(); return; }
      aff[start] = 0; majCase(start, 0);
      var per = Math.max(45, Math.min(140, Math.floor(750 / chemin.length))), k = 0;
      function pas() {
        if (k >= chemin.length) { setTimeout(appliquer, 90); return; }
        var cell = chemin[k]; aff[cell] += 1; majCase(cell, aff[cell]);
        if (window.SongoSound) SongoSound.sow();
        var el = cellules[cell]; el.classList.add("depot");
        setTimeout(function () { el.classList.remove("depot"); }, 280);
        k++; setTimeout(pas, per);
      }
      setTimeout(pas, 120);
    });
  }

  /* =================== 8. Enchaînement des tours =================== */
  function apresCoup() {
    if (etat.lastMove && etat.lastMove.captured > chrono.maxCapture) chrono.maxCapture = etat.lastMove.captured;
    if (etat.finished) { finPartie(); return; }
    orienter();
  }
  function orienter() {
    // Le camp au trait (humain OU IA) voit son chronomètre tourner.
    chronoSetActive(etat.turn);
    afficher();
    if (mode === "ia" && etat.turn === aiSide()) declencherIA();
  }
  function onClicCase(index) {
    if (phase !== "partie" || busy || etat.finished) return;
    if (tuto.actif) { var et = tuto.etapes[tuto.i]; if (et && et.cible === index) jouerCible(); return; }
    var player = etat.turn;
    if (mode === "ia" && player !== coteHumain) return;
    var legal = SongoEngine.coupsLegaux(etat, player);
    if (legal.moves.indexOf(index) === -1) { note(t("not_move")); return; }
    chrono.moves[player] += 1; movesPlayed += 1;
    jouerCoupAnime(player, index).then(apresCoup);
  }
  function declencherIA() {
    if (etat.finished) return;
    busy = true;
    setTimeout(function () {
      var choix = SongoAI.choisir(etat, aiSide(), niveau);
      busy = false;
      if (choix.move == null) { afficher(); return; }
      chrono.moves[aiSide()] += 1; movesPlayed += 1;
      jouerCoupAnime(aiSide(), choix.move).then(apresCoup);
    }, 350);
  }

  /* =================== 9. Messages & fin =================== */
  function note(html) { $("message").innerHTML = html; }
  function raconterCoup(joueur, lm) {
    if (!lm) return;
    var estIAhum = (mode === "ia" && joueur === coteHumain);
    var txt = estIAhum ? t("you_play") : t("plays", nomDe(joueur));
    if (lm.note) txt += ' <span class="prise-txt">' + lm.note + "</span>";
    else if (lm.captured > 0) txt += ' <span class="prise-txt">' + t("capture", lm.captured, lm.captured > 1 ? "s" : "") + "</span>";
    else txt += " " + t("no_capture");
    note(txt);
  }
  function finPartie() {
    chronoSetActive(null);
    if (window.SongoSound) { if (etat.winner === "NULLE") SongoSound.draw(); else SongoSound.win(); }
    var game = {
      ts: Date.now(), mode: mode, level: (mode === "ia" ? niveau : null),
      players: {
        SUD: { name: nomDe("SUD"), isAI: (mode === "ia" && aiSide() === "SUD") },
        NORD: { name: nomDe("NORD"), isAI: (mode === "ia" && aiSide() === "NORD") }
      },
      scores: { SUD: etat.scores.SUD, NORD: etat.scores.NORD },
      winner: etat.winner,
      durationMs: chrono.acc.SUD + chrono.acc.NORD,
      moves: { SUD: chrono.moves.SUD, NORD: chrono.moves.NORD },
      timeMs: { SUD: chrono.acc.SUD, NORD: chrono.acc.NORD },
      biggestCapture: chrono.maxCapture
    };
    var persiste = false;
    try { persiste = SongoStats.record(game); } catch (e) { persiste = false; }
    // Retour en phase config (réglages réutilisables) tout en gardant le plateau final affiché
    phase = "config"; deverrouillerConfig(); majBoutonLancer();
    var fin = (etat.winner === "NULLE") ? t("draw") + " " : '<span class="gagne">' + t("win", nomDe(etat.winner)) + "</span> ";
    var marque = persiste ? t("enregistre") : t("enregistre_session");
    note(fin + etat.message + ' <span class="histo-vide">' + marque + "</span>");
    afficher();
  }

  /* =================== 10. Phases : config / lancer / abandon =================== */
  function controlesConfig() { return ["cote-humain","difficulte","premier-joueur","nom-SUD","nom-NORD"]; }
  function verrouillerConfig() {
    document.querySelectorAll("#seg-mode .seg-btn").forEach(function (b) { b.disabled = true; });
    controlesConfig().forEach(function (id) { $(id).disabled = true; });
  }
  function deverrouillerConfig() {
    document.querySelectorAll("#seg-mode .seg-btn").forEach(function (b) { b.disabled = false; });
    ["cote-humain","difficulte","premier-joueur"].forEach(function (id) { $(id).disabled = false; });
    majNoms(); // gère l'activation des champs de noms (et désactive celui de l'IA)
  }
  function majBoutonLancer() {
    var b = $("btn-lancer");
    if (phase === "partie") { b.textContent = t("btn_abandonner"); b.classList.remove("principal"); b.classList.add("secondaire"); }
    else { b.textContent = t("btn_lancer"); b.classList.add("principal"); b.classList.remove("secondaire"); }
  }
  function entrerConfig() {
    if (tuto.actif) tutoQuitter();
    phase = "config"; deverrouillerConfig(); majBoutonLancer();
    etat = SongoEngine.nouvellePartie($("premier-joueur").value); // aperçu (non cliquable)
    movesPlayed = 0; chronoReset(); chronoSetActive(null);
    afficher(); note(t("config_prompt"));
  }
  function lancer() {
    phase = "partie"; verrouillerConfig(); majBoutonLancer();
    etat = SongoEngine.nouvellePartie($("premier-joueur").value);
    movesPlayed = 0; chronoReset(); busy = false;
    afficher();
    note(mode === "ia" ? t("start_ai", nomDe(coteHumain)) : t("start_msg"));
    orienter(); // démarre le chrono du 1er camp (et l'IA si elle commence)
  }
  function isEnCours() { return phase === "partie" && etat && !etat.finished && movesPlayed > 0; }
  function demanderAbandon(apres) {
    if (!isEnCours()) { (apres || entrerConfig)(); return; }
    confirmer(t("confirm_abandon_titre"), t("confirm_abandon_txt"), t("oui_abandonner"), t("non_continuer")).then(function (ok) { if (ok) (apres || entrerConfig)(); });
  }
  function onBoutonLancer() { if (phase === "partie") demanderAbandon(entrerConfig); else lancer(); }

  /* =================== 11. Tutoriel =================== */
  var Z = function () { return new Array(14).fill(0); };
  function mkState(board, turn) { return { board: board.slice(), scores:{SUD:0,NORD:0}, turn:turn, finished:false, winner:null, message:"", lastMove:null }; }
  var tuto = { actif:false, i:0, joue:false, etapes:[
    { text:{fr:"Bienvenue ! Le Songo se joue à deux. NORD est en haut, SUD en bas, chacun avec 7 cases de 5 graines. But : être le premier à récolter 40 graines sur 70.",
            en:"Welcome! Songo is for two players. NORTH on top, SOUTH at the bottom, each with 7 pits of 5 seeds. Goal: be first to capture 40 of the 70 seeds."} },
    { text:{fr:"On joue en vidant une case de SON camp : les graines sont semées une par une dans les cases suivantes. Cliquez la case surlignée pour semer.",
            en:"You play by emptying one of YOUR pits: seeds are sown one by one into the following pits. Click the highlighted pit to sow."},
      setup:function(){ return SongoEngine.nouvellePartie("SUD"); }, cible:2 },
    { text:{fr:"5 graines ont été déposées. Quand la dernière tombe chez l'adversaire et y forme un tas de 2, 3 ou 4 graines, on récolte.",
            en:"5 seeds were dropped. When the last lands on the opponent's side forming a heap of 2, 3 or 4, you capture."} },
    { text:{fr:"Exemple de prise. Cliquez la case surlignée : la dernière graine tombera chez NORD dans une case qui passe à 2 graines — vous la récoltez !",
            en:"Capture example. Click the highlighted pit: the last seed lands on NORTH's side in a pit reaching 2 — you capture it!"},
      setup:function(){ var b=Z(); b[3]=5;b[8]=1;b[10]=4;b[0]=5; return mkState(b,"SUD"); }, cible:3 },
    { text:{fr:"Bravo ! Les prises s'enchaînent sur les cases adverses précédentes (2 à 4 graines). La case n°1 adverse est protégée. Le bouton « Guide » détaille toutes les règles.",
            en:"Well done! Captures chain onto the preceding opponent pits (2 to 4 seeds). The opponent's pit #1 is protected. The \"Guide\" button details every rule."} },
    { text:{fr:"Vous connaissez l'essentiel. Cliquez « Terminer » : vous reviendrez à la configuration pour lancer une vraie partie. Bon jeu !",
            en:"You know the essentials. Click \"Finish\": you'll return to setup to start a real game. Enjoy!"} }
  ]};
  function demarrerTuto() {
    mode = "2j"; majSegMode(); $("ligne-ia").hidden = true;
    phase = "config"; deverrouillerConfig(); majBoutonLancer(); chronoReset(); chronoSetActive(null);
    tuto.actif = true; tuto.i = 0; tuto.joue = false; $("tuto-barre").hidden = false; tutoAfficher();
  }
  function tutoAfficher() {
    var et = tuto.etapes[tuto.i]; tuto.joue = false;
    if (et.setup) etat = et.setup(); else if (!etat) etat = SongoEngine.nouvellePartie("SUD");
    afficher();
    $("tuto-texte").textContent = et.text[lang];
    $("tuto-progres").textContent = (tuto.i + 1) + " / " + tuto.etapes.length;
    $("tuto-prec").disabled = (tuto.i === 0);
    $("tuto-suiv").textContent = (tuto.i === tuto.etapes.length - 1) ? t("tuto_terminer") : t("tuto_suiv");
    note(et.cible != null ? "👉 " + (lang === "fr" ? "Cliquez la case bleue." : "Click the blue pit.") : "");
  }
  function jouerCible() {
    if (busy || tuto.joue) return;
    tuto.joue = true;
    jouerCoupAnime(etat.turn, tuto.etapes[tuto.i].cible).then(function () { setTimeout(tutoSuivant, 700); });
  }
  function tutoSuivant() {
    if (busy) return;
    var et = tuto.etapes[tuto.i];
    if (et.cible != null && !tuto.joue) { jouerCible(); return; }
    if (tuto.i === tuto.etapes.length - 1) { tutoQuitter(); entrerConfig(); return; }
    tuto.i++; tutoAfficher();
  }
  function tutoPrec() { if (busy || tuto.i === 0) return; tuto.i--; tutoAfficher(); }
  function tutoQuitter() { tuto.actif = false; $("tuto-barre").hidden = true; for (var i=0;i<14;i++) cellules[i].classList.remove("cible"); }

  /* =================== 12. Fenêtre modale =================== */
  function ouvrirModal(titre, corpsHTML, boutons) {
    $("modal-titre").textContent = titre;
    $("modal-corps").innerHTML = corpsHTML;
    var pied = $("modal-pied"); pied.innerHTML = "";
    (boutons || []).forEach(function (b) {
      var btn = document.createElement("button");
      btn.textContent = b.label; if (b.cls) btn.className = b.cls;
      btn.addEventListener("click", b.action);
      pied.appendChild(btn);
    });
    chronoFlush(); $("modal").hidden = false; modalOuverte = true;
    return $("modal-corps");
  }
  function fermerModal() { $("modal").hidden = true; modalOuverte = false; chrono.last = Date.now(); }
  function confirmer(titre, texte, labelOui, labelNon) {
    return new Promise(function (resolve) {
      ouvrirModal(titre, "<p>" + texte + "</p>", [
        { label: labelNon, cls: "secondaire", action: function () { fermerModal(); resolve(false); } },
        { label: labelOui, cls: "principal", action: function () { fermerModal(); resolve(true); } }
      ]);
    });
  }
  $("modal-x").addEventListener("click", function () { fermerModal(); });
  $("modal").addEventListener("click", function (e) { if (e.target === $("modal")) fermerModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modalOuverte) fermerModal(); });

  /* =================== 13. Guide & Statistiques =================== */
  function ouvrirGuide() {
    var html = "";
    GUIDE.forEach(function (sec) {
      html += '<div class="guide-sec"><h3>' + sec.t[lang] + "</h3><ul>";
      sec.p.forEach(function (pt) { html += "<li>" + pt[lang] + "</li>"; });
      html += "</ul></div>";
    });
    ouvrirModal(t("guide_titre"), html, [{ label: t("fermer"), cls: "principal", action: fermerModal }]);
  }
  function fmtDate(ts) { var d = new Date(ts); function z(n){return (n<10?"0":"")+n;} return z(d.getDate())+"/"+z(d.getMonth()+1)+" "+z(d.getHours())+":"+z(d.getMinutes()); }
  function ouvrirStats() {
    var store = SongoStats.read(), agg = SongoStats.aggregate(store), html = "";
    if (agg.count === 0) {
      ouvrirModal(t("stats_titre"), "<p>" + t("stats_aucune") + "</p>", [{ label: t("fermer"), cls: "principal", action: fermerModal }]);
      return;
    }
    html += '<div class="stats-bloc"><h3>' + t("stats_joueurs") + '</h3><table class="stats-table"><tr>'
      + "<th>" + t("col_joueur") + "</th><th>" + t("col_parties") + "</th><th>" + t("col_v") + "</th><th>" + t("col_n") + "</th><th>" + t("col_d") + "</th>"
      + "<th>" + t("col_tauxv") + "</th><th>" + t("col_meilleur") + "</th><th>" + t("col_tempscoup") + "</th><th>" + t("col_serie") + "</th></tr>";
    Object.keys(agg.players).sort(function (a, b) { return agg.players[b].wins - agg.players[a].wins; }).forEach(function (n) {
      var p = agg.players[n];
      html += "<tr><td class='nom'>" + n + "</td><td>" + p.games + "</td><td>" + p.wins + "</td><td>" + p.draws + "</td><td>" + p.losses + "</td>"
        + "<td>" + p.winRate + "%</td><td>" + p.bestScore + "</td><td>" + (p.avgMoveSec ? p.avgMoveSec.toFixed(1) : "—") + "</td><td>" + p.bestStreak + "</td></tr>";
    });
    html += "</table></div>";
    var r = agg.records;
    function ligne(lbl, val, sub) { return val == null ? "" : "<li><span>" + lbl + "</span><span class='rec-val'>" + val + (sub ? " <span class='histo-vide'>" + sub + "</span>" : "") + "</span></li>"; }
    html += '<div class="stats-bloc"><h3>' + t("stats_records") + '</h3><ul class="records-liste">';
    if (r.highestScore) html += ligne(t("rec_meilleur_score"), t("rec_graines", r.highestScore.value), t("rec_par", r.highestScore.name));
    if (r.fastestWin) html += ligne(t("rec_victoire_rapide"), fmtDur(r.fastestWin.value), t("rec_par", r.fastestWin.name));
    if (r.longestGame) html += ligne(t("rec_partie_longue"), fmtDur(r.longestGame.value), "");
    if (r.mostMoves) html += ligne(t("rec_plus_coups"), t("rec_coups", r.mostMoves.value), "");
    if (r.biggestCapture) html += ligne(t("rec_grosse_prise"), t("rec_graines", r.biggestCapture.value), "");
    html += "</ul></div>";
    html += '<div class="stats-bloc"><h3>' + t("stats_histo") + '</h3><ul class="histo-liste">';
    store.games.slice().reverse().slice(0, 12).forEach(function (g) {
      var badge = g.winner === "NULLE" ? "<span class='badge-nul'>" + t("badge_n") + "</span>" : "<span class='badge-gagne'>" + g.players[g.winner].name + "</span>";
      html += "<li><span>" + fmtDate(g.ts) + " · " + g.players.SUD.name + " " + g.scores.SUD + "–" + g.scores.NORD + " " + g.players.NORD.name
        + "</span><span>" + badge + " · " + fmtDur(g.durationMs) + "</span></li>";
    });
    html += "</ul></div><p class='histo-vide'>" + t("note_temps") + "</p>";
    ouvrirModal(t("stats_titre"), html, [
      { label: t("stats_reset"), cls: "secondaire", action: function () {
          confirmer(t("confirm_reset_titre"), t("confirm_reset_txt"), t("oui_effacer"), t("non")).then(function (ok) { if (ok) { SongoStats.reset(); ouvrirStats(); } });
        } },
      { label: t("fermer"), cls: "principal", action: fermerModal }
    ]);
  }

  /* =================== 14. Langue & libellés =================== */
  function majSegMode() { document.querySelectorAll("#seg-mode .seg-btn").forEach(function (x) { x.classList.toggle("actif", x.dataset.mode === mode); }); }
  function majNoms() {
    if (phase === "partie") return; // champs verrouillés pendant la partie
    if (mode === "ia") {
      $("lbl-nom-" + coteHumain).textContent = t("votre_nom"); $("nom-" + coteHumain).disabled = false;
      var ia = aiSide();
      $("lbl-nom-" + ia).textContent = t("joueur_ia"); $("nom-" + ia).value = t("ia_nom", t("diff_" + niveau)); $("nom-" + ia).disabled = true;
    } else {
      $("lbl-nom-SUD").textContent = t("nom_sud"); $("lbl-nom-NORD").textContent = t("nom_nord");
      ["SUD","NORD"].forEach(function (s) { var inp = $("nom-" + s); inp.disabled = false; if (/^IA \(/.test(inp.value)) inp.value = ""; });
    }
  }
  function appliquerLangue() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $("lang-fr").classList.toggle("actif", lang === "fr");
    $("lang-en").classList.toggle("actif", lang === "en");
    majBoutonLancer(); majNoms();
    if (etat) afficher();
    if (phase === "config" && !tuto.actif && etat && !etat.finished) note(t("config_prompt"));
    if (tuto.actif) tutoAfficher();
  }
  function setLang(l) { lang = l; appliquerLangue(); }

  /* =================== 15. Réglages (uniquement en phase config) =================== */
  function onModeClic(b) {
    if (phase === "partie") return;
    if (b.dataset.mode === mode) return;
    mode = b.dataset.mode; majSegMode(); $("ligne-ia").hidden = (mode !== "ia"); majNoms(); afficher();
  }

  /* =================== 16. Branchements =================== */
  $("lang-fr").addEventListener("click", function () { setLang("fr"); });
  $("lang-en").addEventListener("click", function () { setLang("en"); });
  $("btn-origine").addEventListener("click", function () { var b = $("bloc-origine"); b.hidden = !b.hidden; });
  $("btn-guide").addEventListener("click", ouvrirGuide);
  $("btn-stats").addEventListener("click", ouvrirStats);
  $("btn-lancer").addEventListener("click", onBoutonLancer);
  $("btn-tuto").addEventListener("click", function () { demanderAbandon(demarrerTuto); });
  $("tuto-suiv").addEventListener("click", tutoSuivant);
  $("tuto-prec").addEventListener("click", tutoPrec);
  $("tuto-quitter").addEventListener("click", function () { tutoQuitter(); entrerConfig(); });
  document.querySelectorAll("#seg-mode .seg-btn").forEach(function (b) { b.addEventListener("click", function () { onModeClic(b); }); });
  $("cote-humain").addEventListener("change", function () { if (phase === "config") { coteHumain = this.value; majNoms(); afficher(); } });
  $("difficulte").addEventListener("change", function () { if (phase === "config") { niveau = this.value; majNoms(); afficher(); } });
  $("premier-joueur").addEventListener("change", function () { if (phase === "config") entrerConfig(); });
  $("nom-SUD").addEventListener("input", function () { if (etat) afficher(); });
  $("nom-NORD").addEventListener("input", function () { if (etat) afficher(); });

  /* ----- Son & musique ----- */
  function majBoutonsSon() {
    $("btn-musique").classList.toggle("actif", !!(window.SongoSound && SongoSound.isMusic()));
    $("btn-son").classList.toggle("actif", !window.SongoSound || SongoSound.isSfx());
    $("btn-son").textContent = (!window.SongoSound || SongoSound.isSfx()) ? "🔊" : "🔇";
  }
  $("btn-musique").addEventListener("click", function () {
    if (!window.SongoSound) return; SongoSound.setMusic(!SongoSound.isMusic()); majBoutonsSon();
  });
  $("btn-son").addEventListener("click", function () {
    if (!window.SongoSound) return; SongoSound.setSfx(!SongoSound.isSfx()); majBoutonsSon();
  });
  // Les navigateurs interdisent le son tant que l'utilisateur n'a pas cliqué :
  // on débloque le contexte audio au tout premier geste.
  document.addEventListener("pointerdown", function () {
    if (window.SongoSound) SongoSound.unlock();
  }, { once: true });

  /* =================== 17. Démarrage =================== */
  construirePlateau();
  appliquerLangue();
  majBoutonsSon();
  entrerConfig();
})();
