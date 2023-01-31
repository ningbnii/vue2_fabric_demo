<template>
  <div>
    <canvas id="myCanvas"></canvas>
    <div class="control">
      <van-button type="primary" @click="changeDrawingMode">绘画模式</van-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'drawing',
  data() {
    return {
      canvas: null,
    }
  },
  created() {},
  methods: {
    changeDrawingMode() {
      this.canvas.isDrawingMode = !this.canvas.isDrawingMode
    },
  },
  mounted() {
    this.canvas = new fabric.Canvas('myCanvas', {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#ccc',
      // 开启绘图模式
      isDrawingMode: true,
    })

    // 设置绘图模式下的画笔颜色
    this.canvas.freeDrawingBrush.color = 'red'
    // 设置绘图模式下的画笔粗细
    this.canvas.freeDrawingBrush.width = 5
    // 设置绘图模式下的画笔样式
    this.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: 5,
      offsetX: 10,
      offsetY: 10,
      affectStroke: true,
      color: 'rgba(0,0,0,0.2)',
    })

    // 监听鼠标滚轮事件，缩放画布
    this.canvas.on('mouse:wheel', (opt) => {
      let delta = opt.e.deltaY // 滚轮向上滚一下，deltaY为-100，向下滚一下，deltaY为100
      let zoom = this.canvas.getZoom() // 获取画布当前缩放值
      // this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom + delta / 200)
      // opt.e.preventDefault()
      // opt.e.stopPropagation()
      // 控制缩放值的范围在0.1-20之间
      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.1) zoom = 0.1
      // 以鼠标所在位置为中心点进行缩放
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
      // 以画布原点进行缩放
      // this.canvas.setZoom(zoom)
    })

    // this.canvas.on('mouse:down', (opt) => {
    //   let evt = opt.e
    //   if (evt.altKey === true) {
    //     this.canvas.isDragging = true
    //     this.canvas.isDrawingMode = false
    //     this.canvas.lastPosX = evt.clientX
    //     this.canvas.lastPosY = evt.clientY
    //   }
    // })

    // this.canvas.on('mouse:move', (opt) => {
    //   if (this.canvas.isDragging) {
    //     let e = opt.e
    //     let vpt = this.canvas.viewportTransform
    //     vpt[4] += e.clientX - this.canvas.lastPosX
    //     vpt[5] += e.clientY - this.canvas.lastPosY
    //     this.canvas.requestRenderAll()
    //     this.canvas.lastPosX = e.clientX
    //     this.canvas.lastPosY = e.clientY
    //   }
    // })

    // this.canvas.on('mouse:up', (opt) => {
    //   // on mouse up we want to recalculate new interaction
    //   // for all objects, so we call setViewportTransform
    //   this.canvas.setViewportTransform(this.canvas.viewportTransform)
    //   this.canvas.isDragging = false
    //   this.canvas.isDrawingMode = true
    // })
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
.control {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}
</style>
