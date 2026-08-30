import {
    recordDropDuelResult
} from "../achievements.js";

const ROWS = 6;
const COLS = 7;

const HUMAN = "human";
const CPU = "cpu";


/* =========================================================
   SPIELSTATUS
   ========================================================= */

let board = [];

let running = false;

let thinking = false;

let difficulty = "medium";

let playerWins = 0;

let cpuWins = 0;

let initialized = false;

let onGameOver = null;

/* =========================================================
   HTML ELEMENTE
   ========================================================= */

const boardElement =
    document.querySelector("#dropDuelBoard");

const columnsElement =
    document.querySelector("#dropDuelColumns");

const turnElement =
    document.querySelector("#dropDuelTurn");

const playerWinsElement =
    document.querySelector("#dropDuelPlayerWins");

const cpuWinsElement =
    document.querySelector("#dropDuelCpuWins");

const overlay =
    document.querySelector("#dropDuelOverlay");

const gameOver =
    document.querySelector("#dropDuelGameOver");

const resultTitle =
    document.querySelector("#dropDuelResultTitle");

const resultText =
    document.querySelector("#dropDuelResultText");

const difficultyButtons =
    document.querySelectorAll(
        ".difficulty-button"
    );


/* =========================================================
   SCHWIERIGKEIT LADEN
   ========================================================= */

const savedDifficulty =
    localStorage.getItem(
        "dropDuelDifficulty"
    );

if (
    savedDifficulty === "easy" ||
    savedDifficulty === "medium" ||
    savedDifficulty === "hard"
) {

    difficulty =
        savedDifficulty;

}


/* =========================================================
   SPIELFELD ERSTELLEN
   ========================================================= */

function createBoard() {

    return Array.from(
        {
            length: ROWS
        },
        () =>
            Array(COLS).fill(null)
    );

}


/* =========================================================
   FREIE SPALTEN
   ========================================================= */

function getPlayableColumns() {

    return Array.from(
        {
            length: COLS
        },
        (_, column) => column
    )
    .filter(
        column =>
            board[0][column] === null
    );

}


/* =========================================================
   FREIE REIHE
   ========================================================= */

function getOpenRow(column) {

    for (
        let row = ROWS - 1;
        row >= 0;
        row--
    ) {

        if (
            board[row][column] === null
        ) {

            return row;

        }

    }

    return -1;

}


/* =========================================================
   STEIN SETZEN
   ========================================================= */

function placePiece(
    column,
    player
) {

    const row =
        getOpenRow(column);

    if (row === -1) {

        return -1;

    }

    board[row][column] =
        player;

    return row;

}


/* =========================================================
   SPIELFELD ZEICHNEN
   ========================================================= */

function renderBoard() {

    boardElement.innerHTML = "";


    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        for (
            let column = 0;
            column < COLS;
            column++
        ) {

            const cell =
                document.createElement(
                    "button"
                );

            cell.type = "button";

            cell.className =
                "dropduel-cell";

            cell.dataset.column =
                column;


            const value =
                board[row][column];


            if (value) {

                cell.classList.add(
                    value
                );

                cell.innerHTML =
                    `<span class="dropduel-disc"></span>`;

            }


            cell.addEventListener(
                "click",
                () =>
                    playColumn(column)
            );


            boardElement.appendChild(
                cell
            );

        }

    }


    updateColumnButtons();

}


/* =========================================================
   SPALTEN-BUTTONS
   ========================================================= */

function createColumnButtons() {

    columnsElement.innerHTML = "";


    for (
        let column = 0;
        column < COLS;
        column++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.textContent =
            column + 1;

        button.dataset.column =
            column;


        button.addEventListener(
            "click",
            () =>
                playColumn(column)
        );


        columnsElement.appendChild(
            button
        );

    }

}


/* =========================================================
   BUTTONS AKTUALISIEREN
   ========================================================= */

