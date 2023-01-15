import { B2B_DMG, BOARD_HEIGHT, BOARD_WIDTH, COMBO_DMG, LINE_DMG, PC_DMG, PIECE_POSITION, PIECE_SPAWN, PREVIEW_QUEUE, ROTATION_OFFSET, TSPIN_CHECK, TSPIN_DMG } from "../constants.js";

export default class gameBoard {
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
            let newPieces = []
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
        this.addGarbage();
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
        console.log(this.activePiece);
        if(this.activePiece == 7) {
            this.isTSpin = 0;
            for(let [addX, addY] of TSPIN_CHECK) {
                // console.log("wtf help", addX, addY, this.activePiecePos);
                if(this.checkPos(this.activePiecePos[0] + addX, this.activePiecePos[1] + addY)) {
                    this.isTSpin++;
                }
            }

            console.log("is it t spin?", this.isTSpin);
            if(this.isTSpin >= 3) {
                this.isTSpin = true;
            }
            else {
                this.isTSpin = false;
            }
        }
        console.log("is it t spin? no for real pls", this.isTSpin);
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
            this.board.push(0);
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