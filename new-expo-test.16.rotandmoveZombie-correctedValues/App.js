import { Camera, CameraType } from 'expo-camera';
import { useState, useEffect, useRef, Suspense, useLayoutEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { useAnimatedSensor, SensorType } from 'react-native-reanimated'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { TextureLoader } from 'expo-three'

// Function to get the user's current location
const getUserLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Location permission denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, // For high accuracy, use Location.Accuracy.High
      timeout: 60000, // Maximum time to wait for the location in milliseconds
    });

    //console.log(location.coords.latitude.toFixed(5), location.coords.longitude.toFixed(5));

    const currentLatitude = location.coords.latitude.toFixed(5);
    const currentLongitude = location.coords.longitude.toFixed(5);

    return { latitude: currentLatitude, longitude: currentLongitude };

  } catch (error) {
    //console.warn('Error getting location:', error);
  }
};

function Zombie(props) {
  const [base] = useLoader(TextureLoader, [
    require('./assets/zombie/texture/zombieDiff.jpg')
  ])

  const material = useLoader(MTLLoader, require('./assets/zombie/zombie-attack.mtl'))

  const obj = useLoader(
    OBJLoader,
    require('./assets/zombie/zombie-attack.obj'),
    (loader) => {
      material.preload()
      loader.setMaterials(material)
    }
  )

  const mesh = useRef()

  useLayoutEffect(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.map = base
      }
    })
  }, [obj])

  let i = 1

  useFrame(async (state, delta) => {
    i += 1

    if (props.animatedSensor && props.animatedSensor.isAvailable) {
      let { x, y, z } = props.animatedSensor.sensor.value;
      x = ~~(x * 100) / 5000
      y = ~~(y * 100) / 5000
      z = ~~(z * 100) / 5000
      //console.log(z)
      mesh.current.position.x += y * 4 * (-1 * (mesh.current.position.z / 3.5));
      mesh.current.position.y -= x * 4 * (-1 * (mesh.current.position.z / 3.5));

      // Handle the box reappearing from the other side when the device rotates 360º
      const threshold = Math.PI * /*4.6*/2.7 * (-1 * (mesh.current.position.z)); // 360 degrees in radians
      if (mesh.current.position.x >= threshold) mesh.current.position.x -= threshold;
      if (mesh.current.position.y >= threshold) mesh.current.position.y -= threshold;
      if (mesh.current.position.x <= -threshold) mesh.current.position.x += threshold;
      if (mesh.current.position.y <= -threshold) mesh.current.position.y += threshold;
    }

    if (i === 60) {
      i = 1
      try {
        if (userCurrentLocation) {
          setUserLastLocation(userCurrentLocation)
          console.log(`Current: ${userCurrentLocation.latitude}:${userCurrentLocation.longitude} & Last: ${userLastLocation.latitude}:${userLastLocation.longitude}`);
          mesh.current.position.z += (userCurrentLocation.latitude - userLastLocation.latitude) * 100000
          mesh.current.position.x += (userCurrentLocation.longitude - userLastLocation.longitude) * 100000
          console.log(mesh.current.position.x, mesh.current.position.z)
        }
        const location = await getUserLocation();
        if (location) {
          setUserCurrentLocation(location);
        }
      } catch (error) {
        console.warn('Error getting location:', error);
      }
    }

  })

  return (
    <mesh {...props} ref={mesh} rotation={[0, 0, 0]} /*position={[0, 0, -10]}*/>
      <primitive object={obj} scale={0.1} />
    </mesh>
  )
}

export default function App() {
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
            <Zombie animatedSensor={animatedSensor} position={[0, -2, -5]}/>
          </Suspense>
        </Canvas>
      </View>
    </View>
  );
}

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