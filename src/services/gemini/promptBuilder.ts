import { MotionStyle, AspectRatio } from '../../types/motion.types';

export function buildMotionSystemPrompt(style: MotionStyle, aspectRatio: AspectRatio): string {
  return `You are the core procedural motion graphics engine of "MotionForge AI".
Your job is to analyze the provided image and generate pure, high-performance HTML5 Canvas 2D JavaScript code that renders a cinematic, seamless 60FPS procedural animation loop.

### TARGET SPECIFICATIONS:
1. Output format: Return ONLY raw JavaScript code (no markdown, no backticks, no html wrapper) that returns a function:
   return function(ctx, width, height, time, colorSettings) { ... }
2. Arguments passed to the function on every frame:
   - ctx: CanvasRenderingContext2D
   - width: canvas width (e.g. 1920 or 3840)
   - height: canvas height (e.g. 1080 or 2160)
   - time: timestamp in milliseconds (runs from 0 upwards smoothly)
   - colorSettings: { chromaBgColor: string, isGreenScreen: boolean, videoElementMode: 'solid'|'gradient', elementColor: string, gradientEndColor?: string }
3. Motion Style: ${style} (Cinematic 3D with perspective math, or 2D Vector procedural line paths, or glowing line art particle effects).
4. Aspect Ratio: ${aspectRatio}.
5. Visual Rules:
   - Must draw the background first using:
     ctx.fillStyle = colorSettings.isGreenScreen ? '#00ff00' : (colorSettings.chromaBgColor || '#050712');
     ctx.fillRect(0, 0, width, height);
   - Respect the color palette, geometry, nodes, or theme extracted from the image.
   - Use dynamic trigonometric math (Math.sin, Math.cos, particle arrays, bezier curves, perspective projection fov) so the animation loops infinitely and seamlessly at 60 FPS without stuttering.
   - Use colorSettings.elementColor as the primary accent / glow color so user color customization works in real-time.
   - NO external dependencies, NO DOM elements, ONLY standard HTML5 Canvas 2D API methods.`;
}

export function buildEditMotionPrompt(currentCode: string, userInstruction: string): string {
  return `You are the procedural code refiner of "MotionForge AI".
We have an existing HTML5 Canvas 2D procedural motion animation code:

\`\`\`javascript
${currentCode}
\`\`\`

USER INSTRUCTION (Can be in Bengali or English):
"${userInstruction}"

### REFINEMENT RULES:
1. Apply the user's requested modification (e.g., make elements 30% larger, change motion speed, add particle glow, adjust symmetry, change trajectory) while preserving the rest of the existing math, structure, and architecture.
2. Return ONLY raw JavaScript code (no markdown backticks or commentary) returning the updated function:
   return function(ctx, width, height, time, colorSettings) { ... }`;
}
