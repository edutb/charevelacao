function GameSound() {
  var coin;
  var powerUpAppear;
  var powerUp;
  var marioDie;
  var killEnemy;
  var stageClear;
  var bullet;
  var powerDown;
  var jump;
  var backgroundMusic; // Adicionada variável para música de fundo
  var finalSceneMusic; // Adicione esta linha
  var celebrationMusic; // Adicione esta linha
  var evolutionComplete; // ADICIONE ESTA LINHA
  var inicioMusic; // ADICIONE ESTA LINHA

  var that = this;

  this.init = function() {
    coin = new Audio('sounds/coin.wav');
    powerUpAppear = new Audio('sounds/power-up-appear.wav');
    powerUp = new Audio('sounds/power-up.wav');
    marioDie = new Audio('sounds/mario-die.wav');
    killEnemy = new Audio('sounds/kill-enemy.wav');
    stageClear = new Audio('sounds/stage-clear.wav');
    bullet = new Audio('sounds/bullet.wav');
    powerDown = new Audio('sounds/power-down.wav');
    jump = new Audio('sounds/jump.wav');
    inicioMusic = new Audio('sounds/start.mp3');

    // Adicionado: Carrega e configura a música de fundo
    backgroundMusic = new Audio('sounds/background-music.mp3');
    backgroundMusic.loop = true; // Faz a música tocar em loop

    // Adicione estas duas linhas
    finalSceneMusic = new Audio('sounds/final.mp3');
    evolutionComplete = new Audio('sounds/evolution-complete.mp3');
    celebrationMusic = new Audio('sounds/end.mp3');
  };

  this.playInicioMusic = function() {
    inicioMusic.currentTime = 0;
    inicioMusic.play();
  };

  this.stopInicioMusic = function() {
    inicioMusic.pause();
    inicioMusic.currentTime = 0;
  };

  this.playEvolutionComplete = function() {
    finalSceneMusic.pause();
    evolutionComplete.currentTime = 0;
    evolutionComplete.play();
  };

   this.playFinalSceneMusic = function() {
    stageClear.pause();
    finalSceneMusic.currentTime = 0;
    finalSceneMusic.play();
  };

  this.stopFinalSceneMusic = function() {
    finalSceneMusic.pause();
    finalSceneMusic.currentTime = 0;
  };

  this.playCelebrationMusic = function() {
    evolutionComplete.pause();
    celebrationMusic.currentTime = 0;
    celebrationMusic.play();
  };

  // Adicionado: Função para tocar a música de fundo
  this.playBgMusic = function() {
    backgroundMusic.play();
  };

  // Adicionado: Função para pausar a música de fundo
  this.pauseBgMusic = function() {
    backgroundMusic.pause();
  };

  // Adicionado: Função para parar a música de fundo
  this.stopBgMusic = function() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  };

  this.play = function(element) {
    if (element == 'coin') {
      coin.pause();
      coin.currentTime = 0;
      coin.play();
    } else if (element == 'powerUpAppear') {
      powerUpAppear.pause();
      powerUpAppear.currentTime = 0;
      powerUpAppear.play();
    } else if (element == 'powerUp') {
      powerUp.pause();
      powerUp.currentTime = 0;
      powerUp.play();
    } else if (element == 'marioDie') {
      marioDie.pause();
      marioDie.currentTime = 0;
      marioDie.play();
    } else if (element == 'killEnemy') {
      killEnemy.pause();
      killEnemy.currentTime = 0;
      killEnemy.play();
    } else if (element == 'stageClear') {
      stageClear.pause();
      stageClear.currentTime = 0;
      stageClear.play();
    } else if (element == 'bullet') {
      bullet.pause();
      bullet.currentTime = 0;
      bullet.play();
    } else if (element == 'powerDown') {
      powerDown.pause();
      powerDown.currentTime = 0;
      powerDown.play();
    } else if (element == 'jump') {
      jump.pause();
      jump.currentTime = 0;
      jump.play();
    }
  };
}