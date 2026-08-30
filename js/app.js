import {
  getProfile,
  getLevel,
  getLevelProgress,
  getBest,
  recordGame
} from "./arcade/profile.js";

import { initReactionGame, stopReactionGame } from "./arcade/reaction.js";
import { initMemoryGame, stopMemoryGame } from "./arcade/memory.js";
import { initSnakeGame, stopSnakeGame } from "./arcade/snake.js";
import { initBlockRush, stopBlockRush } from "./arcade/blockrush.js";
import { initDropDuel, stopDropDuel } from "./arcade/dropduel.js";


/* =========================================================
   ELEMENTE
   ========================================================= */

const screens = document.querySelectorAll(".screen");

const menuScreen = document.querySelector("#menuScreen");

const coinCount = document.querySelector("#coinCount");

const levelValue = document.querySelector("#levelValue");
const xpValue = document.querySelector("#xpValue");
const xpBar = document.querySelector("#xpBar");

const highscoreButton =
  document.querySelector("#highscoreButton");

const myGamesButton =
  document.querySelector("#myGamesButton");

const settingsButton =
  document.querySelector("#settingsButton");

const highscoreBackButton =
  document.querySelector("#highscoreBackButton");

const settingsBackButton =
  document.querySelector("#settingsBackButton");

const gameOverScreen =
  document.querySelector("#gameOverScreen");

const finalScore =
  document.querySelector("#finalScore");

const highscoreMessage =
  document.querySelector("#highscoreMessage");

const rewardMessage =
  document.querySelector("#rewardMessage");

const achievementReward =
  document.querySelector("#achievementReward");

const playAgainButton =
  document.querySelector("#playAgainButton");

const gameOverMenuButton =
  document.querySelector("#gameOverMenuButton");

const soundToggle =
  document.querySelector("#soundToggle");

const resetScoreButton =
  document.querySelector("#resetScoreButton");


/* =========================================================
   SPIELZUSTAND
   ========================================================= */

let currentGame = null;
let lastGameScore = 0;


/* =========================================================
   SCREEN WECHSELN
   ========================================================= */

function showScreen(id) {

  screens.forEach(screen => {
    screen.classList.remove("active");
  });

  const screen =
    document.querySelector(`#${id}`);

  if (screen) {
    screen.classList.add("active");
  }

}


/* =========================================================
   ALLE GAMES STOPPEN
   ========================================================= */

function stopAllGames() {

  try {
    stopReactionGame();
  } catch {}

  try {
    stopMemoryGame();
  } catch {}

  try {
    stopSnakeGame();
  } catch {}

  try {
    stopBlockRush();
  } catch {}

  try {
    stopDropDuel();
  } catch {}

}


/* =========================================================
   PROFIL AKTUALISIEREN
   ========================================================= */

function updateProfileUI() {

  const profile =
    getProfile();

  const level =
    getLevel(profile.xp);

  const progress =
    getLevelProgress(profile.xp);


  if (coinCount) {
    coinCount.textContent =
      profile.coins.toLocaleString("de-DE");
  }


  if (levelValue) {
    levelValue.textContent =
      level;
  }


  if (xpValue) {
    xpValue.textContent =
      `${progress}/100 XP`;
  }


  if (xpBar) {
    xpBar.style.width =
      `${progress}%`;
  }


  /* Neues Profil-Element aus
     deinem Pixel-Arcade-Header */

  const arcadeLevel =
    document.querySelector("#arcadeLevel");

  const arcadeXP =
    document.querySelector("#arcadeXP");

  const arcadeXPProgress =
    document.querySelector("#arcadeXPProgress");


  if (arcadeLevel) {
    arcadeLevel.textContent =
      level;
  }


  if (arcadeXP) {
    arcadeXP.textContent =
      `${progress} / 100 XP`;
  }


  if (arcadeXPProgress) {
    arcadeXPProgress.style.width =
      `${progress}%`;
  }


  updateHighscores();

}


/* =========================================================
   HIGHSCORES
   ========================================================= */

function updateHighscores() {

  const reactionBest =
    document.querySelector("#reactionBest");

  const memoryBest =
    document.querySelector("#memoryBest");

  const snakeBest =
    document.querySelector("#snakeBest");

  const blockrushBest =
    document.querySelector("#blockrushBest");

  if (reactionBest) {
    reactionBest.textContent =
      getBest("reaction");
  }

  if (memoryBest) {
    memoryBest.textContent =
      getBest("memory");
  }

  if (snakeBest) {
    snakeBest.textContent =
      getBest("snake");
  }

  if (blockrushBest) {
    blockrushBest.textContent =
      getBest("blockrush");
  }


  const storedHighscore =
    document.querySelector("#storedHighscore");

  if (storedHighscore) {
    storedHighscore.textContent =
      getBest("reaction");
  }

}


/* =========================================================
   SPIEL ÖFFNEN
   ========================================================= */

function openGame(game) {

  stopAllGames();

  currentGame =
    game;


  if (game === "reaction") {

    showScreen("reactionScreen");

    initReactionGame({
      onGameOver: score =>
        handleGameResult("reaction", score)
    });

    return;
  }


  if (game === "memory") {

    showScreen("memoryScreen");

    initMemoryGame({
      onGameOver: score =>
        handleGameResult("memory", score)
    });

    return;
  }


  if (game === "snake") {

    showScreen("snakeScreen");

    initSnakeGame({
      onGameOver: score =>
        handleGameResult("snake", score)
    });

    return;
  }


  if (game === "blockrush") {

    showScreen("blockRushScreen");

    initBlockRush({
      onGameOver: score =>
        handleGameResult("blockrush", score)
    });

    return;
  }


  if (game === "dropduel") {

    showScreen("dropDuelScreen");

    initDropDuel();

    return;
  }

}


