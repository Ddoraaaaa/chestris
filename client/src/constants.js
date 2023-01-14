export const CTRL_KEYS = ["das", "arr", "right", "left", "sd", "hd", "hold", "rcw", "rccw", "r180"];
export const LMAO = "1";

export const DEFAULT_GAME_HANDLING = {
    "das": 170,
    "arr": 50,
    "left": 37,
    "right": 39,
    "sd": 51,
    "hd": 32,
    "hold": 67,
    "rcw": 38
};

//BOARD AND GAMEFIELD

export const BOARD_BACKGROUND = "#303030";
export const BOARD_HEIGHT = 40;
export const BOARD_VISIBLE_HEIGHT = 20;
export const BOARD_WIDTH = 10;
export const PREVIEW_QUEUE = 5;
export const MINO_SIZE = 30;
export const GARBAGE_SIZE = 4
export const CV_PAD = 10;

//PIECE
export const PIECE_COLOR = [   BOARD_BACKGROUND,  //none
                        "#ea620e",  //orange    L
                        "#2141C6",  //blue      J
                        "#58B103",  //green     S
                        "#D70F37",  //red       Z
                        "#109BD7",  //sky blue  I
                        "#E39F00",  //yellow    O  
                        "#AF2989",  //purple    T
                        "#909090"]  //gray      garbage