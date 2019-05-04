//SIMULATION letIABLES

let dt;             //Time interval between each step
let time;           //Global time of simulation
let runge;          //Boolean that is set to true when user want to use RungeKutta resolution
let steps;          //Number of simulated step during simulation
let traj;
let trajBarycenter;
let trajCurrentFrame;

let barycenter;

let stellarSystem;  //Current stellar system

let currentFrame;   //Frame from which user sees the stellar system mouvement.
                    // By default it's the coordinates of the center of gravity of system
let trajIndex;
let trajLength;

//3D RENDERING VARIABLES
let camera, scene, renderer;

let spheresGeometry;
let spheresMaterial;
let spheresMesh;

let focusPointGeometry;
let focusPointMaterial;
let focusPoint;

let trajGeometry;
let trajMaterial;
let trajLine;

let controls;
let container;

let widthSegSphere  = 32;
let heightSegSphere = 32;
let near            = 0.00000000000000001;
let far             = 1000000000000000000;
let fieldOfView     = 50.0;
let maxDist         = 228.9e+9;
let maxSpd          = 24.1e+3;
let maxRadius       = 1e+10;

//GUI SIZING
let ratio;
let radiusFactor;
let XSizeFactor;
let YSizeFactor;
let ZSizeFactor;
let VXSizeFactor;
let VYSizeFactor;
let VZSizeFactor;

//APPLICATION STATE VARIABLES
let pause;
let relTraj;
let currentBodyIndex;
let mainBodyIndex;
let closestBodyIndex;

//SIMULATION UPDATE FUNCTIONS
function simulateStep() {
    //Simulate a step of simulation according to resolution method choosen by user
    if (runge === true)
        stellarSystem.rungeKuttaStep();
    else
        stellarSystem.eulerStep();
    time += dt;

    barycenter = stellarSystem.getBarycenter();
}

function updatePosition() {
    let numBody = spheresGeometry.length;
    for(let i = 0; i < numBody; i++) {
        if(currentBodyIndex > -1) {
            let [x, y, z] = getSizedXYZ( stellarSystem.bodies[i].u, (relTraj) ? stellarSystem.bodies[currentBodyIndex].u : barycenter);
        }
        else {
            let [x, y, z] = getSizedXYZ( stellarSystem.bodies[i].u, barycenter);
        }
        spheresMesh[i].position.set( x, y, z );
    }
}

function updateCurrentFrame() {
    barycenter = stellarSystem.getBarycenter();
    currentFrame = (currentBodyIndex > -1) ? stellarSystem.bodies[currentBodyIndex].u : barycenter;
}

function updateMainBodyIndex() {
    if(currentBodyIndex > -1) {
        const influenceBodyIndex = stellarSystem.bodies[currentBodyIndex].mainBodyIndex;
        mainBodyIndex = (influenceBodyIndex > -1) ? influenceBodyIndex : stellarSystem.getMainBody().index;
    } else {
        mainBodyIndex = stellarSystem.getMainBody().index;
    }
    updateCurrentFrame();
}

function updateClosestBodyIndex() {
    closestBodyIndex = (currentBodyIndex > -1) ? stellarSystem.getClosestTo(stellarSystem.bodies[currentBodyIndex]).index : -1;
}
function updateTargetBody() {
    let [x, y, z] = getSizedXYZ( currentFrame, [0, 0, 0, 0, 0, 0] );
    camera.position.set( x, y, z + XSizeFactor * maxDist );
    controls.target.set( 0.0, 0.0, 0.0 );
}

function updateTrajectory() {
    //Update traj buffer to show previous 256 positions of all bodies
    let tempDt = dt;

    traj = transpose(traj);
    for (let t = 0; t < Math.floor(steps); t++) {
        simulateStep();
    }
    dt *= steps - Math.floor(steps);
    simulateStep();
    dt = tempDt;

    if (traj.length < trajLength) {
        traj.push(clone(stellarSystem.bodies));
        trajBarycenter.push(clone(barycenter));
        trajCurrentFrame.push(clone(currentFrame));
    } else {
        traj = clone(traj.slice(1));
        traj.push(clone(stellarSystem.bodies));

        trajCurrentFrame = clone(trajCurrentFrame.slice(1));
        trajCurrentFrame.push(clone(currentFrame));

        trajBarycenter = clone(trajBarycenter.slice(1));
        trajBarycenter.push(clone(barycenter));
    }
    traj = transpose(traj);
}

