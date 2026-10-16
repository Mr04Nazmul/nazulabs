"use client";

import * as React from "react";

/** Lycoris Specimen by Kedhareswer. Procedural WebGL; scroll is the timeline. */
export type LycorisLink = { label: string; href?: string };
export type LycorisSpecimenProps = {
  name?: string;
  studio?: string;
  year?: string;
  description?: string;
  specs?: string[];
  tagline?: { text: string; small?: boolean }[];
  multilingual?: string;
  ligatureWord?: string;
  links?: [LycorisLink, LycorisLink];
  fontFamily?: string;
  fontHref?: string | null;
  ink?: string;
  bone?: string;
  crimson?: string;
  height?: string;
  sceneScroll?: number;
  florets?: number;
  seed?: number;
  alive?: boolean;
  className?: string;
};

type V3 = [number, number, number];
type Curve = {
  pts: V3[];
  kind: 0 | 1 | 2;
  w: number;
  t: number;
  lat: V3;
  twist: number;
  bulb: boolean;
  phase: number;
  stagger: number;
  base: V3;
};
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: V3): V3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const HEART: V3 = [0, 0.25, 0];
const buildCurves = (florets: number, seed: number) => {
  const F = Math.max(3, Math.min(8, Math.round(florets)));
  const r = rng(seed);
  const curves: Curve[] = [];
  const up: V3 = [0, 1, 0];
  for (let i = 0; i < F; i++) {
    const phi = (i / F) * Math.PI * 2 + (r() - 0.5) * 0.3;
    const tilt = 1.05 + (r() - 0.5) * 0.25;
    const radial: V3 = [Math.cos(phi), 0, Math.sin(phi)];
    const u = norm([
      Math.sin(tilt) * radial[0],
      Math.cos(tilt),
      Math.sin(tilt) * radial[2],
    ]);
    const base: V3 = [radial[0] * 0.13, 0.07, radial[2] * 0.13];
    const e1 = norm(cross(u, Math.abs(u[1]) > 0.9 ? [1, 0, 0] : up));
    const e2 = cross(u, e1);
    const common = { base, stagger: i / F };
    const ped: V3[] = [];
    for (let k = 0; k <= 10; k++) {
      const s = k / 10;
      ped.push([
        radial[0] * 0.13 * s,
        0.07 * Math.sin((s * Math.PI) / 2),
        radial[2] * 0.13 * s,
      ]);
    }
    curves.push({
      pts: ped,
      kind: 2,
      w: 0.022,
      t: 0,
      lat: e1,
      twist: 0,
      bulb: false,
      phase: 0,
      ...common,
    });
    for (let j = 0; j < 6; j++) {
      const th = (j / 6) * Math.PI * 2 + i * 0.7 + (r() - 0.5) * 0.35;
      const d = add(mul(e1, Math.cos(th)), mul(e2, Math.sin(th)));
      const lat = norm(cross(d, u));
      const phase = r() * Math.PI * 2;
      const L = 1.35 + r() * 0.3,
        b0 = 0.45 + r() * 0.2,
        b1 = 2.75 + r() * 0.45;
      const pts: V3[] = [base];
      let p = base;
      const steps = 48;
      for (let k = 1; k <= steps; k++) {
        const s = k / steps,
          b = b0 + (b1 - b0) * Math.pow(s, 1.2);
        p = add(
          p,
          mul(add(mul(d, Math.sin(b)), mul(u, Math.cos(b))), L / steps),
        );
        pts.push(p);
      }
      for (let k = 1; k <= steps; k++) {
        const s = k / steps;
        pts[k] = add(
          pts[k],
          mul(lat, Math.sin(s * Math.PI * 2.4 + phase) * 0.05 * s),
        );
      }
      curves.push({
        pts,
        kind: 0,
        w: 0.075 + r() * 0.02,
        t: 0.02,
        lat,
        twist: 0.2 + r() * 0.35,
        bulb: false,
        phase,
        ...common,
      });
      const d2 = add(
        mul(e1, Math.cos(th + 0.52)),
        mul(e2, Math.sin(th + 0.52)),
      );
      const dh = norm([d2[0], 0, d2[2]]);
      const start = norm(add(u, mul(d2, 0.25)));
      const end = norm(
        add(add(mul(radial, 0.85), mul(dh, 0.5)), [0, -0.95, 0]),
      );
      const Ls = 1.75 + r() * 0.45,
        sp: V3[] = [base];
      p = base;
      for (let k = 1; k <= 44; k++) {
        const m = Math.pow(k / 44, 1.15);
        p = add(p, mul(norm(add(mul(start, 1 - m), mul(end, m))), Ls / 44));
        sp.push(p);
      }
      curves.push({
        pts: sp,
        kind: 1,
        w: 0.012,
        t: 0,
        lat,
        twist: 0,
        bulb: true,
        phase: phase + 1.3,
        ...common,
      });
    }
    {
      const end = norm(add(mul(radial, 0.9), [0, -0.35, 0]));
      const sp: V3[] = [base];
      let p = base;
      const Ls = 2.2 + r() * 0.3;
      for (let k = 1; k <= 44; k++) {
        const s = k / 44;
        p = add(p, mul(norm(add(mul(u, 1 - s), mul(end, s))), Ls / 44));
        sp.push(p);
      }
      curves.push({
        pts: sp,
        kind: 1,
        w: 0.009,
        t: 0,
        lat: e1,
        twist: 0,
        bulb: false,
        phase: r() * 6,
        ...common,
      });
    }
  }
  const stem: V3[] = [];
  for (let k = 0; k <= 40; k++) {
    const s = k / 40;
    stem.push([
      Math.sin(s * 2.2) * 0.07,
      0.04 - s * 4.6,
      Math.sin(s * 1.3) * 0.03,
    ]);
  }
  curves.push({
    pts: stem,
    kind: 2,
    w: 0.05,
    t: 0,
    lat: [1, 0, 0],
    twist: 0,
    bulb: false,
    phase: 0,
    stagger: 0,
    base: [0, 0, 0],
  });
  let radius = 0;
  for (const c of curves) {
    if (c.kind === 2) continue;
    for (const q of c.pts)
      radius = Math.max(
        radius,
        Math.hypot(q[0] - HEART[0], q[1] - HEART[1], q[2] - HEART[2]),
      );
  }
  return { curves, radius };
};

