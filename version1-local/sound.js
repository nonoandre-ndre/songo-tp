/* =====================================================================
   sound.js — Ambiance sonore du Songo (100 % synthétisée, sans fichier)
   ---------------------------------------------------------------------
   Pourquoi du son SYNTHÉTISÉ et non un MP3 de musique béti ?
   - Les enregistrements de musique traditionnelle sont protégés par le
     droit d'auteur : on ne peut pas les embarquer librement.
   - On RECRÉE donc nous-mêmes, avec l'API Web Audio du navigateur, une
     ambiance ORIGINALE inspirée du style d'Afrique centrale (balafon =
     xylophone à lames de bois + percussions), construite sur une gamme
     PENTATONIQUE (5 notes), très présente dans les musiques béti/ekang.
   - Avantage : aucun fichier à charger, fonctionne hors-ligne, et c'est
     une vraie création (rien n'est copié).

   API publique (window.SongoSound) :
     unlock()          -> à appeler sur un clic (les navigateurs interdisent
                          le son tant que l'utilisateur n'a pas interagi)
     setMusic(bool)    -> active/coupe la musique de fond
     setSfx(bool)      -> active/coupe les effets (semis, prise, victoire)
     isMusic() isSfx() -> état courant
     sow()             -> "tok" de balafon (une graine déposée)
     capture(n)        -> petit arpège ascendant (prise de n graines)
     win()             -> ritournelle de victoire
     draw()            -> motif neutre (partie nulle)
   ===================================================================== */
