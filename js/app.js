/* =========================================================
   MINI ARCADE
   ZENTRALE APP-STEUERUNG
   ========================================================= */

import {
  getProfile,
  recordGame,
  getLevel,
  getLevelProgress,
  getBest,
  getAchievements,
  getChallenges,
  saveProfile
} from "./arcade/profile.js";


/* =========================================================
   GAME MODULES
   ========================================================= */

import {
  initReaction,
  stopReaction
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

const coinCount =
  document.querySelector("#coinCount");

const levelValue =
  document.querySelector("#levelValue");

const xpValue =
  document.querySelector("#xpValue");

const xpBar =
  document.querySelector("#xpBar");

const arcadeLevel =
  document.querySelector("#arcadeLevel");

const arcadeXP =
  document.querySelector("#arcadeXP");

const arcadeXPProgress =
  document.querySelector("#arcadeXPProgress");

const arcadeTotalGames =
  document.querySelector("#arcadeTotalGames");

const arcadeTotalWins =
  document.querySelector("#arcadeTotalWins");

const arcadeBestScore =
  document.querySelector("#arcadeBestScore");


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


  switch (currentGame) {

    case "reaction":
      stopReaction?.();
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
   PROFIL
   ========================================================= */

function updateProfileUI() {

  const profile =
    getProfile();


  const level =
    getLevel(profile.xp);


  const progress =
    getLevelProgress(profile.xp);


  /* Coins */

  if (coinCount) {

    coinCount.textContent =
      profile.coins.toLocaleString("de-DE");

  }


  /* Level */

  if (levelValue) {

    levelValue.textContent =
      level;

  }


  if (arcadeLevel) {

    arcadeLevel.textContent =
      level;

  }


  /* XP */

  if (xpValue) {

    xpValue.textContent =
      `${progress}/100 XP`;

  }


  if (arcadeXP) {

    arcadeXP.textContent =
      `${progress} / 100 XP`;

  }


  /* XP-Balken */

  if (xpBar) {

    xpBar.style.width =
      `${progress}%`;

  }


  if (arcadeXPProgress) {

    arcadeXPProgress.style.width =
      `${progress}%`;

  }


  updateMiniStats(profile);

  updateHighscores(profile);

  updateProfileScreen(profile);

}


/* =========================================================
   MINI STATS
   ========================================================= */

function updateMiniStats(profile) {

  const highscores =
    profile.highscores || {};


  const scores =
    Object.values(highscores)
      .map(Number)
      .filter(score => score > 0);


  const best =
    scores.length
      ? Math.max(...scores)
      : 0;


  if (arcadeBestScore) {

    arcadeBestScore.textContent =
      best;

  }


  /*
     Das vorhandene Profil speichert
     aktuell keine separate Spielezahl
     oder Siegzahl.

     Deshalb zählen wir hier die
     vorhandenen Highscores als
     gespielte Spiele und lassen
     Siege zunächst auf 0.

     Sobald wir in profile.js
     totalGames / totalWins ergänzen,
     übernimmt diese Anzeige
     automatisch diese Werte.
  */

  if (arcadeTotalGames) {

    if (
      typeof profile.totalGames === "number"
    ) {

      arcadeTotalGames.textContent =
        profile.totalGames;

    }
    else {

      arcadeTotalGames.textContent =
        scores.length;

    }

  }


  if (arcadeTotalWins) {

    arcadeTotalWins.textContent =
      typeof profile.totalWins === "number"
        ? profile.totalWins
        : 0;

  }

}


/* =========================================================
   HIGHSCORES
   ========================================================= */

function updateHighscores(profile) {

  const highscores =
    profile.highscores || {};


  const elements = {

    reaction:
      document.querySelector("#reactionBest"),

    memory:
      document.querySelector("#memoryBest"),

    snake:
      document.querySelector("#snakeBest"),

    blockrush:
      document.querySelector("#blockrushBest")

  };


  Object.entries(elements)
    .forEach(([game, element]) => {

      if (!element) {
        return;
      }


      element.textContent =
        highscores[game] || 0;

    });


  const stored =
    document.querySelector(
      "#storedHighscore"
    );


  if (stored) {

    stored.textContent =
      highscores.reaction || 0;

  }

}


/* =========================================================
   PROFIL-SEITE
   ========================================================= */

function updateProfileScreen(profile) {

  const level =
    getLevel(profile.xp);

  const progress =
    getLevelProgress(profile.xp);


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
      level;

  }


  if (profileCoins) {

    profileCoins.textContent =
      profile.coins.toLocaleString(
        "de-DE"
      );

  }


  if (profileXp) {

    profileXp.textContent =
      `${progress}/100`;

  }


  if (profileXpBar) {

    profileXpBar.style.width =
      `${progress}%`;

  }


  renderAchievements(profile);

  renderChallenges(profile);

}


/* =========================================================
   ERFOLGE
   ========================================================= */

function renderAchievements(profile) {

  const container =
    document.querySelector(
      "#achievementsGrid"
    );


  if (!container) {
    return;
  }


  const achievements =
    getAchievements();


  const unlocked =
    new Set(
      profile.achievements || []
    );


  container.innerHTML =
    "";


  achievements.forEach(
    achievement => {

      const element =
        document.createElement("div");


      element.className =
        "achievement-card";


      if (
        unlocked.has(
          achievement.id
        )
      ) {

        element.classList.add(
          "unlocked"
        );

      }


      element.innerHTML = `
        <div class="achievement-icon">
          ${achievement.icon}
        </div>

        <div class="achievement-content">
          <strong>
            ${achievement.title}
          </strong>

          <span>
            ${achievement.desc}
          </span>

          <small>
            +${achievement.reward} 🪙
          </small>
        </div>
      `;


      container.appendChild(
        element
      );

    }
  );

}


/* =========================================================
   CHALLENGES
   ========================================================= */

function renderChallenges(profile) {

  const container =
    document.querySelector(
      "#challengesList"
    );


  if (!container) {
    return;
  }


  const challenges =
    getChallenges();


  const progress =
    profile.challengeProgress || {};


  const rewards =
    new Set(
      profile.challengeRewards || []
    );


  container.innerHTML =
    "";


  challenges.forEach(
    challenge => {

      const current =
        Math.min(
          progress[challenge.id] || 0,
          challenge.target
        );


      const percentage =
        Math.min(
          100,
          (current /
            challenge.target) *
            100
        );


      const completed =
        rewards.has(
          challenge.id
        );


      const element =
        document.createElement("div");


      element.className =
        "challenge-card";


      if (completed) {

        element.classList.add(
          "completed"
        );

      }


      element.innerHTML = `
        <div class="challenge-main">

          <strong>
            ${challenge.title}
          </strong>

          <span>
            ${challenge.desc}
          </span>

          <div class="challenge-progress">
            <span
              style="width:${percentage}%">
            </span>
          </div>

          <small>
            ${current} / ${challenge.target}
          </small>

        </div>

        <div class="challenge-reward">
          ${completed ? "✓" : `+${challenge.reward}`}
          <span>🪙</span>
        </div>
      `;


      container.appendChild(
        element
      );

    }
  );

}


/* =========================================================
   GAME RESULTAT
   ========================================================= */

function handleGameResult(
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
     Profil aktualisieren.
  */

  const result =
    recordGame(
      game,
      numericScore
    );


  /*
     Game-Over-Anzeige
     für Spiele, die das
     zentrale Game-Over-Screen
     verwenden.
  */

  showGameResult(
    result
  );


  /*
     Profil direkt aktualisieren.
  */

  updateProfileUI();


  return result;

}


/* =========================================================
   GAME OVER
   ========================================================= */

function showGameResult(result) {

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
      result.score;

  }


  if (highscoreMessage) {

    highscoreMessage.classList.toggle(
      "hidden",
      !result.isNewHighscore
    );

    if (!result.isNewHighscore) {

      highscoreMessage.textContent =
        `BESTER SCORE: ${result.best}`;

    }
    else {

      highscoreMessage.textContent =
        "★ NEUER HIGHSCORE! ★";

    }

  }


  if (rewardMessage) {

    rewardMessage.textContent =
      `+${result.xpEarned} XP · +${result.coinsEarned} 🪙`;

  }


  if (achievementReward) {

    const achievements =
      result.achievements || [];

    const challenges =
      result.challenges || [];


    const messages = [];


    achievements.forEach(
      achievement => {

        messages.push(
          `🏆 ${achievement.title} +${achievement.reward} 🪙`
        );

      }
    );


    challenges.forEach(
      challenge => {

        messages.push(
          `📅 Challenge: ${challenge.title} +${challenge.reward} 🪙`
        );

      }
    );


    achievementReward.textContent =
      messages.join(" · ");

  }


  showScreen(
    "gameOverScreen"
  );

}


