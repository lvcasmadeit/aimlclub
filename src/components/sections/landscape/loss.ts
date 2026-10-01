// A hand-tuned 2D loss surface plus three optimizers that descend it.
// Domain: x, z in [-EXTENT, EXTENT]. Pure math (no three.js) so it can be tested in isolation.

export const EXTENT = 1.2;

/** [centerX, centerZ, amplitude (negative = valley), sigma] */
const BUMPS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.55, -0.45, -0.55, 0.32], // global minimum
  [-0.6, 0.5, -0.38, 0.28], // local minimum
  [-0.4, -0.62, -0.26, 0.22], // shallow local minimum
  [0.05, 0.1, 0.32, 0.3], // central ridge / saddle
  [0.62, 0.6, 0.24, 0.3], // hill
];
const BOWL = 0.14;
const RIPPLE = 0.025;

export function loss(x: number, z: number) {
  let y = BOWL * (x * x + z * z) + RIPPLE * Math.sin(3.2 * x) * Math.cos(3.6 * z);
  for (const [cx, cz, a, s] of BUMPS) {
    y += a * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * s * s));
  }
  return y;
}

export function gradient(x: number, z: number): [number, number] {
  let gx = 2 * BOWL * x + RIPPLE * 3.2 * Math.cos(3.2 * x) * Math.cos(3.6 * z);
  let gz = 2 * BOWL * z - RIPPLE * 3.6 * Math.sin(3.2 * x) * Math.sin(3.6 * z);
  for (const [cx, cz, a, s] of BUMPS) {
    const e = a * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * s * s)) / (s * s);
    gx -= e * (x - cx);
    gz -= e * (z - cz);
  }
  return [gx, gz];
}

// ---------------------------------------------------------------------------
// Optimizers (one instance per race)

export const OPTIMIZERS = ["sgd", "momentum", "adam"] as const;
export type OptimizerName = (typeof OPTIMIZERS)[number];

export interface Optimizer {
  name: OptimizerName;
  x: number;
  z: number;
  /** Size of the last update; used to detect convergence. */
  lastStep: number;
  step(random: () => number): void;
}

const clamp = (value: number) => Math.max(-EXTENT + 0.05, Math.min(EXTENT - 0.05, value));

/** Approximately normal noise from two uniforms (Box–Muller). */
function gaussian(random: () => number) {
  return Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
}

export function createOptimizer(name: OptimizerName, x: number, z: number): Optimizer {
  let vx = 0;
  let vz = 0;
  let mx = 0;
  let mz = 0;
  let sx = 0;
  let sz = 0;
  let t = 0;

  const optimizer: Optimizer = {
    name,
    x,
    z,
    lastStep: Infinity,
    step(random) {
      const [gx, gz] = gradient(optimizer.x, optimizer.z);
      let dx = 0;
      let dz = 0;
      if (name === "sgd") {
        // Mini-batch noise proportional to the gradient, so it still settles at a minimum.
        const noise = 0.008 * Math.hypot(gx, gz);
        dx = -0.035 * gx + noise * gaussian(random);
        dz = -0.035 * gz + noise * gaussian(random);
      } else if (name === "momentum") {
        vx = 0.92 * vx - 0.02 * gx;
        vz = 0.92 * vz - 0.02 * gz;
        dx = vx;
        dz = vz;
      } else {
        t += 1;
        mx = 0.9 * mx + 0.1 * gx;
        mz = 0.9 * mz + 0.1 * gz;
        sx = 0.999 * sx + 0.001 * gx * gx;
        sz = 0.999 * sz + 0.001 * gz * gz;
        const correct1 = 1 - 0.9 ** t;
        const correct2 = 1 - 0.999 ** t;
        dx = (-0.03 * (mx / correct1)) / (Math.sqrt(sx / correct2) + 1e-8);
        dz = (-0.03 * (mz / correct1)) / (Math.sqrt(sz / correct2) + 1e-8);
      }
      optimizer.x = clamp(optimizer.x + dx);
      optimizer.z = clamp(optimizer.z + dz);
      optimizer.lastStep = Math.hypot(dx, dz);
    },
  };
  return optimizer;
}

/**
 * Starting points (found by simulation) where the optimizers end up in different minima:
 * e.g. from (-0.75, -0.75) SGD and Adam settle in a shallow valley while Momentum rolls on
 * to the global minimum. Cycled in order.
 */
export const START_POINTS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [-0.75, -0.75],
  [0.6, 0.6],
  [-0.15, 0],
];

/** Raw values dip below zero; shift for display so the global minimum reads ≈ 0.03. */
export const displayLoss = (value: number) => value + 0.5;
