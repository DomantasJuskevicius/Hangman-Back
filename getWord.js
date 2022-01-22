const fs = require("fs");

let raw = fs.readFileSync('words.json');
let words = JSON.parse(raw);

var length = 0;
for(var word in words) if(words.hasOwnProperty(word)) length++;

var randInt = getRandomInt(length - 1);
console.log(words[randInt]);

function getRandomInt(max){
    return Math.floor(Math.random()*max);
}