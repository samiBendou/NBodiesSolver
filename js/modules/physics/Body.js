function Body(name, type, color, radius, mass, uInit) {
    //PROPERTIES OF BODY
    this.name = name || 'Untitled';

    this.type = type || 'Telluric';

    this.color = color || '#FFFFFF';

    this.radius = radius || 0.0;

    this.mass = mass || 0.0;

    this.u = uInit || [0, 0, 0, 0, 0, 0];

    this.mainBodyIndex = -1;

    //SIMULATION METHODS
    this.gAcceleration = function (bodies) {
        return gField(this, bodies);
    };

    this.rungeKuttaStep = function (k) {
        let phi = new Array(stateParams);
        for (let p = 0; p < stateParams; p++)
            phi[p] = 1.0 / 6.0 * (k[0][p] + 2 * k[1][p] + 2 * k[2][p] + k[3][p]);

        this.updateState(phi);
    };

    this.eulerStep = function (g) {
        let phi = [this.u[3], this.u[4], this.u[5], g[0], g[1], g[2]];
        this.updateState(phi);
    };

    this.updateState = function (phi) {
        for (let k = 0; k < stateParams; k++)
            this.u[k] += phi[k] * dt;
    };


    //CINEMATIC METHODS
    this.dTo = function(u) {
        //Return distance to 3D point u
        let d = this.getCartesianArround(u);
        let r2 = 0.0;
        for(let p = 0; p < stateParams / 2; p++)
            r2 += d[p] * d[p];
        return Math.sqrt(r2);
    };

    this.vTo = function(u) {
        //Return relative speed to 3D point u
        let dv = this.getCartesianArround(u);
        let v2 = 0.0;
        for(let p = stateParams / 2; p < stateParams; p++)
            v2 += dv[p] * dv[p];
        return Math.sqrt(v2)
    };

    this.getCartesianArround = function(u) {
        let d = Array(stateParams);
        for(let p = 0; p < stateParams; p++)
            d[p] = this.u[p] - u[p];
        return d;
    };

    this.getSphericalArround = function(u) {
        let d = this.getCartesianArround(u);
        let rXY = Math.sqrt(d[0] * d[0] + d[1] * d[1]);
        let vXY = Math.sqrt(d[3] * d[3] + d[4] * d[4]);

        let r = this.dTo(u);
        let theta = Math.atan2(d[1], d[0]);
        let phi = Math.atan2(rXY, d[2]);

        let vR = this.vTo(u);
        let vTheta = Math.atan2(d[4], d[3]);
        let vPhi = Math.atan2(vXY, d[5]);
        return [r, theta, phi, vR, vTheta, vPhi];
    };

    this.setCartesianArround = function(x, y, z, u) {
        this.u[0] = x + u[0];
        this.u[1] = z + u[1];
        this.u[2] = z + u[2];
    };

    this.setSphericArround = function(r, theta, phi, u) {
        this.u[0] = r * Math.sin(phi) * Math.cos(theta) + u[0];
        this.u[1] = r * Math.sin(phi) * Math.sin(theta) + u[1];
        this.u[2] = r * Math.cos(phi) + u[2];
    };

    this.setCartesianSpdArround = function(vX, vY, vZ, u) {
        this.u[3] = vX + u[3];
        this.u[4] = vY + u[4];
        this.u[5] = vZ + u[5];
    };

    this.setSphericSpdArround = function(vR, vTheta, vPhi, u) {
        this.u[3] = vR * Math.sin(vPhi) * Math.cos(vTheta) + u[3];
        this.u[4] = vR * Math.sin(vPhi) * Math.sin(vTheta) + u[4];
        this.u[5] = vR * Math.cos(vPhi) + u[5];
    };

    this.setStateFromOrbit = function(perihelion, perihelionSpd, perihelionArg, inclination, ascNodeArg, body) {
        let r = perihelion;
        let theta = perihelionArg;
        let phi = Math.PI / 2 - inclination * (perihelionArg - ascNodeArg) / (Math.PI / 2.0);

        let vR = perihelionSpd;
        let vTheta = perihelionArg + Math.PI / 2.0;
        let vPhi   =  Math.PI / 2  - inclination * (1 - (perihelionArg - ascNodeArg) / (Math.PI / 2.0));
        let u = (body != undefined) ? body.u : [0, 0, 0, 0, 0, 0];
        this.setSphericArround(r, theta, phi, u);
        this.setSphericSpdArround(vR , vTheta, vPhi, u);
    };

    //SERIALIZATION INTERFACE JSON
    this.readFromJSON = function(JSONBody) {
        this.name = JSONBody.Name;
        this.type = JSONBody.BodyType;
        this.color = JSONBody.BodyColor;
        this.radius = JSONBody.BodyRadius;
        this.mass = JSONBody.Mass;

        let perihelion = JSONBody.Perihelion;
        let perihelionSpd = JSONBody.PerihelionSpeed;
        let perihelionArg = Math.PI / 180.0 * JSONBody.PerihelionArg;
        let inclination = Math.PI / 180.0 * JSONBody.Inclination;
        let ascNodeArg = Math.PI / 180.0 * JSONBody.AscNodeArg;

        this.setStateFromOrbit(perihelion, perihelionSpd, perihelionArg, inclination, ascNodeArg);
    };
}


