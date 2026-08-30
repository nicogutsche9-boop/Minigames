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
   GAME-NAMEN
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

function showScreen(
    screenId
) {

    screens.forEach(
        screen => {

            screen.classList.toggle(
                "active",
                screen.id === screenId
            );

        }
    );


    currentScreen =
        screenId;

}


/* =========================================================
   SPIEL STOPPEN
   ========================================================= */

function stopCurrentGame() {

    if (!currentGame) {
        return;
    }


    switch (
        currentGame
    ) {

        case "reaction":

            stopReactionGame?.();

            break;


        case "memory":

            stopMemory?.();

            break;


        case "snake":

            stopSnakeGame?.();

            break;


        case "blockrush":

            stopBlockRush?.();

            break;


        case "dropduel":

            stopDropDuel?.();

            break;

    }


    currentGame =
        null;

}


/* =========================================================
   PROFIL UI AKTUALISIEREN
   ========================================================= */

function updateProfileUI() {

    const profile =
        getArcadeProfile();

    const levelData =
        getLevelData();


    /*
       Das eigentliche Profil-System
       aktualisiert seine eigenen Elemente.
    */

    updateArcadeProfileUI();


    /* =====================================================
       COINS
       ===================================================== */

    if (coinCount) {

        coinCount.textContent =
            Number(
                profile.coins || 0
            ).toLocaleString(
                "de-DE"
            );

    }


    /* =====================================================
       LEVEL
       ===================================================== */

    if (levelValue) {

        levelValue.textContent =
            levelData.level;

    }


    if (arcadeLevel) {

        arcadeLevel.textContent =
            levelData.level;

    }


    /* =====================================================
       XP
       ===================================================== */

    if (xpValue) {

        xpValue.textContent =
            `${levelData.currentXP}/${levelData.requiredXP} XP`;

    }


    if (arcadeXP) {

        arcadeXP.textContent =
            `${levelData.currentXP} / ${levelData.requiredXP} XP`;

    }


    /* =====================================================
       XP BALKEN
       ===================================================== */

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


    /* =====================================================
       STATS
       ===================================================== */

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
   HIGHSCORES
   ========================================================= */

function updateHighscores(
    profile
) {

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


    /* =====================================================
       LEVEL
       ===================================================== */

    if (profileLevel) {

        profileLevel.textContent =
            levelData.level;

    }


    /* =====================================================
       COINS
       ===================================================== */

    if (profileCoins) {

        profileCoins.textContent =
            Number(
                profile.coins || 0
            ).toLocaleString(
                "de-DE"
            );

    }


    /* =====================================================
       XP
       ===================================================== */

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
   SPIEL GESTARTET
   ========================================================= */

function registerStart(
    game
) {

    const gameName =
        GAME_NAMES[game];


    if (!gameName) {
        return;
    }


    registerGameStart(
        gameName
    );


    updateProfileUI();

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


    registerGameResult(
        gameName,
        result,
        numericScore
    );


    updateProfileUI();

}


/* =========================================================
   SPIEL STARTEN
   ========================================================= */

function startGame(
    game
) {

    stopCurrentGame();


    currentGame =
        game;

    lastGame =
        game;

    lastScore =
        0;


    switch (
        game
    ) {

        /* =================================================
           REACTION
           ================================================= */

        case "reaction":

            showScreen(
                "reactionScreen"
            );


            registerStart(
                "reaction"
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


        /* =================================================
           MEMORY
           ================================================= */

        case "memory":

            showScreen(
                "memoryScreen"
            );


            /*
               Memory besitzt bereits seine eigene
               Profil-Logik.

               Deshalb hier KEIN
               registerGameStart().
            */

            initMemory();

            break;


        /* =================================================
           SNAKE
           ================================================= */

        case "snake":

            showScreen(
                "snakeScreen"
            );


            registerStart(
                "snake"
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


        /* =================================================
           BLOCK RUSH
           ================================================= */

        case "blockrush":

            showScreen(
                "blockRushScreen"
            );


            registerStart(
                "blockrush"
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


        /* =================================================
           DROP DUEL
           ================================================= */

        case "dropduel":

            showScreen(
                "dropDuelScreen"
            );


            /*
               Drop Duel besitzt momentan seine
               eigene Ergebnislogik.

               Deshalb hier kein doppeltes
               Profil-Ergebnis.
            */

            initDropDuel({

                onGameOver(score) {

                    handleDropDuelGameOver(
                        score
                    );

                }

            });

            break;


        /* =================================================
           UNBEKANNT
           ================================================= */

        default:

            currentGame =
                null;

            showScreen(
                "menuScreen"
            );

            break;

    }

}


/* =========================================================
   REACTION / SNAKE / BLOCK RUSH GAME OVER
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
       Diese Spiele haben kein klassisches
       Win/Loss-System.

       Eine beendete Runde wird deshalb
       als "loss" gewertet.

       registerGameResult() übernimmt:
       - Score
       - Highscore
       - XP
       - totalLosses
       - game.totalXP
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

}


/* =========================================================
   DROP DUEL GAME OVER
   ========================================================= */

function handleDropDuelGameOver(
    score
) {

    const numericScore =
        Math.max(
            0,
            Number(score) || 0
        );


    lastGame =
        "dropduel";

    lastScore =
        numericScore;


    showGenericGameOver(
        "dropduel",
        numericScore
    );

}


/* =========================================================
   GENERISCHES GAME OVER
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


    if (highscoreMessage) {

        if (
            score > 0 &&
            score >= best
        ) {

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


    updateProfileUI();


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

    /* =====================================================
       HIGHSCORES
       ===================================================== */

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


    /* =====================================================
       MEINE SPIELE / PROFIL
       ===================================================== */

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


    /* =====================================================
       EINSTELLUNGEN
       ===================================================== */

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

    /* =====================================================
       NOCHMAL SPIELEN
       ===================================================== */

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


    /* =====================================================
       ZUM MENÜ
       ===================================================== */

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
