const fs = require("fs");
const express = require("express");
const { Socket } = require("engine.io");
const { networkInterfaces } = require("os");

// Read JSON
let raw = fs.readFileSync("words.json");
let words = JSON.parse(raw);

var length = 0;
for (var word in words) if (words.hasOwnProperty(word)) length++;
function generateWord() {
  var randInt = getRandomInt(length);
  let chosenWord = JSON.stringify(words[randInt].Word).replaceAll('"', "");
  return chosenWord;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//SOCKETS
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
  upgrade: false,
});
var users = [];

const PORT = process.env.PORT || 8123;
server.listen(PORT, console.log(`Server started on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Access denied");
});

io.on("connection", (socket) => {
  console.log("||---CONNECTED---||");
  var word = generateWord();
  var arr_data = { socket: socket, word: word, word_length: word.length };
  //{ indexes: guessedIndexes, correct: guessedLetters, wrong: wrongLetters };
  var arr_game = { indexes: [], correct: [], wrong: [], stage: 11 };
  var temp = [];

  console.log("word :", word);
  console.log("length :", arr_data.word_length);

  users.push(arr_data);

  io.sockets.emit("new user", users[users.indexOf(arr_data)].word.length);

  const chars = users[users.indexOf(arr_data)].word.split("");

  socket.on("sendLetter", function (letter) {
    temp = [];
    console.log("letter :", letter);
    chars.forEach((l, index) => (l === letter ? temp.push(index) : null));
    console.log(temp);
    if (temp.length > 0) {
      arr_game.indexes.push(temp);
      arr_game.correct.push(letter);
    } else {
      arr_game.wrong.push(letter);
      arr_game.stage -= 1;
    }
    console.log(arr_game);
    io.sockets.emit("sendAnswer", arr_game);
  });
  socket.on("startGame", function (newGame) {
    console.log("startgame function");
    if (newGame == true) {
      arr_game.stage = 10;
      io.sockets.emit("sendAnswer", arr_game);
    }else{
      arr_game.stage = 11;
      io.sockets.emit("sendAnswer", arr_game);
    }
  });
  io.sockets.emit("sendAnswer", arr_game);
  socket.on("disconnect", (data) => {
    users.splice(users.indexOf(data), 1);
    io.sockets.emit("user left");
    console.log("||---END OF SESSION---||");
  });
  io.to(socket.id).emit(users[users.indexOf(arr_data)].word_length);
});
