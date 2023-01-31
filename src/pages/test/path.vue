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

    // M: move to
    // L: line to
    // Z: close path
    const path = new fabric.Path('M 0 0 L 200 100 L 170 200 z', {
      left: 100,
      top: 100,
      fill: 'red',
      opacity: 0.5,
      stroke: 'blue',
      strokeWidth: 5,
    })
    this.canvas.add(path)
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
