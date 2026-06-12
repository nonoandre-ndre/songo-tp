/* =====================================================================
   CONTRÔLEUR RÉSEAU — Version distante  (remote.js)
   ---------------------------------------------------------------------
   Chaque navigateur ne contrôle QU'UN camp (SUD ou NORD). La communication
   entre les deux joueurs passe par Ajax (fetch) vers api.php :
     - on CRÉE ou on REJOINT une partie (on reçoit un code + un rôle) ;
     - on INTERROGE le serveur en boucle (polling) pour voir les coups de
       l'adversaire ;
     - quand on joue, on calcule le nouvel état avec le MOTEUR (engine.js,
       le même qu'en local) puis on l'ENVOIE au serveur.
   Le serveur ne fait que stocker l'état et vérifier que c'est notre tour.
   ===================================================================== */

(function () {
  "use strict";

  var API = "api.php";          // même dossier que cette page
  var POLL_MS = 1500;           // fréquence d'interrogation du serveur

  // ----- Ordre d'affichage (identique à la version locale) -----
  var ORDRE_NORD = [
    { idx: 7, label: "1" }, { idx: 8, label: "2" }, { idx: 9, label: "3" },
    { idx: 10, label: "4" }, { idx: 11, label: "5" }, { idx: 12, label: "6" },
    { idx: 13, label: "7" }
  ];
  var ORDRE_SUD = [
    { idx: 6, label: "7" }, { idx: 5, label: "6" }, { idx: 4, label: "5" },
    { idx: 3, label: "4" }, { idx: 2, label: "3" }, { idx: 1, label: "2" },
    { idx: 0, label: "1" }
  ];

  // ----- État local de la session réseau -----
  var partieId = null;          // code de la partie
  var monRole  = null;          // "SUD" ou "NORD"
  var version  = -1;            // version de l'état connue localement
  var etat     = null;          // dernier état reçu
  var timer    = null;          // identifiant du setInterval de polling
  var cellules = {};

  // ----- Références DOM -----
  var $ = function (id) { return document.getElementById(id); };

  /* =================================================================
     APPELS RÉSEAU (Ajax via fetch)
     ================================================================= */
  function postJSON(action, body) {
    return fetch(API + "?action=" + action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(lireReponse);
  }
  function getJSON(query) {
    return fetch(API + "?" + query).then(lireReponse);
  }
  function lireReponse(r) {
    return r.json().then(function (data) {
      return { ok: r.ok, status: r.status, data: data };
    });
  }

  /* =================================================================
     SALON : créer / rejoindre
     ================================================================= */
  function creerPartie() {
    var camp    = $("creer-camp").value;
    var premier = $("creer-premier").value;
    postJSON("creer", { camp: camp, premier: premier }).then(function (res) {
      if (!res.ok) { alert(res.data.error || "Erreur"); return; }
      demarrerSession(res.data);
    }).catch(erreurReseau);
  }

  function rejoindrePartie() {
    var id = $("rejoindre-id").value.trim().toUpperCase();
    if (!id) { alert("Entrez un code de partie."); return; }
    postJSON("rejoindre", { id: id }).then(function (res) {
      if (!res.ok) { alert(res.data.error || "Erreur"); return; }
      demarrerSession(res.data);
    }).catch(erreurReseau);
  }

  function demarrerSession(data) {
    partieId = data.id;
    monRole  = data.role;
    version  = data.version;
    etat     = data.state;

    $("salon").hidden = true;
    $("bandeau").hidden = false;
    $("jeu").hidden = false;
    $("info-id").textContent = partieId;
    $("info-role").textContent = monRole;

    construirePlateau();
    afficher();
    note("Partie « " + partieId + " ». Vous jouez " + monRole +
         ". Communiquez le code à votre adversaire.");
    demarrerPolling();
  }

  /* =================================================================
     POLLING : interroger le serveur pour récupérer les coups adverses
     ================================================================= */
  function demarrerPolling() {
    arreterPolling();
    timer = setInterval(function () {
      getJSON("action=etat&id=" + partieId + "&since=" + version)
        .then(function (res) {
          if (!res.ok) return;
          majConnexion(res.data.joueurs);
          if (res.data.changed) {       // l'état a évolué côté serveur
            version = res.data.version;
            etat = res.data.state;
            afficher();
            if (etat.lastMove) raconterCoup(etat.lastMove);
            if (etat.finished) annoncerFin();
          }
        }).catch(function () { /* réseau momentané : on réessaiera */ });
    }, POLL_MS);
  }
  function arreterPolling() { if (timer) { clearInterval(timer); timer = null; } }

  function majConnexion(joueurs) {
    if (!joueurs) return;
    var complet = joueurs.SUD && joueurs.NORD;
    $("info-connexion").textContent = complet ? "adversaire connecté" : "en attente de l'adversaire…";
    $("info-connexion").classList.toggle("ok", complet);
  }

  /* =================================================================
     PLATEAU (affichage) — proche de la version locale
     ================================================================= */
  function construirePlateau() {
    var n = $("rangee-nord"), s = $("rangee-sud");
    n.innerHTML = ""; s.innerHTML = ""; cellules = {};
    ORDRE_NORD.forEach(function (c) { n.appendChild(creerCase(c)); });
    ORDRE_SUD.forEach(function (c) { s.appendChild(creerCase(c)); });
  }
  function creerCase(c) {
    var btn = document.createElement("button");
    btn.className = "case";
    btn.dataset.index = c.idx;
    btn.innerHTML = '<div class="graines"></div><span class="nombre">0</span>' +
                    '<span class="etiquette-case">' + c.label + '</span>';
    btn.addEventListener("click", function () { onClicCase(c.idx); });
    cellules[c.idx] = btn;
    return btn;
  }
  function dessinerGraines(container, nb) {
    container.innerHTML = "";
    var k = Math.min(nb, 10);
    for (var i = 0; i < k; i++) {
      var pt = document.createElement("span");
      pt.className = "graine-pt";
      if (k === 1) { pt.style.left = "42%"; pt.style.top = "42%"; }
      else {
        var ang = (2 * Math.PI * i) / k - Math.PI / 2;
        pt.style.left = (42 + 30 * Math.cos(ang)) + "%";
        pt.style.top  = (42 + 30 * Math.sin(ang)) + "%";
      }
      container.appendChild(pt);
    }
  }

  function afficher() {
    var monTour = !etat.finished && etat.turn === monRole;
    var legal = monTour ? SongoEngine.coupsLegaux(etat, monRole) : { moves: [] };
    var jouables = new Set(legal.moves);
    var lm = etat.lastMove;
    var recoltees = lm ? new Set(lm.capturedCells) : new Set();

    for (var i = 0; i < 14; i++) {
      var el = cellules[i];
      el.querySelector(".nombre").textContent = etat.board[i];
      dessinerGraines(el.querySelector(".graines"), etat.board[i]);
      el.classList.remove("jouable", "depart", "recoltee");
      if (jouables.has(i)) el.classList.add("jouable");
      if (lm && lm.from === i) el.classList.add("depart");
      if (recoltees.has(i)) el.classList.add("recoltee");
    }

    $("score-SUD").textContent = etat.scores.SUD;
    $("score-NORD").textContent = etat.scores.NORD;
    $("carte-SUD").classList.toggle("actif", !etat.finished && etat.turn === "SUD");
    $("carte-NORD").classList.toggle("actif", !etat.finished && etat.turn === "NORD");

    if (etat.finished) {
      $("indicateur-tour").innerHTML = "Partie terminée";
    } else if (monTour) {
      $("indicateur-tour").innerHTML = "<strong>À vous de jouer</strong> (" + monRole + ")";
      if (legal.reason === "solidarite" || legal.reason === "solidarite-max")
        note("Solidarité : réapprovisionnez le camp adverse (≥ 7 graines).");
      else if (legal.reason === "case7-forcee")
        note("Vous êtes contraint de jouer votre case 7.");
    } else {
      $("indicateur-tour").innerHTML = "Au tour de <strong>" + etat.turn + "</strong> — patientez…";
    }
  }

  /* =================================================================
     JOUER UN COUP : calcul local (moteur) puis envoi au serveur
     ================================================================= */
  function onClicCase(index) {
    if (etat.finished) return;
    if (etat.turn !== monRole) { note("Ce n'est pas votre tour."); return; }
    var legal = SongoEngine.coupsLegaux(etat, monRole);
    if (legal.moves.indexOf(index) === -1) {
      note("Coup non autorisé. Les cases en vert sont jouables.");
      return;
    }
    // 1) on calcule le nouvel état localement avec le moteur partagé
    var res = SongoEngine.jouerCoup(etat, monRole, index);
    if (res.error) { note(res.error); return; }
    var nouvelEtat = res.state;

    // 2) on l'envoie au serveur (qui vérifie le tour + l'intégrité)
    postJSON("jouer", { id: partieId, role: monRole, state: nouvelEtat, version: version })
      .then(function (r) {
        if (!r.ok) {
          // conflit (ex. version périmée) : on se resynchronise
          if (r.data && r.data.state) { etat = r.data.state; version = r.data.version; afficher(); }
          note(r.data && r.data.error ? r.data.error : "Coup refusé par le serveur.");
          return;
        }
        version = r.data.version;
        etat = r.data.state;
        afficher();
        raconterCoup(etat.lastMove);
        if (etat.finished) annoncerFin();
      }).catch(erreurReseau);
  }

  /* =================================================================
     Messages
     ================================================================= */
  function note(txt) { $("message").innerHTML = txt; }
  function erreurReseau() { note("Problème de connexion au serveur. Vérifiez qu'Apache/PHP tourne."); }

  function raconterCoup(lm) {
    if (!lm) return;
    var qui = (lm.player === monRole) ? "Vous" : lm.player;
    var txt = qui + (qui === "Vous" ? " jouez." : " joue.");
    if (lm.note) txt += ' <span class="prise-txt">' + lm.note + "</span>";
    else if (lm.captured > 0) txt += ' <span class="prise-txt">Prise de ' + lm.captured +
        " graine" + (lm.captured > 1 ? "s" : "") + " !</span>";
    else txt += " Aucune prise.";
    note(txt);
  }
  function annoncerFin() {
    arreterPolling();
    var txt = (etat.winner === "NULLE") ? "Partie nulle. "
            : '<span class="gagne">' + etat.winner + " gagne !</span> ";
    note(txt + etat.message);
  }

  /* =================================================================
     Branchements
     ================================================================= */
  $("btn-creer").addEventListener("click", creerPartie);
  $("btn-rejoindre").addEventListener("click", rejoindrePartie);
  $("btn-quitter").addEventListener("click", function () {
    arreterPolling();
    location.reload();
  });

})();
