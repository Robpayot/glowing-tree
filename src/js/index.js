// polyfills
import 'promise-polyfill/src/polyfill'
import 'custom-event-polyfill'

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

  // R.P.
  // Liste des events pour la scene:
  // Il faut importer ces éléments avant:
  // import createCustomEvent from './utils/createCustomEvent'
  // import { START_SCENE, PAUSE_SCENE, GO_TO_NEXT, GO_TO_PREV, GO_TO } from './constants/index'

  // Démarer la scene:
  // window.dispatchEvent(createCustomEvent(START_SCENE))

  // Stopper la scene
  // window.dispatchEvent(createCustomEvent(PAUSE_SCENE))

  // Aller a la section suivante
  // window.dispatchEvent(createCustomEvent(GO_TO_NEXT))

  // Aller a la section précédente
  // window.dispatchEvent(createCustomEvent(GO_TO_PREV))

  // Aller a la section 4
  // window.dispatchEvent(createCustomEvent(GO_TO, { index: 4 }))

})()
