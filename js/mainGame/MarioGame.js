// Main Class of Mario Game

function MarioGame() {
  var gameUI = GameUI.getInstance();

  var maxWidth; //width of the game world
  var height;
  var viewPort; //width of canvas, viewPort that can be seen
  var tileSize;
  var map;
  var originalMaps;

  var translatedDist; //distance translated(side scrolled) as mario moves to the right
  var centerPos; //center position of the viewPort, viewable screen
  var marioInGround;

  //instances
  var mario;
  var element;
  var gameSound;
  var score;
  var peach; // Adicionado: Instância da Peach
  var particles = []; // Adicionado: Array para as partículas dos fogos
   var stars = []; // ADICIONE ESTA LINHA

  var keys = [];
  var goombas;
  var powerUps;
  var bullets;
  var fireballs; // Adicionado: Array para bolas de fogo
  var bulletFlag = false;

  var currentLevel;

  var animationID;
  var timeOutId;

  var tickCounter = 0; //for animating mario
  var maxTick = 25; //max number for ticks to show mario sprite
  var instructionTick = 0; //showing instructions counter
  var fireballSpawnCounter = 0; // Adicionado: Contador para spawn de bolas de fogo
  var fireballSpawnRate = 30; // MODIFICADO: Diminuído para gerar mais frequentemente (era 300)
  var that = this;

  function Particle(x, y, hue) {
    this.x = x;
    this.y = y;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 4 + 1;
    this.friction = 0.97; // Efeito de desaceleração
    this.gravity = 1;
    this.hue = hue;
    this.brightness = Math.random() * 20 + 50;
    this.alpha = 1; // Opacidade inicial
    this.decay = Math.random() * 0.02 + 0.015; // Velocidade com que a partícula desaparece

    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;

    this.isDead = function() {
      return this.alpha <= this.decay;
    };

    this.update = function() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity * 0.05; // Efeito de gravidade suave
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.alpha -= this.decay;
    };

    this.draw = function(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
      ctx.fillStyle = 'hsla(' + this.hue + ',100%,' + this.brightness + '%,' + this.alpha + ')';
      ctx.fill();
    };
  }
  // --- Fim do Objeto dos Fogos ---

  // Adicione esta função logo após o construtor Particle
  function Star() {
    this.x = Math.random() * viewPort;
    this.y = Math.random() * height;
    this.radius = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.2;
    this.vx = (Math.random() - 0.5) * 0.1; // Movimento lento
    this.vy = (Math.random() - 0.5) * 0.1;
    this.twinkleSpeed = Math.random() * 0.01;
    this.twinkleDirection = 1;

    this.update = function() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > viewPort) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
      
      this.alpha += this.twinkleSpeed * this.twinkleDirection;
      if (this.alpha > 0.7 || this.alpha < 0.1) this.twinkleDirection *= -1;
    };

    this.draw = function(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + this.alpha + ')';
      ctx.fill();
    };
  }

  this.init = function(levelMaps, level) {
    height = 480;
    maxWidth = 0;
    viewPort = 1280;
    tileSize = 32;
    translatedDist = 0;
    goombas = [];
    powerUps = [];
    particles = []; // ADICIONE ESTA LINHA
    stars = []; // ADICIONE ESTA LINHA
    bullets = [];
    fireballs = []; // Adicionado: Inicializa o array de bolas de fogo
    fireballSpawnCounter = 0; // Adicionado: Reseta o contador ao iniciar o nível
    
    gameUI.setWidth(viewPort);
    gameUI.setHeight(height);
    gameUI.show();

    currentLevel = level;
    originalMaps = levelMaps;
    map = JSON.parse(levelMaps[currentLevel]);

    if (!score) {
      //so that when level changes, it uses the same instance
      score = new Score();
      score.init();
    }
    score.displayScore();
    score.updateLevelNum(currentLevel);

    if (!mario) {
      //so that when level changes, it uses the same instance
      mario = new Mario();
      mario.init();
    } else {
      mario.x = 10;
      mario.frame = 0;
    }

    // MODIFICADO: Garante que a instância de som seja única e inicia a música de fundo.
    if (!gameSound) {
      gameSound = new GameSound();
      gameSound.init();
    }
    gameSound.playBgMusic(); // Toca ou resume a música de fundo

    element = new Element();

    that.calculateMaxWidth();
    that.bindKeyPress();
    that.startGame();
  };

  that.calculateMaxWidth = function() {
    //calculates the max width of the game according to map size
    for (var row = 0; row < map.length; row++) {
      for (var column = 0; column < map[row].length; column++) {
        if (maxWidth < map[row].length * 32) {
          maxWidth = map[column].length * 32;
        }
      }
    }
  };

  that.bindKeyPress = function() {
    var canvas = gameUI.getCanvas(); //for use with touch events

    //key binding
    document.body.addEventListener('keydown', function(e) {
      keys[e.keyCode] = true;
    });

    document.body.addEventListener('keyup', function(e) {
      keys[e.keyCode] = false;
    });

    //key binding for touch events
    canvas.addEventListener('touchstart', function(e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = true; //left arrow
        }
        if (touches[i].pageX > 200 && touches[i].pageX < 400) {
          keys[39] = true; //right arrow
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          //in touch events, same area acts as sprint and bullet key
          keys[16] = true; //shift key
          keys[17] = true; //ctrl key
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = true; //space
        }
      }
    });

    canvas.addEventListener('touchend', function(e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = false;
        }
        if (touches[i].pageX > 200 && touches[i].pageX <= 640) {
          keys[39] = false;
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          keys[16] = false;
          keys[17] = false;
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = false;
        }
      }
    });

    canvas.addEventListener('touchmove', function(e) {
      var touches = e.changedTouches;
      e.preventDefault();

      for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX <= 200) {
          keys[37] = true;
          keys[39] = false;
        }
        if (touches[i].pageX > 200 && touches[i].pageX < 400) {
          keys[39] = true;
          keys[37] = false;
        }
        if (touches[i].pageX > 640 && touches[i].pageX <= 1080) {
          keys[16] = true;
          keys[32] = false;
        }
        if (touches[i].pageX > 1080 && touches[i].pageX < 1280) {
          keys[32] = true;
          keys[16] = false;
          keys[17] = false;
        }
      }
    });
  };

  //Main Game Loop
  this.startGame = function() {
    animationID = window.requestAnimationFrame(that.startGame);

    gameUI.clear(0, 0, maxWidth, height);

    if (instructionTick < 1000) {
      that.showInstructions(); //showing control instructions
      instructionTick++;
    }

    that.renderMap();

    for (var i = 0; i < powerUps.length; i++) {
      powerUps[i].draw();
      powerUps[i].update();
    }

    for (var i = 0; i < bullets.length; i++) {
      bullets[i].draw();
      bullets[i].update();
    }

    for (var i = 0; i < goombas.length; i++) {
      goombas[i].draw();
      goombas[i].update();
    }

    // Adicionado: Atualiza e desenha as bolas de fogo
    for (var i = 0; i < fireballs.length; i++) {
      fireballs[i].draw();
      fireballs[i].update();
    }

    that.checkPowerUpMarioCollision();
    that.checkBulletEnemyCollision();
    that.checkEnemyMarioCollision();
    that.checkFireballMarioCollision(); // Adicionado: Verifica colisão entre Mario e bola de fogo

    mario.draw();
    that.updateMario();
    that.wallCollision();
    marioInGround = mario.grounded; //for use with flag sliding

    that.spawnFireballs(); // Adicionado: Chama a função de spawn de bolas de fogo
  };

  this.showInstructions = function() {
    //gameUI.writeText('Controls: Arrow keys for direction, shift to run, ctrl for bullets', 30, 30);
    //gameUI.writeText('Tip: Jumping while running makes you jump higher', 30, 60);
  };

  this.renderMap = function() {
    //setting false each time the map renders so that elements fall off a platform and not hover around
    mario.grounded = false;

    for (var i = 0; i < powerUps.length; i++) {
      powerUps[i].grounded = false;
    }
    for (var i = 0; i < goombas.length; i++) {
      goombas[i].grounded = false;
    }

    for (var row = 0; row < map.length; row++) {
      for (var column = 0; column < map[row].length; column++) {
        switch (map[row][column]) {
          case 1: //platform
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.platform();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 2: //coinBox
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.coinBox();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 3: //powerUp Box
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.powerUpBox();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 4: //uselessBox
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.uselessBox();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 5: //flagPole
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.flagPole();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            break;

          case 6: //flag
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.flag();
            element.draw();
            break;

          case 7: //pipeLeft
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeLeft();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 8: //pipeRight
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeRight();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 9: //pipeTopLeft
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeTopLeft();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 10: //pipeTopRight
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.pipeTopRight();
            element.draw();

            that.checkElementMarioCollision(element, row, column);
            that.checkElementPowerUpCollision(element);
            that.checkElementEnemyCollision(element);
            that.checkElementBulletCollision(element);
            break;

          case 20: //goomba
            var enemy = new Enemy();
            enemy.x = column * tileSize;
            enemy.y = row * tileSize;
            enemy.goomba();
            enemy.draw();

            goombas.push(enemy);
            map[row][column] = 0;
        }
      }
    }
  };

  this.collisionCheck = function(objA, objB) {
    // get the vectors to check against
    var vX = objA.x + objA.width / 2 - (objB.x + objB.width / 2);
    var vY = objA.y + objA.height / 2 - (objB.y + objB.height / 2);

    // add the half widths and half heights of the objects
    var hWidths = objA.width / 2 + objB.width / 2;
    var hHeights = objA.height / 2 + objB.height / 2;
    var collisionDirection = null;

    // if the x and y vector are less than the half width or half height, then we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
      // figures out on which side we are colliding (top, bottom, left, or right)
      var offsetX = hWidths - Math.abs(vX);
      var offsetY = hHeights - Math.abs(vY);

      if (offsetX >= offsetY) {
        if (vY > 0 && vY < 37) {
          collisionDirection = 't';
          if (objB.type != 5) {
            //if flagpole then pass through it
            objA.y += offsetY;
          }
        } else if (vY < 0) {
          collisionDirection = 'b';
          if (objB.type != 5) {
            //if flagpole then pass through it
            objA.y -= offsetY;
          }
        }
      } else {
        if (vX > 0) {
          collisionDirection = 'l';
          objA.x += offsetX;
        } else {
          collisionDirection = 'r';
          objA.x -= offsetX;
        }
      }
    }
    return collisionDirection;
  };

  this.checkElementMarioCollision = function(element, row, column) {
    var collisionDirection = that.collisionCheck(mario, element);

    if (collisionDirection == 'l' || collisionDirection == 'r') {
      mario.velX = 0;
      mario.jumping = false;

      if (element.type == 5) {
        //flag pole
        that.levelFinish(collisionDirection);
      }
    } else if (collisionDirection == 'b') {
      if (element.type != 5) {
        //only if not flag pole
        mario.grounded = true;
        mario.jumping = false;
      }
    } else if (collisionDirection == 't') {
      if (element.type != 5) {
        mario.velY *= -1;
      }

      if (element.type == 3) {
        //PowerUp Box
        var powerUp = new PowerUp();

        //gives mushroom if mario is small, otherwise gives flower
        if (mario.type == 'small') {
          powerUp.mushroom(element.x, element.y);
          powerUps.push(powerUp);
        } else {
          powerUp.flower(element.x, element.y);
          powerUps.push(powerUp);
        }

        map[row][column] = 4; //sets to useless box after powerUp appears

        //sound when mushroom appears
        gameSound.play('powerUpAppear');
      }

      if (element.type == 11) {
        //Flower Box
        var powerUp = new PowerUp();
        powerUp.flower(element.x, element.y);
        powerUps.push(powerUp);

        map[row][column] = 4; //sets to useless box after powerUp appears

        //sound when flower appears
        gameSound.play('powerUpAppear');
      }

      if (element.type == 2) {
        //Coin Box
        score.coinScore++;
        score.totalScore += 100;

        score.updateCoinScore();
        score.updateTotalScore();
        map[row][column] = 4; //sets to useless box after coin appears

        //sound when coin block is hit
        gameSound.play('coin');
      }
    }
  };

  this.checkElementPowerUpCollision = function(element) {
    for (var i = 0; i < powerUps.length; i++) {
      var collisionDirection = that.collisionCheck(powerUps[i], element);

      if (collisionDirection == 'l' || collisionDirection == 'r') {
        powerUps[i].velX *= -1; //change direction if collision with any element from the sidr
      } else if (collisionDirection == 'b') {
        powerUps[i].grounded = true;
      }
    }
  };

  this.checkElementEnemyCollision = function(element) {
    for (var i = 0; i < goombas.length; i++) {
      if (goombas[i].state != 'deadFromBullet') {
        //so that goombas fall from the map when dead from bullet
        var collisionDirection = that.collisionCheck(goombas[i], element);

        if (collisionDirection == 'l' || collisionDirection == 'r') {
          goombas[i].velX *= -1;
        } else if (collisionDirection == 'b') {
          goombas[i].grounded = true;
        }
      }
    }
  };

  this.checkElementBulletCollision = function(element) {
    for (var i = 0; i < bullets.length; i++) {
      var collisionDirection = that.collisionCheck(bullets[i], element);

      if (collisionDirection == 'b') {
        //if collision is from bottom of the bullet, it is grounded, so that it can be bounced
        bullets[i].grounded = true;
      } else if (collisionDirection == 't' || collisionDirection == 'l' || collisionDirection == 'r') {
        bullets.splice(i, 1);
      }
    }
  };

  this.checkPowerUpMarioCollision = function() {
    for (var i = 0; i < powerUps.length; i++) {
      var collWithMario = that.collisionCheck(powerUps[i], mario);
      if (collWithMario) {
        if (powerUps[i].type == 30 && mario.type == 'small') {
          //mushroom
          mario.type = 'big';
        } else if (powerUps[i].type == 31) {
          //flower
          mario.type = 'fire';
        }
        powerUps.splice(i, 1);

        score.totalScore += 1000;
        score.updateTotalScore();

        //sound when mushroom appears
        gameSound.play('powerUp');
      }
    }
  };

  this.checkEnemyMarioCollision = function() {
    for (var i = 0; i < goombas.length; i++) {
      if (!mario.invulnerable && goombas[i].state != 'dead' && goombas[i].state != 'deadFromBullet') {
        //if mario is invulnerable or goombas state is dead, collision doesnt occur
        var collWithMario = that.collisionCheck(goombas[i], mario);

        if (collWithMario == 't') {
          //kill goombas if collision is from top
          goombas[i].state = 'dead';

          mario.velY = -mario.speed;

          score.totalScore += 1000;
          score.updateTotalScore();

          //sound when enemy dies
          gameSound.play('killEnemy');
        } else if (collWithMario == 'r' || collWithMario == 'l' || collWithMario == 'b') {
          goombas[i].velX *= -1;

          if (mario.type == 'big') {
            mario.type = 'small';
            mario.invulnerable = true;
            collWithMario = undefined;

            //sound when mario powerDowns
            gameSound.play('powerDown');

            setTimeout(function() {
              mario.invulnerable = false;
            }, 1000);
          } else if (mario.type == 'fire') {
            mario.type = 'big';
            mario.invulnerable = true;

            collWithMario = undefined;

            //sound when mario powerDowns
            gameSound.play('powerDown');

            setTimeout(function() {
              mario.invulnerable = false;
            }, 1000);
          } else if (mario.type == 'small') {
            //kill mario if collision occurs when he is small
            that.pauseGame();

            mario.frame = 13;
            collWithMario = undefined;

            score.lifeCount--;
            score.coinScore = 0;
            score.totalScore = 0;
            score.updateCoinScore();
            score.updateTotalScore();
            score.updateLifeCount();

            // MODIFICADO: Pausa a música de fundo ao morrer
            gameSound.pauseBgMusic();
            gameSound.play('marioDie');

            timeOutId = setTimeout(function() {
              if (score.lifeCount == 0) {
                that.gameOver();
              } else {
                that.resetGame();
              }
            }, 3000);
            break;
          }
        }
      }
    }
  };

  this.checkBulletEnemyCollision = function() {
    for (var i = 0; i < goombas.length; i++) {
      for (var j = 0; j < bullets.length; j++) {
        if (goombas[i] && goombas[i].state != 'dead') {
          //check for collision only if goombas exist and is not dead
          var collWithBullet = that.collisionCheck(goombas[i], bullets[j]);
        }

        if (collWithBullet) {
          bullets[j] = null;
          bullets.splice(j, 1);

          goombas[i].state = 'deadFromBullet';

          score.totalScore += 1000;
          score.updateTotalScore();

          //sound when enemy dies
          gameSound.play('killEnemy');
        }
      }
    }
  };

  // Adicionado: Função para spawnar bolas de fogo
  this.spawnFireballs = function() {
    fireballSpawnCounter++;
    if (fireballSpawnCounter >= fireballSpawnRate) {
      fireballSpawnCounter = 0;

      if (Math.random() < 0.95) { // MODIFICADO: Aumentado para 0.7 (era 0.3) para maior probabilidade
        var fireball = new Fireball();
        // Spawn fireball within the current viewport
        var spawnX = translatedDist + Math.random() * viewPort;
        var spawnY = -50; // Start above the screen

        fireball.init(spawnX, spawnY);
        fireballs.push(fireball);
      }
    }

    // Remove fireballs that have gone off-screen
    for (var i = 0; i < fireballs.length; i++) {
      if (fireballs[i].y > height) {
        fireballs.splice(i, 1);
        i--;
      }
    }
  };

  // Adicionado: Função para verificar colisão entre Mario e bolas de fogo
  this.checkFireballMarioCollision = function() {
    for (var i = 0; i < fireballs.length; i++) {
      var collWithMario = that.collisionCheck(fireballs[i], mario);
      if (collWithMario) {
        // Mario é atingido por uma bola de fogo, faz ele perder
        that.pauseGame();

        mario.frame = 13; // Sprite de morte do Mario
        collWithMario = undefined;

        score.lifeCount--;
        score.coinScore = 0;
        score.totalScore = 0;
        score.updateCoinScore();
        score.updateTotalScore();
        score.updateLifeCount();

        gameSound.pauseBgMusic(); // Pausa a música de fundo
        gameSound.play('marioDie'); // Toca o som de morte do Mario

        timeOutId = setTimeout(function() {
          if (score.lifeCount == 0) {
            that.gameOver();
          } else {
            that.resetGame();
          }
        }, 3000);
        fireballs.splice(i, 1); // Remove a bola de fogo após a colisão
        i--;
      }
    }
  };

  this.wallCollision = function() {
    //for walls (vieport walls)
    if (mario.x >= maxWidth - mario.width) {
      mario.x = maxWidth - mario.width;
    } else if (mario.x <= translatedDist) {
      mario.x = translatedDist + 1;
    }

    //for ground (viewport ground)
    if (mario.y >= height) {
      that.pauseGame();

      // MODIFICADO: Pausa a música de fundo ao morrer
      gameSound.pauseBgMusic();
      gameSound.play('marioDie');

      score.lifeCount--;
      score.coinScore = 0;
      score.totalScore = 0;
      score.updateCoinScore();
      score.updateTotalScore();
      score.updateLifeCount();

      timeOutId = setTimeout(function() {
        if (score.lifeCount == 0) {
          that.gameOver();
        } else {
          that.resetGame();
        }
      }, 3000);
    }
  };

  //controlling mario with key events
  this.updateMario = function() {
    var friction = 0.9;
    var gravity = 0.4;

    mario.checkMarioType();

    if (keys[38] || keys[32]) {
      //up arrow
      if (!mario.jumping && mario.grounded) {
        mario.jumping = true;
        mario.grounded = false;
        mario.velY = -(mario.speed / 2 + 9.5);

        // mario sprite position
        if (mario.frame == 0 || mario.frame == 1) {
          mario.frame = 3; //right jump
        } else if (mario.frame == 8 || mario.frame == 9) {
          mario.frame = 2; //left jump
        }

        //sound when mario jumps
        gameSound.play('jump');
      }
    }

    if (keys[39]) {
      //right arrow
      that.checkMarioPos(); //if mario goes to the center of the screen, sidescroll the map

      if (mario.velX < mario.speed) {
        mario.velX++;
      }

      //mario sprite position
      if (!mario.jumping) {
        tickCounter += 1;

        if (tickCounter > maxTick / mario.speed) {
          tickCounter = 0;

          if (mario.frame != 1) {
            mario.frame = 1;
          } else {
            mario.frame = 0;
          }
        }
      }
    }

    if (keys[37]) {
      //left arrow
      if (mario.velX > -mario.speed) {
        mario.velX--;
      }

      //mario sprite position
      if (!mario.jumping) {
        tickCounter += 1;

        if (tickCounter > maxTick / mario.speed) {
          tickCounter = 0;

          if (mario.frame != 9) {
            mario.frame = 9;
          } else {
            mario.frame = 8;
          }
        }
      }
    }

    if (keys[16]) {
      //shift key
      mario.speed = 4.5;
    } else {
      mario.speed = 3;
    }
    mario.speed = 4.5;
    if (keys[17] && mario.type == 'fire') {
      //ctrl key
      if (!bulletFlag) {
        bulletFlag = true;
        var bullet = new Bullet();
        if (mario.frame == 9 || mario.frame == 8 || mario.frame == 2) {
          var direction = -1;
        } else {
          var direction = 1;
        }
        bullet.init(mario.x, mario.y, direction);
        bullets.push(bullet);

        //bullet sound
        gameSound.play('bullet');

        setTimeout(function() {
          bulletFlag = false; //only lets mario fire bullet after 500ms
        }, 500);
      }
    }

    //velocity 0 sprite position
    if (mario.velX > 0 && mario.velX < 1 && !mario.jumping) {
      mario.frame = 0;
    } else if (mario.velX > -1 && mario.velX < 0 && !mario.jumping) {
      mario.frame = 8;
    }

    if (mario.grounded) {
      mario.velY = 0;

      //grounded sprite position
      if (mario.frame == 3) {
        mario.frame = 0; //looking right
      } else if (mario.frame == 2) {
        mario.frame = 8; //looking left
      }
    }

    //change mario position
    mario.velX *= friction;
    mario.velY += gravity;

    mario.x += mario.velX;
    mario.y += mario.velY;
  };

  this.checkMarioPos = function() {
    centerPos = translatedDist + viewPort / 2;

    //side scrolling as mario reaches center of the viewPort
    if (mario.x > centerPos && centerPos + viewPort / 2 < maxWidth) {
      gameUI.scrollWindow(-mario.speed, 0);
      translatedDist += mario.speed;
    }
  };

  this.levelFinish = function(collisionDirection) {
    //game finishes when mario slides the flagPole and collides with the ground
    if (collisionDirection == 'r') {
      mario.x += 10;
      mario.velY = 2;
      mario.frame = 11;
    } else if (collisionDirection == 'l') {
      mario.x -= 32;
      mario.velY = 2;
      mario.frame = 10;
    }

    if (marioInGround) {
      mario.x += 20;
      mario.frame = 10;
      tickCounter += 1;
      if (tickCounter > maxTick) {
        that.pauseGame();

        mario.x += 10;
        tickCounter = 0;
        mario.frame = 12;

        // MODIFICADO: Para a música de fundo imediatamente ao vencer
        gameSound.stopBgMusic();
        gameSound.play('stageClear');

        timeOutId = setTimeout(function() {
          currentLevel++;
          if (originalMaps[currentLevel]) {
            that.init(originalMaps, currentLevel);
            score.updateLevelNum(currentLevel);
          } else {
            // MODIFICADO: Inicia a transição de fade out
            that.startFadeOutTransition();
          }
        }, 2000); // Reduzido o tempo de espera para a transição
      }
    }
  };

  /**
   * NOVO: Inicia uma animação de fade to black na tela.
   */
   this.startFadeOutTransition = function() {
    var alpha = 0;
    var transitionId;
    var ctx = gameUI.getCanvas().getContext('2d');
    
    // NOVO: Flag para garantir que o timer do tempo extra seja criado apenas uma vez
    var extraTimeTimerStarted = false;

    function fadeLoop() {
      // Trava o alpha em 1 quando ele ultrapassa, para não clarear a tela de novo
      if (alpha < 1) {
        // ALTERE AQUI (Velocidade do Fade): Um valor menor (ex: 0.005) torna a transição mais lenta.
        alpha += 0.01;
      } else {
        alpha = 1;
      }

      // Desenha o retângulo de fade sobre a tela
      ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
      ctx.fillRect(translatedDist, 0, viewPort, height);

      // --- Lógica dos Fogos de Artifício ---
      if (Math.random() < 0.05) {
        var fireworkX = translatedDist + (Math.random() * viewPort * 0.8) + (viewPort * 0.1);
        var fireworkY = Math.random() * height / 1.5;
        var hue = Math.random() * 360;
        for (var i = 0; i < 70; i++) {
          particles.push(new Particle(fireworkX, fireworkY, hue));
        }
      }

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.isDead()) {
          particles.splice(i, 1);
        }
      }
      // --- Fim da Lógica dos Fogos ---


      // Quando a tela fica preta, iniciamos um timer para o tempo extra dos fogos
      if (alpha >= 1 && !extraTimeTimerStarted) {
        extraTimeTimerStarted = true; // Ativa a flag para não criar outros timers

        setTimeout(function() {
          // Depois que o tempo extra acabar, o loop é finalmente cancelado
          window.cancelAnimationFrame(transitionId);
          particles = []; // Limpa as partículas restantes
          that.showPeachAndMessage();
        }, 5000); // <-- ALTERE AQUI (Tempo Extra): Este valor (em ms) é o tempo que os fogos continuarão em tela preta. Aumente para mais tempo.
      }
      
      // O loop continua até que o setTimeout o cancele
      // Isso garante que os fogos continuem mesmo com a tela já preta
      if (!extraTimeTimerStarted || alpha < 1) {
        transitionId = window.requestAnimationFrame(fadeLoop);
      } else if (extraTimeTimerStarted) {
         // Continua o loop de desenho dos fogos durante o tempo extra
         transitionId = window.requestAnimationFrame(fadeLoop);
      }
    }

    fadeLoop();
  };


  /**
   * MODIFICADO: Apenas desenha a cena final estática em uma tela preta.
   */
