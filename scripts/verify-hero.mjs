import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const dom = new JSDOM(html, {
  url: "https://nazus.xyz/",
  pretendToBeVisual: true,
});
const { window } = dom;
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "HTMLCanvasElement",
  "Event",
  "MouseEvent",
])
  globalThis[key] = key === "window" ? window : window[key];
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
const media = {
  matches: true,
  addEventListener() {},
  removeEventListener() {},
};
window.matchMedia = () => media;
let scrolled = null;
window.scrollBy = (options) => {
  scrolled = options;
};
let scrollFraction = 0;
window.HTMLElement.prototype.getBoundingClientRect = function () {
  const root = this.matches("section[aria-label$='typeface specimen']");
  return {
    x: 0,
    y: root ? -4800 * scrollFraction : 0,
    left: 0,
    top: root ? -4800 * scrollFraction : 0,
    right: 1200,
    bottom: 800,
    width: 1200,
    height: root ? 5600 : 800,
    toJSON() {},
  };
};
Object.defineProperty(window.HTMLElement.prototype, "clientHeight", {
  get: () => 800,
});
class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    this.callback([]);
  }
  disconnect() {}
}
class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    this.callback([{ isIntersecting: true }]);
  }
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserver;
globalThis.IntersectionObserver = IntersectionObserver;
let nextFrame = 0;
const frames = new Map();
globalThis.requestAnimationFrame = (callback) => {
  frames.set(++nextFrame, callback);
  return nextFrame;
};
globalThis.cancelAnimationFrame = (id) => frames.delete(id);
const contexts = new WeakMap();
let strokes = 0;
const context2d = {
  setTransform() {},
  clearRect() {},
  beginPath() {},
  moveTo() {},
  lineTo() {},
  stroke() {
    strokes++;
  },
};
const failedGL = {
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  COMPILE_STATUS: 35713,
  createShader: () => ({}),
  shaderSource() {},
  compileShader() {},
  getShaderParameter: () => false,
  deleteShader() {},
};
window.HTMLCanvasElement.prototype.getContext = function (type) {
  if (contexts.has(this) && contexts.get(this) !== type) return null;
  if (type === "webgl") {
    if (!process.argv.includes("--shader-failure")) return null;
    contexts.set(this, type);
    return failedGL;
  }
  if (type === "2d") {
    contexts.set(this, type);
    return context2d;
  }
  return null;
};
const settle = async () => {
  for (let i = 0; i < 5; i++) await new Promise(setImmediate);
};
const tick = async () => {
  for (const [id, callback] of [...frames]) {
    frames.delete(id);
    callback(performance.now() + 16);
  }
  await settle();
};

assert.equal(document.querySelector("#nazorix-hero-fallback").hidden, false);
await import("../assets/lycoris/nazorix-hero.js");
await settle();
await tick();
assert.equal(document.querySelector("#nazorix-hero-fallback").hidden, true);
assert.match(
  document.querySelector("#nazorix-specimen-root").textContent,
  /Nazorix/,
);
const buttons = [
  ...document.querySelectorAll("nav[aria-label='Specimen frames'] button"),
];
assert.equal(buttons.length, 6);
assert.equal(buttons[0].getAttribute("aria-current"), "step");
assert.ok(
  strokes > 0,
  "2D fallback must draw when WebGL is unavailable or shader compilation fails",
);
const canvases = [
  ...document.querySelectorAll("#nazorix-specimen-root canvas"),
];
assert.equal(canvases.length, 2);
assert.equal(canvases[1].style.display, "block");
scrollFraction = 1;
await tick();
assert.equal(buttons[5].getAttribute("aria-current"), "step");
const ligatures = document.querySelector("button[title='Toggle ligatures']");
assert.equal(ligatures.getAttribute("aria-pressed"), "true");
ligatures.click();
await settle();
assert.equal(ligatures.getAttribute("aria-pressed"), "false");
buttons[2].click();
assert.equal(
  scrolled.behavior,
  "auto",
  "reduced motion should use immediate frame navigation",
);
const signUp = document.querySelector(
  "#nazorix-specimen-root a[href='login.html?mode=create']",
);
assert.ok(signUp);
assert.equal(signUp.getAttribute("target"), null);
for (const id of ["network", "how", "roadmap", "faq", "about"])
  assert.ok(document.getElementById(id));
assert.equal(document.querySelectorAll("link[data-lycoris-font]").length, 1);
assert.ok(
  !fs
    .readFileSync(
      new URL("../assets/lycoris/nazorix-hero.js", import.meta.url),
      "utf8",
    )
    .includes("process.env.NODE_ENV"),
);
console.log(
  `PASS: production island, 6 frames, reduced-motion navigation, ligatures, links and ${process.argv.includes("--shader-failure") ? "shader-failure" : "unavailable-WebGL"} fallback`,
);
dom.window.close();
