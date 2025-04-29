import { Page } from '../core/Page.js';
import * as THREE from 'three';

class Paddle {
  constructor() {
    this.x = 0;
    this.speed = 0.1;
    this.width = 3;
    this.size = 0.2;
    this.direction = 1;
  }

  sceneADD(scene) {
    const geometry = new THREE.BoxGeometry(this.width, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 'white' });
    const cube = new THREE.Mesh(geometry, material);
    this.pCube = cube;
    cube.position.x = 0;
    cube.position.y = 0;
    cube.position.z = 0;

    scene.add(cube);
  }

  checkXCollision() {
    if (this.x - this.width / 2 <= -8 || this.x + this.width / 2 >= 8) {
      this.direction *= -1;
    }
  }

  updatePose() {
    this.checkXCollision();
    this.x += this.speed * this.direction;
    if (this.pCube) {
      this.pCube.position.x = this.x;
    }
  }
}

class Ball {
  constructor() {
    this.x = 0;
    this.speed = 0.1;
    this.size = 1;
    this.direction = 1;
    this.radius = 0.5;
  }
  sceneADD(scene) {
    const geometry = new THREE.SphereGeometry(this.radius, 32, 16);
    const material = new THREE.MeshPhongMaterial({ color: 'white' });
    const sphere = new THREE.Mesh(geometry, material);
    this.sphere = sphere;
    sphere.position.x = 0;
    sphere.position.y = 0;
    sphere.position.z = 0;
    scene.add(sphere);
  }

  checkXCollision() {
    if (this.x <= -8 || this.x >= 8) {
      this.direction *= -1;
    }
  }

  updatePose() {
    this.checkXCollision();
    this.x += this.speed * this.direction;
    if (this.sphere) {
      this.sphere.position.x = this.x;
    }
  }
}

export class Pregame {
  constructor(canva, type) {
    this.canva = canva;
    this.type = type;
    this.setup();
    this.createElements();
  }

  setup() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canva,
      antialias: true,
    });
    this.renderer.setSize(this.canva.width, this.canva.height);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(75, this.canva.width / this.canva.height, 0.1, 1000);
    this.camera.position.z = 5;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 2);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
  }

  createElements() {
    switch (this.type) {
      case 'ball':
        this.ball = new Ball();
        this.ball.sceneADD(this.scene);
        break;
      case 'paddleSize':
        this.paddle = new Paddle();
        this.paddle.sceneADD(this.scene);
        break;
      case 'paddleSpeed':
        this.paddle = new Paddle();
        this.paddle.sceneADD(this.scene);
        break;
      case 'ballSize':
        this.ball = new Ball();
        this.ball.sceneADD(this.scene);
        break;
    }
  }

  animate() {
    switch (this.type) {
      case 'ball':
        this.updateSpeed(this.speed);
        break;
      case 'paddleSize':
        this.updateSize(this.size);
        break;
      case 'paddleSpeed':
        this.updateSpeed(this.speed);
        break;
      case 'ballSize':
        this.updateSize(this.radius);
        break;
    }
    this.renderer.render(this.scene, this.camera);
  }

  updateSpeed(value) {
    if (this.type === 'ball') {
      this.ball.speed = parseFloat(value);
    } else if (this.type === 'paddleSpeed') {
      this.paddle.speed = parseFloat(value);
    }
  }

  updateSize(value) {
    if (this.type === 'paddleSize') {
      const newGeometry = new THREE.BoxGeometry(parseFloat(value), 1, 1);
      this.paddle.pCube.geometry.dispose();
      this.paddle.pCube.geometry = newGeometry;
      this.paddle.height = parseFloat(value);
    } else if (this.type === 'ballSize') {
      const newGeometry = new THREE.SphereGeometry(parseFloat(value), 32, 16);
      this.ball.sphere.geometry.dispose();
      this.ball.sphere.geometry = newGeometry;
      this.ball.radius = parseFloat(value);
    }
  }
}

let isAnimating = true;

export function stopPregameAnimations() {
  isAnimating = false;
  document.getElementById('pregame-menu').style.display = 'none';
}

export function getIsAnimating() {
  return isAnimating;
}

function setupEventListeners(animations) {
  const ballSpeedInput = document.getElementById('ball-speed');
  const paddleSizeInput = document.getElementById('paddle-size');
  const paddleSpeedInput = document.getElementById('paddle-speed');
  const ballSizeInput = document.getElementById('ball-size');

  if (ballSpeedInput) {
    ballSpeedInput.addEventListener('input', e => {
      document.getElementById('ball-speed-value').textContent = e.target.value;
      animations.ball.updateSpeed(e.target.value);
    });
  }

  if (paddleSizeInput) {
    paddleSizeInput.addEventListener('input', e => {
      document.getElementById('paddle-size-value').textContent = e.target.value;
      animations.paddleSize.updateSize(e.target.value);
    });
  }

  if (paddleSpeedInput) {
    paddleSpeedInput.addEventListener('input', e => {
      document.getElementById('paddle-speed-value').textContent = e.target.value;
      animations.paddleSpeed.updateSpeed(e.target.value);
    });
  }

  if (ballSizeInput) {
    ballSizeInput.addEventListener('input', e => {
      document.getElementById('ball-size-value').textContent = e.target.value;
      animations.ballSize.updateSize(e.target.value);
    });
  }
}

function animate(animations) {
  if (isAnimating) {
    requestAnimationFrame(() => animate(animations)); // Pass animations to callback
    Object.values(animations).forEach(anim => {
      if ((anim.type === 'ball' || anim.type === 'ballSize') && anim.ball) {
        anim.ball.updatePose();
      } else if ((anim.type === 'paddleSize' || anim.type === 'paddleSpeed') && anim.paddle) {
        anim.paddle.updatePose();
      }
      anim.renderer.render(anim.scene, anim.camera);
    });
  }
}

export function pregameSetup() {
  isAnimating = true;
  const animations = {
    ball: new Pregame(document.getElementById('ball-speed-canva'), 'ball'),
    paddleSize: new Pregame(document.getElementById('paddle-size-canva'), 'paddleSize'),
    paddleSpeed: new Pregame(document.getElementById('paddle-speed-canva'), 'paddleSpeed'),
    ballSize: new Pregame(document.getElementById('ball-size-canva'), 'ballSize'),
  };
  setupEventListeners(animations);
  animate(animations);
}
