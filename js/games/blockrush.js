import { recordGame } from "../profile.js";


/* =========================================================
   BLOCK RUSH
   ========================================================= */

const canvas =
  document.querySelector("#blockRushCanvas");

const ctx =
  canvas?.getContext("2d");

const nextCanvas =
  document.querySelector("#blockRushNextCanvas");

const nextCtx =
  nextCanvas?.getContext("2d");


if (!canvas || !ctx) {
  throw new Error(
    "blockRushCanvas wurde nicht gefunden."
  );
}


/* =========================================================
   SPIELKONSTANTEN
   ========================================================= */

const COLS = 10;
const ROWS = 20;
const CELL = 30;


/* =========================================================
   FARBEN
   ========================================================= */

const COLORS = {

  I: "#42e8ff",

  J: "#5578ff",

  L: "#ff9d42",

  O: "#ffe45c",

  S: "#4dff88",

  T: "#c26cff",

  Z: "#ff5570"

};


/* =========================================================
   TETROMINO FORMEN
   ========================================================= */

const SHAPES = {

  I: [
    [1, 1, 1, 1]
  ],

  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],

  L: [
    [0, 0, 1],
    [1, 1, 1]
  ],

  O: [
    [1, 1],
    [1, 1]
  ],

  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],

  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],

  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ]

};


/* =========================================================
   SPIELSTATUS
   ========================================================= */

let board = [];

let current = null;

let nextType = null;

let score = 0;

let lines = 0;

let level = 1;

let running = false;

let loopId = null;

let initialized = false;

let onGameOver = null;


/* =========================================================
   HTML ELEMENTE
   ========================================================= */

const scoreEl =
  document.querySelector(
    "#blockRushScore"
  );

const levelEl =
  document.querySelector(
    "#blockRushLevel"
  );

const linesEl =
  document.querySelector(
    "#blockRushLines"
  );

const overlay =
  document.querySelector(
    "#blockRushOverlay"
  );

const gameOverPanel =
  document.querySelector(
    "#blockRushGameOver"
  );

const gameOverText =
  document.querySelector(
    "#blockRushGameOverText"
  );

const startButton =
  document.querySelector(
    "#startBlockRushButton"
  );

const restartButton =
  document.querySelector(
    "#blockRushRestartButton"
  );


/* =========================================================
   NEUES SPIELFELD
   ========================================================= */

function newBoard() {

  return Array.from(
    {
      length: ROWS
    },
    () =>
      Array(COLS).fill(null)
  );

}


/* =========================================================
   ZUFÄLLIGER STEIN
   ========================================================= */

function randomType() {

  const types =
    Object.keys(SHAPES);

  return types[
    Math.floor(
      Math.random() *
      types.length
    )
  ];

}


/* =========================================================
   STEIN ERSTELLEN
   ========================================================= */

function createPiece(
  type = randomType()
) {

  const shape =
    SHAPES[type].map(
      row => [...row]
    );


  return {

    type,

    shape,

    x:
      Math.floor(
        (
          COLS -
          shape[0].length
        ) / 2
      ),

    y: 0

  };

}


/* =========================================================
   MATRIX DREHEN
   ========================================================= */

function rotateMatrix(matrix) {

  return matrix[0].map(
    (_, i) =>
      matrix
        .map(row => row[i])
        .reverse()
  );

}


/* =========================================================
   KOLLISION PRÜFEN
   ========================================================= */

function collides(
  piece,
  dx = 0,
  dy = 0,
  shape = piece.shape
) {

  for (
    let y = 0;
    y < shape.length;
    y++
  ) {

    for (
      let x = 0;
      x < shape[y].length;
      x++
    ) {

      if (!shape[y][x]) {
        continue;
      }


      const nx =
        piece.x +
        x +
        dx;

      const ny =
        piece.y +
        y +
        dy;


      if (
        nx < 0 ||
        nx >= COLS ||
        ny >= ROWS
      ) {

        return true;

      }


      if (
        ny >= 0 &&
        board[ny][nx]
      ) {

        return true;

      }

    }

  }


  return false;

}


