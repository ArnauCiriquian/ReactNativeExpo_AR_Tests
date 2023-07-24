import { StyleSheet } from 'react-native'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useRef, Suspense, useLayoutEffect } from 'react'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { TextureLoader } from 'expo-three'
import { useAnimatedSensor, SensorType } from 'react-native-reanimated'

// https://www.notjust.dev/blog/2023-02-17-3d-animations-in-react-native-with-threejs-nike-app

// Codi de rotació a millorar, l'objecte apareix de nou als 180º, ideal que no aparegui pero pugui seguir la rotacio

function Shoe(props) {
  const [base, normal, rough] = useLoader(TextureLoader, [
    require('./assets/airmax/textures/BaseColor.jpg'),
    require('./assets/airmax/textures/Normal.jpg'),
    require('./assets/airmax/textures/Roughness.png')
  ]);

  const material = useLoader(MTLLoader, require('./assets/airmax/shoe.mtl'));

  const obj = useLoader(
    OBJLoader,
    require('./assets/airmax/shoe.obj'),
    (loader) => {
      material.preload();
      loader.setMaterials(material);
    }
  );

  const mesh = useRef();

  useLayoutEffect(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.map = base;
        child.material.normalMap = normal;
        child.material.roughnessMap = rough;
      }
    });
  }, [obj]);

  useFrame(() => {
    if (props.animatedSensor && props.animatedSensor.isAvailable) {
      let { x, y, z } = props.animatedSensor.sensor.value;
      x = ~~(x * 100) / 5000
      y = ~~(y * 100) / 5000
      z = ~~(z * 100) / 5000
      mesh.current.position.x += y * 2;
      mesh.current.position.y -= x * 2;

      // Handle the box reappearing from the other side when the device rotates 360º
      const threshold = Math.PI * 4.6; // 360 degrees in radians
      if (mesh.current.position.x >= threshold) mesh.current.position.x -= threshold;
      if (mesh.current.position.y >= threshold) mesh.current.position.y -= threshold;
      if (mesh.current.position.x <= -threshold) mesh.current.position.x += threshold;
      if (mesh.current.position.y <= -threshold) mesh.current.position.y += threshold;
    }
  });

  return (
    <mesh ref={mesh} rotation={[1, 0, 0]} position={[0, 0, 0]}>
      <primitive object={obj} scale={10} />
    </mesh>
  );
}

export default function App() {
  const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 'auto' });

  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      <Suspense fallback={null}>
        <Shoe animatedSensor={animatedSensor} />
      </Suspense>
    </Canvas>
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