// import * as THREE from 'three'
import '../vendor/three/OrbitControls'
import '../vendor/three/EffectComposer'
import '../vendor/three/RenderPass'
import '../vendor/three/CopyShader'
import '../vendor/three/LuminosityHighPassShader'
import '../vendor/three/ShaderPass'
import '../vendor/three/UnrealBloomPass'
import Stats from 'stats-js'
import createCustomEvent from '~utils/createCustomEvent'
import GUI from './Gui'

// components
import Tree from './Tree/index'
import FloatingParticles from './FloatingParticles/index'
import Branches from './Branches/index'
import LoaderManager from '../../managers/LoaderManager'
import Leaves from './Leaves/index'
import CameraController from './CameraController/index'
import Light from './Light/index'

import { RAF, WINDOW_RESIZE, MOUSE_MOVE, DEBUG, START_SCENE, BLOOM } from '../../constants/index'

import bloomFragment from '../shaders/bloom.frag'
import bloomVertex from '../shaders/bloom.vert'

const { THREE } = window

const ASSETS = 'img/assets-scene/'

const ENTIRE_SCENE = 0,
  BLOOM_SCENE = 1

export default class Scene {
  constructor(el) {
    this.canvas = el

    this.setUnits()

    this.ui = { loader: document.querySelector('.scene__loader') }

    this.load()
  }

  load() {
    LoaderManager.load(
      [
        {
          name: 'scene',
          gltf: `${ASSETS}gltf/tree_scene_009_modified_paths.glb`,
        },
        {
          name: 'particle_1',
          texture: `${ASSETS}images/particles/particle-5.png`,
        },
        {
          name: 'particle_2',
          texture: `${ASSETS}images/particles/particle-7.png`,
        },
        {
          name: 'tree_normal',
          texture: `${ASSETS}images/tree/tree_mat_normal.jpg`,
        },
        {
          name: 'tree_map',
          texture: `${ASSETS}images/tree/tree_mat_1003.jpg`,
        },
        {
          name: 'tree_envmap',
          cubeTexture: `${ASSETS}images/envmap/`,
        },
        {
          name: 'tree_matcap',
          texture: `${ASSETS}images/tree/matcap.jpg`,
        },
        {
          name: 'trunkmap',
          texture: `${ASSETS}images/tree/bake.png`,
        },
        {
          name: 'leaves',
          fbx: `${ASSETS}fbx/tree_V44.fbx`,
        },
        {
          name: 'scene',
          texture: `${ASSETS}images/scene-bkg-texture.png`,
        },
      ],
      this.init,
    )
  }

  init = () => {
    this.ui.loader.style.display = 'none'

    this.buildStats()
    this.buildScene()
    this.buildRender()
    this.buildCamera()
    if (DEBUG) {
      this.buildControls()
    }

    this.initGUI()

    if (BLOOM) {
      this.bloom()

      this.buildBackground()
      this.branches = new Branches(this.scene, this.camera)
      this.light = new Light(this.scene, this.camera)
    } else {
      this.light = new Light(this.scene, this.camera)
    }

    // TopTree.init(this.scene)
    // BottomTree.init(this.scene)

    // // load tree
    this.tree = new Tree(this.scene, this.camera)

    // load levitating particles
    this.floatingParticles = new FloatingParticles(this.scene)

    this.leaves = new Leaves(this.scene, this.camera)

    // start RAF
    window.dispatchEvent(createCustomEvent(START_SCENE))
    this.events()
  }

  initGUI() {
    // bloom
    this.guiController = {
      exposure: 1,
      bloomStrength: 1.7,
      bloomThreshold: 0,
      bloomRadius: 0,
      background: 0xa231a,
    }

    if (BLOOM) {
      GUI.add(this.guiController, 'exposure', 0.0, 10.0).onChange(this.guiChange)
      GUI.add(this.guiController, 'bloomStrength', 0.0, 20.0).onChange(this.guiChange)
      GUI.add(this.guiController, 'bloomThreshold', 0.0, 1.0).onChange(this.guiChange)
      GUI.add(this.guiController, 'bloomRadius', 0.0, 10.0).onChange(this.guiChange)
    }
    // GUI.addColor(this.guiController, 'background').onChange(this.guiChange)
  }

  guiChange = () => {
    if (BLOOM) {
      this.renderer.toneMappingExposure = Math.pow(this.guiController.exposure, 4.0)
      this.bloomPass.threshold = Number(this.guiController.bloomThreshold)
      this.bloomPass.strength = Number(this.guiController.bloomStrength)
      this.bloomPass.radius = Number(this.guiController.bloomRadius)
      this.backgroundTexture.material.color.setHex(this.guiController.background)
    }
    // this.renderer.setClearColor(this.guiController.background, 1)
  }

  events() {
    window.addEventListener(WINDOW_RESIZE, this.handleResize, { passive: true })
    window.addEventListener(RAF, this.render, { passive: true })
    window.addEventListener('mousemove', this.handleMouseMove)
    // window.addEventListener('wheel', this.handleScroll)
  }

