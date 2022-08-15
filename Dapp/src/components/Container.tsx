import { Camera, Canvas, extend, ReactThreeFiber, useThree } from "@react-three/fiber";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Field from "./Field";
import "./Container.css"
import { PerspectiveCamera, OrthographicCamera, Euler } from "three";
import { IDetails } from "../interfaces";
import { useState } from "react";

extend({ OrbitControls });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
    }
  }
}

function Controls() {
  const {
    camera,
    gl: { domElement },
  } = useThree();

  return <orbitControls args={[camera, domElement]} />;
}

function CameraHelper() {
  const camera = new PerspectiveCamera(50, 1, 1, 20);
  return <group position={[5, 5, 25]}>
    <cameraHelper args={[camera]} />
  </group>;
}


const Container = () => {

  const [tree, setTree] = useState({
    level: 0,
    harvestCounter: 0,
    wateringCounter: 0,
    lastActionTimestamp: Date.now(),
  });

  const aspect = window.innerWidth / window.innerHeight;
  const d = 20;

  const onLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setTree(prevState => ({
      ...prevState,
      level: parseInt(event.target.value)
    }))
  }

  const onWaterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setTree(prevState => ({
      ...prevState,
      wateringCounter: parseInt(event.target.value)
    }))
  }


  return <div className="container">
    <div>
      <div onChange={onLevelChange}>
        <label>Levels:</label>
        <input type="radio" value="0" name="level" /> 0
        <input type="radio" value="1" name="level" /> 1
        <input type="radio" value="2" name="level" /> 2
        <input type="radio" value="3" name="level" /> 3
        <input type="radio" value="4" name="level" /> 4
      </div>
      <div onChange={onWaterChange}>
        <label>Levels:</label>
        <input type="radio" value="0" name="water" /> 0
        <input type="radio" value="1" name="water" /> 1
        <input type="radio" value="2" name="water" /> 2
        <input type="radio" value="3" name="water" /> 3
        <input type="radio" value="4" name="water" /> 4
        <input type="radio" value="5" name="water" /> 5
        <input type="radio" value="6" name="water" /> 6
        <input type="radio" value="7" name="water" /> 7
        <input type="radio" value="8" name="water" /> 8
        <input type="radio" value="9" name="water" /> 9
        <input type="radio" value="10" name="water" /> 10
      </div>
    </div>
    <Canvas
      camera={{
        position: [20, 20, 20],
        left: - d * aspect,
        right: d * aspect,
        top: d,
        bottom: - d,
        near: 1,
        far: 10000,
        zoom: 25,
        rotation: new Euler(Math.atan(- 1 / Math.sqrt(2)), - Math.PI / 4, 0, 'YXZ')
      }}
      orthographic
    >
      <ambientLight />
      <directionalLight color="red" intensity={10} />
      <Controls />
      <Field tree={tree} />
      <CameraHelper />
    </Canvas>
  </div>
}

export default Container;