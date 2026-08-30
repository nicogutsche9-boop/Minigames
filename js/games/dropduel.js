const ROWS = 6;
const COLS = 7;

const HUMAN = "human";
const CPU = "cpu";

let board = [];
let running = false;
let thinking = false;

let playerWins = 0;
let cpuWins = 0;

let initialized = false;

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


function createBoard() {

    return Array.from(
        { length: ROWS },
        () => Array(COLS).fill(null)
    );

}


function getPlayableColumns() {

    return Array.from(
        { length: COLS },
        (_, column) => column
    ).filter(
        column => board[0][column] === null
    );

}


function getOpenRow(column) {

    for (
        let row = ROWS - 1;
        row >= 0;
        row--
    ) {

        if (board[row][column] === null) {
            return row;
        }

    }

    return -1;

}


function placePiece(column, player) {

    const row = getOpenRow(column);

    if (row === -1) {
        return -1;
    }

    board[row][column] = player;

    return row;

}


function renderBoard() {

    boardElement.innerHTML = "";

    for (let row = 0; row < ROWS; row++) {

        for (let column = 0; column < COLS; column++) {

            const cell =
                document.createElement("button");

            cell.type = "button";

            cell.className =
                "dropduel-cell";

            cell.dataset.column = column;

            const value =
                board[row][column];

            if (value) {

                cell.classList.add(value);

                cell.innerHTML =
                    `<span class="dropduel-disc"></span>`;

            }

            cell.addEventListener(
                "click",
                () => playColumn(column)
            );

            boardElement.appendChild(cell);

        }

    }

    updateColumnButtons();

}


function createColumnButtons() {

    columnsElement.innerHTML = "";

    for (
        let column = 0;
        column < COLS;
        column++
    ) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.textContent =
            column + 1;

        button.dataset.column =
            column;

        button.addEventListener(
            "click",
            () => playColumn(column)
        );

        columnsElement.appendChild(button);

    }

}


function updateColumnButtons() {

    const playable =
        new Set(getPlayableColumns());

    columnsElement
        .querySelectorAll("button")
        .forEach(button => {

            const column =
                Number(button.dataset.column);

            button.disabled =
                !running ||
                thinking ||
                !playable.has(column);

        });

}


function setTurn(text) {

    turnElement.textContent = text;

}


function updateScore() {

    playerWinsElement.textContent =
        playerWins;

    cpuWinsElement.textContent =
        cpuWins;

}


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
                board[row][column] !== player
            ) {
                continue;
            }

            for (
                const [rowDirection, columnDirection]
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
                        rowDirection * step;

                    const nextColumn =
                        column +
                        columnDirection * step;

                    if (
                        nextRow < 0 ||
                        nextRow >= ROWS ||
                        nextColumn < 0 ||
                        nextColumn >= COLS ||
                        board[nextRow][nextColumn] !== player
                    ) {
                        break;
                    }

                    count++;

                }

                if (count >= 4) {
                    return true;
                }

            }

        }

    }

    return false;

}


function isBoardFull() {

    return getPlayableColumns().length === 0;

}


function wouldWin(player, column) {

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


function chooseComputerMove() {

    const playable =
        getPlayableColumns();

    if (!playable.length) {
        return -1;
    }

    for (const column of playable) {

        if (
            wouldWin(CPU, column)
        ) {
            return column;
        }

    }

    for (const column of playable) {

        if (
            wouldWin(HUMAN, column)
        ) {
            return column;
        }

    }

    const preference = [
        3,
        2,
        4,
        1,
        5,
        0,
        6
    ];

    const preferred =
        preference.filter(
            column =>
                playable.includes(column)
        );

    return preferred[0];

}


function finishGame(winner) {

    running = false;
    thinking = false;

    if (winner === HUMAN) {

        playerWins++;

        resultTitle.textContent =
            "🎉 GEWONNEN!";

        resultText.textContent =
            "Vier Steine in einer Reihe!";

        setTurn("SIEG!");

    }

    else if (winner === CPU) {

        cpuWins++;

        resultTitle.textContent =
            "🤖 VERLOREN";

        resultText.textContent =
            "Der Computer hat gewonnen.";

        setTurn("NIEDERLAGE");

    }

    else {

        resultTitle.textContent =
            "🤝 UNENTSCHIEDEN";

        resultText.textContent =
            "Das Spielfeld ist voll.";

        setTurn("DRAW");

    }

    updateScore();

    gameOver.classList.remove(
        "hidden"
    );

    updateColumnButtons();

}


function playColumn(column) {

    if (
        !running ||
        thinking ||
        getOpenRow(column) === -1
    ) {
        return;
    }

    placePiece(
        column,
        HUMAN
    );

    renderBoard();

    if (checkWin(HUMAN)) {

        finishGame(HUMAN);

        return;

    }

    if (isBoardFull()) {

        finishGame(null);

        return;

    }

    thinking = true;

    setTurn(
        "COMPUTER DENKT …"
    );

    updateColumnButtons();

    setTimeout(() => {

        if (!running) {
            return;
        }

        const column =
            chooseComputerMove();

        if (column >= 0) {

            placePiece(
                column,
                CPU
            );

        }

        renderBoard();

        if (checkWin(CPU)) {

            finishGame(CPU);

            return;

        }

        if (isBoardFull()) {

            finishGame(null);

            return;

        }

        thinking = false;

        setTurn(
            "DEIN ZUG"
        );

        updateColumnButtons();

    }, 450);

}


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


export function initDropDuel() {

    if (!initialized) {

        createColumnButtons();

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

    startGame();

}


export function stopDropDuel() {

    running = false;
    thinking = false;

}
