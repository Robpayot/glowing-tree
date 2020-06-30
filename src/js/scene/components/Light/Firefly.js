// import * as dat from 'dat.gui'
import LoaderManager from '~managers/LoaderManager'
import { oscillateBetween } from '~utils/math'
import { COLORS } from '~constants/index'

const { THREE } = window

const color = COLORS.lines2

export default class Firefly {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera

    this.sphere = new THREE.SphereBufferGeometry(5, 32, 32)
    const { texture } = LoaderManager.subjects.particle_1

    const dotGeometry = new THREE.Geometry()
    dotGeometry.vertices.push(new THREE.Vector3(0, 0, 0))
    const dotMaterial = new THREE.PointsMaterial({
      size: 30,
      sizeAttenuation: true,
      map: texture,
      transparent: true,
      opacity: 1,
      color,
    })
    const dot = new THREE.Points(dotGeometry, dotMaterial)
    // dot.layers.enable(1)

    this.mesh = new THREE.PointLight(color, 2, 1000)
    this.mesh.layers.enable(0)
    this.mesh.add(dot)

    this.scene.add(this.mesh)

    const position = new THREE.Vector3(0, -100, 0)
    this.mesh.position.copy(position)
  }

  render(now) {
    this.now = now

    this.mesh.position.x = oscillateBetween(now, -80, 80, 1 / 5000)
    this.mesh.position.y = oscillateBetween(now, -150, -120, 1 / 2500)
    this.mesh.position.z = oscillateBetween(now, -5, -5, 1 / 3000)
  }
}
