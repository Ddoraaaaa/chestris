var dd = (function (exports) {
    'use strict';

    const CTRL_KEYS = ["das", "arr", "grav", "right", "left", "sd", "hd", "hold", "rcw", "rccw", "r180"];
    const LMAO = "1";

    const DEFAULT_CONTROLS = {
        handling: {
            das: 170,
            arr: 50,
            grav: 50,
        },
        controls: {
            left: 37,
            right: 39,
            sd: 40,
            hd: 32,
            hold: 67,
            rcw: 38,
            rccw: -1,
            r180: -1
        }
    };

    const DEFAULT_TIMERULE = Object.freeze([30, 500]);

    //BOARD AND GAMEFIELD

    const BOARD_BACKGROUND = "#303030";
    const GARBAGE_COLOR = "#DD0000";
    const BOARD_HEIGHT = 40;
    const BOARD_VISIBLE_HEIGHT = 20;
    const BOARD_WIDTH = 10;
    const PREVIEW_QUEUE = 5;
    const MINO_SIZE = 30;
    const GARBAGE_SIZE = 6;
    const CV_PAD = 20;

    //PIECE
    const PIECE_COLOR = [   BOARD_BACKGROUND,  //none
                            "#ea620e",  //orange    L
                            "#2141C6",  //blue      J
                            "#58B103",  //green     S
                            "#D70F37",  //red       Z
                            "#109BD7",  //sky blue  I
                            "#E39F00",  //yellow    O  
                            "#AF2989",  //purple    T
                            "#909090"]; //gray      garbage

    const PIECE_POSITION = [
        [],                                       //                     No piece
        [
            { x: [1, 1, 1, 2], y: [0, 1, 2, 2] }, // ..# .#. ... ##.     L piece
            { x: [0, 1, 2, 0], y: [1, 1, 1, 2] }, // ### .#. ### .#.
            { x: [1, 1, 1, 0], y: [0, 1, 2, 0] }, // ... .## #.. .#.
            { x: [0, 1, 2, 2], y: [1, 1, 1, 0] }  //
        ],
        [
            { x: [1, 1, 1, 2], y: [0, 1, 2, 0] }, // #.. .## ... .#.     J piece
            { x: [0, 1, 2, 2], y: [1, 1, 1, 2] }, // ### .#. ### .#.
            { x: [1, 1, 1, 0], y: [0, 1, 2, 2] }, // ... .#. ..# ##.
            { x: [0, 1, 2, 0], y: [1, 1, 1, 0] }  //
        ],
        [
            { x: [1, 1, 2, 2], y: [0, 1, 1, 2] }, // .## .#. ... #..     S piece
            { x: [2, 1, 1, 0], y: [1, 1, 2, 2] }, // ##. .## .## ##.
            { x: [0, 0, 1, 1], y: [0, 1, 1, 2] }, // ... ..# ##. .#.
            { x: [2, 1, 1, 0], y: [0, 0, 1, 1] }  //
        ],
        [
            { x: [2, 2, 1, 1], y: [0, 1, 1, 2] }, // ##. ..# ... .#.     Z piece
            { x: [2, 1, 1, 0], y: [2, 2, 1, 1] }, // .## .## ##. ##.
            { x: [1, 1, 0, 0], y: [0, 1, 1, 2] }, // ... .#. .## #..
            { x: [0, 1, 1, 2], y: [0, 0, 1, 1] }  //
        ],
        [
            { x: [2, 2, 2, 2], y: [0, 1, 2, 3] }, // .... ..#. .... .#.. I piece
            { x: [0, 1, 2, 3], y: [2, 2, 2, 2] }, // #### ..#. .... .#..
            { x: [1, 1, 1, 1], y: [0, 1, 2, 3] }, // .... ..#. #### .#..
            { x: [0, 1, 2, 3], y: [1, 1, 1, 1] }  // .... ..#. .... .#..
        ],
        [
            { x: [0, 1, 0, 1], y: [0, 0, 1, 1] }, // ## ## ## ##         O piece
            { x: [0, 1, 0, 1], y: [0, 0, 1, 1] }, // ## ## ## ##
            { x: [0, 1, 0, 1], y: [0, 0, 1, 1] }, //
            { x: [0, 1, 0, 1], y: [0, 0, 1, 1] }  //
        ],
        [
            { x: [1, 1, 1, 2], y: [0, 1, 2, 1] }, // .#. .#. ... .#.     T piece
            { x: [0, 1, 2, 1], y: [1, 1, 1, 2] }, // ### .## ### ##.
            { x: [1, 1, 1, 0], y: [0, 1, 2, 1] }, // ... .#. .#. .#.
            { x: [0, 1, 2, 1], y: [1, 1, 1, 0] }  //
        ]
    ];

    var constants = /*#__PURE__*/Object.freeze({
        __proto__: null,
        BOARD_BACKGROUND: BOARD_BACKGROUND,
        BOARD_HEIGHT: BOARD_HEIGHT,
        BOARD_VISIBLE_HEIGHT: BOARD_VISIBLE_HEIGHT,
        BOARD_WIDTH: BOARD_WIDTH,
        CTRL_KEYS: CTRL_KEYS,
        CV_PAD: CV_PAD,
        DEFAULT_CONTROLS: DEFAULT_CONTROLS,
        DEFAULT_TIMERULE: DEFAULT_TIMERULE,
        GARBAGE_COLOR: GARBAGE_COLOR,
        GARBAGE_SIZE: GARBAGE_SIZE,
        LMAO: LMAO,
        MINO_SIZE: MINO_SIZE,
        PIECE_COLOR: PIECE_COLOR,
        PIECE_POSITION: PIECE_POSITION,
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
        // console.log(res);
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

    function updateKeys(playerControls) {
        const savedControls = getCookie();
        console.log(savedControls, 69);
        for (const [x, y] of Object.entries(savedControls)) {
            switch(x) {
                case "das":
                case "arr":
                case "grav":
                    playerControls.handling[x] = Number(y);
                    // console.log(x, "is handling");
                    break;
                default:
                    playerControls.controls[x] = Number(y);
                    // console.log(x, "is not handling");
            }
        }
    }

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
        for(let key of CTRL_KEYS) {
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
        rgKeyUp: rgKeyUp,
        updateKeys: updateKeys
    });

    function drawMino(ctx, canvas, x, y, pieceId) {
        // console.log("drawing mino at: ", x, y, pieceId);
        ctx.save();
            ctx.fillStyle = PIECE_COLOR[pieceId];
            ctx.fillRect(x + 1, y + 1, MINO_SIZE - 2, MINO_SIZE - 2);
        ctx.restore();
    }

    function drawPiece(ctx, canvas, x, y, pieceId, rot) {
        if(pieceId==0) {
            return;
        }
        // console.log(x, y, pieceId, rot);
        ctx.save();
        const xVals = PIECE_POSITION[pieceId][rot].x;
        const yVals = PIECE_POSITION[pieceId][rot].y;
        for(let i = 0; i < 4; i++) {
                // console.log("???")
                const [xDraw, yDraw] =  [
                                            x + yVals[i] * MINO_SIZE,
                                            y - (xVals[i] + 1) * MINO_SIZE
                                        ]; 
                drawMino(ctx, canvas, xDraw, yDraw, pieceId);
            }
        ctx.restore();
    }

    function drawHold(ctx, canvas, state, timeLeft) {
        ctx.fillStyle = BOARD_BACKGROUND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
        ctx.save();
            ctx.translate(CV_PAD, CV_PAD);
            drawPiece(ctx, canvas, 0, MINO_SIZE * (3 + (state.heldPiece == 6 ? -1 : 0)), state.heldPiece, (state.heldPiece == 5 ? 2 : 0));
            // console.log(state, "hello");
        ctx.restore();
        ctx.save();
            ctx.translate(0, MINO_SIZE * 5);
            ctx.fillStyle = "white";
            ctx.font = "24px Courier";
            if(state.backToBack > 1) {
                ctx.fillText(`B2B ${state.backToBack - 1}`, 10, 0);
            }
            ctx.translate(0, 30);
            if(state.comboCount > 1) {
                ctx.fillText(`combo ${state.comboCount}`, 10, 0);
            }
            ctx.translate(0, 30);
            let minutes = Math.floor(timeLeft / 1000 / 60);
            let seconds = Math.floor(timeLeft / 1000) % 60;
            ctx.fillText(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, 10, 0);
        ctx.restore();
    }

    function drawBoard(ctx, canvas, state, timeLeft) {
        ctx.fillStyle = BOARD_BACKGROUND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
        ctx.save();
            ctx.translate(CV_PAD, CV_PAD);
            //draw garbage
            ctx.fillStyle = GARBAGE_COLOR;
            let curTop = MINO_SIZE * BOARD_VISIBLE_HEIGHT, curSz;
            for(let i of state.garbageQueue) {
                curSz = Math.min(i * MINO_SIZE, curTop);
                curTop -= curSz;
                // console.log("garbage", 0, curTop + 2, GARBAGE_SIZE*10, curSz - 2);
                ctx.fillRect(0, curTop + 3, GARBAGE_SIZE, curSz - 3);
                if(curTop == 0) {
                    break;
                }
            }
            ctx.save();
                ctx.translate(GARBAGE_SIZE, 0);
                //draw board
                let pieceId;
                for(let i = 1; i <= BOARD_VISIBLE_HEIGHT; i++) {
                    for(let j = 1; j <= BOARD_WIDTH; j++) {
                        pieceId = Number(state.board[i][j-1]);
                        // pieceId = (state.board[i] >> (4 * (j - 1))) & 15;
                        drawMino(ctx, canvas, (j - 1) * MINO_SIZE, (BOARD_VISIBLE_HEIGHT - i) * MINO_SIZE, pieceId);
                    }
                }
                //draw active piece
                drawPiece(  ctx, 
                            canvas, 
                            (state.activePiecePos[1] - 1) * MINO_SIZE, 
                            (BOARD_VISIBLE_HEIGHT - state.activePiecePos[0] + 1) * MINO_SIZE, 
                            state.activePiece, 
                            state.activePieceRot);
            ctx.restore();
        ctx.restore();
    }

    function drawQueue(ctx, canvas, state, timeLeft) {
        // console.log("drawing queue");
        ctx.fillStyle = BOARD_BACKGROUND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
        ctx.save();
            ctx.translate(CV_PAD, CV_PAD);
            for(let i = 0; i < 5; i++) {
                drawPiece(ctx, canvas, 0, MINO_SIZE * (3 * (i + 1) + (state.nextQueue[i] == 6 ? -1 : 0)), state.nextQueue[i], (state.nextQueue[i] == 5 ? 2 : 0));
            }
        ctx.restore();
    }

    const socket = io("https://gentle-hamlet-31206.herokuapp.com/", {
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

    const playerControls = JSON.parse(JSON.stringify(DEFAULT_CONTROLS));
    const controlState = {
        dasCnt: 0,
        dasDir: "N",
        dasTime: null,

        downCnt: 0,
        downTime: null,
    };
    const keyIsDown = Array(200).fill(0);

    const timeRule = JSON.parse(JSON.stringify(DEFAULT_TIMERULE));

    function init() {
        // console.log("why?")

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
        // console.log("lmao");
        roomCodeDisplay.style.display = "none";
        startBtn.style.display = "none";

        handleScoreUpdate();

        gameActive = true;
    }

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
                socket.emit("addAction", ["hd", 0]);
                break;
            case "sd":
                socket.emit("addAction", ["sd", 1]);
                controlState.downCnt = 0;
                controlState.downTime = Number(Date.now());
                break;
            case "rcw":
                socket.emit("addAction", ["rcw", 1]);
                break;
            case "r180":
                socket.emit("addAction", ["rcw", 2]);
                break;
            case "rccw":
                socket.emit("addAction", ["rcw", 3]);
                break;
            case "hold":
                socket.emit("addAction", ["hold", 0]);
                break;
            case "left":
                socket.emit("addAction", ["left", 1]);
                controlState.dasDir = "left";
                controlState.dasCnt = 0;
                controlState.dasTime = Number(Date.now()) + playerControls.handling.das;
                break;
            case "right":
                socket.emit("addAction", ["right", 1]);
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

    function drawGame(state) {
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
        _roomCode = roomCode;
        updateKeys(playerControls);
    }

    function handleGameState(gameState) {
        if (!gameActive) {
            return;
        }
        // console.log(1, controlState);
        //horizontal movement
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

        //do more stuff
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
