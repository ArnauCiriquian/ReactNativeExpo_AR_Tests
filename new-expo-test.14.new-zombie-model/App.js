import { StyleSheet } from 'react-native'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useRef, Suspense, useLayoutEffect } from 'react'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { TextureLoader } from 'expo-three'
import { useAnimatedSensor, SensorType } from 'react-native-reanimated'

// https://www.notjust.dev/blog/2023-02-17-3d-animations-in-react-native-with-threejs-nike-app

// new zombie model: https://www.turbosquid.com/es/AssetManager/Index.cfm?stgAction=getFiles&subAction=Download&intID=1318012&intType=3&csrf=D8DD9D3362E7680F09A605C5140D1867194D04AC&showDownload=1&s=1

function Zombie(props) {
  const [base/*, normal, rough*/] = useLoader(TextureLoader, [
    require('./assets/zombie/texture/zombieDiff.jpg'),
    //require('./assets/airmax/textures/Normal.jpg'),
    //require('./assets/airmax/textures/Roughness.png')
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
        //child.material.normalMap = normal
        //child.material.roughnessMap = rough
      }
    })
  }, [obj])

  useFrame((state, delta) => {
    let { x, y, z } = props.animatedSensor.sensor.value
    x = ~~(x * 100) / 5000
    y = ~~(y * 100) / 5000
    z = ~~(z * 100) / 5000
    mesh.current.rotation.x += x
    mesh.current.rotation.y += y
  })

  return (
    <mesh ref={mesh} rotation={[0, 0, 0]}>
      <primitive object={obj} scale={0.01} />
    </mesh>
  )
}

export default function App() {
  const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE, { interval: 100 })

  return <Canvas>
    <ambientLight />
    <pointLight position={[10, 10, 10]} />

    <Suspense fallback={null}>
      <Zombie animatedSensor={animatedSensor} />
    </Suspense>

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