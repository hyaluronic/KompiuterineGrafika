import * as THREE from "./lib/threeModule.js";
import {OrbitControls} from "https://unpkg.com/three@0.123.0/examples/jsm/controls/OrbitControls.js";
import {ConvexGeometry} from "https://unpkg.com/three@0.123.0/examples/jsm/geometries/ConvexGeometry.js";
import Stats from "https://unpkg.com/three@0.123.0/examples/jsm/libs/stats.module";

const stats = initStats();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.x = -30;
camera.position.y = 40;
camera.position.z = 50;
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xeeeeee, 1.0);
renderer.setSize(window.innerWidth, window.innerHeight);

$("#WebGL-output").append(renderer.domElement);
const orbitControls = new OrbitControls(camera, renderer.domElement);

const axes = new THREE.AxesHelper(50);
scene.add(axes);

const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
scene.add(ambientLight);

const r = 5;
const R = 7.5;
const pointsCount = 10000;

let generatedPoints = generatePoints();
let [goodPoints, badPoints] = filterPoints();
const pointsGroup = new THREE.Object3D();
// addPoints(goodPoints, 0xff0000);
// addPoints(badPoints, 0xd7d8cc);
scene.add(pointsGroup);

const geometry = new ConvexGeometry(goodPoints);
geometry.uvsNeedUpdate = true;
geometry.faceVertexUvs[0] = [];
const s = 5;
let u1, u2, u3, v1, v2, v3;
for (const face of geometry.faces) {
    [u1, v1] = calcUV(geometry.vertices[face.a]);
    [u2, v2] = calcUV(geometry.vertices[face.b]);
    [u3, v3] = calcUV(geometry.vertices[face.c]);
    fixU();

    geometry.faceVertexUvs[0].push([
        new THREE.Vector2(u1, v1),
        new THREE.Vector2(u2, v2),
        new THREE.Vector2(u3, v3),
    ]);
}

const texture = new THREE.TextureLoader().load("textures/texture.jpg");
texture.wrapS = THREE.RepeatWrapping;
const textureMaterial = new THREE.MeshBasicMaterial({map: texture/*, transparent: true*/});
textureMaterial.side = THREE.DoubleSide;
const wireFrameMat = new THREE.MeshBasicMaterial({color: 0x1603d3});
wireFrameMat.wireframe = true;
const mesh = createMultiMaterialObject(geometry, [textureMaterial/*, wireFrameMat*/]);
scene.add(mesh);

render();

function initStats() {
    const newStats = new Stats();
    newStats.setMode(0);

    // Align top-left
    newStats.domElement.style.position = "absolute";
    newStats.domElement.style.left = "0px";
    newStats.domElement.style.top = "0px";

    $("#Stats-output").append(newStats.domElement);

    return newStats;
}

function render() {
    stats.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    orbitControls.update();
}

function generatePoints() {
    let points = [];
    for (let i = 0; i < pointsCount; i++) {
        let [x, y, z] = generatePoint();
        points.push(new THREE.Vector3(x, y, z));
    }
    return points;
}

function generatePoint() {
    let random = (min, max) => Math.random() * (max - min) + min;
    return [random(-(R + r), R + r), random(-r, r), random(-(R + r), R + r)]
}

function filterPoints() {
    let goodPoints = [];
    let badPoints = [];
    generatedPoints.forEach((point) => {
        if (Math.pow(Math.pow(point.x, 2) + Math.pow(point.y, 2) + Math.pow(point.z, 2) + Math.pow(R, 2) - Math.pow(r, 2), 2)
            - 4 * Math.pow(R, 2) * (Math.pow(point.x, 2) + Math.pow(point.z, 2)) <= 0) {
            goodPoints.push(point)
        } else {
            badPoints.push(point);
        }
    });
    return [goodPoints, badPoints];
}

function addPoints(points, color) {
    points.forEach(function (point) {
        const pointsMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09), new THREE.MeshBasicMaterial({color: color}));
        pointsMesh.position.set(point.x, point.y, point.z);
        pointsGroup.add(pointsMesh);
    });
}

function calcUV(vertex) {
    const u = ((Math.atan2(vertex.z, vertex.x) + Math.PI) / (2 * Math.PI)) * s;
    const v = Math.asin(vertex.y / r) / Math.PI + 1 / 2;
    return [u, v];
}

function fixU() {
    if (u1 > 0.9 * s || u2 > 0.9 * s || u3 > 0.9 * s) {
        if (u1 < s * 0.8) u1 += s;
        if (u2 < s * 0.8) u2 += s;
        if (u3 < s * 0.8) u3 += s;
    }
}

function createMultiMaterialObject(geometry, materials) {
    var group = new THREE.Group();
    for (let i = 0; i < materials.length; i++) {
        group.add(new THREE.Mesh(geometry, materials[i]));
    }
    return group;
}