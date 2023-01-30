<template>
  <van-tabbar v-model="active" @change="onChange">
    <van-tabbar-item @click="goToIndex()" icon="gem-o">画廊</van-tabbar-item>
    <!-- <van-tabbar-item @click="goToChat()" icon="chat-o">聊天</van-tabbar-item> -->
    <van-tabbar-item @click="goToOwnList()" icon="edit">涂鸦</van-tabbar-item>
    <!-- <van-tabbar-item @click="goToCommunity()" icon="friends-o"
      >社区</van-tabbar-item
    > -->
    <van-tabbar-item @click="goToHome()" icon="home-o" :badge="messageNum"
      >我的</van-tabbar-item
    >
  </van-tabbar>
</template>

<script>
import Message from '@/api/message'
import checkNeedComplete from '@/utils/needComplete'

export default {
  name: 'CTabBar',
  data() {
    return {
      messageNum: '',
      active: this.$store.state.tabBarActive,
    }
  },
  created() {
    let s = this
    Message.getNotReadNum().then((res) => {
      s.messageNum = res.num ? res.num : ''
    })
  },
  methods: {
    onChange(index) {
      this.$store.commit('setTabBarActive', index)
    },
    goToIndex() {
      this.$router.push({ path: '/' })
    },
    goToOwnList() {
      checkNeedComplete('/ownList')
    },
    goToHome() {
      checkNeedComplete('/home')
    },
    // 跳转到社区模块
    goToCommunity() {
      this.$router.push({ path: '/community/index' })
    },
  },
}
</script>
