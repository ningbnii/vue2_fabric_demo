const state = {
  tabBarActive: 0, // 底部导航栏选中的tab
  needComplete: false, // 是否需要完善信息
  // 画板颜色
  drawingPadRgbColor: 'rgb(0,0,0)',
  // 保存预览图片
  previewImgArr: [],
  // 编辑状态的预览图片
  editPreviewImgArr: [],
  // 保存填色预览图片
  coloringPreviewImgArr: [],
  // 编辑状态的填色预览图片
  editColoringPreviewImgArr: [],
  // 繁花曲线预览图片
  flowerPreviewImgArr: [],
  // 编辑状态的繁花曲线预览图片
  editFlowerPreviewImgArr: [],
  // 保存编辑的作品id
  editWorkId: '',
  // 当前图层
  layerId: 1,
  // 编辑状态的当前图层
  editLayerId: 1,
  // 是否保存过了
  isSaveStatus: false,
  // 拖动图层状态
  layerDragStatus: false,
  // 临摹图层透明度
  copyPaintingLayerAlpha: 30,
  // 临摹图片base64数据
  copyPaintingLayerImg: '',
  // 临摹图片url
  copyPaintingImgUrl: '',
  // 涂色背景图片url
  coloringImgUrl: '',
  // 涂色背景图片id
  coloringImgId: '',
  // 当前的画笔类型
  penType: 1,
  // 保存上一次的画笔类型
  prePenType: '',
  // 橡皮擦大小
  eraserSize: 10,
  // 画笔大小
  penSize: 1,
  // 控制图层是否可见
  controlLayerVisible: false,
  // 首页滚动条位置
  indexScrollTop: 0,
  // 播放进度
  playProgress: 0,
  // 当前播放时长
  playTime: 0,
  // 总时长
  totalTime: 0,
  // 播放动画的定时器数组
  playTimerArr: '',
  // 播放速度，每毫秒画多少个点
  playSpeed: 1,
}

export default state
