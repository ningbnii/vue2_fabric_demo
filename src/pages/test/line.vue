<template>
  <canvas id="myCanvas"></canvas>
</template>

<script>
export default {
  name: 'line',
  data() {
    return {
      canvas: null,
    }
  },
  created() {},
  methods: {},
  mounted() {
    console.log(window.devicePixelRatio)
    this.canvas = new fabric.Canvas('myCanvas', {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#ccc',
      devicePixelRatio: window.devicePixelRatio,
    })
    console.log(this.canvas.width)
    const line = new fabric.Line([100, 100, 200, 200], {
      fill: 'red',
      stroke: 'red',
      strokeWidth: 5,
    })
    this.canvas.add(line)
    // 绕着中心点不停旋转
    // setInterval(() => {
    //   line.set({
    //     angle: line.get('angle') + 1,
    //   })
    //   this.canvas.renderAll()
    // }, 1000 / 60)
    line.animate('angle', '+=360', {
      duration: 1000,
      onChange: this.canvas.renderAll.bind(this.canvas),
      easing: fabric.util.ease.easeOutBounce,
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
