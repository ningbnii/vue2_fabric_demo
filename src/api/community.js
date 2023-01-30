import http from '@/utils/request'

/**
 * 社区
 */

const Community = {
  // 发布动态
  add(content, imgs) {
    return http.post('/community/add', { content: content, imgs: imgs })
  },
  // 获取列表
  getList(page) {
    return http.post('/community/getList', { page: page })
  },
  getOne(id) {
    return http.post('/community/getOne', { id: id })
  },
  getOwnList(page) {
    return http.post('/community/getOwnList', { page: page })
  },
  del(id) {
    return http.post('/community/del', { id: id })
  },
  // 点赞和取消点赞
  praise(id) {
    return http.post('/community/praise', { id: id })
  },
  /**
   * 添加评论
   * @param {*} wxuser_id
   * @param {*} community_id
   * @param {*} content
   * @param {*} pid
   * @returns
   */
  addComment(wxuser_id, community_id, content, pid) {
    return http.post('/community/addComment', {
      wxuserId: wxuser_id,
      communityId: community_id,
      content: content,
      pid: pid,
    })
  },
  /**
   * 获取评论列表
   * @param {*} id
   * @returns
   */
  getCommentList(id) {
    return http.post('/community/getCommentList', { id: id })
  },
  // 点赞列表
  getPraiseList(id) {
    return http.post('/community/getPraiseList', { id: id })
  },
}

export default Community
