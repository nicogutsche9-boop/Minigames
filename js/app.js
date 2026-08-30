import { showScreen } from "./menu.js";
import { initReactionGame, stopReactionGame } from "./games/reaction.js";
import { initMemoryGame } from "./games/memory.js";
import { initSnakeGame, stopSnakeGame } from "./games/snake.js";
import { initBlockRush, stopBlockRush } from "./games/blockrush.js";
import { initDropDuel, stopDropDuel } from "./games/dropduel.js";
import { getProfile, getBest, recordGame, resetProfile, getLevel, getLevelProgress, getAchievements, getChallenges } from "./achievements.js";

const screens = {
  menu: "menuScreen",
  reaction: "reactionScreen",
  memory: "memoryScreen",
  snake: "snakeScreen",
  blockrush: "blockRushScreen",
  dropduel: "dropDuelScreen",
  profile: "profileScreen",
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
}

function renderProfile() {
  const profile = getProfile();
  const level = getLevel(profile.xp);
  const progress = getLevelProgress(profile.xp);

  document.querySelector("#profileLevel").textContent = level;
  document.querySelector("#profileCoins").textContent = profile.coins.toLocaleString("de-DE");
  document.querySelector("#profileXp").textContent = `${progress}/100`;
  document.querySelector("#profileXpBar").style.width = `${progress}%`;

  const achievementsGrid = document.querySelector("#achievementsGrid");
  achievementsGrid.innerHTML = getAchievements().map(a => {
    const unlocked = profile.achievements.includes(a.id);
    return `
      <article class="achievement-card ${unlocked ? "" : "locked"}">
        <div class="achievement-icon">${a.icon}</div>
        <div>
          <strong>${a.title}</strong>
          <p>${a.desc}</p>
          <p>+${a.reward} 🪙</p>
        </div>
      </article>
    `;
  }).join("");

  const challengesList = document.querySelector("#challengesList");
  challengesList.innerHTML = getChallenges().map(c => {
    const progressValue = profile.challengeProgress[c.id] || 0;
    const done = profile.challengeRewards.includes(c.id);
    const percent = Math.min(100, Math.round((progressValue / c.target) * 100));
    return `
      <article class="challenge-card ${done ? "done" : ""}">
        <strong>${done ? "✓ " : ""}${c.title}</strong>
        <p>${c.desc}</p>
        <div class="challenge-progress"><span style="width:${percent}%"></span></div>
        <div class="challenge-meta">
          <span>${Math.min(progressValue, c.target)} / ${c.target}</span>
          <span>+${c.reward} 🪙</span>
        </div>
      </article>
    `;
  }).join("");
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
  if (name !== "blockrush") stopBlockRush();
  if (name !== "dropduel") {
    stopDropDuel();
}
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
  const blockrushBest = document.querySelector("#blockrushBest");
  if (blockrushBest) blockrushBest.textContent = getBest("blockrush");
}

document.querySelectorAll(".game-card").forEach(button => {
  button.addEventListener("click", () => {
    const game = button.dataset.game;

    if (game === "reaction") {
      goTo("reaction");
      initReactionGame({ onGameOver: score => finishGame("reaction", score) });
    } else if (game === "memory") {
      goTo("memory");
      initMemoryGame({ onComplete: score => finishGame("memory", score) });
    } else if (game === "snake") {
      goTo("snake");
      initSnakeGame({ onGameOver: score => finishGame("snake", score) });
    } else if (game === "blockrush") {
      goTo("blockrush");
      initBlockRush({ onGameOver: score => finishGame("blockrush", score) });
    }
    else if (game === "dropduel") {
    goTo("dropduel");
    initDropDuel();

}
  });
});
document.querySelector("#reactionMenuButton")?.addEventListener("click", () => goTo("menu"));
document.querySelector("#memoryMenuButton")?.addEventListener("click", () => goTo("menu"));
document.querySelector("#memoryResetButton")?.addEventListener("click", () => initMemoryGame({ onComplete: score => finishGame("memory", score) }));

document.querySelector("#snakeMenuButton")?.addEventListener("click", () => goTo("menu"));
document.querySelector("#snakeResetButton")?.addEventListener("click", () => initSnakeGame());
document.querySelector("#gameOverMenuButton")?.addEventListener("click", () => goTo("menu"));
document.querySelector("#playAgainButton")?.addEventListener("click", () => {
  goTo("reaction");
  initReactionGame({
    onGameOver: score => finishGame("reaction", score)
  });
});
document.querySelector("#highscoreButton")?.addEventListener("click", () => {
  updateHighscoreUI();
  goTo("highscores");
});
document.querySelector("#highscoreBackButton")?.addEventListener("click", () => goTo("menu"));
document.querySelector("#settingsButton")?.addEventListener("click", () => goTo("settings"));
document.querySelector("#settingsBackButton")?.addEventListener("click", () => goTo("menu"));
document.querySelector("#myGamesButton")?.addEventListener("click", () => {
  alert("Deine Spielesammlung wird mit den nächsten Minigames erweitert.");
});

soundToggle.addEventListener("change", () => {
  soundEnabled = soundToggle.checked;
  localStorage.setItem("miniArcadeSound", String(soundEnabled));
});

document.querySelector("#resetScoreButton")?.addEventListener("click", () => {
  resetProfile();
  updateProfileUI();
  alert("Profil, Coins, XP und Highscores wurden zurückgesetzt.");
});

updateHighscoreUI();


document.querySelector("#profileButton")?.addEventListener("click", () => {
  renderProfile();
  goTo("profile");
});

document.querySelector("#profileBackButton")?.addEventListener("click", () => goTo("menu"));

document.querySelector("#resetProfileButton")?.addEventListener("click", () => {
  if (confirm("Wirklich Profil, XP, Coins und Highscores zurücksetzen?")) {
    resetProfile();
    renderProfile();
    updateProfileUI();
  }
});

document.querySelector("#blockRushMenuButton")?.addEventListener("click", () => goTo("menu"));
document.querySelector("#blockRushResetButton")?.addEventListener("click", () => initBlockRush({
  onGameOver: score => finishGame("blockrush", score)
}));
