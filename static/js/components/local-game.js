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
    this.speed = speed;
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
    this.speed = speed;
    this.resetSpeed = speed;
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

  wichDirection(player) {
    const diff = this.y - player.y;
    const maxBounceAngle = Math.PI / 4; // Maximum angle for bounce
    const angle = (diff / player.height) * maxBounceAngle;
    return Math.tan(angle);
  }

  // Move the ball
  moveBall(player_left, player_right, deltaTime) {
    // Lorsque la balle touche le paddle, ajuster sa position légèrement au-delà du paddle
    if (this.direction_x === -1) {
      // Check collision with the left paddle
      if (
        this.isBallinPlayer(
          player_left.getx(),
          player_left.gety(),
          player_left.getwidth(),
          player_left.getheight()
        )
      ) {
        this.direction_x = 1; // Reverse horizontal direction
        this.direction_y = this.wichDirection(player_left); // Update vertical direction
        this.x = player_left.getx() + player_left.getwidth() + this.radius; // Move ball just outside the paddle
      } else {
        if (this.isBallinYWall()) {
          this.direction_y *= -1; // Reverse vertical direction when hitting top/bottom walls
        }
        this.x -= this.speed; // Continue moving left
        this.y += this.speed * this.direction_y; // Adjust vertical position
      }
    } else if (this.direction_x === 1) {
      // Check collision with the right paddle
      if (
        this.isBallinPlayer(
          player_right.getx(),
          player_right.gety(),
          player_right.getwidth(),
          player_right.getheight()
        )
      ) {
        this.direction_x = -1; // Reverse horizontal direction
        this.direction_y = this.wichDirection(player_right); // Update vertical direction
        this.x = player_right.getx() - this.radius; // Move ball just outside the paddle
      } else {
        if (this.isBallinYWall()) {
          this.direction_y *= -1; // Reverse vertical direction when hitting top/bottom walls
        }
        this.x += this.speed; // Continue moving right
        this.y += this.speed * this.direction_y; // Adjust vertical position
      }
    }
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

function updatePos(game) {
  if (!game) return;
  // Update player positions using fixed timestep
  game.playerRight.y += game.playerRight.dy;
  game.playerLeft.y += game.playerLeft.dy;

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

function checkXCollision(game, winScore) {
  if (game.ball.isBallinXWall()) {
    if (game.ball.x < 0) {
      game.playerRight.incrementScore();
      if (game.playerRight.getScore() < winScore) {
        game.ball.resetBall(-1);
        game.playerRight.resetPlayer();
        game.playerLeft.resetPlayer();
        if (game.updateScore3D) game.updateScore3D();
      } else {
        return false;
      }
    } else {
      game.playerLeft.incrementScore();
      if (game.playerLeft.getScore() < winScore) {
        game.ball.resetBall(1);
        game.playerRight.resetPlayer();
        game.playerLeft.resetPlayer();
        if (game.updateScore3D) game.updateScore3D();
      } else {
        return false;
      }
    }
  }
  return true;
}

// ----------------- ath function -----------------

export class Game {
  constructor(
    ballSpeed,
    paddleSize,
    paddleSpeed,
    ballSize,
    winScore,
    leftPlayerNickname,
    rightPlayerNickname,
    leftPlayerColor,
    rightPlayerColor
  ) {
    this.isGameRunning = true;
    this.winScore = winScore;
    this.leftPlayerNickname = leftPlayerNickname;
    this.rightPlayerNickname = rightPlayerNickname;
    this.leftPlayerColor = leftPlayerColor;
    this.rightPlayerColor = rightPlayerColor;
    // Initialisation
    this.setup3D(ballSpeed, paddleSize, paddleSpeed, ballSize);
    this.addEventListeners();
  }

  // ----------------- 3D setup -----------------

  setup3D(ballSpeed, paddleSize, paddleSpeed, ballSize) {
    this.canvas = document.getElementById('pongCanvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(100, this.canvas.width / this.canvas.height, 5, 100);
    this.camera.position.z = 8;
    this.camera.position.y = 0;

    const geometry = new THREE.BoxGeometry(50, 25, 0);

    const material = new THREE.MeshPhongMaterial({ color: 'black' });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.z = -2;
    this.scene.add(cube);

    this.playerLeft = new Player(-10, 0, 0, paddleSize, paddleSpeed, this.leftPlayerColor);
    this.playerLeft.sceneADD(this.scene);

    this.playerRight = new Player(10, 0, 0, paddleSize, paddleSpeed, this.rightPlayerColor);
    this.playerRight.sceneADD(this.scene);

    this.ball = new ball(0, 0, 0, 1, 1, ballSpeed, ballSize || 0.5, 'red', this.gameManager);
    this.ball.sceneADD(this.scene);

    this.createScoreDisplay();
    //plus faible, pour adoucir les ombres
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    //simule une lumière venant du dessus
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 10); // Position au-dessus et sur le côté
    directionalLight.castShadow = true; // Active les ombres
    this.scene.add(directionalLight);

    // une source lumineuse comme une lampe
    const pointLight = new THREE.PointLight(0xffaa33, 1.5, 20);
    pointLight.position.set(0, 5, 5);
    this.scene.add(pointLight);

    //une lumière spot pour un effet dramatique
    const spotLight = new THREE.SpotLight(0xff0000, 1);
    spotLight.position.set(-5, 10, 5);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    this.scene.add(spotLight);

    //background : douce et large
    const backgroundLight = new THREE.DirectionalLight(0xffffff, 5);
    backgroundLight.position.set(0, 5, -5);
    backgroundLight.target = cube;
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

    this.leftScoreSprite = createTextSprite('0', this.leftPlayerColor);
    this.rightScoreSprite = createTextSprite('0', this.rightPlayerColor);

    this.leftNickSprite = createTextSprite(
      this.leftPlayerNickname || t('game.player.left'),
      this.leftPlayerColor
    );
    this.rightNickSprite = createTextSprite(
      this.rightPlayerNickname || t('game.player.right'),
      this.rightPlayerColor
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

      updateSprite(this.leftScoreSprite, this.playerLeft.getScore(), this.leftPlayerColor);
      updateSprite(this.rightScoreSprite, this.playerRight.getScore(), this.rightPlayerColor);
    }
  }

  handleKeyDown(e) {
    if (e.code === 'KeyW') {
      this.playerLeft.dy = this.playerLeft.speed;
    } else if (e.code === 'ArrowUp') {
      this.playerRight.dy = this.playerRight.speed;
    } else if (e.code === 'KeyS') {
      this.playerLeft.dy = -this.playerLeft.speed;
    } else if (e.code === 'ArrowDown') {
      this.playerRight.dy = -this.playerRight.speed;
    }
  }
  handleKeyUp(e) {
    if (e.code === 'KeyW' && this.playerLeft.dy > 0) {
      this.playerLeft.dy = 0;
    } else if (e.code === 'KeyS' && this.playerLeft.dy < 0) {
      this.playerLeft.dy = 0;
    } else if (e.code === 'ArrowUp' && this.playerRight.dy > 0) {
      this.playerRight.dy = 0;
    } else if (e.code === 'ArrowDown' && this.playerRight.dy < 0) {
      this.playerRight.dy = 0;
    }
  }

  addEventListeners() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

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

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    this.playerLeft.pCube.geometry.dispose();
    this.playerLeft.pCube.material.dispose();
    this.playerRight.pCube.geometry.dispose();
    this.playerRight.pCube.material.dispose();
    this.ball.bSphere.geometry.dispose();
    this.ball.bSphere.material.dispose();

    if (this.leftScoreGeometry) this.leftScoreGeometry.dispose();
    if (this.rightScoreGeometry) this.rightScoreGeometry.dispose();

    const gameContainer = document.getElementById('game-container');
    gameContainer.style.display = 'none';

    const leftPlayerName = this.leftPlayerNickname || 'Left Player';
    const rightPlayerName = this.rightPlayerNickname || 'Right Player';

    const isLeftWinner = this.playerLeft.getScore() > this.playerRight.getScore();
    const winnerName = isLeftWinner ? leftPlayerName : rightPlayerName;

    document.getElementById('winner-name').textContent = `${winnerName} Wins!`;
    document.getElementById(
      'final-score'
    ).textContent = `${leftPlayerName} ${this.playerLeft.getScore()} - ${this.playerRight.getScore()} ${rightPlayerName}`;

    const endGameScreen = document.getElementById('end-game-screen');
    endGameScreen.style.display = 'flex';

    document.getElementById('main-menu-btn').addEventListener('click', () => {
      endGameScreen.style.display = 'none';
      globalThis.router.navigate('/');
    });

    document.querySelector('.window__close').addEventListener('click', () => {
      endGameScreen.style.display = 'none';
      globalThis.router.navigate('/');
    });

    this.renderer.dispose();
    this.playerLeft.scoreCount = 0;
    this.playerRight.scoreCount = 0;
  }

  clean3D() {
    this.isGameRunning = false;
    this.removeEventListeners();

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    this.playerLeft.pCube.geometry.dispose();
    this.playerLeft.pCube.material.dispose();
    this.playerRight.pCube.geometry.dispose();
    this.playerRight.pCube.material.dispose();
    this.ball.bSphere.geometry.dispose();
    this.ball.bSphere.material.dispose();

    if (this.leftScoreGeometry) this.leftScoreGeometry.dispose();
    if (this.rightScoreGeometry) this.rightScoreGeometry.dispose();

    this.renderer.dispose();
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

  if (checkXCollision(game, winScore)) {
    updatePos(game);
    game.ball.moveBall(game.playerLeft, game.playerRight, game.fixedTimeStep);
    game.renderer.render(game.scene, game.camera);
  } else {
    game.endgame();
    return;
  }
}

export function tournamentAnimate(game, winScore, onGameEndCallback) {
  if (!game || !game.isGameRunning) return;

  requestAnimationFrame(() => tournamentAnimate(game, winScore, onGameEndCallback));

  if (checkXCollision(game, winScore)) {
    updatePos(game);
    game.ball.moveBall(game.playerLeft, game.playerRight, game.fixedTimeStep);
    game.renderer.render(game.scene, game.camera);
  } else {
    game.isGameRunning = false;
    game.clean3D();

    if (onGameEndCallback && typeof onGameEndCallback === 'function') {
      onGameEndCallback();
    }
  }
}

export function initGame(gameSettings, player1Name, player2Name, player1Color, player2Color) {
  if (
    gameSettings.ballSpeed === undefined ||
    gameSettings.paddleSize === undefined ||
    gameSettings.paddleSpeed === undefined ||
    gameSettings.ballSize === undefined ||
    gameSettings.winScore === undefined ||
    player1Name === undefined ||
    player2Name === undefined
  ) {
    console.error('Missing game parameters');
    return null;
  }

  const game = new Game(
    gameSettings.ballSpeed,
    gameSettings.paddleSize,
    gameSettings.paddleSpeed,
    gameSettings.ballSize,
    gameSettings.winScore,
    player1Name,
    player2Name,
    player1Color,
    player2Color
  );

  document.addEventListener('routeChange', () => {
    if (game?.isGameRunning) {
      game.isGameRunning = false;
    }
  });

  return game;
}

export function setupSliders() {
  const ballSpeedSlider = document.getElementById('ball-speed');
  const ballSpeedValue = document.getElementById('ball-speed-value');
  if (ballSpeedSlider && ballSpeedValue) {
    ballSpeedSlider.addEventListener('input', function () {
      ballSpeedValue.textContent = this.value;
    });
  }

  const paddleSizeSlider = document.getElementById('paddle-size');
  const paddleSizeValue = document.getElementById('paddle-size-value');
  if (paddleSizeSlider && paddleSizeValue) {
    paddleSizeSlider.addEventListener('input', function () {
      paddleSizeValue.textContent = this.value;
    });
  }

  const paddleSpeedSlider = document.getElementById('paddle-speed');
  const paddleSpeedValue = document.getElementById('paddle-speed-value');
  if (paddleSpeedSlider && paddleSpeedValue) {
    paddleSpeedSlider.addEventListener('input', function () {
      paddleSpeedValue.textContent = this.value;
    });
  }

  const winScoreSlider = document.getElementById('win-score');
  const winScoreValue = document.getElementById('win-score-value');
  if (winScoreSlider && winScoreValue) {
    winScoreSlider.addEventListener('input', function () {
      winScoreValue.textContent = this.value;
    });
  }
}
