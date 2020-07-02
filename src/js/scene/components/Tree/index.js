import LoaderManager from '~managers/LoaderManager'
import GUI from '../Gui'
import { COLORS, BLOOM } from '~constants/index'

const { THREE } = window


window.tree = null

export default class Tree {
  constructor(scene, camera) {
    this.currentModel = 'tree'

    this.mouse = {
      x: 0,
      y: 0,
    }

    this.init(scene, camera)
  }

  init(scene, camera) {
    this.scene = scene
    this.camera = camera
    this.guiController = { tree_color: COLORS.tree, roughness: 80 }

    // set all geometries
    const { gltf } = LoaderManager.subjects.scene

    this.tree = gltf.scene.getObjectByName('GEO')
    this.tree.material = new THREE.MeshBasicMaterial()
    this.tree.material.color.setHex(this.guiController.tree_color)

    if (BLOOM) {
      this.tree.material.roughness = 93
      this.tree.material.map = null
      this.tree.material.normalMap = null
    }

    this.scene.add(this.tree)

    GUI.addColor(this.guiController, 'tree_color').onChange(this.guiChange)
  }

  events() {
    window.addEventListener(MOUSE_MOVE, this.handleMouseMove)
  }

  render(now) {
    this.now = now
  }

  guiChange = () => {
    this.tree.material.color.setHex(this.guiController.tree_color)
    this.tree.material.needsUpdate = true
  }
}
