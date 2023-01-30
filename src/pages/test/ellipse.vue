<template>
  <canvas id="myCanvas"></canvas>
</template>

<script>
export default {
  name: 'ellipse',
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
    const ellipse = new fabric.Ellipse({
      left: 100,
      top: 100,
      fill: 'red',
      rx: 50,
      ry: 20,
    })
    this.canvas.add(ellipse)
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
