import Spline from './Spline'
import GUI from '../../Gui'
import { COLORS } from '../../../../constants/index'

const { THREE } = window
const nbSplines = 10

// const nbSplines = 15

export default class Branch {
  constructor(scene, camera, points) {
    this.scene = scene
    this.camera = camera
    this.points = points

    this.splines = []
    this.flowers = []

    this.nbSplines = nbSplines

    this.object = new THREE.Object3D()
    // GUI.lineControler = { line_color: COLORS.lines2 }

    // GUI.addColor(GUI.lineControler, 'line_color').onChange(this.guiChange)
    this.initSplines()

    // this.start()
    // setInterval(() => this.start(), 7000)
  }

  initSplines() {
    for (let i = 0; i < this.nbSplines; i++) {
      const spline = new Spline(this.scene, this.camera, this.points)
      this.splines.push(spline)
      this.object.add(spline.object)
    }
  }

  start() {
    for (let i = 0; i < this.splines.length; i++) {
      setTimeout(() => {
        this.splines[i].start()
      }, this.splines[i].offsetStart)
    }
  }

  render(now) {
    this.now = now

    if (this.splines.length > 0) {
      for (let i = 0; i < this.splines.length; i++) {
        this.splines[i].render(now)
      }
    }
  }

  guiChange = () => {
    if (this.splines.length > 0) {
      for (let i = 0; i < this.splines.length; i++) {
        this.splines[i].material.uniforms.color.value = new THREE.Color(GUI.lineControler.line_color)
        this.splines[i].pointMaterial.color = new THREE.Color(GUI.lineControler.line_color)
      }
    }
  }
}
