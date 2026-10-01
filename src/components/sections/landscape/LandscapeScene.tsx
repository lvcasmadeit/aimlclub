"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useThemeVars } from "@/lib/useThemeVars";
import { cn } from "@/lib/utils";
import { createOptimizer, EXTENT, loss, OPTIMIZERS, START_POINTS, type Optimizer } from "./loss";

export interface RaceProgress {
  step: number;
  /** Raw loss per optimizer, in OPTIMIZERS order. */
  losses: number[];
}

interface LandscapeSceneProps {
  /** False when the hero is offscreen: stop rendering entirely. */
  active: boolean;
  reduceMotion: boolean;
  onProgress: (progress: RaceProgress) => void;
}

export default function LandscapeScene({ active, reduceMotion, onProgress }: LandscapeSceneProps) {
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const resume = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resume.current), []);

  return (
    <Canvas
      className={cn("transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0", dragging && "cursor-grabbing")}
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [1.9, 2.35, 1.9], fov: 38 }}
      onCreated={() => setReady(true)}
    >
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        autoRotate={autoRotate && !reduceMotion}
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI * 0.16}
        maxPolarAngle={Math.PI * 0.36}
        onStart={() => {
          clearTimeout(resume.current);
          setDragging(true);
          setAutoRotate(false);
        }}
        onEnd={() => {
          setDragging(false);
          resume.current = setTimeout(() => setAutoRotate(true), 2500);
        }}
      />
      <Landscape dragging={dragging} reduceMotion={reduceMotion} onProgress={onProgress} />
    </Canvas>
  );
}

// ---------------------------------------------------------------------------

const HEIGHT = 0.9; // world units per unit of loss
const GRID_LINES = 56;
const GRID_SEGMENTS = 96;
const STEPS_PER_SECOND = 32;
const MAX_STEPS = 600;
const SETTLE_STEPS = 15; // consecutive tiny updates before an optimizer counts as converged
const HOLD_SECONDS = 1.8;
const FADE_SECONDS = 0.6;
const LIFT = 0.012; // keeps trails and balls just above the wire grid

const THEME_VARS = ["foreground", "landscape-momentum", "landscape-adam", "landscape-glow"] as const;

const surfaceY = (x: number, z: number) => loss(x, z) * HEIGHT;

interface Race {
  optimizers: Optimizer[];
  calm: number[];
  steps: number;
  phase: "running" | "hold" | "fade";
  timer: number;
  accumulator: number;
  nextStart: number;
  random: () => number;
}

// Uniform writes go through these helpers so materials can be updated from refs/frame loops.
function setUniform(material: THREE.ShaderMaterial | null, name: string, value: number) {
  if (material) material.uniforms[name].value = value;
}

function setColor(material: THREE.ShaderMaterial | null, color: string) {
  material?.uniforms.uColor.value.set(color);
}

interface LandscapeProps {
  dragging: boolean;
  reduceMotion: boolean;
  onProgress: (progress: RaceProgress) => void;
}

