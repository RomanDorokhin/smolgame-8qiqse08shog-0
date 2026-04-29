import { spawnWaterBubbles } from './particles.js';

export function initWorldTimers(state) {
  state.nextFlightAt = 260 + Math.floor(Math.random() * 80);
  state.nextWaterAt = state.nextFlightAt + 300 + Math.floor(Math.random() * 120);
}

export function beginFlight(state, player, cfg, clearObstacles) {
  state.mode = 'flight';
  state.modeTimer = cfg.FLIGHT_FRAMES;
  player.jumps = 0;
  player.vy = Math.min(player.vy, -4);
  clearObstacles();
}

export function beginWater(state, player, cfg, particles, clearObstacles) {
  state.mode = 'water';
  state.modeTimer = cfg.WATER_FRAMES;
  state.pipeAnim = 45;
  state.waterSurfaceY = cfg.GR + player.h * 0.35;
  player.y = state.waterSurfaceY - player.h * 0.5;
  player.vy = 2;
  player.jumps = 0;
  clearObstacles();
  spawnWaterBubbles(particles, player.x + player.w / 2, state.waterSurfaceY, 12);
}

export function endSpecialMode(state, player, cfg, exitingWater, clearObstacles) {
  state.mode = 'run';
  state.modeTimer = 0;
  clearObstacles();
  if (!exitingWater) {
    state.pipeAnim = 0;
    player.y = cfg.GR;
    player.vy = 0;
    player.jumps = 0;
  } else {
    state.pipeAnim = 36;
    player.y = state.waterSurfaceY - player.h - 2;
    player.vy = -13;
    player.jumps = 0;
  }
  state.nextFlightAt =
    state.frame + 220 + (Math.floor(state.score * 2) % 160);
  state.nextWaterAt =
    state.nextFlightAt + 320 + (Math.floor(state.score * 1.5) % 180);
}

export function tickMode(state, player, cfg, particles, clearObstacles) {
  if (state.phase !== 'play' || state.mode === 'run') return;

  state.modeTimer--;
  if (state.pipeAnim > 0) state.pipeAnim--;

  if (state.modeTimer <= 0) {
    const fromWater = state.mode === 'water';
    endSpecialMode(state, player, cfg, fromWater, clearObstacles);
    return;
  }

  if (state.mode === 'water' && state.frame % 18 === 0) {
    spawnWaterBubbles(
      particles,
      player.x + player.w / 2,
      player.y + player.h * 0.3,
      2
    );
  }
}

export function maybeEnterSpecialMode(
  state,
  player,
  cfg,
  particles,
  clearObstacles
) {
  if (state.phase !== 'play' || state.mode !== 'run') return;

  if (state.frame >= state.nextFlightAt) {
    beginFlight(state, player, cfg, clearObstacles);
    state.nextFlightAt = Infinity;
    return;
  }
  if (state.frame >= state.nextWaterAt) {
    beginWater(state, player, cfg, particles, clearObstacles);
    state.nextWaterAt = Infinity;
  }
}
