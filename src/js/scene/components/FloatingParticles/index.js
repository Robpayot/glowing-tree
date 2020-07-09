import LoaderManager from '~managers/LoaderManager'
import { randomFloat, oscillateBetween } from '~utils/math'
import GUI from '../Gui'

const { THREE } = window

const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 14.5,
  depthWrite: false,
  depthTest: true,
  sizeAttenuation: true,
  transparent: true,
  // blending: THREE.AdditiveBlending,
  opacity: 0.9,
})

export default class FloatingParticles {
  constructor(scene) {
    this.nbParticles = 500
    this.range = 1000
    this.opacity = 0

    this.guiController = { particles_color_bkg: 0xffffff }

    this.scene = scene
    const { texture } = LoaderManager.subjects.particle_2

    material.map = texture
    material.color.setHex(this.guiController.particles_color_bkg)

    const geometry = new THREE.Geometry()
    const { range } = this

    for (let i = 0; i < this.nbParticles; i++) {
      const particle = new THREE.Vector3(
        randomFloat(-range, range),
        randomFloat(-range, range),
        randomFloat(-range, range),
      )
      particle.speed = randomFloat(0.01, 0.2)
      particle.velocityStep = randomFloat(0.00001, 0.00005)
      particle.velocity = 0
      geometry.vertices.push(particle)
    }

    this.geometry = geometry

    this.particlesLevitate = new THREE.Points(this.geometry, material)
    this.scene.add(this.particlesLevitate)

    this.initGUI()
  }

  initGUI() {
    GUI.addColor(this.guiController, 'particles_color_bkg').name('ptcl bkg').onChange(this.guiChange)
  }

  guiChange = () => {
    material.color.setHex(this.guiController.particles_color_bkg)
  }

  render(now) {
    if (!this.geometry) return

    for (let i = 0; i < this.geometry.vertices.length; i++) {
      const particle = this.geometry.vertices[i]
      particle.velocity += particle.velocityStep
      particle.y += particle.speed + particle.velocity
      particle.x += particle.speed / 5 + particle.velocity / 2
      if (particle.y > this.range) {
        particle.y = -this.range
        particle.velocity = 0
      }
      if (particle.x > this.range) {
        particle.x = -this.range
        particle.velocity = 0
      }
    }
    this.geometry.verticesNeedUpdate = true
    this.opacity = oscillateBetween(now, 0.5, 1, 0.0005)
    material.opacity = this.opacity
  }
}
