/* =========================================================
   MINI ARCADE
   ZENTRALE APP-STEUERUNG
   ========================================================= */

import {
    registerGameStart,
    registerGameResult,
    registerScore,
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
   HTML
   ========================================================= */

const screens =
    document.querySelectorAll(".screen");


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
   PROFIL
   ========================================================= */

function refreshProfileUI() {

    /*
       Das eigentliche Profil-System
       aktualisiert seine eigenen Arcade-Elemente.
    */

    updateArcadeProfileUI();


    /*
       Zusätzlich aktualisieren wir
       die älteren Elemente deiner
       bisherigen Startseite / Profilseite.
    */

    const profile =
        getArcadeProfile();

    const levelData =
        getLevelData();


    const coinCount =
        document.querySelector("#coinCount");

    const levelValue =
        document.querySelector("#levelValue");

    const xpValue =
        document.querySelector("#xpValue");

    const xpBar =
        document.querySelector("#xpBar");


    if (coinCount) {

        /*
           Dein aktuelles profile.js
           besitzt momentan keine Coins.
           Deshalb zeigen wir hier
           nur dann einen Wert an,
           wenn einer vorhanden ist.
        */

        coinCount.textContent =
            Number(profile.coins || 0)
                .toLocaleString("de-DE");

    }


    if (levelValue) {

        levelValue.textContent =
            levelData.level;

    }


    if (xpValue) {

        xpValue.textContent =
            `${levelData.currentXP} / ${levelData.requiredXP} XP`;

    }


    if (xpBar) {

        const percentage =
            Math.min(
                100,
                (
                    levelData.currentXP /
                    levelData.requiredXP
                ) * 100
            );

        xpBar.style.width =
            `${percentage}%`;

    }


    updateHighscores(profile);

    updateProfileScreen(profile);

}


/* =========================================================
   HIGHSCORES
   ========================================================= */

function updateHighscores(profile) {

    const games =
        profile.games || {};


    const mapping = {

        reaction:
            "#reactionBest",

        memory:
            "#memoryBest",

        snake:
            "#snakeBest",

        blockrush:
            "#blockrushBest"

    };


    Object.entries(mapping)
        .forEach(([game, selector]) => {

            const element =
                document.querySelector(selector);

            if (!element) {
                return;
            }


            const gameData =
                games[game] || {};


            element.textContent =
                gameData.bestScore || 0;

        });


    const stored =
        document.querySelector(
            "#storedHighscore"
        );


    if (stored) {

        const scores =
            Object.values(games)
                .map(game => Number(game.bestScore || 0));


        stored.textContent =
            scores.length
                ? Math.max(...scores)
                : 0;

    }

}


/* =========================================================
   PROFIL-SEITE
   ========================================================= */

function updateProfileScreen(profile) {

    const levelData =
        getLevelData();


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


    if (profileLevel) {

        profileLevel.textContent =
            levelData.level;

    }


    if (profileCoins) {

        profileCoins.textContent =
            Number(profile.coins || 0)
                .toLocaleString("de-DE");

    }


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
       Das aktuelle profile.js besitzt
       keine Achievement-/Challenge-API.
       Daher versuchen wir hier nichts
       zu erfinden.
    */

}


/* =========================================================
   SPIEL STOPPEN
   ========================================================= */

function stopCurrentGame() {

    if (!currentGame) {
        return;
    }


    switch (currentGame) {

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


    currentGame = null;

}


/* =========================================================
   SPIEL START REGISTRIEREN
   ========================================================= */

function registerStart(game) {

    const names = {

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


    registerGameStart(
        names[game] || game
    );

}


/* =========================================================
   ERGEBNIS REGISTRIEREN
   ========================================================= */

function registerResult(
    game,
    result,
    score = 0
) {

    const names = {

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
        names[game] || game;


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
       Ergebnis im zentralen
       Profil-System speichern.
    */

    const xp =
        registerGameResult(
            gameName,
            result,
            numericScore
        );


    /*
       Best Score ebenfalls
       registrieren.
    */

    registerScore(
        gameName,
        numericScore
    );


    refreshProfileUI();


    return {
        score:
            numericScore,

        xp,
        result
    };

}


/* =========================================================
   GAME OVER ANZEIGE
   ========================================================= */

function showGameResult(
    game,
    result,
    score
) {

    const numericScore =
        Math.max(
            0,
            Number(score) || 0
        );


    const profile =
        getArcadeProfile();


    const gameNameMap = {

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
        gameNameMap[game] || game;


    const gameData =
        profile.games?.[gameName] || {};


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
            numericScore;

    }


    if (highscoreMessage) {

        const best =
            gameData.bestScore || 0;


        if (
            numericScore >= best &&
            numericScore > 0
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
            result === "win"
                ? "🎉 SIEG!"
                : result === "draw"
                    ? "🤝 UNENTSCHIEDEN"
                    : "💪 WEITER SO!";

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
   RESULTAT VON SPIELEN MIT SCORE
   ========================================================= */

function handleScoreGameOver(
    game,
    score
) {

    /*
       Reaction / Snake / Block Rush
       liefern nur einen Score.
       Diese Spiele haben kein eigenes
       Win/Loss-System.
    */

    registerResult(
        game,
        "loss",
        score
    );


    showGameResult(
        game,
        "loss",
        score
    );

}


/* =========================================================
   REACTION STARTEN
   ========================================================= */

function startReaction() {

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

}


/* =========================================================
   SNAKE STARTEN
   ========================================================= */

function startSnake() {

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

}


/* =========================================================
   BLOCK RUSH STARTEN
   ========================================================= */

function startBlockRush() {

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

}


/* =========================================================
   MEMORY
   ========================================================= */

function startMemory() {

    /*
       Memory registriert den Start
       bereits selbst.
    */

    initMemory();

}


/* =========================================================
   DROP DUEL
   ========================================================= */

function startDropDuel() {

    /*
       Drop Duel kümmert sich
       momentan selbst um das
       Spielergebnis.

       Deshalb registrieren wir
       hier NICHT noch einmal das
       Ergebnis.
    */

    initDropDuel();

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


    switch (game) {

        case "reaction":

            showScreen(
                "reactionScreen"
            );

            startReaction();

            break;


        case "memory":

            showScreen(
                "memoryScreen"
            );

            startMemory();

            break;


        case "snake":

            showScreen(
                "snakeScreen"
            );

            startSnake();

            break;


        case "blockrush":

            showScreen(
                "blockRushScreen"
            );

            startBlockRush();

            break;


        case "dropduel":

            showScreen(
                "dropDuelScreen"
            );

            startDropDuel();

            break;


        default:

            currentGame =
                null;

            showScreen(
                "menuScreen"
            );

    }

}


/* =========================================================
   MEMORY GAME OVER
   ========================================================= */

document.addEventListener(
    "memoryGameOver",
    event => {

        /*
           Memory registriert das Ergebnis
           bereits selbst.

           Wir zeigen hier nur die
           zentrale Game-Over-Seite.
        */

        const score =
            Number(
                event.detail?.score || 0
            );


        lastGame =
            "memory";

        lastScore =
            score;


        refreshProfileUI();


        showGameResult(
            "memory",
            "win",
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

        refreshProfileUI();

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
        .forEach(button => {

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

        });

}


/* =========================================================
   MENÜ BUTTONS
   ========================================================= */

function initMenuButtons() {

    /*
       HIGHSCORES
    */

    document
        .querySelector(
            "#highscoreButton"
        )
        ?.addEventListener(
            "click",
            () => {

                stopCurrentGame();

                refreshProfileUI();

                showScreen(
                    "highscoreScreen"
                );

            }
        );


    /*
       PROFIL / MEINE SPIELE
    */

    document
        .querySelector(
            "#myGamesButton"
        )
        ?.addEventListener(
            "click",
            () => {

                stopCurrentGame();

                refreshProfileUI();

                showScreen(
                    "profileScreen"
                );

            }
        );


    /*
       EINSTELLUNGEN
    */

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

        "#snakeMenuButton",

        "#blockRushMenuButton",

        "#dropDuelMenuButton",

        "#memoryMenuButton",

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

                        refreshProfileUI();

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

    /*
       NOCHMAL SPIELEN
    */

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


    /*
       ZUM MENÜ
    */

    document
        .querySelector(
            "#gameOverMenuButton"
        )
        ?.addEventListener(
            "click",
            () => {

                stopCurrentGame();

                refreshProfileUI();

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


    const soundButton =
        document.querySelector(
            "#soundButton"
        );


    /*
       Reaction verwendet
       miniArcadeSound.
    */

    let soundEnabled =
        localStorage.getItem(
            "miniArcadeSound"
        ) !== "false";


    if (soundToggle) {

        soundToggle.checked =
            soundEnabled;


        soundToggle.addEventListener(
            "change",
            () => {

                soundEnabled =
                    soundToggle.checked;


                localStorage.setItem(
                    "miniArcadeSound",
                    String(soundEnabled)
                );

            }
        );

    }


    /*
       Sound-Button im Reaction-Spiel.
       reaction.js verwaltet seinen
       eigenen Sound bereits.
    */

    if (soundButton) {

        soundButton.textContent =
            soundEnabled
                ? "🔊"
                : "🔇";

    }

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


                /*
                   Das aktuelle profile.js
                   stellt momentan keine
                   resetProfile()-Funktion bereit.

                   Deshalb löschen wir den
                   gespeicherten Profilstand
                   direkt über denselben Key.
                */

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

                window.alert(
                    "Die Highscores werden aktuell direkt im zentralen Profil-System verwaltet. Für einen separaten Highscore-Reset sollte profile.js um eine Reset-Funktion erweitert werden."
                );

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

            refreshProfileUI();

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

    initProfileReset();

    initHighscoreReset();

    initSoundSettings();

    initKeyboardNavigation();


    refreshProfileUI();


    showScreen(
        "menuScreen"
    );

}


/* =========================================================
   START
   ========================================================= */

initApp();
