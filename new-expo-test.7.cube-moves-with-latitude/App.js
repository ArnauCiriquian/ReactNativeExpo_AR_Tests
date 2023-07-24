import { StyleSheet, View } from 'react-native'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useRef, Suspense, useLayoutEffect, useEffect, useState } from 'react'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { TextureLoader } from 'expo-three'
import { useAnimatedSensor, SensorType } from 'react-native-reanimated'

import * as Location from 'expo-location';

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
    console.warn('Error getting location:', error);
  }
};

function Box(props) {
  const [active, setActive] = useState(false)
  const [userLastLocation, setUserLastLocation] = useState(null);
  const [userCurrentLocation, setUserCurrentLocation] = useState(null);

  const mesh = useRef()

  let i = 1

  useFrame(async (state, delta) => {
    i += 1

    if (i === 60) {
      i = 1
      try {
        if (userCurrentLocation) {
          setUserLastLocation(userCurrentLocation)
          console.log(`Current: ${userCurrentLocation.latitude}:${userCurrentLocation.longitude} & Last: ${userLastLocation.latitude}:${userLastLocation.longitude}`);
          mesh.current.position.z += (userCurrentLocation.latitude - userLastLocation.latitude)*100000
          mesh.current.position.x += (userCurrentLocation.longitude - userLastLocation.longitude)*100000
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
    <mesh
      {...props}
      position={[0, 0, -10]}
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
    <ambientLight />
    <pointLight position={[10, 10, 10]} />
    <Box />
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