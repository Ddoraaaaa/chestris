import * as constants from "./constants";
import * as keymaps from "./keymaps";
import * as utils from "./utils";
import { drawBoard, drawHold, drawQueue } from "./draw";
import gameBoard from "./game/board";

export { utils, constants, keymaps };

const socket = io(
                    "http://localhost:3000" || 
                    "https://chestris.herokuapp.com/", {
    transports: ["websocket", "polling", "flashsocket"],
});

socket.on("init", handleInit);
socket.on("initGame", handleInitGame);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("roomCode", handleRoomCode);
socket.on("unknownCode", handleUnknownCode);
socket.on("tooManyPlayers", handleTooManyPlayers);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");

const newRoomBtn = document.getElementById("newRoomButton");
const joinRoomBtn = document.getElementById("joinRoomButton");
const startBtn = document.getElementById("startButton");

const roomCodeInput = document.getElementById("roomCodeInput");

const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const roomCodeText = document.getElementById("roomCodeText");

const playerScores = document.getElementById("playerScores");

var myScore = 0, theirScore = 0;
var _roomCode;

newRoomBtn.addEventListener("click", newRoom);
joinRoomBtn.addEventListener("click", joinRoom);
startBtn.addEventListener("click", startGame);

function newRoom() {
    socket.emit("newRoom");
    init();
}

function joinRoom() {
    _roomCode = roomCodeInput.value;
    socket.emit("joinRoom", _roomCode);
    handleRoomCode(_roomCode);
    init();
}

function startGame() {
    // console.log("pressed");
    socket.emit("startGame", [_roomCode, timeRule]);
    // console.log("pressed");
}

let p1H, p1B, p1Q;
let p1Hc, p1Bc, p1Qc;
let p2H, p2B, p2Q;
let p2Hc, p2Bc, p2Qc;
let playerNumber;
let gameActive = false;

let intervalId;
let p1Board, p2Board, times;

// +++++++++++++++++ CONTROLS ++++++++++++++++++++++++++++++++++++++++++++++++

const playerControls = JSON.parse(JSON.stringify(constants.DEFAULT_CONTROLS));
const controlState = {
    dasCnt: 0,
    dasDir: "N",
    dasTime: null,

    downCnt: 0,
    downTime: null,
}
const keyIsDown = Array(200).fill(0);
const timeRule = JSON.parse(JSON.stringify(constants.DEFAULT_TIMERULE));

//+++++++++++++++++ INITIALIZE +++++++++++++++++++++++++++++++++++++++++++++++

//Initialize * room *
function init() {
    // console.log("why?")

    utils.hideElement(initialScreen);
    gameScreen.style.display = "block";

    p1H = document.getElementById("p1HoldCv"); p1Hc = p1H.getContext("2d");
    p1B = document.getElementById("p1BoardCv"); p1Bc = p1B.getContext("2d");
    p1Q = document.getElementById("p1QueueCv"); p1Qc = p1Q.getContext("2d");
    p2H = document.getElementById("p2HoldCv"); p2Hc = p2H.getContext("2d");
    p2B = document.getElementById("p2BoardCv"); p2Bc = p2B.getContext("2d");
    p2Q = document.getElementById("p2QueueCv"); p2Qc = p2Q.getContext("2d");

    p1H.width = p2H.width = p1Q.width = p2Q.width 
                          = 4 * constants.MINO_SIZE + 2 * constants.CV_PAD;
    p1B.width = p2B.width = constants.BOARD_WIDTH * constants.MINO_SIZE +
                            constants.GARBAGE_SIZE + 2 * constants.CV_PAD;
    p1B.height = p2B.height = p1H.height = p2H.height = p1Q.height = p2Q.height
                            = constants.BOARD_VISIBLE_HEIGHT * constants.MINO_SIZE +
                              constants.CV_PAD * 2;

    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
}

//Initialize * match *
function handleInit(number, roomCode) {
    playerNumber = number;
    _roomCode = roomCode;
    keymaps.updateKeys(playerControls);
}

//Initialize * game *
function handleInitGame() {
    // console.log("lmao");
    roomCodeDisplay.style.display = "none";
    startBtn.style.display = "none";
    
    //init game
    playerBoard = new gameBoard(7);

    gameActive = true;
}

//++++++++++++++ GAME INTERVAL +++++++++++++++++++++++++++++++++++++++++++++++

function startGameInterval() {
    intervalId = setInterval(() => {
    }, 1000 / FRAME_RATE);
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }
    // console.log(1, controlState);
    //horizontal movement


    //do more stuff
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => drawGame(gameState));
    // requestAnimationFrame(() => console.log(gameState));
}

