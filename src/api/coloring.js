import http from '@/utils/request'

const Coloring = {
  /**
   * 获取涂色背景图片
   * @param {*} page
   * @returns
   */
  getList(page) {
    return http.post('/coloring/getList', { page: page })
  },
}

export default Coloring
