import deepFreeze from "deep-freeze";

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
                        "#909090"]  //gray      garbage

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
]

const PIECE_SPAWN = [
    [], //none
    [19, 4], //L
    [19, 4], //J
    [19, 4], //S
    [19, 4], //Z
    [18, 4], //I
    [20, 5], //O
    [19, 4]  //T
]

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
]

// +++++++++++++++++++++ GAME RULE +++++++++++++++++++++++++++++++++++++++++++
const TSPIN_DMG = [0, 2, 3, 6];
const TSPIN_CHECK = [[0, 0], [0, 2], [2, 0], [2, 2]];
const B2B_DMG = [2, 6, 11, 15, 18, 20, 20, 22];
const LINE_DMG = [0, 0, 1, 2, 4];
const COMBO_DMG = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7];
const PC_DMG = 10;

// +++++++++++++++++++++ JUST EXPORTIN' ++++++++++++++++++++++++++++++++++++++
let A = [
    FRAME_RATE,
    GRID_SIZE,
    CODE_LENGTH,
    PIECE_COLOR,
    BOARD_HEIGHT,
    BOARD_WIDTH,
    BOARD_VISIBLE_HEIGHT,
    PREVIEW_QUEUE,
    PIECE_POSITION,
    PIECE_SPAWN,
    ROTATION_OFFSET,
    TSPIN_DMG,
    TSPIN_CHECK,
    B2B_DMG,
    LINE_DMG,
    COMBO_DMG,
    PC_DMG
]

for(let anObject of A)
{
    deepFreeze(anObject);
}

export {
    FRAME_RATE,
    GRID_SIZE,
    CODE_LENGTH,
    PIECE_COLOR,
    BOARD_HEIGHT,
    BOARD_WIDTH,
    BOARD_VISIBLE_HEIGHT,
    PREVIEW_QUEUE,
    PIECE_POSITION,
    PIECE_SPAWN,
    ROTATION_OFFSET,
    TSPIN_DMG,
    TSPIN_CHECK,
    B2B_DMG,
    LINE_DMG,
    COMBO_DMG,
    PC_DMG
}