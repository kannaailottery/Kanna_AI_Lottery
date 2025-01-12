import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stage } from '@react-three/drei'
import Dealer from './Dealer'

export default function Scene() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        shadows
      >
        <color attach="background" args={['#000']} />
        
        <Stage
          intensity={0.5}
          environment="night"
          shadows={{ type: 'accumulative', bias: -0.001 }}
          adjustCamera={false}
        >
          <Dealer />
        </Stage>

        <Environment preset="night" />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  )
} 