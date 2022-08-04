import { Camera, Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Field from "./Field";
import "./Container.css"

const camera = { 
    fov: 100, 
    near: 0.1, 
    far: 1000, 
    position: [0, 15, 20]
}

const Container = () => {
    return <div className="container">
        <div className="">spec</div>
        <Canvas camera={ camera }>
            <OrbitControls />
            <ambientLight />
            <directionalLight color="red" intensity={10} />
            <Field />
        </Canvas>
    </div>
}

export default Container;