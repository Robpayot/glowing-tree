import LoaderManager from '~managers/LoaderManager'
import { COLORS } from '~constants/index'

const { THREE } = window

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
    this.guiController = { tree_color: COLORS.tree }

    // set all geometries
    const { gltf } = LoaderManager.subjects.scene

    this.tree = gltf.scene.getObjectByName('GEO')
    this.tree.material = new THREE.MeshBasicMaterial()
    this.tree.material.color.setHex(this.guiController.tree_color)

    this.scene.add(this.tree)
  }

  events() {
    window.addEventListener(MOUSE_MOVE, this.handleMouseMove)
  }

  render(now) {
    this.now = now
  }
}