const STRIDE = 13;
const buildMesh = (curves: Curve[]) => {
  const v: number[] = [],
    idx: number[] = [];
  let count = 0;
  const push = (p: V3, n: V3, s: number, c: Curve) => {
    v.push(...p, ...n, s, c.phase, c.kind, c.stagger, ...c.base);
    return count++;
  };
  const tangent = (pts: V3[], i: number) =>
    norm(sub(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)]));
  for (const c of curves) {
    const n = c.pts.length;
    if (c.kind === 0) {
      const rings: number[][] = [];
      let first: V3[] = [],
        last: V3[] = [],
        T0: V3 = [0, 1, 0],
        T1: V3 = [0, 1, 0];
      for (let i = 0; i < n; i++) {
        const s = i / (n - 1),
          T = tangent(c.pts, i);
        let N = norm(cross(T, c.lat)),
          W = cross(N, T);
        const a = c.twist * Math.sin(Math.PI * s),
          ca = Math.cos(a),
          sa = Math.sin(a);
        const W2 = add(mul(W, ca), mul(N, sa));
        N = sub(mul(N, ca), mul(W, sa));
        W = W2;
        const hw =
          c.w *
          (0.42 +
            0.58 *
              Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + s * 0.9)), 0.6)) *
          (1 + 0.1 * Math.sin(s * 34 + c.phase));
        const p = c.pts[i];
        const k0 = add(add(p, mul(W, hw)), mul(N, c.t)),
          k1 = add(sub(p, mul(W, hw)), mul(N, c.t));
        const k2 = sub(sub(p, mul(W, hw)), mul(N, c.t)),
          k3 = sub(add(p, mul(W, hw)), mul(N, c.t));
        const mW = mul(W, -1),
          mN = mul(N, -1);
        rings.push([
          push(k0, N, s, c),
          push(k1, N, s, c),
          push(k1, mW, s, c),
          push(k2, mW, s, c),
          push(k2, mN, s, c),
          push(k3, mN, s, c),
          push(k3, W, s, c),
          push(k0, W, s, c),
        ]);
        if (i === 0) {
          first = [k0, k1, k2, k3];
          T0 = T;
        }
        if (i === n - 1) {
          last = [k0, k1, k2, k3];
          T1 = T;
        }
      }
      for (let i = 0; i < n - 1; i++) {
        const a = rings[i],
          b = rings[i + 1];
        for (let f = 0; f < 4; f++) {
          const x = f * 2;
          idx.push(a[x], a[x + 1], b[x], a[x + 1], b[x + 1], b[x]);
        }
      }
      const cap = (q: V3[], nrm: V3, s: number) => {
        const o = q.map((p) => push(p, nrm, s, c));
        idx.push(o[0], o[1], o[2], o[0], o[2], o[3]);
      };
      cap(first, mul(T0, -1), 0);
      cap(last, T1, 1);
    } else {
      const seg = c.kind === 2 ? 10 : 6;
      let N = norm(cross(tangent(c.pts, 0), c.kind === 2 ? [0, 0, 1] : c.lat));
      const rings: number[] = [];
      for (let i = 0; i < n; i++) {
        const s = i / (n - 1),
          T = tangent(c.pts, i);
        N = norm(sub(N, mul(T, dot(N, T))));
        const B = cross(T, N);
        let rad = c.w * (c.kind === 1 ? 1 - 0.35 * s : 1);
        if (c.bulb && s > 0.9)
          rad =
            c.w * (0.65 + 2.1 * Math.sin(((s - 0.9) / 0.1) * Math.PI * 0.92));
        if (c.kind === 1 && i === n - 1) rad *= 0.3;
        rings.push(count);
        for (let k = 0; k <= seg; k++) {
          const a = (k / seg) * Math.PI * 2,
            nr = add(mul(N, Math.cos(a)), mul(B, Math.sin(a)));
          push(add(c.pts[i], mul(nr, rad)), nr, s, c);
        }
      }
      for (let i = 0; i < n - 1; i++)
        for (let k = 0; k < seg; k++) {
          const a = rings[i] + k,
            b = rings[i + 1] + k;
          idx.push(a, a + 1, b, a + 1, b + 1, b);
        }
    }
  }
  return {
    data: new Float32Array(v),
    index: new Uint16Array(idx),
    vertices: count,
  };
};
const clamp01 = (x: number) => (x <= 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const progressFrom = (top: number, height: number, viewport: number) =>
  height - viewport <= 0 ? 0 : clamp01(-top / (height - viewport));
const sceneCoord = (p: number, n: number, hold: number) => {
  if (n <= 1) return 0;
  const t = clamp01(p) * (n - 1),
    i = Math.min(Math.floor(t), n - 2),
    h = hold / 2;
  return i + easeInOut(clamp01((t - i - h) / (1 - 2 * h)));
};
const reveal = (coord: number, scene: number, delay: number) => {
  const d = coord - scene,
    lag = d < 0 ? delay : 1 - delay;
  return clamp01((0.6 - Math.abs(d) - lag * 0.2) / 0.25);
};
type Key = {
  spin: number;
  el: number;
  size: number;
  ox: number;
  oy: number;
  stem: number;
};
const KEYS: Key[] = [
  { spin: 0.2, el: 9, size: 0.86, ox: 0, oy: 0.3, stem: 1 },
  { spin: 1.4, el: 88, size: 0.58, ox: 0, oy: 0, stem: 0 },
  { spin: 2.3, el: 12, size: 0.27, ox: 0, oy: 0.4, stem: 0.3 },
  { spin: 3.1, el: -30, size: 0.86, ox: 0, oy: -0.34, stem: 0.06 },
  { spin: 4.1, el: 16, size: 1.02, ox: 0.66, oy: 0.2, stem: 1 },
  { spin: 5, el: -74, size: 0.86, ox: 0, oy: 1.02, stem: 0.04 },
];
const KEYS_TALL: Partial<Key>[] = [
  { size: 0.9, oy: 0.36 },
  { size: 0.56 },
  { size: 0.34, oy: 0.44 },
  { size: 0.95, oy: -0.2 },
  { size: 0.86, ox: 0.5, oy: 0.46 },
  { size: 0.96, oy: 1 },
];
const SCENES = KEYS.length,
  HOLD = 0.34,
  NAV = ["Cover", "Crown", "Specimen", "Fancy", "Bloom", "Ligatures"];
const keyAt = (coord: number, tall: boolean): Key => {
  const i = Math.max(0, Math.min(SCENES - 1, Math.floor(coord))),
    j = Math.min(SCENES - 1, i + 1),
    f = coord - i;
  const a = { ...KEYS[i], ...(tall ? KEYS_TALL[i] : {}) },
    b = { ...KEYS[j], ...(tall ? KEYS_TALL[j] : {}) };
  const l = (x: number, y: number) => x + (y - x) * f;
  return {
    spin: l(a.spin, b.spin),
    el: l(a.el, b.el),
    size: l(a.size, b.size),
    ox: l(a.ox, b.ox),
    oy: l(a.oy, b.oy),
    stem: l(a.stem, b.stem),
  };
};
type M4 = Float32Array;
const perspective = (
  fovy: number,
  aspect: number,
  near: number,
  far: number,
): M4 => {
  const f = 1 / Math.tan(fovy / 2),
    m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
};
const lookAt = (eye: V3, at: V3): M4 => {
  const z = norm(sub(eye, at)),
    x = norm(cross([0, 1, 0], z)),
    y = cross(z, x),
    m = new Float32Array(16);
  m[0] = x[0];
  m[4] = x[1];
  m[8] = x[2];
  m[1] = y[0];
  m[5] = y[1];
  m[9] = y[2];
  m[2] = z[0];
  m[6] = z[1];
  m[10] = z[2];
  m[12] = -dot(x, eye);
  m[13] = -dot(y, eye);
  m[14] = -dot(z, eye);
  m[15] = 1;
  return m;
};
const multiply = (a: M4, b: M4): M4 => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
  return o;
};
const rotY = (t: number): M4 => {
  const c = Math.cos(t),
    s = Math.sin(t);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
};
const rotX = (t: number): M4 => {
  const c = Math.cos(t),
    s = Math.sin(t);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
};
const hexToLinear = (hex: string): V3 => {
  let h = hex.replace("#", "").trim();
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return [0.8, 0.02, 0.03];
  const ch = (v: number) => Math.pow(v / 255, 2.2);
  return [ch((n >> 16) & 255), ch((n >> 8) & 255), ch(n & 255)];
};
const VERT = `
attribute vec3 a_pos;
attribute vec3 a_nrm;
attribute vec4 a_aux;
attribute vec3 a_base;
uniform mat4 u_vp;
uniform mat4 u_model;
uniform vec2 u_offset;
uniform float u_time;
uniform float u_bloom;
uniform float u_sway;
uniform float u_stem;
varying vec3 v_n;
varying vec3 v_w;
varying float v_s;
void main() {
  vec3 p = a_pos;
  float k = a_aux.z;
  if (k < 1.5) {
    float g = clamp(u_bloom * 1.6 - a_aux.w * 0.6, 0.0, 1.0);
    g = 1.0 - pow(1.0 - g, 3.0);
    p = a_base + (p - a_base) * g;
    float amp = (k < 0.5 ? 0.03 : 0.06) * u_sway * a_aux.x * a_aux.x;
    p += amp * vec3(sin(u_time * 0.9 + a_aux.y), 0.5 * sin(u_time * 1.3 + a_aux.y * 1.7), cos(u_time * 0.7 + a_aux.y * 1.3));
  } else if (p.y < 0.0) { p.y *= u_stem; }
  vec4 w = u_model * vec4(p, 1.0);
  v_w = w.xyz;
  v_n = (u_model * vec4(a_nrm, 0.0)).xyz;
  v_s = a_aux.x;
  gl_Position = u_vp * w;
  gl_Position.xy += u_offset * gl_Position.w;
}
`;
const FRAG = `
precision highp float;
uniform vec3 u_eye;
uniform vec3 u_red;
uniform vec3 u_hot;
uniform float u_alpha;
varying vec3 v_n;
varying vec3 v_w;
varying float v_s;
float studio(vec3 r) {
  float key = pow(max(dot(r, normalize(vec3(-0.45, 0.85, 0.35))), 0.0), 14.0) * 2.6;
  float strip = smoothstep(0.55, 0.8, r.x) * smoothstep(-0.7, 0.3, r.y) * 1.4;
  float rim = smoothstep(0.55, 0.95, -r.z) * smoothstep(-0.2, 0.5, r.y) * 0.9;
  float hz = exp(-abs(r.y - 0.05) * 7.0) * 0.4;
  return key + strip + rim + hz;
}
void main() {
  vec3 n = normalize(v_n);
  vec3 v = normalize(u_eye - v_w);
  if (dot(n, v) < 0.0) n = -n;
  vec3 r = reflect(-v, n);
  float e = studio(r);
  float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  float dif = max(dot(n, normalize(vec3(-0.3, 0.8, 0.6))), 0.0);
  vec3 col = u_red * (0.04 + 0.22 * dif);
  col += u_red * e * 1.15;
  col += u_hot * pow(e, 3.0) * 0.3;
  col += u_red * fr * 1.1;
  col *= 0.8 + 0.2 * smoothstep(0.0, 0.25, v_s);
  col = col / (1.0 + col);
  col = pow(col, vec3(1.0 / 2.2));
  gl_FragColor = vec4(col * u_alpha, u_alpha);
}
`;
const DISPLAY =
  '"Federant", "Uncial Antiqua", "Cinzel Decorative", "Iowan Old Style", "Palatino Linotype", Georgia, serif';
