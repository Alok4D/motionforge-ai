import { AnimationTemplate } from '../types/motion.types';

export const DEFAULT_TEMPLATES: AnimationTemplate[] = [
  {
    id: 'motion-hero-brand-loop',
    title: 'Motion Hero: Official 4K Kinetic Brand Loop',
    description: 'Official Motion Hero brand emblem with 3D cyber grid, glowing squircle laser scanner, quantum energy rings, and cinematic particle stream.',
    type: 'CANVAS',
    style: '3D Cinematic',
    aspectRatio: '16:9',
    prompt: 'Official Motion Hero brand emblem with 3D cyber grid, glowing squircle laser scanner, quantum energy rings, and cinematic particle stream.',
    tags: ['brand', 'quantum', 'rings', 'particles', '3d'],
    code: `// Motion Hero Official 4K Kinetic Brand Loop (Procedural Canvas)
return function(ctx, width, height, time, colorSettings) {
  const cx = width / 2;
  const cy = height / 2;
  
  // Background Fill
  ctx.fillStyle = colorSettings.isGreenScreen ? '#00ff00' : (colorSettings.chromaBgColor || '#05070f');
  ctx.fillRect(0, 0, width, height);

  const t = time * 0.0015;
  const mainColor = colorSettings.elementColor || '#00f0ff';
  const accentColor = colorSettings.gradientEndColor || '#ff0055';

  // Draw Background Starfield / Particle Dust
  for(let i = 0; i < 40; i++) {
    const angle = i * 2.4 + t * 0.2;
    const rad = 150 + (i * 18) % (width * 0.45);
    const px = cx + Math.cos(angle) * rad;
    const py = cy + Math.sin(angle * 1.5) * (rad * 0.5);
    const alpha = 0.3 + 0.4 * Math.sin(t * 3 + i);
    ctx.fillStyle = i % 2 === 0 ? mainColor : accentColor;
    ctx.globalAlpha = alpha * 0.5;
    ctx.beginPath();
    ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // Quantum Energy Orbit Rings
  for (let r = 0; r < 3; r++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * (0.8 - r * 0.3) + r * Math.PI / 3);
    ctx.scale(1, 0.4 + r * 0.15);

    ctx.strokeStyle = r === 0 ? mainColor : (r === 1 ? '#ffcc00' : accentColor);
    ctx.lineWidth = 3.5;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.arc(0, 0, 260 + r * 50, 0, Math.PI * 2);
    ctx.stroke();

    // Orbital Spark Dots
    for(let k = 0; k < 3; k++) {
      const dotAngle = t * 2 + (k * Math.PI * 2 / 3) + r;
      const dx = Math.cos(dotAngle) * (260 + r * 50);
      const dy = Math.sin(dotAngle) * (260 + r * 50);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(dx, dy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Central Emblem Glow Box / Squircle
  ctx.save();
  ctx.translate(cx, cy);
  const pulse = 1 + 0.04 * Math.sin(t * 4);
  ctx.scale(pulse, pulse);

  // Outer Squircle Border Glow
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 24;
  
  const boxW = 180;
  const boxH = 90;
  const radius = 18;
  ctx.beginPath();
  ctx.roundRect(-boxW/2, -boxH/2, boxW, boxH, radius);
  ctx.fillStyle = 'rgba(10, 15, 30, 0.85)';
  ctx.fill();
  ctx.stroke();

  // Logo Icon "M" inside Box
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10;
  ctx.fillText("MOTION HERO", 0, -6);

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = mainColor;
  ctx.fillText("INTERACTIVE 4K STUDIO", 0, 22);

  ctx.restore();
};`
  },
  {
    id: 'holographic-data-torus',
    title: 'Holographic Cyber Torus Matrix',
    description: 'A high-end 3D procedural canvas motion graphic featuring glowing blue cyberrings and particle rings forming a holographic data torus matrix spinning seamlessly at 60 FPS on a pure black background.',
    type: 'CANVAS',
    style: '3D Cinematic',
    aspectRatio: '16:9',
    prompt: 'A high-end 3D procedural canvas motion graphic featuring glowing blue cyberrings and particle rings forming a holographic data torus matrix spinning seamlessly at 60 FPS on a pure black background.',
    tags: ['torus', 'holographic', 'matrix', '3d', 'cyber'],
    code: `// Holographic Cyber Torus Matrix
return function(ctx, width, height, time, colorSettings) {
  const cx = width / 2;
  const cy = height / 2;
  
  ctx.fillStyle = colorSettings.isGreenScreen ? '#00ff00' : (colorSettings.chromaBgColor || '#000000');
  ctx.fillRect(0, 0, width, height);

  const t = time * 0.002;
  const coreColor = colorSettings.elementColor || '#00d4ff';
  
  const rings = 24;
  const particlesPerRing = 48;
  const R = 220; // Major radius
  const r = 90;  // Minor radius

  ctx.shadowColor = coreColor;
  ctx.shadowBlur = 10;

  for (let i = 0; i < rings; i++) {
    const u = (i / rings) * Math.PI * 2 + t * 0.5;
    for (let j = 0; j < particlesPerRing; j++) {
      const v = (j / particlesPerRing) * Math.PI * 2 + t;
      
      // 3D Torus math coordinates
      let x = (R + r * Math.cos(v)) * Math.cos(u);
      let y = (R + r * Math.cos(v)) * Math.sin(u);
      let z = r * Math.sin(v);

      // 3D Rotation along X and Y
      const rotX = 0.85;
      const rotY = t * 0.3;
      
      // Rotate Y
      let x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
      let z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
      
      // Rotate X
      let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);

      // Perspective Projection
      const fov = 600;
      const scale = fov / (fov + z2);
      const px = cx + x1 * scale;
      const py = cy + y2 * scale;
      const size = Math.max(1, (scale * 2.8));
      const alpha = Math.max(0.15, Math.min(1.0, (z2 + r) / (2 * r) + 0.3));

      ctx.fillStyle = coreColor;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1.0;
};`
  },
  {
    id: 'cyber-neon-tree-loop',
    title: 'Neon Binary Tree Network Pulse',
    description: 'Perfect procedural symmetric tree structure formed by branching vertical and horizontal neon lines with glowing data packet nodes pulsating across high-contrast backdrop.',
    type: 'CANVAS',
    style: '2D Vector',
    aspectRatio: '16:9',
    prompt: 'Perfect procedural symmetric tree structure formed by branching vertical and horizontal neon lines with glowing data packet nodes pulsating across high-contrast backdrop.',
    tags: ['tree', 'binary', 'network', 'circuit', 'neon'],
    code: `// Neon Binary Tree Network Pulse
return function(ctx, width, height, time, colorSettings) {
  const cx = width / 2;
  const cy = height / 2 + 120;
  
  ctx.fillStyle = colorSettings.isGreenScreen ? '#00ff00' : (colorSettings.chromaBgColor || '#030712');
  ctx.fillRect(0, 0, width, height);

  const t = time * 0.0025;
  const neonColor = colorSettings.elementColor || '#00f0ff';
  const nodeColor = colorSettings.gradientEndColor || '#38bdf8';

  ctx.strokeStyle = neonColor;
  ctx.lineWidth = 3.5;
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 14;

  function drawBranch(x, y, len, angle, depth) {
    if (depth <= 0) return;
    
    const sway = Math.sin(t + depth * 0.8) * 0.05;
    const endX = x + Math.sin(angle + sway) * len;
    const endY = y - Math.cos(angle + sway) * len;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Node Spark
    const pulse = 4 + 2 * Math.sin(t * 3 + depth);
    ctx.fillStyle = nodeColor;
    ctx.beginPath();
    ctx.arc(endX, endY, pulse, 0, Math.PI * 2);
    ctx.fill();

    const nextLen = len * 0.75;
    drawBranch(endX, endY, nextLen, angle - 0.55, depth - 1);
    drawBranch(endX, endY, nextLen, angle + 0.55, depth - 1);
  }

  // Trunk
  drawBranch(cx, cy, 140, 0, 5);
};`
  },
  {
    id: 'cosmic-fireworks-starburst',
    title: 'Golden Firework Starburst Particle Fountain',
    description: 'Ultra-luxurious 4K 60FPS golden particle sparks exploding upwards into midnight cosmos with glowing trailing embers and celebratory festive flair.',
    type: 'CANVAS',
    style: '3D Cinematic',
    aspectRatio: '16:9',
    prompt: 'Ultra-luxurious 4K 60FPS golden particle sparks exploding upwards into midnight cosmos with glowing trailing embers and celebratory festive flair.',
    tags: ['fireworks', 'gold', 'celebration', 'particles', 'new year'],
    code: `// Golden Firework Starburst Particle Fountain
return function(ctx, width, height, time, colorSettings) {
  ctx.fillStyle = colorSettings.isGreenScreen ? '#00ff00' : (colorSettings.chromaBgColor || '#000000');
  ctx.fillRect(0, 0, width, height);

  const t = time * 0.001;
  const gold = colorSettings.elementColor || '#ffd700';

  const bursts = [
    { x: width * 0.3, y: height * 0.35, seed: 0 },
    { x: width * 0.7, y: height * 0.3, seed: 1.5 },
    { x: width * 0.5, y: height * 0.22, seed: 3.0 }
  ];

  bursts.forEach(burst => {
    const cycle = (t + burst.seed) % 2.5;
    const progress = cycle / 2.5;
    
    if (progress < 0.8) {
      const count = 72;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = 180 * Math.pow(progress, 0.6);
        const px = burst.x + Math.cos(angle) * speed;
        const py = burst.y + Math.sin(angle) * speed + (progress * progress * 80); // gravity
        const alpha = Math.max(0, 1 - progress * 1.3);

        ctx.fillStyle = gold;
        ctx.shadowColor = gold;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  ctx.globalAlpha = 1.0;
};`
  }
];
