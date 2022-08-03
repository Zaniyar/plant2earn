import React from "react";
import { useRef, useEffect } from "react";
import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const Model = ({ fixed, position, rotation, scale, url }) => {
	const gltf = useGLTF(url);
	const ref = useRef();
	const data = useScroll();
	const triggerScroll = 0.4;
	const triggerOffset = 1 - triggerScroll;
	console.log("scale", position[0]);

	if (fixed) {
		//sunflower seed
		useEffect(
			() => {
				ref.current.position.x = triggerScroll - position[0];
			},
			[ref.current]
		);
		useFrame(({ scroll, camera }) => {
			// ref.current.scale.x += 0.01;
			ref.current.rotation.y += 0.01;
			if (rotation) {
				ref.current.rotation.set(rotation);
			}
			const s = 1 - data.offset;
			if (fixed && data.offset > triggerScroll) {
				ref.current.scale.set(s, s, s);
				ref.current.position.x =
					triggerScroll - position[0] + (data.offset - triggerScroll) * 2.5;
			} else {
				ref.current.scale.set(triggerOffset, triggerOffset, triggerOffset);
				ref.current.position.y = data.offset * 20 - 7;
			}
		});
	} else {
		useEffect(
			() => {
				if (rotation) {
					ref.current.rotation.x = rotation[0];
					ref.current.rotation.y = rotation[1];
					ref.current.rotation.z = rotation[2];
				}
			},
			[ref.current]
		);
		useFrame(({ scroll, camera }) => {
			// ref.current.scale.x += 0.01;
			ref.current.rotation.y += 0.01;
		});
	}

	return (
		<primitive scale={scale} ref={ref} position={position} object={gltf.scene} />
	);
};

export default Model;
