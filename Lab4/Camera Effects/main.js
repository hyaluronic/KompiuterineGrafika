import * as THREE from "https://unpkg.com/three@0.123.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.123.0/examples/jsm/controls/OrbitControls.js";

let renderer;
let scene;
let camera;
let camera1;
let camera2;
let camera2Helper;
let camera2Obj;
let camera3;
let camera3Helper;
let camera3Obj;
const farTile = 32;

let dollyPosition = -25;

let blackKing;

let options;

let orbitControls;
let eyeTargetScale;

function init() {
  scene = new THREE.Scene();

  camera1 = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera1.position.set(-100, 40, 60);
  camera1.lookAt(scene.position);

  camera2 = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    150
  );
  camera2Helper = new THREE.CameraHelper(camera2);
  scene.add(camera2Helper);
  camera2Obj = createCamera();
  camera2Obj.position.set(
    camera2.position.x,
    camera2.position.y,
    camera2.position.z
  );
  scene.add(camera2Obj);

  camera3 = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    50
  );
  camera3.position.set(4.6, 35, 0);
  camera3Helper = new THREE.CameraHelper(camera3);
  scene.add(camera3Helper);
  camera3Obj = createCamera();
  camera3Obj.position.set(
    camera3.position.x,
    camera3.position.y,
    camera3.position.z
  );
  scene.add(camera3Obj);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x400000, 0.5);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var spotLight = new THREE.SpotLight({ intensity: 2 });
  spotLight.position.set(0, 40, -80);
  spotLight.shadow.mapSize.width = 4096;
  spotLight.shadow.mapSize.height = 4096;
  spotLight.angle = Math.PI / 3.5;
  spotLight.castShadow = true;
  scene.add(spotLight);

  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);

  document.body.appendChild(renderer.domElement);

  var controls = new (function () {
    this.cameraNo = 1;
    this.rotatingWireframe = false;
    this.fieldOfView = 45;
    this.dolyZoom = 0;
    this.dollyWireframe = false;

    this.asGeom = function () {
      options = {
        cameraNo: controls.cameraNo,
        rotatingWireframe: controls.rotatingWireframe,
        fieldOfView: controls.fieldOfView,
        dolyZoom: controls.dolyZoom,
        dollyWireframe: controls.dollyWireframe,
      };

      camera1.fov = options.fieldOfView;
      camera1.updateProjectionMatrix();
      changeCamera(options.cameraNo);
      zoomInDoly(options.dolyZoom - 73);
      camera2Helper.visible = options.dollyWireframe;
      camera3Helper.visible = options.rotatingWireframe;
    };
  })();

  var gui = new dat.GUI();
  gui
    .add(controls, "cameraNo", 1, 3, 1)
    .name("Camera")
    .onChange(controls.asGeom);
  gui
    .add(controls, "rotatingWireframe", false, true)
    .name("Rotating wireframe")
    .onChange(controls.asGeom);
  gui
    .add(controls, "fieldOfView", 2, 80, 1)
    .name("Field of view")
    .onChange(controls.asGeom);
  gui
    .add(controls, "dolyZoom", -100, 100, 0.01)
    .name("Doly zoom")
    .onChange(controls.asGeom);
  gui
    .add(controls, "dollyWireframe", false, true)
    .name("Dolly wireframe")
    .onChange(controls.asGeom);

  addFloor();

  const whiteKing = getKing(0xe7d2b3);
  whiteKing.position.x = 4;
  whiteKing.position.z = farTile;
  whiteKing.name = "whiteKing";

  blackKing = getKing(0x212740);
  blackKing.position.x = -4;
  blackKing.position.z = -4;
  blackKing.name = "blackKing";

  camera2.position.x = dollyPosition;
  camera2.position.y = 13;
  camera2.position.z = dollyPosition;
  camera2Obj.position.set(
    camera2.position.x,
    camera2.position.y,
    camera2.position.z
  );
  camera2Obj.lookAt(blackKing.position);

  target = new THREE.Vector3();
  target.set(
    blackKing.position.x,
    blackKing.position.y + 10,
    blackKing.position.z
  );
  camera2.lookAt(target);
  camera2.updateMatrixWorld();

  camera2.far = target;

  let startdir = new THREE.Vector3();
  startdir.subVectors(camera2.position, target);
  eyeTargetScale =
    Math.tan((camera2.fov * (Math.PI / 180)) / 2) * startdir.length();

  scene.add(whiteKing);
  scene.add(blackKing);

  orbitControls = new OrbitControls(camera1, renderer.domElement);

  controls.asGeom();
  render();
}

