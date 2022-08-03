import { useIntersect, MeshDistortMaterial, Text } from '@react-three/drei'
import { useFrame, useThree} from '@react-three/fiber'
import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import {Treex} from "./Treex"
import Model from "./Model"
import Person from './Person'
function Objects({camera}) {
  const { height, width } = useThree((state) => state.viewport)  
  return (
    <>
      <pointLight color="blue" position={[8, -25, 5]} intensity={20} />
      <pointLight color="red" position={[0, -height * 2.25, 5]} intensity={10} />
      <Item color="white" texture={true} position={[0, 1, 0]} >
        <sphereGeometry args={[1,40,30]} />
      </Item>


{/* <meshPhysicalMaterial transparent color={"red"} /> */}
      

      {/* <Item color="red" position={[0, 1, 0]}>
        <boxGeometry />
      </Item> */}
      {/* <Item color="blue" position={[width / 6, -height * 1, 0]}>
        <dodecahedronGeometry />
      </Item> */}
      <Item color="gray" position={[-width / 5, -height * 1.8, -2]}>
        <coneGeometry args={[1, 1, 6]} />
      </Item>
      <Model url={"../../public/model/apple_low_poly/scene.gltf"} scale={[8,8,8]} position={[width / 6, -height * 1, 0]}></Model>
      <Model url={"../../public/model/nes_controller/scene.gltf"} scale={[.002,.002,.002]} rotation={[0,0,0]} position={[width / 6, -height * 1, 0]}></Model>
      <Item color="purple" position={[width / 4, -height * 2, 0]}>
        <coneGeometry args={[1.5, 2, 3]} />
      </Item>
      <Item color="orange" position={[-width / 12, -height * 2.25, 0.5]}>
        <coneGeometry args={[0.75, 2.5, 12]} />
      </Item>
      <Person who="sunnysun" text="Zaniyar Jahany" position={[width / 12, -height * 3.55, 0.5]}></Person>
      <Person who="bersboy" text="Bersait Bae" position={[width / 6, -height * 3.55, 0.5]}></Person>
      <Person who="simon" text="Simon Hohl" position={[width /4, -height * 3.55, 0.5]}></Person>

      {/* <mesh position={[-width / 12, -height * 2.65, 0.5]}>
        <boxBufferGeometry
          attach="geometry"
          args={[.613*2, .545, 0.3]}
        />				
        <PixiTexture url="zaniyar" attach="material" />
      </mesh>
      <mesh position={[-width / 6, -height * 2.65, 0.5]}>
        <boxBufferGeometry
          attach="geometry"
          args={[.613*2, .545, 0.3]}
        />				
        <PixiTexture url="simon" attach="material" />
      </mesh> */}
      
      {
        console.log([-width / 12, -height * 3.36, 0.5])
      }
      {/* lengthFalloffPower das ändern im config zum baum wachsen.. kleiner wert = grosser baum */}
      <Treex  position={[-width / 12, -height * 3.8, 0.5]}></Treex>
    </>
  )
}

function Item({ color, position, texture, children }) {
  const visible = useRef()
  const ref = useIntersect((isVisible) => (visible.current = isVisible))
  const [xRandomFactor, yRandomFactor] = useMemo(() => [(0.5 - Math.random()) * 0.5, (0.5 - Math.random()) * 0.5], [])
  const earth = new TextureLoader().load("../../public/img/earth.jpg");
  useFrame(({ clock }, delta) => {
    const elapsedTime = clock.getElapsedTime()

    ref.current.rotation.x = elapsedTime * xRandomFactor
    ref.current.rotation.y = elapsedTime * yRandomFactor

    const scale = THREE.MathUtils.damp(ref.current.scale.x, visible.current ? 1.5 : 0.2, 5, delta)
    ref.current.scale.set(scale, scale, scale)
  })

  return (
    <mesh ref={ref} position={position}>
      {children}
      <meshPhysicalMaterial transparent color={color} map={texture ? earth : null} />
      {/* <MeshDistortMaterial distort={1} speed={10} map={texture ? earth : null} /> */}
    </mesh>
  )
}

export { Objects }
