/* =========================================================
   MINI ARCADE
   MEMORY
   ========================================================= */

import {
  recordGame
} from "../arcade/profile.js";


/* =========================================================
   SPIELMODI
   ========================================================= */

const MEMORY_MODES = {
  8: {
    pairs: 8,
    label: "CLASSIC · 8 PAARE"
  },

  16: {
    pairs: 16,
    label: "16 PAARE"
  },

  32: {
    pairs: 32,
    label: "🔥 32 PAARE"
  }
};


/* =========================================================
   STATUS
   ========================================================= */

let pairsCount = 8;

let cards = [];

let flippedCards = [];

let matchedCards = [];

let moves = 0;

let running = false;

let locked = false;

let initialized = false;

let gameStartTime = 0;


/* =========================================================
   HTML ELEMENTE
   ========================================================= */

const board =
  document.querySelector("#memoryBoard");

const pairsElement =
  document.querySelector("#memoryPairs");

const pairTotalElement =
  document.querySelector("#memoryPairTotal");

const movesElement =
  document.querySelector("#memoryMoves");

const statusElement =
  document.querySelector("#memoryStatus");

const modeTitle =
  document.querySelector("#memoryModeTitle");

const modeButtons =
  document.querySelectorAll(
    ".memory-mode-button"
  );

const resetButton =
  document.querySelector("#memoryResetButton");

const menuButton =
  document.querySelector("#memoryMenuButton");


/* =========================================================
   MEMORY SYMBOLE
   ========================================================= */

const SYMBOLS = [
  "👾",
  "🚀",
  "⭐",
  "🎮",
  "💎",
  "🔥",
  "⚡",
  "🪙",
  "🍒",
  "🍀",
  "💜",
  "💙",
  "💚",
  "🧡",
  "🎯",
  "🏆",
  "🐍",
  "🧱",
  "🔵",
  "🌟",
  "👽",
  "🤖",
  "🎲",
  "🕹️",
  "❤️",
  "☄️",
  "🌈",
  "🍉",
  "🍋",
  "🍓",
  "🥝",
  "🍇"
];


/* =========================================================
   ZUFALL
   ========================================================= */

function shuffle(array) {

  const result = [
    ...array
  ];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      result[i],
      result[j]
    ] = [
      result[j],
      result[i]
    ];

  }

  return result;

}


/* =========================================================
   KARTEN ERSTELLEN
   ========================================================= */

function createCards() {

  const symbols =
    SYMBOLS.slice(
      0,
      pairsCount
    );


  const duplicated = [
    ...symbols,
    ...symbols
  ];


  return shuffle(
    duplicated.map(
      (symbol, index) => ({

        id: index,

        symbol,

        matched: false,

        flipped: false

      })
    )
  );

}


/* =========================================================
   SPIELFELD RENDERN
   ========================================================= */

function renderBoard() {

  if (!board) {
    return;
  }


  board.innerHTML = "";


  board.className =
    `memory-board mode-${pairsCount}`;


  cards.forEach(card => {

    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "memory-card";


    if (card.flipped) {

      button.classList.add(
        "flipped"
      );

    }


    if (card.matched) {

      button.classList.add(
        "matched"
      );

    }


    button.dataset.id =
      card.id;


    button.setAttribute(
      "aria-label",
      card.flipped || card.matched
        ? `Karte ${card.symbol}`
        : "Verdeckte Memory-Karte"
    );


    button.innerHTML = `

      <span class="memory-card-inner">

        <span class="memory-card-back">
          ?
        </span>

        <span class="memory-card-front">
          ${card.symbol}
        </span>

      </span>

    `;


    button.addEventListener(
      "click",
      () => flipCard(card.id)
    );


    board.appendChild(
      button
    );

  });

}


/* =========================================================
   UI AKTUALISIEREN
   ========================================================= */

