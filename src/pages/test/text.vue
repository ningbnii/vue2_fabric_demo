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
      fill: 'orange',
      fontSize: 60,
      backgroundColor: 'green',
      stroke: '#f6416c',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      shadow: '10px 20px 6px rgba(10, 20, 30, 0.4)',
      transparentCorners: false,
      borderColor: '#16f1fc',
      borderScaleFactor: 5,
      borderDashArray: [5, 5],
      cornerColor: '#16f1fc',
      cornerStrokeColor: 'pink',
      cornerStyle: 'rect',
      cornerSize: 20,
      cornerDashArray: [5, 5],
      selectionBackgroundColor: 'rgba(0,0,0,0.3)',
      padding: 40,
      borderOpacityWhenMoving: 0.5,
      // 下划线
      underline: true,
      // 删除线
      linethrough: true,
      // 上划线
      overline: true,
      // 文字加粗
      fontWeight: 'bold',
      // 文字倾斜
      fontStyle: 'italic',
      // 文字倾斜角度
      // angle: 30,
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
      // 左对齐
      textAlign: 'center',
      // 行距
      lineHeight: 1.5,
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
