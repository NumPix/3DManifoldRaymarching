import { vec3, vec4, quat } from 'gl-matrix'
import { project, gradient } from './SDF';

export class Camera {
    /**
     * 
     * @param {vec4} position 
     * @param {number} sens
     * @param {number} fov 
     */
    constructor(position, sens, fov) {
        this.position = project(position);

        this.pitch = 0;
        this.maxPitch = Math.PI / 2;

        this.rotation = quat.create();

        this.localForwardBasis = vec3.fromValues(1, 0, 0);
        this.localUpBasis = vec3.fromValues(0, 1, 0);
        this.localRightBasis = vec3.fromValues(0, 0, 1);

        this.forwardBasis = vec4.create();
        this.upBasis = vec4.create();
        this.rightBasis = vec4.create();

        this.localForward = vec3.create();
        this.localUp = vec3.create();
        this.localRight= vec3.create();

        this.forward = vec4.create();
        this.up = vec4.create();
        this.right = vec4.create();

        this.sens = sens;
        this.fov = fov;

        this.initTangentSpace();
    }

    initTangentSpace() {
        const n = gradient(this.position);

        let v1 = vec4.fromValues(1, 0, 0, 0);

        if (Math.abs(vec4.dot(n, v1)) > 0.9) {
            v1 = vec4.fromValues(0, 1, 0, 0);
        }

        let v2 = vec4.fromValues(0, 0, 1, 0);
        let v3 = vec4.fromValues(0, 0, 0, 1);

        vec4.scaleAndAdd(v1, v1, n, -vec4.dot(v1, n));
        vec4.normalize(this.forwardBasis, v1);

        vec4.scaleAndAdd(v2, v2, n, -vec4.dot(v2, n));
        vec4.scaleAndAdd(v2, v2, this.forwardBasis, -vec4.dot(v2, this.forwardBasis));
        vec4.normalize(this.upBasis, v2);

        vec4.scaleAndAdd(v3, v3, n, -vec4.dot(v3, n));
        vec4.scaleAndAdd(v3, v3, this.forwardBasis, -vec4.dot(v3, this.forwardBasis));
        vec4.scaleAndAdd(v3, v3, this.upBasis, -vec4.dot(v3, this.upBasis));
        vec4.normalize(this.rightBasis, v3);
    }

    /**
     * 
     * @param {MouseEvent} event
     */
    handleMouseEvent(event) {
        const dx = event.movementX * this.sens;
        const dy = event.movementY * this.sens;

        const yaw = -dx;
        const pitchDelta = -dy;

        const newPitch = this.pitch + pitchDelta;

        const clampedPitch = Math.max(
            -this.maxPitch,
            Math.min(
                this.maxPitch,
                newPitch
            )
        );

        const appliedPitch = clampedPitch - this.pitch;
        this.pitch = clampedPitch;

        this.rotate(vec3.fromValues(0, yaw, 0));
        this.rotate(vec3.fromValues(0, 0, appliedPitch));
    }
    
    /**
     * 
     * @param {vec3} eulerAngles 
     */
    rotate(eulerAngles) {
        const delta = quat.create();
        quat.fromEuler(delta, eulerAngles.x * 180 / Math.Pi, eulerAngles.y * 180 / Math.Pi, eulerAngles.z * 180 / Math.Pi);

        quat.multiply(this.rotation, this.rotation, delta);

        this.updateLocalBases();
    }

    updateLocalBases() {
        this.localForward = vec3.create();
        this.localUp = vec3.create();
        this.localRight = vec3.create();

        vec3.transformQuat(this.localForward, this.localForwardBasis, this.rotation);
        vec3.transformQuat(this.localUp, this.localUpBasis, this.rotation);
        vec3.transformQuat(this.localRight, this.localRightBasis, this.rotation);

        vec4.scaleAndAdd(this.forward, vec4.create(), this.forwardBasis, this.localForward.x);
        vec4.scaleAndAdd(this.forward, this.forward, this.upBasis, this.localForward.y);
        vec4.scaleAndAdd(this.forward, this.forward, this.rightBasis, this.localForward.z);

        vec4.scaleAndAdd(this.up, vec4.create(), this.forwardBasis, this.localUp.x);
        vec4.scaleAndAdd(this.up, this.up, this.upBasis, this.localUp.y);
        vec4.scaleAndAdd(this.up, this.up, this.rightBasis, this.localUp.z);

        vec4.scaleAndAdd(this.right, vec4.create(), this.forwardBasis, this.localRight.x);
        vec4.scaleAndAdd(this.right, this.right, this.upBasis, this.localRight.y);
        vec4.scaleAndAdd(this.right, this.right, this.rightBasis, this.localRight.z);
    }

    /**
     * 
     * @param {number} d 
     */
    moveForward(d) {
        vec4.scaleAndAdd(this.position, this.position, this.forward, d);
        this.position = vec4.clone(project(this.position));
    }

    /**
     * 
     * @param {number} d 
     */
    moveBackward(d) {
        this.moveForward(-d);
    }

    /**
     * 
     * @param {number} d 
     */
    moveUp(d) {
        vec4.scaleAndAdd(this.position, this.position, this.up, d);
        this.position = vec4.clone(project(this.position));
    }

    /**
     * 
     * @param {number} d 
     */
    moveDown(d) {
        this.moveUp(-d);
    }

    /**
     * 
     * @param {number} d 
     */
    moveRight(d) {
        vec4.scaleAndAdd(this.position, this.position, this.right, d);
        this.position = vec4.clone(project(this.position));
    }

    /**
     * 
     * @param {number} d 
     */
    moveLeft(d) {
        this.moveRight(-d);
    }
}