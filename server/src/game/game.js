import { GRID_SIZE } from '../constants.js';
import gameBoard from './board.js';

export function initGame() {
    const state = createGameState()
    randomFood(state);
    return state;
}

export function createGameState() {
    let res = {
        p1Board: new gameBoard(7),
        p1Timeleft: 60*1000,
        p2Board: new gameBoard(7),
        p2Timeleft: 60*1000,
    };
    return res;
}

export function gameLoop(state) {
    if (!state) {
        return;
    }
    return false;
}
