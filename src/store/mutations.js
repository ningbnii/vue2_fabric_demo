const mutations = {
  setDrawingPadRgbColor(state, color) {
    state.drawingPadRgbColor = color
  },
  // 更新图层
  updatePreviewImgArr(state, imgArr) {
    state.previewImgArr = imgArr
  },
  // 更新编辑状态的图层
  updateEditPreviewImgArr(state, imgArr) {
    state.editPreviewImgArr = imgArr
  },
  // 更新涂色预览图片
  updateColoringPreviewImgArr(state, imgArr) {
    state.coloringPreviewImgArr = imgArr
  },
  // 更新编辑状态的涂色预览图片
  updateEditColoringPreviewImgArr(state, imgArr) {
    state.editColoringPreviewImgArr = imgArr
  },
  // 更新繁花曲线预览图片
  updateFlowerPreviewImgArr(state, imgArr) {
    state.flowerPreviewImgArr = imgArr
  },
  // 更新编辑状态的繁花曲线预览图片
  updateEditFlowerPreviewImgArr(state, imgArr) {
    state.editFlowerPreviewImgArr = imgArr
  },
  // 添加图层
  setPreviewImgArr(state, [img, layerId]) {
    let flag = false
    for (let i = 0; i < state.previewImgArr.length; i++) {
      if (state.previewImgArr[i].layerId == layerId) {
        flag = true
        // state.previewImgArr[i].img = img
        break
      }
    }
    if (!flag) {
      state.previewImgArr.push({
        layerId: layerId,
        img: img,
        visible: true,
        alpha: 100,
      })
    }
  },
  // 编辑状态添加图层
  setEditPreviewImgArr(state, [img, layerId]) {
    let flag = false
    for (let i = 0; i < state.editPreviewImgArr.length; i++) {
      if (state.editPreviewImgArr[i].layerId == layerId) {
        flag = true
        // state.previewImgArr[i].img = img
        break
      }
    }
    if (!flag) {
      state.editPreviewImgArr.push({
        layerId: layerId,
        img: img,
        visible: true,
        alpha: 100,
      })
    }
  },
  // 添加涂色预览图片
  setColoringPreviewImgArr(state, [img, layerId]) {
    let flag = false
    for (let i = 0; i < state.coloringPreviewImgArr.length; i++) {
      if (state.coloringPreviewImgArr[i].layerId == layerId) {
        flag = true
        // state.previewImgArr[i].img = img
        break
      }
    }
    if (!flag) {
      state.coloringPreviewImgArr.push({
        layerId: layerId,
        img: img,
        visible: true,
        alpha: 100,
      })
    }
  },
  // 添加编辑状态的涂色预览图片
  setEditColoringPreviewImgArr(state, [img, layerId]) {
    let flag = false
    for (let i = 0; i < state.editColoringPreviewImgArr.length; i++) {
      if (state.editColoringPreviewImgArr[i].layerId == layerId) {
        flag = true
        // state.previewImgArr[i].img = img
        break
      }
    }
    if (!flag) {
      state.editColoringPreviewImgArr.push({
        layerId: layerId,
        img: img,
        visible: true,
        alpha: 100,
      })
    }
  },
  // 添加繁花曲线预览图片
  setFlowerPreviewImgArr(state, [img, layerId]) {
    let flag = false
    for (let i = 0; i < state.flowerPreviewImgArr.length; i++) {
      if (state.flowerPreviewImgArr[i].layerId == layerId) {
        flag = true
        // state.previewImgArr[i].img = img
        break
      }
    }
    if (!flag) {
      state.flowerPreviewImgArr.push({
        layerId: layerId,
        img: img,
        visible: true,
        alpha: 100,
      })
    }
  },
  // 添加编辑状态的繁花曲线预览图片
  setEditFlowerPreviewImgArr(state, [img, layerId]) {
    let flag = false
    for (let i = 0; i < state.editFlowerPreviewImgArr.length; i++) {
      if (state.editFlowerPreviewImgArr[i].layerId == layerId) {
        flag = true
        // state.previewImgArr[i].img = img
        break
      }
    }
    if (!flag) {
      state.editFlowerPreviewImgArr.push({
        layerId: layerId,
        img: img,
        visible: true,
        alpha: 100,
      })
    }
  },

  // 更新缩略图
  setLayerPreviewImg(state, [img, layerId]) {
    for (let i = 0; i < state.previewImgArr.length; i++) {
      if (state.previewImgArr[i].layerId == layerId) {
        state.previewImgArr[i].img = img
        break
      }
    }
  },
  // 编辑状态更新缩略图
  setEditLayerPreviewImg(state, [img, layerId]) {
    for (let i = 0; i < state.editPreviewImgArr.length; i++) {
      if (state.editPreviewImgArr[i].layerId == layerId) {
        state.editPreviewImgArr[i].img = img
        break
      }
    }
  },
  // 更新涂色预览图片
  setColoringPreviewImg(state, [img, layerId]) {
    for (let i = 0; i < state.coloringPreviewImgArr.length; i++) {
      if (state.coloringPreviewImgArr[i].layerId == layerId) {
        state.coloringPreviewImgArr[i].img = img
        break
      }
    }
  },
  // 编辑状态更新涂色预览图片
  setEditColoringPreviewImg(state, [img, layerId]) {
    for (let i = 0; i < state.editColoringPreviewImgArr.length; i++) {
      if (state.editColoringPreviewImgArr[i].layerId == layerId) {
        state.editColoringPreviewImgArr[i].img = img
        break
      }
    }
  },
  // 更新繁花曲线预览图片
  setFlowerPreviewImg(state, [img, layerId]) {
    for (let i = 0; i < state.flowerPreviewImgArr.length; i++) {
      if (state.flowerPreviewImgArr[i].layerId == layerId) {
        state.flowerPreviewImgArr[i].img = img
        break
      }
    }
  },
  // 编辑状态更新繁花曲线预览图片
  setEditFlowerPreviewImg(state, [img, layerId]) {
    for (let i = 0; i < state.editFlowerPreviewImgArr.length; i++) {
      if (state.editFlowerPreviewImgArr[i].layerId == layerId) {
        state.editFlowerPreviewImgArr[i].img = img
        break
      }
    }
  },

  // 删除图层
  delPreviewImgArr(state, layerId) {
    for (let i = 0; i < state.previewImgArr.length; i++) {
      if (state.previewImgArr[i].layerId == layerId) {
        state.previewImgArr.splice(i, 1)
      }
    }
  },
  // 编辑状态删除图层
  delEditPreviewImgArr(state, layerId) {
    for (let i = 0; i < state.editPreviewImgArr.length; i++) {
      if (state.editPreviewImgArr[i].layerId == layerId) {
        state.editPreviewImgArr.splice(i, 1)
      }
    }
  },
  // 删除涂色预览图片
  delColoringPreviewImgArr(state, layerId) {
    for (let i = 0; i < state.coloringPreviewImgArr.length; i++) {
      if (state.coloringPreviewImgArr[i].layerId == layerId) {
        state.coloringPreviewImgArr.splice(i, 1)
      }
    }
  },
  // 编辑状态删除涂色预览图片
  delEditColoringPreviewImgArr(state, layerId) {
    for (let i = 0; i < state.editColoringPreviewImgArr.length; i++) {
      if (state.editColoringPreviewImgArr[i].layerId == layerId) {
        state.editColoringPreviewImgArr.splice(i, 1)
      }
    }
  },
  // 删除繁花曲线预览图片
  delFlowerPreviewImgArr(state, layerId) {
    for (let i = 0; i < state.flowerPreviewImgArr.length; i++) {
      if (state.flowerPreviewImgArr[i].layerId == layerId) {
        state.flowerPreviewImgArr.splice(i, 1)
      }
    }
  },
  // 编辑状态删除繁花曲线预览图片
  delEditFlowerPreviewImgArr(state, layerId) {
    for (let i = 0; i < state.editFlowerPreviewImgArr.length; i++) {
      if (state.editFlowerPreviewImgArr[i].layerId == layerId) {
        state.editFlowerPreviewImgArr.splice(i, 1)
      }
    }
  },

  // 清空图层
  clearPreviewImgArr(state) {
    state.previewImgArr = []
  },
  // 编辑状态清空图层
  clearEditPreviewImgArr(state) {
    state.editPreviewImgArr = []
  },
  // 清空涂色预览图片
  clearColoringPreviewImgArr(state) {
    state.coloringPreviewImgArr = []
  },
  // 编辑状态清空涂色预览图片
  clearEditColoringPreviewImgArr(state) {
    state.editColoringPreviewImgArr = []
  },
  // 清空繁花曲线预览图片
  clearFlowerPreviewImgArr(state) {
    state.flowerPreviewImgArr = []
  },
  // 编辑状态清空繁花曲线预览图片
  clearEditFlowerPreviewImgArr(state) {
    state.editFlowerPreviewImgArr = []
  },

  // 设置图层可见属性
  setLayerVisible(state, [layerId, visible]) {
    for (let i = 0; i < state.previewImgArr.length; i++) {
      if (state.previewImgArr[i].layerId == layerId) {
        state.previewImgArr[i].visible = visible
        break
      }
    }
  },
  // 编辑状态设置图层可见属性
  setEditLayerVisible(state, [layerId, visible]) {
    for (let i = 0; i < state.editPreviewImgArr.length; i++) {
      if (state.editPreviewImgArr[i].layerId == layerId) {
        state.editPreviewImgArr[i].visible = visible
        break
      }
    }
  },
  // 设置填色图层可见属性
  setColoringLayerVisible(state, [layerId, visible]) {
    for (let i = 0; i < state.coloringPreviewImgArr.length; i++) {
      if (state.coloringPreviewImgArr[i].layerId == layerId) {
        state.coloringPreviewImgArr[i].visible = visible
        break
      }
    }
  },
  // 编辑状态设置填色图层可见属性
  setEditColoringLayerVisible(state, [layerId, visible]) {
    for (let i = 0; i < state.editColoringPreviewImgArr.length; i++) {
      if (state.editColoringPreviewImgArr[i].layerId == layerId) {
        state.editColoringPreviewImgArr[i].visible = visible
        break
      }
    }
  },
  // 设置繁花曲线图层可见属性
  setFlowerLayerVisible(state, [layerId, visible]) {
    for (let i = 0; i < state.flowerPreviewImgArr.length; i++) {
      if (state.flowerPreviewImgArr[i].layerId == layerId) {
        state.flowerPreviewImgArr[i].visible = visible
        break
      }
    }
  },
  // 编辑状态设置繁花曲线图层可见属性
  setEditFlowerLayerVisible(state, [layerId, visible]) {
    for (let i = 0; i < state.editFlowerPreviewImgArr.length; i++) {
      if (state.editFlowerPreviewImgArr[i].layerId == layerId) {
        state.editFlowerPreviewImgArr[i].visible = visible
        break
      }
    }
  },

  // 设置图层的透明度
  setLayerAlpha(state, [layerId, alpha]) {
    for (let i = 0; i < state.previewImgArr.length; i++) {
      if (state.previewImgArr[i].layerId == layerId) {
        state.previewImgArr[i].alpha = alpha
        break
      }
    }
  },
  // 编辑状态设置图层的透明度
  setEditLayerAlpha(state, [layerId, alpha]) {
    for (let i = 0; i < state.editPreviewImgArr.length; i++) {
      if (state.editPreviewImgArr[i].layerId == layerId) {
        state.editPreviewImgArr[i].alpha = alpha
        break
      }
    }
  },
  // 设置填色图层的透明度
  setColoringLayerAlpha(state, [layerId, alpha]) {
    for (let i = 0; i < state.coloringPreviewImgArr.length; i++) {
      if (state.coloringPreviewImgArr[i].layerId == layerId) {
        state.coloringPreviewImgArr[i].alpha = alpha
        break
      }
    }
  },
  // 编辑状态设置填色图层的透明度
  setEditColoringLayerAlpha(state, [layerId, alpha]) {
    for (let i = 0; i < state.editColoringPreviewImgArr.length; i++) {
      if (state.editColoringPreviewImgArr[i].layerId == layerId) {
        state.editColoringPreviewImgArr[i].alpha = alpha
        break
      }
    }
  },
  // 设置繁花曲线图层的透明度
  setFlowerLayerAlpha(state, [layerId, alpha]) {
    for (let i = 0; i < state.flowerPreviewImgArr.length; i++) {
      if (state.flowerPreviewImgArr[i].layerId == layerId) {
        state.flowerPreviewImgArr[i].alpha = alpha
        break
      }
    }
  },
  // 编辑状态设置繁花曲线图层的透明度
  setEditFlowerLayerAlpha(state, [layerId, alpha]) {
    for (let i = 0; i < state.editFlowerPreviewImgArr.length; i++) {
      if (state.editFlowerPreviewImgArr[i].layerId == layerId) {
        state.editFlowerPreviewImgArr[i].alpha = alpha
        break
      }
    }
  },

  // 设置当前图层id
  setLayerId(state, layerId) {
    state.layerId = layerId
  },
  // 编辑状态设置当前图层id
  setEditLayerId(state, layerId) {
    state.editLayerId = layerId
  },
  // 设置临摹图层透明度
  setCopyPaintingLayerAlpha(state, value) {
    state.copyPaintingLayerAlpha = value
  },
  // 临摹图片base64数据
  setCopyPaintingLayerImg(state, value) {
    state.copyPaintingLayerImg = value
  },
  // 设置临摹图片url
  setCopyPaintingImgUrl(state, value) {
    state.copyPaintingImgUrl = value
  },
  // 涂色背景图片url
  setColoringImgUrl(state, value) {
    state.coloringImgUrl = value
  },
  // 涂色背景图片id
  setColoringImgId(state, value) {
    state.coloringImgId = value
  },
  // 保存上一次的画笔类型
  setPrePenType(state, value) {
    state.prePenType = value
  },
  // 当前的画笔类型
  setPenType(state, value) {
    state.penType = value
  },
  // 设置橡皮擦大小
  setEraserSize(state, value) {
    state.eraserSize = value
  },
  // 设置画笔大小
  setPenSize(state, value) {
    state.penSize = value
  },
  // 控制图层是否可见
  setControlLayerVisible(state, value) {
    state.controlLayerVisible = value
  },
  // 设置首页滚动条位置
  setIndexScrollTop(state, value) {
    state.indexScrollTop = value
  },
  // 设置播放进度
  setPlayProgress(state, value) {
    state.playProgress = value
  },
  // 设置当前播放时长
  setPlayTime(state, value) {
    state.playTime = value
  },
  // 设置总时长
  setTotalTime(state, value) {
    state.totalTime = value
  },
  // 设置播放动画的定时器
  setPlayTimerArr(state, value) {
    // 元素插入数组中
    state.playTimerArr.push(value)
  },
  // 初始化播放动画的定时器数组
  clearPlayTimerArr(state) {
    // 循环清除timer
    if (state.playTimerArr) {
      for (let i = 0; i < state.playTimerArr.length; i++) {
        clearInterval(state.playTimerArr[i])
      }
    }

    state.playTimerArr = []
  },
  // 删除某个定时器
  delPlayTimer(state, value) {
    for (let i = 0; i < state.playTimerArr.length; i++) {
      if (state.playTimerArr[i] == value) {
        clearInterval(state.playTimerArr[i])
        state.playTimerArr.splice(i, 1)
      }
    }
  },
  // 设置播放速度
  setPlaySpeed(state, value) {
    state.playSpeed = value
  },
  // 保存编辑的作品id
  setEditWorkId(state, value) {
    state.editWorkId = value
  },
  // 设置是否保存过了的状态
  setIsSaveStatus(state, value) {
    state.isSaveStatus = value
  },
  // 设置拖动图层状态
  setDragLayerStatus(state, value) {
    state.dragLayerStatus = value
  },
  // 设置tabbar的状态
  setTabBarActive(state, value) {
    state.tabBarActive = value
  },
  // 设置是否需要完善信息状态
  setNeedComplete(state, value) {
    state.needComplete = value
  },
}

export default mutations
