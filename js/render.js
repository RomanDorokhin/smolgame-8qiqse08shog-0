import { rr } from './utils.js';
import { COLORS } from './config.js';
import { particleFillStyle } from './particles.js';

export function createRenderer(ctx, cfgRef) {
  const cfg = () => cfgRef;

  function drawStars(stars) {
    stars.forEach((s) => {
      s.blink += 0.02;
      const alpha = 0.4 + Math.sin(s.blink) * 0.3;
      ctx.fillStyle = `rgba(226,232,240,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawClouds(frame, speed) {
    const { W, H, GR } = cfg();
    const baseY = 50 + (GR * 0.15);
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 140 - (frame * speed * 0.08)) % (W + 160)) - 40;
      const cy = baseY + i * 22;
      ctx.fillStyle = COLORS.cloud;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.arc(cx + 24, cy - 4, 22, 0, Math.PI * 2);
      ctx.arc(cx + 48, cy, 26, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawGround(state, player) {
    const { W, H, GR } = cfg();
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, GR + player.h, W, H - GR - player.h);

    ctx.shadowBlur = 12;
    ctx.shadowColor = COLORS.groundLine;
    ctx.strokeStyle = COLORS.groundLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GR + player.h);
    ctx.lineTo(W, GR + player.h);
    ctx.stroke();
    ctx.shadowBlur = 0;

    const offset = (state.frame * state.speed) % 60;
    ctx.strokeStyle = 'rgba(123,47,190,0.15)';
    ctx.lineWidth = 1;
    for (let x = -offset; x < W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, GR + player.h);
      ctx.lineTo(x - 30, H);
      ctx.stroke();
    }
  }

  function drawWaterLayer(state, player) {
    const { W, H } = cfg();
    const surf = state.waterSurfaceY;
    const grad = ctx.createLinearGradient(0, surf, 0, H);
    grad.addColorStop(0, COLORS.waterSurface);
    grad.addColorStop(0.35, '#0f2744');
    grad.addColorStop(1, COLORS.waterDeep);
    ctx.fillStyle = grad;
    ctx.fillRect(0, surf, W, H - surf);

    const t = state.frame * 0.04;
    ctx.strokeStyle = 'rgba(186,230,253,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < W; x += 14) {
      const y = surf + Math.sin(x * 0.08 + t) * 4;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10, y + 2);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, surf, W, 8);
  }

  function drawPipeMario(state, player) {
    const { W, H } = cfg();
    const a = state.pipeAnim;
    if (a <= 0) return;
    const t = 1 - a / 45;
    const mouthW = W * 0.42 + (1 - t) * W * 0.25;
    const mouthH = 70 + (1 - t) * 40;
    const mx = (W - mouthW) / 2;
    const my = cfg().GR + player.h - mouthH * 0.2;

    ctx.save();
    ctx.fillStyle = COLORS.pipeDark;
    rr(ctx, mx - 6, my - 6, mouthW + 12, mouthH + 12, 10);
    ctx.fill();
    ctx.fillStyle = COLORS.pipe;
    rr(ctx, mx, my, mouthW, mouthH, 8);
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.stroke();

    const lip = my + mouthH * 0.55;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(mx + mouthW * 0.15, lip, mouthW * 0.7, mouthH * 0.45);

    ctx.restore();
  }

  function drawObstacles(obstacles) {
    obstacles.forEach((ob) => {
      ob.pulse += 0.05;
      const glow = Math.sin(ob.pulse) * 3;
      ctx.shadowBlur = 15 + glow;
      ctx.shadowColor = ob.water ? '#38bdf8' : COLORS.obstacleGlow;
      ctx.fillStyle = ob.water ? '#0369a1' : COLORS.obstacle;
      rr(ctx, ob.x, ob.y, ob.w, ob.h, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = ob.water ? '#7dd3fc' : '#fb7185';
      ctx.lineWidth = 1;
      ctx.strokeRect(ob.x + 2, ob.y + 2, ob.w - 4, ob.h - 4);
    });
  }

  function drawPlayer(state, player) {
    const spin = player.spin || 0;
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spin);
    ctx.translate(-cx, -cy);

    player.trail.forEach((t, i) => {
      const alpha = (i / player.trail.length) * 0.3;
      ctx.fillStyle = `rgba(124,58,237,${alpha})`;
      ctx.fillRect(
        t.x,
        t.y,
        player.w * (i / player.trail.length),
        player.h * (i / player.trail.length)
      );
    });

    ctx.shadowBlur = 20;
    ctx.shadowColor = COLORS.playerGlow;
    ctx.fillStyle = COLORS.player;
    rr(ctx, player.x, player.y, player.w, player.h, 6);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    const eyeY = player.y + 10;
    const squish =
      player.vy < -2 ? 0.7 : player.vy > 3 ? 1.3 : state.mode === 'water' ? 1.1 : 1;
    ctx.beginPath();
    ctx.ellipse(player.x + 8, eyeY, 4, 4 * squish, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(player.x + 18, eyeY, 4, 4 * squish, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.ellipse(player.x + 9, eyeY, 2, 2 * squish, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(player.x + 19, eyeY, 2, 2 * squish, 0, 0, Math.PI * 2);
    ctx.fill();

    const legAnim = Math.sin(state.frame * 0.25) * 6;
    if (player.jumps === 0 && state.mode === 'run') {
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(player.x + 4, player.y + player.h, 8, 6 + legAnim);
      ctx.fillRect(
        player.x + player.w - 12,
        player.y + player.h,
        8,
        6 - legAnim
      );
    }
    if (state.mode === 'water') {
      ctx.fillStyle = '#6d28d9';
      const fin = Math.sin(player.swimBob) * 4;
      ctx.beginPath();
      ctx.ellipse(
        player.x - 4,
        player.y + player.h * 0.55,
        10,
        5,
        fin * 0.05,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
    ctx.shadowBlur = 0;
  }

  function drawParticles(particles) {
    particles.forEach((p) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = particleFillStyle(p);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (p.bubble ? 1 : p.life), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawHUD(state, player) {
    const { W, H } = cfg();
    ctx.fillStyle = COLORS.score;
    ctx.font = `bold ${W * 0.08}px 'Courier New'`;
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(state.score), W / 2, H * 0.08);

    ctx.font = `${W * 0.04}px 'Courier New'`;
    ctx.fillStyle = 'rgba(168,85,247,0.8)';
    ctx.fillText(`BEST ${state.best}`, W / 2, H * 0.13);

    for (let i = 0; i < player.maxJumps; i++) {
      ctx.beginPath();
      ctx.arc(W / 2 - 12 + i * 20, H * 0.17, 5, 0, Math.PI * 2);
      ctx.fillStyle =
        i < player.jumps ? 'rgba(168,85,247,0.2)' : '#a855f7';
      ctx.fill();
    }

    let badge = '';
    if (state.mode === 'flight') badge = '✦ ПОЛЁТ';
    else if (state.mode === 'water') badge = '≈ ПОД ВОДОЙ';
    if (badge) {
      ctx.font = `${W * 0.038}px 'Courier New'`;
      ctx.fillStyle = 'rgba(250,204,21,0.95)';
      ctx.fillText(badge, W / 2, H * 0.22);
    }
  }

  function drawScreen(title, sub, state) {
    const { W, H } = cfg();
    ctx.fillStyle = 'rgba(10,10,15,0.7)';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#7c3aed';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `bold ${W * 0.13}px 'Courier New'`;
    ctx.fillText(title, W / 2, H * 0.42);
    ctx.shadowBlur = 0;

    ctx.font = `${W * 0.055}px 'Courier New'`;
    ctx.fillStyle = 'rgba(168,85,247,0.9)';
    ctx.fillText(sub, W / 2, H * 0.52);

    if (state.phase === 'dead') {
      ctx.font = `${W * 0.05}px 'Courier New'`;
      ctx.fillStyle = 'rgba(226,232,240,0.6)';
      ctx.fillText(`СЧЁТ ${Math.floor(state.score)}`, W / 2, H * 0.6);
      ctx.fillText(`РЕКОРД ${state.best}`, W / 2, H * 0.66);
    }
  }

  function draw(state, player, stars, obstacles, particles) {
    const { W, H } = cfg();
    ctx.fillStyle =
      state.flash > 0
        ? `rgba(244,63,94,${(state.flash / 10) * 0.3})`
        : COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    drawStars(stars);
    if (state.mode === 'flight') {
      drawClouds(state.frame, state.speed);
    }

    if (state.mode === 'water') {
      drawGround(state, player);
      drawObstacles(obstacles);
      drawWaterLayer(state, player);
      drawPipeMario(state, player);
    } else {
      drawGround(state, player);
      drawObstacles(obstacles);
    }

    drawParticles(particles);
    if (!player.dead || state.flash > 0) drawPlayer(state, player);
    drawHUD(state, player);

    if (state.phase === 'start') {
      drawScreen('SMOL RUN', '▶  ПРЫЖОК · САЛЬТО В ВОЗДУХЕ', state);
    }
    if (state.phase === 'dead') {
      drawScreen('GAME OVER', '▶  ЕЩЁ РАЗ', state);
    }
  }

  return { draw };
}
