// once everything is loaded, we run our Three.js stuff.
$(function () {
    const stats = initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    const scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.x = 0;
    camera.position.y = 100;
    camera.position.z = 180;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // create a render and set the size
    const renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(0xeeeeee, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // create the ground plane
    const plane = createPlane();
    scene.add(plane);

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(-60, 100, 125);
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);

    const helper = new THREE.CameraHelper(spotLight.shadow.camera);
    scene.add(helper);

    // add subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // add the output of the renderer to the html element
    $("#WebGL-output").append(renderer.domElement);

    let spin = false;

    const controls = new (function () {
        this.spotLightIntensity = 1;
        this.spotLightTargetX = 0;
        this.spotLightTargetY = 0;
        this.spotLightTargetZ = 0;
        this.spin = false;
    })();

    const gui = new dat.GUI();
    gui.add(controls, "spotLightIntensity", 0, 2);
    gui.add(controls, "spotLightTargetX", -100, 100);
    gui.add(controls, "spotLightTargetY", -100, 100);
    gui.add(controls, "spotLightTargetZ", -100, 100);
    gui.add(controls, 'spin').onChange(function () {
        spin = !spin;
    });

    const boardGroup = populateBoard();
    scene.add(boardGroup);

    const camControl = new THREE.TrackballControls(camera, renderer.domElement);
    render();

    function render() {
        stats.update();

        spotLight.intensity = controls.spotLightIntensity;
        spotLight.target.position.set(controls.spotLightTargetX, controls.spotLightTargetY, controls.spotLightTargetZ)
        camera.updateProjectionMatrix();

        camControl.update();

        if (spin) {
            plane.rotation.y += .01;
            boardGroup.rotation.y += .01;
        }

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    function createKing(color) {
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

        const meshMaterial = new THREE.MeshPhongMaterial({color: color, shininess: 100})
        meshMaterial.side = THREE.DoubleSide;

        const latheMesh = new THREE.Mesh(latheGeometry, meshMaterial);
        latheMesh.castShadow = true;

        const crossYPosition = 14.5;
        const crossXPosition = 0;
        const cutYDistance = 1.5;
        const cutXDistance = 1.5;

        const crossGeometry = new THREE.BoxGeometry(5, 5, 1);
        const crossMesh = new THREE.Mesh(crossGeometry, meshMaterial);
        crossMesh.position.x = crossXPosition;
        crossMesh.position.y = crossYPosition;

        const boxGeometry = new THREE.BoxGeometry(2, 2, 1);
        const topLeftBox = new THREE.Mesh(boxGeometry, meshMaterial);
        topLeftBox.position.x = crossXPosition - cutXDistance;
        topLeftBox.position.y = crossYPosition + cutYDistance;

        const topRightBox = new THREE.Mesh(boxGeometry, meshMaterial);
        topRightBox.position.x = crossXPosition + cutXDistance;
        topRightBox.position.y = crossYPosition + cutYDistance;

        const bottomLeftBox = new THREE.Mesh(boxGeometry, meshMaterial);
        bottomLeftBox.position.x = crossXPosition - cutXDistance;
        bottomLeftBox.position.y = crossYPosition - cutYDistance;

        const bottomRightBox = new THREE.Mesh(boxGeometry, meshMaterial);
        bottomRightBox.position.x = crossXPosition + cutXDistance;
        bottomRightBox.position.y = crossYPosition - cutYDistance;

        let cross = new ThreeBSP(crossMesh)
            .subtract(new ThreeBSP(topLeftBox))
            .subtract(new ThreeBSP(topRightBox))
            .subtract(new ThreeBSP(bottomLeftBox))
            .subtract(new ThreeBSP(bottomRightBox))
            .toMesh();

        cross.geometry.computeFaceNormals();
        cross.geometry.computeVertexNormals();
        cross.material = meshMaterial;

        latheMesh.geometry.computeFaceNormals();
        latheMesh.geometry.computeVertexNormals();
        latheMesh.material = meshMaterial;

        let kingGroup = new THREE.Group();
        kingGroup.add(cross);
        kingGroup.add(latheMesh);
        return kingGroup;
    }

    function createBox(color, width, height, depth) {
        const boxGeometry = new THREE.BoxGeometry(width, height, depth);
        const boxMaterial = new THREE.MeshLambertMaterial({color: color});

        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.castShadow = true;
        box.receiveShadow = true;
        return box;
    }

    function moveChessPieceWithHeight(chessPiece, positionString, y) {
        moveChessPiece(chessPiece, positionString)
        chessPiece.position.y = y;
    }

    function createPlaneSquare(color) {
        const boxGeometry = new THREE.BoxGeometry(19, 19, 19);
        const boxMaterial = new THREE.MeshLambertMaterial({color: color});
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.receiveShadow = true;
        return box;
    }

    function createPlane() {
        const group = new THREE.Group();

        let colors = [0xFFFFFF, 0x000000]
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = createPlaneSquare(colors[(i + j + 1) % 2])
                console.log(colors[(i + j) % 2 === 0])
                let x = -67
                let z = 64
                x = x + (19 * i);
                z = z - (19 * j);
                square.position.set(x, -9, z);
                group.add(square);
            }
        }
        return group;
    }

    function populateBoard() {
        const group = new THREE.Group();

        const pawnColumns = 'ABCDEFGH'
        let pawnRows = [2, 7];
        let colors = [0xFFFFFF, 0x4a4a4a]

        for (let i = 0; i < pawnRows.length; i++) {
            for (let j = 0; j < pawnColumns.length; j++) {
                let position = pawnColumns.charAt(j) + pawnRows[i];
                const newFigure1 = createBox(colors[i], 9, 3, 9);
                moveChessPieceWithHeight(newFigure1, position, 1.5);
                group.add(newFigure1)
                const newFigure2 = createBox(colors[i], 7, 5, 7);
                moveChessPieceWithHeight(newFigure2, position, 2.5);
                group.add(newFigure2)
                const newFigure3 = createBox(colors[i], 4, 9, 4);
                moveChessPieceWithHeight(newFigure3, position, 4.5);
                group.add(newFigure3)
                const newFigure4 = createBox(colors[i], 2, 12, 2);
                moveChessPieceWithHeight(newFigure4, position, 6);
                group.add(newFigure4)
                const newFigure5 = createBox(colors[i], 4, 3, 4);
                moveChessPieceWithHeight(newFigure5, position, 1.5 + 12);
                group.add(newFigure5)
            }
        }

        const kingColumns = ["E1", "E8"]

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 1; j++) {
                let position = kingColumns[(i + j) % 2];
                const newFigure = createKing(colors[i]);
                moveChessPiece(newFigure, position);
                group.add(newFigure)
            }
        }

        const queenColumns = ["D1", "D8"]

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 1; j++) {
                let position = queenColumns[(i + j) % 2];
                const newFigure1 = createBox(colors[i], 9, 3, 9);
                moveChessPieceWithHeight(newFigure1, position, newFigure1.geometry.parameters.height / 2);
                group.add(newFigure1)
                const newFigure2 = createBox(colors[i], 8, 5, 8);
                moveChessPieceWithHeight(newFigure2, position, newFigure2.geometry.parameters.height / 2);
                group.add(newFigure2)
                const newFigure3 = createBox(colors[i], 9, 3, 9);
                moveChessPieceWithHeight(newFigure3, position, newFigure3.geometry.parameters.height / 2 + 5);
                group.add(newFigure3)
                const newFigure4 = createBox(colors[i], 8, 8, 8);
                moveChessPieceWithHeight(newFigure4, position, newFigure4.geometry.parameters.height / 2);
                group.add(newFigure4)
                const newFigure5 = createBox(colors[i], 5, 18, 5);
                moveChessPieceWithHeight(newFigure5, position, newFigure5.geometry.parameters.height / 2);
                group.add(newFigure5)
                const newFigure6 = createBox(colors[i], 4, 23, 4);
                moveChessPieceWithHeight(newFigure6, position, newFigure6.geometry.parameters.height / 2);
                group.add(newFigure6)
                const newFigure7 = createBox(colors[i], 7, 5, 7);
                moveChessPieceWithHeight(newFigure7, position, newFigure7.geometry.parameters.height / 2 + 23);
                group.add(newFigure7)
                const newFigure8 = createBox(colors[i], 6, 3, 6);
                moveChessPieceWithHeight(newFigure8, position, newFigure8.geometry.parameters.height / 2 + 28);
                group.add(newFigure8)
            }
        }

        const rookColumns = 'CF'
        const rookRows = [1, 8]

        for (let i = 0; i < rookRows.length; i++) {
            for (let j = 0; j < rookColumns.length; j++) {
                let position = rookColumns.charAt(j) + rookRows[i];
                const newFigure1 = createBox(colors[i], 9, 3, 9);
                moveChessPieceWithHeight(newFigure1, position, newFigure1.geometry.parameters.height / 2);
                group.add(newFigure1)
                const newFigure2 = createBox(colors[i], 7, 7, 7);
                moveChessPieceWithHeight(newFigure2, position, newFigure2.geometry.parameters.height / 2);
                group.add(newFigure2)
                const newFigure3 = createBox(colors[i], 4, 13, 4);
                moveChessPieceWithHeight(newFigure3, position, newFigure3.geometry.parameters.height / 2);
                group.add(newFigure3)
                const newFigure4 = createBox(colors[i], 3, 19, 3);
                moveChessPieceWithHeight(newFigure4, position, newFigure4.geometry.parameters.height / 2);
                group.add(newFigure4)
                const newFigure5 = createBox(colors[i], 4, 4, 4);
                moveChessPieceWithHeight(newFigure5, position, newFigure5.geometry.parameters.height / 2 + 19);
                group.add(newFigure5)
                const newFigure6 = createBox(colors[i], 2, 25, 2);
                moveChessPieceWithHeight(newFigure6, position, newFigure6.geometry.parameters.height / 2);
                group.add(newFigure6)
            }
        }

        const horseColumns = 'BG'
        const horseRows = [1, 8]

        for (let i = 0; i < horseRows.length; i++) {
            for (let j = 0; j < horseColumns.length; j++) {
                let position = horseColumns.charAt(j) + horseRows[i];
                const newFigure1 = createBox(colors[i], 9, 3, 9);
                moveChessPieceWithHeight(newFigure1, position, newFigure1.geometry.parameters.height / 2);
                group.add(newFigure1)
                const newFigure3 = createBox(colors[i], 9, 3, 9);
                moveChessPieceWithHeight(newFigure3, position, newFigure3.geometry.parameters.height / 2 + 6);
                group.add(newFigure3)
                const newFigure4 = createBox(colors[i], 8, 12, 8);
                moveChessPieceWithHeight(newFigure4, position, newFigure4.geometry.parameters.height / 2);
                group.add(newFigure4)
                const newFigure5 = createBox(colors[i], 7, 23, 7);
                moveChessPieceWithHeight(newFigure5, position, newFigure5.geometry.parameters.height / 2);
                group.add(newFigure5)
                const newFigure6 = createBox(colors[i], 7, 6, 14);
                moveChessPieceWithHeight(newFigure6, position, 23 - 5);
                newFigure6.position.z -= (2 * (-1)**(i % 2));
                group.add(newFigure6)
            }
        }

        const towerColumns = 'AH'
        const towerRows = [1, 8]

        for (let i = 0; i < towerRows.length; i++) {
            for (let j = 0; j < towerColumns.length; j++) {
                let position = towerColumns.charAt(j) + towerRows[i];
                const newFigure1 = createBox(colors[i], 9, 3, 9);
                moveChessPieceWithHeight(newFigure1, position, newFigure1.geometry.parameters.height / 2);
                group.add(newFigure1)
                const newFigure3 = createBox(colors[i], 9, 3, 9);
                moveChessPieceWithHeight(newFigure3, position, newFigure3.geometry.parameters.height / 2 + 6);
                group.add(newFigure3)
                const newFigure4 = createBox(colors[i], 8, 12, 8);
                moveChessPieceWithHeight(newFigure4, position, newFigure4.geometry.parameters.height / 2);
                group.add(newFigure4)
                const newFigure5 = createBox(colors[i], 7, 17, 7);
                moveChessPieceWithHeight(newFigure5, position, newFigure5.geometry.parameters.height / 2);
                group.add(newFigure5)
                const newFigure6 = createBox(colors[i], 8, 3, 8);
                moveChessPieceWithHeight(newFigure6, position, newFigure6.geometry.parameters.height / 2 + 17);
                group.add(newFigure6)
            }
        }
        return group;
    }

    function moveChessPiece(chessPiece, positionString) {
        let x = -67
        let z = 64
        const gap = 19;

        let xMultiplier = 1;
        let zMultiplier = 1;

        positionString = positionString.toUpperCase();
        switch (positionString.charAt(0)) {
            case 'B':
                xMultiplier = 2;
                break;
            case 'C':
                xMultiplier = 3;
                break;
            case 'D':
                xMultiplier = 4;
                break;
            case 'E':
                xMultiplier = 5;
                break;
            case 'F':
                xMultiplier = 6;
                break;
            case 'G':
                xMultiplier = 7;
                break;
            case 'H':
                xMultiplier = 8;
                break;
        }

        switch (positionString.charAt(1)) {
            case '2':
                zMultiplier = 2;
                break;
            case '3':
                zMultiplier = 3;
                break;
            case '4':
                zMultiplier = 4;
                break;
            case '5':
                zMultiplier = 5;
                break;
            case '6':
                zMultiplier = 6;
                break;
            case '7':
                zMultiplier = 7;
                break;
            case '8':
                zMultiplier = 8;
                break;
        }

        x = x + (xMultiplier - 1) * gap;
        z = z - (zMultiplier - 1) * gap;

        chessPiece.position.set(x, 18, z);
    }

    function initStats() {
        const newStats = new Stats();

        newStats.setMode(0);

        newStats.domElement.style.position = "absolute";
        newStats.domElement.style.left = "0px";
        newStats.domElement.style.top = "0px";

        $("#Stats-output").append(newStats.domElement);

        return newStats;
    }
});