this.showPeachAndMessage = function() {
    if (score) score.hideScore();
    gameSound.playFinalSceneMusic();

    var messageStage = 0,
        textAlpha = 0,
        state = 'FADING_IN',
        animationFrameId,
        evolutionMusicHasPlayed = false,
        pauseUntil = 0;

    var messages = [
        // Mensagem 1: "Olá Família!" - Com um toque clássico do Mario
        {
            text: "Olá Família!",
            style: "45px 'SuperMario256', sans-serif", // Fonte do Mario
            color: "#FFD700", // Amarelo clássico das moedas do Mario (Gold)
            shadowColor: "rgba(0, 0, 0, 0.7)", // Sombra escura para contraste
            shadowBlur: 8
        },
        // Mensagem 2: "Estão preparados?!" - Mais vibrante
        {
            text: "Estão preparados?!",
            style: "50px 'SuperMario256', sans-serif", // Fonte do Mario, um pouco maior
            color: "#FFFFFF", // Branco puro, como as nuvens
            shadowColor: "rgba(0, 0, 0, 0.8)", // Sombra mais forte
            shadowBlur: 10
        },
        // Mensagem 3: "Meu nome é ..." - Suspense e estilo
        {
            text: "Meu nome é ...",
            style: "55px 'SuperMario256', sans-serif", // Fonte do Mario, ainda maior
            color: "#00BFFF", // Azul céu (DeepSkyBlue), para o toque de mistério do bebê
            shadowColor: "rgba(0, 0, 0, 0.9)", // Sombra bem definida
            shadowBlur: 12
        },
        // Mensagem 4: "GIOVANA" - A revelação final, com cores do universo Mario
        {
            text: "GIOVANA",
            style: "bold 90px 'SuperMario256', sans-serif", // Bem grande e negrito!
            color: "#FF69B4", // Rosa choque (HotPink) - cor da Peach!
            shadowColor: "#8B0000", // Vermelho escuro (DarkRed) - cor do Mario para contraste e "poder"
            shadowBlur: 25 // Grande desfoque para um efeito de brilho intenso
        }
    ];

    var olaImage = new Image();
    olaImage.src = 'images/ola.png';
    var ctx = gameUI.getCanvas().getContext('2d');

    peach = new Peach();
    peach.init();
    var finalPeachX = centerPos - 250;
    peach.x = viewPort + 100;
    peach.y = height - 40 - peach.height;

    for(var i = 0; i < 150; i++) { stars.push(new Star()); }

    function messageLoop(currentTime) {
      gameUI.makeBox(0, 0, maxWidth, height);
      stars.forEach(s => { s.update(); s.draw(ctx); });
      if (peach.x > finalPeachX) { peach.x -= 4; }
      peach.draw();

      switch (state) {
        case 'FADING_IN':
          textAlpha += 0.02;
          if (textAlpha >= 1) {
            textAlpha = 1;
            state = 'PAUSED';
            var pauseDuration = (messageStage >= messages.length - 1) ? 40000 : 4500;
            pauseUntil = currentTime + pauseDuration;
          }
          break;

        case 'PAUSED':
          if (currentTime >= pauseUntil) {
            if (messageStage >= messages.length - 1) {
              gameSound.playCelebrationMusic();
              that.startCreditSequence();
              return;
            } else {
              state = 'FADING_OUT';
            }
          }
          break;

        case 'FADING_OUT':
          textAlpha -= 0.03;
          if (textAlpha <= 0) {
            textAlpha = 0;
            messageStage++;
            state = 'FADING_IN';
          }
          break;
      }

      if (messageStage < messages.length) {
        var msg = messages[messageStage];
        ctx.globalAlpha = textAlpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = "middle";

        ctx.shadowColor = msg.shadowColor;
        ctx.shadowBlur = msg.shadowBlur;

        ctx.fillStyle = msg.color;
        ctx.font = msg.style;
        ctx.fillText(msg.text, centerPos, height / 3);

        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        if (messageStage === 3 && olaImage.complete) {
            var scale = textAlpha;
            var newWidth = 150 * scale;
            var newHeight = (olaImage.height / olaImage.width) * 150 * scale;
            var imageX = centerPos - newWidth / 2;
            var imageY = height / 3 + 60 - newHeight / 2;
            ctx.drawImage(olaImage, imageX, imageY, newWidth, newHeight);
        }
        ctx.globalAlpha = 1;
      }

      if (messageStage === messages.length - 1 && textAlpha === 1 && !evolutionMusicHasPlayed) {
          gameSound.playEvolutionComplete();
          evolutionMusicHasPlayed = true;
      }

      animationFrameId = window.requestAnimationFrame(messageLoop);
    }
    messageLoop();
};

