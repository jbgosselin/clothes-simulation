"use strict"

export class Constraint {
  constructor(p1, p2, length) {
    this.p1 = p1
    this.p2 = p2
    this.length = length
  }

  doConstraint() {
    var dir = this.p2.vertice.clone().sub(this.p1.vertice)
    var clength = dir.length()
    dir = dir.multiplyScalar(1 - this.length/clength).multiplyScalar(0.5)
    if (this.p1.movable) this.p1.vertice.add(dir)
    if (this.p2.movable) this.p2.vertice.sub(dir)
  }
}
