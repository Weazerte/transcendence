import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { t } from '../utils/i18n.js';
// ----------------- Player Class -----------------

export class Player {
  constructor(x, y, z, height, speed, color) {
    this.restX = x;
    this.x = x;
    this.restY = y;
    this.y = y;
    this.z = z;
    this.size = 0.5;
    this.height = height;
    this.hitbox = 1.4;
    this.speed = speed * 60; // Scale speed for fixed timestep
    this.dy = 0;
    this.color = color;
    this.scoreCount = 0;
    this.texture = 0;
  }
  sceneADD(scene) {
    const geometry = new THREE.BoxGeometry(this.size, this.height, this.size);
    const material = new THREE.MeshPhongMaterial({ color: this.color });
    const cube = new THREE.Mesh(geometry, material);
    this.pCube = cube;
    cube.position.x = this.x;
    cube.position.y = this.y;
    cube.position.z = this.z;

    scene.add(cube);
  }

  getx() {
    return this.x;
  }

  gety() {
    return this.y;
  }

  getz() {
    return this.z;
  }

  getwidth() {
    return this.size;
  }

  getheight() {
    return this.height;
  }

  getHitBox() {
    return this.hitbox;
  }

  moveUp() {
    if (this.y + this.size < 9) this.dy = this.speed;
  }
  moveDown() {
    if (this.y > -9) this.dy = -this.speed;
  }

  incrementScore() {
    this.scoreCount += 1;
  }

  getScore() {
    return this.scoreCount;
  }

  resetPlayer() {
    this.x = this.restX;
    this.y = this.restY;
    this.dy = 0;
  }
}

// ----------------- Ball Class -----------------

export class ball {
  constructor(x, y, z, width, height, speed, radius, color, gameManager) {
    this.x = x;
    this.resetX = x;
    this.y = y;
    this.resetY = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.speed = speed * 60; // Scale speed for fixed timestep
    this.resetSpeed = speed * 60; // Scale reset speed as well
    this.radius = radius;
    this.color = color;
    this.direction_x = -1;
    this.direction_y = 1;
    this.gameManager = gameManager; // Store reference to gameManager
  }

  sceneADD(scene) {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: this.color });
    const sphere = new THREE.Mesh(geometry, material);
    this.bSphere = sphere;
    sphere.position.x = this.x;
    sphere.position.y = this.y;
    sphere.position.z = this.z;
    scene.add(sphere);
  }

  isBallinPlayer(playerx, playery, playerWidth, playerHeight) {
    const ballLeft = this.x - this.radius;
    const ballRight = this.x + this.radius;
    const ballTop = this.y - this.radius;
    const ballBottom = this.y + this.radius;

    const playerLeft = playerx - playerWidth / 2;
    const playerRight = playerx + playerWidth / 2;
    const playerTop = playery - playerHeight / 2;
    const playerBottom = playery + playerHeight / 2;

    return (
      ballRight >= playerLeft &&
      ballLeft <= playerRight &&
      ballBottom >= playerTop &&
      ballTop <= playerBottom
    );
  }

  isBallinYWall() {
    if (this.y + this.radius >= 9 || this.y - this.radius <= -9) {
      return true;
    }
    return false;
  }

  isBallinXWall() {
    if (this.x + this.radius >= 15 || this.x - this.radius <= -15) {
      return true;
    }
    return false;
  }

  // Move the ball
  moveBall(player_left, player_right, deltaTime) {
    // Lorsque la balle touche le paddle, ajuster sa position légèrement au-delà du paddle
    if (
      this.isBallinPlayer(
        player_left.getx(),
        player_left.gety(),
        player_left.getwidth(),
        player_left.getheight()
      )
    ) {
      // Si la balle touche le paddle gauche
      if (this.direction_x < 0) {
        // Only calculate new direction if this player is authoritative
        this.direction_x = 1; // Inverser la direction horizontale
        this.x = player_left.getx() + player_left.getwidth() / 2 + this.radius; // Déplacer légèrement la balle après la collision
        // En fonction de la position verticale du paddle et de la balle, ajuster la direction verticale
        const paddleCenter = player_left.gety();
        const ballRelativePosition = this.y - paddleCenter; // Calculer la distance entre la balle et le centre du paddle
        this.direction_y = ballRelativePosition / player_left.getheight(); // Utiliser cette distance pour ajuster la direction verticale

        // Normalize the direction vector to maintain consistent speed
        const magnitude = Math.sqrt(
          this.direction_x * this.direction_x + this.direction_y * this.direction_y
        );
        this.direction_x /= magnitude;
        this.direction_y /= magnitude;

        // Send hit event since this player is authoritative
        if (this.gameManager.localPlayer === 'left') {
          this.gameManager.sendHitBall(
            { x: this.x, y: this.y },
            { x: this.direction_x, y: this.direction_y },
            { x: player_left.getx(), y: player_left.gety() }
          );
        }
      }
    } else if (
      this.isBallinPlayer(
        player_right.getx(),
        player_right.gety(),
        player_right.getwidth(),
        player_right.getheight()
      )
    ) {
      // Si la balle touche le paddle droit
      if (this.direction_x > 0) {
        // Only calculate new direction if this player is authoritative
        this.direction_x = -1; // Inverser la direction horizontale
        this.x = player_right.getx() - this.radius - player_right.getwidth() / 2; // Déplacer légèrement la balle après la collision
        // Ajuster la direction verticale de la même manière
        const paddleCenter = player_right.gety();
        const ballRelativePosition = this.y - paddleCenter;
        this.direction_y = ballRelativePosition / player_right.getheight();

        // Normalize the direction vector to maintain consistent speed
        const magnitude = Math.sqrt(
          this.direction_x * this.direction_x + this.direction_y * this.direction_y
        );
        this.direction_x /= magnitude;
        this.direction_y /= magnitude;

        // Send hit event since this player is authoritative
        if (this.gameManager.localPlayer === 'right') {
          this.gameManager.sendHitBall(
            { x: this.x, y: this.y },
            { x: this.direction_x, y: this.direction_y },
            { x: player_right.getx(), y: player_right.gety() }
          );
        }
      }
    } else if (this.isBallinYWall()) {
      this.direction_y *= -1;
    }
    this.x += this.speed * this.direction_x * deltaTime; // Use delta time for movement
    this.y += this.speed * this.direction_y * deltaTime; // Use delta time for movement
  }

  resetBall(xdir) {
    this.x = this.resetX;
    this.y = this.resetY;
    this.speed = this.resetSpeed;
    this.direction_x = xdir;
    this.direction_y = 1;
  }
}

