"use client";

// Adapted from the user-supplied 21st.dev flow-field shader.
// Retains its noise and domain warp; removes unused editor and cursor effects.
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const VERT = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAG = `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
float hash21(vec2 p) {
  p = mod(p, 31.0);
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1., 0.)), u.x),
    mix(hash21(i + vec2(0., 1.)), hash21(i + vec2(1., 1.)), u.x), u.y);
}
float fbm(vec2 p) {
  float value = 0., amplitude = .5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(17., 9.2);
    amplitude *= .5;
  }
  return value;
}
void main() {
  vec2 p = (gl_FragCoord.xy - .5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  p *= 1.48;
  float angle = 5.0091;
  p = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p;
  p += vec2(-.02, .15) + .06 * vec2(sin(u_time * .31), cos(u_time * .23));
  p += .24 * (vec2(fbm(p * 2.112 + 9.), fbm(p * 2.112 + vec2(5.2, 1.3))) - .5);
  float a = fbm(p * 2. + 9.) * 6.2831;
  float v = fbm(p * 3. + vec2(cos(a), sin(a)) * .78 + u_time * .12);
  // Black smoke with soft charcoal highlights.
  vec3 color = mix(vec3(.015), vec3(.18), smoothstep(.18, .62, v));
  color = mix(color, vec3(.36), smoothstep(.56, .85, v));
  gl_FragColor = vec4(color, 1.);
}`;

export function ShaderBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return; // The section's lavender gradient remains as a fallback.
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERT);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram()!;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return; }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, 'u_resolution');
    const time = gl.getUniformLocation(program, 'u_time');
    let frame = 0;
    let inView = false;
    let lost = false;
    let lastDraw = -Infinity;
    let elapsed = 0;

    const draw = (now: number) => {
      frame = 0;
      if (!inView || document.hidden || lost) return;
      if (now - lastDraw >= 1000 / 24) {
        if (Number.isFinite(lastDraw)) elapsed += Math.min((now - lastDraw) / 1000, .1);
        lastDraw = now;
        gl.uniform2f(resolution, canvas.width, canvas.height);
        gl.uniform1f(time, reduced ? 0 : elapsed * -.45);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (inView && !document.hidden && !lost && !frame) frame = requestAnimationFrame(draw);
    };
    const suspend = () => { cancelAnimationFrame(frame); frame = 0; lastDraw = -Infinity; };
    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const scale = Math.min(1, Math.sqrt(450_000 / (width * height)));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      lastDraw = -Infinity;
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedule(); else suspend();
    });
    const resizeObserver = new ResizeObserver(resize);
    const visibility = () => { if (document.hidden) suspend(); else schedule(); };
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; canvas.style.opacity = '0'; suspend(); };
    const contextRestored = () => { canvas.style.opacity = ''; setGeneration(value => value + 1); };
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('webglcontextlost', contextLost);
    canvas.addEventListener('webglcontextrestored', contextRestored);
    resize();
    return () => {
      suspend();
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [reduced, generation]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
