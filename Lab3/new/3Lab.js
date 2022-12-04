import * as THREE from "https://unpkg.com/three@0.123.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.123.0/examples/jsm/controls/OrbitControls.js";
import { ConvexGeometry } from "https://unpkg.com/three@0.123.0/examples/jsm/geometries/ConvexGeometry.js";
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
renderer.shadowMap.enabled = true;

$("#WebGL-output").append(renderer.domElement);
const orbitControls = new OrbitControls(camera, renderer.domElement);

const axes = new THREE.AxesHelper(50);
scene.add(axes);

const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
scene.add(ambientLight);

const r = 5;
const R = 7.5;
const pointsCount = 10000;

let generatedPoints = generatePoints(R, r, pointsCount);

let filteredPoints = filterPoints(R, r, generatedPoints);

const geometry = new ConvexGeometry(filteredPoints);

geometry.faceVertexUvs[0] = [];

const faces = geometry.faces;

let u1, u2, u3;
const s = 4;
for (const face of faces) {
    const v1 = geometry.vertices[face.a],
        v2 = geometry.vertices[face.b],
        v3 = geometry.vertices[face.c];

    u1 = calcU(v1.x, v1.z, s);
    u2 = calcU(v2.x, v2.z, s);
    u3 = calcU(v3.x, v3.z, s);

    if (u1 > 0.9 * s || u2 > 0.9 * s || u3 > 0.9 * s) {
        if (u1 < s * 0.8) u1 += s;
        if (u2 < s * 0.8) u2 += s;
        if (u3 < s * 0.8) u3 += s;
    }

    geometry.faceVertexUvs[0].push([
        new THREE.Vector2(u1, calcV(v1.y, r)),
        new THREE.Vector2(u2, calcV(v2.y, r)),
        new THREE.Vector2(u3, calcV(v3.y, r)),
    ]);
}
geometry.uvsNeedUpdate = true;

const texture = new THREE.TextureLoader().load("textures/texture.jpg");
texture.wrapS = THREE.RepeatWrapping;

const material = new THREE.MeshBasicMaterial({ map: texture });

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

render();

function render() {
    stats.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    orbitControls.update();
}

function generatePoints(R, r, n) {
    var points = [];
    for (let i = 0; i < n; i++) {
        let x = random(-(R + r), R + r);
        let y = random(-r, r);
        let z = random(-(R + r), R + r);
        points.push(new THREE.Vector3(x, y, z));
    }
    return points;
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function pow2(x) {
    return Math.pow(x, 2);
}

function filterPoints(R, r, points) {
    let a, b;
    let filteredPoints = [];
    points.forEach((v) => {
        a = pow2(pow2(v.x) + pow2(v.y) + pow2(v.z) + pow2(R) - pow2(r));
        b = 4 * pow2(R) * (pow2(v.x) + pow2(v.z));
        if (a - b <= 0) filteredPoints.push(v);
    });
    return filteredPoints;
}

function calcU(x, z, s) {
    let phi = Math.atan2(z, x);
    return ((phi + Math.PI) / (2 * Math.PI)) * s;
}

function calcV(y, r) {
    return Math.asin(y / r) / Math.PI + 1 / 2;
}

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