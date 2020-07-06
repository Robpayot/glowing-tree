import { MeshLine, MeshLineMaterial } from '../../../vendor/three/three.meshline'
import { randomInt, oscillateBetween, clamp } from '~utils/math'
import { getNow } from '~utils/time'
import LoaderManager from '~managers/LoaderManager'
import { COLORS } from '~constants/index'

import { inOutQuart } from '~utils/ease'

const { THREE } = window

const colors = [new THREE.Color(COLORS.lines2), new THREE.Color(COLORS.lines3), new THREE.Color(COLORS.lines4)]
const pointSize = 8
const pointMaterials = [
  new THREE.PointsMaterial({
    color: colors[0],
    size: pointSize,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    // blending: THREE.AdditiveBlending,
    // opacity: 0.8,
  }),
  new THREE.PointsMaterial({
    color: colors[1],
    size: pointSize,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    // blending: THREE.AdditiveBlending,
    // opacity: 0.8,
  }),
  new THREE.PointsMaterial({
    color: colors[2],
    size: pointSize,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    // blending: THREE.AdditiveBlending,
    // opacity: 0.8,
  }),
]

const pointGeometry = new THREE.Geometry()
pointGeometry.vertices.push(new THREE.Vector3(0, 0, 0))


// create Meshline
const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)
// const { near, far } = this.camera
// Build the material with good parameters to animate it.
const lineMaterials = [
  new MeshLineMaterial({
    color: colors[0],
    resolution,
    sizeAttenuation: true,
    lineWidth: 1,
    // near,
    // far,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
  }),
  new MeshLineMaterial({
    color: colors[1],
    resolution,
    sizeAttenuation: true,
    lineWidth: 1,
    // near,
    // far,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
  }),
  new MeshLineMaterial({
    color: colors[2],
    resolution,
    sizeAttenuation: true,
    lineWidth: 1,
    // near,
    // far,
    depthWrite: false,
    depthTest: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
  }),
]

const rangeTurbulence = 7
const rangeSmallTurbulence = 2

export default class Spline {
  constructor(scene, camera, points) {
    this.scene = scene
    this.camera = camera

    // console.log(points)

    this.progress = 0
    this.style = randomInt(0, 2)
    //
    this.lineWidthMin = 0.5
    this.lineWidthMax = 1.5
    this.lineSinFq = 6
    this.nbPoints = randomInt(30, 200) // AKA length

    this.duration = 8000 + this.nbPoints * 20
    this.progress = 0
    this.pointMaterial = pointMaterials[this.style]
    this.pointMaterial.map = LoaderManager.subjects.particle_1.texture

    this.lineThickness = 1 // AKA thickness
    this.lineThicknessMax = 2.5

    this.object = new THREE.Object3D()
    this.color = new THREE.Color(COLORS.lines2)
    this.trail = this.createSpline(points.children)
    this.createPoint()
    this.object.layers.enable(1)

    this.object.rotation.copy(points.rotation)
    this.object.position.copy(points.position)

    this.resetLinePosition()
  }

