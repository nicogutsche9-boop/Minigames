const ACHIEVEMENTS = [
  { id: "first_game", icon: "🎮", title: "Erster Schritt", desc: "Spiele dein erstes Minigame.", reward: 50 },
  { id: "reaction_100", icon: "⚡", title: "Schnelle Finger", desc: "Erreiche 100 Punkte in Reaction.", reward: 75 },
  { id: "memory_800", icon: "🧠", title: "Gedächtnismeister", desc: "Erreiche 800 Punkte in Memory.", reward: 100 },
  { id: "snake_100", icon: "🐍", title: "Serpent Hunter", desc: "Erreiche 100 Punkte in Neon Serpent.", reward: 100 },
  { id: "blockrush_500", icon: "🧱", title: "Block Builder", desc: "Erreiche 500 Punkte in Block Rush.", reward: 100 },
  { id: "collector", icon: "🪙", title: "Sammler", desc: "Sammle 2.000 Coins.", reward: 150 },
  { id: "level_5", icon: "🏆", title: "Aufsteiger", desc: "Erreiche Level 5.", reward: 200 }
];

const CHALLENGES = [
  { id: "play_3", title: "Arcade-Fan", desc: "Spiele heute 3 Runden.", target: 3, reward: 100 },
  { id: "score_250", title: "Punktejäger", desc: "Erziele heute insgesamt 250 Punkte.", target: 250, reward: 125 },
  { id: "play_memory", title: "Kartenkönig", desc: "Spiele heute Memory.", target: 1, reward: 75 }
];

const KEY = "miniArcadeProfile";

function base() {
  return {
    xp: 0,
    coins: 1250,
    highscores: { reaction: 0, memory: 0, snake: 0, blockrush: 0 },
    achievements: [],
    challengeDate: "",
    challengeProgress: { play_3: 0, score_250: 0, play_memory: 0 },
    challengeRewards: []
  };
}

export function getProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    const profile = {
      ...base(),
      ...saved,
      highscores: { ...base().highscores, ...(saved?.highscores || {}) },
      achievements: saved?.achievements || [],
      challengeProgress: { ...base().challengeProgress, ...(saved?.challengeProgress || {}) },
      challengeRewards: saved?.challengeRewards || []
    };
    resetChallengesIfNeeded(profile);
    return profile;
  } catch {
    return base();
  }
}

export function saveProfile(profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function resetChallengesIfNeeded(profile) {
  if (profile.challengeDate !== today()) {
    profile.challengeDate = today();
    profile.challengeProgress = { play_3: 0, score_250: 0, play_memory: 0 };
    profile.challengeRewards = [];
    saveProfile(profile);
  }
}

export function getLevel(xp = getProfile().xp) {
  return Math.floor(xp / 100) + 1;
}

export function getLevelProgress(xp = getProfile().xp) {
  return xp % 100;
}

export function getBest(game) {
  return getProfile().highscores[game] || 0;
}

export function getAchievements() {
  return ACHIEVEMENTS;
}

export function getChallenges() {
  return CHALLENGES;
}

function unlock(profile, id) {
  if (profile.achievements.includes(id)) return null;
  const achievement = ACHIEVEMENTS.find(a => a.id === id);
  if (!achievement) return null;

  profile.achievements.push(id);
  profile.coins += achievement.reward;
  profile.xp += Math.round(achievement.reward * 0.5);
  return achievement;
}

function updateAchievements(profile, game, score) {
  const unlocked = [];
  const totalGames = Object.values(profile.highscores).filter(v => v > 0).length;

  if (totalGames > 0) {
    const a = unlock(profile, "first_game");
    if (a) unlocked.push(a);
  }
  if (game === "reaction" && score >= 100) {
    const a = unlock(profile, "reaction_100");
    if (a) unlocked.push(a);
  }
  if (game === "memory" && score >= 800) {
    const a = unlock(profile, "memory_800");
    if (a) unlocked.push(a);
  }
  if (game === "snake" && score >= 100) {
    const a = unlock(profile, "snake_100");
    if (a) unlocked.push(a);
  }
  if (game === "blockrush" && score >= 500) {
    const a = unlock(profile, "blockrush_500");
    if (a) unlocked.push(a);
  }
  if (profile.coins >= 2000) {
    const a = unlock(profile, "collector");
    if (a) unlocked.push(a);
  }
  if (getLevel(profile.xp) >= 5) {
    const a = unlock(profile, "level_5");
    if (a) unlocked.push(a);
  }

  return unlocked;
}

function updateChallenges(profile, game, score) {
  resetChallengesIfNeeded(profile);

  profile.challengeProgress.play_3 += 1;
  profile.challengeProgress.score_250 += score;
  if (game === "memory") profile.challengeProgress.play_memory += 1;

  const completed = [];

  for (const challenge of CHALLENGES) {
    const progress = profile.challengeProgress[challenge.id];
    if (progress >= challenge.target && !profile.challengeRewards.includes(challenge.id)) {
      profile.challengeRewards.push(challenge.id);
      profile.coins += challenge.reward;
      profile.xp += Math.round(challenge.reward * 0.5);
      completed.push(challenge);
    }
  }

  return completed;
}

export function recordGame(game, score) {
  const profile = getProfile();
  const oldBest = profile.highscores[game] || 0;
  const isNewHighscore = score > oldBest;

  if (isNewHighscore) profile.highscores[game] = score;

  const xpEarned = Math.max(10, Math.round(score * 0.5) + 10);
  const coinsEarned = Math.max(5, Math.round(score * 0.25) + 5);

  profile.xp += xpEarned;
  profile.coins += coinsEarned;

  const achievements = updateAchievements(profile, game, score);
  const challenges = updateChallenges(profile, game, score);

  saveProfile(profile);

  return {
    score,
    isNewHighscore,
    best: profile.highscores[game],
    xpEarned,
    coinsEarned,
    achievements,
    challenges,
    xp: profile.xp,
    coins: profile.coins,
    level: getLevel(profile.xp)
  };
}

export function resetProfile() {
  const profile = base();
  profile.challengeDate = today();
  saveProfile(profile);
  return profile;
}
