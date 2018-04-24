function System(bodies) {

    this.bodies = bodies || [];

    this.gAcceleration = function (i) {
        return this.bodies[i].gAcceleration(this.bodies);
    };

    this.eulerStep = function () {
        let numBody = this.bodies.length;
        let g;
        for (let i = 0; i < numBody; i++) {
            g = this.gAcceleration(i);
            this.bodies[i].eulerStep(g);
        }
    };

    this.rungeKuttaStep = function () {
        let numBody = this.bodies.length;
        let k = new Array(numBody);
        let g;
        let coefRunge = [0.5, 0.5, 1];
        let bodies = clone(this.bodies);
        let tempBody;
        for (let i = 0; i < numBody; i++) {
            tempBody = clone(this.bodies[i]);
            k[i] = new Array(stateParams);

            g = gField(bodies[i], bodies);
            k[i][0] = [bodies[i].u[3], bodies[i].u[4], bodies[i].u[5], g[0], g[1], g[2]];
            for (let q = 1; q < 4; q++) {
                for (let p = 0; p < stateParams; p++) {
                    bodies[i].u[p] = tempBody.u[p] + coefRunge[q - 1] * k[i][q - 1][p] * dt;
                }
                g = gField(bodies[i], bodies);
                k[i][q] = [bodies[i].u[3], bodies[i].u[4], bodies[i].u[5], g[0], g[1], g[2]];
            }
        }

        for (let i = 0; i < numBody; i++)
            this.bodies[i].rungeKuttaStep(k[i]);

    };

    this.getMainBody = function () {
        let numBody = this.bodies.length;
        let mainBodyIndex = -1;
        let mainBodyMass = 0.0;
        for (let i = 0; i < numBody; i++) {
            if (this.bodies[i].mass > mainBodyMass) {
                mainBodyMass = this.bodies[i].mass;
                mainBodyIndex = i;
            }
        }
        return {index : mainBodyIndex, body : (mainBodyIndex > -1) ? this.bodies[mainBodyIndex] : undefined};
    };

    this.getClosestTo = function (body) {
        let d2;
        let min = Number.POSITIVE_INFINITY;
        let closestIndex = -1;
        let numBody = this.bodies.length;
        for (let i = 0; i < numBody; i++) {
            d2 = body.dTo(this.bodies[i].u);
            if (d2 < min && d2 > Number.EPSILON) {
                min = d2;
                closestIndex = i;
            }
        }
        return {index : closestIndex, body : (closestIndex > -1) ? this.bodies[closestIndex] : undefined};
    };

    this.getBarycenter = function () {
        let numBody = this.bodies.length;
        let bar = [0, 0, 0, 0, 0, 0];
        let mass = 0;
        for (let i = 0; i < numBody; i++)
            mass += this.bodies[i].mass / 1e+26;

        for (let i = 0; i < numBody; i++) {
            for (let p = 0; p < stateParams; p++) {
                bar[p] += this.bodies[i].mass * this.bodies[i].u[p] / 1e+26 / mass;
            }
        }
        return bar;
    };

    this.getTotalMass = function() {
        let mass = 0.0;
        let numBody = this.bodies.length;
        for (let i = 0; i < numBody; i++) {
            mass += this.bodies[i].mass / 1e+26;
        }
        return mass * 1e+26;
    };

    this.center = function() {
        let barycenter = this.getBarycenter();
        for(let i = 0; i < this.bodies.length; i++) {
            for(let p = 0; p < stateParams; p++) {
                this.bodies[i].u[p] -= barycenter[p];
            }
        }
    }
}
