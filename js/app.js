import { showScreen } from "./menu.js";
import { initReactionGame, stopReactionGame } from "./games/reaction.js";
import { initMemoryGame } from "./games/memory.js";
import { initSnakeGame, stopSnakeGame } from "./games/snake.js";

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

function goTo(name) {
  if (name !== "reaction") stopReactionGame();
  if (name !== "snake") stopSnakeGame();
  showScreen(screens[name]);
}

function getHighscore() {
  return Number(localStorage.getItem("miniArcadeReactionHighscore") || 0);
}

function updateHighscoreUI() {
  storedHighscore.textContent = getHighscore();
}

document.querySelectorAll("[data-game]").forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.game === "reaction") {
      goTo("reaction");
      initReactionGame({
        onGameOver: score => {
          document.querySelector("#finalScore").textContent = score;
          const best = getHighscore();
          const isNew = score > best;
          if (isNew) localStorage.setItem("miniArcadeReactionHighscore", score);
          document.querySelector("#highscoreMessage").textContent =
            isNew ? "★ NEUER HIGHSCORE! ★" : `BESTER SCORE: ${Math.max(best, score)}`;
          coinCount.textContent = (1250 + score * 5).toLocaleString("de-DE");
        }
      });
    }

    if (button.dataset.game === "memory") {
      goTo("memory");
      initMemoryGame();
    }

    if (button.dataset.game === "snake") {
      goTo("snake");
      initSnakeGame();
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
  initReactionGame();
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
  localStorage.removeItem("miniArcadeReactionHighscore");
  updateHighscoreUI();
  alert("Highscore wurde zurückgesetzt.");
});

updateHighscoreUI();
