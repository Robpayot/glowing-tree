const bloom = true

export const DEBUG = false
export const BLOOM = bloom
// events
export const RAF = 'RAF'
export const WINDOW_RESIZE = 'WINDOW_RESIZE'
export const MOUSE_MOVE = 'MOUSE_MOVE'
export const GO_TO_NEXT = 'GO_TO_NEXT'
export const GO_TO_PREV = 'GO_TO_PREV'
export const GO_TO = 'GO_TO'
export const PAUSE_SCENE = 'PAUSE_SCENE'
export const START_SCENE = 'START_SCENE'
export const SCROLL = 'SCROLL'

let colors

if (bloom) {
  colors = {
    tree: 0x20202,
    particles: 0xa5423,
    lines: 0x557258,
    lines2: 0x183a08,
    lines3: 0x1A7D63,
    lines4: 0x1A7D2B,
  }
} else {
  colors = {
    tree: 0x35af99,
    particles: 0x368739,
    lines: 0x557258,
    lines2: 0x183a08,
    lines3: 0x1A7D63,
    lines4: 0x1A7D2B,
  }
}


export const COLORS = colors