  buildBackground() {
    // const { texture } = LoaderManager.subjects.scene
    const geo = new THREE.PlaneGeometry(4000, 4000, 100)
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(this.guiController.background) })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.z = -300
    this.scene.add(mesh)

    this.backgroundTexture = mesh
  }

  buildStats() {
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)
  }

  buildScene() {
    this.scene = new THREE.Scene()

    if (!BLOOM) {
      const { texture } = LoaderManager.subjects.scene

      this.scene.background = texture
    }
  }

  buildRender() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      autoClearColor: false,
    })

    if (BLOOM) {
      this.renderer.toneMapping = THREE.ReinhardToneMapping
    }

    this.setSizes()
  }

  bloom() {
    this.renderScene = new THREE.RenderPass(this.scene, this.camera)

    this.bloomLayer = new THREE.Layers()
    this.bloomLayer.set(BLOOM_SCENE)
    this.darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
    this.materials = {}

    this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
    this.bloomPass.threshold = this.guiController.bloomThreshold
    this.bloomPass.strength = this.guiController.bloomStrength
    this.bloomPass.radius = this.guiController.bloomRadius

    this.bloomComposer = new THREE.EffectComposer(this.renderer)
    this.bloomComposer.renderToScreen = false
    this.bloomComposer.addPass(this.renderScene)
    this.bloomComposer.addPass(this.bloomPass)

    const finalPass = new THREE.ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
        },
        vertexShader: bloomVertex,
        fragmentShader: bloomFragment,
        defines: {},
      }),
      'baseTexture',
    )
    finalPass.needsSwap = true

    this.finalComposer = new THREE.EffectComposer(this.renderer)
    this.finalComposer.addPass(this.renderScene)
    this.finalComposer.addPass(finalPass)

    // this.scene.traverse(this.disposeMaterial)
    // this.scene.children.length = 0

    this.renderer.toneMappingExposure = Math.pow(this.guiController.exposure, 4.0)
  }

  buildCamera() {
    const aspectRatio = this.width / this.height
    const fieldOfView = 10
    const nearPlane = 1
    const farPlane = 10000

    this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    // this.camera.position.set(0, 1500, 1500)
    // this.camera.position.set(5, 0, 10)

    // previous
    // this.camera.position.set(15, 0, 100)

    this.camera.zoom = 0.3
    // this.camera.lookAt(0, 500, 0)
    this.camera.updateProjectionMatrix()

    CameraController.init(this.camera, this.scene)
  }

  buildControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
    // this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.8
    this.controls.enableDamping = true
  }

  // RAF
  render = e => {
    const { now } = e.detail

    this.stats.begin()

    if (this.controls) this.controls.update() // for damping

    if (this.tree) this.tree.render(now)
    if (this.floatingParticles) this.floatingParticles.render(now)
    if (this.branches) this.branches.render(now)
    if (this.leaves) this.leaves.render(now)
    if (this.light) this.light.render(now)

    if (!DEBUG) {
      CameraController.render(now)

      if (BLOOM) {
        this.moveBackground()
      }
    }

    if (this.bloomComposer) {
      this.renderBloom(true)
      this.finalComposer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }

    this.stats.end()
  }

  moveBackground() {
    this.backgroundTexture.lookAt(this.camera.parent.position)

    const vector = new THREE.Vector3() // create once and reuse it!
    this.camera.getWorldDirection(vector)

    // console.log(vector)
    const clonePosition = this.camera.parent.position.clone()
    const position = clonePosition.add(vector.multiplyScalar(3000))

    this.backgroundTexture.position.set(position.x, position.y, position.z)
    this.backgroundTexture.lookAt(this.camera.parent.position)
  }

  renderBloom(mask) {
    if (mask === true) {
      this.scene.traverse(this.darkenNonBloomed)
      this.bloomComposer.render()
      this.scene.traverse(this.restoreMaterial)
    } else {
      this.camera.layers.set(BLOOM_SCENE)
      this.bloomComposer.render()
      this.camera.layers.set(ENTIRE_SCENE)
    }
  }

  darkenNonBloomed = obj => {
    if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
      this.materials[obj.uuid] = obj.material
      obj.material = this.darkMaterial
    }
  }

  restoreMaterial = obj => {
    if (this.materials[obj.uuid]) {
      obj.material = this.materials[obj.uuid]
      delete this.materials[obj.uuid]
    }
  }

  disposeMaterial = obj => {
    if (obj.material) {
      obj.material.dispose()
    }
  }

  // EVENTS

  handleMouseMove = e => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1

    window.dispatchEvent(createCustomEvent(MOUSE_MOVE, { x, y }))
  }

  handleResize = () => {
    this.setUnits()

    // Update camera
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    this.setSizes()

    if (this.bloomComposer) this.bloomComposer.setSize(this.width, this.height)
    if (this.finalComposer) this.finalComposer.setSize(this.width, this.height)
  }

  setSizes() {
    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
    if (DPR > 1 && window.innerWidth > 1680) {
      this.renderer.setPixelRatio(1.5)
    } else {
      this.renderer.setPixelRatio(DPR)
    }
    this.renderer.setSize(this.width, this.height)

    // resize image cover style
    if (this.scene.image) {
      const imageAspect = this.scene.image
        ? this.scene.image.width / this.scene.image.height
        : 1
      const aspect = imageAspect / this.camera.aspect

      this.scene.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0
      this.scene.repeat.x = aspect > 1 ? 1 / aspect : 1

      this.scene.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2
      this.scene.repeat.y = aspect > 1 ? 1 : aspect
    }
  }

  setUnits() {
    this.width = this.canvas.parentNode.offsetWidth
    this.height = this.canvas.parentNode.offsetHeight
  }
}
