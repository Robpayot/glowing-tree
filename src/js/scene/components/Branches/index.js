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

      // modify splines points in code because I don't have blender :(
      if (i === 0) {
        points.children[1].position.y += 30
        points.children[2].position.y += 22
        points.children[3].position.y += 20
        points.children[4].position.y += 20
        points.children[5].position.y += 20
        points.children[6].position.y += 10
        points.children[7].position.y -= 20
        points.children[8].position.y -= 20
        points.children[9].position.y -= 10
        points.children[9].position.z -= 2
      } else if (i === 1) {
        points.children[1].position.y += 22
        points.children[2].position.y += 22
        points.children[3].position.y += 20
        points.children[4].position.y += 20
        points.children[5].position.y += 20
        points.children[6].position.y += 10
        points.children[7].position.y -= 20
        points.children[8].position.y -= 20
        points.children[9].position.y -= 10
        points.children[9].position.z -= 2
      } else if (i === 2) {
        points.children[1].position.y -= 15
        points.children[2].position.y -= 15
        points.children[3].position.y -= 15
        points.children[4].position.y -= 10
        points.children[5].position.y -= 5
        points.children[8].position.x += 10
        points.children[9].position.x += 10
        points.children[10].position.x += 10
      } else if (i === 3) {
        points.children[1].position.z -= 15
        points.children[2].position.z -= 15
        points.children[3].position.z -= 15
        points.children[4].position.z -= 15
        points.children[5].position.z -= 5
        points.children[6].position.y -= 10
        points.children[7].position.y -= 10
        points.children[8].position.y -= 10
        points.children[9].position.y -= 10
      } else if (i === 4) {
        points.children[0].position.y += 20
        points.children[1].position.y += 20
        points.children[2].position.y += 20
        points.children[3].position.y += 20
        points.children[4].position.y += 10
      } else if (i === 5) {
        points.children[3].position.y += 10
        points.children[4].position.y += 15
        points.children[5].position.y += 10
      } else if (i === 6) {
        points.children[3].position.z += 10
        points.children[4].position.z += 15
        points.children[5].position.z += 10
        points.children[7].position.z += 10
        points.children[8].position.z += 10
      } else if (i === 7) {
        points.children[6].position.z += 10
        points.children[7].position.z += 10
        points.children[8].position.z += 10
      }

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
