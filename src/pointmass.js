"use strict"
import {G, Dampen} from "./globals"

const Gravity = new THREE.Vector3(0, -G, 0)

export class PointMass {
  constructor(vertice, movable=true) {
    this.movable = movable
    this.vertice = vertice
    this.last = this.vertice.clone()
    this.acc = new THREE.Vector3(0, 0, 0)
  }

  applyForce() {
    if (this.movable) {
      var vel = this.vertice.clone().sub(this.last).multiplyScalar(Dampen)
      this.setVertice(this.vertice.clone().add(vel).add(this.acc))
    }
    this.acc.set(0, 0, 0)
  }

  addForce(f) {
    this.acc.add(f)
  }

  doPhysics(t) {
    if (this.movable) {
      this.addForce(Gravity.clone().multiplyScalar(0.5 * t * t))
    }
  }

  setVertice(next) {
    this.last = this.vertice.clone()
    this.vertice.copy(next)
  }
}
