import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber'
import getUserLocation from '../logic/getUserLocation';
import useZombieLoader from './useZombieLoader';


export default function Zombie(props) {
    const obj = useZombieLoader()
    const mesh = useRef()
    
    let i = 1
    let time = 1
    let active = props.visible

    useEffect(() => {
        if (mesh.current) {
            mesh.current.visible = props.visible;
        }
    }, [props.visible]);

    console.log(`I'm zombie with id ${props.zombieId} and my position is ${props.position}`)


    const handleKillZombie = () => {
        // Set visibility to false when the object is clicked
        mesh.current.visible = false;
    };

    const handleShowZombie = () => {
        mesh.current.visible = true;
    };


    useFrame(async (state, delta) => {
        i += 1
        time += 1

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

        if (i >= 60 && active) {
            i = 1

            mesh.current.position.z += 5

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

        if (time === 600 && !active) {
            active = true
            handleShowZombie()
        }

    })

    return (
        <mesh {...props} ref={mesh} rotation={[0, 0, 0]} onClick={handleKillZombie}>
            <primitive object={obj.clone()} scale={0.1} />
        </mesh>
    )
}