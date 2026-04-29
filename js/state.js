export function createGameState() {
  return {
    phase: 'start',
    score: 0,
    best: parseInt(localStorage.getItem('smol_best') || '0', 10),
    speed: 5,
    frame: 0,
    flash: 0,
    /** @type {'run' | 'flight' | 'water'} */
    mode: 'run',
    modeTimer: 0,
    nextFlightAt: 280,
    nextWaterAt: 520,
    pipeAnim: 0,
    /** surface Y when in water mode */
    waterSurfaceY: 0,
  };
}

export function createPlayer(cfg) {
  return {
    x: cfg.W * cfg.PLAYER.xRatio,
    y: cfg.GR,
    w: cfg.PLAYER.w,
    h: cfg.PLAYER.h,
    vy: 0,
    jumps: 0,
    maxJumps: 2,
    dead: false,
    trail: [],
    spin: 0,
    swimBob: 0,
    somersaultCooldown: 0,
  };
}

export function createStars(W, GR) {
  return Array.from({ length: 60 }, () => ({
    x: Math.random() * W,
    y: Math.random() * GR * 0.9,
    r: Math.random() * 1.5 + 0.3,
    blink: Math.random() * Math.PI * 2,
  }));
}