function updateTrajectoryLine() {
    let numBody = stellarSystem.bodies.length;

    if (traj.length > 1) {
        let timeTrajectory = traj[0].length;
        for (let i = 0; i < numBody; i++) {
            for (let t = 0; t < timeTrajectory; t++) {
                if(currentBodyIndex > -1) {
                    var [x, y, z] = getSizedXYZ( traj[i][t].u, (relTraj) ? traj[currentBodyIndex][t].u : barycenter);
                }
                else {
                    var [x, y, z] = getSizedXYZ( traj[i][t].u, barycenter);
                }
                trajGeometry[i].vertices[t + trajLength - timeTrajectory].x = x;
                trajGeometry[i].vertices[t + trajLength - timeTrajectory].y = y;
                trajGeometry[i].vertices[t + trajLength - timeTrajectory].z = z;
                trajGeometry[i].verticesNeedUpdate = true;
                trajGeometry[i].normalsNeedUpdate = true;
                console.log("Coordinate of barycenter");
                console.log(trajBarycenter[t]);
                console.log("Coordinate of Sun");
                console.log(traj[0][t]);
            }
        }
    }
}


function getSizedXYZ(point, frameOff) {
    let x = XSizeFactor * (point[0] - frameOff[0]);
    let y = YSizeFactor * (point[1] - frameOff[1]);
    let z = ZSizeFactor * (point[2] - frameOff[2]);
    return [x, y, z];
}

//INITIALISATION FUNCTIONS
function initSizeFactor(maxDist, maxSpeed, maxRadius) {
    ratio           = window.innerWidth / window.innerHeight;
    XSizeFactor     = window.innerWidth / (2 * maxDist);
    YSizeFactor     = -ratio * window.innerHeight / (2 * maxDist);
    ZSizeFactor     = ratio * window.innerHeight / (2 * maxDist);
    VXSizeFactor    = maxSpeed / (XSizeFactor * maxDist);
    VYSizeFactor    = maxSpeed / (YSizeFactor * maxDist);
    VZSizeFactor    = maxSpeed / (ZSizeFactor * maxDist);
    radiusFactor    = XSizeFactor * maxDist / maxRadius;
}

function initBodies() {
    //BODIES
    let numBody = stellarSystem.bodies.length;
    spheresGeometry = Array(numBody);
    spheresMaterial = Array(numBody);
    spheresMesh     = Array(numBody);

    for(let i = 0; i < numBody; i++) {
        let radius = radiusFactor * stellarSystem.bodies[i].radius;
        spheresGeometry[i]  = new THREE.SphereGeometry( radius, widthSegSphere, heightSegSphere );
        spheresMaterial[i]  = new THREE.MeshBasicMaterial( {color : stellarSystem.bodies[i].color} );
        spheresMesh[i]      = new THREE.Mesh( spheresGeometry[i], spheresMaterial[i] );
        scene.add( spheresMesh[i] );
    }

    //TRAJECTORY
    trajGeometry = Array(numBody);
    trajMaterial = Array(numBody);
    trajLine     = Array(numBody);

    for(let i = 0; i < numBody; i++) {
        trajGeometry[i]  = new THREE.Geometry();
        for(let t = 0; t < trajLength; t++) {
            [x, y, z] = getSizedXYZ(stellarSystem.bodies[i].u, currentFrame);
            trajGeometry[i].vertices.push(new THREE.Vector3(x, y, z));
        }
        trajMaterial[i]  = new THREE.LineDashedMaterial( {
                    color : stellarSystem.bodies[i].color,
                    linewidth: 1,
                    scale: 1,
                    dashSize: 3,
                    gapSize: 1
                } );
        trajLine[i]      = new THREE.Line( trajGeometry[i], trajMaterial[i] );
        scene.add( trajLine[i] );
    }

}

