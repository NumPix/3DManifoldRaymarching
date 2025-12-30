import { vec4 } from 'gl-matrix'

/**
 * 
 * @param {vec4} point 
 * @returns {number}
 */
export function map(point) {
    return 0.0 // dummy function for now
}

/**
 * 
 * @param {vec4} point 
 * @returns {vec4}
 */
export function gradient(point) {
    const eps = 1e-6;
    const inv2eps = 1 / (2 * eps);

    const p = vec4.clone(point);

    const fx1 = map(vec4.set(p, point[0] + eps, point[1], point[2], point[3]));
    const fx2 = map(vec4.set(p, point[0] - eps, point[1], point[2], point[3]));
    const gx = (fx1 - fx2) * inv2eps;

    const fy1 = map(vec4.set(p, point[0], point[1] + eps, point[2], point[3]));
    const fy2 = map(vec4.set(p, point[0], point[1] - eps, point[2], point[3]));
    const gy = (fy1 - fy2) * inv2eps;

    const fz1 = map(vec4.set(p, point[0], point[1], point[2] + eps, point[3]));
    const fz2 = map(vec4.set(p, point[0], point[1], point[2] - eps, point[3]));
    const gz = (fz1 - fz2) * inv2eps;

    const fw1 = map(vec4.set(p, point[0], point[1], point[2], point[3] + eps));
    const fw2 = map(vec4.set(p, point[0], point[1], point[2], point[3] - eps));
    const gw = (fw1 - fw2) * inv2eps;

    const grad = vec4.fromValues(gx, gy, gz, gw);
    vec4.normalize(grad, grad);

    return grad;
}

/**
 * 
 * @param {vec4} point 
 * @param {number} maxIter 
 * @returns {vec4}
 */
export function project(point, maxIter = 10) {
    const eps = 1e-6;

    let q = vec4.clone(point);
    let n = vec4.create();
    let i = 0;

    while (i < maxIter) {
        let d = map(q);
        if (Math.abs(d) < eps) break;

        n = gradient(q);
        vec4.scale(n, n, d);
        vec4.subtract(q, q, n);

        i++;
    }

    return q;
}