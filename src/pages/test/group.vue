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
      left: this.canvas.width / 2,
      top: this.canvas.height / 2,
      fill: 'red',
      rx: 200,
      ry: 50,
      originX: 'center',
      originY: 'center',
    })

    const text = new fabric.Text('Hello World', {
      left: this.canvas.width / 2,
      top: this.canvas.height / 2,
      fill: 'blue',
      fontSize: 20,
      originX: 'center',
      originY: 'center',
    })

    const group = new fabric.Group([ellipse, text], {
      left: this.canvas.width / 2,
      top: this.canvas.height / 2,
      originX: 'center',
      originY: 'center',
    })
    console.log(group.getObjects())
    console.log(group.size())
    console.log(group.contains(ellipse))
    console.log(group)
    group.item(0).set('fill', 'green')
    group.item(1).set({
      fill: 'yellow',
      fontSize: 30,
    })

    this.canvas.add(group)

    // 打散分组
    // 点击group，group会被选中，此时点击group中的任意一个对象，group会被打散
    group.on('mousedown', (e) => {
      e.target.toActiveSelection()
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
