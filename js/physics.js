import { checkCollision } from './utils.js';
import { spawnObstacle, spawnWaterObstacle, moveObstacles } from './obstacles.js';
import {
  spawnDeathParticles,
  spawnJumpParticles,
  spawnSomersaultParticles,
} from './particles.js';
import { tickMode, maybeEnterSpecialMode } from './world.js';

export function updateGame(state, player, cfg, obstacles, particles) {
  if (state.phase !== 'play') return;

  state.frame++;
  state.score += state.speed * 0.05;
  state.speed = cfg.BASE_SPEED + state.score * 0.012;
  if (state.speed > cfg.MAX_SPEED) state.speed = cfg.MAX_SPEED;

  tickMode(state, player, cfg, particles, () => {
    obstacles.length = 0;
  });
  maybeEnterSpecialMode(state, player, cfg, particles, () => {
    obstacles.length = 0;
  });

  player.trail.unshift({ x: player.x, y: player.y });
  if (player.trail.length > 8) player.trail.pop();

  if (player.somersaultCooldown > 0) player.somersaultCooldown--;

  const waterBottom = cfg.H - 28;

  if (state.mode === 'run') {
    player.vy += cfg.GRAVITY;
    player.y += player.vy;
    player.spin *= 0.92;
    if (Math.abs(player.spin) < 0.02) player.spin = 0;

    if (player.y >= cfg.GR) {
      player.y = cfg.GR;
      player.vy = 0;
      player.jumps = 0;
    }
  } else if (state.mode === 'flight') {
    player.vy += cfg.FLIGHT_GRAVITY;
    player.y += player.vy;
    player.spin += 0.08;
    const ceiling = 40;
    const floor = cfg.GR - 8;
    if (player.y < ceiling) {
      player.y = ceiling;
      player.vy *= -0.35;
    }
    if (player.y > floor) {
      player.y = floor;
      player.vy = 0;
      player.jumps = 0;
    }
  } else if (state.mode === 'water') {
    player.swimBob += 0.12;
    player.vy += cfg.WATER_GRAVITY;
    const buoyMid =
      state.waterSurfaceY + (waterBottom - state.waterSurfaceY) * 0.45;
    if (player.y + player.h / 2 > buoyMid) {
      player.vy += cfg.WATER_BUOYANCY;
    }
    player.y += player.vy;
    player.vy *= 0.88;
    if (player.y < state.waterSurfaceY - 6) {
      player.y = state.waterSurfaceY - 6;
      player.vy = Math.max(0, player.vy * 0.3);
    }
    if (player.y + player.h > waterBottom) {
      player.y = waterBottom - player.h;
      player.vy = Math.min(0, player.vy);
    }
    player.spin = Math.sin(player.swimBob) * 0.15;
  }

  const spawnRate =
    state.mode === 'water'
      ? Math.max(70, 130 - state.speed * 2)
      : state.mode === 'flight'
        ? Math.max(65, 100 - state.speed * 2.5)
        : Math.max(55, 110 - state.speed * 3);

  if (state.frame % Math.floor(spawnRate) === 0) {
    if (state.mode === 'water') {
      spawnWaterObstacle(obstacles, cfg.W, waterBottom, player.h);
    } else {
      spawnObstacle(obstacles, cfg.W, cfg.GR, player.h);
    }
  }

  moveObstacles(obstacles, state.speed, state.mode);

  const hitbox = {
    x: player.x,
    y: player.y,
    w: player.w,
    h: player.h,
  };

  obstacles.forEach((ob) => {
    if (checkCollision(hitbox, ob) && !player.dead) {
      player.dead = true;
      state.flash = 10;
      spawnDeathParticles(particles, player);
      if (Math.floor(state.score) > state.best) {
        state.best = Math.floor(state.score);
        localStorage.setItem('smol_best', String(state.best));
      }
      setTimeout(() => {
        state.phase = 'dead';
      }, 600);
    }
  });

  if (state.flash > 0) state.flash--;
}

export function trySomersault(player, cfg, particles) {
  if (
    player.dead ||
    player.somersaultCooldown > 0 ||
    player.y >= cfg.GR - 4
  ) {
    return false;
  }
  player.vy += cfg.SOMERSAULT_BOOST;
  player.spin += cfg.SOMERSAULT_SPIN * (Math.random() > 0.5 ? 1 : -1);
  player.somersaultCooldown = 28;
  spawnSomersaultParticles(particles, player);
  return true;
}

export function tryJump(
  state,
  player,
  cfg,
  particles,
  JUMP_FORCE,
  maxJumps
) {
  if (state.mode === 'flight') {
    if (player.jumps < maxJumps) {
      player.vy = JUMP_FORCE * 0.75;
      player.jumps++;
      spawnJumpParticles(particles, player);
    }
    return true;
  }
  if (state.mode === 'water') {
    player.vy += JUMP_FORCE * 0.35;
    spawnJumpParticles(particles, player);
    return true;
  }
  const onGround = player.y >= cfg.GR - 1;
  if (player.jumps < maxJumps) {
    player.vy = JUMP_FORCE * (player.jumps === 1 ? 0.85 : 1);
    player.jumps++;
    spawnJumpParticles(particles, player);
    return true;
  }
  if (!onGround && trySomersault(player, cfg, particles)) {
    return true;
  }
  return false;
}