function init() {
    initSizeFactor(maxDist, maxSpd, maxRadius);

    //RENDERER
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //DOM LINKING
    container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );

    //CAMERA
    camera = new THREE.PerspectiveCamera( fieldOfView, window.innerWidth / window.innerHeight, near, far );
    //SCENE
    scene = new THREE.Scene();

    //CONTROLS
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.panSpeed = 0.5;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 10.0;

    //FOCUS POINT

    focusPointGeometry = new THREE.Geometry();
    focusPointMaterial = new THREE.PointsMaterial( {color : 0xffffff, size : 15.0, sizeAttenuation : false} );
    focusPoint = new THREE.Points( focusPointGeometry, focusPointMaterial );
    focusPointGeometry.vertices.push(new THREE.Vector3(0.0, 0.0, 0.0));
    scene.add( focusPoint );

    updateTargetBody();
    initBodies();
}

function initState() {
    dt = 3600;
    time = 0.0;
    steps = 1;
    runge = true;

    mainBodyIndex = -1;
    currentBodyIndex = -1;
    closestBodyIndex = -1;

    traj = [];
    trajBarycenter = [];
    trajCurrentFrame = [];
    trajIndex = 0;
    trajLength = 256;
    stellarSystem = new System();
    readFromJSON('https://samibendou.github.io/NBodiesSolver/GravitySimulator/js/modules/physics/solar_system_data.json');


    pause = true;
    relTraj = false;
}

//ANIMATION FUNCTION
function animate() {
    updateCurrentFrame();
    updateUIDate(time);
    updateUITimeSimulation(runge, steps, dt);
    updateUICurrentInfo(currentBodyIndex, mainBodyIndex, closestBodyIndex, stellarSystem);
    if(!pause) {
        updateTrajectory();
    }
    updateClosestBodyIndex();
    updateTrajectoryLine();
    updatePosition();
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
}

//IO FUNCTIONS
function keyPressed(event) {
    let keyCode = event.keyCode;

    sizingIO(keyCode);
    stateIO(keyCode);
    updateUICurrentInfo(currentBodyIndex, mainBodyIndex, closestBodyIndex, stellarSystem);
}

function sizingIO(keyCode) {
    switch(keyCode) {
        case 119 : // w key
            steps *= 1.1;
            break;
        case 120 : // x key
            steps /= 1.1;
            break;
        case 59 : // ; key
            dt *= 1.1;
            break;
        case 44 : // , key
            dt /= 1.1;
            break;
        default :
            break;
    }
}

function stateIO(keyCode) {
    let numBody = stellarSystem.bodies.length;

    switch(keyCode) {
        case 110 : // n key focuses arround next body on bodies list
            currentBodyIndex += (currentBodyIndex < numBody - 1) ? 1 : 0;
            break;
        case 112 : // p key focuses arround previous body on bodies list
            currentBodyIndex -= (currentBodyIndex > 0) ? 1 : 0;
            break;
        case 99 : // c key focuses arround barycenter of system
            currentBodyIndex = -1;
            break;
        case 114 : //r key pauses simulation
            pause = !pause;
            break;
        case 116 : //t key to toggle trajectory display mode
            relTraj = !relTraj;
            break;
        default :
            break;
    }
    if(keyCode === 110 || keyCode === 112 || keyCode === 99) {
        updateCurrentFrame();
        updateMainBodyIndex();
        updateClosestBodyIndex();
        updateTargetBody();
    }
}

//JSON API FUNCTIONS

function readFromJSON(JSONBodiesPath) {
    let bodies = Array();
    readTextFile(JSONBodiesPath, function (text) {
        let JSONBodies = JSON.parse(text);
        for (let i = 0; i < JSONBodies.length; i++) {
            bodies.push(new Body());
            bodies[i].readFromJSON(JSONBodies[i]);
            if(JSONBodies[i].InfluenceBody !== undefined) {
                for(let k = 0; k < JSONBodies.length; k++) {
                    if(bodies[k].name ===    JSONBodies[i].InfluenceBody) {
                        bodies[i].mainBodyIndex = k;
                        bodies[i].setCartesianArround(bodies[i].u[0], bodies[i].u[1], bodies[i].u[2],  bodies[k].u);
                        bodies[i].setCartesianSpdArround(bodies[i].u[3], bodies[i].u[4], bodies[i].u[5],  bodies[k].u);

                    }
                }
            }
        }
        console.log(JSONBodies);
        stellarSystem.bodies = bodies;
        stellarSystem.center();
        updateCurrentFrame();
        updateMainBodyIndex();
        updateClosestBodyIndex();
        init();
        animate();
    });
}
//EXECUTION OF SCRIPT
initState();
