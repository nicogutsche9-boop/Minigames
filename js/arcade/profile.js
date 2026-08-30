/* =========================================================
   MINI ARCADE
   ZENTRALES PROFIL-SYSTEM
   ========================================================= */


const PROFILE_KEY =
    "miniArcadeProfile";


/* =========================================================
   STANDARD PROFIL
   ========================================================= */

const defaultProfile = {

    xp: 0,

    level: 1,

    totalGames: 0,

    totalWins: 0,

    totalLosses: 0,

    totalDraws: 0,

    totalPlayTime: 0,

    bestScore: 0,

    games: {}

};


/* =========================================================
   PROFIL LADEN
   ========================================================= */

function loadProfile() {

    const saved =
        localStorage.getItem(
            PROFILE_KEY
        );


    if (!saved) {

        return {
            ...defaultProfile
        };

    }


    try {

        const profile =
            JSON.parse(saved);


        return {

            ...defaultProfile,

            ...profile,

            games:
                {
                    ...defaultProfile.games,
                    ...(profile.games || {})
                }

        };

    }

    catch (error) {

        console.warn(
            "Arcade-Profil konnte nicht geladen werden.",
            error
        );


        return {
            ...defaultProfile
        };

    }

}


/* =========================================================
   PROFIL
   ========================================================= */

let arcadeProfile =
    loadProfile();


/* =========================================================
   SPEICHERN
   ========================================================= */

function saveProfile() {

    localStorage.setItem(

        PROFILE_KEY,

        JSON.stringify(
            arcadeProfile
        )

    );

}


/* =========================================================
   LEVEL BERECHNEN
   ========================================================= */

function calculateLevel(xp) {

    /*
       Jede Stufe benötigt etwas
       mehr XP als die vorherige.

       Level 1 = 0 XP
       Level 2 = 100 XP
       Level 3 = 250 XP
       Level 4 = 450 XP
       usw.
    */

    let level = 1;

    let requiredXP = 100;

    let remainingXP = xp;


    while (
        remainingXP >= requiredXP
    ) {

        remainingXP -=
            requiredXP;

        level++;

        requiredXP =
            Math.round(
                requiredXP * 1.25
            );

    }


    return {

        level,

        currentXP:
            remainingXP,

        requiredXP

    };

}


/* =========================================================
   XP HINZUFÜGEN
   ========================================================= */

export function addXP(
    amount,
    reason = "Spiel gespielt"
) {

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return;

    }


    arcadeProfile.xp +=
        Math.round(amount);


    const oldLevel =
        arcadeProfile.level;


    const levelData =
        calculateLevel(
            arcadeProfile.xp
        );


    arcadeProfile.level =
        levelData.level;


    saveProfile();


    updateArcadeProfileUI();


    if (
        levelData.level >
        oldLevel
    ) {

        showLevelUp(
            levelData.level
        );

    }


    console.log(
        `+${amount} XP – ${reason}`
    );

}


/* =========================================================
   SPIEL GESTARTET
   ========================================================= */

export function registerGameStart(
    gameName
) {

    arcadeProfile.totalGames++;


    if (
        !arcadeProfile.games[
            gameName
        ]
    ) {

        arcadeProfile.games[
            gameName
        ] = {

            played: 0,

            wins: 0,

            losses: 0,

            draws: 0,

            bestScore: 0,

            totalXP: 0

        };

    }


    arcadeProfile.games[
        gameName
    ].played++;


    saveProfile();


    updateArcadeProfileUI();

}


/* =========================================================
   SPIELERGEBNIS
   ========================================================= */

export function registerGameResult(
    gameName,
    result,
    score = 0
) {

    if (
        !arcadeProfile.games[
            gameName
        ]
    ) {

        arcadeProfile.games[
            gameName
        ] = {

            played: 0,

            wins: 0,

            losses: 0,

            draws: 0,

            bestScore: 0,

            totalXP: 0

        };

    }


    const game =
        arcadeProfile.games[
            gameName
        ];


    let xp = 10;


    /* =========================
       ERGEBNIS
       ========================= */

    if (
        result === "win"
    ) {

        game.wins++;

        arcadeProfile.totalWins++;

        xp = 25;

    }


    else if (
        result === "loss"
    ) {

        game.losses++;

        arcadeProfile.totalLosses++;

        xp = 10;

    }


    else if (
        result === "draw"
    ) {

        game.draws++;

        arcadeProfile.totalDraws++;

        xp = 15;

    }


    /* =========================
       SCORE
       ========================= */

    if (
        Number.isFinite(score) &&
        score > 0
    ) {

        if (
            score >
            game.bestScore
        ) {

            game.bestScore =
                score;


            xp += 15;

        }


        if (
            score >
            arcadeProfile.bestScore
        ) {

            arcadeProfile.bestScore =
                score;

        }

    }


    game.totalXP +=
        xp;


    saveProfile();


    addXP(
        xp,
        `${gameName}: ${result}`
    );


    return xp;

}


