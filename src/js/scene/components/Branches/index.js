import LoaderManager from '~managers/LoaderManager'
import Branch from './Branch'
import GUI from '../Gui'
import { COLORS } from '~constants/index'
import { randomInt } from '~utils/math'

const offsetSplineStart = 2000

export default class Branches {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera

    this.branches = []

    this.getSplinesPoints()
    this.initBranches()
    this.startAllAnimations()

    this.guiController = { splines_color: COLORS.lines2 }

    GUI.addColor(this.guiController, 'splines_color').onChange(this.guiChange)
  }

  getSplinesPoints() {
    const { gltf } = LoaderManager.subjects.scene
    console.log(gltf)

    this.splinesPoints = [
      gltf.scene.getObjectByName('spline_1'),
      gltf.scene.getObjectByName('spline_2'),
      gltf.scene.getObjectByName('spline_3'),
      gltf.scene.getObjectByName('spline_4'),
      gltf.scene.getObjectByName('spline_5'),
      gltf.scene.getObjectByName('spline_6'),
      gltf.scene.getObjectByName('spline_7'),
      gltf.scene.getObjectByName('spline_8'),
    ]
  }

  initBranches() {
    for (let i = 0; i < this.splinesPoints.length; i++) {
      const points = this.splinesPoints[i]
      const branch = new Branch(this.scene, this.camera, points)
      this.branches.push(branch)

      this.scene.add(branch.object)
    }
  }

  startAllAnimations() {
    const promises = []
    // for each branch
    for (let i = 0; i < this.branches.length; i++) {
      const branch = this.branches[i]
      // for each spline
      for (let j = 0; j < branch.splines.length; j++) {
        const spline = branch.splines[j]
        promises.push(spline.animationDone())
        const offset = randomInt(0, offsetSplineStart)
        // offset starts
        setTimeout(() => {
          spline.start()
        }, offset)
      }
    }
    // when all the animations of each spline are done =>
    Promise.all(promises).then(() => {
      // call this function again
      this.startAllAnimations()
      // console.log('restart all')
    })
  }

  render(now) {
    for (let i = 0; i < this.branches.length; i++) {
      this.branches[i].render(now)
    }
  }

  guiChange = () => {
    for (let i = 0; i < this.branches.length; i++) {
      const branch = this.branches[i]
      for (let j = 0; j < branch.splines.length; j++) {
        const spline = branch.splines[j]
        spline.pointMaterial.color.setHex(this.guiController.splines_color)
        spline.lineMesh.material.uniforms.color.value = new THREE.Color(this.guiController.splines_color)
      }
    }
  }
}
