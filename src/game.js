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
var poemTitle;
var loadedNext = false;
var next;
var done;

var death;
var win;

var princessX;
var opponentX;
var playerX;
var unfolded = false;

var turret;
var princess;
var opponent;
var player;

var win_sfx;
var lose_sfx;
var high_blip;
var low_blip;

var difficulty;

function preload() {
    this.load.image('scene', 'src/assets/scene.png');
    this.load.image('turret', 'src/assets/turrets.png');
    this.load.image('death', 'src/assets/death.png');
    this.load.image('win', 'src/assets/win.png');

    this.load.spritesheet('princess', 'src/assets/princess_sprite.png', {frameWidth: 120, frameHeight: 200});
    this.load.spritesheet('opponent', 'src/assets/opponent_sprite.png', {frameWidth: 120, frameHeight: 200});
    this.load.spritesheet('opponent_rev', 'src/assets/opponent_sprite_rev.png', {frameWidth: 120, frameHeight: 200});
    this.load.spritesheet('roll', 'src/assets/roll_sprite.png', {frameWidth: 120, frameHeight: 200});
    this.load.spritesheet('unfold', 'src/assets/unfold_sprite.png', {frameWidth: 120, frameHeight: 200});

    this.load.audio('high_blip', ['src/assets/high_blip.wav']);
    this.load.audio('low_blip', ['src/assets/low_blip.wav']);
    this.load.audio('win_sfx', ['src/assets/win.wav']);
    this.load.audio('lose_sfx', ['src/assets/lose.wav']);
    this.load.audio('music', ['src/assets/background_music.mp3']);
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

    win_sfx = this.sound.add('win_sfx', {loop: false, volume: 0.3});
    lose_sfx = this.sound.add('lose_sfx', {loop: false, volume: 0.3});
    high_blip = this.sound.add('high_blip', {loop: false, volume: 0.05});
    low_blip = this.sound.add('low_blip', {loop: false, volume: 0.05});
    let music = this.sound.add('music', {loop: true, volume: 0.5});
    music.play();

    scene = this.add.image(0, 0, 'scene').setOrigin(0, 0);
    death = this.add.image(1280, 0, 'death').setOrigin(0, 0);
    win = this.add.image(1280, 0, 'win').setOrigin(0, 0);

    this.anims.create({
        key: 'princess',
        frames: this.anims.generateFrameNumbers('princess'),
        frameRate: 20,
        repeat: 2
    });

    this.anims.create({
        key: 'opponent',
        frames: this.anims.generateFrameNumbers('opponent'),
        frameRate: 20,
        repeat: 3
    });

    this.anims.create({
        key: 'opponent_rev',
        frames: this.anims.generateFrameNumbers('opponent_rev'),
        frameRate: 20,
        repeat: 3
    });

    this.anims.create({
        key: 'roll',
        frames: this.anims.generateFrameNumbers('roll'),
        frameRate: 20,
        repeat: 4.5
    });

    this.anims.create({
        key: 'unfold',
        frames: this.anims.generateFrameNumbers('unfold'),
        frameRate: 20,
        repeat: 0
    });


    princess = this.add.sprite(1310, 325, 'princess').setScale(0.5);
    opponent = this.add.sprite(-30, 605, 'opponent').setScale(0.5);
    player = this.add.sprite(-30, 605, 'roll').setScale(0.5);

    turret = this.add.image(0, 0, 'turret').setOrigin(0, 0,);

    promptText = this.add.text(700, 90, '', {font: '22px Helvetica', fill: "#ffffff"});
    poemText = this.add.text(430, 500, '', {font: '22px Helvetica', fill: '#ffffff'});
    scoreText = this.add.text(3, 685, '', {font: '24px Helvetica', fill: '#ffffff'});
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
    
    sentence = sentence + noun + ".";
    
    let firstLength = sentence.length;

    sentence = sentence + "\nWe will be a" + generateAdjectives(3);

    rhymesIdx = Math.round(Math.random() * (rhymes[nounIdx].length - 1));
    noun = rhymes[nounIdx][rhymesIdx];
    sentence = sentence + noun + '.';

    let lengthDif = Math.round(Math.max(0, sentence.length - firstLength * 2) / 2);
    for (let i = 0; i < lengthDif; i++) {
        sentence = ' ' + sentence;
    }

    return sentence;
}

