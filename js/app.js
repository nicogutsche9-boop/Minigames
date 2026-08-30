/* =========================================================
   MINI ARCADE
   ZENTRALE APP-STEUERUNG
   ========================================================= */


/* =========================================================
   PROFIL-SYSTEM
   ========================================================= */

import {
    getArcadeProfile,
    getLevelData,
    updateArcadeProfileUI,
    registerGameStart,
    registerGameResult
} from "./arcade/profile.js";


/* =========================================================
   GAME MODULES
   ========================================================= */

import {
    initReactionGame,
    stopReactionGame
} from "./games/reaction.js";

import {
    initMemory,
    stopMemory
} from "./games/memory.js";

import {
    initSnakeGame,
    stopSnakeGame
} from "./games/snake.js";

import {
    initBlockRush,
    stopBlockRush
} from "./games/blockrush.js";

import {
    initDropDuel,
    stopDropDuel
} from "./games/dropduel.js";


/* =========================================================
   STATE
   ========================================================= */

let currentScreen = "menuScreen";

let currentGame = null;

let lastGame = null;

let lastScore = 0;

let initialized = false;


/* =========================================================
   SCREENS
   ========================================================= */

const screens =
    document.querySelectorAll(
        ".screen"
    );


/* =========================================================
   PROFIL ELEMENTE
   ========================================================= */

const coinCount =
    document.querySelector(
        "#coinCount"
    );

const levelValue =
    document.querySelector(
        "#levelValue"
    );

const xpValue =
    document.querySelector(
        "#xpValue"
    );

const xpBar =
    document.querySelector(
        "#xpBar"
    );

const arcadeLevel =
    document.querySelector(
        "#arcadeLevel"
    );

const arcadeXP =
    document.querySelector(
        "#arcadeXP"
    );

const arcadeXPProgress =
    document.querySelector(
        "#arcadeXPProgress"
    );

const arcadeTotalGames =
    document.querySelector(
        "#arcadeTotalGames"
    );

const arcadeTotalWins =
    document.querySelector(
        "#arcadeTotalWins"
    );

const arcadeBestScore =
    document.querySelector(
        "#arcadeBestScore"
    );


/* =========================================================
   SCREEN WECHSELN
   ========================================================= */

function showScreen(screenId) {

    screens.forEach(screen => {

        screen.classList.toggle(
            "active",
            screen.id === screenId
        );

    });


    currentScreen = screenId;

}


/* =========================================================
   SPIELNAMEN
   ========================================================= */

const GAME_NAMES = {

    reaction:
        "Reaction",

    memory:
        "Memory",

    snake:
        "Neon Serpent",

    blockrush:
        "Block Rush",

    dropduel:
        "Drop Duel"

};


/* =========================================================
   SPIEL STOPPEN
   ========================================================= */

function stopCurrentGame() {

    if (!currentGame) {
        return;
    }


    switch (currentGame) {

        case "reaction":

            if (
                typeof stopReactionGame ===
                "function"
            ) {

                stopReactionGame();

            }

            break;


        case "memory":

            if (
                typeof stopMemory ===
                "function"
            ) {

                stopMemory();

            }

            break;


        case "snake":

            if (
                typeof stopSnakeGame ===
                "function"
            ) {

                stopSnakeGame();

            }

            break;


        case "blockrush":

            if (
                typeof stopBlockRush ===
                "function"
            ) {

                stopBlockRush();

            }

            break;


        case "dropduel":

            if (
                typeof stopDropDuel ===
                "function"
            ) {

                stopDropDuel();

            }

            break;

    }


    currentGame = null;

}


/* =========================================================
   PROFIL UI
   ========================================================= */