// ----------------- Ball and Player related functions -----------------

export function updatePos(game, fixedTimeStep) {
  if (!game) return;

  // Update player positions using fixed timestep
  game.playerRight.y += game.playerRight.dy * fixedTimeStep;
  game.playerLeft.y += game.playerLeft.dy * fixedTimeStep;

  // Check boundaries for player right
  if (game.playerRight.y + game.playerRight.getheight() / 2 > 9) {
    game.playerRight.y = 9 - game.playerRight.getheight() / 2;
  } else if (game.playerRight.y - game.playerRight.getheight() / 2 < -9) {
    game.playerRight.y = -9 + game.playerRight.getheight() / 2;
  }

  // Check boundaries for player left
  if (game.playerLeft.y + game.playerLeft.getheight() / 2 > 9) {
    game.playerLeft.y = 9 - game.playerLeft.getheight() / 2;
  } else if (game.playerLeft.y - game.playerLeft.getheight() / 2 < -9) {
    game.playerLeft.y = -9 + game.playerLeft.getheight() / 2;
  }

  // Update positions of visual elements
  game.playerRight.pCube.position.y = game.playerRight.y;
  game.playerLeft.pCube.position.y = game.playerLeft.y;

  game.ball.bSphere.position.x = game.ball.x;
  game.ball.bSphere.position.y = game.ball.y;
}

function declareWinner(game, winnerSide) {
  // Only the host (left player) should send the winner
  if (game.gameManager.localPlayer === 'left') {
    game.gameManager.sendGameEvent('winner', {
      game_id: game.gameManager.gameId,
      winner: winnerSide,
      scores: {
        left: game.playerLeft.getScore(),
        right: game.playerRight.getScore(),
      },
    });
  }
}

export function checkXCollision(game, winScore) {
  if (game.ball.isBallinXWall()) {
    if (game.ball.x < 0) {
      game.playerRight.incrementScore();
      if (game.playerRight.getScore() < winScore) {
        game.ball.resetBall(-1);
        game.playerRight.resetPlayer();
        game.playerLeft.resetPlayer();
        if (game.updateScore3D) game.updateScore3D();
      } else {
        declareWinner(game, 'right');
        return false; // Game over
      }
    } else {
      game.playerLeft.incrementScore();
      if (game.playerLeft.getScore() < winScore) {
        game.ball.resetBall(1);
        game.playerRight.resetPlayer();
        game.playerLeft.resetPlayer();
        if (game.updateScore3D) game.updateScore3D();
      } else {
        declareWinner(game, 'left');
        return false; // Game over
      }
    }
  }
  return true; // Game continues
}

