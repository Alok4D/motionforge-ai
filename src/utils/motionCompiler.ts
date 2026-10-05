/**
 * Safely compiles dynamic JavaScript motion animation code into an executable render function
 */
export function compileMotionCode(code: string): Function {
  if (!code || !code.trim()) {
    throw new Error('Empty animation code provided.');
  }

  let cleaned = code.trim();

  // Strip markdown backticks if any
  const codeBlockMatch = cleaned.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Strategy 1: Standard return function(...) execution
  try {
    const fn = new Function(cleaned)();
    if (typeof fn === 'function') return fn;
  } catch (e) {
    // Continue to next strategies
  }

  // Strategy 2: If code starts with `function` or `(ctx, ...)`
  try {
    const fn = new Function(`return (${cleaned})`)();
    if (typeof fn === 'function') return fn;
  } catch (e) {
    // Continue
  }

  // Strategy 3: If code declares named functions like `render`, `draw`, `animate`, `main`
  try {
    const wrapped = `
      ${cleaned};
      if (typeof render === 'function') return render;
      if (typeof draw === 'function') return draw;
      if (typeof animate === 'function') return animate;
      if (typeof main === 'function') return main;
      if (typeof anim === 'function') return anim;
    `;
    const fn = new Function(wrapped)();
    if (typeof fn === 'function') return fn;
  } catch (e) {
    // Continue
  }

  // Strategy 4: Wrap the entire block directly as the inner canvas render body
  try {
    const wrappedBody = `
      return function(ctx, width, height, time, colorSettings) {
        ${cleaned}
      };
    `;
    const fn = new Function(wrappedBody)();
    if (typeof fn === 'function') return fn;
  } catch (e) {
    // Continue
  }

  throw new Error('Could not parse a valid canvas rendering function from the provided code.');
}
