/**
 * Homepage background scene: a perspective grid corridor, a GAIIC-style
 * particle wave, CICC-style bokeh orbs, and a drifting star field — all
 * drawn into a single canvas.
 *
 * Deliberately free of any framework dependency. The Vue homepage mounts it
 * through `ParticleField`, and `scripts/build-standalone.mjs` compiles this
 * same file into the self-contained `standalone.html`, so the animation has
 * one source of truth rather than a hand-copied twin.
 *
 * Everything lives on one canvas on purpose. The same scene built from stacked
 * CSS layers means every animated layer re-rasterises the translucent layers
 * below it, which pegs a CPU core on machines without GPU acceleration. Here
 * the whole scene is one composited surface with a fixed frame budget.
 */

const DEPTH = 1150;
const HORIZON = 0.52;
const FLOOR_Y = 430;
const CEIL_Y = -360;
const SPACING = 250;
const NEAR = 110;
const FAR = 3200;

const TINTS = [
  [103, 232, 249],
  [34, 211, 238],
  [96, 165, 250],
  [232, 240, 255],
] as const;

const BOKEH = [
  [165, 243, 252],
  [56, 189, 248],
  [167, 139, 250],
  [232, 121, 249],
] as const;

type Particle = { x: number; y: number; z: number; tint: number; size: number };
type Orb = { x: number; y: number; r: number; vx: number; vy: number; tint: number; phase: number };
type Streak = { x: number; y: number; len: number; speed: number; life: number; max: number };

/**
 * Starts the scene on `canvas` and returns a teardown function that cancels
 * the frame loop and removes every listener it installed.
 */
