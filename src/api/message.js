import http from '@/utils/request'

const Message = {
  // 获取消息列表
  getList(page) {
    return http.post('/message/getList', { page: page })
  },
  // 获取没有阅读的消息的数量
  getNotReadNum() {
    return http.post('/message/getTotalNotReadNum', {})
  },

  /**
   * 阅读消息
   * @param {*} id
   * @returns
   */
  read(id) {
    return http.post('/message/read', { id: id })
  },
  sendMessage(message) {
    return http.post('/message/sendMessage', { message: message })
  },
}

export default Message
