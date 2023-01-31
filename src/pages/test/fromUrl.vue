<template>
  <canvas id="myCanvas"></canvas>
</template>

<script>
import jailCellBars from '@/assets/img/jail_cell_bars.png'

export default {
  name: 'fromUrl',
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
    // fabric.Image.fromURL('https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27d1b4e5f8824198b6d51a2b1c2d0d75~tplv-k3u1fbpfcp-zoom-crop-mark:400:400:400:400.awebp', (img) => {
    //   img.scaleToWidth(this.canvas.width)
    //   // img.scaleToHeight(this.canvas.height)
    //   this.canvas.add(img)
    // })
    // 填充背景图
    // fabric.Image.fromURL('https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27d1b4e5f8824198b6d51a2b1c2d0d75~tplv-k3u1fbpfcp-zoom-crop-mark:400:400:400:400.awebp', (img) => {
    //   this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas), {
    //     scaleX: this.canvas.width / img.width,
    //     scaleY: this.canvas.height / img.height,
    //   })
    // })

    // 重复背景图
    // fabric.Image.fromURL('https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27d1b4e5f8824198b6d51a2b1c2d0d75~tplv-k3u1fbpfcp-zoom-crop-mark:40:40:40:40.awebp', (img) => {
    //   this.canvas.setBackgroundColor(
    //     new fabric.Pattern({
    //       source: img.getElement(),
    //       repeat: 'repeat',
    //     }),
    //     this.canvas.renderAll.bind(this.canvas)
    //   )
    // })
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      fill: 'red',
      radius: 20,
    })

    // 设置覆盖图像的画布
    // this.canvas.setOverlayImage(jailCellBars, this.canvas.renderAll.bind(this.canvas))
    fabric.Image.fromURL(jailCellBars, (img) => {
      // img.scaleToWidth(this.canvas.width)
      img.scaleToHeight(this.canvas.height)
      // 添加滤镜
      img.filters.push(
        new fabric.Image.filters.Grayscale(),
        new fabric.Image.filters.Sepia(), // 色偏
        new fabric.Image.filters.Invert(), // 反色
        // new fabric.Image.filters.Brightness({ brightness: 0.5 }) // 亮度
        // 模糊滤镜
        // new fabric.Image.filters.Blur({
        //   blur: 0.5,
        // })
        // 像素画
        new fabric.Image.filters.Pixelate({
          blocksize: 5,
        })
      )
      // 应用滤镜
      img.applyFilters()
      this.canvas.setOverlayImage(img, this.canvas.renderAll.bind(this.canvas))
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
