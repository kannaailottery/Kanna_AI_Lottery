'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface CrupierModelProps {
  isSpeaking?: boolean;
}

function Model({ isSpeaking = false }: CrupierModelProps) {
  const modelRef = useRef<VRM | null>(null);
  const [lipValue, setLipValue] = useState(0);
  const groupRef = useRef<THREE.Group>(null);
  
  // Referencias para el movimiento suave
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const targetPosition = useRef(new THREE.Vector3(0, -1, 0));
  const currentPosition = useRef(new THREE.Vector3(0, -1, 0));
  const nextArmMovement = useRef(0);
  const leftArmRotation = useRef(new THREE.Vector3(0, 0, 0));
  const rightArmRotation = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    // Cargar el modelo
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    console.log('Iniciando carga del modelo...');

    loader.load(
      '/models/crupier.vrm',
      (gltf) => {
        console.log('Modelo cargado:', gltf);
        // @ts-ignore - VRM types are not fully compatible with GLTF
        const vrm: VRM = gltf.userData.vrm;
        if (vrm) {
          console.log('VRM extraído:', vrm);
          modelRef.current = vrm;
          
          if (vrm.scene) {
            console.log('Configurando escena...');
            vrm.scene.position.set(0, -1, 0);
            vrm.scene.rotation.set(0, Math.PI, 0);
            vrm.scene.scale.set(2, 2, 2);

            // Ajustar materiales para mejor renderizado
            vrm.scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  child.material.roughness = 0.5;
                  child.material.metalness = 0.5;
                  child.material.envMapIntensity = 1;
                }
              }
            });

            // Posición inicial de los brazos
            if (vrm.humanoid) {
              console.log('Configurando humanoid...');
              const leftArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
              const rightArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
              const leftForearm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
              const rightForearm = vrm.humanoid.getNormalizedBoneNode('rightLowerArm');

              if (leftArm && rightArm && leftForearm && rightForearm) {
                console.log('Configurando posición inicial de brazos...');
                leftArm.rotation.z = 0.3;
                rightArm.rotation.z = -0.3;
                leftForearm.rotation.x = 0.5;
                rightForearm.rotation.x = 0.5;
              }
            }
          } else {
            console.error('No se encontró la escena en el VRM');
          }

          if (vrm.expressionManager) {
            console.log('Configurando expresiones...');
            vrm.expressionManager.setValue('aa', 0);
            vrm.expressionManager.setValue('mouth_open', 0);
          }
        } else {
          console.error('No se pudo extraer el VRM del modelo');
        }
      },
      (progress: ProgressEvent) => {
        console.log('Progreso de carga:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
      },
      (error: unknown) => {
        console.error('Error cargando el modelo:', error);
      }
    );
  }, []);

  useFrame((state, delta) => {
    if (!modelRef.current?.scene) {
      return;
    }

    const t = state.clock.getElapsedTime();

    // Movimientos aleatorios de los brazos
    if (t > nextArmMovement.current) {
      nextArmMovement.current = t + 3 + Math.random() * 5;
      
      if (modelRef.current.humanoid) {
        const leftArm = modelRef.current.humanoid.getNormalizedBoneNode('leftUpperArm');
        const rightArm = modelRef.current.humanoid.getNormalizedBoneNode('rightUpperArm');
        const leftForearm = modelRef.current.humanoid.getNormalizedBoneNode('leftLowerArm');
        const rightForearm = modelRef.current.humanoid.getNormalizedBoneNode('rightLowerArm');

        if (leftArm && rightArm && leftForearm && rightForearm) {
          // Generar nuevas rotaciones aleatorias
          leftArmRotation.current = new THREE.Vector3(
            THREE.MathUtils.lerp(-0.2, 0.2, Math.random()),
            THREE.MathUtils.lerp(-0.2, 0.2, Math.random()),
            THREE.MathUtils.lerp(0.2, 0.4, Math.random())
          );
          rightArmRotation.current = new THREE.Vector3(
            THREE.MathUtils.lerp(-0.2, 0.2, Math.random()),
            THREE.MathUtils.lerp(-0.2, 0.2, Math.random()),
            THREE.MathUtils.lerp(-0.4, -0.2, Math.random())
          );

          // Aplicar las rotaciones suavemente
          leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, leftArmRotation.current.x, delta);
          leftArm.rotation.y = THREE.MathUtils.lerp(leftArm.rotation.y, leftArmRotation.current.y, delta);
          leftArm.rotation.z = THREE.MathUtils.lerp(leftArm.rotation.z, leftArmRotation.current.z, delta);

          rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, rightArmRotation.current.x, delta);
          rightArm.rotation.y = THREE.MathUtils.lerp(rightArm.rotation.y, rightArmRotation.current.y, delta);
          rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, rightArmRotation.current.z, delta);

          // Movimientos suaves de los antebrazos
          leftForearm.rotation.x = THREE.MathUtils.lerp(0.3, 0.7, Math.sin(t * 0.5) * 0.5 + 0.5);
          rightForearm.rotation.x = THREE.MathUtils.lerp(0.3, 0.7, Math.sin(t * 0.5 + Math.PI) * 0.5 + 0.5);
        }
      }
    }

    // Lip sync
    if (isSpeaking) {
      const frequency = 12;
      const baseAmplitude = 0.5;
      const randomVariation = Math.sin(t * 30) * 0.2;
      
      const lipMovement = (Math.sin(t * frequency) * baseAmplitude + randomVariation + 1) * 0.5;
      
      if (modelRef.current.expressionManager) {
        modelRef.current.expressionManager.setValue('aa', lipMovement * 0.7);
        modelRef.current.expressionManager.setValue('mouth_open', lipMovement * 0.4);
      }
    } else {
      if (lipValue > 0) {
        const newValue = Math.max(0, lipValue - delta * 4);
        setLipValue(newValue);
        if (modelRef.current.expressionManager) {
          modelRef.current.expressionManager.setValue('aa', newValue * 0.7);
          modelRef.current.expressionManager.setValue('mouth_open', newValue * 0.4);
        }
      }
    }

    // Movimiento suave de seguimiento al cursor y respiración
    const mouseX = (state.mouse.x * Math.PI) / 16;
    targetRotation.current = Math.PI + mouseX;
    currentRotation.current = THREE.MathUtils.lerp(
      currentRotation.current,
      targetRotation.current,
      delta * 0.5
    );
    modelRef.current.scene.rotation.y = currentRotation.current;

    targetPosition.current.y = -1 + Math.sin(t * 0.5) * 0.003;
    currentPosition.current.lerp(targetPosition.current, delta);
    modelRef.current.scene.position.copy(currentPosition.current);
  });

  return modelRef.current?.scene ? (
    <group>
      <primitive object={modelRef.current.scene} />
      <spotLight
        position={[0, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
      />
    </group>
  ) : null;
}

export default function CrupierModel(props: CrupierModelProps) {
  return (
    <group>
      <Model {...props} />
    </group>
  );
} 