import { getNow } from '~utils/time'
import { toRadian } from '~utils/math'
import { inOutQuart } from '~utils/ease'
import { DEBUG, MOUSE_MOVE, GO_TO_PREV, GO_TO_NEXT, GO_TO, SCROLL } from '~constants/index'
import LoaderManager from '~managers/LoaderManager'
import createCustomEvent from '~utils/createCustomEvent'
import touchEnabled from '~utils/touchEnabled'

const { THREE } = window

class CameraController {
  constructor() {
    this.progressPosition = 0
    this.progressLookX = 0
    this.progressLookY = 0
    this.progressLookZ = 0

    this.progressLookIntroX = 0
    this.progressLookIntroY = 0
    this.progressLookIntroZ = 0

    this.index = 0
    this.lastIndex = 0
    this.animStarted = false
    this.mouse = {
      x: 0,
      y: 0,
    }
    this.rotateForceX = 3.5
    this.rotateForceY = 3.5
    this.rotateForceStep1X = 2
    this.rotateForceStep1Y = 3
    this.coefRotate = 0.035
    this.allowRotateThreshold = 0.08
    this.targetRotateX = 180
    this.targetRotateY = 0

    // Intro
    this.durationIntroPosition = 8000
    this.durationIntroLook = 8000
  }

  init(camera, scene) {
    console.log('init')
    this.cameraBox = new THREE.Object3D()
    this.camera = camera

    this.scene = scene
    this.initGui()

    this.scene.add(this.camera)


    const { gltf } = LoaderManager.subjects.scene
    const cameraPoints = gltf.scene.getObjectByName('CamerasPoints')

    this.trailPosition = this.createTrail(cameraPoints)
    this.createLookAt()
    this.createSteps()

    this.introTrailPosition = this.createIntroTrail()
    this.createLookIntro()

    const currentPos = this.trailPosition.getPoint(0)
    this.cameraBox.position.copy(currentPos)

    this.ui = {
      prev: document.querySelector('.scene__cta--prev'),
      next: document.querySelector('.scene__cta--next'),
      select: document.querySelector('.scene__cta--select'),
    }

    this.camera.rotation.x = toRadian(180) // fix cameraBox


    const g = new THREE.SphereGeometry(5, 32, 32)
    const m = new THREE.MeshBasicMaterial({color: 0x0000ff})
    this.spotlightTarget = new THREE.Mesh(g, m)
    this.spotlightTarget.visible = false
    this.spotlightTarget.position.z = -100

    this.camera.add(this.spotlightTarget)

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

      // setTimeout(() => {
      this.startIntro()
      // }, 0)
    }
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
        // position.x *= 115
        // position.y *= 115
        // position.z *= 115
        points.push(position)
        children[i].material = debugMaterial
      }
    }

    // for debug
    // reverse arrays so curve is starting from the rigth direction
    points.reverse()

    // create trail for camera
    const curveWithMorePoints = new THREE.CatmullRomCurve3(points).getPoints(200)
    const finalTrail = new THREE.CatmullRomCurve3(curveWithMorePoints)
    // For devug
    // this.trail.curveType = 'catmullrom'
    // this.trail.tension = 0.99
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

    for (let i = 0; i < this.lookPoints.length; i++) {
      const cGeometry = new THREE.SphereGeometry(5, 32, 32)

      let cMaterial2
      if (i === 0) {
        cMaterial2 = new THREE.MeshBasicMaterial({ color: 0xffffff }) // 0
      } else if (i === 1) {
        cMaterial2 = new THREE.MeshBasicMaterial({ color: 0xff0000 }) // 1
      } else if (i === 2) {
        cMaterial2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // 2
      } else if (i === 3) {
        cMaterial2 = new THREE.MeshBasicMaterial({ color: 0x0000ff }) // 3
      } else if (i === 4) {
        cMaterial2 = new THREE.MeshBasicMaterial({ color: 0xff00ff }) // 4
      } else if (i === 5) {
        cMaterial2 = new THREE.MeshBasicMaterial({ color: 0x00ffff }) // 4
      } else if (i === 6) {
        cMaterial2 = new THREE.MeshBasicMaterial({ color: 0x000000 }) // 4
      }
      const mesh = new THREE.Mesh(cGeometry, cMaterial2)
      mesh.position.copy(this.lookPoints[i])
      // this.scene.add(mesh)
      this.pMesh = mesh
    }

    this.progressPosition = 0
    this.progressLookX = this.lookPoints[1].x
    this.progressLookY = this.lookPoints[1].y
    this.progressLookZ = this.lookPoints[1].z
  }

  createSteps() {
    this.steps = [
      {
        targetLook: this.lookPoints[0],
        targetPosition: 0.03,
      },
      {
        targetLook: this.lookPoints[1],
        targetPosition: 0.136,
      },
      {
        targetLook: this.lookPoints[2],
        targetPosition: 0.313,
      },
      {
        targetLook: this.lookPoints[3],
        targetPosition: 0.507,
      },
      {
        targetLook: this.lookPoints[4],
        targetPosition: 0.600,
      },
      {
        targetLook: this.lookPoints[5],
        targetPosition: 0.838,
      },
      {
        targetLook: this.lookPoints[6],
        targetPosition: 1,
      },
    ]
  }

  createIntroTrail() {
    // set all geometries
    // Filter meshes
    const points = [
      new THREE.Vector3(0, 70, 500),
      this.trailPosition.getPoint(this.steps[0].targetPosition),
    ]

    // create trail for camera
    const curveWithMorePoints = new THREE.CatmullRomCurve3(points).getPoints(200)
    const finalTrail = new THREE.CatmullRomCurve3(curveWithMorePoints)
    finalTrail.curveType = 'catmullrom'
    finalTrail.tension = 0.3

    // for debug
    // const curveGeometry = new THREE.Geometry().setFromPoints(curveWithMorePoints)

    // Build the geometry
    // const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
    // // Create the final object to add to the scene
    // const curveObject = new THREE.Line(curveGeometry, material)

    // this.scene.add(curveObject)

    return finalTrail
  }

  createLookIntro() {
    this.lookIntroPoints = [
      new THREE.Vector3(0, 70, 0),
      this.lookPoints[0],
    ]
  }

  initGui() {
    // this.guiController = { position: 0, look: 500 }

    // GUI.add(this.guiController, 'position', 0, 1000).onChange(this.guiChange)
    // GUI.add(this.guiController, 'look', -800, 800).onChange(this.guiChange)

    const cGeometry = new THREE.SphereGeometry(5, 32, 32)
    const cMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff })
    this.sphereHelperPosition = new THREE.Mesh(cGeometry, cMaterial)
    // this.scene.add(this.sphereHelperPosition)
  }

  events() {
    if (!touchEnabled()) {
      window.addEventListener(MOUSE_MOVE, this.handleMouseMove)
    }

    window.addEventListener(SCROLL, this.handleScroll)

    window.addEventListener(GO_TO_PREV, this.goToPrev)
    window.addEventListener(GO_TO_NEXT, this.goToNext)
    window.addEventListener(GO_TO, this.goTo)

    this.ui.prev.addEventListener('click', () => {
      window.dispatchEvent(createCustomEvent(GO_TO_PREV))
    })
    this.ui.next.addEventListener('click', () => {
      window.dispatchEvent(createCustomEvent(GO_TO_NEXT))
    })
    this.ui.select.addEventListener('change', e => {
      const index = parseInt(e.currentTarget.value, 10) - 1 // if 1 == 0 (first one) etc...
      window.dispatchEvent(createCustomEvent(GO_TO, { index }))
    })
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
    // console.log(progress)
    const currentPos = this.trailPosition.getPoint(progress)
    this.cameraBox.position.copy(currentPos)

    let lookAt = this.steps[0].targetLook
    for (let i = 0; i < this.steps.length; i++) {
      const prevStep = this.steps[i - 1]
      const step = this.steps[i]
      if (prevStep && progress > prevStep.targetPosition && progress < step.targetPosition) {
        lookAt = this.steps[i].targetLook
      }
    }
    this.originLookX = lookAt.x
    this.originLookY = lookAt.y
    this.originLookZ = lookAt.z

    this.cameraBox.lookAt(new THREE.Vector3(this.originLookX, this.originLookY, 0))
  }

  goToPrev = () => {
    if (this.index - 1 >= 0) {
      this.goTo({
        detail: {
          index: this.index - 1,
          sibling: true,
        },
      })
    }
  }

  goToNext = () => {
    if (this.index + 1 <= this.steps.length - 1) {
      this.goTo({
        detail: {
          index: this.index + 1,
          sibling: true,
        },
      })
    }
  }

  goTo = e => {
    const { index, sibling } = e.detail
    let originIndex = this.lastIndex
    if (sibling) {
      if (this.animStarted) return // prevent skipping a section
      // Get direction
      // Skip directly from the index but just before or after depending of the position. (the previous state)
    } else if (this.lastIndex < index) {
      originIndex = index - 1
    } else if (this.lastIndex > index) {
      originIndex = index + 1
    } else {
      return
    }

    const { targetPosition, targetLook } = this.steps[originIndex]
    this.originPosition = targetPosition
    this.originLookX = targetLook.x
    this.originLookY = targetLook.y
    this.originLookZ = targetLook.z

    if (!sibling) {
      // skip to previous state
      const currentPos = this.trailPosition.getPoint(this.originPosition)
      this.cameraBox.position.copy(currentPos)
      this.cameraBox.lookAt(new THREE.Vector3(this.originLookX, this.originLookY, 0))
    }

    this.start(index)
  }

  start(index) {
    // improve that
    if (this.lastIndex === 0 && index === 1) {
      this.durationPosition = 5500
      this.durationLook = 5500
    } else {
      this.durationPosition = 4500
      this.durationLook = 4500
    }

    this.index = index
    this.targetLook = this.steps[index].targetLook
    this.targetPosition = this.steps[index].targetPosition
    this.startAnimation = getNow()
    this.lastIndex = index
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
    } else if (this.startAnimation) {
      this.animateOnPath(now)
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

  animateOnPath(now) {
    let percentPosition = (now - this.startAnimation) / this.durationPosition
    percentPosition = Math.max(percentPosition, 0)

    if (percentPosition < 1) {
      this.progressPosition =
        this.originPosition + (this.targetPosition - this.originPosition) * inOutQuart(percentPosition)
    }
    const currentPos = this.trailPosition.getPoint(this.progressPosition)
    this.cameraBox.position.copy(currentPos)

    let percentLook = (now - this.startAnimation) / this.durationLook
    percentLook = Math.max(percentLook, 0)

    if (percentLook < 1) {
      this.animStarted = true
      this.progressLookX = this.originLookX + (this.targetLook.x - this.originLookX) * inOutQuart(percentLook)
      this.progressLookY = this.originLookY + (this.targetLook.y - this.originLookY) * inOutQuart(percentLook)
      this.progressLookZ = this.originLookZ + (this.targetLook.z - this.originLookZ) * inOutQuart(percentLook)
      // console.log(this.progressLookX, this.progressLookY, this.progressLookZ)

      this.cameraBox.lookAt(new THREE.Vector3(this.progressLookX, this.progressLookY, 0))
    } else {
      this.animStarted = false
    }
  }

  animateIntro(now) {
    const percentPosition = (now - this.startIntroAnimation) / this.durationIntroPosition

    if (percentPosition < 1) {
      const progIntro = inOutQuart(percentPosition)
      const currentPos = this.introTrailPosition.getPoint(progIntro)
      this.cameraBox.position.copy(currentPos)
      // console.log(currentPos)

      if (percentPosition > 0.3) {
        this.canMove = true
      }
    } else {
      this.introEnded = true
    }

    let percentLook = (now - this.startIntroAnimation) / this.durationIntroLook
    percentLook = Math.max(percentLook, 0)
    this.progressLookIntroX = this.originLookIntroX + (this.targetLookIntro.x - this.originLookIntroX) * inOutQuart(percentLook)
    this.progressLookIntroY = this.originLookIntroY + (this.targetLookIntro.y - this.originLookIntroY) * inOutQuart(percentLook)
    this.progressLookIntroZ = this.originLookIntroZ + (this.targetLookIntro.z - this.originLookIntroZ) * inOutQuart(percentLook)

    this.cameraBox.lookAt(new THREE.Vector3(this.progressLookIntroX, this.progressLookIntroY, 0))
  }

  guiChange = () => {
    const currentPos = this.trailPosition.getPoint(this.guiController.position / 1000)
    this.sphereHelperPosition.position.copy(currentPos)
    // this.pMesh.position.y = this.guiController.look
    // this.cameraBox.lookAt(new THREE.Vector3(0, this.guiController.look, 0))

    // const currentLook = this.trailLook.getPoint(this.guiController.look / 1000)
    // this.sphereHelperLook.position.copy(currentLook)
  }
}

export default new CameraController()
