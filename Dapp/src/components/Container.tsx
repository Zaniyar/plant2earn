import { Camera, Canvas, extend, ReactThreeFiber, useThree } from "@react-three/fiber";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Field from "./Field";
import "./Container.css"
import { PerspectiveCamera, OrthographicCamera } from "three";

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
    const camera = new OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );

    camera.position.set( 20, 20, 20 );
    camera.rotation.order = 'YXZ';
    camera.rotation.y = - Math.PI / 4;
    camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) );
    camera.zoom = 25;
    
    return <div className="container">
        {/* <div className="">spec</div> */}
        <Canvas 
            // camera={{ 
            //     position: [0,10,30],
            //     left: -2,
            //     right: 2,
            //     top: 2,
            //     bottom: -2,
            //     zoom: 25
            // }} 
            camera={camera}
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