let eyedir;
let target;

function zoomInDoly(level) {
  camera2.position.x = dollyPosition - (dollyPosition * level) / 50;
  camera2.position.z = dollyPosition - (dollyPosition * level) / 50;
  camera2Obj.position.set(
    camera2.position.x,
    camera2.position.y,
    camera2.position.z
  );

  target = new THREE.Vector3();
  target.set(
    blackKing.position.x,
    blackKing.position.y + 10,
    blackKing.position.z
  );

  eyedir = new THREE.Vector3();
  eyedir.subVectors(camera2.position, target);

  camera2.near = eyedir.length() / 100;
  camera2.far = eyedir.length() + 100;
  camera2.fov =
    (180 / Math.PI) * 2 * Math.atan(eyeTargetScale / eyedir.length());
  camera2.lookAt(target);

  camera2.updateProjectionMatrix();
  camera2.updateMatrixWorld();
  camera2Helper.update();
  camera3Helper.update();
}

function changeCamera(cameraNo) {
  switch (cameraNo) {
    case 1:
      camera = camera1;
      break;
    case 2:
      camera = camera2;
      break;
    case 3:
      camera = camera3;
      break;
    default:
      camera = camera1;
      break;
  }
}

function createCamera() {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(8, 4.5, 2.5),
    new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 100 })
  );
  const rearBox = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.5, 1),
    new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 100 })
  );
  rearBox.position.x -= 4;

  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 0.8, 2, 100),
    new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 100 })
  );
  cylinder.position.x += 5;
  cylinder.rotation.z = -Math.PI / 2;

  const innerCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.1, 2.5, 100),
    new THREE.MeshPhongMaterial({ color: 0xaa0000, shininess: 100 })
  );
  innerCylinder.position.x += 5;
  innerCylinder.rotation.z = -Math.PI / 2;

  const topCylinder1 = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.5, 2, 100),
    new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 100 })
  );
  topCylinder1.rotation.x = -Math.PI / 2;
  topCylinder1.position.set(-2.5, 4.5, 0);

  const topCylinder2 = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.5, 2, 100),
    new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 100 })
  );
  topCylinder2.rotation.x = -Math.PI / 2;
  topCylinder2.position.set(2.5, 4.5, 0);

  const cameraShapesGroup = new THREE.Group();
  cameraShapesGroup.add(body);
  cameraShapesGroup.add(rearBox);
  cameraShapesGroup.add(cylinder);
  cameraShapesGroup.add(innerCylinder);
  cameraShapesGroup.add(topCylinder1);
  cameraShapesGroup.add(topCylinder2);
  cameraShapesGroup.rotation.y = -Math.PI / 2;
  cameraShapesGroup.position.z = -4;

  const orientedGroup = new THREE.Group();
  orientedGroup.add(cameraShapesGroup);

  const axesHelper = new THREE.AxesHelper(3);
  orientedGroup.add(axesHelper);

  return orientedGroup;
}

const carpetheight = 0.5;
const carpetMaterial = new THREE.MeshPhongMaterial({ color: 0x638477 });
const getCarpet = (size, height) => {
  const geometry = new THREE.CylinderGeometry(size, size, height, 32);
  const mesh = new THREE.Mesh(geometry, carpetMaterial);
  mesh.position.set(0, height / 2, 0);
  mesh.castShadow = true;
  return mesh;
};