/* =========================================================
   STEIN ERZEUGEN
   ========================================================= */

function spawn() {

  current =
    createPiece(
      nextType ||
      randomType()
    );


  nextType =
    randomType();


  drawNext();


  if (collides(current)) {

    endGame();

  }

}


/* =========================================================
   NACH LINKS / RECHTS
   ========================================================= */

function move(dx) {

  if (
    !running ||
    !current
  ) {

    return;

  }


  if (
    !collides(
      current,
      dx,
      0
    )
  ) {

    current.x += dx;

    draw();

  }

}


/* =========================================================
   SOFT DROP
   ========================================================= */

function softDrop() {

  if (
    !running ||
    !current
  ) {

    return;

  }


  if (
    !collides(
      current,
      0,
      1
    )
  ) {

    current.y++;

    score += 1;

    updateUI();

    draw();

  } else {

    lockPiece();

  }

}


/* =========================================================
   DREHEN
   ========================================================= */

function rotate() {

  if (
    !running ||
    !current ||
    current.type === "O"
  ) {

    return;

  }


  const rotated =
    rotateMatrix(
      current.shape
    );


  const kicks = [
    0,
    -1,
    1,
    -2,
    2
  ];


  for (
    const kick of kicks
  ) {

    if (
      !collides(
        current,
        kick,
        0,
        rotated
      )
    ) {

      current.shape =
        rotated;

      current.x +=
        kick;

      draw();

      return;

    }

  }

}


/* =========================================================
   HARD DROP
   ========================================================= */

function hardDrop() {

  if (
    !running ||
    !current
  ) {

    return;

  }


  let distance = 0;


  while (
    !collides(
      current,
      0,
      1
    )
  ) {

    current.y++;

    distance++;

  }


  score +=
    distance * 2;


  lockPiece();

}


/* =========================================================
   STEIN FESTSETZEN
   ========================================================= */

function lockPiece() {

  if (!current) {
    return;
  }


  for (
    let y = 0;
    y < current.shape.length;
    y++
  ) {

    for (
      let x = 0;
      x < current.shape[y].length;
      x++
    ) {

      if (
        !current.shape[y][x]
      ) {

        continue;

      }


      const nx =
        current.x + x;

      const ny =
        current.y + y;


      if (
        ny >= 0 &&
        ny < ROWS &&
        nx >= 0 &&
        nx < COLS
      ) {

        board[ny][nx] =
          current.type;

      }

    }

  }


  clearLines();

  spawn();

  updateUI();

  draw();

}


/* =========================================================
   REIHEN LÖSCHEN
   ========================================================= */

function clearLines() {

  let cleared = 0;


  board =
    board.filter(
      row => {

        if (
          row.every(Boolean)
        ) {

          cleared++;

          return false;

        }


        return true;

      }
    );


  while (
    board.length < ROWS
  ) {

    board.unshift(
      Array(COLS).fill(null)
    );

  }


  if (!cleared) {

    return;

  }


  const rewards = {

    1: 100,

    2: 300,

    3: 500,

    4: 800

  };


  score +=
    (
      rewards[cleared] ||
      1000
    ) * level;


  lines +=
    cleared;


  level =
    Math.floor(
      lines / 10
    ) + 1;


  restartLoop();

  updateUI();

}


/* =========================================================
   FALLGESCHWINDIGKEIT NEU SETZEN
   ========================================================= */

function restartLoop() {

  if (!running) {
    return;
  }


  if (loopId !== null) {

    clearInterval(
      loopId
    );

  }


  const speed =
    Math.max(
      80,
      700 -
      (level - 1) * 55
    );


  loopId =
    setInterval(
      softDrop,
      speed
    );

}


/* =========================================================
   UI AKTUALISIEREN
   ========================================================= */