  createSpline(children) {
    const array = children

    // Filter meshes
    const points = []
    // sort children
    array.sort((a, b) => {
      const nbA = parseInt(a.name, 10)
      const nbB = parseInt(b.name, 10)
      return nbA - nbB
    })

    // // get meshes
    for (let i = 0; i < array.length; i++) {
      if (array[i].type === 'Mesh') {
        const pos = {
          x: array[i].position.x,
          y: array[i].position.y,
          z: array[i].position.z,
        }

        if (i !== 0 && i !== array.length - 1 && i !== array.length - 2) {
          if (i % 2 === 0) {
            pos.x += randomInt(-rangeTurbulence, rangeTurbulence)
            pos.y += randomInt(-rangeTurbulence, rangeTurbulence)
            pos.z += randomInt(-rangeTurbulence, rangeTurbulence)
          } else {
            pos.x += randomInt(-rangeSmallTurbulence, rangeSmallTurbulence)
            pos.y += randomInt(-rangeSmallTurbulence, rangeSmallTurbulence)
            pos.z += randomInt(-rangeSmallTurbulence, rangeSmallTurbulence)
          }
        }

        points.push(pos)
      }
    }
    // create trail for camera
    const curveWithPoints = new THREE.CatmullRomCurve3(points)
    curveWithPoints.curveType = 'catmullrom'
    curveWithPoints.tension = 0.6
    const curveWithMorePoints = curveWithPoints.getPoints(this.nbPoints)

    // Debug mode

    // const linePoints = new THREE.Geometry().setFromPoints(curveWithMorePoints)

    this.trail_geometry = new THREE.Geometry()
    for (let i = 0; i < this.nbPoints; i++) {
      // must initialize it to the number of positions it will keep or it will throw an error
      this.trail_geometry.vertices.push(new THREE.Vector3())
    }

    // Build the geometry
    this.lineTrail = new MeshLine()
    // Rules for width
    // p * 1 --> make width bigger and bigger
    // 1 - p --> make width thiner and thiner
    // Math.sin(50 * p) --> sinus
    // sin(value) * Amplitude / 2 + middle value
    this.lineTrail.setGeometry(this.trail_geometry, p =>
      oscillateBetween(p, this.lineWidthMin, this.lineWidthMax, this.lineSinFq, 300),
    ) // make width taper
    // this.lineTrail.setGeometry(this.trail_geometry, p => this.lineWidthMax - p) // make width taper
    const { geometry } = this.lineTrail

    // Build the Mesh
    const lineMesh = new THREE.Mesh(geometry, lineMaterials[this.style])
    this.lineMesh = lineMesh
    this.lineMesh.layers.enable(1)
    this.lineMesh.frustumCulled = false

    this.object.add(lineMesh)

    const trail = new THREE.CatmullRomCurve3(curveWithMorePoints)
    return trail
  }

  createPoint() {
    this.point = new THREE.Points(pointGeometry, this.pointMaterial)

    this.point.position.copy(this.trail.getPoint(0).add(this.lineMesh.position))
    this.object.add(this.point)
  }

  resetLinePosition() {
    const { position } = this.lineMesh.geometry.attributes
    const origin = this.trail.getPoint(0)
    for (let i = 0; i < position.count; i++) {
      position.setXYZ(i, origin.x, origin.y, origin.z)
      position.needsUpdate = true
    }
  }

  start() {
    this.started = true
    this.isAnimationDone = false
    this.startAnimation = getNow()
  }

  render(now) {
    this.now = now

    if (this.started) {
      const { lineWidth } = this.lineMesh.material.uniforms
      const percent = (this.now - this.startAnimation) / this.duration

      if (percent < 1) {
        // if (percent < 0.2) {
        //   this.lineMesh.visible = false
        // } else {
        //   this.lineMesh.visible = true
        // }

        this.progress = 1 * inOutQuart(percent)
        this.lineTrail.advance(this.trail.getPoint(this.progress))
      } else {
        this.resetLinePosition()
        this.progress = 0

        if (!this.isAnimationDone) {
          this.resolveAnimation()
          this.isAnimationDone = true
        }
      }

      if (this.camera.parent) {
        lineWidth.value = clamp((this.lineThickness * this.camera.parent.position.z) / 200, this.lineThickness, this.lineThicknessMax)
        this.point.material.size = clamp((pointSize * this.camera.parent.position.z) / 200, pointSize, pointSize + 10)
      } else {
        lineWidth.value = this.lineThickness
      }

      const { position } = this.lineMesh.geometry.attributes
      this.point.position.x = position.getX(position.count - 1)
      this.point.position.y = position.getY(position.count - 1)
      this.point.position.z = position.getZ(position.count - 1)
    }
  }

  animationDone = () => {
    return new Promise(resolve => {
      this.resolveAnimation = resolve
    })
  }
}
