import { Camera, Canvas, extend, ReactThreeFiber, useThree } from "@react-three/fiber";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Field from "./Field";
import "./Container.css"
import { PerspectiveCamera, OrthographicCamera, Euler } from "three";

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
    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;

    return <div className="container">
        {/* <div className="">spec</div> */}
        <Canvas 
            camera={{ 
                position: [20,20,20],
                left:  - d * aspect,
                right: d * aspect,
                top: d,
                bottom:  - d,
                near: 1,
                far: 10000,
                zoom: 25,
                rotation:  new Euler(Math.atan( - 1 / Math.sqrt( 2 ) ), - Math.PI / 4, 0, 'YXZ')
            }} 
            orthographic
        >
            <ambientLight />
            <directionalLight color="red" intensity={10} />
            <Controls />
            <Field />
            <CameraHelper />
        </Canvas>
    </div>
}

export default Container;