function updateUI() {

  if (scoreEl) {

    scoreEl.textContent =
      score;

  }


  if (levelEl) {

    levelEl.textContent =
      level;

  }


  if (linesEl) {

    linesEl.textContent =
      lines;

  }

}


/* =========================================================
   EINZELNE ZELLE ZEICHNEN
   ========================================================= */

function drawCell(
  context,
  x,
  y,
  type,
  size
) {

  context.fillStyle =
    COLORS[type];


  context.fillRect(

    x * size + 1,

    y * size + 1,

    size - 2,

    size - 2

  );


  context.fillStyle =
    "rgba(255,255,255,.22)";


  context.fillRect(

    x * size + 3,

    y * size + 3,

    size - 7,

    4

  );


  context.strokeStyle =
    "rgba(0,0,0,.22)";


  context.strokeRect(

    x * size + 1,

    y * size + 1,

    size - 2,

    size - 2

  );

}


/* =========================================================
   HAUPTSPIELFELD ZEICHNEN
   ========================================================= */

function draw() {

  ctx.fillStyle =
    "#03080a";


  ctx.fillRect(

    0,

    0,

    canvas.width,

    canvas.height

  );


  /* -------------------------------------------------------
     GRID
     ------------------------------------------------------- */

  ctx.strokeStyle =
    "rgba(120,150,220,.08)";


  for (
    let x = 1;
    x < COLS;
    x++
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x * CELL,
      0
    );

    ctx.lineTo(
      x * CELL,
      canvas.height
    );

    ctx.stroke();

  }


  for (
    let y = 1;
    y < ROWS;
    y++
  ) {

    ctx.beginPath();

    ctx.moveTo(
      0,
      y * CELL
    );

    ctx.lineTo(
      canvas.width,
      y * CELL
    );

    ctx.stroke();

  }


  /* -------------------------------------------------------
     FESTE BLÖCKE
     ------------------------------------------------------- */

  board.forEach(
    (row, y) => {

      row.forEach(
        (type, x) => {

          if (type) {

            drawCell(
              ctx,
              x,
              y,
              type,
              CELL
            );

          }

        }
      );

    }
  );


  /* -------------------------------------------------------
     AKTUELLER STEIN
     ------------------------------------------------------- */

  if (current) {

    current.shape.forEach(
      (row, y) => {

        row.forEach(
          (filled, x) => {

            if (
              filled &&
              current.y + y >= 0
            ) {

              drawCell(

                ctx,

                current.x + x,

                current.y + y,

                current.type,

                CELL

              );

            }

          }
        );

      }
    );

  }

}


/* =========================================================
   NÄCHSTEN STEIN ZEICHNEN
   ========================================================= */

function drawNext() {

  if (!nextCtx || !nextCanvas) {
    return;
  }


  nextCtx.clearRect(

    0,

    0,

    nextCanvas.width,

    nextCanvas.height

  );


  nextCtx.fillStyle =
    "#050a12";


  nextCtx.fillRect(

    0,

    0,

    nextCanvas.width,

    nextCanvas.height

  );


  if (!nextType) {
    return;
  }


  const shape =
    SHAPES[nextType];


  const size = 24;


  const offsetX =
    (
      nextCanvas.width -
      shape[0].length *
      size
    ) / 2;


  const offsetY =
    (
      nextCanvas.height -
      shape.length *
      size
    ) / 2;


  shape.forEach(
    (row, y) => {

      row.forEach(
        (filled, x) => {

          if (!filled) {
            return;
          }


          nextCtx.fillStyle =
            COLORS[nextType];


          nextCtx.fillRect(

            offsetX +
            x * size +
            1,

            offsetY +
            y * size +
            1,

            size - 2,

            size - 2

          );


          nextCtx.fillStyle =
            "rgba(255,255,255,.22)";


          nextCtx.fillRect(

            offsetX +
            x * size +
            3,

            offsetY +
            y * size +
            3,

            size - 7,

            4

          );

        }
      );

    }
  );

}


