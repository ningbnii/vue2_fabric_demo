<template>
  <van-list finished-text="没有更多了">
    <van-cell title="矩形" is-link to="/test/rect" />
    <van-cell title="圆形" is-link to="/test/circle" />
    <van-cell title="椭圆" is-link to="/test/ellipse" />
    <van-cell title="直线" is-link to="/test/line" />
    <van-cell title="多边形" is-link to="/test/polygon" />
    <van-cell title="加载网络图设置背景" is-link to="/test/fromUrl" />
    <van-cell title="三角形" is-link to="/test/triangle" />
    <van-cell title="折线" is-link to="/test/polyline" />
    <van-cell title="路径" is-link to="/test/path" />
    <van-cell title="文本" is-link to="/test/text" />
  </van-list>
</template>

<script>
export default {
  name: 'index',
  data() {
    return {}
  },
  created() {},
  methods: {},
  mounted() {},
}
</script>

<style lang="scss" scoped></style>
