const tag = (v) => Object.prototype.toString.call(v);

/** Structural equality. NaN equals NaN; key order is ignored. */
export function deepEqual(a, b, seen = new WeakMap()) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (tag(a) !== tag(b) || Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (seen.get(a) === b) return true; // already comparing this pair (cycle)
  seen.set(a, b);

  if (a instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp) return String(a) === String(b);
  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) if (!b.has(k) || !deepEqual(v, b.get(k), seen)) return false;
    return true;
  }
  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    outer: for (const x of a) {
      if (b.has(x)) continue;
      for (const y of b) if (deepEqual(x, y, seen)) continue outer;
      return false;
    }
    return true;
  }
  const keysA = Reflect.ownKeys(a);
  if (keysA.length !== Reflect.ownKeys(b).length) return false;
  return keysA.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k], seen));
}

/** Deep copy that preserves cycles, shared references and prototypes. */
export function deepClone(value, seen = new WeakMap()) {
  if (typeof value !== "object" || value === null) return value;
  if (seen.has(value)) return seen.get(value);
  let copy;
  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (value instanceof Map) {
    copy = new Map();
    seen.set(value, copy);
    for (const [k, v] of value) copy.set(deepClone(k, seen), deepClone(v, seen));
    return copy;
  }
  if (value instanceof Set) {
    copy = new Set();
    seen.set(value, copy);
    for (const v of value) copy.add(deepClone(v, seen));
    return copy;
  }
  copy = Array.isArray(value) ? new Array(value.length) : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) copy[key] = deepClone(value[key], seen);
  return copy;
}
