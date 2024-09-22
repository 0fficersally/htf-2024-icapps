"use client";
import { useState, useRef } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import {
  Points,
  PointMaterial,
  Sphere,
  useTexture,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import { inSphere } from "maath/random";
import "../assets/css/components/hero/hero.css";
import { Space_Mono } from "next/font/google";
import { gsap } from "gsap";

const space = Space_Mono({
  subsets: ["latin"],
  weight: "400",
});

const Hero = () => {
  const triggerTextAnimation = () => {
    const letters = document.querySelectorAll("h1 span");
    letters.forEach((letter, index) => {
      gsap.to(letter, {
        y: -900,// Move each letter upwards by 100 units
        duration: 2,
        delay: index * 0.1,
        ease: "power2.inOut",
      });
    });
  };

  return (
    <div className="overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 1.5] }}
        style={{ backgroundColor: "#010101", height: "100vh" }}
      >
        <Stars />
      </Canvas>
      <Canvas
        camera={{ position: [0, 0, 2] }}
        style={{ position: "absolute", height: "100vh" }}
        className="w-1/3 top-[70%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <ambientLight intensity={1} />
        <Planet triggerTextAnimation={triggerTextAnimation} />
      </Canvas>
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <h1
          className={
        space.className +
        " m-0 p-0 font-outline-2 uppercase tracking-widest z-50 text-8xl font-semibold text-transparent"
          }
        >
          {Array.from("Welcome").map((letter, index) => (
        <span key={index} className="inline-block">
          {letter}
        </span>
          ))}
        </h1>
      </div>
    </div>
  );
};
const Stars = () => {
  const ref = useRef<THREE.Points>(null);
  const [stars] = useState<Float32Array>(() => {
    const positions = new Float32Array(25000 * 3); // 5000 points, 3 coordinates each
    inSphere(positions, { radius: 5.5 });
    return positions;
  });

  useFrame((state, delta) => {
    if (!ref.current) return;
    const positions = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] -= delta * 0.75; // Move stars along the z-axis slower
      if (positions[i + 2] < -5) {
        positions[i + 2] = 5; // Reset star position when it goes too far
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <Points ref={ref} positions={stars} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffa0e0"
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const Planet = ({ triggerTextAnimation }: { triggerTextAnimation: () => void }) => {
  const texture = useTexture("/assets/planet/textures/texture.jpg");
  const ref = useRef<THREE.Mesh>(null);
  const ref1 = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!isDragging && ref.current) {
      ref.current.rotation.y += delta / 5;
    }
  });

  const handleDragStart = (event: ThreeEvent<PointerEvent>) => {
    setIsDragging(true);
    setLastMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrag = (event: ThreeEvent<PointerEvent>) => {
    if (ref.current) {
      const deltaX = event.clientX - lastMousePosition.x;
      ref.current.rotation.y += deltaX * 0.01;
      setLastMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleClick = () => {
    // Start the animation
    const animationDuration = 2; // Duration in seconds
    const targetPositionY = -5; // Target Y position for the planet (moving down)
    const targetScale = 0.1; // Target scale for the planet (shrinking)

    if (ref1.current) {
      gsap.to(ref1.current.position, {
        y: targetPositionY,
        duration: animationDuration,
        ease: "power2.inOut",
      });

      gsap.to(ref1.current.scale, {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration: animationDuration,
        ease: "power2.inOut",
        onComplete: () => {
          // Redirect to another page after the animation completes
          window.location.href = "/another-page"; // Replace with your target page
        },
      });
    }

    // Trigger the text animation
    triggerTextAnimation();
  };

  return (
    <mesh ref={ref1}>
      <mesh
        onClick={handleClick}
        ref={ref}
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
        onPointerMove={isDragging ? handleDrag : undefined}
      >
        <Sphere args={[1, 32, 32]}>
          <meshStandardMaterial map={texture} />
        </Sphere>
      </mesh>

      <mesh onClick={handleClick}>
        <Text
          position={[0, 0, 1]} // Adjust the position as needed
          fontSize={0.2} // Adjusted to match text-8xl
          color="#b42b16"
          font=""
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.0025} // Equivalent to font-outline-2
          outlineColor="#f9f9f9" // Assuming black outline
          letterSpacing={0.1} // Equivalent to tracking-widest
          fontWeight="bold" // Equivalent to font-semibold
        >
          Enter!
        </Text>
      </mesh>
    </mesh>
  );
};

export default Hero;