//+++++++++++++ HANDLING INPUT +++++++++++++++++++++++++++++++++++++++++++++++

function keydown(e) {
    if (!gameActive) {
        return;
    }
    if(keyIsDown[e.keyCode]) {
        return;
    }
    keyIsDown[e.keyCode] = true;
    let keyCode =  Object.keys(playerControls.controls).find(key => playerControls.controls[key] === e.keyCode);
    // console.log(keyCode);
    switch(keyCode) {
        case "hd":
            socket.emit("addAction", ["hd", 0])
            break;
        case "sd":
            socket.emit("addAction", ["sd", 1]);
            controlState.downCnt = 0;
            controlState.downTime = Number(Date.now());
            break;
        case "rcw":
            playerBoard.rotatePiece(1);
            break;
        case "r180":
            playerBoard.rotatePiece(2);
            break;
        case "rccw":
            playerBoard.rotatePiece(3);
            break;
        case "hold":
            playerBoard.holdPiece();
            break;
        case "left":
            playerBoard.moveSideways(1, -1);
            controlState.dasDir = "left";
            controlState.dasCnt = 0;
            controlState.dasTime = Number(Date.now()) + playerControls.handling.das;
            break;
        case "right":
            playerBoard.moveSideways(1, 1);
            controlState.dasDir = "right";
            controlState.dasCnt = 0;
            controlState.dasTime = Number(Date.now()) + playerControls.handling.das;
            break;
    }
    // console.log(controlState, "this happened");
}

function keyup(e) {
    if (!gameActive) {
        return;
    }
    keyIsDown[e.keyCode] = false;
    let keyCode =  Object.keys(playerControls.controls).find(key => playerControls.controls[key] === e.keyCode);    
    switch(keyCode) {
        case "sd":
            controlState.downTime = null;
            break;
        case "left":
            if(controlState.dasDir == "left") {
                controlState.dasDir = "N";
                controlState.dasTime = null;
            }
            break;
        case "right":
            if(controlState.dasDir == "right") {
                controlState.dasDir = "N";
                controlState.dasTime = null;
            }
            break;
    }
}

function continueInput() {
    let curTime = Number(Date.now()), timesDid;
    if(controlState.dasDir != "N" && controlState.dasTime < curTime) {
        timesDid = Math.floor((curTime - controlState.dasTime) / playerControls.handling.arr);
        controlState.dasCnt+= timesDid;
        controlState.dasTime += timesDid * playerControls.handling.arr;
    }
    // console.log(2, controlState);
    if(controlState.dasCnt) {
        socket.emit("addAction", [controlState.dasDir, controlState.dasCnt]);
        controlState.dasCnt = 0;
    }

    //vertical movement
    if(controlState.downTime != null) {
        timesDid = Math.floor((curTime - controlState.downTime) / playerControls.handling.grav);
        controlState.downCnt+= timesDid;
        controlState.downTime += timesDid * playerControls.handling.grav;
    }
    // console.log(3, controlState);
    if(controlState.downCnt) {
        socket.emit("addAction", ["sd", controlState.downCnt]);
        controlState.downCnt = 0;
    }
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    data = JSON.parse(data);

    
    if (data.winner === playerNumber) {
        myScore++;
        alert("You Win!");
    } else {
        theirScore++;
        alert("You Lose :(");
    }
    
    gameActive = false;
    handleScoreUpdate();

    startBtn.style.display = "block";
}

//++++++++++++++ DRAW GAME +++++++++++++++++++++++++++++++++++++++++++++++++++

function drawGame(state) {
    drawHold(p1Hc, p1H, state.p1Board, state.p1TimeLeft);
    drawBoard(p1Bc, p1B, state.p1Board, state.p1TimeLeft);
    // console.log("PLEASE???");
    drawQueue(p1Qc, p1Q, state.p1Board, state.p1TimeLeft);

    drawHold(p2Hc, p2H, state.p2Board, state.p2TimeLeft);
    drawBoard(p2Bc, p2B, state.p2Board, state.p2TimeLeft);
    drawQueue(p2Qc, p2Q, state.p2Board, state.p2TimeLeft);
}

function handleScoreUpdate() {
    playerScores.style.display = "block";
    playerScores.innerText=`${myScore} - ${theirScore}`
}

function handleRoomCode(roomCode) {
    roomCodeText.innerText = roomCode;
}

function handleUnknownCode() {
    reset();
    alert("Unknown Room")
}

function handleTooManyPlayers() {
    reset();
    alert("Room already full");
}

function reset() {
    playerNumber = null;
    roomCodeInput.value = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}