function updateUI() {

  if (pairsElement) {

    pairsElement.textContent =
      matchedCards.length / 2;

  }


  if (pairTotalElement) {

    pairTotalElement.textContent =
      pairsCount;

  }


  if (movesElement) {

    movesElement.textContent =
      moves;

  }


  const mode =
    MEMORY_MODES[pairsCount];


  if (
    mode &&
    modeTitle
  ) {

    modeTitle.textContent =
      mode.label;

  }


  modeButtons.forEach(
    button => {

      button.classList.toggle(
        "active",
        Number(
          button.dataset.memoryPairs
        ) === pairsCount
      );

    }
  );

}


/* =========================================================
   STATUS TEXT
   ========================================================= */

function updateStatus() {

  if (!statusElement) {
    return;
  }


  if (!running) {

    statusElement.textContent =
      `Finde alle ${pairsCount} Paare!`;

    return;

  }


  const found =
    matchedCards.length / 2;


  if (
    found === pairsCount
  ) {

    statusElement.textContent =
      "🎉 Alle Paare gefunden!";

    return;

  }


  if (locked) {

    statusElement.textContent =
      "🔎 Prüfe das Paar …";

    return;

  }


  if (
    flippedCards.length === 1
  ) {

    statusElement.textContent =
      "Finde das passende Paar!";

    return;

  }


  statusElement.textContent =
    `Finde alle ${pairsCount} Paare!`;

}


/* =========================================================
   KARTE AUFDECKEN
   ========================================================= */

function flipCard(id) {

  if (
    !running ||
    locked
  ) {

    return;

  }


  const card =
    cards.find(
      item => item.id === id
    );


  if (!card) {
    return;
  }


  if (
    card.flipped ||
    card.matched
  ) {

    return;

  }


  if (
    flippedCards.length >= 2
  ) {

    return;

  }


  card.flipped =
    true;


  flippedCards.push(
    card
  );


  moves++;


  renderBoard();
  updateUI();
  updateStatus();


  if (
    flippedCards.length === 2
  ) {

    checkPair();

  }

}


/* =========================================================
   PAAR PRÜFEN
   ========================================================= */

function checkPair() {

  const [
    first,
    second
  ] = flippedCards;


  locked =
    true;


  updateStatus();


  setTimeout(() => {

    /*
       Falls der Spieler während
       der Wartezeit das Spiel
       verlassen oder neu starten
       konnte, brechen wir hier ab.
    */

    if (!running) {

      return;

    }


    if (
      first.symbol ===
      second.symbol
    ) {

      first.matched =
        true;

      second.matched =
        true;


      matchedCards.push(
        first,
        second
      );


      flippedCards =
        [];


      locked =
        false;


      renderBoard();
      updateUI();
      updateStatus();


      if (
        matchedCards.length ===
        cards.length
      ) {

        finishGame();

      }


      return;

    }


    first.flipped =
      false;

    second.flipped =
      false;


    flippedCards =
      [];


    locked =
      false;


    renderBoard();
    updateUI();
    updateStatus();

  }, 650);

}


/* =========================================================
   SCORE BERECHNEN
   ========================================================= */

function calculateScore() {

  /*
     Basis:

     8 Paare  = 1000 Punkte
     16 Paare = 2000 Punkte
     32 Paare = 4000 Punkte

     Zusätzliche Züge
     verursachen einen Abzug.

     Auch die benötigte Zeit
     beeinflusst den Score.
  */


  const baseScore =
    pairsCount * 125;


  const perfectMoves =
    pairsCount;


  const extraMoves =
    Math.max(
      0,
      moves - perfectMoves
    );


  const movePenalty =
    extraMoves * 15;


  const elapsedSeconds =
    Math.max(
      1,
      Math.floor(
        (
          Date.now() -
          gameStartTime
        ) / 1000
      )
    );


  const timePenalty =
    Math.floor(
      elapsedSeconds * 2
    );


  return Math.max(
    0,
    baseScore -
    movePenalty -
    timePenalty
  );

}


