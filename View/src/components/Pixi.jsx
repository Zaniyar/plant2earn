import React from "react";
import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as PIXI from "pixi.js";
import * as THREE from "three";
import { MeshBasicMaterial } from "three";
const PixiTexture = ({ url }) => {
	//-------------------------------------------------------------------------------------
	// 2D UI canvas
	//-------------------------------------------------------------------------------------

	var app = new PIXI.Application();
	var scene_UI = app.stage;
	var width = window.innerWidth;
	var height = window.innerHeight;

	var canvas_UI = PIXI.autoDetectRenderer(
		window.innerWidth,
		window.innerHeight,
		{ transparent: true }
	);
	canvas_UI.view.style.position = "absolute";
	canvas_UI.view.style.top = "0px";
	canvas_UI.view.style.left = "0px";

	var graphics = new PIXI.Graphics();
	graphics.beginFill(0xe60630);
	graphics.moveTo(width / 2 - 200, height / 2 + 100);
	graphics.lineTo(width / 2 - 200, height / 2 - 100);
	graphics.lineTo(width / 2 + 200, height / 2 - 100);
	graphics.lineTo(width / 2 + 200, height / 2 + 100);
	graphics.endFill();

	scene_UI.addChild(graphics);

	let img = new PIXI.Sprite.from("../../public/img/" + url + "1.png");
	img.width = 613; //window.innerWidth;
	img.height = 545;
	window.innerHeight;
	scene_UI.addChild(img);

	let depthMap = new PIXI.Sprite.from("../../public/img/" + url + "2.png");
	depthMap.width = 613;
	depthMap.height = 545;

	scene_UI.addChild(depthMap);

	let displacementFilter = new PIXI.filters.DisplacementFilter(depthMap);
	scene_UI.filters = [displacementFilter];

	// texture.anisotropy = pixi.gl.capabilities.getMaxAnisotropy();
	useFrame(() => {
		texture_UI.needsUpdate = true;
		canvas_UI.render(scene_UI);
	});

	window.onmousemove = function(e) {
		displacementFilter.scale.x = -(window.innerWidth / 2 - e.clientX) / 20;
		displacementFilter.scale.y = -(window.innerHeight / 2 - e.clientY) / 20;
	};
	//-------------------------------------------------------------------------------------
	// Map 2D UI canvas on 3D Plane
	//-------------------------------------------------------------------------------------
	var texture_UI = new THREE.Texture(canvas_UI.view);
	texture_UI.needsUpdate = true;
	// return (
	// 	<meshStandardMaterial attach="material" metalness={0} roughness={1}>
	// 		<canvasTexture ref={textureRef} attach="map" map={texture} />
	// 	</meshStandardMaterial>
	// );
	return <meshStandardMaterial map={texture_UI} side={THREE.DoubleSide} />;
};

export default PixiTexture;
