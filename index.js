const fs = require("fs");
const express = require("express");
const { Socket } = require("engine.io");

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
  var result = [];

  console.log("word :", word);
  console.log("length :", arr_data.word_length);

  users.push(arr_data);
  io.sockets.emit("new user", users[users.indexOf(arr_data)].word.length);
  const chars = users[users.indexOf(arr_data)].word.split("");

  socket.on("sendLetter", function (letter) {
    console.log("letter :", letter);
    chars.forEach((l, index) => (l === letter ? result.push(index) : null));
    console.log(result);
  });

  io.sockets.emit("Letters guessed", result);

  socket.on("disconnect", (data) => {
    users.splice(users.indexOf(data), 1);
    io.sockets.emit("user left");
    console.log("||---END OF SESSION---||");
  });

  io.to(socket.id).emit(users[users.indexOf(arr_data)].word_length);
});
