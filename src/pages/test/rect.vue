<template>
  <canvas id="myCanvas"></canvas>
</template>

<script>
export default {
  name: 'rect',
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
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'red',
      width: 200,
      height: 200,
      rx: 20,
      ry: 20,
    })
    this.canvas.add(rect)
    // 向右移动100px，旋转45度
    rect.animate('left', '+=100', {
      onChange: this.canvas.renderAll.bind(this.canvas),
      duration: 1000,
      easing: fabric.util.ease.easeOutBounce,
    })
    rect.animate('angle', '+=45', {
      onChange: this.canvas.renderAll.bind(this.canvas),
      duration: 1000,
      easing: fabric.util.ease.easeOutBounce,
      onComplete: () => {
        // 回到原点
        rect.set({
          left: 100,
          top: 100,
          angle: 0,
        })
        this.canvas.renderAll()
      },
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
