import { Scroll, ScrollControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Html } from "./components/Html";
import { Objects } from "./components/Objects";
import { Particles } from "./components/Particles";
import Model from "./components/Model";

function Dodecahedron() {
	const { viewport } = useThree();
	// viewport = canvas in 3d units (meters)

	const ref = useRef();
	useFrame(({ mouse }) => {
		const x = mouse.x * viewport.width / 2;
		const y = mouse.y * viewport.height / 2;
		ref.current.position.set(x, y, 0);
		ref.current.rotation.set(-y, x, 0);
	});

	return (
		<mesh ref={ref} scale={[0.2, 0.2, 0.2]} castShadow>
			<dodecahedronBufferGeometry attach="geometry" />
			<meshNormalMaterial attach="material" />
		</mesh>
	);
}
function Scene() {
	const { height, width } = useThree(state => state.viewport);

	useFrame(({ mouse, camera }) => {
		camera.position.x = THREE.MathUtils.lerp(
			camera.position.x,
			mouse.x * 0.5,
			0.03
		);
		camera.position.y = THREE.MathUtils.lerp(
			camera.position.y,
			mouse.y * 0.8,
			0.01
		);
		camera.position.z = THREE.MathUtils.lerp(
			camera.position.z,
			Math.max(4, Math.abs(mouse.x * mouse.y * 8)),
			0.01
		);
		camera.rotation.y = THREE.MathUtils.lerp(
			camera.rotation.y,
			mouse.x * -Math.PI * 0.025,
			0.001
		);
	});
	useEffect(() => {
		console.log("WIDHTH", width);
	}, []);

	return (
		<ScrollControls pages={5.7}>
			<Model
				fixed={true}
				url={"../../public/model/sunflower_seed/scene.gltf"}
				scale={[0.5, 0.5, 0.5]}
				//width/3.6732 = 2.8
				position={[width / 5, -8, 0]}
			/>
			{/* <Dodecahedron /> */}
			<Scroll>
				<Particles />
				<Objects />
			</Scroll>
			<Scroll html>
				<Html />
			</Scroll>
		</ScrollControls>
	);
}

export { Scene };