function updateProfileUI() {

    const profile =
        getArcadeProfile();

    const levelData =
        getLevelData();


    /*
       Zentrales Profil-System
       aktualisieren.
    */

    updateArcadeProfileUI();


    /* -----------------------------------------
       COINS
       ----------------------------------------- */

    if (coinCount) {

        coinCount.textContent =
            Number(
                profile.coins || 0
            ).toLocaleString(
                "de-DE"
            );

    }


    /* -----------------------------------------
       LEVEL
       ----------------------------------------- */

    if (levelValue) {

        levelValue.textContent =
            levelData.level;

    }


    if (arcadeLevel) {

        arcadeLevel.textContent =
            levelData.level;

    }


    /* -----------------------------------------
       XP
       ----------------------------------------- */

    if (xpValue) {

        xpValue.textContent =
            `${levelData.currentXP}/${levelData.requiredXP} XP`;

    }


    if (arcadeXP) {

        arcadeXP.textContent =
            `${levelData.currentXP} / ${levelData.requiredXP} XP`;

    }


    /* -----------------------------------------
       XP BALKEN
       ----------------------------------------- */

    const percentage =
        levelData.requiredXP > 0
            ? Math.min(
                100,
                (
                    levelData.currentXP /
                    levelData.requiredXP
                ) * 100
            )
            : 0;


    if (xpBar) {

        xpBar.style.width =
            `${percentage}%`;

    }


    if (arcadeXPProgress) {

        arcadeXPProgress.style.width =
            `${percentage}%`;

    }


    /* -----------------------------------------
       MINI STATS
       ----------------------------------------- */

    if (arcadeTotalGames) {

        arcadeTotalGames.textContent =
            profile.totalGames || 0;

    }


    if (arcadeTotalWins) {

        arcadeTotalWins.textContent =
            profile.totalWins || 0;

    }


    if (arcadeBestScore) {

        arcadeBestScore.textContent =
            profile.bestScore || 0;

    }


    updateHighscores(
        profile
    );


    updateProfileScreen(
        profile,
        levelData
    );

}


/* =========================================================
   HIGHSCORES AKTUALISIEREN
   ========================================================= */

function updateHighscores(profile) {

    const games =
        profile.games || {};


    Object.entries(
        GAME_NAMES
    ).forEach(
        ([key, gameName]) => {

            const element =
                document.querySelector(
                    `#${key}Best`
                );


            if (!element) {
                return;
            }


            const game =
                games[gameName];


            element.textContent =
                game?.bestScore || 0;

        }
    );


    const stored =
        document.querySelector(
            "#storedHighscore"
        );


    if (stored) {

        stored.textContent =
            profile.bestScore || 0;

    }

}


/* =========================================================
   PROFIL-SEITE
   ========================================================= */

function updateProfileScreen(
    profile,
    levelData
) {

    const profileLevel =
        document.querySelector(
            "#profileLevel"
        );

    const profileCoins =
        document.querySelector(
            "#profileCoins"
        );

    const profileXp =
        document.querySelector(
            "#profileXp"
        );

    const profileXpBar =
        document.querySelector(
            "#profileXpBar"
        );


    /* -----------------------------------------
       LEVEL
       ----------------------------------------- */

    if (profileLevel) {

        profileLevel.textContent =
            levelData.level;

    }


    /* -----------------------------------------
       COINS
       ----------------------------------------- */

    if (profileCoins) {

        profileCoins.textContent =
            Number(
                profile.coins || 0
            ).toLocaleString(
                "de-DE"
            );

    }


    /* -----------------------------------------
       XP
       ----------------------------------------- */

    if (profileXp) {

        profileXp.textContent =
            `${levelData.currentXP}/${levelData.requiredXP}`;

    }


    if (profileXpBar) {

        const percentage =
            levelData.requiredXP > 0
                ? Math.min(
                    100,
                    (
                        levelData.currentXP /
                        levelData.requiredXP
                    ) * 100
                )
                : 0;


        profileXpBar.style.width =
            `${percentage}%`;

    }

}


/* =========================================================
   SPIELSTART REGISTRIEREN
   ========================================================= */

function registerStart(game) {

    const gameName =
        GAME_NAMES[game];


    if (!gameName) {
        return;
    }


    /*
       Memory und Drop Duel registrieren
       ihren Start teilweise selbst.

       Deshalb werden sie hier nicht
       zusätzlich registriert.
    */

    if (
        game === "memory" ||
        game === "dropduel"
    ) {

        return;

    }


    registerGameStart(
        gameName
    );

}


/* =========================================================
   SPIELERGEBNIS REGISTRIEREN
   ========================================================= */

function registerResult(
    game,
    result,
    score
) {

    const gameName =
        GAME_NAMES[game];


    if (!gameName) {
        return;
    }


    const numericScore =
        Math.max(
            0,
            Number(score) || 0
        );


    /*
       Memory und Drop Duel
       verwalten ihr Ergebnis selbst.
    */

    if (
        game === "memory" ||
        game === "dropduel"
    ) {

        return;

    }


    registerGameResult(
        gameName,
        result,
        numericScore
    );

}


/* =========================================================
   SPIEL STARTEN
   ========================================================= */

