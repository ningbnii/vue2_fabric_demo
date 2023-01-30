import http from '@/utils/request'

const ShareLog = {
  // 是否分享过了
  hasShare() {
    return http.post('/share_log/hasShare', {})
  },
}

export default ShareLog