function generatePrompt() {
    let sentence = "I want a" + 
    generateAdjectives(3) + "life."

    let firstLength = sentence.length;

    sentence = sentence + "\nThus I seek a" + generateAdjectives(3);
    nounIdx = Math.round(Math.random() * (rhymes[227].length - 1));

    noun = rhymes[227][nounIdx];
    sentence = sentence + noun + '.';

    let lengthDif = Math.round(Math.max(0, sentence.length - firstLength * 2) / 2);
    for (let i = 0; i < lengthDif; i++) {
        sentence = ' ' + sentence;
    }

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
    if (promptIndex % 4 == 0) {
        if (sentiment.analyze(poemPrompt).score > 0) {
            high_blip.play();
        } else {
            low_blip.play();
        }
    }

    promptText.text = promptText.text.concat(poemPrompt[promptIndex]);
    promptIndex++;
}

function drawPoem(poem) {
    if (poemIndex % 4 == 0) {
        if (sentiment.analyze(poem).score > 0) {
            high_blip.play();
        } else {
            low_blip.play();
        }
    }

    poemText.text = poemText.text.concat(poem[poemIndex]);
    poemIndex++;
}

function loadPromptState() {
    scoreText.x = 10;
    scoreText.y = 685;
    death.x = 1300;
    win.x = 1300;
    poemText.x = 430;
    promptText.x = 700;
    turret.x = 0;

    scoreText.setFontSize(24);
    poemPrompt = generatePrompt();
    poemText.text = "";
    promptText.text = "";
    stateLoaded = true;
    princessX = 1280;
    princess.play({key: 'princess'});
}

function promptState() {
    if (princessX > 1025) {
        princessX -= 2;
        princess.x = princessX;
        
    } else if (promptIndex < poemPrompt.length) {
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
        document.body.removeChild(poemTitle);

        for (let i = 1; i <= 5; i++) {
            if (poem.length > i * 40) {
                if (poem [i * 40 - 1] == ' ') {
                    poem = poem.substr(0, i * 40) + '\n' + poem.substr(i * 40);
                } else {
                    poem = poem.substr(0, i * 40) + '-\n' + poem.substr(i * 40);
                }
            }
        }
        
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

    poemTitle = document.createElement('h3');
    poemTitle.id = "poem-title";
    poemTitle.innerText = "Write your poem here"

    document.body.appendChild(textInput);
    document.body.appendChild(submit);
    document.body.appendChild(poemTitle);
    stateLoaded = true;
}

function compDone() {
    document.body.removeChild(next);
    state = 3;
    stateLoaded = false;
}

function loadCompState() {
    compPoem = generatePoem();
    opponentX = -30;
    poemIndex = 0;
    stateLoaded = true;
    loadedNext = false;

    opponent.play({key: 'opponent'});
}

function compState() {
    if (opponentX < 400) {
        opponentX += 2.6;
        opponent.x = opponentX;
        
    } else if (poemIndex < compPoem.length) {
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
    player.x = -30;
}

function loadReadState() {
    poemIndex = 0;
    poemText.text = "";
    loadedNext = false;
    stateLoaded = true;
    
    unfolded = false;
    playerX = -30;
    opponent.play({key: 'opponent_rev'});
    player.play({key: 'roll'});
}

function readState() {
    if (opponentX > -30) {
        opponentX -= 2.8;
        playerX += 2.6;
        player.x = playerX;
        opponent.x = opponentX;
        
    } else if (poemIndex < poem.length) {
        if (!unfolded) {
            player.play({key: 'unfold'});
            unfolded = true;
        }
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
        totalPoints += userPoints;
        state = 6;
    } else {
        state = 5;
        stateLoaded = false;
    }
}

function restart() {
    state = 0;
    stateLoaded = false;
    totalScore = 0;

    document.body.removeChild(done);
}

function loadLoseState() {
    death.x = 0;
    poemText.x = 1300;
    princess.x = 1310;
    promptText.x = 1300;
    turret.x = 1000;

    scoreText.x = 550;
    scoreText.y = 575;
    scoreText.setFontSize(50);

    done = document.createElement('button');
    done.id = "retry";
    done.innerText = "retry";
    done.onclick = restart;

    document.body.appendChild(done);

    stateLoaded = true;

    lose_sfx.play();
}

function nextRound() {
    state = 0;
    stateLoaded = false;
    document.body.removeChild(next);
}

function loadWinState() {
    win.x = 0;
    poemText.x = 1300;
    princess.x = 1310;
    promptText.x = 1300;
    turret.x = 1000;

    next = document.createElement('button');
    next.id = "win";
    next.innerText = "next";
    next.onclick = nextRound;

    document.body.appendChild(next);
    stateLoaded = true;

    win_sfx.play();
}