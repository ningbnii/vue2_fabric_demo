<template>
  <canvas id="myCanvas"></canvas>
</template>

<script>
export default {
  name: 'gradient',
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
      width: 100,
      height: 100,
    })

    const gradient = new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'pixels',
      coords: {
        x1: 0,
        y1: 0,
        x2: rect.width,
        y2: 0,
      },
      colorStops: [
        { offset: 0, color: 'red' },
        { offset: 0.2, color: 'orange' },
        { offset: 0.4, color: 'yellow' },
        { offset: 0.6, color: 'green' },
        { offset: 0.8, color: 'blue' },
        { offset: 1, color: 'purple' },
      ],
    })
    rect.set('fill', gradient)

    this.canvas.add(rect)

    const circle = new fabric.Circle({
      left: 100,
      top: 300,
      radius: 50,
      // fill: gradient,
    })
    // 创建径向渐变
    const gradient2 = new fabric.Gradient({
      type: 'radial',
      gradientUnits: 'pixels',
      coords: {
        r1: 50,
        r2: 0,
        x1: 60, // 与圆心的距离
        y1: 10, // 与圆心的距离
        x2: circle.radius, // 中心点
        y2: circle.radius, // 中心点
      },
      colorStops: [
        { offset: 0, color: 'red' },
        { offset: 0.2, color: 'orange' },
        { offset: 0.4, color: 'yellow' },
        { offset: 0.6, color: 'green' },
        { offset: 0.8, color: 'blue' },
        { offset: 1, color: 'purple' },
      ],
    })
    circle.set('fill', gradient2)
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
