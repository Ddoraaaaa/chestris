import { Server } from "socket.io";
import { initGame, gameLoop } from "./src/game.js";
import { FRAME_RATE, CODE_LENGTH } from "./src/constants.js";
import { makeId } from "./src/utils.js";

const state = {};
const clientRooms = {};

const io = new Server()

io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('keyup', handleKeyup);
  client.on('joinRoom', handleJoinRoom);
  client.on('newRoom', handleNewRoom);
  client.on('startGame', handleStartGame);

  function handleJoinRoom(roomName) {
    console.log(roomName)
    const room = io.sockets.adapter.rooms.get(roomName);
    console.log(io.sockets.adapter.rooms)
    console.log(room)

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
    console.log(io.sockets.adapter.rooms)
    
    console.log(state[roomName])
  }

  function handleStartGame(roomName) {
    console.log("reached here");
    state[roomName] = initGame();
    
    startGameInterval(roomName);
    io.sockets.in(roomName)
      .emit('initGame', roomName);
  }

  function handleKeydown(keyCode) {
    return;
  }

  function handleKeyup(keyCode) {
    return;
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
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
