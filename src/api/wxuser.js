import http from '@/utils/request'

const Wxuser = {
  getOne() {
    return http.post('/wxuser/getOne', {})
  },
  needComplete() {
    return http.post('/wxuser/needComplete', {})
  },
  completeInfo(nickname, thumb) {
    return http.post('/wxuser/completeInfo', {
      nickname: nickname,
      thumb: thumb,
    })
  },
}

export default Wxuser
