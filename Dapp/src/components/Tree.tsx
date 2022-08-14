import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";

import { Treex } from "./proctree.js";
import twig from "../../public/img/twig-1.png";
import farmland from "../../public/img/Farmland.jpg";
import { Text, useTexture } from "@react-three/drei";
import { RGBA_ASTC_12x12_Format } from "three";
import { IDetails } from "../interfaces/Interfaces.js";


/*TREE: */
let configRaw = {
	seed: 262,
	segments: 6,
	levels: 5,
	vMultiplier: 2.36,
	twigScale: 0.39,
	initalBranchLength: 0.49,
	lengthFalloffFactor: 0.85,
	// lengthFalloffPower: 3,
	lengthFalloffPower: 0.99,
	clumpMax: 0.454,
	clumpMin: 0.404,
	branchFactor: 2.45,
	dropAmount: -0.05,
	growAmount: 0.235,
	sweepAmount: 0.01,
	maxRadius: 0.139,
	climbRate: 0.371,
	trunkKink: 0.093,
	treeSteps: 5,
	taperRate: 0.947,
	radiusFalloffRate: 0.73,
	twistRate: 3.02,
	trunkLength: 2.4,
	// custom
	treeColor: 0x9d7362,
	twigColor: 0xf16950
};

const config = configRaw;

let textureLoader = new THREE.TextureLoader();

let treeMaterial = new THREE.MeshStandardMaterial({
	color: config.treeColor,
	roughness: 1.0,
	metalness: 0.0
});

let twigMaterial = new THREE.MeshStandardMaterial({
	color: config.twigColor,
	roughness: 1.0,
	metalness: 0.0,
	map: textureLoader.load(twig),
	alphaTest: 0.9
});

let oldTreeGroup;

interface ITreeProps extends IDetails {
	position: any;
};

const Tree = (props: ITreeProps) => {

	const { position, level, harvestCounter, wateringCounter } = props;

	const ref = useRef();

	useFrame(() => {
		// let scale = 2;
		// ref.current.scale.set(scale, scale, scale);
		ref.current.rotation.y += 0.001;
		// config.lengthFalloffPower -= 0.001;
	});

	const planted = level >= 1;
	if(planted){
		config.levels = level + 1;
		config.trunkLength = 0.8 + level / 3;
		config.maxRadius = 0.04 + level / 50;
		config.twigScale = wateringCounter / 10;
	}

	const tree = new Treex(config);
	const treeGeometry = new THREE.BufferGeometry();
	treeGeometry.setAttribute("position", createFloatAttribute(tree.verts, 3));
	treeGeometry.setAttribute(
		"normal",
		normalizeAttribute(createFloatAttribute(tree.normals, 3))
	);
	treeGeometry.setAttribute("uv", createFloatAttribute(tree.UV, 2));
	treeGeometry.setIndex(createIntAttribute(tree.faces, 1));

	const twigGeometry = new THREE.BufferGeometry();
	twigGeometry.setAttribute("position", createFloatAttribute(tree.vertsTwig, 3));
	twigGeometry.setAttribute(
		"normal",
		normalizeAttribute(createFloatAttribute(tree.normalsTwig, 3))
	);
	twigGeometry.setAttribute("uv", createFloatAttribute(tree.uvsTwig, 2));
	twigGeometry.setIndex(createIntAttribute(tree.facesTwig, 1));

	const treeGroup = new THREE.Group();
	treeGroup.add(new THREE.Mesh(treeGeometry, treeMaterial));
	treeGroup.add(new THREE.Mesh(twigGeometry, twigMaterial));
	treeGroup.scale.set(0.2, 0.2, 0.2);
	oldTreeGroup = treeGroup;
    const textureFarmland = useTexture(farmland) 

	return (
		<group ref={ref} position={position} args={[config.seed]}>
			{ planted && <mesh geometry={treeGeometry} material={treeMaterial} /> }
			{ planted && <mesh geometry={twigGeometry} material={twigMaterial} /> }
            <mesh> 
                <boxBufferGeometry args={[2,0,2]} />
                <meshBasicMaterial map={textureFarmland}/>
            </mesh>
            {/* <Text color="black" anchorX="center" anchorY="middle">
                hello world!
            </Text> */}
		</group>
	);
};

function createFloatAttribute(array, itemSize) {
	const typedArray = new Float32Array(Treex.flattenArray(array));
	return new THREE.BufferAttribute(typedArray, itemSize);
}

function createIntAttribute(array, itemSize) {
	const typedArray = new Uint16Array(Treex.flattenArray(array));
	return new THREE.BufferAttribute(typedArray, itemSize);
}

function normalizeAttribute(attribute) {
	var v = new THREE.Vector3();
	for (var i = 0; i < attribute.count; i++) {
		v.set(attribute.getX(i), attribute.getY(i), attribute.getZ(i));
		v.normalize();
		attribute.setXYZ(i, v.x, v.y, v.z);
	}
	return attribute;
}

export default Tree;


