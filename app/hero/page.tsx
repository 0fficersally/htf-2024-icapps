"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import gsap from "gsap";
import { useRouter } from "next/navigation";

// Glow shader
const GlowShaderMaterial = shaderMaterial(
  {
    color: new THREE.Color(1, 1, 1),
    glowColor: new THREE.Color(0.1, 0.1, 1),
    coefficient: 0.5,
    power: 2,
  },
  // vertex shader
  `
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform vec3 color;
    uniform vec3 glowColor;
    uniform float coefficient;
    uniform float power;
    varying vec3 vNormal;
    varying vec3 vPositionNormal;
    void main() {
      float intensity = pow(coefficient - dot(vPositionNormal, vNormal), power);
      gl_FragColor = vec4(color + glowColor * intensity, 1.0);
    }
  `
);

extend({ GlowShaderMaterial });

function Planet({
  position,
  texture,
  size = 1,
}: {
  position: [number, number, number];
  texture: string;
  size?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const planetTexture = useMemo(
    () => new THREE.TextureLoader().load(texture),
    [texture]
  );

  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.1;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial map={planetTexture} />
      </mesh>
    </group>
  );
}

function AnimatedStars() {
  const starsRef = useRef<THREE.Points>(null!);

  useFrame((state, delta) => {
    starsRef.current.rotation.y += delta * 0.02;
  });

  return (
    <Stars
      ref={starsRef}
      radius={100}
      depth={50}
      count={5000}
      factor={4}
      saturation={0}
      fade
      speed={1}
    />
  );
}

interface SceneProps {
  onAnimationComplete: () => void;
}

function Scene({ onAnimationComplete }: SceneProps) {
  const { scene, camera } = useThree();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (clicked) {
      const timeline = gsap.timeline({
        onComplete: onAnimationComplete,
      });

      timeline.to(camera.position, {
        duration: 2,
        x: 0,
        y: 0,
        z: 50,
        ease: "power2.inOut",
      });

      timeline.to(
        scene.rotation,
        {
          duration: 3,
          x: Math.PI * 2,
          y: Math.PI * 2,
          ease: "power2.inOut",
        },
        "-=1"
      );

      timeline.to(camera.position, {
        duration: 1,
        z: 0,
        ease: "power2.in",
      });
    }
  }, [clicked, camera, scene, onAnimationComplete]);

  return (
    <>
      <AnimatedStars />
      <Planet
        position={[0, 0, 0]}
        texture="/assets/images/3D/planet.jpg"
        size={1.5}
      />
      <OrbitControls enableZoom={false} enabled={!clicked} enableRotate={false} />
      <Text
        position={[0, 2, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Welcome to Our Universe
      </Text>
      <mesh scale={1000} onClick={() => setClicked(true)}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#000"
          side={THREE.BackSide}
          transparent
          opacity={0}
        />
      </mesh>
    </>
  );
}

export default function EnhancedIntroPage() {
  const router = useRouter();

  const handleAnimationComplete = () => {
    router.push("/next-page"); // Replace with your desired route
  };

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} />
        <Scene onAnimationComplete={handleAnimationComplete} />
      </Canvas>
      <div className="absolute bottom-10 left-0 right-0 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Explore the Cosmos</h1>
        <p className="text-xl">Click anywhere to begin your journey</p>
      </div>
    </div>
  );
}
