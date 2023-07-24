import { Camera, CameraType } from 'expo-camera';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber'
import * as Location from 'expo-location';
import { useAnimatedSensor, SensorType } from 'react-native-reanimated'

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
          <Box animatedSensor={animatedSensor} />
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