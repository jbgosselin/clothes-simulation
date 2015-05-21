"use strict"
import * as _ from "lodash"
import {PointMass} from "./pointmass"
import {Constraint} from "./constraint"
import {Triangle} from "./triangle"
import {G} from "./globals"

export class Clothe {
  constructor(SIZE=10) {
    this.pointsmass = []
    this.constraints = []
    this.triangles = []
    this.accuracy = 2
    this.geom = new THREE.Geometry()

    // Generate vertices
    for (let z = 0; z < SIZE; z++) {
      for (let x = 0; x < SIZE; x++) {
        let v = new THREE.Vector3(x, SIZE, z)
        this.pointsmass.push(new PointMass(v))
        this.geom.vertices.push(v)
      }
    }
    this.pointsmass[0].movable = false
    this.pointsmass[SIZE - 1].movable = false
    //for (let x = 0; x < SIZE; x++) this.pointsmass[x].movable = false

    // Generate faces
    for (let z = 0; z < SIZE - 1; z++) {
      for (let x = 0; x < SIZE - 1; x++) {
        let p = z * SIZE + x
        let a = p, b = p + 1, c = p + SIZE
        this.geom.faces.push(new THREE.Face3(a, b, c))
        this.triangles.push(new Triangle(
          this.pointsmass[a],
          this.pointsmass[b],
          this.pointsmass[c]
        ))
        a = p + 1
        b = p + SIZE
        c = p + SIZE + 1
        this.geom.faces.push(new THREE.Face3(a, b, c))
        this.triangles.push(new Triangle(
          this.pointsmass[a],
          this.pointsmass[b],
          this.pointsmass[c]
        ))
      }
    }

    // Generate Constraints
    const shear = Math.sqrt(2)
    for (let z = 0; z < SIZE; z++) {
      for (let x = 0; x < SIZE; x++) {
        let p = z * SIZE + x
        // Structural Constraints
        if (x < SIZE - 1) this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + 1], 1))
        if (z < SIZE - 1) this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + SIZE], 1))
        // Shear Constraints
        if (z < SIZE - 1 && x < SIZE - 1) {
          this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + 1 + SIZE], shear))
          this.constraints.push(new Constraint(this.pointsmass[p + SIZE], this.pointsmass[p +1], shear))
        }
        // Bending Constraints
        if (x < SIZE - 2) this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + 2], 2))
        if (z < SIZE - 2) this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + SIZE + SIZE], 2))
        if (z < SIZE - 2 && x < SIZE - 2) {
          this.constraints.push(new Constraint(this.pointsmass[p], this.pointsmass[p + 2 + SIZE + SIZE], shear * 2))
          this.constraints.push(new Constraint(this.pointsmass[p + SIZE + SIZE], this.pointsmass[p + 2], shear * 2))
        }
      }
    }

    this.material = new THREE.MeshPhongMaterial({
      color: 'blue', wireframe: false, side: THREE.DoubleSide
    })
    this.mesh = new THREE.Mesh(this.geom, this.material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = false
  }

  doPhysics(t) {
    _.forEach(this.pointsmass, (p) => {
      p.doPhysics(t)
    })
  }

  doWind(d) {
    _.forEach(this.triangles, (t) => {
      t.doWind(d)
    })
  }

  doConstraints() {
    _.times(this.accuracy, () => {
      _.forEach(this.constraints, (c) => {
        c.doConstraint()
      })
    })
  }

  applyForces() {
    _.forEach(this.pointsmass, (p) => {
      p.applyForce()
    })
  }

  doLoop(t, wind) {
    this.doConstraints()
    this.doPhysics(t)
    this.doWind(wind)
    this.applyForces()
    this.geom.verticesNeedUpdate = true
    this.geom.computeFaceNormals()
    this.geom.normalsNeedUpdate = true
  }
}
