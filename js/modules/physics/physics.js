//Spacetime conversions
let Guniv = 6.67408e-11;
let stateParams = 6;

function gField(body, bodies) {
    let n = bodies.length;
    let gx = 0,
        gy = 0,
        gz = 0;
    let dx, dy, dz, r;

    for (let j = 0; j < n; j++) {
        dx = (body.u[0] - bodies[j].u[0]);
        dy = (body.u[1] - bodies[j].u[1]);
        dz = (body.u[2] - bodies[j].u[2]);
        r = Math.sqrt((dx * dx + dy * dy + dz * dz));
        let g = -Guniv * bodies[j].mass / (Math.pow(r, 3));
        if (r > 0) {
            gx += g * dx;
            gy += g * dy;
            gz += g * dz;
        }
    }
    return [gx, gy, gz];
}