<template>
  <div class="popup">
    <div class="popup__box">
      <div class="popup__header">
        <span class="popup__title">{{ title }}</span>
        <slot name="header-right"></slot>
      </div>
      <div class="popup__content">
        <slot name="content"></slot>
      </div>
    </div>

    <div class="popup__footer">
      <div class="popup__close" @click="close">
        <svg class="icon arrow-right" aria-hidden="true">
          <use xlink:href="#iconchenghao"></use>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CPopup',
  props: ['title'],
  data() {
    return {}
  },
  methods: {
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style scoped lang="scss">
.popup {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  background: #ffffff;
  z-index: 2;

  .popup__box {
    width: 90%;
    height: 80%;
    background: #3b3b3b;
    margin: 5vw;
    border-radius: 5px;
    padding: 10px;

    .popup__header {
      display: flex;
      justify-content: space-between;
      .popup__title {
        color: #ffffff;
      }
    }
  }

  .popup__content {
    width: 100%;
    margin-top: 40px;
    height: calc(80vh - 100px);
    overflow-y: auto;
  }

  .popup__footer {
    display: flex;
    justify-content: center;
    .popup__close {
      width: 60px;
      height: 60px;
      background: #212121;
      border-radius: 50%;
      color: #5e9ae8;
      display: flex;
      justify-content: center;
      align-items: center;
      .icon {
        font-size: 50px;
        font-weight: bold;
      }
    }
  }
}
</style>
