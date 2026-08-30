const SYMBOLS = ["🍒", "🍋", "🍉", "⭐", "🚀", "🎮", "👾", "💎"];

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let initialized = false;

const board = document.querySelector("#memoryBoard");
const pairsValue = document.querySelector("#memoryPairs");
const movesValue = document.querySelector("#memoryMoves");
const status = document.querySelector("#memoryStatus");

function shuffle(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function updateUI() {
  pairsValue.textContent = matchedPairs;
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
  const deck = shuffle([...SYMBOLS, ...SYMBOLS]);

  board.innerHTML = "";
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

  updateUI();
  status.textContent = "Finde alle 8 Paare!";
}

function flipCard(card) {
  if (
    lockBoard ||
    card === firstCard ||
    card.classList.contains("matched")
  ) {
    return;
  }

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

    if (matchedPairs === SYMBOLS.length) {
      status.textContent = `🎉 Geschafft! ${moves} Züge.`;
      return;
    }

    status.textContent = "✓ Paar gefunden!";
    resetTurn();
    return;
  }

  lockBoard = true;
  status.textContent = "Kein Paar …";

  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetTurn();
    status.textContent = "Weiter geht's!";
  }, 750);
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

export function initMemoryGame() {
  if (!initialized) {
    initialized = true;
  }
  buildBoard();
}
