/* =====================================================================
   STATISTIQUES & HISTORIQUE  (stats.js)
   ---------------------------------------------------------------------
   Conserve l'historique des parties. Source de vérité : une copie EN
   MÉMOIRE (chargée au démarrage depuis localStorage), qu'on tente de
   persister dans localStorage à chaque partie. Ainsi, même si le
   navigateur bloque le stockage local, les statistiques de la session
   restent visibles ; et elles sont conservées d'une session à l'autre
   quand le stockage est disponible.
   ===================================================================== */
(function (global) {
  "use strict";
  var KEY = "songo:stats:v1";
  var CAP = 300;

  function charger() {
    try {
      var s = global.localStorage.getItem(KEY);
      if (s) { var o = JSON.parse(s); if (o && o.games) return o; }
    } catch (e) {}
    return { version: 1, games: [] };
  }

  var store = charger();                 // en mémoire (+ chargé du localStorage)

  function persister() {
    try { global.localStorage.setItem(KEY, JSON.stringify(store)); return true; }
    catch (e) { return false; }
  }
  function available() {
    try { var k = "songo:test"; global.localStorage.setItem(k, "1"); global.localStorage.removeItem(k); return true; }
    catch (e) { return false; }
  }
  function read() { return store; }
  function record(game) {
    store.games.push(game);
    if (store.games.length > CAP) store.games = store.games.slice(-CAP);
    return persister();                  // true = persisté sur disque, false = seulement en mémoire
  }
  function reset() { store = { version: 1, games: [] }; persister(); }

  function aggregate(s) {
    s = s || store;
    var players = {};
    var records = { highestScore: null, fastestWin: null, longestGame: null, mostMoves: null, biggestCapture: null };
    function P(name) {
      if (!players[name]) players[name] = { name: name, games: 0, wins: 0, draws: 0, losses: 0, seeds: 0, bestScore: 0, timeMs: 0, moves: 0, streak: 0, bestStreak: 0 };
      return players[name];
    }
    s.games.forEach(function (g) {
      var sName = g.players.SUD.name, nName = g.players.NORD.name;
      var ps = P(sName), pn = P(nName);
      ps.games++; pn.games++;
      ps.seeds += g.scores.SUD; pn.seeds += g.scores.NORD;
      ps.bestScore = Math.max(ps.bestScore, g.scores.SUD); pn.bestScore = Math.max(pn.bestScore, g.scores.NORD);
      ps.timeMs += (g.timeMs && g.timeMs.SUD) || 0; pn.timeMs += (g.timeMs && g.timeMs.NORD) || 0;
      ps.moves += (g.moves && g.moves.SUD) || 0; pn.moves += (g.moves && g.moves.NORD) || 0;
      if (g.winner === "SUD") { ps.wins++; pn.losses++; ps.streak++; pn.streak = 0; ps.bestStreak = Math.max(ps.bestStreak, ps.streak); }
      else if (g.winner === "NORD") { pn.wins++; ps.losses++; pn.streak++; ps.streak = 0; pn.bestStreak = Math.max(pn.bestStreak, pn.streak); }
      else { ps.draws++; pn.draws++; ps.streak = 0; pn.streak = 0; }
      var winnerName = g.winner === "SUD" ? sName : (g.winner === "NORD" ? nName : null);
      var hi = Math.max(g.scores.SUD, g.scores.NORD);
      var hiName = g.scores.SUD >= g.scores.NORD ? sName : nName;
      if (!records.highestScore || hi > records.highestScore.value) records.highestScore = { value: hi, name: hiName, ts: g.ts };
      if (winnerName && (!records.fastestWin || g.durationMs < records.fastestWin.value)) records.fastestWin = { value: g.durationMs, name: winnerName, ts: g.ts };
      if (!records.longestGame || g.durationMs > records.longestGame.value) records.longestGame = { value: g.durationMs, ts: g.ts };
      var totMoves = ((g.moves && g.moves.SUD) || 0) + ((g.moves && g.moves.NORD) || 0);
      if (!records.mostMoves || totMoves > records.mostMoves.value) records.mostMoves = { value: totMoves, ts: g.ts };
      if (g.biggestCapture && (!records.biggestCapture || g.biggestCapture > records.biggestCapture.value)) records.biggestCapture = { value: g.biggestCapture, name: (sName + " / " + nName), ts: g.ts };
    });
    Object.keys(players).forEach(function (k) {
      var p = players[k];
      p.winRate = p.games ? Math.round(100 * p.wins / p.games) : 0;
      p.avgMoveSec = p.moves ? (p.timeMs / p.moves / 1000) : 0;
    });
    return { players: players, records: records, count: s.games.length };
  }

  global.SongoStats = { read: read, record: record, reset: reset, aggregate: aggregate, available: available, KEY: KEY };
  if (typeof module !== "undefined" && module.exports) module.exports = global.SongoStats;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
