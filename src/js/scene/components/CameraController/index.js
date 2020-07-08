import { getNow } from '~utils/time'
import { toRadian } from '~utils/math'
import { inOutQuart } from '~utils/ease'
import { DEBUG, MOUSE_MOVE, SCROLL } from '~constants/index'
import LoaderManager from '~managers/LoaderManager'
import touchEnabled from '~utils/touchEnabled'

const { THREE } = window

class CameraController {
  constructor() {
    this.progressPosition = 0
    this.progressPositionTarget = 0

    this.progressLookIntroX = 0
    this.progressLookIntroY = 0
    this.progressLookIntroZ = 0

    this.mouse = {
      x: 0,
      y: 0,
    }
    this.rotateForceX = 3.5
    this.rotateForceY = 3.5
    this.rotateForceStep1X = 2
    this.rotateForceStep1Y = 3
    this.coefRotate = 0.035
    this.coefMove = 0.08
    this.allowRotateThreshold = 0.08
    this.targetRotateX = 180
    this.targetRotateY = 0

    // Intro
    this.durationIntroPosition = 8000
    this.durationIntroLook = 8000

    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual' // prevent chrome automatic scroll
    }
  }

  init(camera, scene) {
    this.cameraBox = new THREE.Object3D()
    this.camera = camera

    this.scene = scene

    this.scene.add(this.camera)

    const { gltf } = LoaderManager.subjects.scene
    const cameraPoints = gltf.scene.getObjectByName('CamerasPoints')

    this.trailPosition = this.createTrail(cameraPoints)
    this.createLookAt()
    this.trailLookAt = this.createLookAtTrail(this.lookPoints)

    this.introTrailPosition = this.createIntroTrail()
    this.createLookIntro()

    const currentPos = this.trailPosition.getPoint(0)
    this.cameraBox.position.copy(currentPos)

    this.camera.rotation.x = toRadian(180) // fix cameraBox

    if (DEBUG) {
      this.camera.position.set(0, 150, 450)
      this.camera.lookAt(0, 0, 0)
    } else {
      this.cameraBox.add(this.camera)
      this.scene.add(this.cameraBox)
      this.events()

      const currentPosIntro = this.introTrailPosition.getPoint(0)
      this.cameraBox.position.copy(currentPosIntro)
      this.cameraBox.lookAt(this.lookIntroPoints[0])
      this.camera.lookAt(this.lookIntroPoints[0])

      this.startIntro()
    }
  }

  createLookAtTrail(coordinates) {
    const points = []
    // // get meshes
    for (let i = 0; i < coordinates.length; i++) {
      points.push(coordinates[i])
    }

    // create trail for camera
    const curveWithMorePoints = new THREE.CatmullRomCurve3(points).getPoints(200)
    const finalTrail = new THREE.CatmullRomCurve3(curveWithMorePoints)
    // For debug
    // const curveGeometry = new THREE.Geometry().setFromPoints(curveWithMorePoints)

    // // // Build the geometry
    // const material = new THREE.LineBasicMaterial({ color: 0xffff00 })
    // // // Create the final object to add to the scene
    // const curveObject = new THREE.Line(curveGeometry, material)

    // this.scene.add(curveObject)

    return finalTrail
  }

  createTrail(object) {
    // set all geometries
    const { children } = object

    // Filter meshes
    const points = []
    const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    object.visible = false
    this.scene.add(object)
    this.scene.updateMatrixWorld()
    // // get meshes
    for (let i = 0; i < children.length; i++) {
      if (children[i].type === 'Mesh') {
        const position = new THREE.Vector3()
        position.setFromMatrixPosition( children[i].matrixWorld )
        points.push(position)
        children[i].material = debugMaterial
      }
    }

    // reverse arrays so curve is starting from the rigth direction
    points.reverse()
    // put the first position closer to the tree
    points[0].z -= 600
    points[1].y += 100

    // create trail for camera
    const curveWithMorePoints = new THREE.CatmullRomCurve3(points).getPoints(200)
    const finalTrail = new THREE.CatmullRomCurve3(curveWithMorePoints)
    // For debug
    // const curveGeometry = new THREE.Geometry().setFromPoints(curveWithMorePoints)

    // // // Build the geometry
    // const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
    // // // Create the final object to add to the scene
    // const curveObject = new THREE.Line(curveGeometry, material)

    // this.scene.add(curveObject)

    return finalTrail
  }

  createLookAt() {
    this.lookPoints = [
      new THREE.Vector3(0, 110, 0),
      new THREE.Vector3(0, 66, 0),
      new THREE.Vector3(0, 272, 0),
      new THREE.Vector3(0, -75, 0),
      new THREE.Vector3(0, -110, 0),
      new THREE.Vector3(0, 280, 0),
      new THREE.Vector3(0, -58, 0),
    ]
  }

  createIntroTrail() {
    // set all geometries
    // Filter meshes
    const points = [
      new THREE.Vector3(0, 70, 500),
      this.trailPosition.getPoint(0),
    ]

    // create trail for camera
    const curveWithMorePoints = new THREE.CatmullRomCurve3(points).getPoints(200)
    const finalTrail = new THREE.CatmullRomCurve3(curveWithMorePoints)
    finalTrail.curveType = 'catmullrom'
    finalTrail.tension = 0.3

    return finalTrail
  }

  createLookIntro() {
    this.lookIntroPoints = [
      new THREE.Vector3(0, 70, 0),
      this.lookPoints[0],
    ]
  }

  events() {
    if (!touchEnabled()) {
      window.addEventListener(MOUSE_MOVE, this.handleMouseMove)
    }

    window.addEventListener(SCROLL, this.handleScroll)
  }

  handleMouseMove = e => {
    const { x, y } = e.detail
    this.mouse.x = x
    this.mouse.y = y

    const forceX = this.progressPosition < this.allowRotateThreshold ? this.rotateForceStep1X : this.rotateForceX
    const forceY = this.progressPosition < this.allowRotateThreshold ? this.rotateForceStep1Y : this.rotateForceY

    this.targetRotateX = -(this.mouse.y * 1) * forceX + 180
    this.targetRotateY = this.mouse.x * forceY
  }

  handleScroll = e => {
    const { scrollY, maxHeight } = e.detail
    const progress = scrollY / maxHeight
    this.progressPositionTarget = progress
  }

  startIntro() {
    this.startIntroAnimation = getNow()
    this.introStarted = true
    this.introEnded = false

    this.originLookIntroX = this.lookIntroPoints[0].x
    this.originLookIntroY = this.lookIntroPoints[0].y
    this.originLookIntroZ = this.lookIntroPoints[0].z

    /* eslint-disable-next-line */
    this.targetLookIntro = this.lookIntroPoints[1]
  }

  render(now) {
    if (!this.introEnded && this.introStarted) {
      this.animateIntro(now)
    }

    if (this.introEnded) {
      this.scrollMoveCamera()
    }

    if (this.canMove) {
      this.mouseMoveCamera()
    }
  }

  mouseMoveCamera() {
    if (this.camera.rotation.x !== toRadian(this.targetRotateX)) {
      this.camera.rotation.x += (toRadian(this.targetRotateX) - this.camera.rotation.x) * this.coefRotate
      this.camera.updateProjectionMatrix()
    }
    if (this.camera.rotation.y !== toRadian(this.targetRotateY)) {
      this.camera.rotation.y += (toRadian(this.targetRotateY) - this.camera.rotation.y) * this.coefRotate
      this.camera.updateProjectionMatrix()
    }
  }

  scrollMoveCamera() {
    // move camera
    // add delay to camera movement
    this.progressPosition += (this.progressPositionTarget - this.progressPosition) * this.coefMove
    const currentPos = this.trailPosition.getPoint(this.progressPosition)
    this.cameraBox.position.copy(currentPos)
    const currentLookAt = this.trailLookAt.getPoint(this.progressPosition)

    this.cameraBox.lookAt(new THREE.Vector3(currentLookAt.x, currentLookAt.y, 0))
  }

  animateIntro(now) {
    const percentPosition = (now - this.startIntroAnimation) / this.durationIntroPosition

    if (percentPosition < 1) {
      const progIntro = inOutQuart(percentPosition)
      const currentPos = this.introTrailPosition.getPoint(progIntro)
      this.cameraBox.position.copy(currentPos)

      if (percentPosition > 0.3) {
        this.canMove = true
      }
    } else {
      this.introEnded = true
      // enable scrolling
      document.documentElement.classList.add('scroll')
    }

    let percentLook = (now - this.startIntroAnimation) / this.durationIntroLook
    percentLook = Math.max(percentLook, 0)
    this.progressLookIntroX = this.originLookIntroX + (this.targetLookIntro.x - this.originLookIntroX) * inOutQuart(percentLook)
    this.progressLookIntroY = this.originLookIntroY + (this.targetLookIntro.y - this.originLookIntroY) * inOutQuart(percentLook)
    this.progressLookIntroZ = this.originLookIntroZ + (this.targetLookIntro.z - this.originLookIntroZ) * inOutQuart(percentLook)

    this.cameraBox.lookAt(new THREE.Vector3(this.progressLookIntroX, this.progressLookIntroY, 0))
  }
}

export default new CameraController()