(function () {
  "use strict";

  var ctx = null;                 // AudioContext (créé au 1er clic)
  var master = null, musicGain = null, sfxGain = null;
  var musicOn = false, sfxOn = true;
  var timer = null, step = 0, nextNoteTime = 0;
  var noiseBuffer = null;

  /* Gamme PENTATONIQUE majeure (do ré mi sol la), sur ~2 octaves.       */
  /* Ce sont des fréquences en Hz ; l'oreille perçoit une couleur douce  */
  /* et "africaine" caractéristique du balafon.                          */
  var GAMME = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  var BASSE = [65.41, 87.31, 98.00, 110.00]; // do2 fa2 sol2 la2

  /* Deux motifs mélodiques (indices dans GAMME, null = silence) qui     */
  /* alternent pour éviter la répétition lassante.                       */
  var MOTIFS = [
    [0, null, 2, 4, null, 2, 0, null, 4, null, 5, 4, 2, null, 0, null],
    [4, null, 5, 7, null, 5, 4, null, 2, null, 4, 2, 0, null, 2, null]
  ];
  var motifCourant = 0;

  function creerContexte() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();  master.gain.value = 0.22; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.0; musicGain.connect(master);
    sfxGain = ctx.createGain();   sfxGain.gain.value = 1.0; sfxGain.connect(master);
    // Bruit blanc réutilisable (pour les percussions de type maracas/hochet)
    var n = ctx.sampleRate * 0.3, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
    return true;
  }

  /* ---- Voix "balafon" : une lame de bois frappée ----
     On additionne la fondamentale et quelques harmoniques avec une
     enveloppe d'amplitude qui décroît vite : c'est ce qui imite le bois. */
  function balafon(freq, time, dur, vol, dest) {
    var g = ctx.createGain(); g.connect(dest);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    [[1, 1], [4.0, 0.45], [6.5, 0.18], [9.0, 0.08]].forEach(function (h) {
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq * h[0];
      var gg = ctx.createGain(); gg.gain.value = h[1];
      o.connect(gg); gg.connect(g); o.start(time); o.stop(time + dur + 0.05);
    });
  }

  function basse(freq, time, dur, vol, dest) {
    var o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = freq;
    var g = ctx.createGain(); g.connect(dest);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); o.start(time); o.stop(time + dur + 0.05);
  }

  function hochet(time, vol) { // maracas / shaker
    var s = ctx.createBufferSource(); s.buffer = noiseBuffer;
    var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 5000;
    var g = ctx.createGain(); g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
    s.connect(f); f.connect(g); g.connect(musicGain); s.start(time); s.stop(time + 0.08);
  }

  function tambour(time, vol) { // petite frappe grave
    var o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(150, time);
    o.frequency.exponentialRampToValueAtTime(55, time + 0.16);
    var g = ctx.createGain(); g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    o.connect(g); g.connect(musicGain); o.start(time); o.stop(time + 0.26);
  }

  /* ---- Séquenceur de la musique (technique du "lookahead") ----
     On programme à l'avance les notes à jouer dans la file du moteur
     audio : c'est ce qui garantit un rythme parfaitement régulier. */
  var TEMPO = 104;                       // battements par minute
  var DUREE_PAS = (60 / TEMPO) / 2;      // un pas = une croche
  function planifierPas(s, time) {
    var motif = MOTIFS[motifCourant];
    var note = motif[s % motif.length];
    if (note !== null) balafon(GAMME[note], time, 0.42, 0.5, musicGain);
    if (s % 8 === 0) { motifCourant = (motifCourant + 1) % MOTIFS.length;
                       basse(BASSE[(s / 8) % BASSE.length] || BASSE[0], time, 0.7, 0.55, musicGain); }
    if (s % 4 === 0) tambour(time, 0.5);
    if (s % 2 === 1) hochet(time, 0.18);
  }
  function sequenceur() {
    if (!ctx) return;
    while (nextNoteTime < ctx.currentTime + 0.18) {
      planifierPas(step, nextNoteTime);
      nextNoteTime += DUREE_PAS;
      step = (step + 1) % 16;
    }
  }

  /* ============================ API ============================ */
  function unlock() {
    if (!ctx && !creerContexte()) return;
    if (ctx.state === "suspended") ctx.resume();
  }

  function lancerMusique() {
    if (!ctx || timer) return;
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.6);
    step = 0; nextNoteTime = ctx.currentTime + 0.1;
    timer = setInterval(sequenceur, 40);
  }
  function arreterMusique() {
    if (timer) { clearInterval(timer); timer = null; }
    if (ctx && musicGain) {
      musicGain.gain.cancelScheduledValues(ctx.currentTime);
      musicGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    }
  }

  function setMusic(on) {
    musicOn = !!on; unlock();
    if (musicOn) lancerMusique(); else arreterMusique();
  }
  function setSfx(on) { sfxOn = !!on; unlock(); }
  function isMusic() { return musicOn; }
  function isSfx() { return sfxOn; }

  /* Effets sonores : jouent uniquement si activés et contexte prêt. */
  function sow() {
    if (!sfxOn || !ctx) return;
    var f = GAMME[Math.floor(Math.random() * 5)];   // note grave aléatoire
    balafon(f, ctx.currentTime, 0.22, 0.6, sfxGain);
  }
  function capture(n) {
    if (!sfxOn || !ctx) return;
    var k = Math.max(2, Math.min(n || 2, 5)), t = ctx.currentTime;
    for (var i = 0; i < k; i++) balafon(GAMME[2 + i], t + i * 0.07, 0.32, 0.7, sfxGain);
  }
  function win() {
    if (!sfxOn || !ctx) return;
    var t = ctx.currentTime, notes = [0, 2, 4, 5, 7];
    notes.forEach(function (idx, i) { balafon(GAMME[idx], t + i * 0.11, 0.5, 0.8, sfxGain); });
    tambour(t, 0.6); tambour(t + 0.55, 0.6);
  }
  function draw() {
    if (!sfxOn || !ctx) return;
    var t = ctx.currentTime; balafon(GAMME[2], t, 0.4, 0.6, sfxGain); balafon(GAMME[0], t + 0.18, 0.5, 0.6, sfxGain);
  }

  // Couper proprement si l'onglet passe en arrière-plan (économie).
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && timer) { clearInterval(timer); timer = null; }
    else if (!document.hidden && musicOn && !timer && ctx) {
      nextNoteTime = ctx.currentTime + 0.1; timer = setInterval(sequenceur, 40);
    }
  });

  window.SongoSound = {
    unlock: unlock, setMusic: setMusic, setSfx: setSfx,
    isMusic: isMusic, isSfx: isSfx,
    sow: sow, capture: capture, win: win, draw: draw
  };
})();
