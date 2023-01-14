import { Server } from "socket.io";
import { initGame, gameLoop, updateEmittedState } from "./src/game/game.js";
import { FRAME_RATE, CODE_LENGTH } from "./src/constants.js";
import { makeId } from "./src/utils.js";

const state = {};
const emittedState = {};
const clientRooms = {};

const io = new Server()

io.on('connection', client => {

    client.on('keydown', handleKeydown);
    client.on('keyup', handleKeyup);
    client.on('joinRoom', handleJoinRoom);
    client.on('newRoom', handleNewRoom);
    client.on('startGame', handleStartGame);

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
            client.emit('unknownCode');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = roomName;

        client.join(roomName);
        client.number = 2;
        client.emit('init', 2, roomName);
    }

    function handleNewRoom() {
        let roomName = makeId(CODE_LENGTH);
        clientRooms[client.id] = roomName;
        client.emit('roomCode', roomName);

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1, roomName);
        // console.log(io.sockets.adapter.rooms)
        
        // console.log(state[roomName])
    }

    function handleStartGame(roomName) {
        // console.log("reached here");
        [state[roomName], emittedState[roomName]] = initGame();
        // console.log("hi", state[roomName]);
        
        startGameInterval(roomName);
        io.sockets.in(roomName)
            .emit('initGame', roomName);
    }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];
        let thisPlayer = state[roomName].p1Board;
        let otherPlayer = state[roomName].p2Board;
        if(client.number == 2) {
            [thisPlayer, otherPlayer] = [otherPlayer, thisPlayer];
        }
        switch(keyCode) {
            case "hd":
                let damageDealt = thisPlayer.hardDrop();
                console.log(damageDealt);
                if(damageDealt) {
                    otherPlayer.gotSentGarbage(damageDealt);
                }
                break;
            case "sd":
                thisPlayer.softDrop(20);
                break;
            case "rcw":
                thisPlayer.rotatePiece(1);
                break;
            case "r180":
                thisPlayer.rotatePiece(2);
                break;
            case "rccw":
                thisPlayer.rotatePiece(3);
                break;
            case "hold":
                thisPlayer.holdPiece();
                break;
            case "left":
                thisPlayer.moveSideways(1, -1);
                break;
            case "right":
                thisPlayer.moveSideways(1, 1);
                break;
        }
        updateEmittedState(state[roomName], emittedState[roomName]);
    }

    function handleKeyup(keyCode) {
        return;
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        if (!winner) {
            updateEmittedState(state[roomName], emittedState[roomName]);
            emitGameState(roomName, emittedState[roomName])
        } else {
            updateEmittedState(state[roomName], emittedState[roomName]);
            emitGameState(roomName, emittedState[roomName])
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
    io.sockets.in(room)
        .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
    io.sockets.in(room)
        .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(3000);
