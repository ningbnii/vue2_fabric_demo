<template>
  <canvas id="myCanvas"></canvas>
</template>

<script>
export default {
  name: 'circle',
  data() {
    return {
      canvas: null,
    }
  },
  created() {},
  methods: {},
  mounted() {
    let s = this
    this.canvas = new fabric.Canvas('myCanvas', {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#ccc',
      selection: false, // 不允许框选
    })
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      fill: 'red',
      // backgroundColor: 'green',
      radius: 100,
      stroke: 'blue',
      strokeWidth: 5,
      strokeDashArray: [5, 5, 14], // 虚线: [实线长度, 空白长度, 实线长度, 空白长度, ...]
      shadow: 'rgba(0,0,0,0.3) 5px 5px 5px',
      transparentCorners: false, // 设置为false，可以显示四个角的控制点
      borderColor: '#16f1fc', // 设置边框的颜色
      cornerColor: '#16f1fc', // 设置控制点的颜色
      cornerStrokeColor: 'pink', // 设置控制点的边框颜色
      cornerStyle: 'rect', // 设置控制点的样式, rect: 方形, circle: 圆形,  默认是rect
      cornerSize: 20, // 设置控制点的大小
      cornerDashArray: [5, 5], // 设置控制点的虚线
      borderScaleFactor: 5, // 设置边框的宽度
      selectionBackgroundColor: 'rgba(0,0,0,0.3)', // 设置选中时的背景色
      padding: 40, // 设置选中时的padding
      borderOpacityWhenMoving: 0.6, // 设置选中时的边框透明度
    })
    this.canvas.add(circle)

    circle.hasBorders = false // 设置为false，可以隐藏四个边的边框
    circle.hasControls = false // 设置为false，可以隐藏四个角的控制点

    function animate(e, dir) {
      if (e.target) {
        fabric.util.animate({
          startValue: e.target.get('angle'),
          endValue: e.target.get('angle') + (dir ? 10 : -10),
          duration: 100,
          onChange: function (value) {
            e.target.set('angle', value)
            s.canvas.renderAll()
          },
        })
        fabric.util.animate({
          startValue: e.target.get('scaleX'),
          endValue: e.target.get('scaleX') + (dir ? 0.2 : -0.2),
          duration: 100,
          onChange: function (value) {
            e.target.scale(value)
            s.canvas.renderAll()
          },
          onComplete: function () {
            e.target.setCoords()
          },
        })
      }
    }

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'red',
      // backgroundColor: 'green',
      width: 100,
      height: 100,
      stroke: 'blue',
      strokeWidth: 5,
      strokeDashArray: [5, 5, 14], // 虚线: [实线长度, 空白长度, 实线长度, 空白长度, ...]
      shadow: 'rgba(0,0,0,0.3) 5px 5px 5px',
      transparentCorners: false, // 设置为false，可以显示四个角的控制点
      borderColor: '#16f1fc', // 设置边框的颜色
      cornerColor: '#16f1fc', // 设置控制点的颜色
      cornerStrokeColor: 'pink', // 设置控制点的边框颜色
      cornerStyle: 'rect', // 设置控制点的样式, rect: 方形, circle: 圆形,  默认是rect
      cornerSize: 20, // 设置控制点的大小
      cornerDashArray: [5, 5], // 设置控制点的虚线
      borderScaleFactor: 5, // 设置边框的宽度
      selectionBackgroundColor: 'rgba(0,0,0,0.3)', // 设置选中时的背景色
      padding: 40, // 设置选中时的padding
      borderOpacityWhenMoving: 0.6, // 设置选中时的边框透明度
    })
    this.canvas.add(rect)

    this.canvas.on('mouse:down', (e) => {
      animate(e, 1)
    })
    this.canvas.on('mouse:up', (e) => {
      animate(e, 0)
    })
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
