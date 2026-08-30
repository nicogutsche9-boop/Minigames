const STORAGE_KEY = "miniArcadeProfile";

const DEFAULT_PROFILE = {
  xp: 0,
  coins: 1250,
  highscores: {
    reaction: 0,
    memory: 0,
    snake: 0
  }
};

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      ...DEFAULT_PROFILE,
      ...saved,
      highscores: {
        ...DEFAULT_PROFILE.highscores,
        ...(saved?.highscores || {})
      }
    };
  } catch {
    return structuredClone(DEFAULT_PROFILE);
  }
}

function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getProfile() {
  return loadProfile();
}

export function getLevel(xp = loadProfile().xp) {
  return Math.floor(xp / 100) + 1;
}

export function getLevelProgress(xp = loadProfile().xp) {
  return xp % 100;
}

export function getBest(game) {
  return loadProfile().highscores[game] || 0;
}

export function recordGame(game, score) {
  const profile = loadProfile();
  const oldBest = profile.highscores[game] || 0;
  const isNewHighscore = score > oldBest;

  if (isNewHighscore) {
    profile.highscores[game] = score;
  }

  const xpEarned = Math.max(10, Math.round(score * 0.5) + 10);
  const coinsEarned = Math.max(5, Math.round(score * 0.25) + 5);

  profile.xp += xpEarned;
  profile.coins += coinsEarned;

  saveProfile(profile);

  return {
    score,
    isNewHighscore,
    best: profile.highscores[game],
    xpEarned,
    coinsEarned,
    xp: profile.xp,
    coins: profile.coins,
    level: getLevel(profile.xp)
  };
}

export function resetProfile() {
  saveProfile(structuredClone(DEFAULT_PROFILE));
  return getProfile();
}
