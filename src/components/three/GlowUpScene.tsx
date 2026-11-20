import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SECTIONS } from '../../data/catalog';
import { SectionId } from '../../types/glowup';

interface GlowUpSceneProps {
  scrollProgressRef: MutableRefObject<number>;
  activeSection: SectionId;
  reducedMotion: boolean;
}

// Software-WebGL probe from Three.js architectural standards
function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

// Reusable math helpers outside animation loop (zero per-frame GC)
const _dummy = new THREE.Object3D();
const _targetColor = new THREE.Color();

function StudioEnvironmentRig() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    return () => {
      scene.environment = null;
      envTarget.dispose();
    };
  }, [gl, scene]);

  return null;
}

function FloatingParticles({
  count,
  scrollProgressRef,
  reducedMotion,
}: {
  count: number;
  scrollProgressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const items: { x: number; y: number; z: number; scale: number; speed: number; phase: number; tint: number }[] = [];
    for (let i = 0; i < count; i++) {
      items.push({
        x: (Math.sin(i * 12.9898) * 0.5) * 14,
        y: ((i / count) - 0.5) * 9,
        z: -2 - (Math.cos(i * 4.1414) * 0.5 + 0.5) * 5,
        scale: 0.02 + (i % 5) * 0.008,
        speed: 0.25 + (i % 7) * 0.06,
        phase: i * 0.9,
        tint: i % 3,
      });
    }
    return items;
  }, [count]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const colors = ['#D9B18C', '#F5DDE6', '#E8DFF5'];
    particles.forEach((p, idx) => {
      _targetColor.set(colors[p.tint]);
      mesh.setColorAt(idx, _targetColor);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [particles]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = reducedMotion ? 0 : clock.getElapsedTime();
    const scrollShift = scrollProgressRef.current * 2.5;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const yOffset = Math.sin(t * p.speed + p.phase) * 0.35;
      const xOffset = Math.cos(t * p.speed * 0.7 + p.phase) * 0.22;
      _dummy.position.set(p.x + xOffset, p.y + yOffset - scrollShift * 0.15, p.z);
      _dummy.scale.setScalar(p.scale * (1 + Math.sin(t * 1.4 + p.phase) * 0.2));
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#FFF9F0"
        emissive="#D9B18C"
        emissiveIntensity={0.45}
        roughness={0.25}
        metalness={0.6}
      />
    </instancedMesh>
  );
}

/**
 * Composite 10-part procedural 3D Skincare Trio on a studio travertine pedestal
 * (Dropper Serum Bottle + Cream Jar + Mist Flask)
 */
function SkincareTrioAssembly({
  activeSection,
  scrollProgressRef,
  isSoftwareGl,
  reducedMotion,
}: {
  activeSection: SectionId;
  scrollProgressRef: MutableRefObject<number>;
  isSoftwareGl: boolean;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const bottleGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.36, 0.0),
      new THREE.Vector2(0.38, 0.08),
      new THREE.Vector2(0.38, 0.72),
      new THREE.Vector2(0.26, 0.92),
      new THREE.Vector2(0.16, 0.96),
      new THREE.Vector2(0.16, 1.12),
    ];
    return new THREE.LatheGeometry(pts, 32);
  }, []);

  const botanicalCurve = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.7, -0.2, -0.2),
      new THREE.Vector3(-0.95, 0.45, 0.1),
      new THREE.Vector3(-0.65, 1.15, 0.2),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.014, 8, false);
  }, []);

  useEffect(() => {
    return () => {
      bottleGeo.dispose();
      botanicalCurve.dispose();
    };
  }, [bottleGeo, botanicalCurve]);

  useFrame(({ pointer }, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const showBottles = activeSection === 'understand' || activeSection === 'products';
    const targetScale = showBottles ? 1.0 : 0.001;
    const nextScale = THREE.MathUtils.damp(g.scale.x, targetScale, 5, delta);
    g.scale.setScalar(nextScale);
    g.visible = nextScale > 0.02;

    if (!g.visible) return;

    const targetX = activeSection === 'understand' ? 1.75 : 2.15;
    const targetY = activeSection === 'understand' ? -0.38 : -0.6;
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX + (reducedMotion ? 0 : pointer.x * 0.22), 4, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY + (reducedMotion ? 0 : pointer.y * 0.14), 4, delta);

    const targetRotY = -0.35 + scrollProgressRef.current * Math.PI * 1.4 + (reducedMotion ? 0 : pointer.x * 0.35);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotY, 4, delta);
  });

  const glassProps = isSoftwareGl
    ? { transparent: true, opacity: 0.42, roughness: 0.15, metalness: 0.1 }
    : { transmission: 0.88, thickness: 0.6, ior: 1.48, roughness: 0.12, transparent: true, opacity: 1 };

  return (
    <group ref={groupRef} position={[1.85, -0.4, -0.4]} scale={0.001}>
      {/* Grounded Pedestal Disc (y=0 bottom flush) */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[1.15, 1.24, 0.16, 48]} />
        <meshStandardMaterial color="#36222E" roughness={0.62} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[1.08, 1.08, 0.02, 48]} />
        <meshStandardMaterial color="#D9B18C" roughness={0.22} metalness={0.88} />
      </mesh>

      {/* Hero Dropper Serum Bottle */}
      <group position={[0, 0.02, 0.1]}>
        <mesh geometry={bottleGeo} renderOrder={2}>
          <meshPhysicalMaterial color="#F5DDE6" {...glassProps} clearcoat={1} />
        </mesh>
        {/* Inner golden serum core */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.29, 0.29, 0.64, 24]} />
          <meshStandardMaterial color="#D9B18C" roughness={0.25} metalness={0.1} transparent opacity={0.85} />
        </mesh>
        {/* Rose-gold collar */}
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.18, 0.19, 0.16, 24]} />
          <meshStandardMaterial color="#D9B18C" roughness={0.16} metalness={0.95} />
        </mesh>
        {/* Ivory dropper bulb */}
        <mesh position={[0, 1.24, 0]}>
          <capsuleGeometry args={[0.11, 0.16, 12, 20]} />
          <meshStandardMaterial color="#FFF9F0" roughness={0.45} metalness={0.05} />
        </mesh>
      </group>

      {/* Cream Jar (Left front) */}
      <group position={[-0.58, 0.02, 0.35]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.31, 0.29, 0.4, 28]} />
          <meshPhysicalMaterial color="#E8DFF5" {...glassProps} clearcoat={0.9} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.11, 28]} />
          <meshStandardMaterial color="#D9B18C" roughness={0.18} metalness={0.92} />
        </mesh>
      </group>

      {/* Botanical Essence Mist (Right back) */}
      <group position={[0.56, 0.02, -0.22]}>
        <mesh position={[0, 0.56, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 1.12, 28]} />
          <meshPhysicalMaterial color="#FFF9F0" {...glassProps} clearcoat={0.95} />
        </mesh>
        <mesh position={[0, 1.22, 0]}>
          <cylinderGeometry args={[0.14, 0.15, 0.2, 20]} />
          <meshStandardMaterial color="#D9B18C" roughness={0.15} metalness={0.95} />
        </mesh>
      </group>

      {/* Delicate botanical stem curve */}
      <mesh geometry={botanicalCurve}>
        <meshStandardMaterial color="#D9B18C" roughness={0.35} metalness={0.75} />
      </mesh>
    </group>
  );
}

