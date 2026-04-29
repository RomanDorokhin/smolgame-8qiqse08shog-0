import { COLORS } from './config.js';

export function spawnJumpParticles(particles, player) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: player.x + player.w / 2,
      y: player.y + player.h,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * -3,
      life: 1,
      decay: 0.06 + Math.random() * 0.04,
      r: 2 + Math.random() * 3,
      death: false,
    });
  }
}

export function spawnSomersaultParticles(particles, player) {
  for (let i = 0; i < 14; i++) {
    const a = (Math.PI * 2 * i) / 14;
    particles.push({
      x: player.x + player.w / 2,
      y: player.y + player.h / 2,
      vx: Math.cos(a) * 5,
      vy: Math.sin(a) * 5 - 2,
      life: 1,
      decay: 0.05,
      r: 2 + Math.random() * 2,
      death: false,
      hue: 'trail',
    });
  }
}

export function spawnDeathParticles(particles, player) {
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.3;
    const spd = 3 + Math.random() * 6;
    particles.push({
      x: player.x + player.w / 2,
      y: player.y + player.h / 2,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 1,
      decay: 0.025 + Math.random() * 0.02,
      r: 3 + Math.random() * 5,
      death: true,
    });
  }
}

export function spawnWaterBubbles(particles, x, y, count = 3) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -1.2 - Math.random() * 1.5,
      life: 1,
      decay: 0.02,
      r: 2 + Math.random() * 3,
      death: false,
      bubble: true,
    });
  }
}

export function updateParticles(particles) {
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (!p.death && !p.bubble) p.vy += 0.1;
    if (p.bubble) {
      p.vx *= 0.98;
      p.life -= p.decay * 0.8;
    } else {
      p.life -= p.decay;
    }
  });
  return particles.filter((p) => p.life > 0);
}

export function particleFillStyle(p) {
  if (p.death) return COLORS.obstacle;
  if (p.bubble) return 'rgba(186,230,253,0.7)';
  return COLORS.trail;
}
