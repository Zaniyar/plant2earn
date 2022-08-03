import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Field from "./Field";
import "./Container.css"

const Container = () => {
    return <div className="container">
        <div className="">spec</div>
		<Canvas>
            <OrbitControls /> 
			<ambientLight />
			<directionalLight color="red" intensity={10} />
            <Field />
		</Canvas>
    </div>
}

export default Container;