function Landscape({ dragging, reduceMotion, onProgress }: LandscapeProps) {
  const theme = useThemeVars(THEME_VARS);
  const blending = theme["landscape-glow"] === "1" ? THREE.AdditiveBlending : THREE.NormalBlending;
  const colors = useMemo(
    () => [theme.foreground, theme["landscape-momentum"], theme["landscape-adam"]],
    [theme],
  );
  const ballColors = useMemo(
    () => Float32Array.from(colors.flatMap((color) => new THREE.Color(color).toArray())),
    [colors],
  );

  // Created once; colors/uniform values are updated through the material refs.
  const uniforms = useMemo(
    () => ({
      grid: { uColor: { value: new THREE.Color() }, uOpacity: { value: 0.32 } },
      trails: OPTIMIZERS.map(() => ({ uColor: { value: new THREE.Color() }, uHead: { value: 0 }, uFade: { value: 1 } })),
      ball: { uSize: { value: 120 } },
    }),
    [],
  );

  const grid = useMemo(() => createGrid(), []);
  const surface = useMemo(() => createSurface(), []);
  const ring = useMemo(() => circle(0.05, 48), []);
  useEffect(
    () => () => {
      grid.dispose();
      surface.dispose();
      ring.dispose();
    },
    [grid, surface, ring],
  );

  const buffers = useMemo(
    () => ({
      trails: OPTIMIZERS.map(() => new Float32Array(MAX_STEPS * 3)),
      trailIndex: Float32Array.from({ length: MAX_STEPS }, (_, i) => i),
      balls: new Float32Array(OPTIMIZERS.length * 3),
    }),
    [],
  );

  const tilt = useRef<THREE.Group>(null);
  const gridMaterial = useRef<THREE.ShaderMaterial>(null);
  const trailGeometries = useRef<Array<THREE.BufferGeometry | null>>([]);
  const trailMaterials = useRef<Array<THREE.ShaderMaterial | null>>([]);
  const ballGeometry = useRef<THREE.BufferGeometry>(null);
  const startMarker = useRef<THREE.LineLoop>(null);
  const hoverMarker = useRef<THREE.LineLoop>(null);
  const pointer = useRef(new THREE.Vector2());

  // Race state changes every step and never needs a React render, so it lives in a ref.
  const race = useRef<Race | null>(null);

  const writePoint = (target: Float32Array, index: number, x: number, z: number) => {
    target[index * 3] = x;
    target[index * 3 + 1] = surfaceY(x, z) + LIFT;
    target[index * 3 + 2] = z;
  };

  const report = (state: Race) =>
    onProgress({ step: state.steps, losses: state.optimizers.map((o) => loss(o.x, o.z)) });

  /** Advance one optimizer step for every optimizer that hasn't converged. */
  const advance = (state: Race) => {
    if (state.steps >= MAX_STEPS - 1) return false;
    state.steps += 1;
    let moving = false;
    state.optimizers.forEach((optimizer, i) => {
      if (state.calm[i] < SETTLE_STEPS) {
        optimizer.step(state.random);
        state.calm[i] = optimizer.lastStep < 1e-3 ? state.calm[i] + 1 : 0;
        moving = true;
      }
      writePoint(trailGeometries.current[i]!.attributes.position.array as Float32Array, state.steps, optimizer.x, optimizer.z);
    });
    return moving;
  };

  const startRace = (x: number, z: number) => {
    const previous = race.current;
    const state: Race = {
      optimizers: OPTIMIZERS.map((name) => createOptimizer(name, x, z)),
      calm: OPTIMIZERS.map(() => 0),
      steps: 0,
      phase: "running",
      timer: 0,
      accumulator: 0,
      nextStart: previous ? previous.nextStart : 1,
      random: previous?.random ?? mulberry32(11),
    };
    race.current = state;
    trailGeometries.current.forEach((geometry) => {
      if (geometry) writePoint(geometry.attributes.position.array as Float32Array, 0, x, z);
    });
    startMarker.current?.position.set(x, surfaceY(x, z) + LIFT, z);
    trailMaterials.current.forEach((material) => setUniform(material, "uFade", 1));

    // Reduced motion: solve the whole race now and show the finished paths.
    if (reduceMotion) {
      while (advance(state));
      state.phase = "hold";
    }
    sync(state);
  };

  /** Push race state to the GPU buffers + HUD. */
  const sync = (state: Race) => {
    const balls = ballGeometry.current;
    if (!balls) return;
    state.optimizers.forEach((optimizer, i) => {
      writePoint(balls.attributes.position.array as Float32Array, i, optimizer.x, optimizer.z);
      const geometry = trailGeometries.current[i];
      if (geometry) {
        geometry.setDrawRange(0, state.steps + 1);
        geometry.attributes.position.needsUpdate = true;
      }
      setUniform(trailMaterials.current[i], "uHead", state.steps);
    });
    balls.attributes.position.needsUpdate = true;
    report(state);
  };

  useEffect(() => {
    setColor(gridMaterial.current, theme.foreground);
    trailMaterials.current.forEach((material, i) => setColor(material, colors[i]));
  }, [theme, colors]);

  // Kick off the first race once the scene objects exist.
  useEffect(() => {
    const [x, z] = START_POINTS[0];
    startRace(x, z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cursor parallax: track the pointer across the whole window, not just the canvas.
  useEffect(() => {
    if (reduceMotion) return;
    const move = (event: PointerEvent) => {
      pointer.current.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [reduceMotion]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const state = race.current;

    if (tilt.current && !reduceMotion && !dragging) {
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, pointer.current.y * 0.08, 3, delta);
      tilt.current.rotation.z = THREE.MathUtils.damp(tilt.current.rotation.z, -pointer.current.x * 0.06, 3, delta);
    }

    if (!state || reduceMotion) return;

    if (state.phase === "running") {
      state.accumulator += delta * STEPS_PER_SECOND;
      let changed = false;
      while (state.accumulator >= 1) {
        state.accumulator -= 1;
        changed = true;
        if (!advance(state)) {
          state.phase = "hold";
          break;
        }
      }
      if (changed) sync(state);
    } else if (state.phase === "hold") {
      state.timer += delta;
      if (state.timer >= HOLD_SECONDS) {
        state.phase = "fade";
        state.timer = 0;
      }
    } else {
      state.timer += delta;
      const fade = Math.max(0, 1 - state.timer / FADE_SECONDS);
      trailMaterials.current.forEach((material) => setUniform(material, "uFade", fade));
      if (fade === 0) {
        const [x, z] = START_POINTS[state.nextStart % START_POINTS.length];
        state.nextStart += 1;
        startRace(x, z);
      }
    }
  });

  // --- pointer: preview ring + click to drop a new race ----------------------

  const handleMove = (event: ThreeEvent<PointerEvent>) => {
    const marker = hoverMarker.current;
    if (!marker || dragging) return;
    const { x, z } = event.point;
    marker.visible = true;
    marker.position.set(x, surfaceY(x, z) + LIFT, z);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 6) return; // was a drag
    const limit = EXTENT * 0.9;
    startRace(THREE.MathUtils.clamp(event.point.x, -limit, limit), THREE.MathUtils.clamp(event.point.z, -limit, limit));
  };

  return (
    <group ref={tilt} position={[0, -0.05, 0]}>
      {/* Wire grid, fading out in a circle toward the edges. */}
      <lineSegments geometry={grid}>
        <shaderMaterial
          ref={gridMaterial}
          vertexShader={GRID_VERTEX}
          fragmentShader={GRID_FRAGMENT}
          uniforms={uniforms.grid}
          transparent
          depthWrite={false}
          blending={blending}
        />
      </lineSegments>

      {/* Invisible surface: pointer target for hover + click. */}
      <mesh
        geometry={surface}
        onPointerMove={handleMove}
        onPointerOut={() => {
          if (hoverMarker.current) hoverMarker.current.visible = false;
        }}
        onClick={handleClick}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      {OPTIMIZERS.map((name, i) => (
        <line key={name}>
          <bufferGeometry ref={(geometry) => void (trailGeometries.current[i] = geometry as THREE.BufferGeometry | null)}>
            <bufferAttribute attach="attributes-position" args={[buffers.trails[i], 3]} usage={THREE.DynamicDrawUsage} />
            <bufferAttribute attach="attributes-aIndex" args={[buffers.trailIndex, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={(material) => void (trailMaterials.current[i] = material)}
            vertexShader={TRAIL_VERTEX}
            fragmentShader={TRAIL_FRAGMENT}
            uniforms={uniforms.trails[i]}
            transparent
            depthWrite={false}
            blending={blending}
          />
        </line>
      ))}

      <points frustumCulled={false}>
        <bufferGeometry ref={ballGeometry}>
          <bufferAttribute attach="attributes-position" args={[buffers.balls, 3]} usage={THREE.DynamicDrawUsage} />
          <bufferAttribute attach="attributes-color" args={[ballColors, 3]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={BALL_VERTEX}
          fragmentShader={BALL_FRAGMENT}
          uniforms={uniforms.ball}
          vertexColors
          transparent
          depthWrite={false}
          blending={blending}
        />
      </points>

      <lineLoop ref={startMarker} geometry={ring}>
        <lineBasicMaterial color={theme.foreground} transparent opacity={0.55} depthWrite={false} />
      </lineLoop>
      <lineLoop ref={hoverMarker} geometry={ring} visible={false} scale={1.4}>
        <lineBasicMaterial color={theme["landscape-adam"]} transparent opacity={0.8} depthWrite={false} />
      </lineLoop>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Geometry

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Grid lines along x and z, each a polyline sampled on the surface. */
function createGrid() {
  const positions: number[] = [];
  const at = (i: number, count: number) => -EXTENT + (2 * EXTENT * i) / count;
  for (let line = 0; line <= GRID_LINES; line++) {
    const fixed = at(line, GRID_LINES);
    for (let s = 0; s < GRID_SEGMENTS; s++) {
      const a = at(s, GRID_SEGMENTS);
      const b = at(s + 1, GRID_SEGMENTS);
      positions.push(a, surfaceY(a, fixed), fixed, b, surfaceY(b, fixed), fixed); // along x
      positions.push(fixed, surfaceY(fixed, a), a, fixed, surfaceY(fixed, b), b); // along z
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function createSurface() {
  const geometry = new THREE.PlaneGeometry(2 * EXTENT, 2 * EXTENT, 64, 64).rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    position.setY(i, surfaceY(position.getX(i), position.getZ(i)));
  }
  geometry.computeBoundingSphere();
  return geometry;
}

/** Flat ring in the XZ plane. */
function circle(radius: number, segments: number) {
  const points = Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  });
  return new THREE.BufferGeometry().setFromPoints(points);
}

// ---------------------------------------------------------------------------
// Shaders

const GRID_VERTEX = /* glsl */ `
  varying float vFade;
  void main() {
    vFade = 1.0 - smoothstep(0.62, 1.0, length(position.xz) / ${EXTENT.toFixed(2)});
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GRID_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity * vFade);
  }
`;

// Older trail points fade out; uFade fades the whole trail between races.
const TRAIL_VERTEX = /* glsl */ `
  attribute float aIndex;
  uniform float uHead;
  varying float vAge;
  void main() {
    vAge = clamp((uHead - aIndex) / 140.0, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TRAIL_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uFade;
  varying float vAge;
  void main() {
    gl_FragColor = vec4(uColor, mix(0.95, 0.2, vAge) * uFade);
  }
`;

const BALL_VERTEX = /* glsl */ `
  uniform float uSize;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize / -mvPosition.z;
  }
`;

// Solid core + soft halo.
const BALL_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.2, 0.14, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.35;
    gl_FragColor = vec4(vColor, max(core, halo));
  }
`;
