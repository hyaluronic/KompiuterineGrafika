// once everything is loaded, we run our Three.js stuff.
$(function () {

    const stats = initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    const scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // create a render and set the size
    const webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(0xEEEEEE, 1.0);
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMapEnabled = true;

    // position and point the camera to the center of the scene
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 50;
    camera.lookAt(new THREE.Vector3(10, 0, 0));

    // add the output of the renderer to the html element
    $("#WebGL-output").append(webGLRenderer.domElement);

    camControl = new THREE.TrackballControls(camera, webGLRenderer.domElement);

    createChessFigureMesh()

    render();

    function createChessFigureMesh() {
        const pointsX = [
            251, 202, 214, 225, 215, 215,
            210, 210, 224, 225, 220, 214,
            205, 203, 196, 184, 189, 169,
            168, 172, 161, 161, 250
        ];
        const pointsY = [
            75, 92, 120, 143, 145, 150,
            155, 165, 170, 205, 235, 265,
            283, 295, 307, 316, 325, 334,
            343, 357, 361, 375, 375
        ];
        const points = [];
        for (let i = 0; i < pointsX.length; i++) {
            points.push(new THREE.Vector2(25 - pointsX[i] / 10, (pointsY[pointsX.length - 1] - pointsY[i] - 174) / 10));
        }

        const latheGeometry = new THREE.LatheGeometry(points, 12, 0, 2 * Math.PI);

        const meshMaterial = new THREE.MeshNormalMaterial();
        meshMaterial.side = THREE.DoubleSide;
        const wireFrameMat = new THREE.MeshBasicMaterial();
        wireFrameMat.wireframe = true;

        const meshMaterials = [meshMaterial, wireFrameMat];

        const latheMesh = new THREE.Mesh(latheGeometry, meshMaterials);

        const crossYPosition = 13;
        const crossXPosition = 0;
        const cutYDistance = 1.5;
        const cutXDistance = 1.5;

        const crossGeometry = new THREE.BoxGeometry(5, 5, 1);
        const crossMesh = new THREE.Mesh(crossGeometry, meshMaterials);
        crossMesh.position.y = crossYPosition;
        crossMesh.position.x = crossXPosition;

        const boxGeometry = new THREE.BoxGeometry(2, 2, 1);
        const topLeftBox = new THREE.Mesh(boxGeometry, meshMaterials);
        topLeftBox.position.y = crossYPosition + cutYDistance;
        topLeftBox.position.x = crossXPosition - cutXDistance;

        const topRightBox = new THREE.Mesh(boxGeometry, meshMaterials);
        topRightBox.position.y = crossYPosition + cutYDistance;
        topRightBox.position.x = crossXPosition + cutXDistance;

        const bottomLeftBox = new THREE.Mesh(boxGeometry, meshMaterials);
        bottomLeftBox.position.y = crossYPosition - cutYDistance;
        bottomLeftBox.position.x = crossXPosition - cutXDistance;

        const bottomRightBox = new THREE.Mesh(boxGeometry, meshMaterials);
        bottomRightBox.position.y = crossYPosition - cutYDistance;
        bottomRightBox.position.x = crossXPosition + cutXDistance;

        let crossBSP = new ThreeBSP(crossMesh);
        let topLeftBSP = new ThreeBSP(topLeftBox);
        let topRightBSP = new ThreeBSP(topRightBox);
        let bottomLeftBSP = new ThreeBSP(bottomLeftBox);
        let bottomRightBSP = new ThreeBSP(bottomRightBox);
        crossBSP = crossBSP.subtract(topLeftBSP).subtract(topRightBSP).subtract(bottomLeftBSP).subtract(bottomRightBSP);

        let cross = crossBSP.toMesh();
        cross.geometry.computeFaceNormals();
        cross.geometry.computeVertexNormals();
        cross.material = meshMaterials;

        latheMesh.geometry.computeFaceNormals();
        latheMesh.geometry.computeVertexNormals();
        latheMesh.material = meshMaterials;

        let kingGroup = new THREE.Group();
        kingGroup.add(cross);
        kingGroup.add(latheMesh);
        scene.add(kingGroup);
    }

    function render() {
        stats.update();

        //latheMesh.rotation.x = step += 0.01;

        // render using requestAnimationFrame
        requestAnimationFrame(render);
        camControl.update();
        webGLRenderer.render(scene, camera);
    }

    function initStats() {

        const stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        $("#Stats-output").append(stats.domElement);

        return stats;
    }
});