/**
 * Luminous Beauty Intelligence Orb + Meridian Rings + Ingredient Pearls
 */
function BeautyIntelligenceOrb({
  activeSection,
  isSoftwareGl,
  reducedMotion,
}: {
  activeSection: SectionId;
  isSoftwareGl: boolean;
  reducedMotion: boolean;
}) {
  const orbGroup = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const pearlsRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    const g = orbGroup.current;
    if (!g) return;

    const isOrbSection =
      activeSection === 'hero' ||
      activeSection === 'assistant' ||
      activeSection === 'analysis' ||
      activeSection === 'experience';

    const targetScale =
      activeSection === 'assistant'
        ? 1.12
        : activeSection === 'experience'
          ? 1.0
          : activeSection === 'hero'
            ? 0.78
            : activeSection === 'analysis'
              ? 0.68
              : 0.001;

    const nextScale = THREE.MathUtils.damp(g.scale.x, targetScale, 4.5, delta);
    g.scale.setScalar(nextScale);
    g.visible = nextScale > 0.02 && isOrbSection;

    if (!g.visible) return;

    const targetX =
      activeSection === 'assistant'
        ? 1.65
        : activeSection === 'hero'
          ? 2.15
          : activeSection === 'experience'
            ? 0
            : -2.25;
    const targetY = activeSection === 'experience' ? 0.55 : 0.08;

    g.position.x = THREE.MathUtils.damp(g.position.x, targetX + (reducedMotion ? 0 : pointer.x * 0.24), 3.8, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY + (reducedMotion ? 0 : pointer.y * 0.16), 3.8, delta);

    const t = reducedMotion ? 0 : clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = 0.55 + t * 0.22;
      ring1Ref.current.rotation.y = t * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -0.75 + t * 0.15;
      ring2Ref.current.rotation.z = t * 0.26;
    }
    if (pearlsRef.current) {
      pearlsRef.current.rotation.y = t * 0.35;
    }
  });

  const pearlAngles = [0, 1, 2, 3, 4, 5];

  return (
    <group ref={orbGroup} position={[2.1, 0.1, -0.5]} scale={0.78}>
      <Float speed={reducedMotion ? 0 : 1.4} rotationIntensity={0.2} floatIntensity={0.35}>
        {/* Inner glowing lavender heart */}
        <mesh>
          <icosahedronGeometry args={[0.38, 3]} />
          <meshStandardMaterial
            color="#E8DFF5"
            emissive="#D9B18C"
            emissiveIntensity={0.38}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>

        {/* Outer translucent crystal sphere */}
        <mesh renderOrder={3}>
          <sphereGeometry args={[0.64, 36, 36]} />
          <meshPhysicalMaterial
            color="#F5DDE6"
            roughness={0.08}
            metalness={0.05}
            clearcoat={1}
            transparent
            opacity={isSoftwareGl ? 0.35 : 0.52}
            depthWrite={false}
          />
        </mesh>

        {/* Rose-Gold Meridian Rings */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[0.92, 0.018, 16, 80]} />
          <meshStandardMaterial color="#D9B18C" roughness={0.16} metalness={0.95} />
        </mesh>

        <mesh ref={ring2Ref}>
          <torusGeometry args={[1.14, 0.012, 16, 80]} />
          <meshStandardMaterial color="#F5DDE6" roughness={0.22} metalness={0.85} />
        </mesh>

        {/* Orbiting Botanical Ingredient Pearls */}
        <group ref={pearlsRef}>
          {pearlAngles.map((idx) => {
            const angle = (idx / pearlAngles.length) * Math.PI * 2;
            const radius = 1.04;
            return (
              <mesh
                key={idx}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle * 2) * 0.25,
                  Math.sin(angle) * radius,
                ]}
              >
                <sphereGeometry args={[0.055, 16, 16]} />
                <meshStandardMaterial
                  color={idx % 2 === 0 ? '#E8DFF5' : '#D9B18C'}
                  roughness={0.18}
                  metalness={0.75}
                />
              </mesh>
            );
          })}
        </group>
      </Float>
    </group>
  );
}

