/* =====================================================================
   TESTS DU MOTEUR  (test-engine.js)   ->  exécuter avec :  node test-engine.js
   ---------------------------------------------------------------------
   On vérifie sur des plateaux fabriqués que chaque règle se comporte
   comme prévu. On lit la prise réelle via state.lastMove.captured
   (et non le score final, qui peut inclure la redistribution de fin de
   partie lorsqu'il reste moins de 10 graines).
   ===================================================================== */
var E = require("../engine.js");

var pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("  OK   " + name); }
  else { fail++; console.log("  FAIL " + name); }
}
function St(board, turn) {
  return { board: board.slice(), scores: { SUD: 0, NORD: 0 },
           turn: turn, finished: false, winner: null };
}
function Z() { return new Array(14).fill(0); }

console.log("--- Tests des règles du Songo ---");

// A) Prise simple : SUD case 5 (3 graines) -> 6,7,8 ; N2(idx8) 1->2 => prise = 2
(function () {
  var b = Z(); b[5] = 3; b[8] = 1; b[10] = 2; b[0] = 5; // graines en plus pour ne pas finir
  var r = E.jouerCoup(St(b, "SUD"), "SUD", 5);
  check("A. Prise simple = 2", !r.error && r.state.lastMove.captured === 2);
})();

// B) Prise à la chaîne incluant la case protégée comme maillon :
//    SUD case 4 (4 graines) -> 5,6,7,8 ; N1(7) et N2(8) deviennent 2 => prise = 4
(function () {
  var b = Z(); b[4] = 4; b[7] = 1; b[8] = 1; b[10] = 3; b[0] = 5;
  var r = E.jouerCoup(St(b, "SUD"), "SUD", 4);
  check("B. Prise à la chaîne (case protégée maillon) = 4",
        !r.error && r.state.lastMove.captured === 4);
})();

// C) Fin dans la case protégée SANS tour complet => 0 prise
(function () {
  var b = Z(); b[5] = 2; b[7] = 2; b[10] = 4; b[0] = 5;
  var r = E.jouerCoup(St(b, "SUD"), "SUD", 5); // ->6,7 ; last=7 (protégée), pas de tour complet
  check("C. Fin case protégée sans tour complet = 0", !r.error && r.state.lastMove.captured === 0);
})();

// D) Solidarité : camp NORD vide -> SUD ne peut jouer que des coups donnant le maximum/>=7
(function () {
  var b = Z(); b[0] = 10; b[3] = 2; // NORD (7..13) entièrement vide
  var L = E.coupsLegaux(St(b, "SUD"), "SUD");
  check("D. Solidarité détectée + coups restreints", L.reason.indexOf("solidarite") === 0);
})();

// E) Interdit 2 : la prise viderait tout le camp adverse => prise annulée
(function () {
  var b = Z(); b[5] = 3; b[7] = 1; b[8] = 1; b[0] = 8; // NORD n'a que 7 et 8
  var r = E.jouerCoup(St(b, "SUD"), "SUD", 5); // ->6,7,8 ; capture 7+8 viderait NORD
  check("E. Interdit 2 : prise annulée si vide l'adversaire",
        !r.error && r.state.lastMove.captured === 0 && r.state.lastMove.note.length > 0);
})();

// F) Interdit 1 : jouer sa case 7 (S7=idx6) avec 1 ou 2 graines est illégal (hors solidarité)
(function () {
  var b = Z(); b[6] = 2; b[3] = 4; b[10] = 2;
  var L = E.coupsLegaux(St(b, "SUD"), "SUD");
  check("F. Interdit 1 : case 7 (2 graines) exclue", L.moves.indexOf(6) === -1 && L.moves.indexOf(3) !== -1);
})();

// G) > 13 graines : conservation + case source non remplie au 1er tour
(function () {
  var b = Z(); b[0] = 16; b[10] = 1;
  var sim = E.simulerSemis(b, "SUD", 0);
  var somme = sim.board.reduce(function (a, x) { return a + x; }, 0);
  check("G. >13 : graines conservées (16+1=17)", somme === 17);
  check("G. >13 : 13 graines réparties (chaque autre case +1 au 1er tour)", sim.board[0] < 13);
})();

// H) Victoire à 40 graines
(function () {
  var b = Z(); b[5] = 3; b[8] = 1; b[0] = 5;
  var s = St(b, "SUD"); s.scores.SUD = 38;        // proche de la victoire
  var r = E.jouerCoup(s, "SUD", 5);               // +2 => 40
  check("H. Victoire à 40 graines", !r.error && r.state.finished && r.state.winner === "SUD");
})();

console.log("\nRÉSULTAT : " + pass + " OK / " + fail + " FAIL");
process.exit(fail === 0 ? 0 : 1);