function startGame(game) {

    stopCurrentGame();


    currentGame =
        game;

    lastGame =
        game;

    lastScore =
        0;


    /*
       Spielstart im Profil registrieren.
    */

    registerStart(
        game
    );


    switch (game) {

        /* =====================================
           REACTION
           ===================================== */

        case "reaction":

            showScreen(
                "reactionScreen"
            );


            initReactionGame({

                onGameOver(score) {

                    handleScoreGameOver(
                        "reaction",
                        score
                    );

                }

            });

            break;


        /* =====================================
           MEMORY
           ===================================== */

        case "memory":

            showScreen(
                "memoryScreen"
            );


            initMemory();

            break;


        /* =====================================
           SNAKE
           ===================================== */

        case "snake":

            showScreen(
                "snakeScreen"
            );


            initSnakeGame({

                onGameOver(score) {

                    handleScoreGameOver(
                        "snake",
                        score
                    );

                }

            });

            break;


        /* =====================================
           BLOCK RUSH
           ===================================== */

        case "blockrush":

            showScreen(
                "blockRushScreen"
            );


            initBlockRush({

                onGameOver(score) {

                    handleScoreGameOver(
                        "blockrush",
                        score
                    );

                }

            });

            break;


        /* =====================================
           DROP DUEL
           ===================================== */

        case "dropduel":

            showScreen(
                "dropDuelScreen"
            );


            initDropDuel();

            break;


        /* =====================================
           UNBEKANNT
           ===================================== */

        default:

            currentGame =
                null;

            showScreen(
                "menuScreen"
            );

            break;

    }


    updateProfileUI();

}


/* =========================================================
   SCORE-SPIELE GAME OVER
   ========================================================= */

function handleScoreGameOver(
    game,
    score
) {

    const numericScore =
        Math.max(
            0,
            Number(score) || 0
        );


    lastGame =
        game;

    lastScore =
        numericScore;


    /*
       Reaction, Snake und Block Rush
       sind reine Score-Spiele.

       Eine beendete Runde wird deshalb
       als "loss" registriert.

       Das bedeutet hier NICHT,
       dass der Spieler schlecht gespielt hat.
       Es ist lediglich das Ergebnisformat
       unseres Profil-Systems.
    */

    registerResult(
        game,
        "loss",
        numericScore
    );


    showGenericGameOver(
        game,
        numericScore
    );


    updateProfileUI();

}


/* =========================================================
   GAME OVER ANZEIGE
   ========================================================= */

function showGenericGameOver(
    game,
    score
) {

    const finalScore =
        document.querySelector(
            "#finalScore"
        );

    const highscoreMessage =
        document.querySelector(
            "#highscoreMessage"
        );

    const rewardMessage =
        document.querySelector(
            "#rewardMessage"
        );

    const achievementReward =
        document.querySelector(
            "#achievementReward"
        );


    if (finalScore) {

        finalScore.textContent =
            score;

    }


    const profile =
        getArcadeProfile();


    const gameName =
        GAME_NAMES[game];


    const gameData =
        profile.games?.[
            gameName
        ];


    const best =
        gameData?.bestScore || 0;


    /*
       Prüfen, ob der Score ein
       neuer Highscore ist.

       Da registerGameResult()
       bereits gespeichert wurde,
       ist ein neuer Highscore dann
       gleich dem aktuellen bestScore.
    */

    const isHighscore =
        score > 0 &&
        score >= best;


    if (highscoreMessage) {

        if (isHighscore) {

            highscoreMessage.textContent =
                "★ NEUER HIGHSCORE! ★";

        }
        else {

            highscoreMessage.textContent =
                `BESTER SCORE: ${best}`;

        }


        highscoreMessage.classList.remove(
            "hidden"
        );

    }


    if (rewardMessage) {

        rewardMessage.textContent =
            "";

    }


    if (achievementReward) {

        achievementReward.textContent =
            "";

    }


    showScreen(
        "gameOverScreen"
    );

}


/* =========================================================
   MEMORY GAME OVER
   ========================================================= */

document.addEventListener(
    "memoryGameOver",
    event => {

        const score =
            Math.max(
                0,
                Number(
                    event.detail?.score || 0
                )
            );


        lastGame =
            "memory";

        lastScore =
            score;


        /*
           Memory registriert sein Ergebnis
           bereits selbst.
        */

        updateProfileUI();


        showGenericGameOver(
            "memory",
            score
        );

    }
);


/* =========================================================
   MEMORY → MENÜ
   ========================================================= */

document.addEventListener(
    "memoryMenu",
    () => {

        stopCurrentGame();


        updateProfileUI();


        showScreen(
            "menuScreen"
        );

    }
);


/* =========================================================
   GAME CARDS
   ========================================================= */

function initGameCards() {

    document
        .querySelectorAll(
            ".game-card[data-game]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const game =
                            button.dataset.game;


                        if (!game) {
                            return;
                        }


                        startGame(
                            game
                        );

                    }
                );

            }
        );

}


/* =========================================================
   MENÜ BUTTONS
   ========================================================= */

