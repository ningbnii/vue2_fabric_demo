<template>
  <div>
    <canvas id="myCanvas"></canvas>
    <div class="control">
      <van-button type="primary" @click="addClickEvent">添加画布点击事件</van-button>
      <van-button type="info" @click="removeClickEvent">移除画布点击事件</van-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'event',
  data() {
    return {
      canvas: null,
    }
  },
  created() {},
  methods: {
    addClickEvent() {
      this.removeClickEvent()
      this.canvas.on('mouse:down', (e) => {
        console.log(e)
        console.log(`x: ${e.pointer.x}, y: ${e.pointer.y}`)
      })
    },
    removeClickEvent() {
      this.canvas.off('mouse:down')
    },
  },
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

    ellipse.on('selected', (e) => {
      console.log('选中矩形了', e)
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