/* =========================================================
   SCORE REGISTRIEREN
   ========================================================= */

export function registerScore(
    gameName,
    score
) {

    if (
        !Number.isFinite(score)
    ) {

        return false;

    }


    if (
        !arcadeProfile.games[
            gameName
        ]
    ) {

        arcadeProfile.games[
            gameName
        ] = {

            played: 0,

            wins: 0,

            losses: 0,

            draws: 0,

            bestScore: 0,

            totalXP: 0

        };

    }


    const game =
        arcadeProfile.games[
            gameName
        ];


    if (
        score >
        game.bestScore
    ) {

        game.bestScore =
            score;


        if (
            score >
            arcadeProfile.bestScore
        ) {

            arcadeProfile.bestScore =
                score;

        }


        saveProfile();


        updateArcadeProfileUI();


        return true;

    }


    return false;

}


/* =========================================================
   PROFIL ABRUFEN
   ========================================================= */

export function getArcadeProfile() {

    return {
        ...arcadeProfile
    };

}


/* =========================================================
   LEVEL-DATEN
   ========================================================= */

export function getLevelData() {

    return calculateLevel(
        arcadeProfile.xp
    );

}


/* =========================================================
   PROFIL UI AKTUALISIEREN
   ========================================================= */

export function updateArcadeProfileUI() {

    const levelElement =
        document.querySelector(
            "#arcadeLevel"
        );


    const xpElement =
        document.querySelector(
            "#arcadeXP"
        );


    const progressElement =
        document.querySelector(
            "#arcadeXPProgress"
        );


    const levelData =
        calculateLevel(
            arcadeProfile.xp
        );


    if (
        levelElement
    ) {

        levelElement.textContent =
            levelData.level;

    }


    if (
        xpElement
    ) {

        xpElement.textContent =
            `${levelData.currentXP} / ${levelData.requiredXP} XP`;

    }


    if (
        progressElement
    ) {

        const percentage =
            Math.min(

                100,

                (
                    levelData.currentXP /
                    levelData.requiredXP
                ) * 100

            );


        progressElement.style.width =
            `${percentage}%`;

    }


    const totalGames =
        document.querySelector(
            "#arcadeTotalGames"
        );


    const totalWins =
        document.querySelector(
            "#arcadeTotalWins"
        );


    const bestScore =
        document.querySelector(
            "#arcadeBestScore"
        );


    if (
        totalGames
    ) {

        totalGames.textContent =
            arcadeProfile.totalGames;

    }


    if (
        totalWins
    ) {

        totalWins.textContent =
            arcadeProfile.totalWins;

    }


    if (
        bestScore
    ) {

        bestScore.textContent =
            arcadeProfile.bestScore;

    }

}


/* =========================================================
   LEVEL-UP ANZEIGE
   ========================================================= */

function showLevelUp(level) {

    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        "arcade-level-up";


    notification.innerHTML = `

        <div class="level-up-icon">
            ⭐
        </div>

        <div>

            <strong>
                LEVEL UP!
            </strong>

            <span>
                Du bist jetzt Level ${level}
            </span>

        </div>

    `;


    document.body.appendChild(
        notification
    );


    setTimeout(() => {

        notification.classList.add(
            "show"
        );

    }, 20);


    setTimeout(() => {

        notification.classList.remove(
            "show"
        );


        setTimeout(() => {

            notification.remove();

        }, 300);

    }, 3000);

}


/* =========================================================
   START
   ========================================================= */

export function initArcadeProfile() {

    const levelData =
        calculateLevel(
            arcadeProfile.xp
        );


    arcadeProfile.level =
        levelData.level;


    saveProfile();


    updateArcadeProfileUI();

}