function initMenuButtons() {

    /* -----------------------------------------
       HIGHSCORES
       ----------------------------------------- */

    document
        .querySelector(
            "#highscoreButton"
        )
        ?.addEventListener(
            "click",
            () => {

                stopCurrentGame();


                updateProfileUI();


                showScreen(
                    "highscoreScreen"
                );

            }
        );


    /* -----------------------------------------
       MEINE SPIELE / PROFIL
       ----------------------------------------- */

    document
        .querySelector(
            "#myGamesButton"
        )
        ?.addEventListener(
            "click",
            () => {

                stopCurrentGame();


                updateProfileUI();


                showScreen(
                    "profileScreen"
                );

            }
        );


    /* -----------------------------------------
       EINSTELLUNGEN
       ----------------------------------------- */

    document
        .querySelector(
            "#settingsButton"
        )
        ?.addEventListener(
            "click",
            () => {

                stopCurrentGame();


                showScreen(
                    "settingsScreen"
                );

            }
        );

}


/* =========================================================
   BACK BUTTONS
   ========================================================= */

function initBackButtons() {

    const selectors = [

        "#reactionMenuButton",

        "#memoryMenuButton",

        "#snakeMenuButton",

        "#blockRushMenuButton",

        "#dropDuelMenuButton",

        "#profileBackButton",

        "#highscoreBackButton",

        "#settingsBackButton"

    ];


    selectors.forEach(
        selector => {

            document
                .querySelector(
                    selector
                )
                ?.addEventListener(
                    "click",
                    () => {

                        stopCurrentGame();


                        updateProfileUI();


                        showScreen(
                            "menuScreen"
                        );

                    }
                );

        }
    );

}


/* =========================================================
   GAME OVER BUTTONS
   ========================================================= */

function initGameOverButtons() {

    /* -----------------------------------------
       NOCHMAL SPIELEN
       ----------------------------------------- */

    document
        .querySelector(
            "#playAgainButton"
        )
        ?.addEventListener(
            "click",
            () => {

                if (!lastGame) {

                    showScreen(
                        "menuScreen"
                    );

                    return;

                }


                startGame(
                    lastGame
                );

            }
        );


    /* -----------------------------------------
       ZUM MENÜ
       ----------------------------------------- */

    document
        .querySelector(
            "#gameOverMenuButton"
        )
        ?.addEventListener(
            "click",
            () => {

                stopCurrentGame();


                updateProfileUI();


                showScreen(
                    "menuScreen"
                );

            }
        );

}


/* =========================================================
   SOUND
   ========================================================= */

function initSoundSettings() {

    const soundToggle =
        document.querySelector(
            "#soundToggle"
        );


    if (!soundToggle) {
        return;
    }


    const saved =
        localStorage.getItem(
            "miniArcadeSound"
        );


    if (saved !== null) {

        soundToggle.checked =
            saved === "true";

    }


    soundToggle.addEventListener(
        "change",
        () => {

            localStorage.setItem(
                "miniArcadeSound",
                String(
                    soundToggle.checked
                )
            );

        }
    );

}


/* =========================================================
   PROFIL RESET
   ========================================================= */

function initProfileReset() {

    document
        .querySelector(
            "#resetProfileButton"
        )
        ?.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Möchtest du dein Arcade-Profil wirklich zurücksetzen?"
                    );


                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    "miniArcadeProfile"
                );


                window.location.reload();

            }
        );

}


/* =========================================================
   HIGHSCORE RESET
   ========================================================= */

function initHighscoreReset() {

    document
        .querySelector(
            "#resetScoreButton"
        )
        ?.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Möchtest du dein komplettes Arcade-Profil und damit auch die gespeicherten Scores zurücksetzen?"
                    );


                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    "miniArcadeProfile"
                );


                window.location.reload();

            }
        );

}


/* =========================================================
   ESC → MENÜ
   ========================================================= */

function initKeyboardNavigation() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {

                return;

            }


            if (
                currentScreen ===
                "menuScreen"
            ) {

                return;

            }


            stopCurrentGame();


            updateProfileUI();


            showScreen(
                "menuScreen"
            );

        }
    );

}


/* =========================================================
   APP INITIALISIEREN
   ========================================================= */

function initApp() {

    if (initialized) {
        return;
    }


    initialized =
        true;


    initGameCards();

    initMenuButtons();

    initBackButtons();

    initGameOverButtons();

    initSoundSettings();

    initProfileReset();

    initHighscoreReset();

    initKeyboardNavigation();


    /*
       Profil direkt beim Laden
       aktualisieren.
    */

    updateProfileUI();


    showScreen(
        "menuScreen"
    );

}


/* =========================================================
   START
   ========================================================= */

initApp();
