import * as constants from "./constants";
import * as keymaps from "./keymaps";
import * as utils from "./utils";
import { drawBoard, drawHold, drawQueue } from "./draw";
import gameBoard from "./game/board";

export { utils, constants, keymaps };

const socket = io(
                    // "http://localhost:3000" || 
                    "https://chestris.herokuapp.com/", {
    transports: ["websocket", "polling", "flashsocket"],
});

socket.on("init", handleInit);
socket.on("initGame", handleInitGame);
socket.on("updFromOpponent", handleOpponent);
socket.on("updFromServer", handleServer);
socket.on("gameOver", handleGameOver);
socket.on("roomCode", handleRoomCode);
socket.on("unknownCode", handleUnknownCode);
socket.on("tooManyPlayers", handleTooManyPlayers);
// socket.on("setTimeRules", setTimeRule);
socket.on("p2JoinGame", handleNewPlayer);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");

const newRoomBtn = document.getElementById("newRoomButton");
const joinRoomBtn = document.getElementById("joinRoomButton");
const startBtn = document.getElementById("startButton");

const roomCodeInput = document.getElementById("roomCodeInput");

const roomCodeText = document.getElementById("roomCodeText");
const gameTimeRule = document.getElementById("gameRuleForm");

const playerScores = document.getElementById("playerScores");

var myScore = 0, theirScore = 0;
var _roomCode;

newRoomBtn.addEventListener("click", newRoom);
joinRoomBtn.addEventListener("click", joinRoom);
startBtn.addEventListener("click", startGame);

function newRoom() {
    $("#gameRuleForm").hide();
    $("#startButton").hide();
    $("#myGithub").hide();
    socket.emit("newRoom");
    init();
}

function joinRoom() {
    $("#gameRuleForm").hide();
    $("#startButton").hide();
    $("#myGithub").hide();
    _roomCode = roomCodeInput.value;
    socket.emit("joinRoom", _roomCode);
    handleRoomCode(_roomCode);
    init();
}

function startGame() {
    // console.log("pressed");
    socket.emit("startGame",    [
                                    _roomCode,
                                    [
                                        Number($("[name=initime1]").val()) || 30,
                                        Number($("[name=initime2]").val()) || 30,
                                    ],
                                    [
                                        Number($("[name=addtime1]").val()) || 500,
                                        Number($("[name=addtime2]").val()) || 500,
                                    ],
                                    [
                                        Number($("[name=solgar1]").val()) || 0,
                                        Number($("[name=solgar2]").val()) || 0,
                                    ]
                                ]);
    // console.log("pressed");
}

let p1H, p1B, p1Q;
let p1Hc, p1Bc, p1Qc;
let p2H, p2B, p2Q;
let p2Hc, p2Bc, p2Qc;
let playerNumber, playerTurn, solGar;
let gameActive = false;

let gameInterval;
let p1Board, p2Board, p1TimeLeft, p2TimeLeft;
let p1BoardSimple;

// +++++++++++++++++ CONTROLS ++++++++++++++++++++++++++++++++++++++++++++++++

export const playerControls = JSON.parse(JSON.stringify(constants.DEFAULT_CONTROLS));
const controlState = {
    dasCnt: 0,
    dasDir: "N",
    dasTime: null,

    downCnt: 0,
    downTime: null,
}
const keyIsDown = {};
// let timeRule = JSON.parse(JSON.stringify(constants.DEFAULT_TIMERULE));

// +++++++++++++++++ ACTION ON STARTUP +++++++++++++++++++++++++++++++++++++++

keymaps.applyHandling(playerControls);
// console.log("dit me", playerControls);

//+++++++++++++++++ INITIALIZE +++++++++++++++++++++++++++++++++++++++++++++++

//Initialize * room *
function init() {
    // console.log("why?")

    utils.hideElement(initialScreen);
    gameScreen.style.display = "block";
    // if(player)

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
    if(playerNumber == 2) {
        $("#placeholderJoin").text("Please wait for player 1 to start the game")
        $("#gameRuleForm").hide();
        $("#startButton").hide();
    }
    console.log("hey hi hello");
    _roomCode = roomCode;
    keymaps.applyHandling(playerControls);
}

//Initialize * game *
function handleInitGame(params) {
    [playerTurn, solGar] = params;
    // console.log("lmao");
    $("#placeholderJoin").hide();
    $("#roomCodeText").hide();
    gameTimeRule.style.display = "none";
    startBtn.style.display = "none";
    
    //init game boards;
    p1Board = new gameBoard(7, solGar);
    p1BoardSimple = {};
    p1Board.makeBoardObject(p1BoardSimple);
    p2Board = null;

    socket.emit("refreshBoard", JSON.stringify(p1BoardSimple))

    p1TimeLeft = p2TimeLeft = 0;

    startGameInterval();
    gameActive = true;
}

function handleNewPlayer() {
    alert("Player 2 joined!");
    $("#startButton").show();
    $("#gameRuleForm").show();
    $("#placeholderJoin").text("Rules");
}

// function setTimeRule(timeRules) {
//     timeRule = timeRules;
// }

