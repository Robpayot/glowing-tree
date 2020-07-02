// Managers
import './managers/RAFManager'
import './managers/ResizeManager'

// Scene
import Scene from './scene/components/index'

(() => {
  // scene
  document.querySelectorAll('[data-scene]').forEach(el => {
    new Scene(el)
  })
})()
