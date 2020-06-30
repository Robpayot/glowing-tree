import '../scene/vendor/three/GLTFLoader'
import '../scene/vendor/three/DRACOLoader'
import FBXLoader from '../scene/vendor/three/ThreeFBXLoader'

const { THREE } = window

class LoaderManager {
  constructor() {
    this.subjects = {}

    this.textureLoader = new THREE.TextureLoader()
    this.cubeTextureLoader = new THREE.CubeTextureLoader()
    this.FBXLoader = new FBXLoader()
    this.GLTFLoader = new THREE.GLTFLoader()
    this.DRACOLoader = new THREE.DRACOLoader()
  }

  load = (objects, callback) => {
    const promises = []
    for (let i = 0; i < objects.length; i++) {
      const { name, fbx, gltf, texture, img, cubeTexture } = objects[i]

      this.subjects[name] = {}

      if (fbx) {
        promises.push(this.loadFBX(fbx, name))
      }

      if (gltf) {
        promises.push(this.loadGLTF(gltf, name))
      }

      if (texture) {
        promises.push(this.loadTexture(texture, name))
      }

      if (cubeTexture) {
        promises.push(this.loadCubeTexture(cubeTexture, name))
      }

      if (img) {
        promises.push(this.loadImage(img, name))
      }
    }

    Promise.all(promises).then(callback)
  }

  loadFBX(url, name) {
    return new Promise(resolve => {
      this.FBXLoader.load(url, result => {
        this.subjects[name].fbx = result
        resolve(result)
      }, undefined, e => {
        console.log(e)
      })
    })
  }

  loadGLTF(url, name) {
    return new Promise(resolve => {
      this.DRACOLoader.setDecoderPath('../scene/vendor/three/draco/')
      this.GLTFLoader.setDRACOLoader(this.DRACOLoader)

      this.GLTFLoader.load(url, result => {
        this.subjects[name].gltf = result
        resolve(result)
      }, undefined, e => {
        console.log(e)
      })
    })
  }

  loadTexture(url, name) {
    return new Promise(resolve => {
      this.textureLoader.load(url, result => {
        this.subjects[name].texture = result
        resolve(result)
      })
    })
  }

  loadCubeTexture(path, name) {
    this.cubeTextureLoader.setPath(path)

    return new Promise(resolve => {
      this.cubeTextureLoader.load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'], result => {
        this.subjects[name].cubeTexture = result
        resolve(result)
      })
    })
  }

  loadImage(url, name) {
    return new Promise(resolve => {
      const image = new Image()

      image.onload = () => {
        this.subjects[name].img = image
        resolve(image)
      };

      image.src = url
    })
  }
}

export default new LoaderManager()
