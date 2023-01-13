import * as constants from "./constants";
import * as keymaps from "./keymaps";
import * as utils from "./utils";

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

let canvas, ctx;
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

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.height=canvas.width=600;
  // canvas.height = window.innerHeight*0.8;
  // canvas.width = canvas.height*1.5;

  ctx.fillStyle = constants.BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

function paintGame(state) {
  console.log(state)
  ctx.fillStyle = constants.BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = constants.FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, constants.SNAKE_COLOUR);
  paintPlayer(state.players[1], size, "red");
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
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
  requestAnimationFrame(() => paintGame(gameState));
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
