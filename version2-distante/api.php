<?php
/* =====================================================================
   API DU "PLATEAU PARTAGÉ"  (api.php)   — Version distante du Songo
   ---------------------------------------------------------------------
   Ce script PHP NE CONNAÎT PAS les règles du Songo. Son seul rôle est de
   servir de "tableau noir" commun aux deux joueurs distants :
       - il crée une partie et l'enregistre dans games/<id>.json ;
       - il laisse un joueur la rejoindre ;
       - il renvoie l'état courant (les clients l'interrogent en boucle) ;
       - il accepte le nouvel état après un coup, en vérifiant que c'est
         bien au tour de l'expéditeur (garde-fou) et que les 70 graines
         sont conservées (contrôle d'intégrité).
   Les RÈGLES sont calculées côté client par engine.js (le même moteur que
   la version locale). Choix assumé et discuté dans le rapport.

   Appels (Ajax) :
     POST api.php?action=creer      body {premier, camp}     -> {id, role, state, version}
     POST api.php?action=rejoindre  body {id}                -> {id, role, state, version}
     GET  api.php?action=etat&id=.. [&since=v]               -> {state, version, changed}
     POST api.php?action=jouer      body {id, role, state, version} -> {ok, state, version}
   ===================================================================== */

header("Content-Type: application/json; charset=utf-8");
// CORS permissif : utile si les deux joueurs sont sur des origines différentes
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { exit; } // pré-vol CORS

// Dossier de stockage des parties (doit être accessible en écriture)
$DOSSIER = __DIR__ . "/games";
if (!is_dir($DOSSIER)) { @mkdir($DOSSIER, 0777, true); }

// ------- petits utilitaires -------
function repondre($data, $code = 200) {
  http_response_code($code);
  echo json_encode($data);
  exit;
}
function erreur($msg, $code = 400) { repondre(array("error" => $msg), $code); }

function corpsJSON() {
  $brut = file_get_contents("php://input");
  $d = json_decode($brut, true);
  return is_array($d) ? $d : array();
}

// Identifiant de partie : uniquement lettres/chiffres (sécurité chemin)
function idValide($id) { return is_string($id) && preg_match('/^[A-Za-z0-9]{4,12}$/', $id); }
function cheminPartie($id) { global $DOSSIER; return $DOSSIER . "/" . $id . ".json"; }

function chargerPartie($id) {
  if (!idValide($id)) erreur("Identifiant de partie invalide.");
  $f = cheminPartie($id);
  if (!file_exists($f)) erreur("Partie introuvable : " . $id, 404);
  $d = json_decode(file_get_contents($f), true);
  if (!is_array($d)) erreur("Fichier de partie corrompu.", 500);
  return $d;
}
function sauverPartie($id, $partie) {
  $f = cheminPartie($id);
  // verrou pour éviter deux écritures simultanées
  file_put_contents($f, json_encode($partie), LOCK_EX);
}

// Contrôle d'intégrité : les 70 graines doivent toujours être présentes
function etatCoherent($state) {
  if (!isset($state["board"]) || !is_array($state["board"]) || count($state["board"]) !== 14) return false;
  $somme = 0;
  foreach ($state["board"] as $v) { if (!is_int($v) || $v < 0) return false; $somme += $v; }
  $somme += intval($state["scores"]["SUD"]) + intval($state["scores"]["NORD"]);
  return $somme === 70;
}

// État initial (trivial : aucune règle nécessaire ici)
function etatInitial($premier) {
  return array(
    "board"   => array(5,5,5,5,5,5,5, 5,5,5,5,5,5,5),
    "scores"  => array("SUD" => 0, "NORD" => 0),
    "turn"    => ($premier === "NORD" ? "NORD" : "SUD"),
    "finished"=> false,
    "winner"  => null,
    "message" => "",
    "lastMove"=> null
  );
}

// ------------------------- routage -------------------------
$action = isset($_GET["action"]) ? $_GET["action"] : "";

if ($action === "creer") {
  $in = corpsJSON();
  $premier = (isset($in["premier"]) && $in["premier"] === "NORD") ? "NORD" : "SUD";
  $camp    = (isset($in["camp"]) && $in["camp"] === "NORD") ? "NORD" : "SUD";
  // identifiant court et lisible
  $id = strtoupper(substr(bin2hex(random_bytes(4)), 0, 5));
  $partie = array(
    "state"   => etatInitial($premier),
    "version" => 0,
    "joueurs" => array("SUD" => false, "NORD" => false)
  );
  $partie["joueurs"][$camp] = true;       // le créateur occupe son camp
  sauverPartie($id, $partie);
  repondre(array("id" => $id, "role" => $camp,
                 "state" => $partie["state"], "version" => $partie["version"]));
}

elseif ($action === "rejoindre") {
  $in = corpsJSON();
  $id = isset($in["id"]) ? $in["id"] : "";
  $partie = chargerPartie($id);
  // on attribue le camp encore libre
  $role = null;
  if (!$partie["joueurs"]["SUD"]) $role = "SUD";
  elseif (!$partie["joueurs"]["NORD"]) $role = "NORD";
  else erreur("La partie est déjà complète.", 409);
  $partie["joueurs"][$role] = true;
  sauverPartie($id, $partie);
  repondre(array("id" => $id, "role" => $role,
                 "state" => $partie["state"], "version" => $partie["version"]));
}

elseif ($action === "etat") {
  $id = isset($_GET["id"]) ? $_GET["id"] : "";
  $partie = chargerPartie($id);
  // "since" permet au client de savoir si quelque chose a changé (polling léger)
  $since = isset($_GET["since"]) ? intval($_GET["since"]) : -1;
  $changed = ($partie["version"] !== $since);
  repondre(array("state" => $partie["state"], "version" => $partie["version"],
                 "changed" => $changed, "joueurs" => $partie["joueurs"]));
}

elseif ($action === "jouer") {
  $in = corpsJSON();
  $id   = isset($in["id"]) ? $in["id"] : "";
  $role = (isset($in["role"]) && $in["role"] === "NORD") ? "NORD" : "SUD";
  $state= isset($in["state"]) ? $in["state"] : null;
  $ver  = isset($in["version"]) ? intval($in["version"]) : -1;

  $partie = chargerPartie($id);

  // Garde-fou 1 : concurrence. Le client doit être à jour (même version).
  if ($ver !== $partie["version"]) {
    repondre(array("error" => "Version périmée, resynchronisez.",
                   "state" => $partie["state"], "version" => $partie["version"]), 409);
  }
  // Garde-fou 2 : c'est bien le tour de l'expéditeur (dans l'état AVANT coup) ?
  if ($partie["state"]["turn"] !== $role) {
    repondre(array("error" => "Ce n'est pas votre tour.",
                   "state" => $partie["state"], "version" => $partie["version"]), 409);
  }
  // Garde-fou 3 : intégrité des 70 graines
  if (!is_array($state) || !etatCoherent($state)) {
    erreur("État proposé incohérent (les 70 graines ne sont pas conservées).");
  }

  // Tout est bon : on enregistre le nouvel état calculé par le client.
  $partie["state"]   = $state;
  $partie["version"] = $partie["version"] + 1;
  sauverPartie($id, $partie);
  repondre(array("ok" => true, "state" => $partie["state"], "version" => $partie["version"]));
}

else {
  erreur("Action inconnue. Utilisez creer | rejoindre | etat | jouer.", 404);
}
