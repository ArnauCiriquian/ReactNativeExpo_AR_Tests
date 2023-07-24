import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Canvas } from '@react-three/fiber';

const ThreeDScene = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, World!</Text>
      <View style={styles.canvasContainer}>
        <Canvas style={styles.canvas}>
          <mesh>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
            <pointLight position={[10, 10, 10]} />
          </mesh>
        </Canvas>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 150,
    fontWeight: 'bold',
    zIndex: 2, // Ensure the text is rendered above the 3D scene
  },
  canvasContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6, // Set a higher zIndex to position the 3D scene above other components
  },
  canvas: {
    flex: 1,
  },
});

export default ThreeDScene;