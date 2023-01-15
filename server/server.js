import { Server } from "socket.io";
import { createServer } from "http";
import { initGame, gameLoop, updateEmittedState } from "./src/game/game.js";
import { FRAME_RATE, CODE_LENGTH } from "./src/constants.js";
import { makeId } from "./src/utils.js";

const state = {};
const emittedState = {};
const clientRooms = {};
const playerTurn = {};
const timeAdd = {};

const httpServer = createServer();
const io = new Server(httpServer, { /* options */ });

io.on('connection', client => {

    client.on('addAction', handleAction);
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

    function handleStartGame(gameRules) {
        let [roomName, timeRule] = gameRules;
        // console.log(roomName)
        timeAdd[roomName] = timeRule[1];
        // console.log("reached here");
        [state[roomName], emittedState[roomName]] = initGame(timeRule);
        playerTurn[roomName] = Math.floor(Math.random()*2)+1;
        // console.log(playerTurn[roomName]);
        // console.log("hi", state[roomName]);
        
        startGameInterval(roomName);
        io.sockets.in(roomName)
            .emit('initGame', roomName);
    }

    function handleAction(actions) {
        const roomName = clientRooms[client.id];
        if(client.number != playerTurn[roomName]) {
            return;
        }
        let thisPlayer = state[roomName].p1Board;
        let otherPlayer = state[roomName].p2Board;
        if(client.number == 2) {
            [thisPlayer, otherPlayer] = [otherPlayer, thisPlayer];
        }
        let [keyCode, timesDid] = actions;
        // console.log(actions);
        // let [keyCode, keyCode2] = keyCode1;
        // console.log("hey", keyCode1);
        switch(keyCode) {
            case "hd":
                let damageDealt = thisPlayer.hardDrop();
                switch(client.number) {
                    case 1:
                        state[roomName].p1TimeLeft += timeAdd[roomName];
                        break;
                    case 2:
                        state[roomName].p2TimeLeft += timeAdd[roomName];
                        break;
                }
                // console.log(damageDealt);
                if(damageDealt) {
                    otherPlayer.gotSentGarbage(damageDealt);
                }
                playerTurn[roomName] = 3 - playerTurn[roomName];
                break;
            case "sd":
                thisPlayer.softDrop(timesDid);
                break;
            case "rcw":
                thisPlayer.rotatePiece(timesDid);
                break;
            case "hold":
                thisPlayer.holdPiece();
                break;
            case "left":
                thisPlayer.moveSideways(timesDid, -1);
                break;
            case "right":
                thisPlayer.moveSideways(timesDid, 1);
                break;
        }
        updateEmittedState(state[roomName], emittedState[roomName]);
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName], 1000 / FRAME_RATE, playerTurn[roomName]);
        // console.log(state[roomName]);
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

httpServer.listen(3000);
