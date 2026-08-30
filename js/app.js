import { showScreen } from "./menu.js";
import { initReactionGame, stopReactionGame } from "./games/reaction.js";
import { initMemoryGame } from "./games/memory.js";
import { initSnakeGame, stopSnakeGame } from "./games/snake.js";
import { getProfile, getBest, recordGame, resetProfile, getLevel, getLevelProgress } from "./scores.js";

const screens = {
  menu: "menuScreen",
  reaction: "reactionScreen",
  memory: "memoryScreen",
  snake: "snakeScreen",
  gameOver: "gameOverScreen",
  highscores: "highscoreScreen",
  settings: "settingsScreen"
};

const coinCount = document.querySelector("#coinCount");
const storedHighscore = document.querySelector("#storedHighscore");
const soundToggle = document.querySelector("#soundToggle");

let soundEnabled = localStorage.getItem("miniArcadeSound") !== "false";
soundToggle.checked = soundEnabled;

function updateProfileUI() {
  const profile = getProfile();
  coinCount.textContent = profile.coins.toLocaleString("de-DE");

  const levelEl = document.querySelector("#levelValue");
  const xpEl = document.querySelector("#xpValue");
  const xpBar = document.querySelector("#xpBar");

  if (levelEl) levelEl.textContent = getLevel(profile.xp);
  if (xpEl) xpEl.textContent = `${getLevelProgress(profile.xp)}/100 XP`;
  if (xpBar) xpBar.style.width = `${getLevelProgress(profile.xp)}%`;

  updateProfileUI();
}

function finishGame(game, score) {
  const result = recordGame(game, score);

  document.querySelector("#finalScore").textContent = score;
  document.querySelector("#highscoreMessage").textContent =
    result.isNewHighscore
      ? "★ NEUER HIGHSCORE! ★"
      : `BESTER SCORE: ${result.best}`;

  const reward = document.querySelector("#rewardMessage");
  if (reward) {
    reward.textContent = `+${result.xpEarned} XP · +${result.coinsEarned} Coins`;
  }

  updateProfileUI();
}

function goTo(name) {
  if (name !== "reaction") stopReactionGame();
  if (name !== "snake") stopSnakeGame();
  showScreen(screens[name]);
}

function getHighscore() {
  return getBest("reaction");
}

function updateHighscoreUI() {
  storedHighscore.textContent = getHighscore();

  const reactionBest = document.querySelector("#reactionBest");
  const memoryBest = document.querySelector("#memoryBest");
  const snakeBest = document.querySelector("#snakeBest");

  if (reactionBest) reactionBest.textContent = getBest("reaction");
  if (memoryBest) memoryBest.textContent = getBest("memory");
  if (snakeBest) snakeBest.textContent = getBest("snake");
}

document.querySelectorAll("[data-game]").forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.game === "reaction") {
      goTo("reaction");
      initReactionGame({
        onGameOver: score => finishGame("reaction", score)
      });
    }

    if (button.dataset.game === "memory") {
      goTo("memory");
      initMemoryGame({
        onComplete: score => finishGame("memory", score)
      });
    }

    if (button.dataset.game === "snake") {
      goTo("snake");
      initSnakeGame({
        onGameOver: score => finishGame("snake", score)
      });
    }
  });
});

document.querySelector("#reactionMenuButton").addEventListener("click", () => goTo("menu"));
document.querySelector("#memoryMenuButton").addEventListener("click", () => goTo("menu"));
document.querySelector("#memoryResetButton").addEventListener("click", () => initMemoryGame());

document.querySelector("#snakeMenuButton").addEventListener("click", () => goTo("menu"));
document.querySelector("#snakeResetButton").addEventListener("click", () => initSnakeGame());
document.querySelector("#gameOverMenuButton").addEventListener("click", () => goTo("menu"));
document.querySelector("#playAgainButton").addEventListener("click", () => {
  goTo("reaction");
  initReactionGame({
    onGameOver: score => finishGame("reaction", score)
  });
});
document.querySelector("#highscoreButton").addEventListener("click", () => {
  updateHighscoreUI();
  goTo("highscores");
});
document.querySelector("#highscoreBackButton").addEventListener("click", () => goTo("menu"));
document.querySelector("#settingsButton").addEventListener("click", () => goTo("settings"));
document.querySelector("#settingsBackButton").addEventListener("click", () => goTo("menu"));
document.querySelector("#myGamesButton").addEventListener("click", () => {
  alert("Deine Spielesammlung wird mit den nächsten Minigames erweitert.");
});

soundToggle.addEventListener("change", () => {
  soundEnabled = soundToggle.checked;
  localStorage.setItem("miniArcadeSound", String(soundEnabled));
});

document.querySelector("#resetScoreButton").addEventListener("click", () => {
  resetProfile();
  updateProfileUI();
  alert("Profil, Coins, XP und Highscores wurden zurückgesetzt.");
});

updateHighscoreUI();
