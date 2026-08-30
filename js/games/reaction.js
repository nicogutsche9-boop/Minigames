let timerId = null;
let running = false;
let score = 0;
let timeLeft = 30;
let currentCallback = null;

const arena = document.querySelector("#reactionArena");
const target = document.querySelector("#target");
const intro = document.querySelector("#reactionIntro");
const scoreValue = document.querySelector("#scoreValue");
const timeValue = document.querySelector("#timeValue");

function updateUI() {
  scoreValue.textContent = score;
  timeValue.textContent = timeLeft;
}

function moveTarget() {
  const padding = 36;
  const x = padding + Math.random() * Math.max(1, arena.clientWidth - padding * 2);
  const y = padding + Math.random() * Math.max(1, arena.clientHeight - padding * 2);
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.classList.remove("hidden");
  target.style.animation = "none";
  void target.offsetWidth;
  target.style.animation = "targetIn .12s ease-out";
}

function endGame() {
  if (!running) return;
  running = false;
  clearInterval(timerId);
  timerId = null;
  target.classList.add("hidden");
  if (currentCallback) currentCallback(score);
  document.querySelector("#gameOverScreen").classList.add("active");
  document.querySelector("#reactionScreen").classList.remove("active");
}

function start() {
  clearInterval(timerId);
  score = 0;
  timeLeft = 30;
  running = true;
  updateUI();
  intro.classList.add("hidden");
  moveTarget();

  timerId = setInterval(() => {
    timeLeft -= 1;
    updateUI();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

export function initReactionGame(options = {}) {
  currentCallback = options.onGameOver || currentCallback;
  document.querySelector("#startReactionButton").onclick = start;
  target.onclick = () => {
    if (!running) return;
    score += 1;
    updateUI();
    moveTarget();
  };
  intro.classList.remove("hidden");
  target.classList.add("hidden");
  score = 0;
  timeLeft = 30;
  updateUI();
}

export function stopReactionGame() {
  running = false;
  clearInterval(timerId);
  timerId = null;
}