this.startCreditSequence = function() {
    // --- CONFIGURAÇÃO ---
    var creditsData = [
      { image: 'photos/auau.jpg',    caption: 'Plin',                 scale: 1.1,  panX: 0,   panY: 10 },
      // Adicione mais créditos aqui, se houver mais membros na equipe
      // Exemplo: { image: 'caminho/para/sua_foto.jpg', caption: 'Seu Nome', scale: 1.0, panX: 0, panY: 0 },
    ];
    var imageDisplayTime = 40000;
    var fadeDuration = 1500;
    // --- FIM DA CONFIGURAÇÃO ---

    var currentCreditIndex = 0;
    var alpha = 0;
    var state = 'LOADING';
    var img = new Image();
    var ctx = gameUI.getCanvas().getContext('2d');
    var animationFrameId;
    var pauseUntil = 0;

    // Função auxiliar que desenha todo o conteúdo de um slide de crédito
    function drawCredit(credit, alphaValue) {
      if (!img.complete || !credit) return;

      ctx.globalAlpha = alphaValue;

      // --- LÓGICA DE POSICIONAMENTO E ESTILO ATUALIZADA ---

      // 1. Define as propriedades dos textos
      var titleText = "Equipe de Desenvolvimento"; // Removido os dois pontos para um visual mais limpo
      var captionText = credit.caption;
      var titleHeight = 35;
      var captionHeight = 28; // Aumentado ligeiramente para o Plin/Nomes se destacarem
      var padding = 20;

      // 2. Lógica do Efeito Ken Burns (Zoom e Pan)
      var currentScale = 1 + ((credit.scale - 1) * alphaValue);
      var panX = (credit.panX || 0) * alphaValue;
      var panY = (credit.panY || 0) * alphaValue;

      // 3. Calcula as dimensões da imagem para caber na tela
      var maxWidth = viewPort * 0.8;
      var maxHeight = height * 0.6; // Deixa espaço para os textos
      var ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      var imgBaseWidth = img.width * ratio;
      var imgBaseHeight = img.height * ratio;
      var imgDrawWidth = imgBaseWidth * currentScale;
      var imgDrawHeight = imgBaseHeight * currentScale;

      // 4. Calcula a altura total do bloco (Título + Imagem + Legenda)
      var totalContentHeight = titleHeight + padding + imgDrawHeight + padding + captionHeight;
      var startY = (height - totalContentHeight) / 2;

      // 5. Calcula a posição de cada elemento
      var slideOffset = 30 * (1 - alphaValue); // Efeito de deslizar para cima

      var titleX = centerPos;
      var titleY = startY + slideOffset;

      var imageX = centerPos - imgDrawWidth / 2 + panX;
      var imageY = titleY + titleHeight + padding;

      var captionX = centerPos;
      var captionY = imageY + imgDrawHeight + padding + slideOffset;

      // 6. Desenha o Título
      // Melhoria para a fonte da "Equipe de Desenvolvimento"
      ctx.font = "bold " + titleHeight + "px 'SuperMario256', sans-serif"; // Usando SuperMario256
      ctx.fillStyle = "#FFD700"; // Cor dourada para destacar (Gold)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(titleText, titleX, titleY);

      // 7. Desenha a Imagem
      ctx.drawImage(img, imageX, imageY, imgDrawWidth, imgDrawHeight);

      // 8. Desenha a Legenda (para o nome "Plin" e outros nomes da equipe)
      // Melhoria para a fonte do "Plin" e nomes dos desenvolvedores
      ctx.font = captionHeight + "px 'SuperMario256', sans-serif"; // Usando SuperMario256, tamanho maior
      ctx.fillStyle = "#FFFFFF"; // Branco puro
      ctx.fillText(captionText, captionX, captionY);

      ctx.globalAlpha = 1; // Restaura o alpha
    }

    function creditLoop(currentTime) {
      gameUI.makeBox(0, 0, maxWidth, height);
      stars.forEach(s => { s.update(); s.draw(ctx); });

      switch (state) {
        case 'LOADING':
          break;
        case 'FADING_IN':
          alpha += (1000 / 60) / fadeDuration;
          if (alpha >= 1) {
            alpha = 1;
            state = 'PAUSED';
            pauseUntil = currentTime + imageDisplayTime;
          }
          break;
        case 'PAUSED':
          if (currentTime >= pauseUntil) {
            state = 'FADING_OUT';
          }
          break;
        case 'FADING_OUT':
          alpha -= (1000 / 60) / fadeDuration;
          if (alpha <= 0) {
            alpha = 0;
            currentCreditIndex++;
            loadNextImage();
          }
          break;
      }

      if (state !== 'LOADING' && state !== 'FINISHED') {
        drawCredit(creditsData[currentCreditIndex], alpha);
      }

      if (state !== 'FINISHED') {
        animationFrameId = window.requestAnimationFrame(creditLoop);
      }
    }

    function loadNextImage() {
      if (currentCreditIndex >= creditsData.length) {
        state = 'FINISHED';
        window.cancelAnimationFrame(animationFrameId); // Para o loop de animação dos créditos
        that.playEndingVideo(); // Chama a nova função de vídeo
        return;
      }
      state = 'LOADING';
      img.src = creditsData[currentCreditIndex].image;
      img.onload = () => { state = 'FADING_IN'; };
      img.onerror = () => {
          console.error("Não foi possível carregar a imagem: " + img.src);
          currentCreditIndex++;
          loadNextImage();
      }
    }

    loadNextImage();
    creditLoop();
};
  // Cole esta função dentro do objeto MarioGame(), por exemplo, após startCreditSequence
