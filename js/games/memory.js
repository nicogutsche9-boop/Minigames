const SYMBOLS = [
  "🍒", "🍋", "🍉", "⭐", "🚀", "🎮", "👾", "💎",
  "🍕", "🎯", "🎧", "⚡", "🔥", "🌈", "🪐", "🦄",
  "🍩", "🏀", "🎲", "🛸", "🐱", "🦊", "🐼", "🐸",
  "🍀", "🌙", "☀️", "💡", "🎸", "🏆", "💜", "🤖"
];

const MODES = {
  8: { name: "CLASSIC", pairs: 8 },
  16: { name: "PRO", pairs: 16 },
  32: { name: "MEMORY MARATHON", pairs: 32 }
};

const EVENT_END = new Date("2026-09-13T23:59:59");

let selectedPairs = 8;
let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let initialized = false;
let onComplete = null;

const board = document.querySelector("#memoryBoard");
const pairsValue = document.querySelector("#memoryPairs");
const pairTotalValue = document.querySelector("#memoryPairTotal");
const movesValue = document.querySelector("#memoryMoves");
const status = document.querySelector("#memoryStatus");
const modeTitle = document.querySelector("#memoryModeTitle");
const eventCountdown = document.querySelector("#memoryEventCountdown");

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function eventAvailable() {
  return new Date() < EVENT_END;
}

function formatRemaining(ms) {
  if (ms <= 0) return "BEENDET";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}T ${hours}H`;
  if (hours > 0) return `${hours}H ${minutes}M`;
  return `${minutes}M`;
}

function updateEventUI() {
  const button = document.querySelector('[data-memory-pairs="32"]');
  if (!button || !eventCountdown) return;

  if (eventAvailable()) {
    button.disabled = false;
    button.classList.remove("expired");
    eventCountdown.textContent = `NOCH ${formatRemaining(EVENT_END - new Date())}`;
  } else {
    button.disabled = true;
    button.classList.add("expired");
    eventCountdown.textContent = "BEENDET";
    if (selectedPairs === 32) {
      selectedPairs = 8;
      selectModeButton(8);
      buildBoard();
    }
  }
}

function updateUI() {
  pairsValue.textContent = matchedPairs;
  pairTotalValue.textContent = selectedPairs;
  movesValue.textContent = moves;
}

function createCard(symbol, index) {
  const button = document.createElement("button");
  button.className = "memory-card";
  button.type = "button";
  button.dataset.index = index;
  button.dataset.symbol = symbol;
  button.setAttribute("aria-label", "Memory-Karte");
  button.innerHTML = `
    <span class="memory-card-inner">
      <span class="memory-face memory-back" aria-hidden="true"></span>
      <span class="memory-face memory-front">${symbol}</span>
    </span>
  `;
  button.addEventListener("click", () => flipCard(button));
  return button;
}

function buildBoard() {
  if (selectedPairs === 32 && !eventAvailable()) {
    selectedPairs = 8;
    selectModeButton(8);
  }

  const deckSymbols = SYMBOLS.slice(0, selectedPairs);
  const deck = shuffle([...deckSymbols, ...deckSymbols]);

  board.innerHTML = "";
  board.className = `memory-board mode-${selectedPairs}`;
  cards = [];
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  moves = 0;

  deck.forEach((symbol, index) => {
    const card = createCard(symbol, index);
    cards.push(card);
    board.appendChild(card);
  });

  const mode = MODES[selectedPairs];
  modeTitle.textContent = `${mode.name} · ${selectedPairs} PAARE`;
  status.textContent = `Finde alle ${selectedPairs} Paare!`;
  updateUI();
  updateEventUI();
}

function flipCard(card) {
  if (lockBoard || card === firstCard || card.classList.contains("matched")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves += 1;
  updateUI();
  checkMatch();
}

function checkMatch() {
  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    matchedPairs += 1;
    updateUI();

    if (matchedPairs === selectedPairs) {
      const base = selectedPairs * 150;
      const penalty = Math.max(0, moves - selectedPairs) * 20;
      const score = Math.max(selectedPairs * 50, base - penalty);
      status.textContent = `🎉 Geschafft! ${moves} Züge · ${score} Punkte.`;
      if (onComplete) onComplete(score);
      return;
    }

    status.textContent = "✓ Paar gefunden!";
    resetTurn();
    return;
  }

  lockBoard = true;
  status.textContent = "Kein Paar …";

  setTimeout(() => {
    if (firstCard) firstCard.classList.remove("flipped");
    if (secondCard) secondCard.classList.remove("flipped");
    resetTurn();
    status.textContent = "Weiter geht's!";
  }, selectedPairs >= 32 ? 550 : 750);
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function selectModeButton(pairs) {
  if (pairs === 32 && !eventAvailable()) return;
  selectedPairs = pairs;
  document.querySelectorAll(".memory-mode-button").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.memoryPairs) === pairs);
  });
}

export function initMemoryGame(options = {}) {
  onComplete = options.onComplete || onComplete;

  if (!initialized) {
    document.querySelectorAll(".memory-mode-button").forEach(button => {
      button.addEventListener("click", () => {
        const pairs = Number(button.dataset.memoryPairs);
        if (pairs === 32 && !eventAvailable()) return;
        selectModeButton(pairs);
        buildBoard();
      });
    });
    setInterval(updateEventUI, 30000);
    initialized = true;
  }

  buildBoard();
}
