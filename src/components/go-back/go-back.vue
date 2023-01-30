<template>
  <van-nav-bar
    title=""
    left-text="返回"
    left-arrow
    fixed="true"
    @click-left="onClickLeft"
    class="my-nav-bar"
  />
</template>

<script>
export default {
  name: 'GoBack',
  data() {
    return {}
  },
  methods: {
    // 后退
    onClickLeft() {
      // 分享后点击返回，返回首页
      if (window.history.length <= 1) {
        this.$router.push({
          path: '/',
        })
      } else {
        this.$router.go(-1)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.my-nav-bar {
  z-index: 999;
}
</style>
