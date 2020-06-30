const { THREE } = window

// Fill a geometry with points
export function fillWithPoints(geometry, count) {
  var ray = new THREE.Ray()

  var size = new THREE.Vector3()
  geometry.computeBoundingBox()
  let bbox = geometry.boundingBox

  let points = []

  var dir = new THREE.Vector3(1, 1, 1).normalize()
  for (let i = 0; i < count; i++) {
    let p = setRandomVector(bbox.min, bbox.max)
    points.push(p)
  }

  function setRandomVector(min, max) {
    let v = new THREE.Vector3(
      THREE.Math.randFloat(min.x, max.x),
      THREE.Math.randFloat(min.y, max.y),
      THREE.Math.randFloat(min.z, max.z),
    )
    if (!isInside(v)) {
      return setRandomVector(min, max)
    }
    return v
  }

  function isInside(v) {
    ray.set(v, dir)
    let counter = 0

    let pos = geometry.attributes.position
    let faces = pos.count / 3
    let vA = new THREE.Vector3(),
      vB = new THREE.Vector3(),
      vC = new THREE.Vector3()

    for (let i = 0; i < faces; i++) {
      vA.fromBufferAttribute(pos, i * 3 + 0)
      vB.fromBufferAttribute(pos, i * 3 + 1)
      vC.fromBufferAttribute(pos, i * 3 + 2)
      if (ray.intersectTriangle(vA, vB, vC, false, new THREE.Vector3(0, 0, 0))) counter++
    }

    return counter % 2 == 1
  }

  return new THREE.BufferGeometry().setFromPoints(points)
}

// Sort points in a Points() mesh to calculate depth with blending
export function sortPoints(mesh, camera) {
  var vector = new THREE.Vector3()

  // Model View Projection matrix

  var matrix = new THREE.Matrix4()
  matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  matrix.multiply(mesh.matrixWorld)

  //

  var geometry = mesh.geometry

  var index = geometry.getIndex()
  var positions = geometry.getAttribute('position').array
  var length = positions.length / 3

  if (index === null) {
    var array = new Uint16Array(length)

    for (var i = 0; i < length; i++) {
      array[i] = i
    }

    index = new THREE.BufferAttribute(array, 1)

    geometry.setIndex(index)
  }

  var sortArray = []

  for (var i = 0; i < length; i++) {
    vector.fromArray(positions, i * 3)
    vector.applyMatrix4(matrix)

    sortArray.push([vector.z, i])
  }

  function numericalSort(a, b) {
    return b[0] - a[0]
  }

  sortArray.sort(numericalSort)

  var indices = index.array

  for (var i = 0; i < length; i++) {
    indices[i] = sortArray[i][1]
  }

  geometry.index.needsUpdate = true
}

export function getCenterPoint(mesh) {
    var middle = new THREE.Vector3();
    var geometry = mesh.geometry;

    geometry.computeBoundingBox();

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    mesh.localToWorld( middle );
    return middle;
}
