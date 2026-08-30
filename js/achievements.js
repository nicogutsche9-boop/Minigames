const ACHIEVEMENTS = [
  { id: "first_game", icon: "🎮", title: "Erster Schritt", desc: "Spiele dein erstes Minigame.", reward: 50 },
  { id: "reaction_100", icon: "⚡", title: "Schnelle Finger", desc: "Erreiche 100 Punkte in Reaction.", reward: 75 },
  { id: "memory_800", icon: "🧠", title: "Gedächtnismeister", desc: "Erreiche 800 Punkte in Memory.", reward: 100 },
  { id: "snake_100", icon: "🐍", title: "Serpent Hunter", desc: "Erreiche 100 Punkte in Neon Serpent.", reward: 100 },
  { id: "blockrush_500", icon: "🧱", title: "Block Builder", desc: "Erreiche 500 Punkte in Block Rush.", reward: 100 },
  { id: "dropduel_100", icon: "🔴", title: "Vier gewinnt", desc: "Gewinne eine Runde Drop Duel.", reward: 100 },
  { id: "collector", icon: "🪙", title: "Sammler", desc: "Sammle 2.000 Coins.", reward: 150 },
  { id: "level_5", icon: "🏆", title: "Aufsteiger", desc: "Erreiche Level 5.", reward: 200 }
];

const CHALLENGES = [
  {
    id: "play_3",
    title: "Arcade-Fan",
    desc: "Spiele heute 3 Runden.",
    target: 3,
    reward: 100
  },

  {
    id: "score_250",
    title: "Punktejäger",
    desc: "Erziele heute insgesamt 250 Punkte.",
    target: 250,
    reward: 125
  },

  {
    id: "play_memory",
    title: "Kartenkönig",
    desc: "Spiele heute Memory.",
    target: 1,
    reward: 75
  },

  {
    id: "dropduel_win",
    title: "Duel-Herausforderung",
    desc: "Gewinne heute eine Runde Drop Duel.",
    target: 1,
    reward: 100
  }
];


const KEY = "miniArcadeProfile";


function base() {
  return {
    xp: 0,

    coins: 1250,

    highscores: {
      reaction: 0,
      memory: 0,
      snake: 0,
      blockrush: 0,
      dropduel: 0
    },

    achievements: [],

    challengeDate: "",

    challengeProgress: {
      play_3: 0,
      score_250: 0,
      play_memory: 0,
      dropduel_win: 0
    },

    challengeRewards: [],

    stats: {
      dropduelWins: 0,
      dropduelLosses: 0,
      dropduelDraws: 0
    }
  };
}


export function getProfile() {
  try {
    const saved =
      JSON.parse(
        localStorage.getItem(KEY)
      );

    const defaults = base();

    const profile = {
      ...defaults,
      ...saved,

      highscores: {
        ...defaults.highscores,
        ...(saved?.highscores || {})
      },

      achievements:
        saved?.achievements || [],

      challengeProgress: {
        ...defaults.challengeProgress,
        ...(saved?.challengeProgress || {})
      },

      challengeRewards:
        saved?.challengeRewards || [],

      stats: {
        ...defaults.stats,
        ...(saved?.stats || {})
      }
    };

    resetChallengesIfNeeded(profile);

    return profile;

  } catch {
    return base();
  }
}


export function saveProfile(profile) {
  localStorage.setItem(
    KEY,
    JSON.stringify(profile)
  );
}


function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


function resetChallengesIfNeeded(profile) {

  if (
    profile.challengeDate !== today()
  ) {

    profile.challengeDate =
      today();

    profile.challengeProgress = {
      play_3: 0,
      score_250: 0,
      play_memory: 0,
      dropduel_win: 0
    };

    profile.challengeRewards = [];

    saveProfile(profile);
  }
}


export function getLevel(
  xp = getProfile().xp
) {

  return Math.floor(
    xp / 100
  ) + 1;

}


export function getLevelProgress(
  xp = getProfile().xp
) {

  return xp % 100;

}


export function getBest(game) {

  return (
    getProfile()
      .highscores[game] || 0
  );

}


export function getAchievements() {

  return ACHIEVEMENTS;

}


export function getChallenges() {

  return CHALLENGES;

}


function unlock(
  profile,
  id
) {

  if (
    profile.achievements
      .includes(id)
  ) {

    return null;

  }


  const achievement =
    ACHIEVEMENTS.find(
      a => a.id === id
    );


  if (!achievement) {

    return null;

  }


  profile.achievements.push(
    id
  );

  profile.coins +=
    achievement.reward;

  profile.xp +=
    Math.round(
      achievement.reward * 0.5
    );

  return achievement;

}