const getKing = (color) => {
  const size = 5;

  const material = new THREE.MeshStandardMaterial();
  material.color = new THREE.Color(color);
  material.metalness = 0.4;
  material.roughness = 0.15;
  material.side = THREE.DoubleSide;

  const king = new THREE.Group();

  const carpetMesh = getCarpet(size * 0.75, carpetheight);
  king.add(carpetMesh);

  let currentHeight = carpetheight;

  const path = new THREE.Path();
  path.moveTo(318, 166);
  path.bezierCurveTo(401, 162, 507, 153, 404, 281);
  path.lineTo(419, 295);
  path.lineTo(420, 314);
  path.bezierCurveTo(441, 313, 442, 355, 413, 354);
  path.bezierCurveTo(384, 353, 437, 506, 462, 538);
  path.lineTo(490, 538);
  path.lineTo(490, 567);
  path.bezierCurveTo(504, 564, 522, 578, 516, 590);
  path.lineTo(517, 640);
  path.lineTo(536, 654);
  path.bezierCurveTo(546, 696, 523, 686, 517, 685);
  path.lineTo(323, 686);

  const pathPoints = path.getPoints();
  const points = [];
  for (let i = 0; i < pathPoints.length; i++) {
    points.push(
      new THREE.Vector2(
        34 - pathPoints[i].x / 10,
        (pathPoints[pathPoints.length - 1].y - pathPoints[i].y - 200) / 10
      )
    );
  }

  const latheGeometry = new THREE.LatheGeometry(points, 32, 0, 2 * Math.PI);
  const mesh = new THREE.Mesh(latheGeometry, material);
  const latheHeight = 8;
  mesh.scale.set(0.2, 0.2, 0.2);
  mesh.position.set(0, currentHeight + latheHeight / 2, 0);
  mesh.castShadow = true;
  currentHeight += latheHeight;
  king.add(mesh);

  const crossGeometry1 = new THREE.BoxGeometry(0.5, 0.5, 2);
  const crossMesh1 = new THREE.Mesh(crossGeometry1, material);
  crossMesh1.position.set(0, currentHeight + 3.75, 0);
  crossMesh1.castShadow = true;
  king.add(crossMesh1);

  const crossGeometry2 = new THREE.BoxGeometry(0.5, 3, 0.5);
  const crossMesh2 = new THREE.Mesh(crossGeometry2, material);
  crossMesh2.position.set(0, currentHeight + 3.25, 0);
  crossMesh2.castShadow = true;
  king.add(crossMesh2);
  king.rotation.y = Math.PI / 2;
  return king;
};

const addFloor = () => {
  const size = 8;
  const height = 4;
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xeedebd });
  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x15355e });
  const getPlateMaterial = (isWhite) =>
    isWhite ? whiteMaterial : blackMaterial;

  const isEven = (number) => (number & 1) == 1;

  const cubeGeometry = new THREE.BoxGeometry(size, height, size);
  const board = new THREE.Group();

  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      const isWhite = isEven(x) != isEven(z);
      const plate = new THREE.Mesh(cubeGeometry, getPlateMaterial(isWhite));
      plate.position.set(x * size, 0, z * size);
      plate.receiveShadow = true;
      board.add(plate);
    }
  }

  board.position.set(-size * 4 + size / 2, -height / 2, -size * 4 + size / 2);
  scene.add(board);
};

let step = 0;
let rotation;
const delta = 28;
let diff;

function render() {
  renderer.render(scene, camera);
  if (camera == camera1) {
    orbitControls.update();
    if (options.dollyWireframe) {
      camera2Helper.visible = true;
    }
  } else camera2Helper.visible = false;

  const whiteKing = scene.getObjectByName("whiteKing");

  // //white king movement
  step += 0.015;
  whiteKing.position.z = 28 * Math.cos(step);

  camera3.lookAt(whiteKing.position);
  camera3Obj.lookAt(whiteKing.position);

  // //z rotation of the camera
  if (Math.abs(whiteKing.position.z) - delta < camera3.position.z) {
    diff = Math.sin((-Math.PI / (2 * delta)) * whiteKing.position.z);
    rotation = (diff * Math.PI) / 2 - Math.PI / 2;
    camera3.rotation.z = rotation;
    camera3Obj.rotation.z = rotation + Math.PI;
  }

  requestAnimationFrame(render);
}

window.onload = init;
