"use strict"
import * as _ from "lodash"
import {Clothe} from "./clothe"

function createGround() {
  var ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(200, 200, 10, 10), new THREE.MeshLambertMaterial({color:0x999999}))
  ground.receiveShadow = true
  ground.position.set(0, 0, 0)
  ground.rotation.x = -Math.PI / 2
  return ground
}

function createDirectionalLight() {
  var light = new THREE.DirectionalLight( 0xffffff, 1 );
  light.position.set(1, 1, 1).normalize()
  light.shadowCameraVisible = true
  light.castShadow = true
  light.shadowCameraRight     =  5;
  light.shadowCameraLeft     = -5;
  light.shadowCameraTop      =  5;
  light.shadowCameraBottom   = -5;
  return light
}

function createAmbientLight() {
  var light = new THREE.AmbientLight( 0x424242, 0.5 );
  return light
}

export class Scene {
  constructor() {
    const SIZE = 20
    this.height = 720
    this.width = 1280
    this.accuracy = 16
    this.last = null
    this.wind = new THREE.Vector3(0, 0, -1)
    this.windForce = 0
    this.items = []
    this.leftOverTime = 0
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize(this.width, this.height)
    document.body.appendChild(this.renderer.domElement)

    this.scene = new THREE.Scene()

    var target = new THREE.Vector3(SIZE/2, SIZE/2, SIZE/2)
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
    this.camera.position.set(20, 20, 20)
    this.camera.lookAt(target)

    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement)
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.target = target.clone()

    this.controls.noZoom = false;
    this.controls.noPan = false;

    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;

    // this.controls.keys = [ 65, 83, 68 ];

    // his.controls.addEventListener( 'change', this.render.bind(this) );

    this.scene.add(new THREE.AxisHelper(10))
    this.scene.add(createDirectionalLight())
    this.scene.add(createAmbientLight())
    this.scene.add(createGround())

    this.addItem(new Clothe(SIZE))
  }

  addItem(item) {
    this.items.push(item)
    this.scene.add(item.mesh)
  }

  render(current) {
    requestAnimationFrame(this.render.bind(this))
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    if (this.last !== null) {
      let elapsed = current - this.last + this.leftOverTime
      let timesteps = Math.floor(elapsed / this.accuracy)
      let currentWind = this.wind.clone().multiplyScalar(this.windForce)
      this.leftOverTime = elapsed - timesteps * this.accuracy
      _.times(timesteps, () => {
        this.loop(
          this.accuracy / 1000,
          currentWind
        )
      })
    }
    var up = (Math.random() > 0.5) ? 1 : -1
    this.windForce = Math.min(Math.abs(this.windForce + (Math.random() / 10000) * up), 0.001)
    this.last = current
  }

  loop(t, wind) {
    _.forEach(this.items, (i) => {
      i.doLoop(t, wind)
    })
  }

  start() {
    requestAnimationFrame(this.render.bind(this))
  }
}
