function textDeltaTime(sec) {
    return sec.toFixed(4) + ' s';
}

function updateUIDate(time) {
    let dateElement = document.getElementById("DateSimulation");
    dateElement.innerText = textDeltaTime(time);
}

function updateUITimeSimulation(runge, step, dt) {
    let methodElement   = document.getElementById("Method");
    let stepElement     = document.getElementById("NumberOfSteps");
    let dtElement       = document.getElementById("PhysicsStep");
    let timeStepElement = document.getElementById("Step");

    methodElement.innerText = (runge == true) ? "Runge-Kutta 4" : "Euler";
    stepElement.innerText = step.toFixed(2);
    dtElement.innerText = textDeltaTime(dt);
    timeStepElement.innerText = textDeltaTime(dt * step);
}

function updateUIBodyInfo(currentBodyIndex, mainBodyIndex, closestBodyIndex, system) {
    let nameElement             = document.getElementById("BodyName");
    let massElement             = document.getElementById("BodyMass");
    let radiusElement           = document.getElementById("BodyRadius");
    let spdElement              = document.getElementById("BodySpd");
    let argElement              = document.getElementById("BodyArg");
    let mainBodyNameElement     = document.getElementById("MainBodyName");
    let dToMainBodyElement      = document.getElementById("DistanceToMainBody");
    let closestBodyNameElement  = document.getElementById("ClosestBodyName");
    let dToClosestBodyElement   = document.getElementById("DistanceToClosestBody");

    const body          = system.bodies[currentBodyIndex];
    const mainBody      = system.bodies[mainBodyIndex];
    const closestBody   = system.bodies[closestBodyIndex];

    const vToMainBody   = body.vTo(mainBody.u);
    const dToClosestBody = body.dTo(closestBody.u);
    const [r, theta, phi, vR, vTheta, vPhi] = body.getSphericalArround(mainBody.u);

    nameElement.innerText = body.name;
    massElement.innerText = body.mass.toExponential(2);
    radiusElement.innerText = body.radius.toExponential(2);
    spdElement.innerText = vToMainBody.toExponential(2);
    argElement.innerText = theta.toFixed(2);
    mainBodyNameElement.innerText = mainBody.name;
    dToMainBodyElement.innerText = r.toExponential(2);
    closestBodyNameElement.innerText = closestBody.name;
    dToClosestBodyElement.innerText = dToClosestBody.toExponential(2);
}

function updateUISystemInfo(system) {
    let nameElement             = document.getElementById("BodyName");
    let massElement             = document.getElementById("BodyMass");
    let mainBodyNameElement     = document.getElementById("MainBodyName");

    nameElement.innerText = "Stellar System";
    massElement.innerText = system.getTotalMass().toExponential(2);
    mainBodyNameElement.innerText = system.getMainBody().body.name;

}

function updateUICurrentInfo(currentBodyIndex, mainBodyIndex, closestBodyIndex, system) {
    if(currentBodyIndex > -1) {
        updateUIBodyInfo(currentBodyIndex, mainBodyIndex, closestBodyIndex, system);
    } else {
        updateUISystemInfo(system);
    }
}