export function mountParticleScene(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0;
  let h = 0;
  let count = 0;
  let waveCols = 16;
  let waveRows = 9;
  let focal = 620;
  let particles: Particle[] = [];
  let orbs: Orb[] = [];
  let streaks: Streak[] = [];
  let edgeFade: CanvasGradient | null = null;

  const spawnParticle = (front = false): Particle => ({
    x: (Math.random() * 2 - 1) * 1500,
    y: (Math.random() * 2 - 1) * 1000,
    z: front ? Math.random() * DEPTH + 80 : DEPTH + Math.random() * 260,
    tint: Math.floor(Math.random() * TINTS.length),
    size: Math.random() * 1.5 + 0.45,
  });

  const spawnOrb = (): Orb => ({
    x: Math.random() * Math.max(w, 1),
    y: Math.random() * Math.max(h, 1),
    r: 22 + Math.random() * 78,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.18,
    tint: Math.floor(Math.random() * BOKEH.length),
    phase: Math.random() * Math.PI * 2,
  });

  const spawnStreak = (): Streak => ({
    x: w * (0.15 + Math.random() * 0.85),
    y: -40 - Math.random() * 180,
    len: 70 + Math.random() * 140,
    speed: 7 + Math.random() * 9,
    life: 0,
    max: 70 + Math.random() * 50,
  });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const parent = canvas.parentElement;
    w = Math.max(1, Math.floor(parent?.clientWidth || window.innerWidth));
    h = Math.max(1, Math.floor(parent?.clientHeight || window.innerHeight));
    focal = Math.max(470, h * 0.69);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    edgeFade = ctx.createLinearGradient(0, 0, w, 0);
    edgeFade.addColorStop(0, "rgba(45,212,191,0)");
    edgeFade.addColorStop(0.18, "rgba(8,145,178,0.55)");
    edgeFade.addColorStop(0.5, "rgba(34,211,238,1)");
    edgeFade.addColorStop(0.82, "rgba(96,165,250,0.55)");
    edgeFade.addColorStop(1, "rgba(96,165,250,0)");

    waveCols = w < 768 ? 12 : w < 1280 ? 18 : 22;
    waveRows = w < 768 ? 7 : 10;
    const next = w < 768 ? 48 : w < 1280 ? 80 : 110;
    if (next !== count) {
      count = next;
      particles = Array.from({ length: count }, () => spawnParticle(true));
    }

    const orbCount = w < 768 ? 7 : 11;
    if (orbs.length !== orbCount) orbs = Array.from({ length: orbCount }, spawnOrb);
    const streakCount = w < 768 ? 2 : 4;
    if (streaks.length !== streakCount) streaks = Array.from({ length: streakCount }, spawnStreak);
  };
  resize();

  let targetX = 0;
  let targetY = 0;
  let panX = 0;
  let panY = 0;

  const onPointer = (e: PointerEvent) => {
    targetX = (e.clientX / w - 0.5) * -70;
    targetY = (e.clientY / h - 0.5) * -45;
  };

  const gridLines = (
    cx: number,
    cy: number,
    planeY: number,
    offset: number,
    alpha: number,
    sweepZ: number,
  ) => {
    ctx.strokeStyle = edgeFade ?? "rgba(34,211,238,1)";

    const nearScale = focal / NEAR;
    const farScale = focal / FAR;
    ctx.lineWidth = 1.1;
    for (let j = -6; j <= 6; j++) {
      const x = j * SPACING;
      ctx.globalAlpha = alpha * (1 - Math.abs(j) / 8);
      ctx.beginPath();
      ctx.moveTo(cx + x * nearScale, cy + planeY * nearScale);
      ctx.lineTo(cx + x * farScale, cy + planeY * farScale);
      ctx.stroke();
    }

    for (let k = 0; k < 16; k++) {
      const z = NEAR + k * SPACING + offset;
      if (z <= NEAR) continue;
      const scale = focal / z;
      const y = cy + planeY * scale;
      const halfWidth = 6 * SPACING * scale;
      const nearness = Math.max(0, 1 - z / 2400);
      const depthFade = alpha * nearness * 1.5;
      if (depthFade <= 0.004) continue;
      ctx.globalAlpha = Math.min(1, depthFade);
      ctx.lineWidth = 0.7 + nearness * 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - halfWidth, y);
      ctx.lineTo(cx + halfWidth, y);
      ctx.stroke();
    }

    if (sweepZ > NEAR && sweepZ < FAR) {
      const scale = focal / sweepZ;
      const y = cy + planeY * scale;
      const halfWidth = 6.4 * SPACING * scale;
      ctx.globalAlpha = Math.min(1, alpha * 2.6 * Math.max(0, 1 - sweepZ / 2600));
      ctx.lineWidth = 1.4 + Math.max(0, 1 - sweepZ / 1400) * 2;
      ctx.beginPath();
      ctx.moveTo(cx - halfWidth, y);
      ctx.lineTo(cx + halfWidth, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  };

  const drawNebula = (cx: number, cy: number, t: number) => {
    const blobs = [
      [cx - w * 0.28, cy - h * 0.18, 0.22, 8, 145, 178, 0.2],
      [cx + w * 0.32, cy - h * 0.08, 0.26, 34, 211, 238, 0.16],
      [cx + w * 0.08, cy + h * 0.22, 0.24, 124, 92, 255, 0.18],
      [cx - w * 0.06, cy + h * 0.04, 0.18, 56, 189, 248, 0.12],
    ] as const;
    for (let i = 0; i < blobs.length; i++) {
      const [bx, by, span, r, g, b, a] = blobs[i];
      const ox = Math.sin(t * 0.18 + i * 1.3) * 70;
      const oy = Math.cos(t * 0.14 + i * 0.9) * 48;
      const rr = Math.min(w, h) * span;
      const gdt = ctx.createRadialGradient(bx + ox, by + oy, 0, bx + ox, by + oy, rr);
      gdt.addColorStop(0, `rgba(${r},${g},${b},${a})`);
      gdt.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gdt;
      ctx.fillRect(bx + ox - rr, by + oy - rr, rr * 2, rr * 2);
    }
  };

  const drawRings = (cx: number, cy: number, t: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1.7, 0.52);
    for (let i = 0; i < 5; i++) {
      const cycle = 520;
      const r = ((t * 52 + i * 104) % cycle) + 30;
      const fade = Math.max(0, 1 - r / cycle);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34,211,238,${(0.22 * fade).toFixed(3)})`;
      ctx.lineWidth = 1.4 + fade * 1.8;
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawWave = (cx: number, cy: number, t: number) => {
    const pts: { x: number; y: number; d: number }[] = [];
    for (let j = 0; j < waveRows; j++) {
      for (let i = 0; i < waveCols; i++) {
        const u = i / (waveCols - 1);
        const v = j / (waveRows - 1);
        const wx = (u - 0.5) * 2100;
        const wz = 240 + v * 1680;
        const wy =
          Math.sin(u * 4.6 + t * 0.85) * 86 +
          Math.cos(v * 3.2 + t * 0.62) * 64 +
          Math.sin((u + v) * 2.4 + t * 0.4) * 28 -
          30;
        const scale = focal / wz;
        pts.push({
          x: cx + wx * scale,
          y: cy + wy * scale,
          d: 1 - v,
        });
      }
    }

    ctx.lineWidth = 0.85;
    for (let j = 0; j < waveRows; j++) {
      for (let i = 0; i < waveCols; i++) {
        const idx = j * waveCols + i;
        const p = pts[idx];
        const a = 0.08 + p.d * 0.28;
        if (i < waveCols - 1) {
          const q = pts[idx + 1];
          ctx.strokeStyle = `rgba(34,211,238,${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
        if (j < waveRows - 1) {
          const q = pts[idx + waveCols];
          ctx.strokeStyle = `rgba(96,165,250,${(a * 0.85).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }

    for (const p of pts) {
      const radius = 1.1 + p.d * 2.1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(165,243,252,${(0.28 + p.d * 0.55).toFixed(3)})`;
      ctx.fill();
    }
  };

  const drawBokeh = (t: number, advance: boolean) => {
    for (const o of orbs) {
      if (advance) {
        o.x += o.vx;
        o.y += o.vy + Math.sin(t * 0.4 + o.phase) * 0.12;
        if (o.x < -o.r) o.x = w + o.r;
        if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r;
        if (o.y > h + o.r) o.y = -o.r;
      }
      const pulse = 0.72 + Math.sin(t * 0.7 + o.phase) * 0.28;
      const [r, g, b] = BOKEH[o.tint];
      const rr = o.r * pulse;
      const gdt = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, rr);
      gdt.addColorStop(0, `rgba(${r},${g},${b},${(0.22 * pulse).toFixed(3)})`);
      gdt.addColorStop(0.42, `rgba(${r},${g},${b},0.08)`);
      gdt.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gdt;
      ctx.fillRect(o.x - rr, o.y - rr, rr * 2, rr * 2);
    }
  };

  const drawStreaks = (advance: boolean) => {
    for (const s of streaks) {
      if (advance) {
        s.x -= s.speed * 0.45;
        s.y += s.speed;
        s.life += 1;
        if (s.life > s.max || s.y > h + 80) Object.assign(s, spawnStreak());
      }
      const fade = Math.sin((s.life / s.max) * Math.PI);
      ctx.strokeStyle = `rgba(165,243,252,${(0.45 * fade).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.len * 0.42, s.y - s.len);
      ctx.stroke();
    }
  };

  let gridOffset = 0;
  let pulse = 0;
  let sweepZ = FAR;
  let heroMotion = true;

  const draw = (advance: boolean, now = 0) => {
    const t = now * 0.001;
    ctx.clearRect(0, 0, w, h);

    if (heroMotion) {
      panX += (targetX - panX) * 0.07;
      panY += (targetY - panY) * 0.07;
    } else {
      panX += (0 - panX) * 0.08;
      panY += (0 - panY) * 0.08;
    }
    const cx = w / 2 + panX;
    const cy = h * HORIZON + panY;

    drawNebula(cx, cy, t);

    const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.42);
    bloom.addColorStop(0, "rgba(34,211,238,0.16)");
    bloom.addColorStop(0.45, "rgba(124,92,255,0.07)");
    bloom.addColorStop(1, "rgba(2,12,20,0)");
    ctx.fillStyle = bloom;
    ctx.fillRect(cx - w, cy - h, w * 2, h * 2);

    // 底图贯穿整页：滚动离开首屏后仍保持空间网格 / 波浪动效，仅放慢推进以省性能
    const pace = heroMotion ? 1 : 0.35;
    if (advance) {
      gridOffset -= 1.7 * pace;
      if (gridOffset <= -SPACING) gridOffset += SPACING;
      pulse += 0.024 * pace;
      sweepZ -= 46 * pace;
      if (sweepZ < -900) sweepZ = FAR;
    }

    gridLines(cx, cy, FLOOR_Y, gridOffset, heroMotion ? 0.42 : 0.28, sweepZ);
    gridLines(cx, cy, CEIL_Y, gridOffset, heroMotion ? 0.2 : 0.12, sweepZ);
    drawRings(cx, cy, t);
    drawWave(cx, cy, t);

    const near: { x: number; y: number; a: number }[] = [];
    for (const p of particles) {
      if (advance) {
        p.z -= 2.8 * pace;
        if (p.z < 60) Object.assign(p, spawnParticle());
      }
      const scale = focal / p.z;
      const sx = cx + p.x * scale;
      const sy = cy + p.y * scale;
      if (sx < -60 || sx > w + 60 || sy < -60 || sy > h + 60) continue;

      const depth = 1 - p.z / (DEPTH + 260);
      const radius = p.size * (0.5 + depth * 2.8);
      const alpha = Math.min(1, 0.24 + depth * 1.05);
      const [r, g, b] = TINTS[p.tint];

      if (depth > 0.78) {
        const rr = radius * 5;
        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr);
        halo.addColorStop(0, `rgba(${r},${g},${b},0.5)`);
        halo.addColorStop(0.4, `rgba(${r},${g},${b},0.13)`);
        halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = halo;
        ctx.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
      }

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
      ctx.fill();

      if (depth > 0.5) near.push({ x: sx, y: sy, a: alpha });
    }

    ctx.lineWidth = 0.9;
    for (let i = 0; i < near.length; i++) {
      for (let j = i + 1; j < near.length; j++) {
        const dx = near[i].x - near[j].x;
        const dy = near[i].y - near[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 28900) continue;
        const a = (1 - Math.sqrt(d2) / 170) * 0.55 * Math.min(near[i].a, near[j].a);
        if (a < 0.015) continue;
        ctx.strokeStyle = `rgba(8,145,178,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(near[i].x, near[i].y);
        ctx.lineTo(near[j].x, near[j].y);
        ctx.stroke();
      }
    }

    for (let i = 0; i < 3; i++) {
      const phase = pulse + i * 2.1;
      const nx = cx + Math.cos(phase * 0.33 + i) * (w * 0.27);
      const ny = cy + Math.sin(phase * 0.24 + i * 1.7) * (h * 0.2);
      const rr = 48 + Math.sin(phase) * 13;
      const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, rr);
      glow.addColorStop(0, "rgba(165,243,252,0.46)");
      glow.addColorStop(0.32, "rgba(34,211,238,0.18)");
      glow.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(nx - rr, ny - rr, rr * 2, rr * 2);
      ctx.beginPath();
      ctx.arc(nx, ny, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245,243,255,0.95)";
      ctx.fill();
    }

    drawBokeh(t, advance);
    drawStreaks(advance && heroMotion);
  };

  if (reduced) {
    draw(false, 0);
    const onResizeStatic = () => {
      resize();
      draw(false, 0);
    };
    window.addEventListener("resize", onResizeStatic);
    return () => window.removeEventListener("resize", onResizeStatic);
  }

  const heroInView = () => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return true;
    return hero.getBoundingClientRect().bottom > 112;
  };

  const FRAME = 1000 / 28;
  let raf = 0;
  let last = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME) return;
    last = now;
    draw(true, now);
  };
  const play = () => {
    if (document.hidden) return;
    cancelAnimationFrame(raf);
    last = 0;
    raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const onVisibility = () => {
    if (document.hidden) pause();
    else play();
  };

  const syncView = () => {
    heroMotion = heroInView();
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("scroll", syncView, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  heroMotion = heroInView();
  play();

  return () => {
    pause();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("scroll", syncView);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
