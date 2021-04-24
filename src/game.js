var Sentiment = require('sentiment');
var sentiment = new Sentiment();

var config = {
    type: Phaser.WEBGL,
    width: 1280,
    height: 720,
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
var promptScore = {
    score: 0,
    ratio: 0
}
var userScore = {
    score: 0,
    ratio: 0
}
var compScore = {
    score: 0,
    ratio: 0
}

function preload() {}

function create() {
    /* States
    - Prompt state             <-
    - Writing State               ^
    - Competitor state            ^
    - Judgement state             ^
    - Death State OR Win State ->
    */

    let poem = generatePoem();
    let poemPrompt = generatePrompt();

    console.log(poemPrompt);
    console.log(poem);

    calculateScore(promptScore, poemPrompt);
    calculateScore(compScore, poem);

    console.log(compareScore(promptScore, compScore));
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
    let sentence = "Good morrow friends. I am lonely here in my castle and thus I am looking for a" + generateAdjectives(3);

    nounIdx = Math.round(Math.random() * nouns.length);
    noun = nouns[nounIdx];
    sentence = sentence + noun + '.';

    return sentence;
}

function calculateScore(scoreObj, sentence) {
    let analysis = sentiment.analyze(sentence);
    scoreObj.score = analysis.score;

    console.log(analysis);

    let numPos = analysis.positive.length;
    let numNeg = analysis.negative.length;
    scoreObj.ratio = numPos / Math.max(1, numNeg);
}

function compareScore(score1, score2)  {
    let points = 100;

    points -= Math.abs(score1.score - score2.score) * 10;
    points -= Math.abs(score1.ratio - score2.ratio) * 10;

    return points;
}