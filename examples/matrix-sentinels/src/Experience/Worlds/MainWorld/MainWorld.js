import * as THREE from 'three'
import Experience from '@experience/Experience.js'
import DebugHelpers from "../Objects/DebugHelpers.js";
import Time from "@experience/Utils/Time.js";
import EventEmitter from '@experience/Utils/EventEmitter.js';

import Camera from './Camera.js'
import Input from "@experience/Utils/Input.js";
import Environment from "./Environment.js";

import ParticlesTrails from "@experience/Worlds/MainWorld/ParticlesTrails.js";

export default class MainWorld extends EventEmitter{
    constructor() {
        super();

        this.experience = Experience.getInstance()
        this.time = Time.getInstance()
        this.renderer = this.experience.renderer.instance
        this.state = this.experience.state
        this.scene = new THREE.Scene()
        this.camera = new Camera( { scene: this.scene } )
        this.input = new Input( { camera: this.camera.instance } )
        this.resources = this.experience.resources
        this.html = this.experience.html
        this.sound = this.experience.sound
        this.debug = this.experience.debug

        this.enabled = true


        this._setDebug()

        this.particlesTrails = new ParticlesTrails( { world: this } )

        this.environment = new Environment( { world: this } )
        //this.debugHelpers = new DebugHelpers( { world: this } )

        this.scene.add( this.camera.instance )
    }

    animationPipeline() {
        this.particlesTrails?.animationPipeline()
    }

    postInit() {
        this.particlesTrails?.postInit()
    }

    resize() {
        this.particlesTrails?.resize()

        this.camera?.resize()
    }

    update( deltaTime ) {
        if ( !this.enabled )
            return

        this.particlesTrails?.update( deltaTime )

        this.camera?.update()
    }

    postUpdate( deltaTime ) {

    }

    _setDebug() {
        if ( !this.debug.active ) return

        this.debugFolder = this.debug.panel.addFolder( {
            title: 'Main World', expanded: true
        } )
    }
}
