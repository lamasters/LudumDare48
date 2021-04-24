var Sentiment = require('sentiment');
var sentiment = new Sentiment();

var config = {
    type: Phaser.WEBGL,
    width: 1100,
    height: 520,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 500},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var vowels = "aeiou";
var state = 0;

function preload() {}

function create() {
    console.log(generatePoem());
    console.log(generatePrompt());
}

function update() {}

function generateAdjectives(num) {
    let sentence = '';

    let adjIdx;
    let adj;
    for(let i = 0; i < num; i++) {
        adjIdx = Math.round(Math.random() * adjectives.length);
        adj = adjectives[adjIdx];
        sentence = sentence + adj + ' ';
    }

    if (vowels.includes(sentence[0])) {
        sentence = 'n ' + sentence;
    } else {
        sentence = ' ' + sentence;   
    }
    return sentence;
}

function generatePoem() {
    let sentence = "I am but a" + generateAdjectives(3);
    
    let nounIdx = Math.round(Math.random() * nouns.length);
    let noun = nouns[nounIdx];

    sentence = sentence + noun + " and you, princess are a" + generateAdjectives(3);
    
    nounIdx = Math.round(Math.random() * nouns.length);
    noun = nouns[nounIdx];

    sentence = sentence + noun + ". Together we will become a" + generateAdjectives(3);

    nounIdx = Math.round(Math.random() * nouns.length);
    noun = nouns[nounIdx];
    sentence = sentence + noun + '.';

    return sentence;
}

function generatePrompt() {
    let sentence = "Good morrow friends. I am lonely here in my castle and thus I am look for a" + generateAdjectives(3);
    
    nounIdx = Math.round(Math.random() * nouns.length);
    noun = nouns[nounIdx];
    sentence = sentence + noun + '.';

    return sentence;
}