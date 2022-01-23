const fs = require("fs");
const express = require("express");
const { Socket } = require("engine.io");
const { networkInterfaces } = require("os");

// Read JSON
let raw = fs.readFileSync("words.json");
let words = JSON.parse(raw);

function generateWord() {
  var randInt = getRandomInt(words.length);
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

io.on("connection", function(socket) {
  // console.log(users);
  // console.log("||---CONNECTED---||");
  var word = generateWord();
  var arr_data = { correct: [], socket: socket, word: word, word_length: word.length };
  var arr_game = { correct: [], wrong: [], lettersFoundCount: 0, stage: 11 };
  var wordFill = Array(arr_data.word_length);
  var temp = [];
  wordFill.fill(" ");
  arr_data.correct = wordFill;
  arr_game.correct = wordFill;
  // console.log("wordfill :", wordFill);
  // console.log("word :", word);
  // console.log("length :", arr_data.word_length);

  users.push(arr_data);

  io.sockets.emit("new user", users[users.indexOf(arr_data)].word.length);

  const chars = users[users.indexOf(arr_data)].word.split("");

  socket.on("sendLetter", function(letter) {
    temp = [];
    // console.log("letter :", letter);
    chars.forEach((charLetter, index) => (charLetter == letter ? (temp.push(charLetter), wordFill[index]=charLetter) : null));
    // console.log(wordFill);
    // console.log(arr_game.lettersFoundCount);
    if (temp.length > 0) {
      arr_game.correct = wordFill;
      arr_game.lettersFoundCount += temp.length;
    } else {
      arr_game.wrong.push(letter);
      arr_game.stage -= 1;
    }
    io.to(socket.id).emit("sendAnswer", arr_game);
  });
  socket.on("startGame", function (newGame) {
    // console.log(socket.id);
    // console.log("startgame function");
    if (newGame) {
      arr_game.stage = 10;
      io.to(socket.id).emit("sendAnswer", arr_game);
    }else{
      arr_game.stage = 11;
      io.to(socket.id).emit("sendAnswer", arr_game);
    }
  });
  io.to(socket.id).emit("sendAnswer", arr_game);
  socket.on("disconnect", (data) => {
    users.splice(users.indexOf(socket), 1);
    io.sockets.emit("user left");
  });
});
