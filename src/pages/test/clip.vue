<template>
  <canvas id="myCanvas"></canvas>
</template>

<script>
export default {
  name: 'clip',
  data() {
    return {
      canvas: null,
    }
  },
  created() {},
  methods: {},
  mounted() {
    this.canvas = new fabric.Canvas('myCanvas', {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#ccc',
    })

    // 裁剪的图形
    // clipPath从对象的中心开始定位，对象originX和originY 不起作用，而是以clipPath的中心为准，所以需要将clipPath的中心移动到对象的中心
    const clipPath = new fabric.Circle({
      radius: 50,
      fill: 'red',
      // originX: 'center',
      // originY: 'center',
    })

    // 被裁剪的图形
    const rect = new fabric.Rect({
      left: this.canvas.width / 2,
      top: this.canvas.height / 2,
      fill: 'blue',
      width: 100,
      height: 100,
      originX: 'center',
      originY: 'center',
      clipPath,
    })

    // this.canvas.add(rect)

    // 用文字来显示裁剪的区域
    const text = new fabric.Text('clipPath', {
      originX: 'center',
      originY: 'center',
      fontSize: 50,
      left: this.canvas.width / 2,
      top: this.canvas.height / 2,
    })

    const group = new fabric.Group(
      [
        new fabric.Rect({ width: 100, height: 100, fill: 'red' }), //
        new fabric.Rect({ width: 100, height: 100, fill: 'blue', left: 100 }),
        new fabric.Rect({ width: 100, height: 100, fill: 'green', top: 100 }),
        new fabric.Rect({ width: 100, height: 100, fill: 'yellow', left: 100, top: 100 }),
      ],
      {
        left: this.canvas.width / 2,
        top: this.canvas.height / 2,
        originX: 'center',
        originY: 'center',
      }
    )
    // this.canvas.clipPath = text
    // this.canvas.add(group)
    // this.canvas.controlsAboveOverlay = true // 控制点在裁剪区域上面

    const clipPath1 = new fabric.Rect({ width: this.canvas.width, height: this.canvas.height / 2, top: 0, left: 0, absolutePositioned: true })
    const clipPath2 = new fabric.Rect({ width: this.canvas.width, height: this.canvas.height / 2, top: this.canvas.height / 2, left: 0, absolutePositioned: true })

    // clipPath1.inverted = true

    fabric.Image.fromURL('http://fabricjs.com/assets/dragon.jpg', (img) => {
      img.clipPath = clipPath1
      img.scaleToWidth(this.canvas.width)
      this.canvas.add(img)
    })

    fabric.Image.fromURL('http://fabricjs.com/assets/dragon2.jpg', (img) => {
      img.clipPath = clipPath2
      img.scaleToWidth(this.canvas.width)
      // 设置img的原点在左下角
      img.top = this.canvas.height / 2
      this.canvas.add(img)
      // console.log(this.canvas.toJSON())
      // console.log(JSON.stringify(this.canvas))
      // console.log(this.canvas.toObject())
    })
    console.log(this.canvas.toDataURL('png'))
    this.canvas.requestRenderAll()

    const str =
      '{"version":"4.6.0","objects":[{"type":"rect","version":"4.6.0","originX":"left","originY":"top","left":50,"top":50,"width":20,"height":20,"fill":"green","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"rx":0,"ry":0},{"type":"circle","version":"4.6.0","originX":"left","originY":"top","left":80,"top":80,"width":80,"height":80,"fill":"red","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"radius":40,"startAngle":0,"endAngle":6.283185307179586}],"background":"#ddd"}'
    this.canvas.loadFromJSON(str)
  },
  beforeRouteLeave(to, from, next) {
    // 从当前页面离开时，清除画布
    this.canvas.dispose()
    next()
  },
}
</script>

<style lang="scss" scoped>
#myCanvas {
  width: 100vw;
  height: 100vh;
}
</style>
