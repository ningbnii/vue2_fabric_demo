import Wxuser from '@/api/wxuser'
import router from '@/router/router'

const checkNeedComplete = async (path) => {
  await Wxuser.needComplete().then((res) => {
    if (res.needComplete) {
      router.push({ path: '/completeInfo' })
    } else {
      if (path) {
        router.push({ path: path })
      }
    }
  })
}

export default checkNeedComplete
