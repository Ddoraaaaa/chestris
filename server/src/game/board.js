import { BOARD_HEIGHT, BOARD_WIDTH, PREVIEW_QUEUE } from "../constants";

export default class gameBoard {
    // 0:none 1:L 2:J 3:S 4:Z 5:I 6:O 7:T 8:garbage
    // board: 1->40:D->U then 1->10:L->R 
    constructor(bagSize) {
        //the actual board
        this.board = new Array(BOARD_HEIGHT + 1).fill(0);
        this.boardMask = new Array(BOARD_HEIGHT + 1).fill(0);

        //things around the board
        this.garbageQueue = [];
        this.nextQueue = [];
        this.heldPiece = 0;

        //game rules
        this._bagSize = bagSize;

        this.fillNextQueue();
        this.activePiece = this.getNextPiece();
    }

    //get type of mino at row i, col j
    atPos = (i, j) => {
        const valAtPos = (this.board[i] >> (4 * (j - 1))) & 15;
        return valAtPos;
    }

    //update mino at row i, col j to val
    makePos = (i, j, val) => {
        let valAtPos = (this.board[i] >> (4 * (j - 1))) & 15;
        valAtPos = val - valAtPos;
        this.board[i]+= valAtPos << (4 * (j - 1));
        if(val == 1) {
            this.boardMask[i] |= 1 << (j - 1);
        }
        else {
            this.boardMask[i] &= (1 << BOARD_WIDTH) - 1 - (1 << (j - 1));
        }
    }

    //swap current piece with held piece
    //take new piece if no held yet
    holdPiece = () => {
        if(this.heldPiece == 0) {
            this.heldPiece = this.getNextPiece();
        }
        [this.heldPiece, this.activePiece] = [this.activePiece, this.heldPiece];
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

    //clear all the full lines
    killClearedLines = () => {
        for(let i = this.board.length - 1; i > 0; i--) {
            if(this.boardMask[i] == (1 << BOARD_WIDTH) - 1) {
                this.board.splice(i, 1);
                this.boardMask.splice(i, 1);
            }
        }
        this.resizeBoard();
    }

    //add the next garbage in queue
    addGarBage = () => {
        const nextGarbage = this.garbageQueue.shift();
        const garbagePos = Math.floor(Math.random() * BOARD_WIDTH);
        let garbage = 0, garbageMask = 0;
        for(let i = 0; i < BOARD_WIDTH; i++) {
            if(i != garbagePos) {
                garbage |= 8 << (4 * i);
                garbageMask |= 1 << i;
            }
        }
        for(let i = 0; i < nextGarbage; i++) {
            this.board.unshift(garbage);
            this.boardMask.unshift(garbageMask);
        }
        this.resizeBoard();
    }

    //resize the board after a modification
    resizeBoard = () => {
        while(this.board.length <= BOARD_HEIGHT) {
            this.board.push(0);
            this.boardMask.push(0);
        }
        while(this.board.length > BOARD_HEIGHT) {
            this.board.pop();
            this.boardMask.pop();
        }
    }

    //return an object of the board state, to pass to the client for rendering
    makeBoardObject = () => {
        var resObj = {};
        return resObj;
    }
}