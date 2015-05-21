"use strict"

export class Triangle {
  constructor(a, b, c) {
    this.a = a
    this.b = b
    this.c = c
    this.triangle = new THREE.Triangle(a.vertice, b.vertice, c.vertice)
  }

  doWind(direction) {
    var normal = this.triangle.normal()
    normal.multiplyScalar(normal.dot(direction))
    this.a.addForce(normal)
    this.b.addForce(normal)
    this.c.addForce(normal)
  }
}
