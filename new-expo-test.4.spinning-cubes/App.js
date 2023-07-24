import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { Canvas, useFrame } from '@react-three/fiber'
import { useState, useRef } from 'react'

function Box(props) {
  const [active, setActive] = useState(false)

  const mesh = useRef()

  useFrame((state, delta) => {
    if (active) {
      mesh.current.rotation.y += delta
      mesh.current.rotation.x += delta
    }
  })

  return (
    <mesh 
      {...props}
      ref={mesh}
      onClick={(event) => setActive(!active)}
      scale={active ? 1.5 : 1}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={active ? 'green' : 'gray'} />
    </mesh>
  );
}

export default function App() {
  return <Canvas>
    <ambientLight/>
    <pointLight position={[10, 10, 10]} />
    <Box position={[0, -1.2, 0]} />
    <Box position={[0, 1.2, 0]} />
  </Canvas>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