// ----------------- ath function -----------------

export class Game {
  constructor(
    ballSpeed,
    paddleSize,
    paddleSpeed,
    ballSize,
    winScore,
    gameManager,
    leftPlayerNickname,
    rightPlayerNickname
  ) {
    this.gameManager = gameManager;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleHitBall = this.handleHitBall.bind(this);
    this.isGameRunning = true;
    this.winScore = winScore;
    this.lastUpdateTime = performance.now();
    this.accumulatedTime = 0;
    this.fixedTimeStep = 1 / 60; // 60 FPS physics update rate
    this.leftPlayerNickname = leftPlayerNickname;
    this.rightPlayerNickname = rightPlayerNickname;

    // Initialisation
    this.setup3D(ballSpeed, paddleSize, paddleSpeed, ballSize);
    this.addEventListeners();
    this.setupWebSocketListeners();
  }

  setupWebSocketListeners() {
    document.addEventListener('game-update', event => {
      const data = event.detail;
      if (data.type === 'hit_ball') {
        this.handleHitBall(data);
      }
    });
  }

  handleHitBall(data) {
    const { hit_position, direction, paddle_position, player } = data;

    // Update ball position and direction
    this.ball.x = hit_position.x;
    this.ball.y = hit_position.y;
    this.ball.direction_x = direction.x;
    this.ball.direction_y = direction.y;

    // Update paddle position
    if (paddle_position) {
      if (player === 'right') {
        this.playerRight.y = paddle_position.y;
        this.playerRight.pCube.position.y = paddle_position.y;
      } else if (player === 'left') {
        this.playerLeft.y = paddle_position.y;
        this.playerLeft.pCube.position.y = paddle_position.y;
      }
    }

    // Update visual representation
    this.ball.bSphere.position.x = this.ball.x;
    this.ball.bSphere.position.y = this.ball.y;
  }

  // ----------------- 3D setup -----------------

  setup3D(ballSpeed, paddleSize, paddleSpeed, ballSize) {
    this.canvas = document.getElementById('pongCanvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(100, this.canvas.width / this.canvas.height, 5, 100);
    this.camera.position.z = 8;
    this.camera.position.y = 0;
    // Check if all elements exist

    const geometry = new THREE.BoxGeometry(50, 25, 0);

    // Charger la texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/static/Windows.jpg');

    // Appliquer la texture au matériau
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.z = -2;
    this.scene.add(cube);
    // Initialize game objects
    this.playerLeft = new Player(-10, 0, 0, paddleSize, paddleSpeed, 'green');
    this.playerLeft.sceneADD(this.scene);

    this.playerRight = new Player(10, 0, 0, paddleSize, paddleSpeed, 'blue');
    this.playerRight.sceneADD(this.scene);

    console.log('ball speed : ', ballSpeed);
    console.log('ball size : ', ballSize);
    this.ball = new ball(0, 0, 0, 1, 1, ballSpeed, ballSize || 0.5, 'red', this.gameManager);
    this.ball.sceneADD(this.scene);

    this.createScoreDisplay();
    // Lumière ambiante (plus faible, pour adoucir les ombres)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Lumière directionnelle (simule une lumière venant du dessus)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 10); // Position au-dessus et sur le côté
    directionalLight.castShadow = true; // Active les ombres
    this.scene.add(directionalLight);

    // Lumière ponctuelle (simule une source lumineuse comme une lampe)
    const pointLight = new THREE.PointLight(0xffaa33, 1.5, 20);
    pointLight.position.set(0, 5, 5);
    this.scene.add(pointLight);

    // Optionnel : une lumière spot pour un effet dramatique
    const spotLight = new THREE.SpotLight(0xff0000, 1);
    spotLight.position.set(-5, 10, 5);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    this.scene.add(spotLight);

    // Lumière dédiée au background (douce et large)
    const backgroundLight = new THREE.DirectionalLight(0xffffff, 5);
    backgroundLight.position.set(0, 5, -5); // Positionnée derrière la scène
    backgroundLight.target = cube; // Dirige la lumière vers le cube (background)
    this.scene.add(backgroundLight);

    return true;
  }

  createScoreDisplay() {
    const createTextSprite = (text, color) => {
      const measureCanvas = document.createElement('canvas');
      const measureContext = measureCanvas.getContext('2d');

      const fontSize = 70;
      const fontFamily = 'Arial';
      measureContext.font = `${fontSize}px ${fontFamily}`;

      const metrics = measureContext.measureText(text);

      const textWidth = metrics.width;
      const textHeight = fontSize * 1.2;

      const padding = fontSize * 0.5;
      const canvasWidth = textWidth + padding * 2;
      const canvasHeight = textHeight + padding * 2;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = Math.ceil(canvasWidth);
      canvas.height = Math.ceil(canvasHeight);

      context.fillStyle = 'rgba(0,0,0,0)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.font = `${fontSize}px ${fontFamily}`;
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;

      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);

      const aspectRatio = canvas.width / canvas.height;
      sprite.scale.set(1.5 * aspectRatio, 1.5, 1);

      return sprite;
    };

    this.leftScoreSprite = createTextSprite('0', 'green');
    this.rightScoreSprite = createTextSprite('0', 'blue');

    this.leftNickSprite = createTextSprite(
      this.leftPlayerNickname || t('game.player.left'),
      'green'
    );
    this.rightNickSprite = createTextSprite(
      this.rightPlayerNickname || t('game.player.right'),
      'blue'
    );

    this.leftScoreSprite.position.set(-2, 7, 0);
    this.rightScoreSprite.position.set(2, 7, 0);
    this.leftNickSprite.position.set(-7, 7, 0);
    this.rightNickSprite.position.set(7, 7, 0);

    this.scene.add(this.leftScoreSprite);
    this.scene.add(this.rightScoreSprite);
    this.scene.add(this.leftNickSprite);
    this.scene.add(this.rightNickSprite);
  }