function updateColumnButtons() {

    const playable =
        new Set(
            getPlayableColumns()
        );


    columnsElement
        .querySelectorAll("button")
        .forEach(button => {

            const column =
                Number(
                    button.dataset.column
                );


            button.disabled =
                !running ||
                thinking ||
                !playable.has(
                    column
                );

        });

}


/* =========================================================
   STATUS
   ========================================================= */

function setTurn(text) {

    turnElement.textContent =
        text;

}


/* =========================================================
   SCORE
   ========================================================= */

function updateScore() {

    playerWinsElement.textContent =
        playerWins;

    cpuWinsElement.textContent =
        cpuWins;

}


/* =========================================================
   GEWINN PRÜFEN
   ========================================================= */

function checkWin(player) {

    const directions = [

        [0, 1],

        [1, 0],

        [1, 1],

        [1, -1]

    ];


    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        for (
            let column = 0;
            column < COLS;
            column++
        ) {

            if (
                board[row][column] !==
                player
            ) {

                continue;

            }


            for (
                const [
                    rowDirection,
                    columnDirection
                ]
                of directions
            ) {

                let count = 1;


                for (
                    let step = 1;
                    step < 4;
                    step++
                ) {

                    const nextRow =
                        row +
                        rowDirection *
                        step;


                    const nextColumn =
                        column +
                        columnDirection *
                        step;


                    if (

                        nextRow < 0 ||

                        nextRow >= ROWS ||

                        nextColumn < 0 ||

                        nextColumn >= COLS ||

                        board[
                            nextRow
                        ][
                            nextColumn
                        ] !== player

                    ) {

                        break;

                    }


                    count++;

                }


                if (
                    count >= 4
                ) {

                    return true;

                }

            }

        }

    }


    return false;

}


/* =========================================================
   UNENTSCHIEDEN
   ========================================================= */

function isBoardFull() {

    return (
        getPlayableColumns()
            .length === 0
    );

}


/* =========================================================
   SIMULIEREN
   ========================================================= */

function wouldWin(
    player,
    column
) {

    const row =
        getOpenRow(column);


    if (row === -1) {

        return false;

    }


    board[row][column] =
        player;


    const result =
        checkWin(player);


    board[row][column] =
        null;


    return result;

}


/* =========================================================
   EINFACH
   ========================================================= */

function chooseEasyMove() {

    const playable =
        getPlayableColumns();


    if (!playable.length) {

        return -1;

    }


    return playable[
        Math.floor(
            Math.random() *
            playable.length
        )
    ];

}


/* =========================================================
   MITTEL
   ========================================================= */

function chooseMediumMove() {

    const playable =
        getPlayableColumns();


    if (!playable.length) {

        return -1;

    }


    /* Computer kann gewinnen */

    for (
        const column of playable
    ) {

        if (
            wouldWin(
                CPU,
                column
            )
        ) {

            return column;

        }

    }


    /* Spieler blockieren */

    for (
        const column of playable
    ) {

        if (
            wouldWin(
                HUMAN,
                column
            )
        ) {

            return column;

        }

    }


    /* Mitte bevorzugen */

    const preference = [

        3,
        2,
        4,
        1,
        5,
        0,
        6

    ];


    for (
        const column of preference
    ) {

        if (
            playable.includes(
                column
            )
        ) {

            return column;

        }

    }


    return playable[0];

}


/* =========================================================
   SCHWER – MINIMAX
   ========================================================= */

function scorePosition(
    player
) {

    let score = 0;


    /* Mitte ist wertvoll */

    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        if (
            board[row][3] ===
            player
        ) {

            score += 3;

        }

    }


    const directions = [

        [0, 1],

        [1, 0],

        [1, 1],

        [1, -1]

    ];


    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        for (
            let column = 0;
            column < COLS;
            column++
        ) {

            for (
                const [
                    dr,
                    dc
                ]
                of directions
            ) {

                const cells = [];


                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    const r =
                        row + dr * i;

                    const c =
                        column + dc * i;


                    if (
                        r < 0 ||
                        r >= ROWS ||
                        c < 0 ||
                        c >= COLS
                    ) {

                        cells.length = 0;

                        break;

                    }


                    cells.push(
                        board[r][c]
                    );

                }


                if (
                    cells.length !== 4
                ) {

                    continue;

                }


                const own =
                    cells.filter(
                        cell =>
                            cell === player
                    ).length;


                const empty =
                    cells.filter(
                        cell =>
                            cell === null
                    ).length;


                if (
                    own === 4
                ) {

                    score += 1000;

                }

                else if (
                    own === 3 &&
                    empty === 1
                ) {

                    score += 30;

                }

                else if (
                    own === 2 &&
                    empty === 2
                ) {

                    score += 8;

                }

            }

        }

    }


    return score;

}


