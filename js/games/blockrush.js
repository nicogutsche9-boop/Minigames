const canvas = document.querySelector("#blockRushCanvas");
const ctx = canvas.getContext("2d");
const nextCanvas = document.querySelector("#blockRushNextCanvas");
const nextCtx = nextCanvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const CELL = 30;

const COLORS = {
  I: "#42e8ff",
  J: "#5578ff",
  L: "#ff9d42",
  O: "#ffe45c",
  S: "#4dff88",
  T: "#c26cff",
  Z: "#ff5570"
};

const SHAPES = {
  I: [[1,1,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0]],
  T: [[0,1,0],[1,1,1]],
  Z: [[1,1,0],[0,1,1]]
};

let board = [];
let current = null;
let nextType = null;
let score = 0;
let lines = 0;
let level = 1;
let running = false;
let loopId = null;
let onGameOver = null;
let initialized = false;

function newBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomType() {
  const types = Object.keys(SHAPES);
  return types[Math.floor(Math.random() * types.length)];
}

function createPiece(type = randomType()) {
  const shape = SHAPES[type].map(row => [...row]);
  return {
    type,
    shape,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: 0
  };
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function collides(piece, dx = 0, dy = 0, shape = piece.shape) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;

      const nx = piece.x + x + dx;
      const ny = piece.y + y + dy;

      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function spawn() {
  current = createPiece(nextType || randomType());
  nextType = randomType();
  drawNext();

  if (collides(current)) {
    endGame();
  }
}

function move(dx) {
  if (!running || !current) return;
  if (!collides(current, dx, 0)) {
    current.x += dx;
    draw();
  }
}

function softDrop() {
  if (!running || !current) return;
  if (!collides(current, 0, 1)) {
    current.y++;
    score += 1;
    updateUI();
    draw();
  } else {
    lockPiece();
  }
}

function rotate() {
  if (!running || !current || current.type === "O") return;

  const rotated = rotateMatrix(current.shape);
  const kicks = [0, -1, 1, -2, 2];

  for (const kick of kicks) {
    if (!collides(current, kick, 0, rotated)) {
      current.shape = rotated;
      current.x += kick;
      draw();
      return;
    }
  }
}

function hardDrop() {
  if (!running || !current) return;

  let distance = 0;
  while (!collides(current, 0, 1)) {
    current.y++;
    distance++;
  }

  score += distance * 2;
  lockPiece();
}

function lockPiece() {
  for (let y = 0; y < current.shape.length; y++) {
    for (let x = 0; x < current.shape[y].length; x++) {
      if (!current.shape[y][x]) continue;

      const nx = current.x + x;
      const ny = current.y + y;

      if (ny >= 0) board[ny][nx] = current.type;
    }
  }

  clearLines();
  spawn();
  updateUI();
  draw();
}

function clearLines() {
  let cleared = 0;

  board = board.filter(row => {
    if (row.every(Boolean)) {
      cleared++;
      return false;
    }
    return true;
  });

  while (board.length < ROWS) {
    board.unshift(Array(COLS).fill(null));
  }

  if (!cleared) return;

  const rewards = { 1: 100, 2: 300, 3: 500, 4: 800 };
  score += (rewards[cleared] || 1000) * level;
  lines += cleared;
  level = Math.floor(lines / 10) + 1;

  restartLoop();
}

function restartLoop() {
  if (!running) return;
  clearInterval(loopId);
  const speed = Math.max(80, 700 - (level - 1) * 55);
  loopId = setInterval(softDrop, speed);
}

function updateUI() {
  document.querySelector("#blockRushScore").textContent = score;
  document.querySelector("#blockRushLevel").textContent = level;
  document.querySelector("#blockRushLines").textContent = lines;
}

function drawCell(context, x, y, type, size) {
  context.fillStyle = COLORS[type];
  context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);

  context.fillStyle = "rgba(255,255,255,.22)";
  context.fillRect(x * size + 3, y * size + 3, size - 7, 4);

  context.strokeStyle = "rgba(0,0,0,.22)";
  context.strokeRect(x * size + 1, y * size + 1, size - 2, size - 2);
}

function draw() {
  ctx.fillStyle = "#03080a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(120,150,220,.08)";
  for (let x = 1; x < COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, canvas.height);
    ctx.stroke();
  }
  for (let y = 1; y < ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(canvas.width, y * CELL);
    ctx.stroke();
  }

  board.forEach((row, y) => row.forEach((type, x) => {
    if (type) drawCell(ctx, x, y, type, CELL);
  }));

  if (current) {
    current.shape.forEach((row, y) => row.forEach((filled, x) => {
      if (filled && current.y + y >= 0) {
        drawCell(ctx, current.x + x, current.y + y, current.type, CELL);
      }
    }));
  }
}

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  nextCtx.fillStyle = "#050a12";
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  if (!nextType) return;

  const shape = SHAPES[nextType];
  const size = 24;
  const offsetX = (nextCanvas.width - shape[0].length * size) / 2;
  const offsetY = (nextCanvas.height - shape.length * size) / 2;

  shape.forEach((row, y) => row.forEach((filled, x) => {
    if (!filled) return;
    nextCtx.fillStyle = COLORS[nextType];
    nextCtx.fillRect(offsetX + x * size + 1, offsetY + y * size + 1, size - 2, size - 2);
  }));
}

function resetState() {
  board = newBoard();
  current = null;
  nextType = randomType();
  score = 0;
  lines = 0;
  level = 1;
  updateUI();
  spawn();
  draw();
}

function startGame() {
  stopLoop();
  resetState();
  running = true;
  document.querySelector("#blockRushOverlay").classList.add("hidden");
  document.querySelector("#blockRushGameOver").classList.add("hidden");
  restartLoop();
}

function stopLoop() {
  if (loopId !== null) {
    clearInterval(loopId);
    loopId = null;
  }
}

function endGame() {
  running = false;
  stopLoop();

  document.querySelector("#blockRushGameOverText").textContent =
    `Score: ${score} · ${lines} Linien`;
  if (onGameOver) onGameOver(score);
  document.querySelector("#blockRushGameOver").classList.remove("hidden");
  draw();
}

function handleKey(event) {
  if (!running) return;

  if (["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," ","Spacebar"].includes(event.key)) {
    event.preventDefault();
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move(-1);
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move(1);
  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") softDrop();
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") rotate();
  if (event.key === " " || event.key === "Spacebar") hardDrop();
}

export function initBlockRush(options = {}) {
  onGameOver = options.onGameOver || onGameOver;

  if (!initialized) {
    window.addEventListener("keydown", handleKey);
    initialized = true;
  }

  document.querySelector("#startBlockRushButton").onclick = startGame;
  document.querySelector("#blockRushRestartButton").onclick = startGame;

  document.querySelectorAll("[data-br-action]").forEach(button => {
    button.onclick = () => {
      const action = button.dataset.brAction;
      if (action === "left") move(-1);
      if (action === "right") move(1);
      if (action === "down") softDrop();
      if (action === "rotate") rotate();
      if (action === "drop") hardDrop();
    };
  });

  resetState();
  running = false;
  document.querySelector("#blockRushOverlay").classList.remove("hidden");
  document.querySelector("#blockRushGameOver").classList.add("hidden");
}

export function stopBlockRush() {
  running = false;
  stopLoop();
}