const SANS =
  '"Helvetica Neue", Helvetica, Arial, ui-sans-serif, system-ui, sans-serif';
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Federant&display=swap";
const UPPER_L = ["ABCD", "EFGHI", "JKLM"],
  UPPER_R = ["NOPQ", "RSTUV", "WXYZ"];
const LOWER_L = ["abcdefg", "hijklm"],
  LOWER_R = ["nopqrst", "uvwxyz"];
const ACCENT_L = ["ÀÁÂÃÄÅÆÇÈ", "ÉÊËÌÍÎÏÑÒ", "ÓÔÕÖØÙÚÛÜ"],
  ACCENT_R = ["àáâãäåæçè", "éêëìíîïñò", "óôõöøùúûü"];
const NUMERALS = ["0", "123", "4567", "888999"];
const PUNCT = "@#$%&*_-+×÷=±/\\|(){}[].,:;'\"“”^~°!?¡¿©®™";
const DEFAULT_SPECS = [
  "Contains 192 glyphs",
  "OTF / TTF / WOFF2",
  "Uppercase & Lowercase",
  "3 ligatures in 1 OpenType feature",
  "Multilingual support",
];
const DEFAULT_TAGLINE = [
  { text: "Bloom" },
  { text: "like", small: true },
  { text: "flowers" },
  { text: "in the sun", small: true },
];
const CSS =
  ".lys-stage{container-type:size;container-name:lys}" +
  ".lys-char{display:inline-block;animation:lys-in 1.3s cubic-bezier(.2,.8,.2,1) both}" +
  "@keyframes lys-in{from{opacity:0;transform:translateY(0.35em) rotate(4deg);filter:blur(10px)}to{opacity:1;transform:none;filter:blur(0)}}" +
  ".lys-g{display:inline-block;transition:color .25s,transform .25s cubic-bezier(.2,.8,.2,1);cursor:default}" +
  ".lys-g:hover{color:var(--lys-red);transform:translateY(-0.08em) scale(1.35)}" +
  ".lys-edit{outline:none;cursor:text;border-bottom:1px dashed transparent;transition:border-color .3s}" +
  ".lys-edit:hover,.lys-edit:focus{border-bottom-color:var(--lys-red)}" +
  ".lys-nav button{display:flex;align-items:center;gap:10px;justify-content:flex-end;background:none;border:0;padding:5px 0;cursor:pointer;color:inherit;font:inherit}" +
  ".lys-nav .lys-tick{display:block;height:1px;width:14px;background:currentColor;opacity:.45;transition:width .4s cubic-bezier(.2,.8,.2,1),opacity .3s,background-color .3s}" +
  ".lys-nav .lys-lab{opacity:0;transform:translateX(6px);transition:opacity .3s,transform .3s}" +
  ".lys-nav button:hover .lys-lab,.lys-nav button:focus-visible .lys-lab{opacity:1;transform:none}" +
  ".lys-nav button[aria-current=step] .lys-tick{width:34px;opacity:1;background:var(--lys-red)}" +
  ".lys-wide{display:block}.lys-tall{display:none}" +
  "@container lys (orientation: portrait){.lys-wide{display:none}.lys-tall{display:block}.lys-bloom{left:7cqw!important;top:auto!important;bottom:13cqh}.lys-fin{flex-direction:column!important;gap:4cqh!important;top:44cqh!important}.lys-spec{grid-template-columns:1fr 1fr!important}.lys-spec-mid{display:none!important}}" +
  "@container lys (max-width: 720px){.lys-hide-sm{display:none!important}}" +
  "@container lys (max-width: 1020px){.lys-hide-md{display:none!important}}" +
  "@media (prefers-reduced-motion: reduce){.lys-char{animation:none}.lys-g{transition:none}}";
type Fx = "rise" | "clip" | "line" | "fade" | "draw";
const sc = (scene: number, fx: Fx = "rise", delay = 0) => ({
  "data-sc": scene,
  "data-fx": fx,
  "data-d": delay,
});

