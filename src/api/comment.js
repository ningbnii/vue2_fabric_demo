import http from '@/utils/request'

const Comment = {
  /**
   * 获取评论列表
   * @param {*} id
   * @returns
   */
  getCommentList(id) {
    return http.post('/comment/getCommentList', { id: id })
  },
  /**
   * 添加评论
   * @param {*} wxuser_id
   * @param {*} works_id
   * @param {*} type
   * @param {*} content
   * @param {*} pid
   * @returns
   */
  add(wxuser_id, works_id, type, content, pid) {
    return http.post('/comment/add', {
      wxuserId: wxuser_id,
      worksId: works_id,
      type: type,
      content: content,
      pid: pid,
    })
  },
}

export default Comment