/* =========================================================
   SPIEL-ERGEBNIS
   ========================================================= */

function handleGameResult(game, score) {

  lastGameScore =
    Number(score) || 0;


  const result =
    recordGame(
      game,
      lastGameScore
    );


  showGameOver(
    result
  );


  updateProfileUI();

}


/* =========================================================
   GAME OVER
   ========================================================= */

function showGameOver(result) {

  finalScore.textContent =
    result.score;


  if (result.isNewHighscore) {

    highscoreMessage.textContent =
      "★ NEUER HIGHSCORE! ★";

  } else {

    highscoreMessage.textContent =
      `Bester Score: ${result.best}`;

  }


  rewardMessage.textContent =
    `+${result.xpEarned} XP · +${result.coinsEarned} 🪙`;


  const messages = [];


  if (
    result.achievements &&
    result.achievements.length
  ) {

    result.achievements.forEach(achievement => {

      messages.push(
        `${achievement.icon} ${achievement.title} · +${achievement.reward} 🪙`
      );

    });

  }


  if (
    result.challenges &&
    result.challenges.length
  ) {

    result.challenges.forEach(challenge => {

      messages.push(
        `🔥 Challenge geschafft: ${challenge.title} · +${challenge.reward} 🪙`
      );

    });

  }


  achievementReward.textContent =
    messages.join(" · ");


  stopAllGames();

  showScreen("gameOverScreen");

}


/* =========================================================
   ZURÜCK ZUM MENÜ
   ========================================================= */

function goToMenu() {

  stopAllGames();

  currentGame = null;

  showScreen("menuScreen");

  updateProfileUI();

}


/* =========================================================
   GAME CARDS
   ========================================================= */

document
  .querySelectorAll(".game-card")
  .forEach(card => {

    card.addEventListener(
      "click",
      () => {

        const game =
          card.dataset.game;

        if (game) {
          openGame(game);
        }

      }
    );

  });


/* =========================================================
   MENÜ-BUTTONS DER GAMES
   ========================================================= */

document
  .querySelector("#reactionMenuButton")
  ?.addEventListener(
    "click",
    goToMenu
  );


document
  .querySelector("#snakeMenuButton")
  ?.addEventListener(
    "click",
    goToMenu
  );


document
  .querySelector("#memoryMenuButton")
  ?.addEventListener(
    "click",
    goToMenu
  );


document
  .querySelector("#blockRushMenuButton")
  ?.addEventListener(
    "click",
    goToMenu
  );


document
  .querySelector("#dropDuelMenuButton")
  ?.addEventListener(
    "click",
    goToMenu
  );


/* =========================================================
   RESET-BUTTONS DER GAMES
   ========================================================= */

document
  .querySelector("#reactionResetButton")
  ?.addEventListener(
    "click",
    () => openGame("reaction")
  );


document
  .querySelector("#snakeResetButton")
  ?.addEventListener(
    "click",
    () => openGame("snake")
  );


document
  .querySelector("#memoryResetButton")
  ?.addEventListener(
    "click",
    () => openGame("memory")
  );


document
  .querySelector("#blockRushResetButton")
  ?.addEventListener(
    "click",
    () => openGame("blockrush")
  );


document
  .querySelector("#dropDuelResetButton")
  ?.addEventListener(
    "click",
    () => openGame("dropduel")
  );


/* =========================================================
   HIGHSCORES
   ========================================================= */

highscoreButton
  ?.addEventListener(
    "click",
    () => {

      stopAllGames();

      updateHighscores();

      showScreen(
        "highscoreScreen"
      );

    }
  );


highscoreBackButton
  ?.addEventListener(
    "click",
    goToMenu
  );


/* =========================================================
   MEINE SPIELE
   ========================================================= */

myGamesButton
  ?.addEventListener(
    "click",
    () => {

      /*
       * Vorerst führt dieser Button
       * zum Profil.
       *
       * Dort befinden sich XP,
       * Coins, Erfolge und Challenges.
       */

      stopAllGames();

      updateProfileUI();

      showScreen(
        "profileScreen"
      );

    }
  );


/* =========================================================
   PROFIL ZURÜCK
   ========================================================= */

document
  .querySelector("#profileBackButton")
  ?.addEventListener(
    "click",
    goToMenu
  );


/* =========================================================
   EINSTELLUNGEN
   ========================================================= */

settingsButton
  ?.addEventListener(
    "click",
    () => {

      stopAllGames();

      showScreen(
        "settingsScreen"
      );

    }
  );


settingsBackButton
  ?.addEventListener(
    "click",
    goToMenu
  );


/* =========================================================
   GAME OVER → NOCHMAL
   ========================================================= */

playAgainButton
  ?.addEventListener(
    "click",
    () => {

      if (!currentGame) {

        goToMenu();

        return;

      }

      openGame(
        currentGame
      );

    }
  );


/* =========================================================
   GAME OVER → MENÜ
   ========================================================= */

gameOverMenuButton
  ?.addEventListener(
    "click",
    goToMenu
  );


/* =========================================================
   SOUND
   ========================================================= */

if (soundToggle) {

  const savedSound =
    localStorage.getItem(
      "miniArcadeSound"
    );


  if (savedSound !== null) {

    soundToggle.checked =
      savedSound === "true";

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
   SCORE RESET
   ========================================================= */

resetScoreButton
  ?.addEventListener(
    "click",
    () => {

      if (
        !confirm(
          "Möchtest du dein Profil wirklich zurücksetzen?"
        )
      ) {

        return;

      }


      localStorage.removeItem(
        "miniArcadeProfile"
      );


      updateProfileUI();

      goToMenu();

    }
  );


/* =========================================================
   START
   ========================================================= */

updateProfileUI();

showScreen("menuScreen");
