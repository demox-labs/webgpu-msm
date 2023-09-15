const FIELD_ORDER = new Uint32Array([313222494, 2586617174, 1622428958, 1547153409, 1504343806, 3489660929, 168919040, 1]);
const EDWARDS_D = new Uint32Array([0, 0, 0, 0, 0, 0, 0, 3021]);

type Point = {
  x: Uint32Array,
  y: Uint32Array,
  t: Uint32Array,
  z: Uint32Array
};

function addPoints(p1: Point, p2: Point): Point {
  // Assuming field_multiply, field_add, field_sub, and mul_by_a are available
  const a = fieldMultiply(p1.x, p2.x);
  const b = fieldMultiply(p1.y, p2.y);
  const c = fieldMultiply(fieldMultiply(p1.t, p2.t), EDWARDS_D);
  const d = fieldMultiply(p1.z, p2.z);
  const p1Added = fieldAdd(p1.x, p1.y);
  const p2Added = fieldAdd(p2.x, p2.y);
  let e = fieldMultiply(fieldAdd(p1.x, p1.y), fieldAdd(p2.x, p2.y));
  e = fieldSub(e, a);
  e = fieldSub(e, b);
  const f = fieldSub(d, c);
  const g = fieldAdd(d, c);
  const aNeg = mulByA(a);
  const h = fieldSub(b, aNeg);
  const addedX = fieldMultiply(e, f);
  const addedY = fieldMultiply(g, h);
  const addedT = fieldMultiply(e, h);
  const addedZ = fieldMultiply(f, g);

  return {
    x: addedX,
    y: addedY,
    t: addedT,
    z: addedZ
  };
}

function fieldMultiply(a: Uint32Array, b: Uint32Array): Uint32Array {
  // Check if the input arrays have the correct length (8)
  if (a.length !== 8 || b.length !== 8) {
    throw new Error("Both input arrays must have a length of 8.");
  }

  // Initialize accumulator and other variables
  const accumulator = new Uint32Array(8).fill(0);
  let newA = Uint32Array.from(a);
  let newB = Uint32Array.from(b);
  let count = 0;

  // Assuming U256_ZERO and FIELD_ORDER are defined as Uint32Array of size 8
  const U256_ZERO = new Uint32Array(8).fill(0);
  const FIELD_ORDER = new Uint32Array(8); // Fill with appropriate values

  while (gt(newB, U256_ZERO)) {
    if ((newB[7] & 1) === 1) {
      // Assuming u256_add is a function that adds two Uint32Array of size 8
      const sum = u256Add(accumulator, newA);

      // Assuming gte is a function that checks if a >= b for Uint32Array of size 8
      const accumulatorGteAleo = gte(sum, FIELD_ORDER);

      if (accumulatorGteAleo) {
        // Assuming u256_sub is a function that subtracts b from a for Uint32Array of size 8
        accumulator.set(u256Sub(sum, FIELD_ORDER));
      } else {
        accumulator.set(sum);
      }
    }

    // Assuming u256_double is a function that doubles a Uint32Array of size 8
    newA = u256Double(newA);

    // Assuming field_reduce is a function that reduces a Uint32Array of size 8
    newA = fieldReduce(newA);

    // Right shift newB by 1
    newB = u256RightShift(newB, 1);

    count++;
  }

  return accumulator;
}

function fieldAdd(a: Uint32Array, b: Uint32Array) {
  var sum = u256Add(a, b);
  var result = fieldReduce(sum);
  return result;
}

function fieldSub(a: Uint32Array, b: Uint32Array): Uint32Array {
  var sub: Uint32Array;
  if (gte(a, b)) {
    sub = u256Sub(a, b);
  } else {
    var b_minus_a: Uint32Array = u256Sub(b, a);
    sub = u256Sub(FIELD_ORDER, b_minus_a);
  }

  return sub;
}

function mulByA(f: Uint32Array): Uint32Array {
  // mul by a is just negation of f
  return u256Sub(FIELD_ORDER, f);
}

function u256RightShift(a: Uint32Array, shift: number): Uint32Array {
  // Check if the input array has the correct length (8)
  if (a.length !== 8) {
    throw new Error("The input array must have a length of 8.");
  }

  const componentsToDrop = Math.floor(shift / 32);
  if (componentsToDrop >= 8) {
    return new Uint32Array(8).fill(0); // Equivalent to U256_ZERO
  }

  const bigShift = new Uint32Array(8).fill(0);

  // Shift out the components that need dropping
  for (let i = componentsToDrop; i < 8; i++) {
    bigShift[i] = a[i - componentsToDrop];
  }

  const shiftWithinComponent = shift % 32;

  if (shiftWithinComponent === 0) {
    return bigShift;
  }

  let carry = 0;
  for (let i = componentsToDrop; i < 8; i++) {
    // Assuming component_right_shift is a function that takes three numbers and returns [number, number]
    const componentResult = componentRightShift(bigShift[i], shiftWithinComponent, carry);
    bigShift[i] = componentResult[0];
    carry = componentResult[1];
  }

  return bigShift;
}

