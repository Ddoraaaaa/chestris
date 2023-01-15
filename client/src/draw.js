import { BOARD_BACKGROUND, BOARD_HEIGHT, BOARD_VISIBLE_HEIGHT, BOARD_WIDTH, CV_PAD, GARBAGE_SIZE, MINO_SIZE, PIECE_COLOR, PIECE_POSITION, GARBAGE_COLOR } from "./constants";

export function drawMino(ctx, canvas, x, y, pieceId) {
    // console.log("drawing mino at: ", x, y, pieceId);
    ctx.save();
        ctx.fillStyle = PIECE_COLOR[pieceId];
        ctx.fillRect(x + 1, y + 1, MINO_SIZE - 2, MINO_SIZE - 2);
    ctx.restore();
}

export function drawPiece(ctx, canvas, x, y, pieceId, rot) {
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
            drawMino(ctx, canvas, xDraw, yDraw, pieceId)
        }
    ctx.restore();
}

export function drawHold(ctx, canvas, state, timeLeft) {
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
    ctx.restore();
}

export function drawBoard(ctx, canvas, state, timeLeft) {
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

export function drawQueue(ctx, canvas, state, timeLeft) {
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