  updateScore3D() {
    if (this.leftScoreSprite && this.rightScoreSprite) {
      const updateSprite = (sprite, score, color) => {
        const canvas = sprite.material.map.image;
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'rgba(0,0,0,0)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const fontSize = 70;
        context.font = `${fontSize}px Arial`;
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(score.toString(), canvas.width / 2, canvas.height / 2);

        sprite.material.map.needsUpdate = true;
      };

      updateSprite(this.leftScoreSprite, this.playerLeft.getScore(), 'green');
      updateSprite(this.rightScoreSprite, this.playerRight.getScore(), 'blue');
    }
  }

  handleKeyDown(e) {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      // C'est une commande du joueur local
      this.gameManager.sendPlayerMove('up');

      // Mettre à jour localement pour une réactivité immédiate
      if (this.gameManager.localPlayer === 'left') {
        this.playerLeft.moveUp();
      } else {
        this.playerRight.moveUp();
      }
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      // C'est une commande du joueur local
      this.gameManager.sendPlayerMove('down');

      // Mettre à jour localement pour une réactivité immédiate
      if (this.gameManager.localPlayer === 'left') {
        this.playerLeft.moveDown();
      } else {
        this.playerRight.moveDown();
      }
    }
  }

  handleKeyUp(e) {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS') {
      this.gameManager.sendPlayerMove('stop');

      // Mettre à jour localement pour une réactivité immédiate
      if (this.gameManager.localPlayer === 'left') {
        this.playerLeft.dy = 0;
      } else {
        this.playerRight.dy = 0;
      }
    }
  }

  addEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  removeEventListeners() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  endgame() {
    this.isGameRunning = false;
    this.removeEventListeners();

    // Nettoyage de la scène
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    // Nettoyage des ressources
    this.playerLeft.pCube.geometry.dispose();
    this.playerLeft.pCube.material.dispose();
    this.playerRight.pCube.geometry.dispose();
    this.playerRight.pCube.material.dispose();
    this.ball.bSphere.geometry.dispose();
    this.ball.bSphere.material.dispose();

    if (this.leftScoreGeometry) this.leftScoreGeometry.dispose();
    if (this.rightScoreGeometry) this.rightScoreGeometry.dispose();

    // Interface utilisateur
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.style.display = 'none';
    }

    // Get player names with fallbacks
    const leftPlayerName = this.leftPlayerNickname || 'Left Player';
    const rightPlayerName = this.rightPlayerNickname || 'Right Player';

    // Determine winner
    const isLeftWinner = this.playerLeft.getScore() > this.playerRight.getScore();
    const winnerName = isLeftWinner ? leftPlayerName : rightPlayerName;

    // Update the end game screen with the details
    const winnerNameElement = document.getElementById('winner-name');
    if (winnerNameElement) {
      winnerNameElement.textContent = `${winnerName} Wins!`;
    }
    const finalScoreElement = document.getElementById('final-score');
    if (finalScoreElement) {
      finalScoreElement.textContent = `${leftPlayerName} ${this.playerLeft.getScore()} - ${this.playerRight.getScore()} ${rightPlayerName}`;
    }

    // Show the end game screen
    const endGameScreen = document.getElementById('end-game-screen');
    if (endGameScreen) {
      endGameScreen.style.display = 'flex';
    }

    document.getElementById('main-menu-btn').addEventListener('click', () => {
      if (endGameScreen) {
        endGameScreen.style.display = 'none';
      }
      globalThis.router.navigate('/');
    });

    // Add event listener for close button
    document.querySelector('.window__close').addEventListener('click', () => {
      if (endGameScreen) {
        endGameScreen.style.display = 'none';
      }
      globalThis.router.navigate('/');
    });

    // Nettoyage final
    this.renderer.dispose();
    this.playerLeft.scoreCount = 0;
    this.playerRight.scoreCount = 0;
  }
}

