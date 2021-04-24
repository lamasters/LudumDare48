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

var totalPoints = 0;
var scoreText;

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
var loadedNext = false;
var next;
var done;

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

    promptText = this.add.text(32, 32, '', {font: '16px Helvetica', fill: "#ffffff"});
    poemText = this.add.text(32, 64, '', {font: '16px Helvetica', fill: '#ffffff'});
    scoreText = this.add.text(3, 685, '', {font: '24px Helvetica', fill: '#ffffff'})
}

function update() {
    scoreText.text = "Score: " + String(Math.round(totalPoints));
    if (state == 0) {
        if (!stateLoaded) loadPromptState();
        promptState();
    } else if (state == 1) {
        if (!stateLoaded) loadWriteState();
    } else if (state == 2) {
        if (!stateLoaded) loadCompState();
        compState();
    } else if (state == 3) {
        if (!stateLoaded) loadReadState();
        readState();
    } else if (state == 4) {
        scoreState();
    } else if (state == 5) {
        if (!stateLoaded) loadLoseState();
    } else if (state == 6) {
        if (!stateLoaded) loadWinState();
    }
}

function generateAdjectives(num) {
    let sentence = '';

    let adjIdx;
    let adj;
    for(let i = 0; i < num; i++) {
        adjIdx = Math.round(Math.random() * (adjectives.length - 1));
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
    let sentence = "I am a" + generateAdjectives(3);
    
    let nounIdx = Math.round(Math.random() * (nouns.length - 1));
    let noun = nouns[nounIdx];

    sentence = sentence + noun + ". We will be a" + generateAdjectives(2);

    rhymesIdx = Math.round(Math.random() * (rhymes[nounIdx].length - 1));
    noun = rhymes[nounIdx][rhymesIdx];
    sentence = sentence + noun + '.';

    return sentence;
}

function generatePrompt() {
    let sentence = "I want a" + 
    generateAdjectives(3) + "life. Thus I seek a" + generateAdjectives(3);
    nounIdx = Math.round(Math.random() * (rhymes[227].length - 1));

    noun = rhymes[227][nounIdx];
    sentence = sentence + noun + '.';

    return sentence;
}

function calculateScore(scoreObj, sentence) {
    let analysis = sentiment.analyze(sentence);
    scoreObj.score = analysis.score;

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
    scoreText.x = 10;
    scoreText.y = 685;
    scoreText.setFontSize(24);
    poemPrompt = generatePrompt();
    poemText.text = "";
    promptText.text = "";
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
        
        state = 2;
        stateLoaded = false;
    }
}

function loadWriteState() {
    textInput = document.createElement('input');
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

function compDone() {
    document.body.removeChild(next);
    state = 3;
    stateLoaded = false;
}

function loadCompState() {
    compPoem = generatePoem();
    poemIndex = 0;
    stateLoaded = true;
    loadedNext = false;
}

function compState() {
    if (poemIndex < compPoem.length) {
        drawPoem(compPoem);
    } else if (!loadedNext) {
        next = document.createElement('button');
        next.id = "next";
        next.innerText = "next";
        next.onclick = compDone;

        document.body.appendChild(next);
        loadedNext = true;
    }
}

function readDone() {
    document.body.removeChild(next);
    state = 4;
    stateLoaded = false;
}

function loadReadState() {
    poemIndex = 0;
    poemText.text = "";
    loadedNext = false;
    stateLoaded = true;
}

function readState() {
    if (poemIndex < poem.length) {
        drawPoem(poem);
    } else if (!loadedNext) {
        next = document.createElement('button');
        next.id = "next";
        next.innerText = "next";
        next.onclick = readDone;

        document.body.appendChild(next);
        loadedNext = true;
    }
}

function scoreState() {
    calculateScore(userScore, poem);
    calculateScore(compScore, compPoem);
    calculateScore(promptScore, poemPrompt);

    let userPoints = compareScore(userScore, promptScore);
    let compPoints = compareScore(compScore, promptScore);

    if (userPoints > compPoints) {
        console.log("USER WON")
        totalPoints += userPoints;
        state = 6;
    } else {
        console.log("COMP WON")
        state = 5;
        stateLoaded = false;
    }
}

function restart() {
    state = 0;
    stateLoaded = false;

    document.body.removeChild(done);
}

function loadLoseState() {
    scoreText.x = 550;
    scoreText.y = 330;
    scoreText.setFontSize(50);

    done = document.createElement('button');
    done.id = "retry";
    done.innerText = "retry";
    done.onclick = restart;

    document.body.appendChild(done);

    stateLoaded = true;
}

function nextRound() {
    state = 0;
    stateLoaded = false;
    document.body.removeChild(next);
}

function loadWinState() {
    next = document.createElement('button');
    next.id = "retry";
    next.innerText = "next";
    next.onclick = nextRound;

    document.body.appendChild(next);
    stateLoaded = true;
}