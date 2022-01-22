const fs = require("fs");
const express = require("express");
const { Socket } = require("engine.io");

// Read JSON
let raw = fs.readFileSync("words.json");
let words = JSON.parse(raw);

var length = 0;
for (var word in words) if (words.hasOwnProperty(word)) length++;
function generateWord() {
  var randInt = getRandomInt(length - 1);
  let chosenWord = JSON.stringify(words[randInt].Word).replaceAll('"', "");
  console.log(chosenWord);

  return chosenWord;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//SOCKETS
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
var users = [];

const PORT = process.env.PORT || 8123;
server.listen(PORT,  console.log(`Server started on port ${PORT}`));

app.get('/', (req, res) => {
    res.send("Access denied");
   });

io.on("connection", function (socket) {
  var word = generateWord();
  var arr_data = { socket: socket, word: word, word_length: word.length };
  console.log(word);
  console.log(word.length);
  users.push(arr_data);
  io.sockets.emit("new user", word.length);
  socket.on("new user", data=>{
      console.log(data);
  });
  socket.on("disconnect", function (data) {
    users.splice(users.indexOf(arr_data), 1);
    io.sockets.emit("user left");
  });
  io.to(socket.id).emit(word.length);
});
