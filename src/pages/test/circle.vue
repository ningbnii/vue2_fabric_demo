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
    this.canvas = new fabric.Canvas('myCanvas', {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#ccc',
    })
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      fill: 'red',
      radius: 20,
    })
    this.canvas.add(circle)
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
