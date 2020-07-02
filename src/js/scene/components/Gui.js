import * as dat from 'dat.gui'

class Gui extends dat.GUI {
  constructor() {
    super()

    this.controller = {}
    this.lineController = {}
  }
}

export default new Gui()
