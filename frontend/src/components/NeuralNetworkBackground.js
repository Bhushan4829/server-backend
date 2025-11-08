import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

// Neural Node Component
function NeuralNode({ position, index, mousePosition }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const distance = mousePosition.distanceTo(position);
      
      // Pulsing animation
      const pulse = Math.sin(time * 2 + index * 0.5) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
      
      // Hover effect
      if (hovered) {
        meshRef.current.scale.multiplyScalar(1.5);
        meshRef.current.material.emissiveIntensity = 0.8;
      } else {
        meshRef.current.material.emissiveIntensity = 0.3;
      }
      
      // Click explosion effect
      if (clicked) {
        meshRef.current.scale.multiplyScalar(1.2);
        setTimeout(() => setClicked(false), 200);
      }
      
      // Color shifting
      const hue = (time * 0.1 + index * 0.1) % 1;
      meshRef.current.material.color.setHSL(hue, 0.8, 0.6);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(true)}
    >
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial
        color="#00ffff"
        emissive="#0044ff"
        emissiveIntensity={0.3}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Particle System
function ParticleField({ count = 2000 }) {
  const pointsRef = useRef();
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime();
      const positions = pointsRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time + i * 0.01) * 0.01;
        positions[i3] += Math.cos(time * 0.5 + i * 0.01) * 0.005;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = time * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00ffff"
        size={0.02}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Connection Lines - Simplified but still EPIC
function ConnectionLines({ nodes }) {
  const linesRef = useRef();
  const [connections, setConnections] = useState([]);
  
  useEffect(() => {
    const newConnections = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = nodes[i].distanceTo(nodes[j]);
        if (distance < 8 && Math.random() > 0.7) {
          newConnections.push([nodes[i], nodes[j]]);
        }
      }
    }
    setConnections(newConnections);
  }, [nodes]);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={linesRef}>
      {connections.map(([start, end], index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...start.toArray(), ...end.toArray()])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </group>
  );
}

// Main Neural Network Scene
function NeuralNetworkScene() {
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3());
  const [nodes, setNodes] = useState([]);
  
  // Generate neural nodes
  useEffect(() => {
    const newNodes = [];
    for (let i = 0; i < 150; i++) {
      newNodes.push(new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      ));
    }
    setNodes(newNodes);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePosition(new THREE.Vector3(x * 20, y * 20, 0));
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ff00ff" />
      
      <ParticleField count={3000} />
      
      {nodes.map((node, index) => (
        <NeuralNode
          key={index}
          position={node}
          index={index}
          mousePosition={mousePosition}
        />
      ))}
      
      <ConnectionLines nodes={nodes} />
      
      <Environment preset="night" />
    </>
  );
}

// Main Component
export default function NeuralNetworkBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      pointerEvents: 'none'
    }}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <NeuralNetworkScene />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
          />
          <ChromaticAberration
            offset={[0.002, 0.002]}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
