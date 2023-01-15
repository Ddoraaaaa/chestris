import gameBoard from './board.js';

export function initGame() {
    const [state, emittedState] = createGameState();
    return [state, emittedState];
}

export function createGameState() {
    let state = {
        p1Board: new gameBoard(7),
        p1TimeLeft: 60*1000,
        p2Board: new gameBoard(7),
        p2TimeLeft: 60*1000,
    };
    let emittedState = {
        p1Board: {},
        p1TimeLeft: 60*1000,
        p2Board: {},
        p2TimeLeft: 60*1000,
    }
    updateEmittedState(state, emittedState);
    return [state, emittedState];
}

export function updateEmittedState(state, emittedState) {
    state.p1Board.makeBoardObject(emittedState.p1Board);
    emittedState.p1TimeLeft = state.p1TimeLeft;
    state.p2Board.makeBoardObject(emittedState.p2Board);
    emittedState.p2TimeLeft = state.p2TimeLeft;
}

export function gameLoop(state, frameLen, curPlayer) {
    if (!state) {
        return;
    }
    if(curPlayer == 1) {
        state.p1TimeLeft -= frameLen;
    }
    if(curPlayer == 2) {
        state.p2TimeLeft -= frameLen;
    }
    if(state.p1TimeLeft <= 0 || state.p1Board.gameOver) {
        state.p1TimeLeft = 0;
        return 2;
    }
    if(state.p2TimeLeft <= 0 || state.p2Board.gameOver) {
        state.p2TimeLeft = 0;
        return 1;
    }
    return false;
}
