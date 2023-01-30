export default {
  distanceBetween2Points(point1, point2) {
    var dx = point2.x - point1.x
    var dy = point2.y - point1.y
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
  },

  angleBetween2Points(point1, point2) {
    var dx = point2.x - point1.x
    var dy = point2.y - point1.y
    return Math.atan2(dx, dy)
  },

  getControlPoints(point1, point2, point3) {
    let len1 = this.distanceBetween2Points(point1, point2)
    let len2 = this.distanceBetween2Points(point2, point3)
    let k = len1 / len2
    let controlPoint1 = {
      x: (k * (point1.x - point3.x)) / (2 * (1 + k)) + point2.x,
      y: (k * (point1.y - point3.y)) / (2 * (1 + k)) + point2.y,
    }
    let controlPoint2 = {
      x: (k * (point3.x - point1.x)) / (2 * (1 + k)) + point2.x,
      y: (k * (point3.y - point1.y)) / (2 * (1 + k)) + point2.y,
    }
    return [controlPoint1, controlPoint2]
  },
}
