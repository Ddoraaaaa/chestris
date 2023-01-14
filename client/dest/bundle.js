var dd = (function (exports) {
    'use strict';

    const CTRL_KEYS$1 = ["das", "arr", "right", "left", "sd", "hd", "hold", "rcw", "rccw", "r180"];
    const LMAO = "1";

    const DEFAULT_GAME_HANDLING = {
        "das": 170,
        "arr": 50,
        "left": 37,
        "right": 39,
        "sd": 51,
        "hd": 32,
        "hold": 67,
        "rcw": 38
    };

    const BOARD_BACKGROUND = "#303030";
    const BOARD_HEIGHT = 40;
    const BOARD_VISIBLE_HEIGHT = 20;
    const BOARD_WIDTH = 10;
    const PREVIEW_QUEUE = 5;
    const MINO_SIZE = 30;
    const GARBAGE_SIZE = 4;
    const CV_PAD = 10;

    var constants = /*#__PURE__*/Object.freeze({
        __proto__: null,
        BOARD_BACKGROUND: BOARD_BACKGROUND,
        BOARD_HEIGHT: BOARD_HEIGHT,
        BOARD_VISIBLE_HEIGHT: BOARD_VISIBLE_HEIGHT,
        BOARD_WIDTH: BOARD_WIDTH,
        CTRL_KEYS: CTRL_KEYS$1,
        CV_PAD: CV_PAD,
        DEFAULT_GAME_HANDLING: DEFAULT_GAME_HANDLING,
        GARBAGE_SIZE: GARBAGE_SIZE,
        LMAO: LMAO,
        MINO_SIZE: MINO_SIZE,
        PREVIEW_QUEUE: PREVIEW_QUEUE
    });

    function hideElement(elem) {
        elem.classList.remove("d-flex");
        elem.classList.add("d-none");
    }

    function getCookie() {
        var cookie = document.cookie;
        var res = {};
        cookie.split(/\s*;\s*/).forEach(function(pair) {
            pair = pair.split(/\s*=\s*/);
            res[pair[0]] = pair.splice(1).join('=');
        });
        console.log(res);
        return res;
    }

    function setCookie(key, value, isDelete) {
        var cookieString = key + "=" + value;
        if(isDelete) {
            cookieString += "; expires = Thu, 01 Jan 1970 00:00:00 GMT";
        }
        cookieString += "; path=/";
        console.log(cookieString);
        document.cookie=cookieString;
    }

    function enforceMinMax(elem) {
        if (elem.value != "") {
            if (parseInt(elem.value) < parseInt(elem.min)) {
                elem.value = elem.min;
            }
            if (parseInt(elem.value) > parseInt(elem.max)) {
                elem.value = elem.max;
            }
        }
    }

    var utils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        enforceMinMax: enforceMinMax,
        getCookie: getCookie,
        hideElement: hideElement,
        setCookie: setCookie
    });

    function rgKeyDown(elem, event) {
        if(event.keyCode == 27) {
            elem.value="";
            return;
        }
        elem.value=event.keyCode;
        elem.readOnly=true;
    }

    function rgKeyUp(elem) {
        elem.readOnly=false;
    }

    function applyHandling(gameHandling) {
        var cookieObj = getCookie();
        for(let key of CTRL_KEYS$1) {
            if(cookieObj[key]) {
                gameHandling[key] = Number(cookieObj[key]);
            }
        }
    }

    function mapKeys(frm) {
        console.log(frm);
        const formData = new FormData(frm);
        const formDataObj = Object.fromEntries(formData.entries());

        console.log(formData.entries());
        console.log(formDataObj);

        for(var key in formDataObj) {
            if(formDataObj[key]) {
                setCookie(key, formDataObj[key], 0);
            }
        }
    }

    function resetKeys() {
        for(var key of CTRL_KEYS) {
            setCookie(key, 1234, 1);
        }
    }

    var keymaps = /*#__PURE__*/Object.freeze({
        __proto__: null,
        applyHandling: applyHandling,
        mapKeys: mapKeys,
        resetKeys: resetKeys,
        rgKeyDown: rgKeyDown,
        rgKeyUp: rgKeyUp
    });

    function drawMino(ctx, canvas, x, y, pieceId) {

    }

    function drawHold(ctx, canvas, state, timeLeft) {
        ctx.fillStyle = BOARD_BACKGROUND;
        ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
        ctx.save();
        ctx.translate(CV_PAD, CV_PAD);
        //ACTUALLY START DRAWING
        console.log(state, "hello");
        ctx.restore();
    }

    function drawBoard(ctx, canvas, state, timeLeft) {
        ctx.fillStyle = BOARD_BACKGROUND;
        ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
        ctx.save();
        ctx.translate(CV_PAD, CV_PAD);
        ctx.restore();
    }

    function drawQueue(ctx, canvas, state, timeLeft) {
        ctx.fillStyle = BOARD_BACKGROUND;
        ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
        ctx.save();
        ctx.translate(CV_PAD, CV_PAD);
        ctx.restore();
    }

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
        gameHandling = DEFAULT_GAME_HANDLING;
        applyHandling(gameHandling);

        console.log(gameHandling, "lmao");
        console.log("why?");

        hideElement(initialScreen);
        gameScreen.style.display = "block";

        p1H = document.getElementById("p1HoldCv"); p1Hc = p1H.getContext("2d");
        p1B = document.getElementById("p1BoardCv"); p1Bc = p1B.getContext("2d");
        p1Q = document.getElementById("p1QueueCv"); p1Qc = p1Q.getContext("2d");
        p2H = document.getElementById("p2HoldCv"); p2Hc = p2H.getContext("2d");
        p2B = document.getElementById("p2BoardCv"); p2Bc = p2B.getContext("2d");
        p2Q = document.getElementById("p2QueueCv"); p2Qc = p2Q.getContext("2d");

        p1H.width = p2H.width = p1Q.width = p2Q.width 
                              = 4 * MINO_SIZE + 2 * CV_PAD;
        p1B.width = p2B.width = BOARD_WIDTH * MINO_SIZE +
                                GARBAGE_SIZE + 2 * CV_PAD;
        p1B.height = p2B.height = p1H.height = p2H.height = p1Q.height = p2Q.height
                                = BOARD_VISIBLE_HEIGHT * MINO_SIZE +
                                  CV_PAD * 2;

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
        drawQueue(p1Qc, p1Q, state.p1Board, state.p1TimeLeft);

        drawHold(p2Hc, p2H, state.p2Board, state.p2TimeLeft);
        drawBoard(p2Bc, p2B, state.p2Board, state.p2TimeLeft);
        drawQueue(p2Qc, p2Q, state.p2Board, state.p2TimeLeft);
    }

    function handleInit(number, roomCode) {
        playerNumber = number;
        _roomCode = roomCode;
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
        playerScores.innerText=`${myScore} - ${theirScore}`;
    }

    function handleRoomCode(roomCode) {
        roomCodeText.innerText = roomCode;
    }

    function handleUnknownCode() {
        reset();
        alert("Unknown Room");
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

    exports.constants = constants;
    exports.keymaps = keymaps;
    exports.utils = utils;

    return exports;

})({});
