import "./style.css";

const container = document.querySelector("#container");
const modal = document.querySelector(".modal");
const openModal = document.querySelector(".openModal");
const closeModal = document.querySelector(".closeModal");
const submitModal = document.querySelector(".submitModal");
const inputName = document.querySelector("input");
const playerName = document.querySelector(".player-Name");
let timerCount = document.querySelector(".timer-count");
const pokeWallpaper = document.querySelector(".poke-wallpaper");
const gameContent = document.querySelector("#gameContent");
const chooseTarget = document.querySelector(".chooseTarget");
const dropDown = document.querySelector(".dropDown");
const feedbackMsg = document.querySelector(".feedback-msg");
const resetBtn = document.querySelector(".reset");
const scores = document.querySelector(".scores");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const dbCharacter = collection(db, "characters");
export const dbLeaderBoard = collection(db, "leaderboard");

let foundPokes = [];
let pokesCount = 0;

let minutes = 0;
let seconds = 0;

let count = 0;
let recordTime;

openModal.addEventListener("click", () => {
  modal.style.display = "block";
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

const timer = () => {
  recordTime = setInterval(counter, 1000);
};

const counter = () => {
  ++count;
  minutes = Math.floor(count / 60);
  seconds = count % 60;
  timerCount.innerHTML = `${minutes}:${seconds}`;
};

submitModal.addEventListener("click", () => {
  clearInterval(recordTime);
  count = 0;
  modal.style.display = "none";
  playerName.innerHTML = inputName.value;
  timer();
  pokeWallpaper.addEventListener("click", play, true);
});

const play = (e) => {
  let rect = e.currentTarget.getBoundingClientRect();
  let Xcoord = e.clientX - rect.left;
  let Ycoord = e.clientY - rect.top;
  chooseTarget.style.left = `${Math.floor(Xcoord - 25)}px`;
  chooseTarget.style.top = `${Math.floor(Ycoord - 25)}px`;
  chooseTarget.classList.add("show");

  dropDown.addEventListener("click", (e) => {
    const pokeCharacter = e.target.textContent.trim();
    let leftCoord = Number(chooseTarget.style.left.replace("px", "").trim());
    let topCoord = Number(chooseTarget.style.top.replace("px", "").trim());
    dbCharacter
      .doc(`${pokeCharacter}`)
      .get()
      .then(function (doc) {
        const pokeData = doc.data();
        if (
          pokeData.posX > leftCoord - 25 &&
          pokeData.posX < leftCoord + 25 &&
          pokeData.posY > topCoord - 25 &&
          pokeData.posY < topCoord + 25
        ) {
          if (!foundPokes.includes(pokeCharacter)) {
            foundPokes.push(pokeCharacter);
            pokesCount = foundPokes.length;
            feedbackMsg.innerHTML = "found, Yay!";
            const pokeItem = document.querySelector(`.${pokeCharacter}`);
            pokeItem.classList.add("done");
            const markItem = document.querySelector(`.mark${pokeCharacter}`);
            markItem.style.left = `${pokeData.posX}px`;
            markItem.style.top = `${pokeData.posY}px`;
            markItem.classList.add("show-marker");
            if (pokesCount === 3) {
              const currPlayer = playerName.textContent;
              dbLeaderBoard.doc(`${currPlayer}`).set({
                player: currPlayer,
                min: minutes,
                sec: seconds,
              });
              clearInterval(recordTime);
            }
          }
        } else {
          feedbackMsg.innerHTML = "Try Again!";
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    chooseTarget.classList.remove("show");
  });
};

resetBtn.addEventListener("click", () => {
  pokeWallpaper.removeEventListener("click", play, true);
  foundPokes = [];
  feedbackMsg.innerHTML = "";
  playerName.innerHTML = "";
  timerCount.innerHTML = "";
  chooseTarget.classList.remove("show");
  const donePokes = document.querySelectorAll(".done");
  donePokes.forEach((pokeItem) => pokeItem.classList.remove("done"));
  const markedPokes = document.querySelectorAll(".show-marker");
  markedPokes.forEach((pokeItem) => pokeItem.classList.remove("show-marker"));
});

const loadLeaderBoard = () => {
  let query = dbLeaderBoard.orderBy("min", "asc").orderBy("sec", "asc");
  query.onSnapshot(function (snapshot) {
    snapshot.docChanges().forEach(function (change) {
      if (change.type === "added") {
        let scorelog = change.doc.data();
        scores.innerHTML += `
                ${scorelog.player} -> ${scorelog.min}:${scorelog.sec} <br>
                `;
      }
    });
  });
};

loadLeaderBoard();
