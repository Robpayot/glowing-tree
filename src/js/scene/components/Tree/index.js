import LoaderManager from '~managers/LoaderManager'
import GUI from '../Gui'
import { COLORS, BLOOM } from '~constants/index'
import { toRadian } from '~utils/math'

const { THREE } = window

const ASSETS = 'img/assets-scene/'

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
    // this.gltf = gltf
    // const tree = gltf.scene.children[0]
    // const tree = gltf.scene.getObjectByName('trees_rp_012_uv')
    // tree.material = this.trunkMaterial

    this.tree = gltf.scene.getObjectByName('GEO')
    // this.tree.material.normalMap = null
    // this.tree.material.map = null
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
    // this.tree.material.map = texture
    // this.tree.material.needsUpdate = true
    // gltf.scene.children[0].material.color.setHex(this.guiController.tree_color)
    // gltf.scene.children[0].material.roughness = this.guiController.roughness
    // gltf.scene.children[0].material.needsUpdate = true
    // gltf.scene.children[0].material.roughness = 0

    // https://threejs.org/docs/#api/en/core/Geometry.faceVertexUvs

    // tree.children.forEach(c => {
    //   c.material = this.trunkMaterial
    // })

    this.scene.add(this.tree)

    const s = new THREE.SphereGeometry(2, 32, 32)
    const m = this.trunkMaterial

    const mesh = new THREE.Mesh(s, m)
    mesh.position.x = 8
    // this.scene.add(mesh)

    // console.log(gltf)
    // this.scene.add(gltf.scene)
    GUI.addColor(this.guiController, 'tree_color').onChange(this.guiChange)
    // if (!BLOOM) {
    GUI.add(this.guiController, 'roughness', 0, 100).onChange(this.guiChange)
    // }
    this.tree.visible = true

    // window.tree = tree
  }

  events() {
    window.addEventListener(MOUSE_MOVE, this.handleMouseMove)
  }

  initMaterials() {
    // const { texture } = LoaderManager.subjects.matcap
    const { texture } = LoaderManager.subjects.tree_map
    const { texture: textureTrunk } = LoaderManager.subjects.trunkmap
    const { texture: textureNormal } = LoaderManager.subjects.tree_normal
    // const { texture: textureMatcap } = LoaderManager.subjects.tree_matcap

    // texture.flipY = false
    // textureTrunk.flipY = false

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
        // matcap: textureMatcap,
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
    // this.trunkMaterial.roughness = this.guiController.roughness / 100
    // this.trunkMaterial.color.setHex(this.guiController.tree_color)
    // this.branchMaterial.roughness = this.guiController.roughness / 100
    // this.branchMaterial.color.setHex(this.guiController.tree_color)
    // this.branchMaterial.needsUpdate = true
    // this.trunkMaterial.needsUpdate = true

    this.tree.material.color.setHex(this.guiController.tree_color)
    this.tree.material.roughness = this.guiController.roughness / 100
    this.tree.material.needsUpdate = true
    console.log(this.tree.material)

  }
}
