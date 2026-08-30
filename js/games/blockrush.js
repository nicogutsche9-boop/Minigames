/* =========================================================
   MINI ARCADE
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


/* =========================================================
   SPIELFELD
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
   TETROMINOS
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
   STATUS
   ========================================================= */

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


/* =========================================================
   BOARD ERSTELLEN
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
            Math.random() * types.length
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
        (_, index) =>
            matrix
                .map(row => row[index])
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
   NÄCHSTEN STEIN ERZEUGEN
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


    if (
        collides(current)
    ) {

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

    }

    else {

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


    /*
       Kleine Wall-Kicks,
       damit Steine auch nahe
       am Rand gedreht werden können.
    */

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


    if (!running) {
        return;
    }


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
        board.filter(row => {

            if (
                row.every(Boolean)
            ) {

                cleared++;

                return false;

            }

            return true;

        });


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


    lines += cleared;


    level =
        Math.floor(
            lines / 10
        ) + 1;


    restartLoop();

}


/* =========================================================
   SPIELGESCHWINDIGKEIT
   ========================================================= */

function restartLoop() {

    if (!running) {
        return;
    }


    stopLoop();


    const speed =
        Math.max(
            80,
            700 -
            (
                level - 1
            ) * 55
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

    const scoreElement =
        document.querySelector(
            "#blockRushScore"
        );

    const levelElement =
        document.querySelector(
            "#blockRushLevel"
        );

    const linesElement =
        document.querySelector(
            "#blockRushLines"
        );


    if (scoreElement) {

        scoreElement.textContent =
            score;

    }


    if (levelElement) {

        levelElement.textContent =
            level;

    }


    if (linesElement) {

        linesElement.textContent =
            lines;

    }

}


/* =========================================================
   ZELLE ZEICHNEN
   ========================================================= */

function drawCell(
    context,
    x,
    y,
    type,
    size
) {

    if (!context) {
        return;
    }


    context.fillStyle =
        COLORS[type];


    context.fillRect(
        x * size + 1,
        y * size + 1,
        size - 2,
        size - 2
    );


    /*
       Heller Glanz oben
    */

    context.fillStyle =
        "rgba(255,255,255,.22)";


    context.fillRect(
        x * size + 3,
        y * size + 3,
        size - 7,
        4
    );


    /*
       Dunkler Rand
    */

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
   SPIELFELD ZEICHNEN
   ========================================================= */

function draw() {

    if (
        !ctx ||
        !canvas
    ) {

        return;

    }


    /*
       Hintergrund
    */

    ctx.fillStyle =
        "#03080a";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       Raster vertikal
    */

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


    /*
       Raster horizontal
    */

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


    /*
       Bereits gesetzte Steine
    */

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


    /*
       Aktueller Stein
    */

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

    if (
        !nextCtx ||
        !nextCanvas
    ) {

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
            shape[0].length * size
        ) / 2;


    const offsetY =
        (
            nextCanvas.height -
            shape.length * size
        ) / 2;


    shape.forEach(
        (row, y) => {

            row.forEach(
                (filled, x) => {

                    if (!filled) {
                        return;
                    }


                    drawCell(
                        nextCtx,
                        (
                            offsetX / size
                        ) + x,
                        (
                            offsetY / size
                        ) + y,
                        nextType,
                        size
                    );

                }
            );

        }
    );

}


/* =========================================================
   ZUSTAND ZURÜCKSETZEN
   ========================================================= */

function resetState() {

    board =
        newBoard();


    current =
        null;


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


    running = true;


    resetState();


    const overlay =
        document.querySelector(
            "#blockRushOverlay"
        );

    const gameOver =
        document.querySelector(
            "#blockRushGameOver"
        );


    overlay?.classList.add(
        "hidden"
    );


    gameOver?.classList.add(
        "hidden"
    );


    restartLoop();

}


/* =========================================================
   LOOP STOPPEN
   ========================================================= */

function stopLoop() {

    if (
        loopId !== null
    ) {

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


    const gameOverText =
        document.querySelector(
            "#blockRushGameOverText"
        );


    if (gameOverText) {

        gameOverText.textContent =
            `Score: ${score} · ${lines} Linien`;

    }


    /*
       WICHTIG:

       Das Spiel selbst verändert
       NICHT das Profil.

       app.js bekommt den Score
       über onGameOver() und kann
       ihn dort an profile.js
       weitergeben.
    */

    if (
        typeof onGameOver ===
        "function"
    ) {

        onGameOver(score);

    }


    const gameOver =
        document.querySelector(
            "#blockRushGameOver"
        );


    gameOver?.classList.remove(
        "hidden"
    );


    draw();

}


/* =========================================================
   TASTATUR
   ========================================================= */

function handleKey(event) {

    if (!running) {
        return;
    }


    const keys = [

        "ArrowLeft",

        "ArrowRight",

        "ArrowDown",

        "ArrowUp",

        " ",

        "Spacebar"

    ];


    if (
        keys.includes(
            event.key
        )
    ) {

        event.preventDefault();

    }


    const key =
        event.key.toLowerCase();


    if (
        event.key === "ArrowLeft" ||
        key === "a"
    ) {

        move(-1);

    }


    if (
        event.key === "ArrowRight" ||
        key === "d"
    ) {

        move(1);

    }


    if (
        event.key === "ArrowDown" ||
        key === "s"
    ) {

        softDrop();

    }


    if (
        event.key === "ArrowUp" ||
        key === "w"
    ) {

        rotate();

    }


    if (
        event.key === " " ||
        event.key === "Spacebar"
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

    /*
       Callback aus app.js übernehmen.
    */

    if (
        typeof options.onGameOver ===
        "function"
    ) {

        onGameOver =
            options.onGameOver;

    }


    /*
       Tastatur nur einmal registrieren.
    */

    if (!initialized) {

        window.addEventListener(
            "keydown",
            handleKey
        );

        initialized = true;

    }


    /*
       START BUTTON
    */

    const startButton =
        document.querySelector(
            "#startBlockRushButton"
        );


    if (startButton) {

        startButton.onclick =
            startGame;

    }


    /*
       RESTART BUTTON
    */

    const restartButton =
        document.querySelector(
            "#blockRushRestartButton"
        );


    if (restartButton) {

        restartButton.onclick =
            startGame;

    }


    /*
       MOBILE / TOUCH CONTROLS
    */

    document
        .querySelectorAll(
            "[data-br-action]"
        )
        .forEach(button => {

            /*
               Alte Handler ersetzen,
               damit beim erneuten Öffnen
               keine doppelten Klicks entstehen.
            */

            button.onclick =
                () => {

                    const action =
                        button.dataset.brAction;


                    if (
                        action === "left"
                    ) {

                        move(-1);

                    }


                    if (
                        action === "right"
                    ) {

                        move(1);

                    }


                    if (
                        action === "down"
                    ) {

                        softDrop();

                    }


                    if (
                        action === "rotate"
                    ) {

                        rotate();

                    }


                    if (
                        action === "drop"
                    ) {

                        hardDrop();

                    }

                };

        });


    /*
       Anfangszustand anzeigen.
    */

    resetState();


    running = false;


    stopLoop();


    document
        .querySelector(
            "#blockRushOverlay"
        )
        ?.classList.remove(
            "hidden"
        );


    document
        .querySelector(
            "#blockRushGameOver"
        )
        ?.classList.add(
            "hidden"
        );

}


/* =========================================================
   BLOCK RUSH STOPPEN
   ========================================================= */

export function stopBlockRush() {

    running = false;

    stopLoop();

}
