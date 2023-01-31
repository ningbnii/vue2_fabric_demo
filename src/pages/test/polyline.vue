<template>
  <canvas id="myCanvas"></canvas>
</template>

<script>
export default {
  name: 'polyline',
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
      devicePixelRatio: window.devicePixelRatio,
    })

    const polyline = new fabric.Polyline(
      [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 },
        // { x: 100, y: 100 },
      ],
      {
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: 'blue',
        strokeWidth: 5,
        strokeLineJoin: 'round',
        strokeLineCap: 'round',
        strokeDashArray: [2, 10], // 第一个参数是实线长度，第二个参数是空白长度
        selectable: false,
      }
    )

    this.canvas.add(polyline)
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
