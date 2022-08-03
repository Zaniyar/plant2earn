import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import { Scene } from "./Scene";
function App() {
	return (
    <>      
    <h1
      style={{
        position: 'absolute',
        top: '5vh',
        left: '5vw',
        // transform: 'translateX(-50%)',
        color: '#292828',
        fontFamily: "Vogue",
        fontSize: "60pt"
      }}>
      p2e.
    </h1>
		<Canvas>
			<ambientLight />
			<directionalLight color="red" intensity={10} />
			<Suspense fallback={null}>
				<Scene />
			</Suspense>
		</Canvas>
    </>
	);
}

export default App;
