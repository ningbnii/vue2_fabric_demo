import http from '@/utils/request'

const Fan = {
  // 关注和取消关注
  guanzhu(wxuserId) {
    return http.post('/fan/guanzhu', { wxuserId: wxuserId })
  },
  // 获取我关注的人
  attentionList(page) {
    return http.post('/fan/getAttentionList', { page: page })
  },
}

export default Fan
