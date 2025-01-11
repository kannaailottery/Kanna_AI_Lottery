import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface VRMModelProps {
  speaking: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export default function VRMModel({ speaking, audioRef }: VRMModelProps) {
  const modelRef = useRef<VRM | null>(null);
  const [lipValue, setLipValue] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      '/models/crupier.vrm',
      (gltf) => {
        // @ts-ignore - VRM types are not fully compatible with GLTF
        const vrm: VRM = gltf.userData.vrm;
        if (vrm) {
          modelRef.current = vrm;
          
          if (vrm.scene) {
            vrm.scene.position.set(0, -0.8, 0);
            vrm.scene.rotation.set(0, Math.PI, 0);
            vrm.scene.scale.set(1.2, 1.2, 1.2);
          }

          if (vrm.expressionManager) {
            vrm.expressionManager.setValue('aa', 0);
            vrm.expressionManager.setValue('mouth_open', 0);
          }
        }
      },
      (progress: ProgressEvent) => {
        console.log('Cargando modelo:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
      },
      (error: unknown) => {
        console.error('Error cargando el modelo:', error);
      }
    );

    // Configurar audio una sola vez
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 1024;
    analyserRef.current.smoothingTimeConstant = 0.4;

    if (audioRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useFrame(() => {
    if (!modelRef.current || !analyserRef.current || !speaking) {
      if (lipValue > 0) {
        const newValue = Math.max(0, lipValue - 0.05);
        setLipValue(newValue);
        if (modelRef.current?.expressionManager) {
          modelRef.current.expressionManager.setValue('aa', newValue * 0.5);
          modelRef.current.expressionManager.setValue('mouth_open', newValue * 0.3);
        }
      }
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const relevantFreqs = dataArray.slice(2, 60);
    const average = relevantFreqs.reduce((a, b) => a + b) / relevantFreqs.length;
    let normalizedValue = Math.min(average / 128, 1) * 0.6;
    
    normalizedValue = lipValue * 0.6 + normalizedValue * 0.4;
    setLipValue(normalizedValue);

    if (modelRef.current?.expressionManager) {
      modelRef.current.expressionManager.setValue('aa', normalizedValue * 0.5);
      modelRef.current.expressionManager.setValue('mouth_open', normalizedValue * 0.3);
    }
  });

  return (
    <group>
      {modelRef.current && <primitive object={modelRef.current.scene} />}
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 2, 2]} intensity={0.8} />
      <directionalLight position={[-2, 2, -2]} intensity={0.3} />
    </group>
  );
} 