import { MOUSE_MOVE, DEBUG } from '~constants/index'
import { toRadian } from '~utils/math'
import touchEnabled from '~utils/touchEnabled'
import GUI from '../Gui'
import Firefly from './Firefly'
import CameraController from '../CameraController/index'

const { THREE } = window

export default class Pointlight {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera
    this.targetSpotlightY = this.targetSpotlightX = 0
    this.forceY = 200 // 255 / -200
    this.forceX = 150
    this.offsetY = 96
    this.coefSpotlight = 0.035
    this.spotlightThreshold = 50

    GUI.controller = {
      ...GUI.controller,
      positiony: 46,
      positionz: 531,
      targety: 96,
      intensity: 20,
      angle: 12,
      penumbra: 80,
      light_color: 0x9b9090,
    }

    this.createSpotLight()
    this.createAmbientLight()
    // this.createFireFly()


    this.initGui()
    this.events()
  }

  createAmbientLight() {
    // ambient light
    const light = new THREE.AmbientLight(0xffffff) // soft white light
    this.scene.add(light)
  }

  createSpotLight() {
    const { positiony, positionz, angle, penumbra, targety } = GUI.controller

    const spotLight = new THREE.SpotLight(GUI.controller.light_color, GUI.controller.intensity)
    spotLight.position.set(0, positiony, positionz)
    spotLight.angle = toRadian(angle)
    spotLight.penumbra = penumbra / 100
    spotLight.decay = 2
    spotLight.distance = 10000
    this.scene.add(spotLight)

    this.spotlight = spotLight

    this.target = new THREE.Object3D()
    this.target.position.y = targety

    if (DEBUG) {
      this.scene.add(this.target)
      spotLight.target = this.target
      this.scene.add(this.spotlight.target)
    } else {
      spotLight.target = this.camera.children[0]
    }
  }

  createFireFly() {
    this.firefly = new Firefly(this.scene, this.camera)
  }

  initGui() {
    // GUI.add(GUI.controller, 'positiony', -800, 800).onChange(this.guiChange)
    // GUI.add(GUI.controller, 'positionz', 0, 1200).onChange(this.guiChange)
    // GUI.add(GUI.controller, 'targety', 0, 1000).onChange(this.guiChange)
    GUI.add(GUI.controller, 'intensity', 0, 20).onChange(this.guiChange)
    GUI.add(GUI.controller, 'angle', 0, 500).onChange(this.guiChange)
    GUI.add(GUI.controller, 'penumbra', 0, 1000).onChange(this.guiChange)
    GUI.addColor(GUI.controller, 'light_color').onChange(this.guiChange)

    const lightHelper = new THREE.SpotLightHelper(this.spotlight)
    // this.scene.add(lightHelper)
  }

  events() {
    if (!touchEnabled()) {
      window.addEventListener(MOUSE_MOVE, this.handleMouseMove)
    }
  }

  handleMouseMove = e => {
    const { x, y } = e.detail

    this.targetSpotlightY = y * this.forceY + this.offsetY
    this.targetSpotlightX = x * this.forceX
  }

  guiChange = () => {
    this.spotlight.position.y = GUI.controller.positiony
    this.spotlight.position.z = GUI.controller.positionz
    this.spotlight.penumbra = GUI.controller.penumbra / 100
    this.spotlight.angle = toRadian(GUI.controller.angle)
    this.spotlight.color.setHex(GUI.controller.light_color)
    this.spotlight.intensity = GUI.controller.intensity
    this.target.position.y = GUI.controller.targety
  }

  render(now) {
    this.now = now

    if (this.camera.parent) {
      this.spotlight.position.copy(this.camera.parent.position)
    }


    if (this.camera.parent && this.camera.parent.position.z <= this.spotlightThreshold) {
      this.targetSpotlightY = GUI.controller.positiony
    }

    if (CameraController.progressPosition > CameraController.allowRotateThreshold) {
      if (this.spotlight.intensity < GUI.controller.intensity + 1) {
        this.spotlight.intensity += 0.01
      }
    } else {
      if (this.spotlight.intensity > GUI.controller.intensity) {
        this.spotlight.intensity -= 0.01
      }
    }

    if (DEBUG) {
      if (this.targetSpotlightY !== this.spotlight.target.position.y) {
        this.spotlight.target.position.y += (this.targetSpotlightY - this.spotlight.target.position.y) * this.coefSpotlight
      }

      if (this.targetSpotlightX !== this.spotlight.target.position.x) {
        this.spotlight.target.position.x += (this.targetSpotlightX - this.spotlight.target.position.x) * this.coefSpotlight
      }
    }

    if (this.firefly) {
      this.firefly.render(now)
    }
  }
}
