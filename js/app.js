/* =========================================================
   MINI ARCADE - app.js
   Pixel Arcade Startseite
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SPIELERDATEN
       ===================================================== */

    const defaultPlayer = {
        coins: 1250,
        level: 12,
        xp: 60,
        xpMax: 100,

        gamesPlayed: 18,

        bestScores: {
            reaction: 120,
            memory: 960,
            serpent: 150,
            blockRush: 520,
            dropDuel: 8
        },

        currentGame: "Neon Serpent"
    };

    let player = loadPlayer();

    function loadPlayer() {
        try {
            const saved = localStorage.getItem("miniArcadePlayer");

            if (!saved) {
                return structuredClone(defaultPlayer);
            }

            const data = JSON.parse(saved);

            return {
                ...structuredClone(defaultPlayer),
                ...data,
                bestScores: {
                    ...defaultPlayer.bestScores,
                    ...(data.bestScores || {})
                }
            };

        } catch (error) {
            console.warn("Spielerdaten konnten nicht geladen werden.");
            return structuredClone(defaultPlayer);
        }
    }

    function savePlayer() {
        localStorage.setItem(
            "miniArcadePlayer",
            JSON.stringify(player)
        );
    }


    /* =====================================================
       HILFSFUNKTIONEN
       ===================================================== */

    function get(selector) {
        return document.querySelector(selector);
    }

    function getAll(selector) {
        return document.querySelectorAll(selector);
    }

    function setText(selector, value) {
        const element = get(selector);

        if (element) {
            element.textContent = value;
        }
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }


    /* =====================================================
       SPIELERANZEIGE AKTUALISIEREN
       ===================================================== */

    function updatePlayerUI() {

        setText("#coinCount", player.coins.toLocaleString("de-DE"));

        setText("#arcadeLevel", player.level);
        setText("#levelValue", player.level);

        setText(
            "#arcadeXp",
            `${player.xp} / ${player.xpMax} XP`
        );

        setText(
            "#arcadeXpValue",
            `${player.xp} / ${player.xpMax} XP`
        );

        const percentage =
            clamp(
                (player.xp / player.xpMax) * 100,
                0,
                100
            );

        const progressBars = [
            "#arcadeXpProgress",
            "#levelProgress",
            ".arcade-xp-progress"
        ];

        progressBars.forEach(selector => {

            getAll(selector).forEach(bar => {

                bar.style.width = `${percentage}%`;

            });

        });

        /* Statuswerte */

        setText(
            "#gamesPlayed",
            player.gamesPlayed
        );

        /* Best Scores */

        setText(
            "#reactionBest",
            player.bestScores.reaction
        );

        setText(
            "#memoryBest",
            player.bestScores.memory
        );

        setText(
            "#serpentBest",
            player.bestScores.serpent
        );

        setText(
            "#blockRushBest",
            player.bestScores.blockRush
        );

        setText(
            "#dropDuelBest",
            `${player.bestScores.dropDuel} Siege`
        );
    }


    /* =====================================================
       XP / LEVEL SYSTEM
       ===================================================== */

    function addXP(amount) {

        if (!amount || amount <= 0) {
            return;
        }

        player.xp += amount;

        let levelUp = false;

        while (player.xp >= player.xpMax) {

            player.xp -= player.xpMax;

            player.level++;

            /*
             * Für jedes neue Level wird die benötigte
             * XP-Menge etwas höher.
             */
            player.xpMax = Math.round(
                player.xpMax * 1.15
            );

            levelUp = true;
        }

        savePlayer();
        updatePlayerUI();

        if (levelUp) {
            showNotification(
                `⭐ LEVEL UP! Du bist jetzt Level ${player.level}!`
            );
        }
    }


    /* =====================================================
       COINS
       ===================================================== */

    function addCoins(amount) {

        if (!amount || amount <= 0) {
            return;
        }

        player.coins += amount;

        savePlayer();
        updatePlayerUI();

        showNotification(
            `🪙 +${amount} COINS`
        );
    }


    /* =====================================================
       NOTIFICATION
       ===================================================== */

    function showNotification(message) {

        const oldNotification =
            document.querySelector(".arcade-notification");

        if (oldNotification) {
            oldNotification.remove();
        }

        const notification =
            document.createElement("div");

        notification.className =
            "arcade-notification";

        notification.textContent = message;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add("show");
        });

        setTimeout(() => {

            notification.classList.remove("show");

            setTimeout(() => {
                notification.remove();
            }, 300);

        }, 2500);
    }


    /* =====================================================
       BUTTON CLICK EFFEKT
       ===================================================== */

    function arcadeClickEffect(button) {

        if (!button) {
            return;
        }

        button.classList.remove("arcade-click");

        /*
         * Reflow erzwingen, damit die Animation
         * bei jedem Klick erneut startet.
         */
        void button.offsetWidth;

        button.classList.add("arcade-click");

        setTimeout(() => {
            button.classList.remove("arcade-click");
        }, 180);
    }


    getAll("button").forEach(button => {

        button.addEventListener("click", () => {
            arcadeClickEffect(button);
        });

    });


    /* =====================================================
       SPIEL ÖFFNEN
       ===================================================== */

    function openGame(gameName) {

        if (!gameName) {
            return;
        }

        player.currentGame = gameName;

        savePlayer();

        /*
         * Falls du später echte Spielseiten hast,
         * kannst du hier die entsprechenden Dateien
         * eintragen.
         */

        const gameRoutes = {

            "Reaction":
                "games/reaction.html",

            "Memory":
                "games/memory.html",

            "Neon Serpent":
                "games/neon-serpent.html",

            "Block Rush":
                "games/block-rush.html",

            "Drop Duel":
                "games/drop-duel.html"
        };

        const route = gameRoutes[gameName];

        if (route) {

            /*
             * Nur navigieren, wenn die Spielseite
             * tatsächlich vorgesehen ist.
             */
            window.location.href = route;

        } else {

            showNotification(
                `🎮 ${gameName} wird geladen ...`
            );
        }
    }


    /* =====================================================
       HAUPT-SPIELEN BUTTON
       ===================================================== */

    const mainPlayButton =
        get("#mainPlayButton");

    if (mainPlayButton) {

        mainPlayButton.addEventListener(
            "click",
            () => {

                arcadeClickEffect(mainPlayButton);

                /*
                 * Standardmäßig wird das zuletzt
                 * gespielte Spiel fortgesetzt.
                 */
                openGame(
                    player.currentGame || "Neon Serpent"
                );
            }
        );
    }


    /* =====================================================
       FORTSETZEN - NEON SERPENT
       ===================================================== */

    const continueButtons = getAll(
        "#continueButton, .continue-button, [data-action='continue']"
    );

    continueButtons.forEach(button => {

        button.addEventListener("click", () => {

            arcadeClickEffect(button);

            openGame("Neon Serpent");

        });

    });


    /* =====================================================
       SPIELKARTEN
       ===================================================== */

    const gameButtons = getAll(
        "[data-game], .game-button, .arcade-game-button"
    );

    gameButtons.forEach(button => {

        button.addEventListener("click", event => {

            event.preventDefault();

            const gameName =
                button.dataset.game ||
                button.getAttribute("data-game-name") ||
                button.querySelector(
                    "[data-game-name]"
                )?.dataset.gameName;

            if (gameName) {
                openGame(gameName);
            }

        });

    });


    /* =====================================================
       FALLBACK: SPIELE ANHAND DES TEXTES ERKENNEN
       ===================================================== */

    const possibleGameButtons = getAll(
        ".arcade-menu-button, .arcade-game-card button, .game-card button"
    );

    possibleGameButtons.forEach(button => {

        if (
            button.hasAttribute("data-game") ||
            button.hasAttribute("data-game-name")
        ) {
            return;
        }

        const text =
            button.textContent
                .trim()
                .toLowerCase();

        let gameName = null;

        if (text.includes("reaction")) {
            gameName = "Reaction";
        }

        if (text.includes("memory")) {
            gameName = "Memory";
        }

        if (text.includes("serpent")) {
            gameName = "Neon Serpent";
        }

        if (text.includes("block")) {
            gameName = "Block Rush";
        }

        if (text.includes("drop")) {
            gameName = "Drop Duel";
        }

        if (!gameName) {
            return;
        }

        button.addEventListener("click", () => {
            openGame(gameName);
        });

    });


    /* =====================================================
       ZUFÄLLIGES SPIEL
       ===================================================== */

    const randomGameButton =
        get(
            "#randomGameButton, #randomButton, [data-action='random-game']"
        );

    if (randomGameButton) {

        randomGameButton.addEventListener(
            "click",
            () => {

                const games = [
                    "Reaction",
                    "Memory",
                    "Neon Serpent",
                    "Block Rush",
                    "Drop Duel"
                ];

                const random =
                    games[
                        Math.floor(
                            Math.random() * games.length
                        )
                    ];

                showNotification(
                    `🎲 Zufälliges Spiel: ${random}`
                );

                setTimeout(() => {
                    openGame(random);
                }, 500);

            }
        );
    }


    /* =====================================================
       EINSTELLUNGEN
       ===================================================== */

    const settingsButton =
        get("#settingsButton");

    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            () => {

                arcadeClickEffect(settingsButton);

                const settingsScreen =
                    get("#settingsScreen");

                if (settingsScreen) {

                    showScreen("settingsScreen");

                } else {

                    showNotification(
                        "⚙️ Einstellungen öffnen ..."
                    );
                }

            }
        );
    }


    /* =====================================================
       PROFIL
       ===================================================== */

    const profileButton =
        get(
            "#profileButton, [data-action='profile']"
        );

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            () => {

                showScreen("profileScreen");

            }
        );
    }


    /* =====================================================
       BESTENLISTE
       ===================================================== */

    const leaderboardButton =
        get(
            "#leaderboardButton, #highscoreButton, [data-action='leaderboard']"
        );

    if (leaderboardButton) {

        leaderboardButton.addEventListener(
            "click",
            () => {

                showScreen(
                    "leaderboardScreen"
                );

            }
        );
    }


    /* =====================================================
       SCREEN NAVIGATION
       ===================================================== */

    function showScreen(screenId) {

        const screens =
            getAll(".screen");

        screens.forEach(screen => {
            screen.classList.remove("active");
        });

        const target =
            document.getElementById(screenId);

        if (target) {
            target.classList.add("active");
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* =====================================================
       ZURÜCK BUTTONS
       ===================================================== */

    getAll(
        "[data-action='back'], .back-button"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showScreen("menuScreen");

            }
        );

    });


    /* =====================================================
       ESC = ZURÜCK ZUM MENÜ
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                showScreen("menuScreen");

            }

        }
    );


    /* =====================================================
       DAILY CHALLENGES
       ===================================================== */

    const dailyChallenges = {

        arcadeFan: {
            target: 3,
            reward: 100
        },

        pointsHunter: {
            target: 250,
            reward: 125
        },

        cardKing: {
            target: 1,
            reward: 75
        }
    };


    function getDailyDate() {

        const now = new Date();

        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
        ].join("-");

    }


    function loadDailyData() {

        const today =
            getDailyDate();

        const saved =
            localStorage.getItem(
                "miniArcadeDaily"
            );

        if (!saved) {

            const fresh = {
                date: today,
                arcadeFan: 0,
                pointsHunter: 0,
                cardKing: 0,
                claimed: []
            };

            localStorage.setItem(
                "miniArcadeDaily",
                JSON.stringify(fresh)
            );

            return fresh;
        }

        try {

            const data =
                JSON.parse(saved);

            if (data.date !== today) {

                const fresh = {
                    date: today,
                    arcadeFan: 0,
                    pointsHunter: 0,
                    cardKing: 0,
                    claimed: []
                };

                localStorage.setItem(
                    "miniArcadeDaily",
                    JSON.stringify(fresh)
                );

                return fresh;
            }

            return data;

        } catch {

            return {
                date: today,
                arcadeFan: 0,
                pointsHunter: 0,
                cardKing: 0,
                claimed: []
            };

        }
    }


    let daily = loadDailyData();


    function saveDaily() {

        localStorage.setItem(
            "miniArcadeDaily",
            JSON.stringify(daily)
        );

    }


    function updateDailyUI() {

        /*
         * Unterstützt mehrere mögliche IDs,
         * damit dein HTML flexibel bleibt.
         */

        setText(
            "#arcadeFanProgress",
            `${daily.arcadeFan} / ${dailyChallenges.arcadeFan.target}`
        );

        setText(
            "#pointsHunterProgress",
            `${daily.pointsHunter} / ${dailyChallenges.pointsHunter.target}`
        );

        setText(
            "#cardKingProgress",
            `${daily.cardKing} / ${dailyChallenges.cardKing.target}`
        );

        updateProgress(
            "#arcadeFanBar",
            daily.arcadeFan,
            dailyChallenges.arcadeFan.target
        );

        updateProgress(
            "#pointsHunterBar",
            daily.pointsHunter,
            dailyChallenges.pointsHunter.target
        );

        updateProgress(
            "#cardKingBar",
            daily.cardKing,
            dailyChallenges.cardKing.target
        );
    }


    function updateProgress(
        selector,
        current,
        target
    ) {

        const bar = get(selector);

        if (!bar) {
            return;
        }

        const percentage =
            clamp(
                (current / target) * 100,
                0,
                100
            );

        bar.style.width =
            `${percentage}%`;
    }


    /* =====================================================
       SPIEL BEENDET
       Kann auch von späteren Spielen benutzt werden.
       ===================================================== */

    window.arcadeGameFinished =
        function (
            gameName,
            score,
            xpReward = 10,
            coinReward = 0
        ) {

            player.gamesPlayed++;

            player.currentGame =
                gameName;

            /*
             * Best Score aktualisieren
             */

            const scoreKeyMap = {

                "Reaction":
                    "reaction",

                "Memory":
                    "memory",

                "Neon Serpent":
                    "serpent",

                "Block Rush":
                    "blockRush",

                "Drop Duel":
                    "dropDuel"
            };

            const key =
                scoreKeyMap[gameName];

            if (key) {

                if (
                    gameName === "Drop Duel"
                ) {

                    if (
                        score >
                        player.bestScores[key]
                    ) {

                        player.bestScores[key] =
                            score;
                    }

                } else {

                    if (
                        score >
                        player.bestScores[key]
                    ) {

                        player.bestScores[key] =
                            score;
                    }
                }
            }

            /*
             * XP
             */

            addXP(xpReward);

            /*
             * Coins
             */

            if (coinReward > 0) {
                addCoins(coinReward);
            }

            /*
             * Daily Challenges
             */

            daily.arcadeFan =
                Math.min(
                    daily.arcadeFan + 1,
                    dailyChallenges.arcadeFan.target
                );

            daily.pointsHunter =
                Math.min(
                    daily.pointsHunter + score,
                    dailyChallenges.pointsHunter.target
                );

            if (gameName === "Memory") {

                daily.cardKing =
                    Math.min(
                        daily.cardKing + 1,
                        dailyChallenges.cardKing.target
                    );
            }

            saveDaily();
            savePlayer();

            updatePlayerUI();
            updateDailyUI();

            showNotification(
                `🎮 ${gameName} beendet! +${xpReward} XP`
            );
        };


    /* =====================================================
       DAILY REWARD CLAIM
       ===================================================== */

    function claimDailyReward(
        challenge,
        amount
    ) {

        if (daily.claimed.includes(challenge)) {

            showNotification(
                "🏆 Belohnung bereits abgeholt!"
            );

            return;
        }

        daily.claimed.push(challenge);

        addCoins(amount);

        saveDaily();

        updateDailyUI();
    }


    getAll(
        "[data-daily-reward]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const challenge =
                    button.dataset.dailyReward;

                if (
                    !dailyChallenges[challenge]
                ) {
                    return;
                }

                const challengeData =
                    dailyChallenges[challenge];

                if (
                    daily[challenge] <
                    challengeData.target
                ) {

                    showNotification(
                        "🎯 Herausforderung noch nicht geschafft!"
                    );

                    return;
                }

                claimDailyReward(
                    challenge,
                    challengeData.reward
                );

            }
        );

    });


    /* =====================================================
       HOVER / TOUCH ARCADE EFFEKT
       ===================================================== */

    getAll(
        ".arcade-game-card, .arcade-menu-button, .arcade-main-play"
    ).forEach(element => {

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
       COIN ANIMATION
       ===================================================== */

    function animateCoins() {

        const coin =
            get("#coinCount");

        if (!coin) {
            return;
        }

        coin.classList.remove(
            "coin-update"
        );

        void coin.offsetWidth;

        coin.classList.add(
            "coin-update"
        );

    }


    /* =====================================================
       HOCHZÄHLEN DER COINS
       ===================================================== */

    const originalAddCoins =
        addCoins;


    /* =====================================================
       KONAMI / ARCADE SECRET
       ===================================================== */

    const secretCode = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight"
    ];

    let secretIndex = 0;

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                secretCode[secretIndex]
            ) {

                secretIndex++;

                if (
                    secretIndex ===
                    secretCode.length
                ) {

                    secretIndex = 0;

                    addCoins(500);
                    addXP(50);

                    showNotification(
                        "🕹️ SECRET ARCADE BONUS! +500 COINS"
                    );

                }

            } else {

                secretIndex = 0;

            }

        }
    );


    /* =====================================================
       TAGESZEIT / ARCADE ATMOSPHÄRE
       ===================================================== */

    function updateArcadeTime() {

        const clock =
            get("#arcadeClock");

        if (!clock) {
            return;
        }

        const now =
            new Date();

        const hours =
            String(
                now.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                now.getMinutes()
            ).padStart(2, "0");

        const seconds =
            String(
                now.getSeconds()
            ).padStart(2, "0");

        clock.textContent =
            `${hours}:${minutes}:${seconds}`;
    }

    updateArcadeTime();

    setInterval(
        updateArcadeTime,
        1000
    );


    /* =====================================================
       TAB / ENTER SUPPORT
       ===================================================== */

    getAll("button").forEach(button => {

        button.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    arcadeClickEffect(button);

                }

            }
        );

    });


    /* =====================================================
       INITIALISIERUNG
       ===================================================== */

    updatePlayerUI();
    updateDailyUI();


    /* =====================================================
       GLOBALER ARCADE-CONTROLLER
       Andere Spiele können darauf zugreifen.
       ===================================================== */

    window.MiniArcade = {

        getPlayer: () => player,

        savePlayer,

        addXP,

        addCoins,

        openGame,

        showScreen,

        showNotification,

        updatePlayerUI,

        finishGame:
            window.arcadeGameFinished
    };


    console.log(
        "🕹️ MINI ARCADE erfolgreich gestartet!"
    );

});