// Substitua a função antiga por esta em MarioGame.js
this.playEndingVideo = function() {
    // Cria o elemento de vídeo
    var video = document.createElement('video');
    video.src = 'us.mp4';
    video.autoplay = true;
    video.playsInline = true;
    video.loop = true; // <-- MUDANÇA 1: Adicionado para repetir o vídeo

    // Estiliza o vídeo para preencher a tela inteira
    video.style.position = 'fixed';
    video.style.top = '20%';
    video.style.left = '15%'; // MODIFICADO: Centraliza o vídeo (100% - 70%)/2 = 15%
    video.style.width = '70%';
    video.style.height = '60%'; // MODIFICADO: Altera para 100% da altura para cobrir a tela verticalmente
    video.style.objectFit = 'contain';
    video.style.zIndex = '1000';
    video.style.backgroundColor = 'black'; // Fundo preto para preencher o espaço extra (letterboxing)

    // Adiciona o vídeo à página
    document.body.appendChild(video);

    // --- NOVO CÓDIGO PARA A MENSAGEM ---
    var message = document.createElement('div');
    message.textContent = 'Obrigada por me receberem tão bem!';
    message.style.position = 'fixed';
    message.style.top = '10%'; // Posição um pouco acima do vídeo
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)'; // Centraliza horizontalmente
    message.style.fontFamily = 'SuperMario256'; // Usa sua fonte personalizada
    message.style.fontSize = '3em'; // Tamanho da fonte, ajuste conforme necessário
    message.style.color = 'white'; // Cor da fonte
    message.style.zIndex = '1001'; // Z-index maior que o vídeo para aparecer por cima
    message.style.textAlign = 'center';
    message.style.width = '80%'; // Define uma largura para o texto, se necessário
    message.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)'; // Sombra para melhor legibilidade
    document.body.appendChild(message);
    // --- FIM DO NOVO CÓDIGO ---

    // Opcional: Tratamento de erro caso o autoplay seja bloqueado pelo navegador
    var playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.error("O autoplay foi impedido pelo navegador:", error);
            // Se o autoplay for bloqueado, adicione o botão de play e remova a mensagem também
            document.body.removeChild(message); // Remove a mensagem se o autoplay falhar
            var playButton = document.createElement('button');
            playButton.textContent = 'Clique para assistir ao vídeo final';
            playButton.style.position = 'fixed';
            playButton.style.top = '50%';
            playButton.style.left = '50%';
            playButton.style.transform = 'translate(-50%, -50%)';
            playButton.style.zIndex = '1001';
            playButton.style.padding = '20px';
            playButton.style.fontSize = '24px';
            playButton.style.cursor = 'pointer';
            document.body.appendChild(playButton);
            playButton.onclick = function() {
                video.play();
                document.body.removeChild(playButton);
                document.body.appendChild(message); // Re-adiciona a mensagem quando o play for clicado
            };
        });
    }
};

