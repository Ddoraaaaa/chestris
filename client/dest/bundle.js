var dd = (function (exports) {
    'use strict';

    const CTRL_KEYS$1 = ["das", "arr", "right", "left", "sd", "hd", "hold", "rcw", "rccw", "r180"];
    const LMAO = "1";
    const DEFAULT_GAME_HANDLING = {
        "das": 170,
        "arr": 50,
        "left": 37,
        "right": 39,
        "sd": 51,
        "hd": 32,
        "hold": 67,
        "rcw": 38
    };
    const BG_COLOUR= "#202020";
    const SNAKE_COLOUR = "#c2c2c2";
    const FOOD_COLOUR = "#e66916";

    var constants = /*#__PURE__*/Object.freeze({
        __proto__: null,
        BG_COLOUR: BG_COLOUR,
        CTRL_KEYS: CTRL_KEYS$1,
        DEFAULT_GAME_HANDLING: DEFAULT_GAME_HANDLING,
        FOOD_COLOUR: FOOD_COLOUR,
        LMAO: LMAO,
        SNAKE_COLOUR: SNAKE_COLOUR
    });

    function hideElement(elem) {
      elem.classList.remove("d-flex");
      elem.classList.add("d-none");
    }

    function getCookie() {
      var cookie = document.cookie;
      var res = {};
      cookie.split(/\s*;\s*/).forEach(function(pair) {
        pair = pair.split(/\s*=\s*/);
        res[pair[0]] = pair.splice(1).join('=');
      });
      console.log(res);
      return res;
    }

    function setCookie(key, value, isDelete) {
      var cookieString = key + "=" + value;
      if(isDelete) {
        cookieString += "; expires = Thu, 01 Jan 1970 00:00:00 GMT";
      }
      cookieString += "; path=/";
      console.log(cookieString);
      document.cookie=cookieString;
    }

    function enforceMinMax(elem) {
      if (elem.value != "") {
        if (parseInt(elem.value) < parseInt(elem.min)) {
          elem.value = elem.min;
        }
        if (parseInt(elem.value) > parseInt(elem.max)) {
          elem.value = elem.max;
        }
      }
    }

    var utils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        enforceMinMax: enforceMinMax,
        getCookie: getCookie,
        hideElement: hideElement,
        setCookie: setCookie
    });

    function rgKeyDown(elem, event) {
        if(event.keyCode == 27) {
            elem.value="";
            return;
        }
        elem.value=event.keyCode;
        elem.readOnly=true;
    }

    function rgKeyUp(elem) {
        elem.readOnly=false;
    }

    function applyHandling(gameHandling) {
        var cookieObj = getCookie();
        for(let key of CTRL_KEYS$1) {
            if(cookieObj[key]) {
                gameHandling[key] = Number(cookieObj[key]);
            }
        }
    }

    function mapKeys(frm) {
        console.log(frm);
        const formData = new FormData(frm);
        const formDataObj = Object.fromEntries(formData.entries());

        console.log(formData.entries());
        console.log(formDataObj);

        for(var key in formDataObj) {
            if(formDataObj[key]) {
                setCookie(key, formDataObj[key], 0);
            }
        }
    }

    function resetKeys() {
        for(var key of CTRL_KEYS) {
            setCookie(key, 1234, 1);
        }
    }

    var keymaps = /*#__PURE__*/Object.freeze({
        __proto__: null,
        applyHandling: applyHandling,
        mapKeys: mapKeys,
        resetKeys: resetKeys,
        rgKeyDown: rgKeyDown,
        rgKeyUp: rgKeyUp
    });

    const socket = io("ws://localhost:3000", {
      transports: ["websocket", "polling", "flashsocket"],
    });

    socket.on("init", handleInit);
    socket.on("initGame", handleInitGame);
    socket.on("gameState", handleGameState);
    socket.on("gameOver", handleGameOver);
    socket.on("roomCode", handleRoomCode);
    socket.on("unknownCode", handleUnknownCode);
    socket.on("tooManyPlayers", handleTooManyPlayers);

    const gameScreen = document.getElementById("gameScreen");
    const initialScreen = document.getElementById("initialScreen");

    const newRoomBtn = document.getElementById("newRoomButton");
    const joinRoomBtn = document.getElementById("joinRoomButton");
    const startBtn = document.getElementById("startButton");

    const roomCodeInput = document.getElementById("roomCodeInput");

    const roomCodeDisplay = document.getElementById("roomCodeDisplay");
    const roomCodeText = document.getElementById("roomCodeText");

    const playerScores = document.getElementById("playerScores");

    var myScore = 0, theirScore = 0;
    var _roomCode;

    newRoomBtn.addEventListener("click", newRoom);
    joinRoomBtn.addEventListener("click", joinRoom);
    startBtn.addEventListener("click", startGame);

    function newRoom() {
      socket.emit("newRoom");
      init();
    }

    function joinRoom() {
      _roomCode = roomCodeInput.value;
      socket.emit("joinRoom", _roomCode);
      handleRoomCode(_roomCode);
      init();
    }

    function startGame() {
      console.log("pressed");
      socket.emit("startGame", _roomCode);
      console.log("pressed");
    }

    let canvas, ctx;
    let playerNumber;
    let gameHandling;
    let gameActive = false;

    function init() {
      gameHandling = DEFAULT_GAME_HANDLING;
      applyHandling(gameHandling);

      console.log(gameHandling, "lmao");
      console.log("why?");

      hideElement(initialScreen);
      gameScreen.style.display = "block";

      canvas = document.getElementById("canvas");
      ctx = canvas.getContext("2d");

      canvas.height=canvas.width=600;
      // canvas.height = window.innerHeight*0.8;
      // canvas.width = canvas.height*1.5;

      ctx.fillStyle = BG_COLOUR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      document.addEventListener("keydown", keydown);
      document.addEventListener("keyup", keyup);
    }

    function handleInitGame() {
      console.log("lmao");
      roomCodeDisplay.style.display = "none";
      startBtn.style.display = "none";

      handleScoreUpdate();

      gameActive = true;
    }

    function keydown(e) {
      console.log(e.keyCode);
      if (!gameActive) {
        return;
      }
      socket.emit("keydown", e.keyCode);
    }

    function keyup(e) {
      console.log(e.keyCode);
      if (!gameActive) {
        return;
      }
      socket.emit("keyup", e.keyCode);
    }

    function paintGame(state) {
      console.log(state);
      ctx.fillStyle = BG_COLOUR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const food = state.food;
      const gridsize = state.gridsize;
      const size = canvas.width / gridsize;

      ctx.fillStyle = FOOD_COLOUR;
      ctx.fillRect(food.x * size, food.y * size, size, size);

      paintPlayer(state.players[0], size, SNAKE_COLOUR);
      paintPlayer(state.players[1], size, "red");
    }

    function paintPlayer(playerState, size, colour) {
      const snake = playerState.snake;

      ctx.fillStyle = colour;
      for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
      }
    }

    function handleInit(number, roomCode) {
      playerNumber = number;
      _roomCode = roomCode;
    }

    function handleGameState(gameState) {
      if (!gameActive) {
        return;
      }
      gameState = JSON.parse(gameState);
      requestAnimationFrame(() => paintGame(gameState));
    }

    function handleGameOver(data) {
      if (!gameActive) {
        return;
      }
      data = JSON.parse(data);

      gameActive = false;

      if (data.winner === playerNumber) {
        myScore++;
        alert("You Win!");
      } else {
        theirScore++;
        alert("You Lose :(");
      }

      handleScoreUpdate();
      startBtn.style.display = "block";
    }

    function handleScoreUpdate() {
      playerScores.style.display = "block";
      playerScores.innerText=`${myScore} - ${theirScore}`;
    }

    function handleRoomCode(roomCode) {
      roomCodeText.innerText = roomCode;
    }

    function handleUnknownCode() {
      reset();
      alert("Unknown Room");
    }

    function handleTooManyPlayers() {
      reset();
      alert("Room already full");
    }

    function reset() {
      playerNumber = null;
      roomCodeInput.value = "";
      initialScreen.style.display = "block";
      gameScreen.style.display = "none";
    }

    exports.constants = constants;
    exports.keymaps = keymaps;
    exports.utils = utils;

    return exports;

})({});