/* =========================================================
   SPIEL BEENDET
   ========================================================= */

function finishGame() {

  if (!running) {
    return;
  }


  running =
    false;

  locked =
    false;


  const score =
    calculateScore();


  if (statusElement) {

    statusElement.textContent =
      `🎉 GESCHAFFT! ${score} Punkte`;

  }


  renderBoard();
  updateUI();


  /*
     =======================================================
     PROFIL-SYSTEM
     =======================================================

     Deine aktuelle profile.js verwendet:

         recordGame(game, score)

     Dadurch werden automatisch:

     - Highscore
     - XP
     - Coins
     - Erfolge
     - Tages-Challenges

     aktualisiert.
  */

  let profileResult =
    null;


  try {

    profileResult =
      recordGame(
        "memory",
        score
      );

  }

  catch (error) {

    console.error(
      "Memory: Profil konnte nicht aktualisiert werden:",
      error
    );

  }


  /*
     =======================================================
     EVENT AN app.js
     =======================================================

     app.js kann damit anschließend
     die Game-Over-Seite anzeigen.
  */

  document.dispatchEvent(
    new CustomEvent(
      "memoryGameOver",
      {
        detail: {

          score,

          moves,

          pairs:
            pairsCount,

          profile:
            profileResult

        }

      }
    )
  );

}


/* =========================================================
   NEUES SPIEL
   ========================================================= */

function startGame() {

  running =
    true;


  locked =
    false;


  moves =
    0;


  flippedCards =
    [];


  matchedCards =
    [];


  gameStartTime =
    Date.now();


  cards =
    createCards();


  updateUI();
  updateStatus();
  renderBoard();

}


/* =========================================================
   SPIEL ZURÜCKSETZEN
   ========================================================= */

function resetGame() {

  startGame();

}


/* =========================================================
   SPIELMODUS ÄNDERN
   ========================================================= */

function setMode(pairs) {

  const newPairs =
    Number(pairs);


  if (
    !MEMORY_MODES[newPairs]
  ) {

    return;

  }


  pairsCount =
    newPairs;


  localStorage.setItem(
    "memoryPairs",
    String(pairsCount)
  );


  startGame();

}


/* =========================================================
   ZUM MENÜ
   ========================================================= */

function goToMenu() {

  running =
    false;


  locked =
    false;


  /*
     Event an app.js senden.
  */

  document.dispatchEvent(
    new CustomEvent(
      "memoryMenu"
    )
  );

}


/* =========================================================
   INITIALISIERUNG
   ========================================================= */

export function initMemory() {

  /*
     Beim erneuten Öffnen
     kein zweites Mal Events
     registrieren.
  */

  if (initialized) {

    startGame();

    return;

  }


  /*
     Gespeicherten Modus laden.
  */

  const savedPairs =
    Number(
      localStorage.getItem(
        "memoryPairs"
      )
    );


  if (
    MEMORY_MODES[savedPairs]
  ) {

    pairsCount =
      savedPairs;

  }


  /*
     Modus-Buttons
  */

  modeButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          setMode(
            button.dataset.memoryPairs
          );

        }
      );

    }
  );


  /*
     Reset
  */

  resetButton?.addEventListener(
    "click",
    resetGame
  );


  /*
     Menü
  */

  menuButton?.addEventListener(
    "click",
    goToMenu
  );


  initialized =
    true;


  startGame();

}


/* =========================================================
   MEMORY STOPPEN
   ========================================================= */

export function stopMemory() {

  running =
    false;


  locked =
    false;

}


/* =========================================================
   MEMORY STATUS
   ========================================================= */

export function getMemoryState() {

  return {

    score:
      running
        ? calculateScore()
        : 0,

    moves,

    pairs:
      matchedCards.length / 2,

    totalPairs:
      pairsCount,

    running

  };

}
