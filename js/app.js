/* =========================================================
   MINI ARCADE
   app.js
   Zentrale Verbindung von Menü, Games und Profil
   ========================================================= */

import {
    registerGameStart,
    registerGameResult,
    getArcadeProfile,
    getLevelData,
    updateArcadeProfileUI
} from "./arcade/profile.js";

import {
    initReactionGame,
    stopReactionGame
} from "./games/reaction.js";

import {
    initMemoryGame,
    stopMemoryGame
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
   MINI ARCADE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HILFSFUNKTIONEN
       ===================================================== */

    const $ = (selector) =>
        document.querySelector(selector);

    const $$ = (selector) =>
        document.querySelectorAll(selector);


    function setText(selector, value) {

        const element = $(selector);

        if (element) {
            element.textContent = value;
        }

    }


    /* =====================================================
       AKTUELLES SPIEL
       ===================================================== */

    let currentScreen = "menuScreen";


    /* =====================================================
       PROFIL
       ===================================================== */

    function refreshProfile() {

        try {

            /*
             * Das eigentliche Profil-System bleibt
             * vollständig in profile.js.
             */

            const profile =
                getArcadeProfile();

            const levelData =
                getLevelData();

            /*
             * Falls profile.js die UI selbst
             * aktualisiert, lassen wir das zu.
             */

            if (
                typeof updateArcadeProfileUI ===
                "function"
            ) {

                updateArcadeProfileUI();

            }


            /*
             * Zusätzliche Werte für das aktuelle
             * Startseiten-HTML.
             */

            if (profile) {

                if (
                    profile.coins !== undefined
                ) {

                    setText(
                        "#coinCount",
                        Number(
                            profile.coins
                        ).toLocaleString("de-DE")
                    );

                }


                if (
                    profile.totalGames !== undefined
                ) {

                    setText(
                        "#arcadeTotalGames",
                        profile.totalGames
                    );

                    setText(
                        "#gamesPlayed",
                        profile.totalGames
                    );

                }


                if (
                    profile.totalWins !== undefined
                ) {

                    setText(
                        "#arcadeTotalWins",
                        profile.totalWins
                    );

                }


                if (
                    profile.bestScore !== undefined
                ) {

                    setText(
                        "#arcadeBestScore",
                        profile.bestScore
                    );

                }

            }


            /*
             * Level-Anzeige
             */

            if (levelData) {

                const level =
                    levelData.level ??
                    levelData.currentLevel ??
                    profile?.level ??
                    1;

                const currentXP =
                    levelData.xp ??
                    levelData.currentXP ??
                    profile?.xp ??
                    0;

                const requiredXP =
                    levelData.xpToNext ??
                    levelData.requiredXP ??
                    levelData.nextLevelXP ??
                    100;

                setText(
                    "#arcadeLevel",
                    level
                );

                setText(
                    "#levelValue",
                    level
                );

                setText(
                    "#arcadeXP",
                    `${currentXP} / ${requiredXP} XP`
                );

                setText(
                    "#xpValue",
                    `${currentXP}/${requiredXP} XP`
                );


                const percentage =
                    requiredXP > 0
                        ? Math.min(
                            100,
                            Math.max(
                                0,
                                (currentXP /
                                    requiredXP) *
                                    100
                            )
                        )
                        : 0;


                const progress =
                    $("#arcadeXPProgress");

                if (progress) {

                    progress.style.width =
                        `${percentage}%`;

                }


                const oldProgress =
                    $("#xpBar");

                if (oldProgress) {

                    oldProgress.style.width =
                        `${percentage}%`;

                }

            }

        } catch (error) {

            console.warn(
                "Profil konnte nicht aktualisiert werden:",
                error
            );

        }

    }


    /* =====================================================
       ERGEBNIS EINES SPIELS
       ===================================================== */

    function handleGameResult(
        game,
        score,
        result = "loss"
    ) {

        try {

            registerGameResult(
                game,
                result,
                Number(score) || 0
            );

        } catch (error) {

            console.error(
                `Fehler beim Speichern des Ergebnisses von ${game}:`,
                error
            );

        }


        /*
         * Profil sofort aktualisieren.
         */

        refreshProfile();


        /*
         * Kleine Ergebnisanzeige,
         * falls die allgemeine Game-Over-Seite
         * vorhanden ist.
         */

        showGameResult(
            game,
            Number(score) || 0,
            result
        );

    }


    /* =====================================================
       GAME-OVER-ANZEIGE
       ===================================================== */

    function showGameResult(
        game,
        score,
        result
    ) {

        const finalScore =
            $("#finalScore");

        const highscoreMessage =
            $("#highscoreMessage");

        const rewardMessage =
            $("#rewardMessage");

        if (finalScore) {

            finalScore.textContent =
                score;

        }


        if (highscoreMessage) {

            if (result === "win") {

                highscoreMessage.textContent =
                    "★ GEWONNEN! ★";

            }

            else if (result === "draw") {

                highscoreMessage.textContent =
                    "★ UNENTSCHIEDEN ★";

            }

            else {

                highscoreMessage.textContent =
                    "★ SPIEL BEENDET ★";

            }

        }


        if (rewardMessage) {

            rewardMessage.textContent =
                `${game} · Score ${score}`;

        }

    }


    /* =====================================================
       SPIEL STOPPEN
       ===================================================== */

    function stopAllGames() {

        try {
            stopReactionGame();
        } catch (_) {}

        try {
            stopMemoryGame();
        } catch (_) {}

        try {
            stopSnakeGame();
        } catch (_) {}

        try {
            stopBlockRush();
        } catch (_) {}

        try {
            stopDropDuel();
        } catch (_) {}

    }


    /* =====================================================
       SCREEN WECHSEL
       ===================================================== */

    function showScreen(
        screenId
    ) {

        if (!screenId) {
            return;
        }


        /*
         * Wenn wir das Spiel verlassen,
         * müssen laufende Game-Loops beendet werden.
         */

        if (
            screenId !== currentScreen
        ) {

            if (
                screenId === "menuScreen" ||
                screenId === "profileScreen" ||
                screenId === "highscoreScreen" ||
                screenId === "settingsScreen"
            ) {

                stopAllGames();

            }

        }


        $$(".screen")
            .forEach(screen => {

                screen.classList.remove(
                    "active"
                );

            });


        const target =
            document.getElementById(
                screenId
            );


        if (!target) {

            console.warn(
                `Screen "${screenId}" nicht gefunden.`
            );

            return;

        }


        target.classList.add(
            "active"
        );


        currentScreen =
            screenId;


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        /*
         * Profil beim Öffnen aktualisieren.
         */

        if (
            screenId === "profileScreen" ||
            screenId === "menuScreen" ||
            screenId === "highscoreScreen"
        ) {

            refreshProfile();

        }


        /*
         * Highscores aktualisieren.
         */

        if (
            screenId === "highscoreScreen"
        ) {

            updateHighscores();

        }

    }


    /* =====================================================
       SPIEL ÖFFNEN
       ===================================================== */

    function openGame(
        game
    ) {

        const normalized =
            String(game)
                .trim()
                .toLowerCase();


        /*
         * Vor dem Start anderes Spiel stoppen.
         */

        stopAllGames();


        switch (normalized) {

            case "reaction":

                showScreen(
                    "reactionScreen"
                );

                initReactionGame({

                    onGameOver(score) {

                        handleGameResult(
                            "Reaction",
                            score,
                            "loss"
                        );

                    }

                });

                break;


            case "memory":

                showScreen(
                    "memoryScreen"
                );

                initMemoryGame();

                /*
                 * Memory sendet in deiner aktuellen
                 * Version ein memoryGameOver Event.
                 */

                break;


            case "snake":
            case "neon serpent":
            case "neon-serpent":

                showScreen(
                    "snakeScreen"
                );

                initSnakeGame({

                    onGameOver(score) {

                        handleGameResult(
                            "Snake",
                            score,
                            "loss"
                        );

                    }

                });

                break;


            case "blockrush":
            case "block rush":
            case "block-rush":

                showScreen(
                    "blockRushScreen"
                );

                initBlockRush({

                    onGameOver(score) {

                        handleGameResult(
                            "Block Rush",
                            score,
                            "loss"
                        );

                    }

                });

                break;


            case "dropduel":
            case "drop duel":
            case "drop-duel":

                showScreen(
                    "dropDuelScreen"
                );

                initDropDuel({

                    onGameOver(
                        score,
                        result
                    ) {

                        handleGameResult(
                            "Drop Duel",
                            score,
                            result || "loss"
                        );

                    }

                });

                break;


            default:

                console.warn(
                    "Unbekanntes Spiel:",
                    game
                );

        }

    }


    /* =====================================================
       SPIELKARTEN
       ===================================================== */

    $$("[data-game]")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const game =
                        button.dataset.game;

                    openGame(game);

                }

            );

        });


    /* =====================================================
       HAUPT-SPIEL STARTEN
       ===================================================== */

    const mainPlay =
        $(
            "#mainPlayButton"
        );


    if (mainPlay) {

        mainPlay.addEventListener(
            "click",
            () => {

                /*
                 * Wenn ein letztes Spiel
                 * gespeichert ist, dieses öffnen.
                 */

                const profile =
                    getArcadeProfile();

                const lastGame =
                    profile?.currentGame ||
                    "Neon Serpent";


                openGame(
                    lastGame
                );

            }

        );

    }


    /* =====================================================
       ZUFÄLLIGES SPIEL
       ===================================================== */

    const randomButton =
        $(
            "#randomGameButton, #randomButton, [data-action='random-game']"
        );


    if (randomButton) {

        randomButton.addEventListener(
            "click",
            () => {

                const games = [
                    "Reaction",
                    "Memory",
                    "Neon Serpent",
                    "Block Rush",
                    "Drop Duel"
                ];


                const game =
                    games[
                        Math.floor(
                            Math.random() *
                            games.length
                        )
                    ];


                openGame(
                    game
                );

            }

        );

    }


    /* =====================================================
       PROFIL BUTTON
       ===================================================== */

    const profileButton =
        $(
            "#profileButton, [data-action='profile']"
        );


    if (profileButton) {

        profileButton.addEventListener(
            "click",
            () => {

                showScreen(
                    "profileScreen"
                );

            }

        );

    }


    /* =====================================================
       HIGHSCORES
       ===================================================== */

    const highscoreButton =
        $(
            "#highscoreButton, #leaderboardButton, [data-action='leaderboard']"
        );


    if (highscoreButton) {

        highscoreButton.addEventListener(
            "click",
            () => {

                showScreen(
                    "highscoreScreen"
                );

            }

        );

    }


    function updateHighscores() {

        let profile;

        try {

            profile =
                getArcadeProfile();

        } catch (_) {

            return;

        }


        if (!profile) {
            return;
        }


        const games =
            profile.games || {};


        const getBest =
            (...names) => {

                for (
                    const name of names
                ) {

                    const data =
                        games[name];

                    if (
                        data &&
                        data.bestScore !==
                        undefined
                    ) {

                        return data.bestScore;

                    }

                }

                return 0;

            };


        setText(
            "#reactionBest",
            getBest(
                "reaction",
                "Reaction"
            )
        );


        setText(
            "#memoryBest",
            getBest(
                "memory",
                "Memory"
            )
        );


        setText(
            "#snakeBest",
            getBest(
                "snake",
                "Snake",
                "serpent",
                "Neon Serpent"
            )
        );


        setText(
            "#blockrushBest",
            getBest(
                "blockrush",
                "Block Rush"
            )
        );


        /*
         * Alte/alternative IDs ebenfalls unterstützen.
         */

        setText(
            "#serpentBest",
            getBest(
                "snake",
                "Snake",
                "serpent",
                "Neon Serpent"
            )
        );


        setText(
            "#dropDuelBest",
            getBest(
                "dropduel",
                "Drop Duel"
            )
        );


        /*
         * Altes Feld.
         */

        setText(
            "#storedHighscore",
            Math.max(
                getBest("reaction", "Reaction"),
                getBest("memory", "Memory"),
                getBest(
                    "snake",
                    "Snake",
                    "serpent",
                    "Neon Serpent"
                ),
                getBest(
                    "blockrush",
                    "Block Rush"
                ),
                getBest(
                    "dropduel",
                    "Drop Duel"
                )
            )
        );

    }


    /* =====================================================
       ZURÜCK-BUTTONS
       ===================================================== */

    $$(
        ".back-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                showScreen(
                    "menuScreen"
                );

            }

        );

    });


    /* =====================================================
       SPEZIELLE MENÜ-BUTTONS
       ===================================================== */

    const gameOverMenu =
        $(
            "#gameOverMenuButton"
        );


    if (gameOverMenu) {

        gameOverMenu.addEventListener(
            "click",
            () => {

                showScreen(
                    "menuScreen"
                );

            }

        );

    }


    /* =====================================================
       GAME OVER → NOCHMAL
       ===================================================== */

    const playAgain =
        $(
            "#playAgainButton"
        );


    if (playAgain) {

        playAgain.addEventListener(
            "click",
            () => {

                const profile =
                    getArcadeProfile();

                const game =
                    profile?.currentGame ||
                    "Neon Serpent";


                openGame(
                    game
                );

            }

        );

    }


    /* =====================================================
       ESC = MENÜ
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                showScreen(
                    "menuScreen"
                );

            }

        }

    );


    /* =====================================================
       MEMORY GAME OVER EVENT
       ===================================================== */

    document.addEventListener(
        "memoryGameOver",
        event => {

            const detail =
                event.detail || {};


            const score =
                Number(
                    detail.score
                ) || 0;


            /*
             * Nur dann zentral verbuchen,
             * wenn Memory selbst nicht bereits
             * registerGameResult() aufruft.
             *
             * In deiner aktuellen Memory-Version
             * wird das Ergebnis bereits vom Game
             * registriert. Deshalb zeigen wir hier
             * nur die Profilanzeige neu an.
             */

            refreshProfile();


            showGameResult(
                "Memory",
                score,
                "win"
            );

        }

    );


    /* =====================================================
       PROFIL-RESET
       ===================================================== */

    const resetProfileButton =
        $(
            "#resetProfileButton"
        );


    if (resetProfileButton) {

        resetProfileButton.addEventListener(
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
                 * resetProfile ist absichtlich
                 * nicht Bestandteil dieses Controllers.
                 *
                 * profile.js soll die Datenhoheit
                 * behalten.
                 */

                localStorage.removeItem(
                    "miniArcadeProfile"
                );


                refreshProfile();

                updateHighscores();

                showNotification(
                    "♻️ Profil wurde zurückgesetzt."
                );

            }

        );

    }


    /* =====================================================
       SETTINGS
       ===================================================== */

    const settingsButton =
        $(
            "#settingsButton"
        );


    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            () => {

                showScreen(
                    "settingsScreen"
                );

            }

        );

    }


    const settingsBack =
        $(
            "#settingsBackButton"
        );


    if (settingsBack) {

        settingsBack.addEventListener(
            "click",
            () => {

                showScreen(
                    "menuScreen"
                );

            }

        );

    }


    /* =====================================================
       SOUND
       ===================================================== */

    const soundToggle =
        $(
            "#soundToggle"
        );


    if (soundToggle) {

        const savedSound =
            localStorage.getItem(
                "miniArcadeSound"
            );


        if (
            savedSound !== null
        ) {

            soundToggle.checked =
                savedSound !== "off";

        }


        soundToggle.addEventListener(
            "change",
            () => {

                localStorage.setItem(
                    "miniArcadeSound",
                    soundToggle.checked
                        ? "on"
                        : "off"
                );

            }

        );

    }


    /* =====================================================
       ALTER HIGH-SCORE RESET BUTTON
       ===================================================== */

    const resetScoreButton =
        $(
            "#resetScoreButton"
        );


    if (resetScoreButton) {

        resetScoreButton.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Möchtest du deine gespeicherten Spieldaten wirklich zurücksetzen?"
                    );


                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    "miniArcadeProfile"
                );


                refreshProfile();

                updateHighscores();


                showScreen(
                    "menuScreen"
                );

            }

        );

    }


    /* =====================================================
       BUTTON-CLICK-EFFEKT
       ===================================================== */

    function clickEffect(
        button
    ) {

        if (!button) {
            return;
        }


        button.classList.remove(
            "arcade-click"
        );


        void button.offsetWidth;


        button.classList.add(
            "arcade-click"
        );


        window.setTimeout(
            () => {

                button.classList.remove(
                    "arcade-click"
                );

            },
            180
        );

    }


    $$("button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    clickEffect(
                        button
                    );

                }

            );

        });


    /* =====================================================
       HOVER-EFFEKT
       ===================================================== */

    $$(
        ".game-card, .arcade-game-card, .arcade-menu-button"
    )
    .forEach(element => {

        element.addEventListener(
            "mouseenter",
            () => {

                element.classList.add(
                    "arcade-hover"
                );

            }

        );


        element.addEventListener(
            "mouseleave",
            () => {

                element.classList.remove(
                    "arcade-hover"
                );

            }

        );

    });


    /* =====================================================
       ARCADE-PROFIL INITIALISIEREN
       ===================================================== */

    try {

        if (
            typeof updateArcadeProfileUI ===
            "function"
        ) {

            updateArcadeProfileUI();

        }

    } catch (error) {

        console.warn(
            "Profil-UI konnte nicht initialisiert werden:",
            error
        );

    }


    /* =====================================================
       STARTZUSTAND
       ===================================================== */

    refreshProfile();

    updateHighscores();

    showScreen(
        "menuScreen"
    );


    /* =====================================================
       GLOBALER CONTROLLER
       ===================================================== */

    window.MiniArcade = {

        openGame,

        showScreen,

        refreshProfile,

        updateHighscores,

        handleGameResult

    };


    console.log(
        "🕹️ MINI ARCADE bereit."
    );

});
