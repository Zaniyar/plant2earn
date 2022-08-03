import {
	TextureLoader,
	DoubleSide,
	MeshLambertMaterial,
	Mesh,
	ShaderMaterial,
	sRGBEncoding,
	Vector2,
	Vector3,
	Vector4,
	MeshStandardMaterial
} from "three";
import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import React from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { proxy, useSnapshot, subscribe } from "valtio";

import { Tree } from "./proctree.js";
import twig from "../../public/img/twig-1.png";
import { GUI } from "dat.gui";

let gui = new GUI();

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
	dropAmount: -0.1,
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

const config = proxy(configRaw);

const addGUI = () => {
	// const gui = = new GUI();
	const treeFolder = gui.addFolder("tree");
	const branchFolder = gui.addFolder("branching");
	const trunkFolder = gui.addFolder("trunk");

	const ctrls = [
		// Tree
		treeFolder.add(config, "seed").min(1).max(1000),
		// treeFolder.add(config, 'segments').min(6).max(20), no effect
		treeFolder.add(config, "levels").min(0).max(7),
		// treeFolder.add(config, 'vMultiplier').min(0.01).max(10), no textures
		treeFolder.add(config, "twigScale").min(0).max(1),

		// Branching
		branchFolder.add(config, "initalBranchLength").min(0.1).max(1),
		branchFolder.add(config, "lengthFalloffFactor").min(0.5).max(1),
		branchFolder.add(config, "lengthFalloffPower").min(0.1).max(1.5),
		branchFolder.add(config, "clumpMax").min(0).max(1),
		branchFolder.add(config, "clumpMin").min(0).max(1),
		branchFolder.add(config, "branchFactor").min(2).max(4),
		branchFolder.add(config, "dropAmount").min(-1).max(1),
		branchFolder.add(config, "growAmount").min(-0.5).max(1),
		branchFolder.add(config, "sweepAmount").min(-1).max(1),

		// Trunk
		trunkFolder.add(config, "maxRadius").min(0.05).max(1.0),
		trunkFolder.add(config, "climbRate").min(0.05).max(1.0),
		trunkFolder.add(config, "trunkKink").min(0.0).max(0.5),
		trunkFolder.add(config, "treeSteps").min(0).max(35).step(1),
		trunkFolder.add(config, "taperRate").min(0.7).max(1.0),
		trunkFolder.add(config, "radiusFalloffRate").min(0.5).max(0.8),
		trunkFolder.add(config, "twistRate").min(0.0).max(10.0),
		trunkFolder.add(config, "trunkLength").min(0.1).max(5.0)
	];

	ctrls.forEach(ctrl => {
		ctrl.onChange(() => {
			// Treex({ position: [-0.8709602266786797, -25.782186796093068, 0.5] });
			// state;
		});
		ctrl.listen();
	});

	// Materials
	const matFolder = gui.addFolder("materials");
	matFolder
		.addColor(config, "treeColor")
		.onChange(hex => treeMaterial.color.setHex(hex))
		.listen();
	matFolder
		.addColor(config, "twigColor")
		.onChange(hex => twigMaterial.color.setHex(hex))
		.listen();
};

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
addGUI();
// window.scene = scene;
let oldTreeGroup;

const Treex = ({ position }) => {
	const snap = useSnapshot(config);
	const ref = useRef();

	useFrame(() => {
		// let scale = 2;
		// ref.current.scale.set(scale, scale, scale);
		ref.current.rotation.y += 0.001;
		// config.lengthFalloffPower -= 0.001;
	});

	const tree = new Tree(config);
	console.log("ja chnaged", config);
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
	// scene.remove(oldTreeGroup);
	// scene.add(treeGroup);
	oldTreeGroup = treeGroup;
	const numVerts = tree.verts.length + tree.vertsTwig.length;
	// return treeGroup;
	return (
		<group ref={ref} position={position} args={[config.seed]}>
			<mesh geometry={treeGeometry} material={treeMaterial} />
			<mesh geometry={twigGeometry} material={twigMaterial} />
			{/* <bufferGeometry attach="geometry" geometry={twigGeometry} /> */}
			{/* <primitive key={0} object={new THREE.Mesh(treeGeometry, material)} /> */}
			{/* <primitive key={1} object={new THREE.Mesh(twigGeometry, material)} /> */}
		</group>
	);
};

function createFloatAttribute(array, itemSize) {
	const typedArray = new Float32Array(window.Tree.flattenArray(array));
	return new THREE.BufferAttribute(typedArray, itemSize);
}

function createIntAttribute(array, itemSize) {
	const typedArray = new Uint16Array(window.Tree.flattenArray(array));
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

// createTree();
export { Treex };
