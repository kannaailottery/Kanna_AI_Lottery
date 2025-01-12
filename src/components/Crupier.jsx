import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';

export default function Crupier({ speaking = false }) {
  const group = useRef();
  const { scene, animations } = useGLTF('/models/crupier.vrm');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Activar animación de idle por defecto
    if (actions.idle) {
      actions.idle.play();
    }
  }, [actions]);

  useEffect(() => {
    // Cambiar animación cuando está hablando
    if (speaking && actions.talking) {
      actions.talking.play();
    } else if (!speaking && actions.idle) {
      actions.idle.play();
    }
  }, [speaking, actions]);

  useFrame((state, delta) => {
    // Animación suave de seguimiento al usuario
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={1.5} position={[0, -1, 0]} />
    </group>
  );
}

// Precargar el modelo
useGLTF.preload('/models/crupier.vrm'); 