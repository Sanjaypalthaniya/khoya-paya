import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const runtime = readFileSync(
  new URL("../../components/motion/MotionRuntime.tsx", import.meta.url),
  "utf8",
);
const gsapSystem = readFileSync(
  new URL("../../lib/gsapAnimations.ts", import.meta.url),
  "utf8",
);
const styles = readFileSync(
  new URL("../../app/motion.css", import.meta.url),
  "utf8",
);

test("motion runtime cleans up on route changes and unmount", () => {
  assert.match(runtime, /cleanupRef\.current\(\)/);
  assert.match(runtime, /\[pathname\]/);
  assert.match(gsapSystem, /context\.revert\(\)/);
  assert.match(gsapSystem, /trigger\.kill\(\)/);
});

test("motion system keeps content visible and supports reduced motion", () => {
  assert.match(gsapSystem, /prefersReducedMotion\(\)/);
  assert.match(gsapSystem, /clearProps: "transform,opacity,visibility"/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

test("button motion preserves disabled and focus-visible states", () => {
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /:disabled/);
  assert.match(styles, /pointer: coarse/);
  assert.match(styles, /min-height: 44px/);
});
