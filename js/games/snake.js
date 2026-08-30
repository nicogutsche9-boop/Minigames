const canvas = document.querySelector("#snakeCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 }
];

let snake = [];
let food = { x: 14, y: 10 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let running = false;
let loopId = null;
let initialized = false;

const scoreEl = document.querySelector("#snakeScore");
const lengthEl = document.querySelector("#snakeLength");
const intro = document.querySelector("#snakeIntro");
const gameOverPanel = document.querySelector("#snakeGameOver");
const gameOverText = document.querySelector("#snakeGameOverText");

function resetState() {
  snake = INITIAL_SNAKE.map(part => ({ ...part }));
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  placeFood();
  updateUI();
  draw();
}

function updateUI() {
  scoreEl.textContent = score;
  lengthEl.textContent = snake.length;
}

function placeFood() {
  const available = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!snake.some(part => part.x === x && part.y === y)) {
        available.push({ x, y });
      }
    }
  }

  food = available[Math.floor(Math.random() * available.length)] || { x: 10, y: 10 };
}

function setDirection(newDirection) {
  if (!running) return;

  const isReverse =
    newDirection.x === -direction.x &&
    newDirection.y === -direction.y;

  if (!isReverse) {
    nextDirection = newDirection;
  }
}

function handleKey(event) {
  const key = event.key.toLowerCase();

  const directions = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  if (directions[key]) {
    event.preventDefault();
    setDirection(directions[key]);
  }
}

function gameStep() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const hitsWall =
    head.x < 0 ||
    head.x >= GRID_SIZE ||
    head.y < 0 ||
    head.y >= GRID_SIZE;

  const eating = head.x === food.x && head.y === food.y;

  const bodyToCheck = eating ? snake : snake.slice(0, -1);
  const hitsSelf = bodyToCheck.some(
    part => part.x === head.x && part.y === head.y
  );

  if (hitsWall || hitsSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (eating) {
    score += 10;
    placeFood();
  } else {
    snake.pop();
  }

  updateUI();
  draw();
}

function startGame() {
  stopLoop();
  resetState();

  running = true;
  intro.classList.add("hidden");
  gameOverPanel.classList.add("hidden");

  loopId = setInterval(gameStep, 115);
}

function endGame() {
  running = false;
  stopLoop();

  gameOverText.textContent = `Score: ${score} · Länge: ${snake.length}`;
  gameOverPanel.classList.remove("hidden");
  draw(true);
}

function stopLoop() {
  if (loopId !== null) {
    clearInterval(loopId);
    loopId = null;
  }
}

function draw(gameEnded = false) {
  const cell = canvas.width / GRID_SIZE;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#03080a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = "rgba(53, 232, 120, 0.07)";
  ctx.lineWidth = 1;

  for (let i = 1; i < GRID_SIZE; i++) {
    const pos = i * cell;

    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }

  // Food
  const foodX = food.x * cell + cell / 2;
  const foodY = food.y * cell + cell / 2;
  ctx.shadowColor = "#ff4b4b";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#ff3f4b";
  ctx.beginPath();
  ctx.arc(foodX, foodY, cell * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Snake
  snake.forEach((part, index) => {
    const padding = index === 0 ? cell * 0.09 : cell * 0.13;
    const x = part.x * cell + padding;
    const y = part.y * cell + padding;
    const size = cell - padding * 2;

    ctx.fillStyle = index === 0 ? "#62ff91" : "#28d96a";
    ctx.shadowColor = "#35e878";
    ctx.shadowBlur = index === 0 ? 15 : 7;
    roundRect(ctx, x, y, size, size, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  if (gameEnded) {
    ctx.fillStyle = "rgba(255, 50, 70, .08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

export function initSnakeGame() {
  if (!initialized) {
    window.addEventListener("keydown", handleKey);
    initialized = true;
  }

  document.querySelector("#startSnakeButton").onclick = startGame;
  document.querySelector("#snakeRestartButton").onclick = startGame;

  resetState();
  running = false;
  intro.classList.remove("hidden");
  gameOverPanel.classList.add("hidden");
}

export function stopSnakeGame() {
  running = false;
  stopLoop();
}