//++++++++++++++ GAME INTERVAL +++++++++++++++++++++++++++++++++++++++++++++++

var framePos = 0;

function startGameInterval() {
    gameInterval = setInterval(() => {
        framePos = (framePos + 1) % 6;
        // console.log("intervin'");
        continueInput();
        if(framePos == 1) {
            socket.emit("refreshBoard", JSON.stringify(p1BoardSimple));
        }
        requestAnimationFrame(() => drawGame());
    }, 1000 / constants.FRAME_RATE);
}

function handleServer(updData) {
    [p1TimeLeft, p2TimeLeft] = updData;
    if(playerNumber == 2) {
        [p1TimeLeft, p2TimeLeft] = [p2TimeLeft, p1TimeLeft];
    }
}

function handleOpponent(updData) {
    // console.log("lmao", updData);
    let [garbage, gameBoard, changeTurn] = updData;
    console.log(changeTurn);
    if(garbage != 0) {
        p1Board.gotSentGarbage(garbage);
    }
    if(changeTurn == 1) {
        playerTurn = 3 - playerTurn;
    }
    p2Board = gameBoard;
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }

    data = JSON.parse(data);

    if (data.winner === playerNumber) {
        myScore++;
        // alert("You Win!");
    } else {
        theirScore++;
        // alert("You Lose :(");
    }
    
    gameActive = false;
    clearInterval(gameInterval);
    handleScoreUpdate();

    if(playerNumber == 1) {
        $("#startButton").show();
    }
}

//+++++++++++++ HANDLING INPUT +++++++++++++++++++++++++++++++++++++++++++++++

function keydown(e) {
    console.log(e.key);
    if (!gameActive || playerNumber != playerTurn) {
        return;
    }
    if(keyIsDown[e.code] === true) {
        return;
    }
    keyIsDown[e.code] = true;
    let code =  Object.keys(playerControls.controls).find(key => playerControls.controls[key] == e.code);
    // console.log(code);
    let damage = 0;
    switch(code) {
        case "hd":
            damage = p1Board.hardDrop();    
            p1Board.makeBoardObject(p1BoardSimple);
            console.log("harddropped!");
            socket.emit("newMove", [damage, p1BoardSimple]);
            playerTurn = 3 - playerTurn;
            break;
        case "sd":
            p1Board.softDrop(1);
            controlState.downCnt = 0;
            controlState.downTime = Number(Date.now());
            break;
        case "rcw":
            p1Board.rotatePiece(1);
            break;
        case "r180":
            p1Board.rotatePiece(2);
            break;
        case "rccw":
            p1Board.rotatePiece(3);
            break;
        case "hold":
            p1Board.holdPiece();
            break;
        case "left":
            p1Board.moveSideways(1, -1);
            controlState.dasDir = "left";
            controlState.dasCnt = 0;
            controlState.dasTime = Number(Date.now()) + playerControls.handling.das;
            break;
        case "right":
            p1Board.moveSideways(1, 1);
            controlState.dasDir = "right";
            controlState.dasCnt = 0;
            controlState.dasTime = Number(Date.now()) + playerControls.handling.das;
            break;
    }

    if(p1Board.gameOver) {
        p1Board.makeBoardObject(p1BoardSimple);
        socket.emit("refreshBoard", JSON.stringify(p1BoardSimple))
        socket.emit("toppedOut", _roomCode);
    }
    // console.log(controlState, "this happened");
}

function keyup(e) {
    if (!gameActive) {
        return;
    }
    keyIsDown[e.code] = false;
    let code =  Object.keys(playerControls.controls).find(key => playerControls.controls[key] === e.code);  
    console.log("fucking", code);  
    switch(code) {
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
        p1Board.moveSideways(controlState.dasCnt, controlState.dasDir == "left" ? -1 : 1);
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
        p1Board.softDrop(controlState.downCnt)
        controlState.downCnt = 0;
    }
    p1Board.makeBoardObject(p1BoardSimple);
}

//++++++++++++++ DRAW GAME +++++++++++++++++++++++++++++++++++++++++++++++++++

function drawGame() {
    drawHold(p1Hc, p1H, p1Board, p1TimeLeft, (playerTurn == playerNumber));
    drawBoard(p1Bc, p1B, p1Board, p1TimeLeft);
    // console.log("PLEASE???");
    drawQueue(p1Qc, p1Q, p1Board, p1TimeLeft);

    if(p2Board == null) {
        return;
    }

    drawHold(p2Hc, p2H, p2Board, p2TimeLeft, (playerTurn != playerNumber));
    drawBoard(p2Bc, p2B, p2Board, p2TimeLeft);
    drawQueue(p2Qc, p2Q, p2Board, p2TimeLeft);
}

//+++++++++++ MISC +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function handleScoreUpdate() {
    playerScores.style.display = "block";
    playerScores.innerText=`${myScore} - ${theirScore}`
}

function handleRoomCode(roomCode) {
    roomCodeText.innerText = `Room code: ${roomCode}`;
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
    utils.unhideElement(initialScreen);
    gameScreen.style.display = "none";
}
