import http from '@/util/service'

// export const getUserInfo = () =>{
//     return http.get('/index/index/getUserInfo')
// }

export function getUserInfo(params) {
    // return http.get('/index/index/getUserInfo')
    return http.post('/index/index/getUserInfo',params);
}
