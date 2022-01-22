const { randomInt } = require("crypto");
const fs = require("fs");

let raw = fs.readFileSync('words.json');
let words = JSON.parse(raw);

var length = -1;
for(var word in words) if(words.hasOwnProperty(word)) length++;

var randInt = getRandomInt(length);

console.log(word[randInt]);

function getRandomInt(max){
    return Math.floor(Math.random()*max);
}