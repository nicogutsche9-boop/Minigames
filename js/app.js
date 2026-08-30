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
    updateArcadeProfileUI
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
   PROFIL UI
   ========================================================= */

function updateProfileUI() {

    const profile =
        getArcadeProfile();

    const levelData =
        getLevelData();


    /* -----------------------------------------
       PROFIL-SYSTEM SELBST AKTUALISIEREN
       ----------------------------------------- */

    updateArcadeProfileUI();


    /* -----------------------------------------
       COINS
       ----------------------------------------- */

    if (coinCount) {

        /*
           Dein aktuelles Profil-System
           besitzt momentan keine Coins.
           Deshalb nur anzeigen, wenn
           ein solcher Wert vorhanden ist.
        */

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
        Math.min(
            100,
            (
                levelData.currentXP /
                levelData.requiredXP
            ) * 100
        );


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
   HIGHSCORES
   ========================================================= */

function updateHighscores(
    profile
) {

    const games =
        profile.games || {};


    const gameNames = {

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


    Object.entries(
        gameNames
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


    /*
       Dein bestehendes HTML besitzt
       zusätzlich #storedHighscore.
    */

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
            Math.min(
                100,
                (
                    levelData.currentXP /
                    levelData.requiredXP
                ) * 100
            );


        profileXpBar.style.width =
            `${percentage}%`;

    }


    /*
       Achievement- und Challenge-System
       gehört momentan nicht zum aktuellen
       profile.js.

       Deshalb wird hier bewusst nichts
       erfunden oder doppelt gespeichert.
    */

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


    switch (
        game
    ) {

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


            /*
               WICHTIG:

               Memory registriert Start und
               Ergebnis momentan selbst.

               Daher machen wir hier
               KEINE zusätzliche
               Profilregistrierung.
            */

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


            /*
               Drop Duel registriert
               momentan selbst.

               Deshalb hier ebenfalls
               keine doppelte Registrierung.
            */

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

}


/* =========================================================
   SCORE-SPIELE
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
       haben kein Win/Loss-System.

       "loss" bedeutet hier lediglich:
       Die Runde ist beendet.

       Das Profil-System bekommt dadurch
       den Score und XP.
    */

    /*
       WICHTIG:

       Wir importieren hier NICHT
       registerGameResult(), weil wir
       aktuell nur app.js anpassen.

       Das würde sonst mit den bestehenden
       Game-Dateien nicht konsistent sein.

       Deshalb wird das Ergebnis über
       ein CustomEvent an das Profil-System
       weitergegeben, sofern eine spätere
       Game-Datei dies unterstützt.
    */

    document.dispatchEvent(
        new CustomEvent(
            "arcadeGameOver",
            {
                detail: {
                    game,
                    score:
                        numericScore
                }
            }
        )
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


    const gameNames = {

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


    const gameName =
        gameNames[game];


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

            highscoreMessage.classList.remove(
                "hidden"
            );

        }
        else {

            highscoreMessage.textContent =
                `BESTER SCORE: ${best}`;

            highscoreMessage.classList.remove(
                "hidden"
            );

        }

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
            Number(
                event.detail?.score || 0
            );


        lastGame =
            "memory";

        lastScore =
            score;


        /*
           Memory hat das Ergebnis
           bereits selbst registriert.

           Deshalb hier NICHT noch einmal
           registerGameResult() aufrufen.
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
