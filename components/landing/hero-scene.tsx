'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber';
import { Float, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const CYAN = '#22d3ee';
const BLUE = '#3b82f6';
const EMERALD = '#34d399';

/** Expanding radar rings on the ground plane — the signature, in 3D. */
function RadarRings({ reduced }: { reduced: boolean }) {
  const count = 3;
  const refs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const phase = (t * 0.35 + i / count) % 1;
      const s = 0.6 + phase * 3.4;
      m.scale.set(s, s, s);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.5 * (1 - phase));
    });
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <ringGeometry args={[0.92, 1, 64]} />
          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
      {/* Static base ring */}
      <mesh>
        <ringGeometry args={[1.28, 1.34, 64]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.16}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** A single location pin (teardrop head + point). */
function Pin({ color = CYAN, ...props }: ThreeElements['group'] & { color?: string }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.1}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.12, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.11, 0.28, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

/** Pins orbiting the device. */
function OrbitingPins({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (reduced || !group.current) return;
    group.current.rotation.y += delta * 0.35;
    group.current.children.forEach((c, i) => {
      c.position.y = Math.sin(state.clock.elapsedTime * 1.2 + i * 2) * 0.18;
    });
  });
  return (
    <group ref={group}>
      <Pin position={[2.5, 0.4, 0.4]} color={CYAN} />
      <Pin position={[-2.3, -0.2, 1.1]} color={EMERALD} />
      <Pin position={[0.6, 0.7, -2.6]} color={BLUE} />
    </group>
  );
}

/** The recovered phone: floating device with a glowing signal screen. */
function PhoneDevice() {
  const screen = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (screen.current) {
      screen.current.emissiveIntensity =
        0.85 + Math.sin(state.clock.elapsedTime * 2.2) * 0.25;
    }
  });
  return (
    <group>
      {/* Body */}
      <RoundedBox args={[1.55, 3.1, 0.22]} radius={0.16} smoothness={6}>
        <meshStandardMaterial color="#0e1728" roughness={0.35} metalness={0.6} />
      </RoundedBox>
      {/* Screen */}
      <RoundedBox
        args={[1.34, 2.86, 0.02]}
        radius={0.1}
        smoothness={5}
        position={[0, 0, 0.12]}
      >
        <meshStandardMaterial
          ref={screen}
          color="#062330"
          emissive={CYAN}
          emissiveIntensity={0.9}
          roughness={0.2}
        />
      </RoundedBox>
      {/* Ping dot on screen */}
      <mesh position={[0, 0, 0.14]}>
        <circleGeometry args={[0.14, 32]} />
        <meshBasicMaterial color="#eaffff" />
      </mesh>
      <mesh position={[0, 0, 0.135]}>
        <ringGeometry args={[0.26, 0.3, 40]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

/** Everything that reacts to the pointer for a subtle parallax tilt. */
function SceneContent({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const targetY = reduced ? 0.3 : state.pointer.x * 0.35 + 0.3;
    const targetX = reduced ? 0 : -state.pointer.y * 0.2;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 5, 5]} intensity={2.4} color={CYAN} />
      <pointLight position={[-5, -2, 2]} intensity={1.4} color={BLUE} />
      <directionalLight position={[0, 3, 4]} intensity={0.7} />

      <group ref={group}>
        <Float
          speed={reduced ? 0 : 1.4}
          rotationIntensity={reduced ? 0 : 0.4}
          floatIntensity={reduced ? 0 : 0.6}
        >
          <PhoneDevice />
        </Float>
        <OrbitingPins reduced={reduced} />
        <RadarRings reduced={reduced} />
      </group>

      <Sparkles
        count={60}
        scale={[10, 6, 6]}
        size={2.2}
        speed={reduced ? 0 : 0.3}
        opacity={0.5}
        color={CYAN}
      />
    </>
  );
}

export default function HeroScene() {
  const reduced = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6.5], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SceneContent reduced={reduced} />
      </Suspense>
    </Canvas>
  );
}