function componentRightShift(a: number, shift: number, carry: number): [number, number] {
  const shifted: [number, number] = [0, 0];
  shifted[0] = u32Wrap((a >> shift) + carry);
  shifted[1] = u32Wrap(a << (32 - shift));

  return shifted;
}

function fieldReduce(a: Uint32Array): Uint32Array {
  // Check if the input array has the correct length (8)
  if (a.length !== 8) {
    throw new Error("The input array must have a length of 8.");
  }

  // Initialize reduction and other variables
  let reduction = Uint32Array.from(a);

  // Assuming gte is a function that checks if a >= b for Uint32Array of size 8
  let aGteAleo = gte(reduction, FIELD_ORDER);

  while (aGteAleo) {
    // Assuming u256_sub is a function that subtracts b from a for Uint32Array of size 8
    reduction = u256Sub(reduction, FIELD_ORDER);
    aGteAleo = gte(reduction, FIELD_ORDER);
  }

  return reduction;
}

const u256Add = (p1: Uint32Array, p2: Uint32Array) => {
  let sum = new Uint32Array(8);
  let carry = 0;
  for (var i = 7; i >= 0; i--) {
    let componentResult = addComponents(p1[i], p2[i], carry);
    sum[i] = componentResult[0];
    carry = componentResult[1];
  }

  return sum;
}

function addComponents(a: number, b: number, carryIn: number): [number, number] {
  const sum: [number, number] = [0, 0];
  const total = u32Wrap(a + b + carryIn);

  sum[0] = total;
  sum[1] = 0;

  // If the total is less than a, then we know there was a carry
  // Need to subtract the carryIn for the edge case though, where a or b is 2^32 - 1 and carryIn is 1
  if (total < a || (u32Wrap(total - carryIn)) < a) {
    sum[1] = 1;
  }

  return sum;
}

function u256Sub(a: Uint32Array, b: Uint32Array): Uint32Array {
  // Check if the input arrays have the correct length (8)
  if (a.length !== 8 || b.length !== 8) {
    throw new Error("Both input arrays must have a length of 8.");
  }

  // Initialize sub and other variables
  const sub = new Uint32Array(8).fill(0);
  let carry = 0;

  for (let i = 7; i >= 0; i--) {
    // Assuming sub_components is a function that takes three numbers and returns [number, number]
    const componentResult = subComponents(a[i], b[i], carry);
    sub[i] = componentResult[0];
    carry = componentResult[1];
  }

  return sub;
}

function subComponents(a: number, b: number, carryIn: number): [number, number] {
  const sub: [number, number] = [0, 0];
  const total = u32Wrap(a - b - carryIn);

  sub[0] = total;
  sub[1] = 0;

  // If the total is greater than a, then we know there was a carry from a less significant component.
  // Need to add the carryIn for the edge case though, where a carryIn of 1 causes a component of a to underflow
  if (total > a || (u32Wrap(total + carryIn)) > a) {
    sub[1] = 1;
  }

  return sub;
}

function u256Double(a: Uint32Array): Uint32Array {
  // Check if the input array has the correct length (8)
  if (a.length !== 8) {
    throw new Error("The input array must have a length of 8.");
  }

  // Initialize double and other variables
  const double = new Uint32Array(8).fill(0);
  let carry = 0;

  for (let i = 7; i >= 0; i--) {
    // Assuming component_double is a function that takes two numbers and returns [number, number]
    const componentResult = componentDouble(a[i], carry);
    double[i] = componentResult[0];
    carry = componentResult[1];
  }

  return double;
}

function componentDouble(a: number, carry: number): [number, number] {
  const double: [number, number] = [0, 0];
  const total = u32Wrap(a * 2);

  double[0] = u32Wrap(total + carry);
  double[1] = 0;

  // If the total is less than a, then we know there was a carry
  if (total < a) {
    double[1] = 1;
  }

  return double;
}

function gt(a: Uint32Array, b: Uint32Array): boolean {
  // Check if the input arrays have the correct length (8)
  if (a.length !== 8 || b.length !== 8) {
    throw new Error("Both input arrays must have a length of 8.");
  }

  for (let i = 0; i < 8; i++) {
    if (a[i] < b[i]) {
      return false;
    }

    if (a[i] > b[i]) {
      return true;
    }
  }
  // If a's components are never greater, then a is equal to b
  return false;
}

function equal(a: Uint32Array, b: Uint32Array): boolean {
  for (var i = 0; i < 8; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }

  return true;
}

function gte(a: Uint32Array, b: Uint32Array): boolean {
  var agtb = gt(a, b);
  var aeqb = equal(a, b);
  return agtb || aeqb;
}

function u32Wrap(a: number): number {
  return new Uint32Array([a])[0];
}
