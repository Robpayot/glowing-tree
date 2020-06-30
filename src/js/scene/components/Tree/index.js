import LoaderManager from '~managers/LoaderManager'
import GUI from '../Gui'
import { COLORS, BLOOM } from '~constants/index'

const { THREE } = window


window.tree = null

export default class Tree {
  constructor(scene, camera) {
    this.currentModel = 'tree'

    // this.avgVertexCount = []
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

    this.initMaterials()

    // set all geometries
    const { gltf } = LoaderManager.subjects.scene
    console.log(gltf.scene)

    this.tree = gltf.scene.getObjectByName('GEO')
    this.tree.material.color.setHex(this.guiController.tree_color)
    this.tree.material.roughness = this.guiController.roughness

    if (BLOOM) {
      this.tree.material.roughness = 93
      this.tree.material.map = null
      this.tree.material.normalMap = null
    }
    // this.tree.material.needsUpdate = true
    this.tree.visible = false

    // tree.material = this.trunkMaterial

    // gltf.scene.children[0].scale.set(110, 110, 110)
    const { textureCube } = LoaderManager.subjects.tree_envmap
    this.tree.material.envMap = textureCube

    this.scene.add(this.tree)

    const s = new THREE.SphereGeometry(2, 32, 32)
    const m = this.trunkMaterial

    const mesh = new THREE.Mesh(s, m)
    mesh.position.x = 8

    GUI.addColor(this.guiController, 'tree_color').onChange(this.guiChange)
    // if (!BLOOM) {
    GUI.add(this.guiController, 'roughness', 0, 100).onChange(this.guiChange)
    // }
    this.tree.visible = true
  }

  events() {
    window.addEventListener(MOUSE_MOVE, this.handleMouseMove)
  }

  initMaterials() {
    const { texture } = LoaderManager.subjects.tree_map
    const { texture: textureTrunk } = LoaderManager.subjects.trunkmap
    const { texture: textureNormal } = LoaderManager.subjects.tree_normal

    if (BLOOM) {
      this.trunkMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.guiController.tree_color),
      })
      this.branchMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.guiController.tree_color),
      })
    } else {
      this.branchMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(this.guiController.tree_color),
        map: texture,
        normalMap: textureNormal,
        visible: true,
        roughness: this.guiController.roughness,
      })

      this.trunkMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(this.guiController.tree_color),
        map: textureTrunk,
        normalMap: textureNormal,
        visible: true,
        roughness: this.guiController.roughness,
      })
    }
  }

  render(now) {
    this.now = now

    if (this.raycaster && this.object) {
      // raycaster
      this.raycaster.setFromCamera(this.mouse, this.camera)

      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects([...this.object.children])

      for (let i = 0; i < intersects.length; i++) {
        const { point } = intersects[i]

        this.sphere.position.copy(point)
      }
    }
  }

  guiChange = () => {
    this.tree.material.color.setHex(this.guiController.tree_color)
    this.tree.material.roughness = this.guiController.roughness / 100
    this.tree.material.needsUpdate = true
    console.log(this.tree.material)

  }
}