function updateAchievements(profile,game,score) 
{

  const unlocked = [];


  const totalGames =
    Object.values(
      profile.highscores
    )
    .filter(
      value => value > 0
    )
    .length;


  /*
   * Erstes Spiel
   */

  if (totalGames > 0) {

    const a =
      unlock(
        profile,
        "first_game"
      );

    if (a) unlocked.push(a);

  }


  /*
   * Reaction
   */

  if (
    game === "reaction" &&
    score >= 100
  ) {

    const a =
      unlock(
        profile,
        "reaction_100"
      );

    if (a) unlocked.push(a);

  }


  /*
   * Memory
   */

  if (
    game === "memory" &&
    score >= 800
  ) {

    const a =
      unlock(
        profile,
        "memory_800"
      );

    if (a) unlocked.push(a);

  }


  /*
   * Snake
   */

  if (
    game === "snake" &&
    score >= 100
  ) {

    const a =
      unlock(
        profile,
        "snake_100"
      );

    if (a) unlocked.push(a);

  }


  /*
   * Block Rush
   */

  if (
    game === "blockrush" &&
    score >= 500
  ) {

    const a =
      unlock(
        profile,
        "blockrush_500"
      );

    if (a) unlocked.push(a);

  }

if (game === "dropduel" && score >= 100) {
  const a = unlock(profile, "dropduel_100");
  if (a) unlocked.push(a);
}
  
  /*
   * Drop Duel:
   * Eine gewonnene Runde
   */

  if (
    game === "dropduel" &&
    profile.stats.dropduelWins >= 1
  ) {

    const a =
      unlock(
        profile,
        "dropduel_win"
      );

    if (a) unlocked.push(a);

  }


  /*
   * Drop Duel:
   * Fünf gewonnene Runden
   */

  if (
    profile.stats.dropduelWins >= 5
  ) {

    const a =
      unlock(
        profile,
        "dropduel_5wins"
      );

    if (a) unlocked.push(a);

  }


  /*
   * 2.000 Coins
   */

  if (
    profile.coins >= 2000
  ) {

    const a =
      unlock(
        profile,
        "collector"
      );

    if (a) unlocked.push(a);

  }


  /*
   * Level 5
   */

  if (
    getLevel(profile.xp) >= 5
  ) {

    const a =
      unlock(
        profile,
        "level_5"
      );

    if (a) unlocked.push(a);

  }


  return unlocked;

}


function updateChallenges(
  profile,
  game,
  score
) {

  resetChallengesIfNeeded(
    profile
  );


  /*
   * Allgemeine Herausforderungen
   */

  profile.challengeProgress.play_3 +=
    1;


  profile.challengeProgress.score_250 +=
    score;


  /*
   * Memory
   */

  if (
    game === "memory"
  ) {

    profile.challengeProgress.play_memory +=
      1;

  }


  /*
   * Drop Duel Siege
   */

  if (
    game === "dropduel" &&
    profile.lastDropDuelResult === "win"
  ) {

    profile.challengeProgress.dropduel_win +=
      1;

  }


  const completed = [];


  for (
    const challenge of CHALLENGES
  ) {

    const progress =
      profile.challengeProgress[
        challenge.id
      ];


    if (
      progress >= challenge.target &&
      !profile.challengeRewards.includes(
        challenge.id
      )
    ) {

      profile.challengeRewards.push(
        challenge.id
      );


      profile.coins +=
        challenge.reward;


      profile.xp +=
        Math.round(
          challenge.reward * 0.5
        );


      completed.push(
        challenge
      );

    }

  }


  return completed;

}


/*
 * Normales Spiel-Ergebnis
 */

export function recordGame(
  game,
  score
) {

  const profile =
    getProfile();


  const oldBest =
    profile.highscores[game] || 0;


  const isNewHighscore =
    score > oldBest;


  if (isNewHighscore) {

    profile.highscores[game] =
      score;

  }


  const xpEarned =
    Math.max(
      10,
      Math.round(score * 0.5) + 10
    );


  const coinsEarned =
    Math.max(
      5,
      Math.round(score * 0.25) + 5
    );


  profile.xp +=
    xpEarned;


  profile.coins +=
    coinsEarned;


  const achievements =
    updateAchievements(
      profile,
      game,
      score
    );


  const challenges =
    updateChallenges(
      profile,
      game,
      score
    );


  saveProfile(profile);


  return {

    score,

    isNewHighscore,

    best:
      profile.highscores[game],

    xpEarned,

    coinsEarned,

    achievements,

    challenges,

    xp:
      profile.xp,

    coins:
      profile.coins,

    level:
      getLevel(profile.xp)

  };

}


/*
 * Drop Duel Ergebnis
 *
 * win  = Spieler gewinnt
 * loss = Computer gewinnt
 * draw = Unentschieden
 */

export function recordDropDuelResult(
  result
) {

  const profile =
    getProfile();


  if (
    result === "win"
  ) {

    profile.stats.dropduelWins +=
      1;

  }

  else if (
    result === "loss"
  ) {

    profile.stats.dropduelLosses +=
      1;

  }

  else if (
    result === "draw"
  ) {

    profile.stats.dropduelDraws +=
      1;

  }


  /*
   * Ergebnis für Challenges merken
   */

  profile.lastDropDuelResult =
    result;


  /*
   * Drop Duel hat einen
   * eigenen Scorewert.
   */

  let xpEarned = 0;
  let coinsEarned = 0;


  if (result === "win") {

    xpEarned = 40;
    coinsEarned = 25;

  }

  else if (result === "draw") {

    xpEarned = 20;
    coinsEarned = 12;

  }

  else {

    xpEarned = 10;
    coinsEarned = 5;

  }


  profile.xp +=
    xpEarned;


  profile.coins +=
    coinsEarned;


  const achievements =
    updateAchievements(
      profile,
      "dropduel",
      0
    );


  const challenges =
    updateChallenges(
      profile,
      "dropduel",
      0
    );


  /*
   * lastDropDuelResult entfernen,
   * damit es nicht bei einem späteren
   * Spiel erneut zählt.
   */

  delete profile.lastDropDuelResult;


  saveProfile(profile);


  return {

    result,

    xpEarned,

    coinsEarned,

    achievements,

    challenges,

    xp:
      profile.xp,

    coins:
      profile.coins,

    level:
      getLevel(profile.xp),

    wins:
      profile.stats.dropduelWins,

    losses:
      profile.stats.dropduelLosses,

    draws:
      profile.stats.dropduelDraws

  };

}


export function resetProfile() {

  const profile =
    base();


  profile.challengeDate =
    today();


  saveProfile(profile);


  return profile;

}
