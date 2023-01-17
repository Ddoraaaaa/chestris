var dd = (function (exports) {
    'use strict';

    const CTRL_KEYS = {
        handling: ["das", "arr", "grav"],
        controls: ["right", "left", "sd", "hd", "hold", "rcw", "rccw", "r180"]
    };

    const LMAO = "1";
    const FRAME_RATE$1 = 60;

    const DEFAULT_CONTROLS = {
        handling: {
            das: 170,
            arr: 50,
            grav: 50,
        },
        controls: {
            left: "ArrowLeft",
            right: "ArrowRight",
            sd: "ArrowDown",
            hd: "Space",
            hold: "KeyC",
            rcw: "ArrowUp",
            rccw: -1,
            r180: -1
        }
    };

    const DEFAULT_TIMERULE = Object.freeze([30, 500]);

    //BOARD AND GAMEFIELD

    const BOARD_BACKGROUND$1 = "#303030";
    const GARBAGE_COLOR = "#DD0000";
    const BOARD_HEIGHT$1 = 40;
    const BOARD_VISIBLE_HEIGHT$1 = 20;
    const BOARD_WIDTH$1 = 10;
    const PREVIEW_QUEUE$1 = 5;
    const MINO_SIZE = 30;
    const GARBAGE_SIZE = 6;
    const CV_PAD = 20;

    //PIECE
    const PIECE_COLOR$1 = [   BOARD_BACKGROUND$1,  //none
                            "#ea620e",  //orange    L
                            "#2141C6",  //blue      J
                            "#58B103",  //green     S
                            "#D70F37",  //red       Z
                            "#109BD7",  //sky blue  I
                            "#E39F00",  //yellow    O  
                            "#AF2989",  //purple    T
                            "#909090"]; //gray      garbage

    const PIECE_POSITION$1 = [
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
        BOARD_BACKGROUND: BOARD_BACKGROUND$1,
        BOARD_HEIGHT: BOARD_HEIGHT$1,
        BOARD_VISIBLE_HEIGHT: BOARD_VISIBLE_HEIGHT$1,
        BOARD_WIDTH: BOARD_WIDTH$1,
        CTRL_KEYS: CTRL_KEYS,
        CV_PAD: CV_PAD,
        DEFAULT_CONTROLS: DEFAULT_CONTROLS,
        DEFAULT_TIMERULE: DEFAULT_TIMERULE,
        FRAME_RATE: FRAME_RATE$1,
        GARBAGE_COLOR: GARBAGE_COLOR,
        GARBAGE_SIZE: GARBAGE_SIZE,
        LMAO: LMAO,
        MINO_SIZE: MINO_SIZE,
        PIECE_COLOR: PIECE_COLOR$1,
        PIECE_POSITION: PIECE_POSITION$1,
        PREVIEW_QUEUE: PREVIEW_QUEUE$1
    });

    function hideElement(elem) {
        elem.classList.remove("d-flex");
        elem.classList.add("d-none");
    }

    function unhideElement(elem) {
        elem.classList.add("d-flex");
        elem.classList.remove("d-none");
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
        setCookie: setCookie,
        unhideElement: unhideElement
    });

    // export function updateKeys(playerControls) {
    //     const savedControls = utils.getCookie();
    //     console.log(savedControls, 69);
    //     for (const [x, y] of Object.entries(savedControls)) {
    //         switch(x) {
    //             case "das":
    //             case "arr":
    //             case "grav":
    //                 playerControls.handling[x] = Number(y);
    //                 // console.log(x, "is handling");
    //                 break;
    //             default:
    //                 playerControls.controls[x] = y;
    //                 // console.log(x, "is not handling");
    //         }
    //     }
    // }

    function rgKeyDown(elem, event) {
        if(event.keyCode == "Tab") {
            elem.value="";
            return;
        }
        elem.value=event.code;
        elem.readOnly=true;
    }

    function rgKeyUp(elem) {
        elem.readOnly=false;
    }

    function applyHandling(gameHandling) {
        var cookieObj = getCookie();
        for(let key of CTRL_KEYS.handling) {
            if(cookieObj[key]) {
                console.log(key, "vai cac", cookieObj[key], gameHandling);
                gameHandling.handling[key] = Number(cookieObj[key]);
                document.getElementsByName(key)[0].value = cookieObj[key];
            }
            else {
                gameHandling.handling[key] = DEFAULT_CONTROLS.handling[key];
                document.getElementsByName(key)[0].value = "";
            }
        }
        for(let key of CTRL_KEYS.controls) {
            if(cookieObj[key]) {
                gameHandling.controls[key] = cookieObj[key];
                document.getElementsByName(key)[0].value = cookieObj[key];
            }
            else {
                gameHandling.controls[key] = DEFAULT_CONTROLS.controls[key];
                document.getElementsByName(key)[0].value = "";
            }
        }
    }

    function mapKeys(frm, gameHandling) {
        // console.log(frm);
        const formData = new FormData(frm);
        const formDataObj = Object.fromEntries(formData.entries());

        // console.log(formData.entries());
        // console.log(formDataObj);

        for(var key in formDataObj) {
            if(formDataObj[key]) {
                setCookie(key, formDataObj[key], 0);
            }
        }
        applyHandling(gameHandling);
    }

    function resetKeys(gameHandling) {
        for(var key of CTRL_KEYS.handling) {
            setCookie(key, 1234, 1);
        }
        for(var key of CTRL_KEYS.controls) {
            setCookie(key, 1234, 1);
        }
        applyHandling(gameHandling);
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
        // console.log("drawing mino at: ", x, y, pieceId);
        ctx.save();
            ctx.fillStyle = PIECE_COLOR$1[pieceId];
            ctx.fillRect(x + 1, y + 1, MINO_SIZE - 2, MINO_SIZE - 2);
        ctx.restore();
    }

    function drawPiece(ctx, canvas, x, y, pieceId, rot) {
        if(pieceId==0) {
            return;
        }
        // console.log(x, y, pieceId, rot);
        ctx.save();
        const xVals = PIECE_POSITION$1[pieceId][rot].x;
        const yVals = PIECE_POSITION$1[pieceId][rot].y;
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

    function drawHold(ctx, canvas, state, timeLeft, isPlayerTurn) {
        ctx.fillStyle = BOARD_BACKGROUND$1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
        ctx.save();
            ctx.translate(CV_PAD, CV_PAD);
            drawPiece(ctx, canvas, 0, MINO_SIZE * (3 + (state.heldPiece == 6 ? -1 : 0)), state.heldPiece, (state.heldPiece == 5 ? 2 : 0));
            // console.log(state, "hello");
        ctx.restore();
        ctx.save();
            ctx.translate(0, MINO_SIZE * 5);
            if(isPlayerTurn) {
                ctx.save();
                ctx.fillStyle = "green";
                ctx.fillRect(5, 35, 130, 35);
                ctx.restore();
            }
            //timer color
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
            let miliseconds = Math.floor(timeLeft / 10);
            if(miliseconds % 100 < 50 && miliseconds < 1000 && isPlayerTurn) {
                ctx.fillStyle = "gray";
            }
            ctx.fillText(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(miliseconds % 100).padStart(2, '0')}`, 10, 0);
        ctx.restore();
    }

    function drawBoard(ctx, canvas, state, timeLeft) {
        ctx.fillStyle = BOARD_BACKGROUND$1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
        ctx.save();
            ctx.translate(CV_PAD, CV_PAD);
            //draw garbage
            ctx.fillStyle = GARBAGE_COLOR;
            let curTop = MINO_SIZE * BOARD_VISIBLE_HEIGHT$1, curSz;
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
                for(let i = 1; i <= BOARD_VISIBLE_HEIGHT$1; i++) {
                    for(let j = 1; j <= BOARD_WIDTH$1; j++) {
                        pieceId = Number(state.board[i][j-1]);
                        // pieceId = (state.board[i] >> (4 * (j - 1))) & 15;
                        drawMino(ctx, canvas, (j - 1) * MINO_SIZE, (BOARD_VISIBLE_HEIGHT$1 - i) * MINO_SIZE, pieceId);
                    }
                }
                //draw active piece
                drawPiece(  ctx, 
                            canvas, 
                            (state.activePiecePos[1] - 1) * MINO_SIZE, 
                            (BOARD_VISIBLE_HEIGHT$1 - state.activePiecePos[0] + 1) * MINO_SIZE, 
                            state.activePiece, 
                            state.activePieceRot);
            ctx.restore();
        ctx.restore();
    }

    function drawQueue(ctx, canvas, state, timeLeft) {
        // console.log("drawing queue");
        ctx.fillStyle = BOARD_BACKGROUND$1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
        ctx.save();
            ctx.translate(CV_PAD, CV_PAD);
            for(let i = 0; i < 5; i++) {
                drawPiece(ctx, canvas, 0, MINO_SIZE * (3 * (i + 1) + (state.nextQueue[i] == 6 ? -1 : 0)), state.nextQueue[i], (state.nextQueue[i] == 5 ? 2 : 0));
            }
        ctx.restore();
    }

    // +++++++++++++++++++++ SERVER INFORMATION ++++++++++++++++++++++++++++++++++
    const FRAME_RATE = 60;
    const GRID_SIZE = 20;
    const CODE_LENGTH = 6;

    // +++++++++++++++++++++ BOARD INFORMATION +++++++++++++++++++++++++++++++++++
    const BOARD_BACKGROUND = "#FFFFFF";
    const BOARD_HEIGHT = 40;
    const BOARD_VISIBLE_HEIGHT = 20;
    const BOARD_WIDTH = 10;
    const PREVIEW_QUEUE = 5;

    // +++++++++++++++++++++ PIECE INFORMATION +++++++++++++++++++++++++++++++++++
    // 0:none 1:L 2:J 3:S 4:Z 5:I 6:O 7:T, 8:garbage
    const PIECE_COLOR = [   BOARD_BACKGROUND,  //none
                            "#ea620e",  //orange    L
                            "#2141C6",  //blue      J
                            "#58B103",  //green     S
                            "#D70F37",  //red       Z
                            "#109BD7",  //sky blue  I
                            "#E39F00",  //yellow    O  
                            "#AF2989",  //purple    T
                            "#909090"];  //gray      garbage

    //(0, 0) being lower left position. (x, y) means x rows up and y cols right
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

    const PIECE_SPAWN = [
        [], //none
        [19, 4], //L
        [19, 4], //J
        [19, 4], //S
        [19, 4], //Z
        [18, 4], //I
        [20, 5], //O
        [19, 4]  //T
    ];

    //[i][j][k] is kth test, i = is I piece or not,
    //j*90 degrees clockwise. from j to j1 subtract [i][j1][k] from [i][j][k]
    const ROTATION_OFFSET = [
        [
            [[0, 0],  [0, 0],  [0, 0],  [0, 0],  [0, 0]],
            [[0, 0],  [0, 1],  [-1, 1], [2, 0],  [2, 1]],
            [[0, 0],  [0, 0],  [0, 0],  [0, 0],  [0, 0]],
            [[0, 0],  [0, -1], [-1, -1],[2, 0],  [2, -1]]
        ],
        [
            [[0, 0], [0, 0],  [0, -1], [0, 2],  [0, -1], [0, 2]],
            [[0, 0], [0, -1], [0, 0],  [0, 0],  [1, 0],  [-2, 0]],
            [[0, 0], [1, -1], [1, 1],  [1, -2], [0, 1],  [0, -2]],
            [[0, 0], [1, 0],  [1, 0],  [1, 0],  [-1, 0], [2, 0]]
        ]
    ];

    // +++++++++++++++++++++ GAME RULE +++++++++++++++++++++++++++++++++++++++++++
    const TSPIN_DMG = [0, 2, 3, 6];
    const TSPIN_CHECK = [[0, 0], [0, 2], [2, 0], [2, 2]];
    const B2B_DMG = [2, 6, 11, 15, 18, 20, 20, 22];
    const LINE_DMG = [0, 0, 1, 2, 4];
    const COMBO_DMG = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7];
    const PC_DMG = 10;

    class gameBoard {
        // 0:none 1:L 2:J 3:S 4:Z 5:I 6:O 7:T 8:garbage
        // board: 1->40:D->U then 1->10:L->R 
        constructor(bagSize) {
            //the actual board
            this.board = new Array(BOARD_HEIGHT + 1).fill("0000000000");
            this.boardMask = new Array(BOARD_HEIGHT + 1).fill(0);

            //things around the board
            this.garbageQueue = [];
            this.nextQueue = [];
            this.heldPiece = 0;
            this.activePiece = 0;
            this.activePiecePos = [0, 0];
            this.activePieceRot = 0;

            //game rules
            this.gameOver = false;
            this._bagSize = bagSize;
            this.backToBack = 0;
            this.comboCount = 0;

            this.fillNextQueue();
            this.spawnPiece();
        }

        //+++++++++++++++++++ PIECES "LOGISTIC" ++++++++++++++++++++++++++++++++++
        //swap current piece with held piece
        //take new piece if no held yet
        holdPiece = () => {
            if(this.heldPiece == 0) {
                this.heldPiece = this.getNextPiece();
            }
            [this.heldPiece, this.activePiece] = [this.activePiece, this.heldPiece];
            this.activePiecePos = [...PIECE_SPAWN[this.activePiece]];
            this.activePieceRot = 0;
        }

        //get next piece in next queue. remove it from next queue
        getNextPiece = () => {
            const res = this.nextQueue.shift();
            this.fillNextQueue();
            return res;
        }

        //fill up next queue till it is more than the preview queue
        fillNextQueue = () => {
            while(this.nextQueue.length < PREVIEW_QUEUE) {
                this.getNewBag();
            }
        }

        //get a new bag to put in the queue
        getNewBag = () => {
            if(!this._bagSize==1) {
                this.nextQueue.push(Math.floor(Math.random() * 7) + 1);
            }
            else if([7, 14].includes(this._bagSize)) {
                let newPieces = [];
                for(let i = 0; i < this._bagSize; i++) {
                    newPieces.push(i % 7 + 1);
                    if(i > 0) {
                        let swapPos = Math.floor(Math.random() * i);
                        [newPieces[i], newPieces[swapPos]] = [newPieces[swapPos], newPieces[i]];
                    }
                }
                this.nextQueue = [...this.nextQueue, ...newPieces];
            }
        }

        //+++++++++++++++++++ PIECE HANDLING +++++++++++++++++++++++++++++++++++++
        spawnPiece = () => {
            this.activePiece = this.getNextPiece();
            this.activePiecePos = [...PIECE_SPAWN[this.activePiece]];
            this.activePieceRot = 0;
            if(!this.checkCollision( this.activePiece,
                                    this.activePiecePos,
                                    this.activePieceRot)) {
                this.gameOver = true;
            }
        }

        hardDrop = () => {
            this.softDrop(BOARD_HEIGHT);
            this.applyPiece();
            let clearedLine = this.killClearedLines();
            let damage = this.calculateDamage(clearedLine);
            damage = this.cancelGarbage(damage);
            this.lastMove = 0;
            this.isTSpin = 0;
            if(clearedLine == 0) {
                this.addGarbage();
            }
            this.spawnPiece();
            return damage;
        }

        //times rotated clockwisely
        rotatePiece = (timesRot) => {
            let newRot = (this.activePieceRot + timesRot) & 3;
            let rotOffset = this.getTests(this.activePieceRot, newRot, this.activePiece);
            // console.log("lmao", rotOffset);
            for(let [x, y] of rotOffset) {
                // console.log(x, y, "please just work");
                if(this.checkCollision( this.activePiece,
                                        [
                                            this.activePiecePos[0] + x,
                                            this.activePiecePos[1] + y
                                        ],
                                        newRot)) {
                    this.activePieceRot = newRot;
                    this.activePiecePos[0] += x;
                    this.activePiecePos[1] += y;
                    this.lastMove = 1;
                    return true;
                }
            }
            return false;
        }

        softDrop = (timesFall) => {
            while(timesFall) {
                timesFall--;
                if(this.checkCollision( this.activePiece,
                                        [
                                            this.activePiecePos[0] - 1,
                                            this.activePiecePos[1],
                                        ],
                                        this.activePieceRot)) {
                    this.lastMove = 0;
                    this.activePiecePos[0]--;
                }
                else {
                    return;
                }
            }
            return;
        }

        //-1 is left, 1 is right
        moveSideways = (timesMove, direction) => {
            while(timesMove) {
                timesMove--;
                if(this.checkCollision( this.activePiece,
                                        [
                                            this.activePiecePos[0],
                                            this.activePiecePos[1] + direction,
                                        ],
                                        this.activePieceRot)) {
                    this.activePiecePos[1] += direction;
                    this.lastMove = 0;
                }
                else {
                    return;
                }
            }
        }

        //put piece onto the board. called after hard drop
        applyPiece = () => {
            const xVals = PIECE_POSITION[this.activePiece][this.activePieceRot].x;
            const yVals = PIECE_POSITION[this.activePiece][this.activePieceRot].y;
            for(let i = 0; i < 4; i++) {
                const [x, y] =  [
                                    xVals[i] + this.activePiecePos[0], 
                                    yVals[i] + this.activePiecePos[1]
                                ];
                this.makePos(x, y, this.activePiece);
            }
            //check t spin
            // console.log(this.activePiece);
            if(this.activePiece == 7) {
                this.isTSpin = 0;
                for(let [addX, addY] of TSPIN_CHECK) {
                    // console.log("wtf help", addX, addY, this.activePiecePos);
                    if(this.checkPos(this.activePiecePos[0] + addX, this.activePiecePos[1] + addY)) {
                        this.isTSpin++;
                    }
                }

                // console.log("is it t spin?", this.isTSpin);
                if(this.isTSpin >= 3) {
                    this.isTSpin = true;
                }
                else {
                    this.isTSpin = false;
                }
            }
            // console.log("is it t spin? no for real pls", this.isTSpin);
        }

        getTests = (oldRot, newRot, pieceId) => {
            // console.log(this.activePiecePos.type);
            // console.log(this.activePiecePos);
            let [x, y] = this.activePiecePos;
            // console.log(ROTATION_OFFSET);
            const oldRotOff = ROTATION_OFFSET[(pieceId == 5 ? 1 : 0)][oldRot];
            const newRotOff = ROTATION_OFFSET[(pieceId == 5 ? 1 : 0)][newRot];
            // console.log("wtflmao???", newRotOff);
            let rotOffset = oldRotOff.map((val, index) => {
                return [val[0] - newRotOff[index][0], val[1] - newRotOff[index][1]];
            });
            return rotOffset;
        } 

        checkCollision = (pieceId, pos, rot) => {
            // console.log(pieceId, pos, rot);
            // console.log(PIECE_POSITION[pieceId]);
            const xVals = PIECE_POSITION[pieceId][rot].x;
            const yVals = PIECE_POSITION[pieceId][rot].y;
            for(let i = 0; i < 4; i++) {
                const [x, y] = [xVals[i] + pos[0], yVals[i] + pos[1]];
                if(this.checkPos(x, y)) {
                    // console.log(x, y, "failed here!!");
                    return false;
                }
            }
            return true;
        }

        //++++++++++++++++ MINO HANDLING +++++++++++++++++++++++++++++++++++++++++
        //get type of mino at row i, col j
        atPos = (i, j) => {
            return Number(this.board[i][j-1]);
            // return (this.board[i] >> (4 * (j - 1))) & 15;
        }

        checkPos = (i, j) => {
            // console.log(i, j);
            if(i < 1 || j < 1 || i > BOARD_HEIGHT || j > BOARD_WIDTH) return true;
            return (this.boardMask[i] >> (j - 1)) & 1;
        }

        //update mino at row i, col j to val
        makePos = (i, j, val) => {
            // console.log("assigning", i, j, val);
            this.board[i] = this.board[i].substring(0, j-1) + String(val) + this.board[i].substring(j);
            // let valAtPos = (this.board[i] >> (4 * (j - 1))) & 15;
            // console.log(valAtPos);
            // valAtPos = val - valAtPos;  
            // console.log(valAtPos, valAtPos << (4 * (j - 1)), valAtPos, 4*(j-1),2 << 36);
            // this.board[i]+= valAtPos << (4 * (j - 1));
            if(val >= 1) {
                this.boardMask[i] |= 1 << (j - 1);
            }
            // console.log(this.board[i]);
        }

        //+++++++++++++++++++ BOARD HANDLING +++++++++++++++++++++++++++++++++++++
        //clear all the full lines, calculate damage as well.
        killClearedLines = () => {
            let clearedLine = 0;
            for(let i = this.board.length - 1; i > 0; i--) {
                if(this.boardMask[i] == (1 << BOARD_WIDTH) - 1) {
                    // console.log("cleared at", i);
                    this.board.splice(i, 1);
                    this.boardMask.splice(i, 1);
                    clearedLine++;
                }
            }
            this.resizeBoard();
            return clearedLine;
        }

        //get the amount of damage dealt
        calculateDamage = (clearedLine) => {
            // console.log("debugging cleared line", clearedLine);
            let res = 0;
            if(!clearedLine) {
                this.comboCount = 0;
                if(this.isTSpin) {
                    this.backToBack++;
                }
                return res;
            }
            this.comboCount++;
            //damage for spins
            if(clearedLine == 4) {
                this.backToBack++;
            }
            else if(this.lastMove) {
                if(this.isTSpin) {
                    this.backToBack++;
                    // console.log("has t spin");
                    res += TSPIN_DMG[clearedLine];
                }
                else if(this.pieceId <= 4 && clearedLine == 3) {
                    this.backToBack++;
                    // console.log("has spin");
                    res += TSPIN_DMG[clearedLine];
                }
                else {
                    this.backToBack = 0;
                }
            }
            else {
                this.backToBack = 0;
            }
            // console.log("before combo", res);
            //damage for cleared lines or combo
            res += LINE_DMG[clearedLine] + COMBO_DMG[this.comboCount];
            // console.log("after combo", res);

            //damage for back to back
            for(let i of B2B_DMG) {
                if(i <= this.backToBack) {
                    res++;
                }
                else {
                    break;
                }
            }

            //damage for perfect clear
            
            if(this.boardMask[1] == 0) {
                // console.log("has pc");
                res += PC_DMG;
            }
            // console.log("finished. I have no fucking idea what is happening");
            return res;
        }

        gotSentGarbage = (garbage) => {
            if(garbage > 0) {
                this.garbageQueue.push(garbage);
            }
        }

        //add the next garbage in queue
        addGarbage = () => {
            if(this.garbageQueue.len == 0) return;
            const paddingLine = this.board.shift();
            this.boardMask.shift();
            const nextGarbage = this.garbageQueue.shift();
            const garbagePos = Math.floor(Math.random() * BOARD_WIDTH);
            let garbage = "", garbageMask = 0;
            for(let i = 0; i < BOARD_WIDTH; i++) {
                if(i != garbagePos) {
                    garbage += "8";
                    // garbage |= 8 << (4 * i);
                    garbageMask |= 1 << i;
                }
                else {
                    garbage+= "0";
                }
            }
            for(let i = 0; i < nextGarbage; i++) {
                this.board.unshift(garbage);
                this.boardMask.unshift(garbageMask);
            }
            this.board.unshift(paddingLine);
            this.boardMask.unshift(0);
            this.resizeBoard();
            // console.log(this.board);
            // console.log(this.boardMask);
        }

        cancelGarbage = (damage) => {
            // let cac = 10;
            // console.log("hi, pls work", damage, this.garbageQueue);
            while(damage != 0) {
                // cac--;
                // console.log("hi, why dont you work", damage, this.garbageQueue);
                if(this.garbageQueue.length == 0) {
                    // console.log("hi, pls work!!1", damage, this.garbageQueue);
                    return damage;
                }
                if(this.garbageQueue[0] > damage) {
                    this.garbageQueue[0] -= damage;
                    damage = 0;
                }
                else {
                    damage -= this.garbageQueue[0];
                    this.garbageQueue.shift();
                }
            }
            // console.log("hi, pls work!!2", damage, this.garbageQueue);
            return damage;
        }

        //resize the board after a modification
        resizeBoard = () => {
            while(this.board.length <= BOARD_HEIGHT) {
                this.board.push("0000000000");
                this.boardMask.push(0);
            }
            while(this.board.length > BOARD_HEIGHT + 1) {
                this.board.pop();
                this.boardMask.pop();
            }
        }

        //return an object of the board state, to pass to the client for rendering
        makeBoardObject = (res) => {
            res.board = this.board;
            res.garbageQueue = this.garbageQueue;
            res.heldPiece = this.heldPiece;
            res.nextQueue = this.nextQueue;
            res.activePiece = this.activePiece;
            res.activePiecePos = this.activePiecePos;
            res.activePieceRot = this.activePieceRot;
            res.backToBack = this.backToBack;
            res.comboCount = this.comboCount;
        }
    }

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
    socket.on("setTimeRules", setTimeRule);

    const gameScreen = document.getElementById("gameScreen");
    const initialScreen = document.getElementById("initialScreen");

    const newRoomBtn = document.getElementById("newRoomButton");
    const joinRoomBtn = document.getElementById("joinRoomButton");
    const startBtn = document.getElementById("startButton");

    const roomCodeInput = document.getElementById("roomCodeInput");

    const roomCodeDisplay = document.getElementById("roomCodeDisplay");
    const roomCodeText = document.getElementById("roomCodeText");
    const gameTimeRule = document.getElementById("gameRuleForm");

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
        const formData = new FormData(document.forms.namedItem("gameRuleForm"));
        const formDataObj = Object.fromEntries(formData.entries());
        if(formDataObj.initime) {
            timeRule[0] = formDataObj.initime;
        }
        if(formDataObj.addtime) {
            timeRule[1] = formDataObj.addtime;
        }
        // console.log("pressed");
        socket.emit("startGame", [_roomCode, timeRule]);
        // console.log("pressed");
    }

    let p1H, p1B, p1Q;
    let p1Hc, p1Bc, p1Qc;
    let p2H, p2B, p2Q;
    let p2Hc, p2Bc, p2Qc;
    let playerNumber, playerTurn;
    let gameActive = false;

    let gameInterval;
    let p1Board, p2Board, p1TimeLeft, p2TimeLeft;
    let p1BoardSimple;

    // +++++++++++++++++ CONTROLS ++++++++++++++++++++++++++++++++++++++++++++++++

    const playerControls = JSON.parse(JSON.stringify(DEFAULT_CONTROLS));
    const controlState = {
        dasCnt: 0,
        dasDir: "N",
        dasTime: null,

        downCnt: 0,
        downTime: null,
    };
    const keyIsDown = {};
    let timeRule = JSON.parse(JSON.stringify(DEFAULT_TIMERULE));

    // +++++++++++++++++ ACTION ON STARTUP +++++++++++++++++++++++++++++++++++++++

    applyHandling(playerControls);
    console.log("dit me", playerControls);

    //+++++++++++++++++ INITIALIZE +++++++++++++++++++++++++++++++++++++++++++++++

    //Initialize * room *
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
        p1B.width = p2B.width = BOARD_WIDTH$1 * MINO_SIZE +
                                GARBAGE_SIZE + 2 * CV_PAD;
        p1B.height = p2B.height = p1H.height = p2H.height = p1Q.height = p2Q.height
                                = BOARD_VISIBLE_HEIGHT$1 * MINO_SIZE +
                                  CV_PAD * 2;

        document.addEventListener("keydown", keydown);
        document.addEventListener("keyup", keyup);
    }

    //Initialize * match *
    function handleInit(number, roomCode) {
        playerNumber = number;
        _roomCode = roomCode;
        applyHandling(playerControls);
    }

    //Initialize * game *
    function handleInitGame(plrTrn) {
        playerTurn = plrTrn;
        // console.log("lmao");
        roomCodeDisplay.style.display = "none";
        gameTimeRule.style.display = "none";
        startBtn.style.display = "none";
        
        //init game boards;
        p1Board = new gameBoard(7);
        p1BoardSimple = {};
        p1Board.makeBoardObject(p1BoardSimple);
        p2Board = null;

        socket.emit("refreshBoard", JSON.stringify(p1BoardSimple));

        p1TimeLeft = p2TimeLeft = 0;

        startGameInterval();
        gameActive = true;
    }

    function setTimeRule(timeRules) {
        timeRule = timeRules;
    }

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
        }, 1000 / FRAME_RATE$1);
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

        startBtn.style.display = "block";
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
            socket.emit("refreshBoard", JSON.stringify(p1BoardSimple));
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
            p1Board.softDrop(controlState.downCnt);
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
        unhideElement(initialScreen);
        gameScreen.style.display = "none";
    }

    exports.constants = constants;
    exports.keymaps = keymaps;
    exports.playerControls = playerControls;
    exports.utils = utils;

    return exports;

})({});
