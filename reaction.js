import {
    showScreen
} from "../menu.js";


let score = 0;
let timeLeft = 30;

let timer = null;
let gameRunning = false;


export function initReactionGame() {

    const startButton =
        document.getElementById(
            "reaction-start-button"
        );

    const target =
        document.getElementById(
            "reaction-target"
        );

    const menuButton =
        document.getElementById(
            "reaction-menu-button"
        );


    startButton.onclick = startGame;

    target.onclick = hitTarget;

    menuButton.onclick = leaveGame;


    resetGame();
}


/* ==================== */
/* START                 */
/* ==================== */

function startGame() {

    score = 0;
    timeLeft = 30;

    gameRunning = true;


    updateScore();
    updateTime();


    document
        .getElementById("reaction-start")
        .classList.add("hidden");


    const target =
        document.getElementById(
            "reaction-target"
        );

    target.classList.remove("hidden");


    moveTarget();


    timer = setInterval(() => {

        timeLeft--;

        updateTime();


        if (timeLeft <= 0) {
            endGame();
        }

    }, 1000);
}


/* ==================== */
/* TARGET TREFFEN        */
/* ==================== */

function hitTarget() {

    if (!gameRunning) {
        return;
    }


    score++;

    updateScore();

    moveTarget();
}


/* ==================== */
/* TARGET BEWEGEN        */
/* ==================== */

function moveTarget() {

    const gameArea =
        document.getElementById(
            "reaction-game"
        );

    const target =
        document.getElementById(
            "reaction-target"
        );


    const targetSize = 60;


    const maxX =
        gameArea.clientWidth - targetSize;

    const maxY =
        gameArea.clientHeight - targetSize;


    const x =
        Math.random() * maxX
        + targetSize / 2;

    const y =
        Math.random() * maxY
        + targetSize / 2;


    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
}


/* ==================== */
/* SCORE                 */
/* ==================== */

function updateScore() {

    document
        .getElementById("reaction-score")
        .textContent = score;
}


/* ==================== */
/* TIMER                 */
/* ==================== */

function updateTime() {

    document
        .getElementById("reaction-time")
        .textContent = timeLeft;
}


/* ==================== */
/* GAME OVER             */
/* ==================== */

function endGame() {

    gameRunning = false;


    clearInterval(timer);

    timer = null;


    document
        .getElementById("reaction-target")
        .classList.add("hidden");


    document
        .getElementById("final-score")
        .textContent = score;


    showScreen("game-over-screen");


    setupGameOverButtons();
}


/* ==================== */
/* GAME OVER BUTTONS     */
/* ==================== */

function setupGameOverButtons() {

    const playAgain =
        document.getElementById(
            "play-again-button"
        );

    const menuButton =
        document.getElementById(
            "game-over-menu-button"
        );


    playAgain.onclick = () => {

        showScreen("reaction-screen");

        initReactionGame();
    };


    menuButton.onclick = () => {

        showScreen("menu-screen");
    };
}


/* ==================== */
/* SPIEL VERLASSEN       */
/* ==================== */

function leaveGame() {

    clearInterval(timer);

    timer = null;

    gameRunning = false;


    showScreen("menu-screen");
}


/* ==================== */
/* RESET                 */
/* ==================== */

function resetGame() {

    clearInterval(timer);

    timer = null;

    score = 0;
    timeLeft = 30;

    gameRunning = false;


    updateScore();
    updateTime();


    document
        .getElementById("reaction-target")
        .classList.add("hidden");


    document
        .getElementById("reaction-start")
        .classList.remove("hidden");
}