/* =========================================================
   GAME STARTEN
   ========================================================= */

function startGame(game) {

  stopCurrentGame();


  currentGame =
    game;


  switch (game) {

    /* -----------------------------------------
       REACTION
       ----------------------------------------- */

    case "reaction":

      showScreen(
        "reactionScreen"
      );

      initReaction({

        onGameOver(score) {

          handleGameResult(
            "reaction",
            score
          );

        }

      });

      break;


    /* -----------------------------------------
       MEMORY
       ----------------------------------------- */

    case "memory":

      showScreen(
        "memoryScreen"
      );

      initMemory();

      break;


    /* -----------------------------------------
       SNAKE
       ----------------------------------------- */

    case "snake":

      showScreen(
        "snakeScreen"
      );

      initSnakeGame({

        onGameOver(score) {

          handleGameResult(
            "snake",
            score
          );

        }

      });

      break;


    /* -----------------------------------------
       BLOCK RUSH
       ----------------------------------------- */

    case "blockrush":

      showScreen(
        "blockRushScreen"
      );

      initBlockRush({

        onGameOver(score) {

          handleGameResult(
            "blockrush",
            score
          );

        }

      });

      break;


    /* -----------------------------------------
       DROP DUEL
       ----------------------------------------- */

    case "dropduel":

      showScreen(
        "dropDuelScreen"
      );

      initDropDuel();

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
   MEMORY RESULT EVENT
   ========================================================= */

document.addEventListener(
  "memoryGameOver",
  event => {

    const score =
      event.detail?.score ?? 0;


    handleGameResult(
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

    showScreen(
      "menuScreen"
    );

    updateProfileUI();

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


          startGame(game);

        }
      );

    });

}


