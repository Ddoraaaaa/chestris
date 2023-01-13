// +++++++++++++++++++++ SERVER INFORMATION ++++++++++++++++++++++++++++++++++
const FRAME_RATE = 10;
const GRID_SIZE = 20;
const CODE_LENGTH = 6;

// +++++++++++++++++++++ BOARD INFORMATION +++++++++++++++++++++++++++++++++++
const BOARD_BACKGROUND = "#303030";
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

export {
    FRAME_RATE,
    GRID_SIZE,
    CODE_LENGTH,
    PIECE_COLOR,
    BOARD_HEIGHT,
    BOARD_WIDTH,
    BOARD_VISIBLE_HEIGHT,
    PREVIEW_QUEUE
}