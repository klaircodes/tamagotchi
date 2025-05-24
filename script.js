const head = document.querySelector('.tama-head');
const expression = document.querySelector('.tama-expression');
const buttonA = document.querySelector('.button-a');
const buttonB = document.querySelector('.button-b');
const buttonC = document.querySelector('.button-c');
const moodWindow = document.getElementById('mood-window');
const moodWindowImg = document.getElementById('mood-window-img');
const buttonOkay = document.getElementById('button-okay');
const foodImg = document.getElementById('food-img');
const toyImg = document.getElementById('toy-img');
const sleepImg = document.getElementById('sleep-img');

const expressions = {
  happy: {
    open: "images/happy-open.PNG",
    closed: "images/happy-closed.PNG"
  },
  angry: {
    open: "images/angry-open.PNG",
    closed: "images/angry-closed.PNG"
  },
  sad: {
    open: "images/sad-open.PNG",
    closed: "images/sad-closed.PNG"
  },
  sleepy: "images/sleepy.PNG"
};

const windows = {
  hungry: "images/window-hungry.PNG",
  bored: "images/window-bored.PNG",
  sleepy: "images/window-sleepy.PNG"
};

const foodImages = [
  "images/apple.PNG",
  "images/banana.PNG",
  "images/ramen.PNG",
  "images/sushi.PNG",
  "images/onigiri.PNG"
];

let state = null; // "hungry", "bored", "sleepy" or null
let actionCount = 0;
let happyTimeout = null;
let wrongActionTimeout = null;
let freePlayCounts = { A: 0, B: 0, C: 0 };
let isSleeping = false;
let sleepTimeout = null;
let currentMood = "happy";

function setMood(mood) {
  currentMood = mood;
  if (mood === "sleepy") {
    expression.src = expressions.sleepy;
  } else {
    expression.src = expressions[mood].open;
  }
}

function showMoodWindow(type) {
  if (moodWindow.style.display === "flex") return;
  moodWindow.style.display = "flex";
  moodWindowImg.src = windows[type];
}
buttonOkay.onclick = function() {
  moodWindow.style.display = "none";
};

function animateUp(imgEl, startTop) {
  let frame = 0;
  const totalFrames = 60;
  const slideAmount = 40;
  const pauseFrames = 240;
  function animate() {
    frame++;
    if (frame < totalFrames * 0.5) {
      imgEl.style.top = (startTop - slideAmount * (frame / (totalFrames * 0.5))) + "px";
      imgEl.style.opacity = 1;
    } else if (frame < totalFrames * 0.5 + pauseFrames) {
      imgEl.style.top = (startTop - slideAmount) + "px";
      imgEl.style.opacity = 1;
    } else {
      let fadeFrame = frame - (totalFrames * 0.5 + pauseFrames);
      imgEl.style.top = (startTop - slideAmount) + "px";
      imgEl.style.opacity = 1 - (fadeFrame / (totalFrames * 0.5));
    }
    if (frame < totalFrames + pauseFrames) {
      requestAnimationFrame(animate);
    } else {
      imgEl.style.display = "none";
    }
  }
  animate();
}

function showFood() {
  const food = foodImages[Math.floor(Math.random() * foodImages.length)];
  foodImg.src = food;
  let startTop = 390;
  foodImg.style.width = "70px";
  if (food.includes("apple")) foodImg.style.width = "60px";
  if (food.includes("sushi")) { foodImg.style.width = "80px"; startTop = 400; }
  foodImg.style.height = "auto";
  foodImg.style.top = startTop + "px";
  foodImg.style.opacity = 1;
  foodImg.style.display = "block";
  animateUp(foodImg, startTop);
}
function showToy() {
  toyImg.src = "images/toy.PNG";
  toyImg.style.width = "80px";
  toyImg.style.height = "auto";
  let startTop = 390;
  toyImg.style.top = startTop + "px";
  toyImg.style.opacity = 1;
  toyImg.style.display = "block";
  animateUp(toyImg, startTop);
}
function showSleep() {
  sleepImg.src = "images/z's.PNG";
  sleepImg.style.width = "60px";
  sleepImg.style.height = "auto";
  let startTop = 390;
  sleepImg.style.top = startTop + "px";
  sleepImg.style.opacity = 1;
  sleepImg.style.display = "block";
  animateUp(sleepImg, startTop);
}
function hideSleepVisual() { sleepImg.style.display = "none"; }

