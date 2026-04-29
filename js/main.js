import { createConfig } from './config.js';
import { createGameState, createPlayer, createStars } from './state.js';
import { updateParticles } from './particles.js';
import { updateGame, tryJump } from './physics.js';
import { initWorldTimers } from './world.js';
import { createRenderer } from './render.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let cfg = createConfig(canvas);
const state = createGameState();
const player = createPlayer(cfg);
let obstacles = [];
let particles = [];
let stars = createStars(cfg.W, cfg.GR);

const render = createRenderer(ctx, () => cfg);

function syncCanvas() {
  cfg = createConfig(canvas);
  player.x = cfg.W * cfg.PLAYER.xRatio;
  stars = createStars(cfg.W, cfg.GR);
}

function resetGame() {
  player.y = cfg.GR;
  player.vy = 0;
  player.jumps = 0;
  player.dead = false;
  player.trail = [];
  player.spin = 0;
  player.swimBob = 0;
  player.somersaultCooldown = 0;
  obstacles = [];
  particles = [];
  state.score = 0;
  state.speed = cfg.BASE_SPEED;
  state.frame = 0;
  state.flash = 0;
  state.mode = 'run';
  state.modeTimer = 0;
  state.pipeAnim = 0;
  initWorldTimers(state);
}

function jump() {
  const JUMP_FORCE = cfg.JUMP_FORCE;
  const maxJumps = player.maxJumps;

  if (state.phase === 'start') {
    state.phase = 'play';
    resetGame();
    return;
  }
  if (state.phase === 'dead') {
    state.phase = 'play';
    resetGame();
    return;
  }
  tryJump(state, player, cfg, particles, JUMP_FORCE, maxJumps);
}

function loop() {
  updateGame(state, player, cfg, obstacles, particles);
  particles = updateParticles(particles);
  render.draw(state, player, stars, obstacles, particles);
  requestAnimationFrame(loop);
}

canvas.addEventListener(
  'touchstart',
  (e) => {
    e.preventDefault();
    jump();
  },
  { passive: false }
);

canvas.addEventListener('mousedown', (e) => {
  e.preventDefault();
  jump();
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    jump();
  }
});

window.addEventListener('resize', () => {
  syncCanvas();
});

loop();
