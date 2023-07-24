import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { Canvas } from '@react-three/fiber'

export default function App() {
  return <Canvas>
    <mesh>
      <Box position={[0, -1.2, 0]} />
      <Box position={[0, 1.2, 0]} />
      <pointLight position={[10, 10, 10]} />
    </mesh>
  </Canvas>
}

function Box(props) {
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
