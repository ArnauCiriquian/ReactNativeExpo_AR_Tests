import { Camera, CameraType } from 'expo-camera';
import { useState, useEffect, Suspense, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAnimatedSensor, SensorType } from 'react-native-reanimated'
import { Canvas, useFrame } from '@react-three/fiber'
import Zombie from './src/components/zombie';
import removeZombie from './src/logic/removeZombie';

export default function App() {
  const zombies = [
    {id: 12345, position: [10, 2, -50]},
    {id: 23456, position: [-10, 2, -100]}
  ]

  const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 'auto' });
  const [type, setType] = useState(CameraType.back);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (!hasPermission) {
    return <View style={styles.container}><Text>Camera permission not granted</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type}>
      </Camera>
      <View style={styles.canvasContainer}>
        <Canvas style={styles.canvas}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Suspense fallback={null}>
            {zombies && zombies.map(zombie => <Zombie animatedSensor={animatedSensor} position={zombie.position} />)}
          </Suspense>
        </Canvas>
      </View>
    </View>
  );
}

// onClick={(event) => removeZombie(zombies, zombie.id)}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%'
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
  },
  canvasContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6, // Set a higher zIndex to position the 3D scene above other components
  },
  canvas: {
    flex: 1,
  }
});