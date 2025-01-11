import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Dealer() {
  const group = useRef<THREE.Group>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Escuchar el estado de habla del VoiceService
  useEffect(() => {
    const checkSpeechState = () => {
      const synthesis = window.speechSynthesis;
      setIsSpeaking(synthesis.speaking);
    };

    const speechInterval = setInterval(checkSpeechState, 100);
    return () => clearInterval(speechInterval);
  }, []);

  // Animar el placeholder
  useFrame((state) => {
    if (!group.current) return;

    // Seguir al cursor con suavidad
    const target = new THREE.Vector3(state.mouse.x * 0.3, state.mouse.y * 0.3 + 1.5, 1);
    group.current.position.lerp(target, 0.1);

    // Animación de "respiración"
    const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    if (group.current.children[0]) {
      group.current.children[0].position.y = 1.5 + breathe;
    }

    // Animación al hablar
    if (isSpeaking) {
      const talkScale = Math.sin(state.clock.elapsedTime * 15) * 0.1 + 1;
      group.current.children[0].scale.setScalar(talkScale);
    } else {
      group.current.children[0].scale.setScalar(1);
    }
  });

  return (
    <group ref={group}>
      {/* Cabeza */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#ffb7c5" />
      </mesh>

      {/* Cuerpo */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 1.4, 32]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>

      {/* Brazos */}
      <mesh position={[-0.4, 0.9, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color="#ffb7c5" />
      </mesh>
      <mesh position={[0.4, 0.9, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshStandardMaterial color="#ffb7c5" />
      </mesh>

      {/* Piernas */}
      <mesh position={[-0.15, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
        <meshStandardMaterial color="#ffb7c5" />
      </mesh>
      <mesh position={[0.15, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
        <meshStandardMaterial color="#ffb7c5" />
      </mesh>
    </group>
  );
} 