function triggerState(newState) {
  // If Chopper is sleeping and a sleepy event triggers, ignore it!
  if (newState === "sleepy" && isSleeping) {
    // Already asleep, do not show sleepy window again
    return;
  }
  // If sleeping but a different event triggers, wake up as usual
  if (isSleeping) {
    isSleeping = false;
    if (sleepTimeout) clearTimeout(sleepTimeout);
    setMood("happy");
    hideSleepVisual();
  }
  if (state || moodWindow.style.display === "flex") return;
  state = newState;
  actionCount = 0;
  if (state === "sleepy") {
    setMood("sad"); // Chopper is sad until C is pressed
  } else {
    setMood("angry");
  }
  showMoodWindow(newState);
  if (wrongActionTimeout) clearTimeout(wrongActionTimeout);
  if (happyTimeout) clearTimeout(happyTimeout);
}


// Random event triggers
setInterval(() => { if (!state && !isSleeping) triggerState("hungry"); }, 30000 + Math.random() * 10000);
setInterval(() => { if (!state && !isSleeping) triggerState("bored"); }, 50000 + Math.random() * 10000);
setInterval(() => { if (!state && !isSleeping) triggerState("sleepy"); }, 70000 + Math.random() * 10000);

function handleButton(type) {
  const stateMap = { A: "bored", B: "hungry", C: "sleepy" };
  const animMap = { A: showToy, B: showFood, C: showSleep };

  // --- Sleepy state waiting for sleep ---
  if (state === "sleepy" && !isSleeping) {
    if (type === "C") {
      setMood("sleepy");
      showSleep();
      isSleeping = true;
      moodWindow.style.display = "none";
      if (sleepTimeout) clearTimeout(sleepTimeout);
      sleepTimeout = setTimeout(() => {
        isSleeping = false;
        hideSleepVisual();
        setMood("happy");
        state = null;
      }, 300000);
    } else {
      setMood("sad");
      showMoodWindow("sleepy");
    }
    return;
  }

  // --- Sleeping ---
  if (isSleeping) {
    if (type === "C") {
      setMood("sleepy");
      showSleep();
    } else {
      isSleeping = false;
      hideSleepVisual();
      setMood("happy");
      state = null;
      if (sleepTimeout) clearTimeout(sleepTimeout);
    }
    return;
  }

  // --- Hungry/Bored states ---
  if (state) {
    if (state === stateMap[type]) {
      actionCount++;
      animMap[type]();
      setMood("happy");
      state = null;
      moodWindow.style.display = "none";
      if (happyTimeout) clearTimeout(happyTimeout);
    } else {
      setMood("angry");
      showMoodWindow(state);
      if (wrongActionTimeout) clearTimeout(wrongActionTimeout);
      wrongActionTimeout = setTimeout(() => { setMood("angry"); }, 500);
    }
    return;
  }

  // --- Free play logic (only A and B can get angry!) ---
  if (type === "C") {
    // C is always "free", just show sleep animation, never angry
    showSleep();
    setMood("sleepy");
    return;
  }

  // Only for A or B in free play!
  animMap[type]();
  freePlayCounts[type] = (freePlayCounts[type] || 0) + 1;
  if (freePlayCounts[type] <= 2) {
    setMood("happy");
  } else {
    setMood("angry");
    if (happyTimeout) clearTimeout(happyTimeout);
    happyTimeout = setTimeout(() => {
      setMood("happy");
      freePlayCounts[type] = 0;
    }, 5000);
  }
}



buttonA.onclick = () => handleButton("A");
buttonB.onclick = () => handleButton("B");
buttonC.onclick = () => handleButton("C");

// ---- Breathing and Blinking ----
function animateBreathing() {
  const t = Date.now() / 900;
  const breath = Math.sin(t) * 3.5;
  head.style.top = `${430 + breath}px`;
  expression.style.top = `${525 + breath}px`;
  requestAnimationFrame(animateBreathing);
}
animateBreathing();

function blinkLoop() {
  setTimeout(() => {
    // No blink when sleepy: just keep that face
    if (currentMood === "sleepy") {
      blinkLoop();
      return;
    }
    expression.src = expressions[currentMood].closed;
    setTimeout(() => {
      expression.src = expressions[currentMood].open;
      blinkLoop();
    }, 130);
  }, 1800 + Math.random() * 2500);
}
blinkLoop();

setMood("happy");
