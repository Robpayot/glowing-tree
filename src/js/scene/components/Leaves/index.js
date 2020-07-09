import LoaderManager from '~managers/LoaderManager'
import { fillWithPoints, getCenterPoint } from '../../utils/three-utils'
import { COLORS } from '~constants/index'
import { randomFloat, clamp, toRadian } from '~utils/math'
import customPointsMaterialFrag from '../../shaders/customPointsMaterial.frag'
import customPointsMaterialVert from '../../shaders/customPointsMaterial.vert'
import GUI from '../Gui'
import touchEnabled from '~utils/touchEnabled'
import { MOUSE_MOVE } from '~constants/index'
import CameraController from '../CameraController/index'

const { THREE } = window

const material = new THREE.PointsMaterial({
  color: COLORS.particles,
  sizeAttenuation: true,
  depthTest: true,
  depthWrite: false,
  transparent: true,
  // blending: THREE.AdditiveBlending,
  opacity: 0.4, // which is the minimum opacity with my shader
})

const material2 = new THREE.PointsMaterial({
  color: COLORS.particles,
  sizeAttenuation: true,
  depthTest: true,
  depthWrite: false,
  transparent: true,
  // blending: THREE.AdditiveBlending,
  opacity: 0.8, // which is the minimum opacity with my shader
})

export default class Leaves {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera
    const { fbx } = LoaderManager.subjects.leaves

    const { texture } = LoaderManager.subjects.particle_1
    this.particleTexture = texture

    this.coefRotate = 0.035
    this.rotateForceX = 0.8
    this.rotateForceY = 1
    this.targetRotateX = 0
    this.targetRotateY = 0
    this.currentRotateX = this.currentRotateY = 0

    this.groupLeaves = [
      {
        object: fbx.children[1],
        material,
        nbParticles: 5000,
        pointSize: 2,
        pointSizeMin: 1.8,
        pointSizeMax: 4.5,
      },
      {
        object: fbx.children[0],
        material: material2,
        nbParticles: 250,
        pointSize: 5,
        pointSizeMin: 5,
        pointSizeMax: 7,
      },
    ]

    for (let i = 0; i < this.groupLeaves.length; i++) {
      const leaves = this.groupLeaves[i]
      const center = getCenterPoint(leaves.object)
      center.y = 0
      leaves.object.rotation.z += THREE.Math.degToRad(-2)
      const bufferGeometry = fillWithPoints(leaves.object.geometry, leaves.nbParticles)
      this.initMaterial(bufferGeometry, leaves)
      leaves.mesh = this.addMesh(bufferGeometry, leaves)
      leaves.center = center
      leaves.originRotation = leaves.object.rotation.clone()
    }

    this.guiController = { particles_color: COLORS.particles }

    GUI.addColor(this.guiController, 'particles_color').name('ptcl tree').onChange(this.guiChange)

    this.events()
  }

  events() {
    if (!touchEnabled()) {
      window.addEventListener(MOUSE_MOVE, this.handleMouseMove)
    }
  }

  handleMouseMove = e => {
    const { x, y } = e.detail

    this.targetRotateX = -(y * 1) * this.rotateForceX
    this.targetRotateY = x * this.rotateForceY
  }

  initMaterial(bufferGeometry, groupLeaves) {
    // // create material
    const { material, pointSize } = groupLeaves
    material.map = this.particleTexture
    material.size = pointSize

    // add atribute to the buffer geometry
    const numVertices = bufferGeometry.attributes.position.count
    const alphaOffsets = new Float32Array(numVertices) // 1 values per vertex
    const alphaSpeeds = new Float32Array(numVertices)

    for (let i = 0; i < numVertices; i++) {
      // set alphaOffset randomly
      alphaOffsets[i] = randomFloat(0, 1000) // alpha between 0.2 & 1
      alphaSpeeds[i] = randomFloat(0.5, 2)
    }

    bufferGeometry.setAttribute('alphaOffset', new THREE.BufferAttribute(alphaOffsets, 1))
    bufferGeometry.setAttribute('alphaSpeed', new THREE.BufferAttribute(alphaSpeeds, 1))
    material.userData.time = { value: 0.0 }

    // Override PointsMaterial with a custom one
    material.onBeforeCompile = shader => {
      shader.uniforms.time = material.userData.time
      // pass this input by reference

      // prepend the input to the vertex shader
      shader.vertexShader = customPointsMaterialVert

      // //prepend the input to the shader
      shader.fragmentShader = customPointsMaterialFrag
    }
  }

  addMesh(bufferGeometry, groupLeaves) {
    const { material } = groupLeaves
    const { position, rotation } = groupLeaves.object
    // create mesh
    const mesh = new THREE.Points(bufferGeometry, material)

    mesh.position.copy(position)
    mesh.rotation.copy(rotation)

    this.scene.add(mesh)

    return mesh
  }

  render(now) {
    this.now = now

    if (CameraController.progressPosition > CameraController.allowRotateThreshold + 0.1) {
      // more to do!
      if (this.currentRotateY !== toRadian(this.targetRotateY) && this.currentRotateX !== toRadian(this.targetRotateX)) {
        this.mouseMoveRotate()
      }
    }

    for (let i = 0; i < this.groupLeaves.length; i++) {
      const leaves = this.groupLeaves[i]
      leaves.material.userData.time.value = -now / 10
      if (this.camera.parent) {
        leaves.material.size = clamp(
          (leaves.pointSize * this.camera.parent.position.z) / 200,
          leaves.pointSizeMin,
          leaves.pointSizeMax,
        )
      }
    }
  }

  mouseMoveRotate() {
    let cameraPos
    if (this.camera.parent) {
      cameraPos = this.camera.parent.position.clone()
      cameraPos.y = 0
    }

    for (let i = 0; i < this.groupLeaves.length; i++) {
      const { mesh, center } = this.groupLeaves[i]
      this.currentRotateY += (toRadian(this.targetRotateY) - this.currentRotateY) * this.coefRotate
      this.currentRotateX += (toRadian(this.targetRotateX) - this.currentRotateX) * this.coefRotate

      const axisX = new THREE.Vector3() // create once an reuse it
      axisX.subVectors( cameraPos, center ).normalize()
      axisX.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), toRadian(90) )

      const rotations = [{
        axis: axisX,
        angle: this.currentRotateX,
      }, {
        axis: new THREE.Vector3( 0, 1, 0 ),
        angle: this.currentRotateY,
      }]

      this.rotateOnWorldAxis(mesh, rotations)
    }
  }

  rotateOnWorldAxis(object, rotations) {
    // To apply the rotation on world axis as an animation in time,
    // we need to use an helper that we'll copy the current rotation and apply this rotation to our element
    const helper = new THREE.Object3D()
    // copy actual position
    helper.position.copy(object.position)

    for (let i = 0; i < rotations.length; i++) {
      const { axis, angle } = rotations[i]
      // apply on world Axis
      helper.rotateOnWorldAxis(axis, angle)
    }
    // Copy helper rotation
    object.rotation.copy(helper.rotation)
    // remove helper
    helper.remove()
  }

  guiChange = () => {
    material.color.setHex(this.guiController.particles_color)
    material2.color.setHex(this.guiController.particles_color)
  }
}