this.pauseGame = function() {
    window.cancelAnimationFrame(animationID);
};

this.gameOver = function() {
    // Para a música de fundo
    gameSound.stopBgMusic();

    score.gameOverView();
    gameUI.makeBox(0, 0, maxWidth, height);
    gameUI.writeText('Game Over', centerPos - 80, height - 300);
    gameUI.writeText('Thanks For Playing', centerPos - 122, height / 2);
};

  this.pauseGame = function() {
    window.cancelAnimationFrame(animationID);
  };

  this.gameOver = function() {
    // Para a música de fundo
    gameSound.stopBgMusic();

    score.gameOverView();
    gameUI.makeBox(0, 0, maxWidth, height);
    gameUI.writeText('Game Over', centerPos - 80, height - 300);
    gameUI.writeText('Thanks For Playing', centerPos - 122, height / 2);
  };

  this.resetGame = function() {
    that.clearInstances();
    that.init(originalMaps, currentLevel);
  };

  this.clearInstances = function() {
    mario = null;
    element = null;
    // A instância de som não é limpa para manter a música tocando entre os níveis
    // gameSound = null;

    goombas = [];
    particles = []; // ADICIONE ESTA LINHA
    stars = []; // ADICIONE ESTA LINHA
    bullets = [];
    powerUps = [];
    fireballs = []; // Adicionado: Limpa as bolas de fogo ao resetar
  };

  this.clearTimeOut = function() {
    clearTimeout(timeOutId);
  };

  this.removeGameScreen = function() {
    gameUI.hide();

    if (score) {
      score.hideScore();
    }
  };

  this.showGameScreen = function() {
    gameUI.show();
  };
}