import test from "node:test";
import assert from "node:assert/strict";
import { safePublicText } from "../../lib/public-content";

test("public content never renders Prisma or Turbopack internals", () => {
  const leaked =
    "Invalid `__TURBOPACK__imported_module__prisma.item.findFirst()` invocation in D:\\work\\project\\.next\\server\\chunks";
  assert.equal(safePublicText(leaked, "Description unavailable."), "Description unavailable.");
});

test("public content preserves normal user-facing text", () => {
  assert.equal(
    safePublicText("Black wallet near Jaipur station", "Unavailable"),
    "Black wallet near Jaipur station",
  );
});