export default function LycorisSpecimen({
  name = "Lycoris",
  studio = "Kedhareswer",
  year = "2026",
  description,
  specs = DEFAULT_SPECS,
  tagline = DEFAULT_TAGLINE,
  multilingual = "Múl·tî·lĺn·güål",
  ligatureWord = "Affluent",
  links = [
    { label: "21ST.DEV / KEDHARESWER", href: "https://21st.dev/@kedhareswer" },
    { label: "GITHUB @ KEDHARESWER", href: "https://github.com/kedhareswer" },
  ],
  fontFamily = DISPLAY,
  fontHref = FONT_HREF,
  ink = "#050505",
  bone = "#b6b095",
  crimson = "#e3131b",
  height = "100svh",
  sceneScroll = 1.2,
  florets = 6,
  seed = 7,
  alive = true,
  className = "",
}: LycorisSpecimenProps) {
  const rootRef = React.useRef<HTMLElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const fallbackRef = React.useRef<HTMLCanvasElement | null>(null);
  const glowRef = React.useRef<HTMLDivElement | null>(null);
  const wordRef = React.useRef<HTMLDivElement | null>(null);
  const grainId = "lys-grain-" + React.useId().replace(/:/g, "");
  const [reduced, setReduced] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [inspect, setInspect] = React.useState<string | null>(null);
  const [liga, setLiga] = React.useState(true);
  const desc =
    description ??
    name +
      " is a vintage serif featuring organic curves and intricate accents. Perfect for projects that evoke nostalgia, it adds sophistication and character to branding, invitations and editorial design.";
  const letters = Array.from(name);
  const firstIdx = letters.findIndex((c) => c.trim() !== "");
  const lastIdx =
    letters.length -
    1 -
    [...letters].reverse().findIndex((c) => c.trim() !== "");
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  React.useEffect(() => {
    if (!fontHref) return;
    const exists = Array.from(
      document.querySelectorAll("link[rel=stylesheet]"),
    ).some((l) => (l as HTMLLinkElement).href === fontHref);
    if (exists) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontHref;
    link.setAttribute("data-lycoris-font", "");
    document.head.appendChild(link);
  }, [fontHref]);
  const look = React.useRef({ crimson, alive, reduced, florets, seed });
  look.current = { crimson, alive, reduced, florets, seed };
  React.useEffect(() => {
    const root = rootRef.current,
      stage = stageRef.current,
      canvas = canvasRef.current,
      fallback = fallbackRef.current,
      glow = glowRef.current,
      word = wordRef.current;
    if (!root || !stage || !canvas || !fallback || !glow || !word) return;
    const { curves, radius } = buildCurves(
      look.current.florets,
      look.current.seed,
    );
    const mesh = buildMesh(curves);
    let gl: WebGLRenderingContext | null = null,
      ctx2d: CanvasRenderingContext2D | null = null;
    let prog: WebGLProgram | null = null,
      vbo: WebGLBuffer | null = null,
      ibo: WebGLBuffer | null = null;
    const loc: Record<string, WebGLUniformLocation | null> = {};
    const initGL = () => {
      try {
        gl = canvas.getContext("webgl", {
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
        });
      } catch {
        gl = null;
      }
      if (!gl) return false;
      const compile = (type: number, src: string) => {
        const sh = gl!.createShader(type);
        if (!sh) return null;
        gl!.shaderSource(sh, src);
        gl!.compileShader(sh);
        if (gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) return sh;
        gl!.deleteShader(sh);
        return null;
      };
      const vs = compile(gl.VERTEX_SHADER, VERT),
        fs = compile(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) {
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        return false;
      }
      prog = gl.createProgram();
      if (!prog) {
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return false;
      }
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.deleteProgram(prog);
        prog = null;
        return false;
      }
      gl.useProgram(prog);
      vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.data, gl.STATIC_DRAW);
      ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.index, gl.STATIC_DRAW);
      const attr = (n: string, size: number, off: number) => {
        const a = gl!.getAttribLocation(prog!, n);
        if (a < 0) return;
        gl!.enableVertexAttribArray(a);
        gl!.vertexAttribPointer(a, size, gl!.FLOAT, false, STRIDE * 4, off * 4);
      };
      attr("a_pos", 3, 0);
      attr("a_nrm", 3, 3);
      attr("a_aux", 4, 6);
      attr("a_base", 3, 10);
      for (const n of [
        "u_vp",
        "u_model",
        "u_offset",
        "u_time",
        "u_bloom",
        "u_sway",
        "u_stem",
        "u_eye",
        "u_red",
        "u_hot",
        "u_alpha",
      ])
        loc[n] = gl.getUniformLocation(prog, n);
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);
      canvas.style.display = "block";
      fallback.style.display = "none";
      return true;
    };
    const showFallback = () => {
      gl = null;
      ctx2d = fallback.getContext("2d");
      canvas.style.display = "none";
      fallback.style.display = "block";
    };
    if (!initGL()) showFallback();
    const onLost = (e: Event) => {
      e.preventDefault();
      showFallback();
    };
    const onRestored = () => {
      if (!initGL()) showFallback();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    let W = 1,
      H = 1,
      dpr = 1,
      disposed = false;
    const chars = Array.from(word.querySelectorAll<HTMLElement>("[data-ch]"));
    let nat: { x: number; y: number; w: number }[] = [];
    const measure = () => {
      if (disposed) return;
      const sr = stage.getBoundingClientRect();
      W = Math.max(1, sr.width);
      H = Math.max(1, sr.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(W * dpr),
        ch = Math.round(H * dpr);
      for (const layer of [canvas, fallback])
        if (layer.width !== cw || layer.height !== ch) {
          layer.width = cw;
          layer.height = ch;
        }
      const saved = chars.map((c) => c.style.transform);
      chars.forEach((c) => (c.style.transform = "none"));
      nat = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - sr.left,
          y: r.top + r.height / 2 - sr.top,
          w: r.width,
        };
      });
      chars.forEach((c, i) => (c.style.transform = saved[i]));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();
    const fonts = document.fonts,
      onFonts = () => measure();
    fonts?.addEventListener?.("loadingdone", onFonts);
    fonts?.ready.then(onFonts);
    const items = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-sc]"),
    ).map((el) => ({
      el,
      scene: Number(el.dataset.sc),
      fx: el.dataset.fx as Fx,
      delay: Number(el.dataset.d) || 0,
      last: -1,
      lastReduced: undefined as boolean | undefined,
    }));
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let spin = 0,
      spinVel = 0,
      drag: { id: number; x: number } | null = null;
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (drag && drag.id === e.pointerId) {
        spinVel += (e.clientX - drag.x) * 0.0022;
        drag.x = e.clientX;
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (
        (e.target as HTMLElement).closest("a,button,[contenteditable],.lys-g")
      )
        return;
      drag = { id: e.pointerId, x: e.clientX };
      stage.style.cursor = "grabbing";
    };
    const onUp = () => {
      drag = null;
      stage.style.cursor = "";
    };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    let raf = 0,
      running = false,
      visible = true,
      last = performance.now(),
      time = 0,
      prog01 = -1,
      shownScene = -1;
    const born = last;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const L = look.current,
        moving = L.alive && !L.reduced;
      if (moving) time += dt;
      const r = root.getBoundingClientRect(),
        p = progressFrom(r.top, r.height, H);
      prog01 =
        prog01 < 0 || L.reduced
          ? p
          : prog01 + (p - prog01) * (1 - Math.exp(-dt * 9));
      const coord = sceneCoord(prog01, SCENES, HOLD),
        scene = Math.round(coord);
      if (scene !== shownScene) {
        shownScene = scene;
        setActive(scene);
      }
      const tall = H > W * 1.05,
        k = keyAt(coord, tall);
      pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 4));
      pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 4));
      if (moving) {
        spin += spinVel + dt * 0.1;
        spinVel *= Math.exp(-dt * 3);
      } else {
        spin += spinVel;
        spinVel = 0;
      }
      const px = moving ? pointer.x : 0,
        py = moving ? pointer.y : 0,
        fov = (30 * Math.PI) / 180,
        minDim = Math.min(W, H);
      const dist = (radius * H) / (k.size * minDim * Math.tan(fov / 2)),
        el = (Math.max(-88, Math.min(88, k.el + py * 9)) * Math.PI) / 180;
      const eye: V3 = [
        HEART[0],
        HEART[1] + Math.sin(el) * dist,
        HEART[2] + Math.cos(el) * dist,
      ];
      const proj = perspective(fov, W / H, Math.max(0.05, dist - 6), dist + 8),
        vp = multiply(proj, lookAt(eye, HEART));
      const model = multiply(rotY(k.spin + spin + px * 0.35), rotX(py * 0.05)),
        bloom = L.reduced ? 1 : clamp01((now - born) / 2600);
      const gx = (0.5 + k.ox / 2) * W,
        gy = (0.5 - k.oy / 2) * H,
        gr = k.size * minDim * 1.25;
      glow.style.transform =
        "translate(" +
        (gx - gr).toFixed(1) +
        "px," +
        (gy - gr).toFixed(1) +
        "px)";
      glow.style.width = glow.style.height = (gr * 2).toFixed(1) + "px";
      if (gl && prog) {
        const g = gl,
          red = hexToLinear(L.crimson);
        g.viewport(0, 0, canvas.width, canvas.height);
        g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);
        g.uniformMatrix4fv(loc.u_vp, false, vp);
        g.uniformMatrix4fv(loc.u_model, false, model);
        g.uniform2f(loc.u_offset, k.ox, k.oy);
        g.uniform1f(loc.u_time, time);
        g.uniform1f(loc.u_bloom, bloom);
        g.uniform1f(loc.u_sway, moving ? 1 : 0);
        g.uniform1f(loc.u_stem, k.stem);
        g.uniform3f(loc.u_eye, ...eye);
        g.uniform3f(loc.u_red, red[0] * 2.2, red[1] * 2.2, red[2] * 2.2);
        g.uniform3f(loc.u_hot, 1, 0.55 + red[1], 0.5 + red[2]);
        g.uniform1f(loc.u_alpha, 1);
        g.drawElements(g.TRIANGLES, mesh.index.length, g.UNSIGNED_SHORT, 0);
      } else if (ctx2d) {
        const c = ctx2d,
          mvp = multiply(vp, model);
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.clearRect(0, 0, W, H);
        c.lineCap = "round";
        c.strokeStyle = L.crimson;
        c.shadowColor = L.crimson;
        c.shadowBlur = 12;
        for (const cv of curves) {
          c.beginPath();
          cv.pts.forEach((q, i) => {
            const y = cv.kind === 2 && q[1] < 0 ? q[1] * k.stem : q[1];
            const cx = mvp[0] * q[0] + mvp[4] * y + mvp[8] * q[2] + mvp[12],
              cy = mvp[1] * q[0] + mvp[5] * y + mvp[9] * q[2] + mvp[13];
            const cw = mvp[3] * q[0] + mvp[7] * y + mvp[11] * q[2] + mvp[15],
              sx = ((cx / cw + k.ox) * 0.5 + 0.5) * W,
              sy = (0.5 - (cy / cw + k.oy) * 0.5) * H;
            if (i === 0) c.moveTo(sx, sy);
            else c.lineTo(sx, sy);
          });
          c.lineWidth =
            cv.kind === 0 ? (minDim * k.size) / 22 : cv.kind === 1 ? 1.2 : 3;
          c.stroke();
        }
      }
      const still = L.reduced;
      for (const it of items) {
        const v = reveal(coord, it.scene, it.delay),
          q = Math.round(v * 500) / 500;
        if (q === it.last && still === it.lastReduced) continue;
        it.last = q;
        it.lastReduced = still;
        const s = it.el.style,
          dir = coord < it.scene ? 1 : -1;
        s.visibility = q <= 0 ? "hidden" : "";
        if (it.fx === "draw") {
          s.setProperty("--v", String(q));
          s.opacity = String(Math.min(1, q * 3));
          continue;
        }
        if (it.fx === "line") {
          s.transform = "scaleX(" + q + ")";
          s.opacity = String(Math.min(1, q * 2));
          continue;
        }
        s.opacity = String(q);
        if (it.fx === "fade") continue;
        if (still) {
          s.transform = "";
          s.filter = "";
          s.clipPath = "";
          continue;
        }
        if (it.fx === "clip") {
          const hid = ((1 - q) * 100).toFixed(1);
          s.clipPath =
            dir > 0 ? "inset(0 0 " + hid + "% 0)" : "inset(" + hid + "% 0 0 0)";
          s.transform =
            "translateY(" + ((1 - q) * 0.4 * dir).toFixed(3) + "em)";
        } else {
          s.transform = "translateY(" + ((1 - q) * 34 * dir).toFixed(1) + "px)";
          s.filter =
            q > 0.995 ? "" : "blur(" + ((1 - q) * 8).toFixed(1) + "px)";
        }
      }
      const m = easeInOut(clamp01(coord)),
        out = clamp01(coord - 1),
        r1 = keyAt(1, tall).size * minDim * 0.5,
        cy1 = (0.5 - keyAt(1, tall).oy / 2) * H;
      chars.forEach((c, i) => {
        const n0 = nat[i];
        if (!n0) return;
        const flank = i === firstIdx || i === lastIdx;
        if (flank && firstIdx !== lastIdx) {
          const side = i === firstIdx ? -1 : 1,
            tx = W / 2 + side * (r1 + n0.w * 0.55 + minDim * 0.02),
            dx = (tx - n0.x) * m,
            dy = (cy1 - n0.y) * m - out * 60;
          c.style.transform =
            "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
          c.style.opacity = String(
            coord < 1 ? 1 : 1 - smoothstep(0.1, 0.45, out),
          );
          c.style.filter =
            still || out < 0.05 ? "" : "blur(" + (out * 14).toFixed(1) + "px)";
        } else {
          const dx = (W / 2 - n0.x) * m * 0.75,
            dy = (cy1 - n0.y) * m;
          c.style.transform = still
            ? ""
            : "translate(" +
              dx.toFixed(1) +
              "px," +
              dy.toFixed(1) +
              "px) scale(" +
              (1 - m * 0.7).toFixed(3) +
              ")";
          c.style.opacity = String(1 - smoothstep(0, 0.4, m));
          c.style.filter =
            still || m < 0.02 ? "" : "blur(" + (m * 12).toFixed(1) + "px)";
        }
        c.style.visibility = coord > 1.6 ? "hidden" : "";
      });
    };
    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(root);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      fonts?.removeEventListener?.("loadingdone", onFonts);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      const g = gl as WebGLRenderingContext | null;
      if (g) {
        g.deleteBuffer(vbo);
        g.deleteBuffer(ibo);
        g.deleteProgram(prog);
      }
    };
  }, [name, firstIdx, lastIdx, florets, seed]);
  const jump = (i: number) => {
    const root = rootRef.current,
      stage = stageRef.current;
    if (!root || !stage) return;
    const r = root.getBoundingClientRect(),
      travel = r.height - stage.clientHeight,
      delta = (i / (SCENES - 1)) * travel + r.top;
    let el: HTMLElement | null = root.parentElement;
    while (el && el !== document.body) {
      const oy = getComputedStyle(el).overflowY;
      if (
        (oy === "auto" || oy === "scroll") &&
        el.scrollHeight > el.clientHeight
      )
        break;
      el = el.parentElement;
    }
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    if (el && el !== document.body) el.scrollBy({ top: delta, behavior });
    else window.scrollBy({ top: delta, behavior });
  };
  const display: React.CSSProperties = { fontFamily, fontWeight: 400 },
    sans: React.CSSProperties = { fontFamily: SANS },
    hidden: React.CSSProperties = { opacity: 0 };
  const Glyphs = ({
    rows,
    size,
    lh = 1.02,
  }: {
    rows: string[];
    size: string;
    lh?: number;
  }) => (
    <>
      {rows.map((row) => (
        <div
          key={row}
          style={{ fontSize: size, lineHeight: lh, whiteSpace: "nowrap" }}
        >
          {Array.from(row).map((g, i) => (
            <span key={i} className="lys-g" data-g={g}>
              {g}
            </span>
          ))}
        </div>
      ))}
    </>
  );
  const Side = ({ label, side }: { label: string; side: "l" | "r" }) => (
    <span
      className="lys-hide-sm"
      style={{
        ...sans,
        position: "absolute",
        top: "50%",
        [side === "l" ? "right" : "left"]: "calc(100% + 16px)",
        fontSize: 8,
        letterSpacing: "0.25em",
        opacity: 0.55,
        lineHeight: 1,
        transform:
          "translate(" +
          (side === "l" ? "50%" : "-50%") +
          ",-50%) rotate(" +
          (side === "l" ? -90 : 90) +
          "deg)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
  const multi = multilingual.split("·");
  return (
    <section
      ref={rootRef}
      className={"relative w-full " + className}
      style={{
        height:
          "calc(" +
          height +
          " * " +
          (1 + (SCENES - 1) * sceneScroll).toFixed(3) +
          ")",
        background: ink,
      }}
      aria-label={name + " typeface specimen"}
    >
      <style>{CSS}</style>
      <div
        ref={stageRef}
        className="lys-stage sticky top-0 w-full overflow-hidden select-none"
        style={
          {
            height,
            color: bone,
            background: ink,
            ["--lys-red" as string]: crimson,
          } as React.CSSProperties
        }
        onPointerOver={(e) => {
          const g = (e.target as HTMLElement).dataset?.g;
          if (g) setInspect(g);
        }}
        onPointerLeave={() => setInspect(null)}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, transparent 55%, " +
              bone +
              "14 100%)",
          }}
        />
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, " +
              crimson +
              "3d, " +
              crimson +
              "12 45%, transparent 100%)",
            willChange: "transform",
          }}
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 block"
          style={{ width: "100%", height: "100%", maxWidth: "none" }}
        />
        <canvas
          ref={fallbackRef}
          aria-hidden
          className="absolute inset-0"
          style={{
            display: "none",
            width: "100%",
            height: "100%",
            maxWidth: "none",
          }}
        />

        {/* 0 — cover */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute flex items-start justify-between gap-6"
            style={{ left: "5cqw", right: "5cqw", top: "5cqh" }}
          >
            <div
              {...sc(0, "clip", 0)}
              style={{
                ...display,
                ...hidden,
                fontSize: "clamp(20px, 3.3cqw, 46px)",
                lineHeight: 0.88,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              {name}
              <br />
              Typeface
            </div>
            <p
              {...sc(0, "rise", 0.2)}
              className="lys-hide-md"
              style={{
                ...display,
                ...hidden,
                maxWidth: "25cqw",
                fontSize: "clamp(10px, 0.95cqw, 13px)",
                lineHeight: 1.35,
                margin: 0,
                textAlign: "justify",
              }}
            >
              {desc}
            </p>
            <ul
              {...sc(0, "rise", 0.35)}
              className="lys-hide-md"
              style={{
                ...display,
                ...hidden,
                listStyle: "none",
                margin: 0,
                padding: 0,
                fontSize: "clamp(10px, 0.95cqw, 13px)",
                lineHeight: 1.35,
              }}
            >
              {specs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div
              {...sc(0, "clip", 0.5)}
              className="lys-hide-sm"
              style={{
                ...display,
                ...hidden,
                fontSize: "clamp(18px, 2.6cqw, 38px)",
                lineHeight: 0.9,
                textAlign: "right",
                textTransform: "uppercase",
              }}
            >
              Fancy
              <br />
              Vintage
              <br />
              Serif
            </div>
          </div>
          <div
            ref={wordRef}
            className="absolute whitespace-nowrap"
            style={{
              ...display,
              left: "50%",
              top: "61%",
              transform: "translate(-50%, -50%)",
              fontSize: "min(21cqw, 33cqh)",
              lineHeight: 1,
            }}
          >
            <span
              {...sc(0, "rise", 0.6)}
              style={{
                ...hidden,
                position: "absolute",
                right: "0.04em",
                bottom: "84%",
                fontSize: "0.36em",
              }}
            >
              Font
            </span>
            <h2
              style={{
                margin: 0,
                font: "inherit",
                fontFeatureSettings: '"liga" 1',
              }}
              aria-label={name}
            >
              {letters.map((c, i) => (
                <span
                  key={i}
                  data-ch
                  className="inline-block"
                  style={{ willChange: "transform" }}
                  aria-hidden
                >
                  <span
                    className="lys-char"
                    style={{ animationDelay: 0.15 + i * 0.07 + "s" }}
                  >
                    {c === " " ? " " : c}
                  </span>
                </span>
              ))}
            </h2>
          </div>
          <div
            className="absolute flex items-end justify-between gap-6"
            style={{ left: "5cqw", right: "5cqw", bottom: "5cqh" }}
          >
            <div
              {...sc(0, "rise", 0.3)}
              className="flex items-center gap-3"
              style={hidden}
            >
              <Mark color={bone} accent={crimson} />
              <span
                style={{
                  ...sans,
                  fontSize: "clamp(20px, 2.4cqw, 34px)",
                  letterSpacing: "-0.02em",
                  fontWeight: 300,
                }}
              >
                {year}
              </span>
              <span
                style={{
                  ...sans,
                  fontSize: 9,
                  lineHeight: 1.2,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid " + bone + "80",
                  paddingBottom: 6,
                  paddingRight: "6cqw",
                }}
              >
                Manufactured by
                <br />
                {studio}
              </span>
            </div>
            <div
              {...sc(0, "rise", 0.5)}
              className="lys-hide-sm flex gap-5"
              style={{
                ...sans,
                ...hidden,
                color: crimson,
                fontSize: 8,
                lineHeight: 1.25,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <span>
                {name}
                <br />
                Typeface
              </span>
              <span>
                Fancy
                <br />
                Vintage serif
              </span>
              <span>
                Designed by
                <br />
                {studio}
              </span>
              <span>
                {year}
                <br />
                Specimen
              </span>
            </div>
          </div>
        </div>

        {/* 1 — crown */}
        <div className="pointer-events-none absolute inset-0">
          <div
            {...sc(1, "fade", 0.5)}
            className="absolute"
            style={{
              ...display,
              ...hidden,
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              fontSize: "clamp(10px, 1.1cqw, 14px)",
            }}
          >
            {name}
          </div>
          <div
            {...sc(1, "rise", 0.7)}
            className="absolute"
            style={{
              ...sans,
              ...hidden,
              left: "5cqw",
              bottom: "5cqh",
              fontSize: 9,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: crimson }}>02</span> — The crown, from above
          </div>
        </div>

        {/* 2 — specimen */}
        <div className="pointer-events-none absolute inset-0" style={display}>
          <div
            className="lys-spec pointer-events-auto absolute grid items-center"
            style={{
              left: "6cqw",
              right: "6cqw",
              top: "12cqh",
              bottom: "20cqh",
              gridTemplateColumns: "1fr min(30cqw, 34cqh) 1fr",
              columnGap: "2cqw",
            }}
          >
            <div className="relative flex flex-col gap-[2.4cqh]">
              <div {...sc(2, "clip", 0)} style={hidden} className="relative">
                <Side label="UPPERCASE" side="l" />
                <Glyphs rows={UPPER_L} size="min(9cqw, 7.4cqh)" />
              </div>
              <div {...sc(2, "clip", 0.15)} style={hidden} className="relative">
                <Side label="LOWERCASE" side="l" />
                <Glyphs rows={LOWER_L} size="min(6.6cqw, 5.4cqh)" />
              </div>
              <div {...sc(2, "clip", 0.3)} style={hidden} className="relative">
                <Side label="ACCENTS" side="l" />
                <Glyphs rows={ACCENT_L} size="min(3.8cqw, 3.2cqh)" lh={1.3} />
              </div>
            </div>
            <div className="lys-spec-mid relative h-full text-center">
              <div
                {...sc(2, "rise", 0.35)}
                className="absolute w-full"
                style={{
                  ...hidden,
                  top: "34%",
                  fontSize: "min(2.6cqw, 3.6cqh)",
                  lineHeight: 1,
                }}
              >
                {name}
                <div style={{ fontSize: "0.5em" }}>Typeface</div>
              </div>
              <div
                {...sc(2, "rise", 0.45)}
                className="absolute w-full"
                style={{ ...hidden, top: "52%", lineHeight: 1.05 }}
              >
                <div
                  style={{
                    fontSize: inspect
                      ? "min(9cqw, 12cqh)"
                      : "min(2.8cqw, 3.8cqh)",
                    color: inspect ? crimson : undefined,
                    transition: "font-size .35s cubic-bezier(.2,.8,.2,1)",
                  }}
                >
                  {inspect ?? "& ?"}
                </div>
                <div
                  style={{
                    ...sans,
                    fontSize: 8,
                    letterSpacing: "0.25em",
                    opacity: 0.6,
                    minHeight: "1.3em",
                  }}
                >
                  {inspect
                    ? "U+" +
                      (inspect.codePointAt(0) ?? 0)
                        .toString(16)
                        .toUpperCase()
                        .padStart(4, "0")
                    : "HOVER A GLYPH"}
                </div>
                {!inspect && (
                  <Glyphs rows={NUMERALS} size="min(2.2cqw, 3cqh)" />
                )}
              </div>
            </div>
            <div className="relative flex flex-col items-end gap-[2.4cqh] text-right">
              <div {...sc(2, "clip", 0.1)} style={hidden} className="relative">
                <Side label="UPPERCASE" side="r" />
                <Glyphs rows={UPPER_R} size="min(9cqw, 7.4cqh)" />
              </div>
              <div {...sc(2, "clip", 0.25)} style={hidden} className="relative">
                <Side label="LOWERCASE" side="r" />
                <Glyphs rows={LOWER_R} size="min(6.6cqw, 5.4cqh)" />
              </div>
              <div {...sc(2, "clip", 0.4)} style={hidden} className="relative">
                <Side label="ACCENTS" side="r" />
                <Glyphs rows={ACCENT_R} size="min(3.8cqw, 3.2cqh)" lh={1.3} />
              </div>
            </div>
          </div>
          <div
            {...sc(2, "line", 0.5)}
            className="absolute"
            style={{
              ...hidden,
              left: "6cqw",
              right: "6cqw",
              bottom: "15.5cqh",
              height: 1,
              background: bone + "40",
              transformOrigin: "left",
            }}
          />
          <div
            {...sc(2, "rise", 0.6)}
            className="pointer-events-auto absolute text-center"
            style={{
              ...hidden,
              left: "6cqw",
              right: "6cqw",
              bottom: "8cqh",
              fontSize: "min(4.2cqw, 3.4cqh)",
              overflowWrap: "anywhere",
            }}
          >
            <Glyphs rows={[PUNCT]} size="inherit" />
          </div>
        </div>

        {/* 3 — fancy */}
        <div className="pointer-events-none absolute inset-0" style={display}>
          <div
            className="absolute text-center"
            style={{
              left: "50%",
              top: "13cqh",
              transform: "translateX(-50%)",
              fontSize: "min(16cqw, 12.5cqh)",
              lineHeight: 0.9,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            <span
              {...sc(3, "fade", 0.3)}
              style={{
                ...hidden,
                position: "absolute",
                right: "100%",
                top: "0.35em",
                fontSize: "0.12em",
                marginRight: "1.2em",
                textTransform: "none",
              }}
            >
              {name}
            </span>
            <span
              {...sc(3, "fade", 0.4)}
              style={{
                ...hidden,
                position: "absolute",
                left: "100%",
                top: "0.35em",
                fontSize: "0.12em",
                marginLeft: "1.2em",
                textTransform: "none",
              }}
            >
              Typeface
            </span>
            <div {...sc(3, "clip", 0)} style={hidden}>
              Fancy
            </div>
            <div {...sc(3, "clip", 0.15)} style={hidden}>
              Vintage
            </div>
            <div {...sc(3, "clip", 0.3)} style={hidden}>
              Serif
            </div>
          </div>
          <div
            className="absolute flex justify-center"
            style={{ left: 0, right: 0, bottom: "5cqh" }}
          >
            <div
              {...sc(3, "rise", 0.6)}
              style={{
                ...sans,
                ...hidden,
                fontSize: 9,
                letterSpacing: "0.9em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                paddingLeft: "0.9em",
              }}
            >
              {studio}
            </div>
          </div>
        </div>

        {/* 4 — bloom */}
        <div className="pointer-events-none absolute inset-0" style={display}>
          <div
            className="lys-bloom pointer-events-auto absolute"
            style={{
              left: "9cqw",
              top: "34cqh",
              fontSize: "min(9.5cqw, 13cqh)",
              lineHeight: 0.82,
            }}
          >
            {tagline.map((t, i) => (
              <div
                key={i}
                {...sc(4, "clip", i * 0.14)}
                style={{
                  ...hidden,
                  fontSize: t.small ? "0.4em" : undefined,
                  lineHeight: t.small ? 1.1 : undefined,
                  marginLeft: t.small
                    ? i < 2
                      ? "5.2em"
                      : "4.2em"
                    : i > 1
                      ? "0.45em"
                      : 0,
                  marginTop: t.small ? "-0.1em" : 0,
                  marginBottom: t.small ? "0.25em" : 0,
                }}
              >
                <span
                  className="lys-edit"
                  contentEditable
                  spellCheck={false}
                  suppressContentEditableWarning
                >
                  {t.text}
                </span>
              </div>
            ))}
            <div
              {...sc(4, "rise", 0.7)}
              style={{
                ...sans,
                ...hidden,
                fontSize: 9,
                letterSpacing: "0.25em",
                marginTop: "3cqh",
                opacity: 0.7,
                textTransform: "uppercase",
              }}
            >
              {name} — click the words, type your own
            </div>
          </div>
        </div>

        {/* 5 — ligatures */}
        <div className="pointer-events-none absolute inset-0" style={display}>
          <div
            className="lys-fin absolute flex items-center justify-around"
            style={{ left: "4cqw", right: "4cqw", top: "50cqh" }}
          >
            <div className="pointer-events-auto relative text-center">
              <div
                {...sc(5, "fade", 0.1)}
                style={{
                  ...hidden,
                  fontSize: "clamp(9px, 0.9cqw, 12px)",
                  marginBottom: "1.2cqh",
                }}
              >
                3 ligatures in 1 OpenType feature
              </div>
              <button
                type="button"
                {...sc(5, "clip", 0)}
                onClick={() => setLiga((v) => !v)}
                aria-pressed={liga}
                title="Toggle ligatures"
                className="relative block"
                style={{
                  ...hidden,
                  font: "inherit",
                  color: "inherit",
                  background: "none",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                  fontSize: "min(10cqw, 13cqh)",
                  lineHeight: 1,
                  fontFeatureSettings: liga ? '"liga" 1, "dlig" 1' : '"liga" 0',
                  fontVariantLigatures: liga
                    ? "common-ligatures discretionary-ligatures"
                    : "none",
                  letterSpacing: liga ? "0" : "0.02em",
                  transition: "letter-spacing .4s",
                }}
              >
                {ligatureWord}
                <svg
                  {...sc(5, "draw", 0.2)}
                  aria-hidden
                  viewBox="0 0 100 100"
                  style={{
                    ...hidden,
                    position: "absolute",
                    left: "44%",
                    top: "50%",
                    width: "1.3em",
                    height: "1.3em",
                    transform: "translate(-50%,-46%)",
                    overflow: "visible",
                    pointerEvents: "none",
                  }}
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke={crimson}
                    strokeWidth="1.3"
                    pathLength={1}
                    strokeDasharray="1"
                    style={
                      {
                        strokeDashoffset: "calc(1 - var(--v, 0))",
                      } as React.CSSProperties
                    }
                  />
                  <path
                    d="M2 50H98M50 50V98"
                    fill="none"
                    stroke={crimson}
                    strokeWidth="1.3"
                    pathLength={1}
                    strokeDasharray="1"
                    style={
                      {
                        strokeDashoffset: "calc(1 - var(--v, 0))",
                      } as React.CSSProperties
                    }
                  />
                </svg>
              </button>
              <div
                {...sc(5, "rise", 0.4)}
                className="flex justify-center gap-[3cqw]"
                style={{ ...hidden, marginTop: "2.4cqh" }}
              >
                {["ff", "fi", "fl"].map((l) => (
                  <div
                    key={l}
                    className="grid items-baseline"
                    style={{ gridTemplateColumns: "auto auto", columnGap: 8 }}
                  >
                    <span style={{ fontSize: 9, opacity: 0.7 }}>Ligature</span>
                    <span
                      style={{
                        fontSize: "min(2.4cqw, 3.4cqh)",
                        fontFeatureSettings: '"liga" 1',
                      }}
                    >
                      {l}
                    </span>
                    <span style={{ fontSize: 9, opacity: 0.7 }}>
                      Components
                    </span>
                    <span
                      style={{
                        fontSize: "min(2.4cqw, 3.4cqh)",
                        fontVariantLigatures: "none",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {l}
                    </span>
                  </div>
                ))}
              </div>
              <div
                {...sc(5, "fade", 0.6)}
                style={{
                  ...hidden,
                  fontSize: 10,
                  marginTop: "1.6cqh",
                  opacity: 0.7,
                }}
              >
                {name}
              </div>
            </div>
            <div className="pointer-events-auto relative">
              <div
                {...sc(5, "fade", 0.3)}
                style={{ ...hidden, fontSize: "clamp(10px, 1cqw, 13px)" }}
              >
                {name}
              </div>
              <div
                {...sc(5, "clip", 0.35)}
                style={{
                  ...hidden,
                  fontSize: "min(7cqw, 9.5cqh)",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  className="lys-edit"
                  contentEditable
                  spellCheck={false}
                  suppressContentEditableWarning
                >
                  {multi.map((part, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span style={{ color: crimson }}>·</span>}
                      {part}
                    </React.Fragment>
                  ))}
                </span>
              </div>
              <div
                {...sc(5, "fade", 0.5)}
                style={{
                  ...hidden,
                  fontSize: "clamp(10px, 1cqw, 13px)",
                  textAlign: "right",
                }}
              >
                Font
              </div>
            </div>
          </div>
          <div
            {...sc(5, "rise", 0.75)}
            className="pointer-events-auto absolute flex items-center justify-between gap-4"
            style={{
              ...sans,
              ...hidden,
              left: "5cqw",
              right: "5cqw",
              bottom: "4.5cqh",
              fontSize: "clamp(10px, 1.5cqw, 20px)",
              letterSpacing: "0.04em",
              color: bone,
            }}
          >
            <FootLink link={links[0]} />
            <Mark color={crimson} accent={bone} />
            <FootLink link={links[1]} />
          </div>
        </div>

        <nav
          aria-label="Specimen frames"
          className="lys-nav lys-hide-sm absolute flex flex-col items-end"
          style={{
            ...sans,
            right: "2cqw",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {NAV.map((n, i) => (
            <button
              key={n}
              type="button"
              onClick={() => jump(i)}
              aria-current={active === i ? "step" : undefined}
            >
              <span className="lys-lab">
                {String(i + 1).padStart(2, "0")} {n}
              </span>
              <span className="lys-tick" />
            </button>
          ))}
        </nav>
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0"
          width="100%"
          height="100%"
          style={{ opacity: 0.09, mixBlendMode: "screen" }}
        >
          <filter id={grainId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves={2}
              stitchTiles="stitch"
            />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0" />
          </filter>
          <rect width="100%" height="100%" filter={"url(#" + grainId + ")"} />
        </svg>
      </div>
    </section>
  );
}

function FootLink({ link }: { link: LycorisLink }) {
  const style: React.CSSProperties = {
    color: "inherit",
    textDecoration: "none",
    whiteSpace: "nowrap",
  };
  const external = !!link.href && /^https?:\/\//i.test(link.href);
  return link.href ? (
    <a
      href={link.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      style={style}
    >
      {link.label}
    </a>
  ) : (
    <span style={style}>{link.label}</span>
  );
}
function Mark({ color, accent }: { color: string; accent: string }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 40 40"
      aria-hidden
      style={{ flex: "none" }}
    >
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path
          key={a}
          d="M20 20 C 22 12, 30 8, 33 12 C 35 15, 31 17, 29 14"
          fill="none"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
          transform={"rotate(" + a + " 20 20)"}
        />
      ))}
      <circle cx="20" cy="20" r="2.6" fill={accent} />
    </svg>
  );
}
