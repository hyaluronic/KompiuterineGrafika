import * as THREE from "https://unpkg.com/three@0.123.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.123.0/examples/jsm/controls/OrbitControls.js";
import { ConvexGeometry } from "./node_modules/three/examples/jsm/geometries/ConvexGeometry.js";

const scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  10,
  1000
);
configureCamera();

var renderer = new THREE.WebGLRenderer({ antialias: true });
configureRenderer();

$("#WebGL-output").append(renderer.domElement);
var orbitControls = new OrbitControls(camera, renderer.domElement);

addPlane();

setUpLight();

var controls = new (function () {
  this.RTorus = 8;
  this.rTorus = 4;
  this.noOfPoints = 100000;
  this.textureScale = 3.5;
  this.yPosition = 18;

  this.asGeom = function () {
    var options = {
      RTorus: controls.RTorus,
      rTorus: controls.rTorus,
      noOfPoints: controls.noOfPoints,
      textureScale: controls.textureScale,
      yPosition: controls.yPosition,
    };
    drawTorus(options);
  };
})();

var gui = new dat.GUI();
gui.add(controls, "RTorus", 1, 20).step(1).onChange(controls.asGeom);
gui.add(controls, "rTorus", 1, 20).step(1).onChange(controls.asGeom);
gui.add(controls, "noOfPoints", 100, 1000000).step(1).onChange(controls.asGeom);
gui.add(controls, "textureScale", 1, 20).step(1).onChange(controls.asGeom);
gui.add(controls, "yPosition", 0, 30).step(1).onChange(controls.asGeom);
controls.asGeom();

var mesh;

function drawTorus(options) {
  if (mesh) scene.remove(mesh);

  const r = options.rTorus;
  const R = options.RTorus;

  let points = generatePoints(R, r, options.noOfPoints);

  let filteredPoints = filterPoints(R, r, points);

  const geometry = new ConvexGeometry(filteredPoints);

  geometry.faceVertexUvs[0] = [];

  var faces = geometry.faces;

  let u1, u2, u3;
  const s = options.textureScale;
  for (var i = 0; i < faces.length; i++) {
    var v1 = geometry.vertices[faces[i].a],
      v2 = geometry.vertices[faces[i].b],
      v3 = geometry.vertices[faces[i].c];

    u1 = calcU(v1.x, v1.z, s);
    u2 = calcU(v2.x, v2.z, s);
    u3 = calcU(v3.x, v3.z, s);

    if (u1 > 0.9 * s || u2 > 0.9 * s || u3 > 0.9 * s) {
      console.log("u1: " + u1);
      console.log("u2: " + u2);
      console.log("u3: " + u3);
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

  function calcU(x, z, s) {
    let phi = Math.atan2(z, x);
    return ((phi + Math.PI) / (2 * Math.PI)) * s;
  }

  function calcV(y, r) {
    return Math.asin(y / r) / Math.PI + 1 / 2;
  }

  const texture = new THREE.TextureLoader().load("textures/texture.jpg");
  texture.wrapS = THREE.RepeatWrapping;

  const material = new THREE.MeshPhongMaterial({ map: texture });

  mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = controls.yPosition;
  mesh.castShadow = true;
  scene.add(mesh);
}

controls.asGeom();
render();

function render() {
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

function configureCamera() {
  camera.position.x = -40;
  camera.position.y = 20;
  camera.position.z = -40;
  camera.lookAt(scene.position);
}

function configureRenderer() {
  renderer.setClearColor(0xeeeeee, 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function addPlane() {
  var planeGeometry = new THREE.PlaneGeometry(100, 100);
  var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  planeMaterial.side = THREE.DoubleSide;
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;
  scene.add(plane);
}

function setUpLight() {
  const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
  scene.add(ambientLight);
  var spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.angle = (Math.PI / 2) * 0.6;
  spotLight.position.set(-50, 50, -50);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 4096; // default is 512
  spotLight.shadow.mapSize.height = 4096; // default is 512
  scene.add(spotLight);
}
