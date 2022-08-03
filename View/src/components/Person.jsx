import React from 'react'
import Model from "./Model"
import { Text } from '@react-three/drei'

const Person = ({who, text, position}) => {
  return (
    <>
        <Model url={`../../public/model/${who}/model.glb`} scale={[2.7, 2.7, 2.7]} rotation={[0,0,0]} position={position}></Model>
        <Text color="black" anchorX="center"  position={[position[0], position[1]-1.013, position[2]]} anchorY="middle">
            {text}
    </Text>
    </>
  )
}

export default Person