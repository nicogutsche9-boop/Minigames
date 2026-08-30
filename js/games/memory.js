import {
  registerGameStart,
  registerGameResult
} from "../arcade/profile.js";


/* =========================================================
   MEMORY
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
   HTML
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
   SYMBOLE
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

  const result =
    [...array];

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
   SPIELFELD
   ========================================================= */

function renderBoard() {

  board.innerHTML = "";

  board.className =
    `memory-board mode-${pairsCount}`;


  cards.forEach(card => {

    const button =
      document.createElement("button");

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
   UI
   ========================================================= */

function updateUI() {

  pairsElement.textContent =
    matchedCards.length / 2;

  pairTotalElement.textContent =
    pairsCount;

  movesElement.textContent =
    moves;


  const mode =
    MEMORY_MODES[pairsCount];

  if (mode) {

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

  if (!running) {

    statusElement.textContent =
      `Finde alle ${pairsCount} Paare!`;

    return;

  }


  const found =
    matchedCards.length / 2;


  if (found === pairsCount) {

    statusElement.textContent =
      "🎉 Alle Paare gefunden!";

    return;

  }


  if (locked) {

    statusElement.textContent =
      "🔎 Prüfe das Paar …";

    return;

  }


  if (flippedCards.length === 1) {

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


  card.flipped = true;

  flippedCards.push(card);


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


  locked = true;

  updateStatus();


  setTimeout(() => {

    if (
      first.symbol ===
      second.symbol
    ) {

      first.matched = true;
      second.matched = true;

      matchedCards.push(
        first,
        second
      );

      flippedCards = [];

      locked = false;

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


    first.flipped = false;
    second.flipped = false;

    flippedCards = [];

    locked = false;

    renderBoard();
    updateUI();
    updateStatus();

  }, 650);

}


/* =========================================================
   SCORE
   ========================================================= */

function calculateScore() {

  /*
     Weniger Züge = höherer Score.

     Basis:
     - 8 Paare  -> 1000
     - 16 Paare -> 2000
     - 32 Paare -> 4000

     Jeder zusätzliche Zug
     reduziert den Score.

     Zusätzlich gibt es einen
     kleinen Zeitbonus.
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
        (Date.now() - gameStartTime) /
        1000
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


  running = false;
  locked = false;


  const score =
    calculateScore();


  statusElement.textContent =
    `🎉 GESCHAFFT! ${score} Punkte`;


  renderBoard();
  updateUI();


  /*
     Profil-System aktualisieren.

     Memory wird als
     "memory" registriert.
  */

  try {

    registerGameResult(
      "Memory",
      "win"
    );

  }

  catch (error) {

    console.warn(
      "registerGameResult fehlgeschlagen:",
      error
    );

  }


  /*
     Falls dein Profil-System
     recordGame exportiert,
     wird es hier ebenfalls
     verwendet.
  */

  /*
     Wichtig:
     Wir versuchen recordGame
     dynamisch über die globale
     Arcade-Struktur nicht zu erzwingen.

     Der Score wird deshalb
     zusätzlich über ein
     CustomEvent an app.js
     gemeldet.
  */

  document.dispatchEvent(
    new CustomEvent(
      "memoryGameOver",
      {
        detail: {
          score,
          moves,
          pairs: pairsCount
        }
      }
    )
  );

}


/* =========================================================
   NEUES SPIEL
   ========================================================= */

function startGame() {

  registerGameStart(
    "Memory"
  );


  running = true;

  locked = false;

  moves = 0;

  flippedCards = [];

  matchedCards = [];

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
   SPIELMODUS
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
   MENÜ
   ========================================================= */

function goToMenu() {

  running = false;
  locked = false;

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

  if (initialized) {

    /*
       Beim erneuten Öffnen
       wird trotzdem das Board
       sauber zurückgesetzt.
    */

    startGame();

    return;

  }


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


  resetButton?.addEventListener(
    "click",
    resetGame
  );


  menuButton?.addEventListener(
    "click",
    goToMenu
  );


  initialized = true;


  startGame();

}


/* =========================================================
   STOPPEN
   ========================================================= */

export function stopMemory() {

  running = false;

  locked = false;

}


/* =========================================================
   SCORE-ZUGRIFF
   ========================================================= */

export function getMemoryState() {

  return {

    score:
      calculateScore(),

    moves,

    pairs:
      matchedCards.length / 2,

    totalPairs:
      pairsCount,

    running

  };

}
