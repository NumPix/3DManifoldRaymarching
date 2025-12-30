import { vec3, vec4 } from "gl-matrix"
import { Camera } from "./Camera"

export class Renderer {
    constructor(canvas_id) {
        this.canvas = getCanvas(canvas_id);

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.canvas.requestPointerLock = 
            this.canvas.requestPointerLock || 
            this.canvas.mozRequestPointerLock || 
            this.canvas.webkitRequestPointerLock;

        this.canvas.onclick = () => {
            this.canvas.requestPointerLock();
        }

        this.initWebGL();

        this.initEventHandling();

        this.camera = new Camera(vec4.fromValues(0, 0, 0, 10), 0.002, 45);
    }

    initWebGL() {
        this.gl = this.canvas.getContext("webgl2");

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        const vertices = new Float32Array([
            -1, -1,
            1, -1,
            1, 1,
            -1, 1
        ]);

        const indices = new Uint16Array([
            0, 1, 2,
            2, 3, 0
        ]);
        
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);

        this.vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindVertexArray(null);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    initEventHandling() {
        window.addEventListener("mousemove", (e) => {
            if (document.pointerLockElement !== this.canvas) {
               return;
            }

            this.camera.handleMouseEvent(e);
        })

        window.addEventListener("resize", () =>  {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        });
    }

    draw(program) {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(program);
        this.gl.bindVertexArray(this.vao);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindVertexArray(null);
    }
}