import LoaderManager from '~managers/LoaderManager'
import Branch from './Branch'
import GUI from '../Gui'
import { COLORS } from '~constants/index'

export default class Link {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera

    this.branches = []

    this.getSplinesPoints()
    this.initBranches()

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

      if (i === 1 || i === 2 || i === 4) {
        this.scene.add(branch.object)
      } else {
        this.scene.add(branch.object)
      }
    }
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
        spline.lineMaterial.uniforms.color.value = new THREE.Color(this.guiController.splines_color)
      }
    }
  }
}
