"use client";

import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { AboutCardId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AboutCardSceneProps {
  id: AboutCardId;
  active: boolean;
  /** False when offscreen or prefers-reduced-motion: no idle sway, render on demand only. */
  animate: boolean;
  /** Rendered if WebGL is unavailable. */
  fallback: ReactNode;
}

/**
 * One small WebGL canvas per card. Each object's glass is a single merged mesh so the
 * transmission material only renders one extra pass; only the active, in-view card loops.
 */
export default function AboutCardScene({ id, active, animate, fallback }: AboutCardSceneProps) {
  const palette = useThemePalette();
  const [ready, setReady] = useState(false);

  return (
    <Canvas
      className={cn("transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
      frameloop={active && animate ? "always" : "demand"}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 7.5], fov: 28 }}
      fallback={fallback}
      onCreated={() => setReady(true)}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[-3, 4, 5]} intensity={1.2} />
      <Environment key={palette.key} resolution={128}>
        {/* Tinted "room" so reflections read pearly instead of picking up black. */}
        <color attach="background" args={[palette.backdrop]} />
        <Lightformer form="rect" color="#ffffff" intensity={3} position={[-4, 4, 4]} scale={[5, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" color={palette.ice} intensity={4} position={[5, 1, -3]} scale={[3, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" color={palette.periwinkle} intensity={2} position={[-4, -3, 2]} scale={[4, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" color="#ffffff" intensity={2} position={[2, 4, 3]} scale={2} target={[0, 0, 0]} />
      </Environment>
      <Model id={id} palette={palette} active={active} animate={animate} />
    </Canvas>
  );
}

// ---------------------------------------------------------------------------
// Theme palette (read from the CSS tokens in globals.css, refreshed on theme toggle)

interface Palette {
  key: string;
  /** Base color the glass refracts (lighter than the card so the glass reads frosted, not inky). */
  backdrop: string;
  ice: string;
  sky: string;
  periwinkle: string;
  cobalt: string;
  glass: string;
}

function readPalette(): Palette {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim();
  const palette = {
    backdrop: read("--glass-backdrop"),
    ice: read("--blob-ice"),
    sky: read("--blob-sky"),
    periwinkle: read("--blob-periwinkle"),
    cobalt: read("--blob-cobalt"),
    glass: read("--glass-tint"),
  };
  return { ...palette, key: Object.values(palette).join() };
}

function useThemePalette() {
  const [palette, setPalette] = useState(readPalette);

  useEffect(() => {
    const observer = new MutationObserver(() => setPalette(readPalette()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return palette;
}

/** What the glass "sees" behind it: soft blue blobs, roughly matching the CSS blobs. */
function useBlobTexture(palette: Palette) {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = palette.backdrop;
    ctx.fillRect(0, 0, size, size);
    const blobs: Array<[string, number, number, number]> = [
      [palette.ice, 0.3, 0.35, 0.5],
      [palette.periwinkle, 0.72, 0.6, 0.55],
      [palette.sky, 0.55, 0.22, 0.4],
      [palette.cobalt, 0.25, 0.78, 0.45],
    ];
    for (const [color, x, y, r] of blobs) {
      const gradient = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, r * size);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    return result;
  }, [palette]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

// ---------------------------------------------------------------------------
// Model + motion

const poses: Record<AboutCardId, [number, number, number]> = {
  hacks: [0.12, -0.3, -0.08],
  speakers: [0.1, -0.3, -0.16],
  workshops: [0.38, -0.62, 0],
  projects: [0.18, -0.5, 0],
};

interface ModelProps {
  id: AboutCardId;
  palette: Palette;
  active: boolean;
  animate: boolean;
}

function Model({ id, palette, active, animate }: ModelProps) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const pose = poses[id];
  const moving = active && animate;

  // Kick a frame on (de)activation so demand-mode canvases ease back to rest.
  useEffect(() => invalidate(), [active, invalidate]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const targetY = pose[1] + (moving ? Math.sin(t * 0.6) * 0.35 : 0);
    const targetLift = moving ? Math.sin(t * 0.9) * 0.06 : 0;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 4, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, targetLift, 4, delta);
    const settled = Math.abs(g.rotation.y - targetY) < 1e-3 && Math.abs(g.position.y - targetLift) < 1e-3;
    if (!moving && !settled) state.invalidate();
  });

  return (
    <group ref={group} rotation={pose}>
      {id === "hacks" && <Bolt palette={palette} />}
      {id === "speakers" && <Microphone palette={palette} />}
      {id === "workshops" && <Laptop palette={palette} />}
      {id === "projects" && <Network palette={palette} />}
    </group>
  );
}

function Glass({ palette }: { palette: Palette }) {
  const background = useBlobTexture(palette);
  return (
    <MeshTransmissionMaterial
      background={background}
      samples={6}
      resolution={256}
      backside
      backsideThickness={0.4}
      thickness={0.8}
      roughness={0.28}
      transmission={1}
      ior={1.45}
      chromaticAberration={0.08}
      anisotropicBlur={0.4}
      distortion={0.15}
      distortionScale={0.4}
      temporalDistortion={0}
      clearcoat={1}
      clearcoatRoughness={0.1}
      iridescence={0.7}
      iridescenceIOR={1.3}
      iridescenceThicknessRange={[100, 500]}
      color={palette.glass}
    />
  );
}

/** Merge parts into one geometry so the glass is a single mesh (one transmission pass). */
function merge(parts: THREE.BufferGeometry[]) {
  const merged = mergeGeometries(parts.map((part) => (part.index ? part.toNonIndexed() : part)));
  parts.forEach((part) => part.dispose());
  return merged;
}

/** Create a three.js resource once and free its GPU memory on unmount. */
function useDisposable<T extends { dispose: () => void }>(factory: () => T) {
  const [value] = useState(factory);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

// ---------------------------------------------------------------------------
// Objects (≈2 units tall, centered on the origin)

// Same outline as a 128×220 SVG bolt; mapped to ~2 units tall, centered.
const boltPoints: Array<[number, number]> = [
  [36, 10], [104, 10], [72, 94], [116, 94], [32, 210], [60, 122], [12, 122],
];

function Bolt({ palette }: { palette: Palette }) {
  const geometry = useDisposable(() => {
    const shape = new THREE.Shape(boltPoints.map(([x, y]) => new THREE.Vector2((x - 64) * 0.01, -(y - 110) * 0.01)));
    const bolt = new THREE.ExtrudeGeometry(shape, {
      depth: 0.34,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.05,
      bevelSegments: 8,
    });
    bolt.center();
    const satellite = new THREE.SphereGeometry(0.17, 48, 48).translate(0.82, 0.78, 0.05);
    return merge([bolt, satellite]);
  });

  return (
    <mesh geometry={geometry}>
      <Glass palette={palette} />
    </mesh>
  );
}

const MIC_HEAD = new THREE.Vector3(0, 0.55, 0);

function Microphone({ palette }: { palette: Palette }) {
  const geometry = useDisposable(() => {
    const { x, y, z } = MIC_HEAD;
    // Sound waves: two quarter-arcs either side of the head, facing the camera.
    const arcs = [0.7, 0.9].flatMap((radius) =>
      [-Math.PI / 4, (3 * Math.PI) / 4].map((angle) =>
        new THREE.TorusGeometry(radius, 0.035, 16, 64, Math.PI / 2).rotateZ(angle).translate(x, y, z),
      ),
    );
    return merge([
      new THREE.SphereGeometry(0.42, 64, 64).translate(x, y, z), // head
      new THREE.TorusGeometry(0.42, 0.03, 16, 96).rotateX(Math.PI / 2).translate(x, y, z), // grille band
      new THREE.TorusGeometry(0.42, 0.03, 16, 96).translate(x, y, z), // grille rib
      new THREE.TorusGeometry(0.22, 0.05, 16, 64).rotateX(Math.PI / 2).translate(0, 0.12, 0), // collar
      new THREE.CylinderGeometry(0.2, 0.14, 1.05, 48).translate(0, -0.42, 0), // handle
      new THREE.SphereGeometry(0.14, 32, 32).scale(1, 0.6, 1).translate(0, -0.95, 0), // end cap
      ...arcs,
    ]);
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <Glass palette={palette} />
      </mesh>
      {/* Glowing core inside the head ("voice"), refracted through the grille. */}
      <mesh position={MIC_HEAD}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshBasicMaterial color={palette.ice} toneMapped={false} />
      </mesh>
    </group>
  );
}

const LID_TILT = -0.26; // ≈105° open
const HINGE = new THREE.Vector3(0, 0.05, -0.675);

function Laptop({ palette }: { palette: Palette }) {
  const geometry = useDisposable(() => {
    const base = new RoundedBoxGeometry(2, 0.1, 1.35, 4, 0.045);
    const lid = new RoundedBoxGeometry(2, 1.35, 0.08, 4, 0.04)
      .translate(0, 0.675, 0.04)
      .rotateX(LID_TILT)
      .translate(HINGE.x, HINGE.y, HINGE.z);
    return merge([base, lid]);
  });
  const screen = useMemo(() => gradientTexture(palette.ice, palette.periwinkle), [palette.ice, palette.periwinkle]);
  useEffect(() => () => screen.dispose(), [screen]);

  return (
    <group scale={0.85} position={[0, -0.55, 0.2]}>
      <mesh geometry={geometry}>
        <Glass palette={palette} />
      </mesh>
      {/* Glowing screen + "code" lines, refracted through the glass lid. */}
      <group position={HINGE} rotation={[LID_TILT, 0, 0]}>
        <mesh position={[0, 0.675, 0.085]}>
          <planeGeometry args={[1.84, 1.19]} />
          <meshBasicMaterial map={screen} toneMapped={false} transparent opacity={0.9} />
        </mesh>
        {[0.9, 1.2, 0.7, 1.0].map((width, line) => (
          <mesh key={line} position={[-0.72 + width / 2, 1.0 - line * 0.2, 0.09]}>
            <planeGeometry args={[width, 0.07]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.75} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.053, 0.38]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.36]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function gradientTexture(from: string, to: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 128, 128);
  gradient.addColorStop(0, from);
  gradient.addColorStop(1, to);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 1 → 3 → 1 network: input, three hidden, output.
const nodes: Array<{ position: [number, number, number]; radius: number }> = [
  { position: [-1, 0, 0], radius: 0.24 },
  { position: [0, 0.75, 0], radius: 0.24 },
  { position: [0, 0, 0], radius: 0.28 },
  { position: [0, -0.75, 0], radius: 0.24 },
  { position: [1, 0, 0], radius: 0.24 },
];
const edges: Array<[number, number]> = [
  [0, 1], [0, 2], [0, 3],
  [1, 4], [2, 4], [3, 4],
];

function Network({ palette }: { palette: Palette }) {
  const geometry = useDisposable(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const spheres = nodes.map(({ position, radius }) =>
      new THREE.SphereGeometry(radius, 48, 48).translate(...position),
    );
    const rods = edges.map(([a, b]) => {
      const start = new THREE.Vector3(...nodes[a].position);
      const end = new THREE.Vector3(...nodes[b].position);
      const direction = end.clone().sub(start);
      const rod = new THREE.CylinderGeometry(0.045, 0.045, direction.length(), 24);
      rod.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, direction.normalize()));
      const middle = start.add(end).multiplyScalar(0.5);
      return rod.translate(middle.x, middle.y, middle.z);
    });
    return merge([...spheres, ...rods]);
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <Glass palette={palette} />
      </mesh>
      {/* Glowing core inside the output node. */}
      <mesh position={nodes[4].position}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshBasicMaterial color={palette.ice} toneMapped={false} />
      </mesh>
    </group>
  );
}