/**
 * Floating Translucent Glass Panels (peripheral architectural framing)
 */
function FloatingGlassPanels({
  activeSection,
  scrollProgressRef,
  reducedMotion,
}: {
  activeSection: SectionId;
  scrollProgressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}) {
  const panelsRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    const g = panelsRef.current;
    if (!g) return;
    const t = reducedMotion ? 0 : clock.getElapsedTime();
    const sectionIdx = SECTIONS.findIndex((s) => s.id === activeSection);
    const hideForForm = activeSection === 'profile' || activeSection === 'dashboard';
    const targetOpacityScale = hideForForm ? 0.35 : 1;

    g.scale.x = THREE.MathUtils.damp(g.scale.x, targetOpacityScale, 3.5, delta);
    g.scale.y = g.scale.x;
    g.scale.z = g.scale.x;

    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      (scrollProgressRef.current - 0.5) * 0.65 + (reducedMotion ? 0 : pointer.x * 0.14),
      3,
      delta
    );
    g.position.y = THREE.MathUtils.damp(
      g.position.y,
      Math.sin(t * 0.5) * 0.12 - sectionIdx * 0.04,
      3,
      delta
    );
  });

  return (
    <group ref={panelsRef} position={[0, 0, -2.2]}>
      <mesh position={[-3.3, 1.1, -0.8]} rotation={[0.15, 0.35, -0.08]}>
        <boxGeometry args={[1.35, 2.1, 0.025]} />
        <meshPhysicalMaterial
          color="#F5DDE6"
          transparent
          opacity={0.12}
          roughness={0.12}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[3.4, -0.9, -1.2]} rotation={[-0.1, -0.4, 0.06]}>
        <boxGeometry args={[1.5, 2.2, 0.025]} />
        <meshPhysicalMaterial
          color="#E8DFF5"
          transparent
          opacity={0.1}
          roughness={0.14}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function GlowUpScene({ scrollProgressRef, activeSection, reducedMotion }: GlowUpSceneProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  if (contextLost) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
    >
      <Canvas
        dpr={isSoftwareGl ? 1 : isMobile ? [1, 1.35] : [1, 1.75]}
        camera={{ position: [0, 0, 5.4], fov: 42 }}
        gl={{
          alpha: true,
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setContextLost(true);
          });
          canvas.addEventListener('webglcontextrestored', () => {
            setContextLost(false);
          });
        }}
      >
        <StudioEnvironmentRig />
        {/* 3-point Warm / Cool Studio Lighting Rig */}
        <hemisphereLight args={['#E8DFF5', '#3A2332', 0.85]} />
        <directionalLight position={[4, 5, 5]} intensity={1.85} color="#FFF3E4" />
        <directionalLight position={[-4, -2, 3]} intensity={0.75} color="#F5DDE6" />
        <pointLight position={[2, 1.5, 2]} intensity={1.1} color="#D9B18C" />

        <FloatingParticles
          count={isMobile ? 28 : 64}
          scrollProgressRef={scrollProgressRef}
          reducedMotion={reducedMotion}
        />
        <FloatingGlassPanels
          activeSection={activeSection}
          scrollProgressRef={scrollProgressRef}
          reducedMotion={reducedMotion}
        />
        <SkincareTrioAssembly
          activeSection={activeSection}
          scrollProgressRef={scrollProgressRef}
          isSoftwareGl={isSoftwareGl}
          reducedMotion={reducedMotion}
        />
        <BeautyIntelligenceOrb
          activeSection={activeSection}
          isSoftwareGl={isSoftwareGl}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
