const arena = document.querySelector("#reactionArena");
const target = document.querySelector("#target");
const intro = document.querySelector("#reactionIntro");

const scoreEl = document.querySelector("#scoreValue");
const timeEl = document.querySelector("#timeValue");

const startButton =
  document.querySelector("#startReactionButton");

const soundButton =
  document.querySelector("#soundButton");

let score = 0;
let timeLeft = 30;

let running = false;
let waitingForTarget = false;

let timerId = null;
let targetTimeout = null;

let onGameOver = null;
let initialized = false;

let soundEnabled = true;


/* =========================================================
   SOUND
   ========================================================= */

function loadSoundSetting() {

  const saved =
    localStorage.getItem("miniArcadeSound");

  if (saved !== null) {
    soundEnabled = saved === "true";
  }

}


function playBeep(frequency = 500, duration = 0.05) {

  if (!soundEnabled) return;

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

    const audioContext =
      new AudioContext();

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.frequency.value =
      frequency;

    oscillator.type = "square";

    gain.gain.setValueAtTime(
      0.04,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime + duration
    );

  } catch {
    /* Sound darf das Spiel nicht stoppen */
  }

}


/* =========================================================
   UI
   ========================================================= */

function updateUI() {

  if (scoreEl) {
    scoreEl.textContent =
      score;
  }

  if (timeEl) {
    timeEl.textContent =
      timeLeft;
  }

}


/* =========================================================
   ZUFÄLLIGE POSITION
   ========================================================= */

function randomPosition() {

  const arenaRect =
    arena.getBoundingClientRect();

  const targetSize =
    Math.max(
      45,
      Math.min(
        90,
        arenaRect.width * 0.13
      )
    );


  const padding =
    targetSize * 0.5;


  const minX =
    padding;

  const maxX =
    arenaRect.width - padding;


  const minY =
    padding;

  const maxY =
    arenaRect.height - padding;


  const x =
    minX +
    Math.random() *
    Math.max(
      0,
      maxX - minX
    );


  const y =
    minY +
    Math.random() *
    Math.max(
      0,
      maxY - minY
    );


  return {
    x,
    y,
    size: targetSize
  };

}


/* =========================================================
   ZIEL ANZEIGEN
   ========================================================= */

function showTarget() {

  if (!running) return;


  waitingForTarget = true;


  const position =
    randomPosition();


  target.style.width =
    `${position.size}px`;

  target.style.height =
    `${position.size}px`;


  target.style.left =
    `${position.x - position.size / 2}px`;

  target.style.top =
    `${position.y - position.size / 2}px`;


  target.classList.remove(
    "hidden"
  );


  playBeep(
    650,
    0.04
  );

}


/* =========================================================
   NEUES ZIEL
   ========================================================= */

function scheduleTarget() {

  if (!running) return;


  waitingForTarget = false;


  target.classList.add(
    "hidden"
  );


  const delay =
    350 +
    Math.random() * 650;


  clearTimeout(
    targetTimeout
  );


  targetTimeout =
    setTimeout(
      showTarget,
      delay
    );

}


/* =========================================================
   ZIEL GETROFFEN
   ========================================================= */

function hitTarget(event) {

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }


  if (
    !running ||
    !waitingForTarget
  ) {

    return;

  }


  score += 10;

  updateUI();


  playBeep(
    900,
    0.06
  );


  /*
   * Kurzer visueller Treffer-Effekt.
   */

  target.classList.add(
    "hit"
  );


  setTimeout(() => {

    target.classList.remove(
      "hit"
    );

  }, 100);


  scheduleTarget();

}


/* =========================================================
   SPIEL TIMER
   ========================================================= */

function startTimer() {

  clearInterval(
    timerId
  );


  timerId =
    setInterval(() => {

      if (!running) {
        return;
      }


      timeLeft--;

      updateUI();


      if (
        timeLeft <= 0
      ) {

        endGame();

      }

    }, 1000);

}


/* =========================================================
   SPIEL STARTEN
   ========================================================= */

function startGame() {

  stopTimers();


  score = 0;
  timeLeft = 30;

  running = true;
  waitingForTarget = false;


  updateUI();


  intro.classList.add(
    "hidden"
  );


  target.classList.add(
    "hidden"
  );


  playBeep(
    500,
    0.08
  );


  startTimer();

  scheduleTarget();

}


/* =========================================================
   SPIEL BEENDEN
   ========================================================= */

function endGame() {

  if (!running) {
    return;
  }


  running = false;
  waitingForTarget = false;


  stopTimers();


  target.classList.add(
    "hidden"
  );


  playBeep(
    250,
    0.15
  );


  if (typeof onGameOver === "function") {

    onGameOver(
      score
    );

  }

}


/* =========================================================
   TIMER STOPPEN
   ========================================================= */

function stopTimers() {

  if (timerId !== null) {

    clearInterval(
      timerId
    );

    timerId = null;

  }


  if (targetTimeout !== null) {

    clearTimeout(
      targetTimeout
    );

    targetTimeout = null;

  }

}


/* =========================================================
   SOUND BUTTON
   ========================================================= */

function toggleSound() {

  soundEnabled =
    !soundEnabled;


  localStorage.setItem(
    "miniArcadeSound",
    String(soundEnabled)
  );


  updateSoundButton();


  if (soundEnabled) {

    playBeep(
      700,
      0.06
    );

  }

}


function updateSoundButton() {

  if (!soundButton) {
    return;
  }


  soundButton.textContent =
    soundEnabled
      ? "🔊"
      : "🔇";


  soundButton.setAttribute(
    "aria-label",
    soundEnabled
      ? "Sound ausschalten"
      : "Sound einschalten"
  );

}


/* =========================================================
   CLICK AUF ARENA
   ========================================================= */

function handleArenaClick(event) {

  /*
   * Nur das tatsächliche Ziel
   * darf Punkte geben.
   */

  if (
    event.target === target ||
    target.contains(event.target)
  ) {

    return;

  }


  if (
    !running ||
    !waitingForTarget
  ) {

    return;

  }


  /*
   * Fehlklick:
   * Kein Punkt, aber das Ziel
   * verschwindet und erscheint neu.
   */

  playBeep(
    180,
    0.04
  );


  scheduleTarget();

}


/* =========================================================
   INITIALISIERUNG
   ========================================================= */

export function initReactionGame(options = {}) {

  onGameOver =
    options.onGameOver ||
    onGameOver;


  loadSoundSetting();

  updateSoundButton();


  if (!initialized) {

    if (startButton) {

      startButton.addEventListener(
        "click",
        startGame
      );

    }


    if (target) {

      target.addEventListener(
        "click",
        hitTarget
      );


      target.addEventListener(
        "pointerdown",
        hitTarget
      );

    }


    if (arena) {

      arena.addEventListener(
        "click",
        handleArenaClick
      );

    }


    if (soundButton) {

      soundButton.addEventListener(
        "click",
        toggleSound
      );

    }


    initialized = true;

  }


  running = false;

  waitingForTarget = false;

  stopTimers();


  score = 0;

  timeLeft = 30;


  updateUI();

  updateSoundButton();


  if (intro) {

    intro.classList.remove(
      "hidden"
    );

  }


  if (target) {

    target.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   SPIEL STOPPEN
   ========================================================= */

export function stopReactionGame() {

  running = false;

  waitingForTarget = false;

  stopTimers();


  if (target) {

    target.classList.add(
      "hidden"
    );

  }

}
