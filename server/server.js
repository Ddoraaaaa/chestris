import { Server } from "socket.io";
import { createServer } from "http";
import { FRAME_RATE, CODE_LENGTH } from "./src/constants.js";
import { makeId } from "./src/utils.js";

const state = {};
const clientRooms = {};
const playerTurn = {};
const timeAdd = {};
const gameInterval = {};

const httpServer = createServer();
const io = new Server(httpServer, { /* options */ });

io.on("connection", client => {

    client.on("joinRoom", handleJoinRoom);
    client.on("newRoom", handleNewRoom);
    client.on("startGame", handleStartGame);
    client.on("newMove", handleNewMove);
    client.on("refreshBoard", handleRefresh);
    client.on("toppedOut", handleTopOut);

    function handleJoinRoom(roomName) {
        // console.log(roomName)
        const room = io.sockets.adapter.rooms.get(roomName);
        // console.log(io.sockets.adapter.rooms)
        // console.log(room)

        let allUsers;
        if (room) {
            allUsers = Array.from(room);
        }

        let numClients = 0;
        if (allUsers) {
            numClients = allUsers.length;
        }

        if (numClients === 0) {
            client.emit("unknownCode");
            return;
        } else if (numClients > 1) {
            client.emit("tooManyPlayers");
            return;
        }

        clientRooms[client.id] = roomName;

        client.join(roomName);
        client.number = 2;
        client.emit("init", 2, roomName);
    }

    function handleNewRoom() {
        let roomName = makeId(CODE_LENGTH);
        clientRooms[client.id] = roomName;
        client.emit("roomCode", roomName);

        client.join(roomName);
        client.number = 1;
        client.emit("init", 1, roomName);
        // console.log(io.sockets.adapter.rooms)
        
        // console.log(state[roomName])
    }

    function handleStartGame(gameRules) {
        let [roomName, timeRule] = gameRules;
        
        io.in(roomName).emit("setTimeRules", timeRule);
        // console.log(timeRule);
        state[roomName] = {};
        timeAdd[roomName] = Number(timeRule[1]);

        playerTurn[roomName] = Math.floor(Math.random()*2)+1;
        state[roomName].playerTime = new Array(2).fill(timeRule[0] * 1000);

        startGameInterval(roomName);
        io.in(roomName).emit("initGame", playerTurn[roomName]);
    }

    function handleNewMove(moves) {
        // console.log("new move!");
        const roomName = clientRooms[client.id];
        let [garbage, gameBoard] = moves;
        state[roomName].playerTime[client.number - 1]+= timeAdd[roomName];
        playerTurn[roomName] = 3 - playerTurn[roomName];
        client.to(roomName).emit("updFromOpponent", [garbage, gameBoard, 1]);
        // console.log("new move :)");
    }

    function handleRefresh(board) {
        const roomName = clientRooms[client.id];
        const objBoard = JSON.parse(board);
        client.to(roomName).emit("updFromOpponent", [0, objBoard, 0]);
    }

    function handleTopOut(roomName) {
        // console.log("topped out!");
        emitGameOver(roomName, 3 - client.number)
    }
});

function startGameInterval(roomName) {
    gameInterval[roomName] = setInterval(() => {
        let winner = 0;
        state[roomName].playerTime[playerTurn[roomName] - 1] = Math.max(
            state[roomName].playerTime[playerTurn[roomName] - 1] - 1000 / FRAME_RATE,
            0
        ) 
        if(state[roomName].playerTime[playerTurn[roomName] - 1] == 0) {
            winner = 3 - playerTurn[roomName];
        }
        // console.log(state[roomName]);
        if(winner) {
            emitGameOver(roomName, winner);
        }
        else {
            io.in(roomName).emit("updFromServer", state[roomName].playerTime);
        }
    }, 1000 / FRAME_RATE);
}

function emitGameOver(roomName, winner) {
    clearInterval(gameInterval[roomName]);
    state[roomName] = {};
    playerTurn[roomName] = null;
    timeAdd[roomName] = null;
    gameInterval[roomName] = null;

    io.in(roomName).emit("gameOver", JSON.stringify({ winner }));
}

httpServer.listen(process.env.PORT || 3000);