// ----------------- Pregame function -----------------
export function pregame() {
  const pregameMenu = document.getElementById('pregame-menu');
  const gameContainer = document.getElementById('game-container');
  const canvas = document.getElementById('pongCanvas');

  if (!canvas || !pregameMenu || !gameContainer) {
    console.log('Waiting for game elements to load...');
    setTimeout(pregame, 100);
    return;
  }
}

export function animate(game, winScore) {
  if (!game || !game.isGameRunning) return;

  requestAnimationFrame(() => animate(game, winScore));

  const currentTime = performance.now();
  const deltaTime = (currentTime - game.lastUpdateTime) / 1000;
  game.lastUpdateTime = currentTime;

  // Accumulate time
  game.accumulatedTime += deltaTime;

  // Update physics at fixed time steps
  while (game.accumulatedTime >= game.fixedTimeStep) {
    if (checkXCollision(game, winScore)) {
      updatePos(game, game.fixedTimeStep);
      game.ball.moveBall(game.playerLeft, game.playerRight, game.fixedTimeStep);
    } else {
      game.endgame();
      return;
    }
    game.accumulatedTime -= game.fixedTimeStep;
  }

  // Always render the current state
  game.renderer.render(game.scene, game.camera);
}

export function initGame(ballSpeed, paddleSize, paddleSpeed, winScore) {
  // Validate parameters
  if (
    ballSpeed === undefined ||
    paddleSize === undefined ||
    paddleSpeed === undefined ||
    winScore === undefined
  ) {
    console.error('Missing game parameters');
    return null;
  }

  // Initialize the game
  const game = new Game(ballSpeed, paddleSize, paddleSpeed, winScore);

  // Return the game without starting animation yet
  return game;
}

export function startGameLoop(game, winScore) {
  if (!game) {
    console.error('No game instance provided');
    return;
  }

  // Start the animation loop
  animate(game, winScore);

  // Close the game when the route changes (when the page is closed)
  document.addEventListener('routeChange', () => {
    if (game?.isGameRunning) {
      game.isGameRunning = false;
    }
  });
}

export function setupSliders() {
  // Ball speed slider
  const ballSpeedSlider = document.getElementById('ball-speed');
  const ballSpeedValue = document.getElementById('ball-speed-value');
  if (ballSpeedSlider && ballSpeedValue) {
    ballSpeedSlider.addEventListener('input', function () {
      ballSpeedValue.textContent = this.value;
    });
  }

  // Paddle size slider
  const paddleSizeSlider = document.getElementById('paddle-size');
  const paddleSizeValue = document.getElementById('paddle-size-value');
  if (paddleSizeSlider && paddleSizeValue) {
    paddleSizeSlider.addEventListener('input', function () {
      paddleSizeValue.textContent = this.value;
    });
  }

  // Paddle speed slider
  const paddleSpeedSlider = document.getElementById('paddle-speed');
  const paddleSpeedValue = document.getElementById('paddle-speed-value');
  if (paddleSpeedSlider && paddleSpeedValue) {
    paddleSpeedSlider.addEventListener('input', function () {
      paddleSpeedValue.textContent = this.value;
    });
  }

  // Win score slider
  const winScoreSlider = document.getElementById('win-score');
  const winScoreValue = document.getElementById('win-score-value');
  if (winScoreSlider && winScoreValue) {
    winScoreSlider.addEventListener('input', function () {
      winScoreValue.textContent = this.value;
    });
  }
}
