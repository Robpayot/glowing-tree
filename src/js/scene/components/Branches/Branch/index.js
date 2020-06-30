import Spline from './Spline'
import GUI from '../../Gui'

const { THREE } = window

// const nbSplines = 15
const nbFlowers = 3

export default class Branch {
  constructor(scene, camera, points) {
    this.scene = scene
    this.camera = camera
    this.points = points

    this.splines = []
    this.flowers = []

    this.nbSplines = 10

    this.object = new THREE.Object3D()
    // GUI.lineControler = { line_color: COLORS.lines2 }

    // GUI.addColor(GUI.lineControler, 'line_color').onChange(this.guiChange)
    this.initSplines()
    // this.initFlowers()

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

  initFlowers() {
    const positions = [{
      x: 64,
      y: 209,
      z: 10,
    }, {
      x: 86,
      y: 217,
      z: 3,
    }, {
      x: 108,
      y: 218,
      z: 6,
    }]

    for (let i = 0; i < nbFlowers; i++) {
      const flower = new Flower(this.scene, this.camera, positions[i], i * 500)
      this.flowers.push(flower)
    }
  }

  start() {
    for (let i = 0; i < this.splines.length; i++) {
      setTimeout(() => {
        this.splines[i].start()
      }, this.splines[i].offsetStart)
    }
    for (let i = 0; i < this.flowers.length; i++) {
      setTimeout(() => {
        this.flowers[i].start()
      }, this.flowers[i].offsetStart)
    }
  }

  render(now) {
    this.now = now

    //
    if (this.splines.length > 0) {
      for (let i = 0; i < this.splines.length; i++) {
        this.splines[i].render(now)
      }
    }

    if (this.flowers.length > 0) {
      for (let i = 0; i < this.flowers.length; i++) {
        this.flowers[i].render(now)
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
