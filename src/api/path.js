import http from '@/utils/request'

const Path = {
  getList(page) {
    return http.post('/path/getList', { page: page })
  },

  getNewList(page) {
    return http.post('/path/getNewList', { page: page })
  },
  getOne(id) {
    return http.post('/path/getOne', { id: id })
  },
  getOwnOne(id) {
    return http.post('/path/getOwnOne', { id: id })
  },
  getOwnList(page) {
    return http.post('/path/getOwnList', { page: page })
  },
  getListByUser(page, wxuserId) {
    return http.post('/path/getListByUser', { page: page, wxuser_id: wxuserId })
  },
  getUserData(wxuserId) {
    return http.post('/path/getDetail', { wxuserId: wxuserId })
  },
  del(id) {
    return http.post('/path/del', { id: id })
  },
  // 点赞
  praise(id) {
    return http.post('/path/praise', { id: id })
  },
  // 观看量
  addViews(id) {
    return http.post('/path/addViews', { id: id })
  },
  // 获取点赞数量
  getPraiseCount(id) {
    return http.post('/path/getPraiseCount', { id: id })
  },
  getRandomId(id) {
    return http.post('/path/getRandomId', { id: id })
  },
  add(pathId, path, pic, width, height, layer, type, coloringImgId) {
    return http.post('/path/add', {
      pathId: pathId,
      path: path,
      pic: pic,
      width: width,
      height: height,
      layer: layer,
      type: type || 1,
      coloringImgId: coloringImgId || 0,
    })
  },
}

export default Path
