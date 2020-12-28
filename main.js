const container = document.querySelector('#container');

const modal = document.querySelector('.modal');
const openModal = document.querySelector('.openModal');
const closeModal = document.querySelector('.closeModal');
const submitModal = document.querySelector('.submitModal');
const inputName = document.querySelector('input');
const playerName = document.querySelector('.player-Name');
let timerCount = document.querySelector('.timer-count');
const pokeWallpaper = document.querySelector('.poke-wallpaper');
const gameContent = document.querySelector('#gameContent');
const chooseTarget = document.querySelector('.chooseTarget');
const dropDown = document.querySelector('.dropDown');
let dbCharacter = firebase.firestore().collection("characters");
let dbLeaderBoard = firebase.firestore().collection("leaderboard");
const feedbackMsg = document.querySelector('.feedback-msg');
const resetBtn = document.querySelector('.reset');
const scores = document.querySelector('.scores');

let foundPokes=[]; //found pokes are pushed to the array
let pokesCount=0; // number of pokes found (checked from array-foundPokes)

let minutes=0;
let seconds=0;

let count=0;
let recordTime;

openModal.addEventListener('click', ()=> {
    modal.style.display= "block";
})

closeModal.addEventListener('click', () => {
    modal.style.display= "none";
})

const timer = () => {
    recordTime= setInterval(counter, 1000);
}

const counter = () => {
    ++count;
    minutes= Math.floor(count / 60);
    seconds= count % 60;
    timerCount.innerHTML = `${minutes}:${seconds}`;
}

submitModal.addEventListener('click', () => {
    clearInterval(recordTime); //clear the timer if its already present there
    count=0; //reset the count to 0
    modal.style.display = "none"; //hide modal
    playerName.innerHTML = inputName.value;
    timer(); 
    pokeWallpaper.addEventListener('click', play, true);
})

const play = (e) => {
    let rect = e.currentTarget.getBoundingClientRect();
    let Xcoord = e.clientX - rect.left;
    let Ycoord = e.clientY - rect.top;
    chooseTarget.style.left=`${Math.floor(Xcoord-25)}px`; //to make box around target
    chooseTarget.style.top=`${Math.floor(Ycoord-25)}px`;
    chooseTarget.classList.add('show');

    dropDown.addEventListener('click', (e) => { // need to listen on dropdown not whole chooseTarget otherwise clicking inside box returns blank
    const pokeCharacter = e.target.textContent.trim(); // remove spaces from both ends of string
    let leftCoord = Number(chooseTarget.style.left.replace('px', '').trim()); //chooseTarget dimensions at the time dropdown choice was made
    let topCoord = Number(chooseTarget.style.top.replace('px', '').trim());
    dbCharacter.doc(`${pokeCharacter}`).get().then(function(doc){
        const pokeData = doc.data();
        if (pokeData.posX > leftCoord-25 && pokeData.posX < leftCoord+25 && pokeData.posY > topCoord-25 && pokeData.posY < topCoord+25) { // basically its like x-25 < posX < x+25 and y-25 < posY < y+25 , x (left) and y (top) are the clicked coordinates
            if (!foundPokes.includes(pokeCharacter)) { // to avoid incrementing of pokes on repeated clicks at the same location
                foundPokes.push(pokeCharacter);
                pokesCount = foundPokes.length;
                feedbackMsg.innerHTML='found, Yay!';
                const pokeItem=document.querySelector(`.${pokeCharacter}`);
                pokeItem.classList.add('done'); // greyscale and strikethru
                const markItem = document.querySelector(`.mark${pokeCharacter}`);
                markItem.style.left=`${pokeData.posX}px`; 
                markItem.style.top=`${pokeData.posY}px`;
                markItem.classList.add('show-marker'); //mark the map at specified location where pokemon is found
                if (pokesCount===3) {
                    const currPlayer = playerName.textContent;
                    dbLeaderBoard.doc(`${currPlayer}`).set({
                        player: currPlayer,
                        min: minutes,
                        sec: seconds
                    });
                    clearInterval(recordTime);
                }
            }
            
        } else {
            feedbackMsg.innerHTML='Try Again!';
        }
        
    }).catch(function(error){
        console.log(error);
    })
    chooseTarget.classList.remove('show'); // hide chooseTarget after selecting choice
    })
}

resetBtn.addEventListener('click', () => {
    pokeWallpaper.removeEventListener('click', play, true); 
    foundPokes=[]; //make the array empty for next player
    feedbackMsg.innerHTML='';
    playerName.innerHTML='';
    timerCount.innerHTML='';
    chooseTarget.classList.remove('show');
    const donePokes= document.querySelectorAll('.done'); // remove grayscale and strikethru from poke characters
    donePokes.forEach(pokeItem => pokeItem.classList.remove('done'));
    const markedPokes = document.querySelectorAll('.show-marker'); // remove map marks
    markedPokes.forEach(pokeItem => pokeItem.classList.remove('show-marker'));
})

const loadLeaderBoard = () => { 
    let query = dbLeaderBoard.orderBy("min", "asc").orderBy("sec", "asc");
    query.onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if (change.type==="added") {
                let scorelog= change.doc.data();
                scores.innerHTML +=`
                ${scorelog.player} -> ${scorelog.min}:${scorelog.sec} <br>
                `
            }
            
        })
    })
}

loadLeaderBoard();
