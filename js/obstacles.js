const TYPES = [
  { w: 22, h: 45 },
  { w: 38, h: 28 },
  { w: 18, h: 65 },
  { w: 50, h: 22 },
];

export function spawnObstacle(obstacles, W, GR, playerH) {
  const t = TYPES[Math.floor(Math.random() * TYPES.length)];
  obstacles.push({
    x: W + 20,
    y: GR - t.h + playerH,
    w: t.w,
    h: t.h,
    pulse: Math.random() * Math.PI * 2,
  });
}

/** Slower, wider obstacles underwater */
export function spawnWaterObstacle(obstacles, W, waterBottom, playerH) {
  const w = 40 + Math.random() * 35;
  const h = 20 + Math.random() * 25;
  obstacles.push({
    x: W + 30,
    y: waterBottom - h - Math.random() * 80,
    w,
    h,
    pulse: Math.random() * Math.PI * 2,
    water: true,
  });
}

export function moveObstacles(obstacles, speed, mode) {
  const mult = mode === 'water' ? 0.45 : mode === 'flight' ? 0.65 : 1;
  obstacles.forEach((ob) => {
    ob.x -= speed * mult;
  });
  return obstacles.filter((ob) => ob.x > -120);
}