/* =========================================================
   MENÜ BUTTONS
   ========================================================= */

function initMenuButtons() {

  /* Highscores */

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


  /* Meine Spiele / Profil */

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


  /* Einstellungen */

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

  const backButtons = [

    "#reactionMenuButton",
    "#snakeMenuButton",
    "#blockRushMenuButton",
    "#dropDuelMenuButton",
    "#memoryMenuButton",
    "#profileBackButton",
    "#highscoreBackButton",
    "#settingsBackButton"

  ];


  backButtons.forEach(selector => {

    document
      .querySelector(selector)
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

  });

}


/* =========================================================
   GAME OVER → NOCHMAL
   ========================================================= */

function initGameOverButtons() {

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
            "Möchtest du dein komplettes Arcade-Profil wirklich zurücksetzen?"
          );


        if (!confirmed) {
          return;
        }


        /*
           resetProfile ist absichtlich
           nicht direkt importiert.

           Wir setzen das Profil
           anhand der vorhandenen
           Profil-Struktur zurück.
        */

        const resetProfile = {

          xp: 0,

          coins: 1250,

          highscores: {
            reaction: 0,
            memory: 0,
            snake: 0,
            blockrush: 0
          },

          achievements: [],

          challengeDate: "",

          challengeProgress: {
            play_3: 0,
            score_250: 0,
            play_memory: 0
          },

          challengeRewards: []

        };


        saveProfile(
          resetProfile
        );


        updateProfileUI();


        alert(
          "Profil wurde zurückgesetzt."
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


  const saved =
    localStorage.getItem(
      "arcadeSound"
    );


  let soundEnabled =
    saved !== "off";


  if (soundToggle) {

    soundToggle.checked =
      soundEnabled;


    soundToggle.addEventListener(
      "change",
      () => {

        soundEnabled =
          soundToggle.checked;


        localStorage.setItem(
          "arcadeSound",
          soundEnabled
            ? "on"
            : "off"
        );

      }
    );

  }


  if (soundButton) {

    soundButton.addEventListener(
      "click",
      () => {

        soundEnabled =
          !soundEnabled;


        localStorage.setItem(
          "arcadeSound",
          soundEnabled
            ? "on"
            : "off"
        );


        soundButton.textContent =
          soundEnabled
            ? "🔊"
            : "🔇";


        if (soundToggle) {

          soundToggle.checked =
            soundEnabled;

        }

      }
    );

  }

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
            "Möchtest du deine Highscores wirklich zurücksetzen?"
          );


        if (!confirmed) {
          return;
        }


        const profile =
          getProfile();


        profile.highscores = {

          reaction: 0,
          memory: 0,
          snake: 0,
          blockrush: 0

        };


        saveProfile(
          profile
        );


        updateProfileUI();


        alert(
          "Highscores wurden zurückgesetzt."
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

  initProfileReset();

  initHighscoreReset();

  initSoundSettings();

  initKeyboardNavigation();


  updateProfileUI();


  showScreen(
    "menuScreen"
  );

}


/* =========================================================
   START
   ========================================================= */

initApp();
