import * as constants from "./constants";
import * as keymaps from "./keymaps";
import * as utils from "./utils";
import { drawBoard, drawHold, drawQueue } from "./draw";

export { utils, constants, keymaps };

const socket = io("ws://localhost:3000", {
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
    console.log("pressed");
    socket.emit("startGame", _roomCode);
    console.log("pressed");
}

let p1H, p1B, p1Q;
let p1Hc, p1Bc, p1Qc;
let p2H, p2B, p2Q;
let p2Hc, p2Bc, p2Qc;
let playerNumber;
let gameHandling;
let gameActive = false;

function init() {
    gameHandling = constants.DEFAULT_GAME_HANDLING;
    keymaps.applyHandling(gameHandling);

    console.log(gameHandling, "lmao");
    console.log("why?")

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

function handleInitGame() {
    console.log("lmao");
    roomCodeDisplay.style.display = "none";
    startBtn.style.display = "none";

    handleScoreUpdate();

    gameActive = true;
}

function keydown(e) {
    console.log(e.keyCode);
    if (!gameActive) {
        return;
    }
    socket.emit("keydown", e.keyCode);
}

function keyup(e) {
    console.log(e.keyCode);
    if (!gameActive) {
        return;
    }
    socket.emit("keyup", e.keyCode);
}

function drawGame(state) {
    // console.log(state)
    // ctx1.fillStyle = constants.BG_COLOUR;
    // ctx1.fillRect(0, 0, canvas.width, canvas.height);

    // const food = state.food;
    // const gridsize = state.gridsize;
    // const size = canvas.width / gridsize;

    // ctx.fillStyle = constants.FOOD_COLOUR;
    // ctx.fillRect(food.x * size, food.y * size, size, size);

    // paintPlayer(state.players[0], size, constants.SNAKE_COLOUR);
    // paintPlayer(state.players[1], size, "red");
    drawHold(p1Hc, p1H, state.p1Board, state.p1TimeLeft);
    drawBoard(p1Bc, p1B, state.p1Board, state.p1TimeLeft);
    // console.log("PLEASE???");
    drawQueue(p1Qc, p1Q, state.p1Board, state.p1TimeLeft);

    drawHold(p2Hc, p2H, state.p2Board, state.p2TimeLeft);
    drawBoard(p2Bc, p2B, state.p2Board, state.p2TimeLeft);
    drawQueue(p2Qc, p2Q, state.p2Board, state.p2TimeLeft);
}

function handleInit(number, roomCode) {
    playerNumber = number;
    _roomCode = roomCode
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => drawGame(gameState));
    // requestAnimationFrame(() => console.log(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    data = JSON.parse(data);

    gameActive = false;

    if (data.winner === playerNumber) {
        myScore++;
        alert("You Win!");
    } else {
        theirScore++;
        alert("You Lose :(");
    }

    handleScoreUpdate();
    startBtn.style.display = "block";
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
