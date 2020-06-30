export function getAncestor(el, className) {

  while ((el = el.parentElement) && !el.classList.contains(className));

  return el
}

export function getIndex(el) {

  return Array.from(el.parentNode.children).indexOf(el)
}

export function isWebGL() {
  // On crée un élément canvas. Le canvas n'est pas
  // ajouté au document et il n'est donc jamais
  // affiché dans la fenêtre du navigateur
  let canvas = document.createElement('canvas')

  // On récupère le contexte WebGLRenderingContext
  // depuis l'élément canvas.
  let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

  // On affiche le résultat.
  if (gl && gl instanceof WebGLRenderingContext) return true
  else return false

}

export function isTouch() {

  return 'ontouchstart' in window || navigator.maxTouchPoints
}

export function getOffsetTop(elem) { // issues on ie11

  if (!elem) {
    return 0
  }

  const bounds = elem.getBoundingClientRect()
  const bodyTop = document.documentElement && document.documentElement.scrollTop || document.body.scrollTop

  return bounds.top + bodyTop
}

export function getOffsetLeft(elem) { // issues on ie11

  if (!elem) {
    return 0
  }

  const bounds = elem.getBoundingClientRect()
  // const bodyTop = document.documentElement && document.documentElement.scrollTop || document.body.scrollTop

  return bounds.left
}

export function browser() {
  let ua = navigator.userAgent,
    tem,
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || []
    return `IE ${(tem[1] || '')}`
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/)
    if (tem !== null) return tem.slice(1).join(' ').replace('OPR', 'Opera')
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?']
  tem = ua.match(/version\/(\d+)/i)
  if (tem !== null) M.splice(1, 1, tem[1])
  return M.join(' ')
}
