import createCustomEvent from '../utils/createCustomEvent'
import { RAF, START_SCENE, PAUSE_SCENE } from '../constants/index'

class RAFManager {
  constructor() {
    window.addEventListener(START_SCENE, this.start)
    window.addEventListener(PAUSE_SCENE, this.pause)
  }

  handleRAF = now => {
    // now: time in ms
    window.dispatchEvent(createCustomEvent(RAF, { now }))
    this.raf = window.requestAnimationFrame(this.handleRAF)
  }

  start = () => {
    this.handleRAF(0)
  }

  pause = () => {
    window.cancelAnimationFrame(this.raf)
  }
}

export default new RAFManager()
