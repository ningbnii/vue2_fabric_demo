import http from '@/utils/request'

const RewardVideoLog = {
  // 是否分享过了
  hasClick() {
    return http.post('/reward_video_log/hasClick', {})
  },
}

export default RewardVideoLog
