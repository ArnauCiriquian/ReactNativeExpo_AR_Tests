import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { Canvas } from '@react-three/fiber'

export default function App() {
  return <Canvas>
    <mesh>
      <sphereGeometry />
      <meshStandardMaterial color="orange" />
      <pointLight position={[10, 10, 10]} />
    </mesh>
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
