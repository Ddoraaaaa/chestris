export const CTRL_KEYS = {
    handling: ["das", "arr", "grav"],
    controls: ["right", "left", "sd", "hd", "hold", "rcw", "rccw", "r180"]
};

export const LMAO = "1";
export const FRAME_RATE = 60;

export const DEFAULT_CONTROLS = {
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
}

export const DEFAULT_TIMERULE = Object.freeze([30, 700]);

//BOARD AND GAMEFIELD

export const BOARD_BACKGROUND = "#303030";
export const GARBAGE_COLOR = "#DD0000";
export const BOARD_HEIGHT = 40;
export const BOARD_VISIBLE_HEIGHT = 20;
export const BOARD_WIDTH = 10;
export const PREVIEW_QUEUE = 5;
export const MINO_SIZE = 30;
export const GARBAGE_SIZE = 6;
export const CV_PAD = 20;

//PIECE
export const PIECE_COLOR = [   BOARD_BACKGROUND,  //none
                        "#ea620e",  //orange    L
                        "#2141C6",  //blue      J
                        "#58B103",  //green     S
                        "#D70F37",  //red       Z
                        "#109BD7",  //sky blue  I
                        "#E39F00",  //yellow    O  
                        "#AF2989",  //purple    T
                        "#909090",  //gray      garbage
                        "#505050"]; //dark gray solid

export const PIECE_POSITION = [
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
]