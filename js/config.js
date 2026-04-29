/** @param {HTMLCanvasElement} canvas */
export function createConfig(canvas) {
  const W = Math.min(window.innerWidth, 420);
  const H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  return {
    W,
    H,
    get GR() {
      return H * 0.72;
    },
    GRAVITY: 0.65,
    JUMP_FORCE: -14,
    WATER_GRAVITY: 0.18,
    WATER_BUOYANCY: -0.35,
    FLIGHT_GRAVITY: 0.12,
    MAX_SPEED: 18,
    BASE_SPEED: 5,
    PLAYER: { w: 28, h: 40, xRatio: 0.2 },
    FLIGHT_FRAMES: 420,
    WATER_FRAMES: 900,
    SOMERSAULT_BOOST: -7,
    SOMERSAULT_SPIN: 0.45,
  };
}

export const COLORS = {
  bg: '#0a0a0f',
  ground: '#1a1a2e',
  groundLine: '#7B2FBE',
  player: '#a855f7',
  playerGlow: '#c084fc',
  obstacle: '#f43f5e',
  obstacleGlow: '#fb7185',
  score: '#e2e8f0',
  accent: '#7c3aed',
  trail: '#7c3aed',
  waterDeep: '#0c1929',
  waterSurface: '#1e3a5f',
  pipe: '#15803d',
  pipeDark: '#14532d',
  cloud: 'rgba(226,232,240,0.35)',
};