function minimax(
    depth,
    maximizing
) {

    const playable =
        getPlayableColumns();


    if (
        checkWin(CPU)
    ) {

        return {
            score: 100000 + depth
        };

    }


    if (
        checkWin(HUMAN)
    ) {

        return {
            score: -100000 - depth
        };

    }


    if (
        depth === 0 ||
        playable.length === 0
    ) {

        return {
            score:
                scorePosition(CPU) -
                scorePosition(HUMAN)
        };

    }


    if (maximizing) {

        let bestScore =
            -Infinity;

        let bestColumn =
            playable[0];


        for (
            const column of playable
        ) {

            const row =
                getOpenRow(column);

            board[row][column] =
                CPU;


            const result =
                minimax(
                    depth - 1,
                    false
                );


            board[row][column] =
                null;


            if (
                result.score >
                bestScore
            ) {

                bestScore =
                    result.score;

                bestColumn =
                    column;

            }

        }


        return {

            column:
                bestColumn,

            score:
                bestScore

        };

    }


    let bestScore =
        Infinity;

    let bestColumn =
        playable[0];


    for (
        const column of playable
    ) {

        const row =
            getOpenRow(column);

        board[row][column] =
            HUMAN;


        const result =
            minimax(
                depth - 1,
                true
            );


        board[row][column] =
            null;


        if (
            result.score <
            bestScore
        ) {

            bestScore =
                result.score;

            bestColumn =
                column;

        }

    }


    return {

        column:
            bestColumn,

        score:
            bestScore

    };

}


/* =========================================================
   SCHWEREN ZUG WÄHLEN
   ========================================================= */

function chooseHardMove() {

    const playable =
        getPlayableColumns();


    if (!playable.length) {

        return -1;

    }


    /* Sofort gewinnen */

    for (
        const column of playable
    ) {

        if (
            wouldWin(
                CPU,
                column
            )
        ) {

            return column;

        }

    }


    /* Sofort blockieren */

    for (
        const column of playable
    ) {

        if (
            wouldWin(
                HUMAN,
                column
            )
        ) {

            return column;

        }

    }


    /*
       Tiefe 5:
       Der Computer schaut mehrere
       mögliche Züge voraus.
    */

    const result =
        minimax(
            5,
            true
        );


    if (
        result.column !== undefined &&
        playable.includes(
            result.column
        )
    ) {

        return result.column;

    }


    return playable[0];

}


/* =========================================================
   COMPUTER-ZUG
   ========================================================= */

function chooseComputerMove() {

    if (
        difficulty === "easy"
    ) {

        return chooseEasyMove();

    }


    if (
        difficulty === "hard"
    ) {

        return chooseHardMove();

    }


    return chooseMediumMove();

}


/* =========================================================
   SPIEL BEENDET
   ========================================================= */

