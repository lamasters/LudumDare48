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

var poem;
var compPoem;
var poemPrompt;

var promptText;
var poemText;
var promptIndex = 0;
var poemIndex = 0;

var stateLoaded = false;

var textInput;
var submit;

function preload() {
}

function create() {
    /* States
    - Prompt state             <-
    - Writing State               ^
    - Competitor state            ^
    - Reading state               ^
    - Judgement state             ^
    - Death State OR Win State ->
    */

    promptText = this.add.text(32, 32, '', {font: '15px Helvetica', fill: "#ffffff"});
    poemText = this.add.text(32, 64, '', {font: '15px Helvetica', fill: '#ffffff'});

    poem = generatePoem();
    poemPrompt = generatePrompt();

    console.log(poemPrompt);
    console.log(poem);

    calculateScore(promptScore, poemPrompt);
    calculateScore(compScore, poem);

    console.log(compareScore(promptScore, compScore));
}

function update() {
    if (state == 0) {
        if (!stateLoaded) loadPromptState();
        promptState();
    } else if (state == 1) {
        if(!stateLoaded) loadWriteState();
    } else if (state == 2) {
        if(!stateLoaded) loadCompState();
        compState();
    }
}

function generateAdjectives(num) {
    let sentence = '';

    let adjIdx;
    let adj;
    for(let i = 0; i < num; i++) {
        adjIdx = Math.round(Math.random() * adjectives.length);
        adj = adjectives[adjIdx];
        sentence = sentence + adj + (i == num - 1 ? ' ' : ', ');
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
    let sentence = "Good morrow friends. I am lonely here in my castle but I want to have a" + 
    generateAdjectives(3) + "life. Thus I am looking for a" + generateAdjectives(3);

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

function drawPrompt() {
    promptText.text = promptText.text.concat(poemPrompt[promptIndex]);
    promptIndex++;
}

function drawPoem(poem) {
    poemText.text = poemText.text.concat(poem[poemIndex]);
    poemIndex++;
}

function loadPromptState() {
    poemPrompt = generatePrompt();
    stateLoaded = true;
}

function promptState() {
    if (promptIndex < poemPrompt.length) {
        drawPrompt();
    } else {
        promptIndex = 0;
        stateLoaded = false;
        state = 1;
    }
}

function getPoem() {
    poem = textInput.value;
    if (poem.length > 0) {
        document.body.removeChild(textInput);
        document.body.removeChild(submit);
        
        calculateScore(userScore, poem);
        state = 2;
        stateLoaded = false;
    }
}

function loadWriteState() {
    textInput = document.createElement('textarea');
    textInput.id = "poem-area";
    textInput.value = "";
    
    submit = document.createElement('button');
    submit.id = "poem-submit";
    submit.innerText = "submit";
    submit.onclick = getPoem;

    document.body.appendChild(textInput);
    document.body.appendChild(submit);
    stateLoaded = true;
}

function loadCompState() {
    compPoem = generatePoem();
    stateLoaded = true;
}

function compState() {
    if (poemIndex < compPoem.length) {
        drawPoem(compPoem);
    }
}