/* =========================================================
   SPIEL ZURÜCKSETZEN
   ========================================================= */

function resetState() {

  board =
    newBoard();


  current = null;


  nextType =
    randomType();


  score = 0;

  lines = 0;

  level = 1;


  updateUI();

  spawn();

  draw();

}


/* =========================================================
   SPIEL STARTEN
   ========================================================= */

function startGame() {

  stopLoop();

  resetState();

  running = true;


  if (overlay) {

    overlay.classList.add(
      "hidden"
    );

  }


  if (gameOverPanel) {

    gameOverPanel.classList.add(
      "hidden"
    );

  }


  restartLoop();

}


/* =========================================================
   LOOP STOPPEN
   ========================================================= */

function stopLoop() {

  if (loopId !== null) {

    clearInterval(
      loopId
    );

    loopId = null;

  }

}


/* =========================================================
   GAME OVER
   ========================================================= */

function endGame() {

  if (!running) {
    return;
  }


  running = false;

  stopLoop();


  /*
     SCORE AN DAS ZENTRALE
     PROFIL-SYSTEM ÜBERGEBEN
  */

  let result = null;


  try {

    result =
      recordGame(
        "blockrush",
        score
      );

  } catch (error) {

    console.error(
      "Block Rush: Profil konnte nicht aktualisiert werden.",
      error
    );

  }


  if (gameOverText) {

    gameOverText.textContent =
      `Score: ${score} · ${lines} Linien`;

  }


  /*
     Callback für app.js
  */

  if (onGameOver) {

    onGameOver(
      score,
      result
    );

  }


  if (gameOverPanel) {

    gameOverPanel.classList.remove(
      "hidden"
    );

  }


  draw();

}


/* =========================================================
   TASTATUR
   ========================================================= */

function handleKey(event) {

  if (!running) {
    return;
  }


  const key =
    event.key;


  const lowerKey =
    key.toLowerCase();


  if (
    [
      "ArrowLeft",
      "ArrowRight",
      "ArrowDown",
      "ArrowUp",
      " ",
      "Spacebar"
    ].includes(key)
  ) {

    event.preventDefault();

  }


  if (
    key === "ArrowLeft" ||
    lowerKey === "a"
  ) {

    move(-1);

  }


  if (
    key === "ArrowRight" ||
    lowerKey === "d"
  ) {

    move(1);

  }


  if (
    key === "ArrowDown" ||
    lowerKey === "s"
  ) {

    softDrop();

  }


  if (
    key === "ArrowUp" ||
    lowerKey === "w"
  ) {

    rotate();

  }


  if (
    key === " " ||
    key === "Spacebar"
  ) {

    hardDrop();

  }

}


/* =========================================================
   INITIALISIERUNG
   ========================================================= */

export function initBlockRush(
  options = {}
) {

  onGameOver =
    options.onGameOver ||
    null;


  if (!initialized) {

    window.addEventListener(
      "keydown",
      handleKey
    );


    initialized = true;

  }


  if (startButton) {

    startButton.onclick =
      startGame;

  }


  if (restartButton) {

    restartButton.onclick =
      startGame;

  }


  /* -------------------------------------------------------
     MOBILE / TOUCH BUTTONS
     ------------------------------------------------------- */

  document
    .querySelectorAll(
      "[data-br-action]"
    )
    .forEach(button => {

      button.onclick = () => {

        const action =
          button.dataset.brAction;


        if (action === "left") {

          move(-1);

        }


        if (action === "right") {

          move(1);

        }


        if (action === "down") {

          softDrop();

        }


        if (action === "rotate") {

          rotate();

        }


        if (action === "drop") {

          hardDrop();

        }

      };

    });


  resetState();

  running = false;


  if (overlay) {

    overlay.classList.remove(
      "hidden"
    );

  }


  if (gameOverPanel) {

    gameOverPanel.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   BLOCK RUSH STOPPEN
   ========================================================= */

export function stopBlockRush() {

  running = false;

  stopLoop();

}