function finishGame(winner) {

    running = false;
    thinking = false;

    let score = 0;


    if (winner === HUMAN) {

        playerWins++;

        // Sieg = 100 Punkte
        score = 100;


        resultTitle.textContent =
            "🎉 GEWONNEN!";


        resultText.textContent =
            "Vier Steine in einer Reihe!";


        setTurn(
            "SIEG!"
        );

    }

    else if (winner === CPU) {

        cpuWins++;

        // Niederlage = 25 Punkte
        score = 25;


        resultTitle.textContent =
            "🤖 VERLOREN";


        resultText.textContent =
            "Der Computer hat gewonnen.";


        setTurn(
            "NIEDERLAGE"
        );

    }

    else {

        // Unentschieden = 50 Punkte
        score = 50;


        resultTitle.textContent =
            "🤝 UNENTSCHIEDEN";


        resultText.textContent =
            "Das Spielfeld ist voll.";


        setTurn(
            "DRAW"
        );

    }


    // Ergebnis an das zentrale Profil-System senden
    const result =
        recordGame(
            "dropduel",
            score
        );


    updateScore();


    gameOver.classList.remove(
        "hidden"
    );


    updateColumnButtons();

}

/* =========================================================
   SPIELER SPIELT
   ========================================================= */

function playColumn(column) {

    if (
        !running ||
        thinking ||
        getOpenRow(column) === -1
    ) {

        return;

    }


    /* Spieler */

    placePiece(
        column,
        HUMAN
    );


    renderBoard();


    if (
        checkWin(HUMAN)
    ) {

        finishGame(
            HUMAN
        );

        return;

    }


    if (
        isBoardFull()
    ) {

        finishGame(
            null
        );

        return;

    }


    /* Computer denkt */

    thinking = true;

    setTurn(
        "COMPUTER DENKT …"
    );

    updateColumnButtons();


    /*
       Schwer bekommt etwas mehr
       Denkzeit, damit die KI
       natürlicher wirkt.
    */

    const delay =
        difficulty === "hard"
            ? 650
            : 450;


    setTimeout(() => {

        if (!running) {

            return;

        }


        const cpuColumn =
            chooseComputerMove();


        if (
            cpuColumn >= 0
        ) {

            placePiece(
                cpuColumn,
                CPU
            );

        }


        renderBoard();


        if (
            checkWin(CPU)
        ) {

            finishGame(
                CPU
            );

            return;

        }


        if (
            isBoardFull()
        ) {

            finishGame(
                null
            );

            return;

        }


        thinking = false;


        setTurn(
            "DEIN ZUG"
        );


        updateColumnButtons();

    }, delay);

}


/* =========================================================
   NEUES SPIEL
   ========================================================= */

function startGame() { 
    board =
    createBoard();


    running = true;

    thinking = false;


    overlay.classList.add(
        "hidden"
    );


    gameOver.classList.add(
        "hidden"
    );


    setTurn(
        "DEIN ZUG"
    );


    renderBoard();


    updateScore();

}


/* =========================================================
   SCHWIERIGKEIT ÄNDERN
   ========================================================= */

function setDifficulty(
    newDifficulty
) {

    if (
        newDifficulty !== "easy" &&
        newDifficulty !== "medium" &&
        newDifficulty !== "hard"
    ) {

        return;

    }


    difficulty =
        newDifficulty;


    localStorage.setItem(
        "dropDuelDifficulty",
        difficulty
    );


    difficultyButtons
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.difficulty ===
                difficulty
            );

        });


    /*
       Wenn gerade gespielt wird,
       starten wir die Runde neu.
    */

    if (running) {

        startGame();

    }

}


/* =========================================================
   INITIALISIERUNG
   ========================================================= */

export function initDropDuel(options = {}) {

    if (options.onGameOver) {
        onGameOver = options.onGameOver;
    }

    if (!initialized) {
        createColumnButtons();


        difficultyButtons
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () =>
                        setDifficulty(
                            button.dataset.difficulty
                        )
                );

            });


        document
            .querySelector(
                "#startDropDuelButton"
            )
            ?.addEventListener(
                "click",
                startGame
            );


        document
            .querySelector(
                "#dropDuelRestartButton"
            )
            ?.addEventListener(
                "click",
                startGame
            );


        initialized = true;

    }


    difficultyButtons
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.difficulty ===
                difficulty
            );

        });


    startGame();

}


/* =========================================================
   DROP DUEL STOPPEN
   ========================================================= */

export function stopDropDuel() {

    running = false;

    thinking = false;

}
