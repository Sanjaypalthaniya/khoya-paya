import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

function filesUnder(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const target = path.join(directory, name);
    return statSync(target).isDirectory() ? filesUnder(target) : [target];
  });
}

test("every page source avoids placeholder links", () => {
  const pages = filesUnder(path.join(root, "app")).filter((file) => file.endsWith("page.tsx"));
  assert.equal(pages.length, 70);
  for (const page of pages) {
    const source = readFileSync(page, "utf8");
    assert.doesNotMatch(source, /href\s*=\s*["']#["']/);
  }
});

test("mobile shell contract includes safe areas and approved primary colour", () => {
  const css = readFileSync(path.join(root, "app", "mobile-repair.css"), "utf8").toLowerCase();
  assert.match(css, /#0052f2/);
  assert.doesNotMatch(css, /#6d3bd1/);
  assert.match(css, /100dvh/);
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /@media \(max-width: 359px\)/);
  assert.match(css, /\.dashboard-bottom-nav/);
  assert.match(css, /\.composer-modal/);
});

test("root viewport opts into edge-to-edge safe area support", () => {
  const layout = readFileSync(path.join(root, "app", "layout.tsx"), "utf8");
  assert.match(layout, /viewportFit:\s*"cover"/);
  assert.match(layout, /width:\s*"device-width"/);
});
