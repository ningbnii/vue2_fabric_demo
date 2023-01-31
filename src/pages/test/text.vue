<template>
  <canvas id="myCanvas"></canvas>
</template>

<script>
export default {
  name: 'text',
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

    const text = new fabric.Text('Hello world', {
      left: 100,
      top: 100,
      fill: 'red',
      fontSize: 40,
    })

    this.canvas.add(text)

    const itext = new fabric.IText('Hello world', {
      left: 100,
      top: 200,
      fill: 'red',
      fontSize: 40,
    })

    this.canvas.add(itext)

    const textbox = new fabric.Textbox('Hello world', {
      left: 100,
      top: 300,
      fill: 'red',
      fontSize: 40,
    })

    this.canvas.add(textbox)
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
