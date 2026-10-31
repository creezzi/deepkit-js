import { test } from "node:test";
import assert from "node:assert/strict";
import { deepEqual, deepClone } from "../src/index.js";

test("deepEqual compares structure, ignoring key order", () => {
  assert.ok(deepEqual({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 }));
  assert.ok(!deepEqual({ a: 1 }, { a: 2 }));
  assert.ok(!deepEqual({ a: 1 }, { a: 1, b: undefined }));
  assert.ok(!deepEqual([1, 2], [2, 1]));
});

test("deepEqual handles primitives, NaN, null and type mismatches", () => {
  assert.ok(deepEqual(NaN, NaN));
  assert.ok(!deepEqual(0, -0));
  assert.ok(!deepEqual(null, {}));
  assert.ok(!deepEqual([], {}));
  assert.ok(!deepEqual("1", 1));
});

test("deepEqual handles Date, RegExp, Map and Set", () => {
  assert.ok(deepEqual(new Date(5), new Date(5)));
  assert.ok(!deepEqual(new Date(5), new Date(6)));
  assert.ok(deepEqual(/a/g, /a/g));
  assert.ok(!deepEqual(/a/g, /a/i));
  assert.ok(deepEqual(new Map([[1, { a: 1 }]]), new Map([[1, { a: 1 }]])));
  assert.ok(!deepEqual(new Map([[1, 1]]), new Map([[1, 2]])));
  assert.ok(deepEqual(new Set([{ a: 1 }, 2]), new Set([2, { a: 1 }])));
  assert.ok(!deepEqual(new Set([1]), new Set([2])));
});

test("deepEqual survives cycles", () => {
  const a = { name: "a" };
  a.self = a;
  const b = { name: "a" };
  b.self = b;
  assert.ok(deepEqual(a, b));
});

test("deepClone copies deeply and independently", () => {
  const src = { n: 1, list: [1, { x: 2 }], when: new Date(7), m: new Map([["k", new Set([1])]]) };
  const copy = deepClone(src);
  assert.ok(deepEqual(src, copy));
  assert.notEqual(copy.list, src.list);
  assert.notEqual(copy.list[1], src.list[1]);
  assert.notEqual(copy.when, src.when);
  copy.list[1].x = 99;
  assert.equal(src.list[1].x, 2);
});

test("deepClone preserves cycles, shared references and prototypes", () => {
  const shared = { s: 1 };
  const src = { a: shared, b: shared };
  src.me = src;
  const copy = deepClone(src);
  assert.equal(copy.me, copy);
  assert.equal(copy.a, copy.b);
  assert.notEqual(copy.a, shared);

  class Point { constructor(x) { this.x = x; } }
  const p = deepClone(new Point(3));
  assert.ok(p instanceof Point);
  assert.equal(p.x, 3);
});
