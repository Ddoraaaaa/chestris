import { BOARD_BACKGROUND, BOARD_HEIGHT, CV_PAD } from "./constants";

export function drawMino(ctx, canvas, x, y, pieceId) {
    ctx.save();
        ctx.fillStyle = 
}

export function drawHold(ctx, canvas, state, timeLeft) {
    ctx.fillStyle = BOARD_BACKGROUND;
    ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
    ctx.save();
        ctx.translate(CV_PAD, CV_PAD);
        //ACTUALLY START DRAWING
        console.log(state, "hello");
    ctx.restore();
}

export function drawBoard(ctx, canvas, state, timeLeft) {
    ctx.fillStyle = BOARD_BACKGROUND;
    ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
    ctx.save();
    ctx.translate(CV_PAD, CV_PAD);
    ctx.restore();
}

export function drawQueue(ctx, canvas, state, timeLeft) {
    ctx.fillStyle = BOARD_BACKGROUND;
    ctx.fillRect(CV_PAD / 2, CV_PAD / 2, canvas.width - CV_PAD, canvas.height - CV_PAD);
    ctx.save();
    ctx.translate(CV_PAD, CV_PAD);
    ctx.restore();
}