import brushImg from './brush'
import colorPickerImg from '../assets/img/xise.png'
import store from '../store'
import { Database } from './database'

function MyShape(
  w,
  h,
  strokes,
  readonly,
  lineWidth,
  alphaSize,
  color,
  backgroundLayer, // 背景层
  globalAlpha, // 全局透明度
  backgroundColor, // 背景色
  layerInfo, // 图层信息
  drawingType, // 画画类型，1是涂鸦，2是填色，3是繁花曲线
  isEdit // 是否是编辑模式
) {
  var s = this

  annie.Sprite.call(s)
  /*_a2x_need_start*/ /*_a2x_need_end*/

  // 初始化参数
  // localStorage.clear();
  s.clientWidth = document.body.clientWidth
  s.clientHeight = document.body.clientHeight

  s.suofang = w / s.clientWidth

  // 画画类型，1是涂鸦，2是填色，3是繁花曲线
  s.drawingType = drawingType || 1
  // 繁花曲线初始化
  if (s.drawingType == 3) {
    s.initFanHua()
  }
  // 数据库
  s.db = new Database()

  // 各个模式存储的strokes的key
  s.strokesKeyArr = [
    { id: 1, key: 'strokes' },
    { id: 2, key: 'coloring_strokes' },
    { id: 3, key: 'fanhua_strokes' },
  ]
  s.editStrokesKeyArr = [
    { id: 1, key: 'edit_strokes' },
    { id: 2, key: 'edit_coloring_strokes' },
    { id: 3, key: 'edit_fanhua_strokes' },
  ]
  // 当前画画类型的strokes的key
  s.strokesKey = s.strokesKeyArr[s.drawingType - 1].key
  s.editStrokesKey = s.editStrokesKeyArr[s.drawingType - 1].key
  // 画布宽
  s.drawingPadWidth = w
  // 画布高
  s.drawingPadHeight = h
  // 监听背景层，可以使手指移到画板外面，再回到画板上的时候，继续之前的绘画
  s.backgroundLayer = backgroundLayer || undefined

  // 只读，观看模式为只读，不能绘画
  s.readonly = readonly || false
  // 是否是编辑模式
  s.isEdit = isEdit || false
  // 绘画的过程数据
  s.strokes = typeof strokes == 'string' ? JSON.parse(strokes) : []
  // 可以撤销的操作步骤
  s.undoHistory = []
  // 画笔透明度
  s.alphaSize = alphaSize || 1
  // 画笔的颜色
  s.color = color || 'rgb(0,0,0)'
  // rgb格式的数据
  s.colorRgb = s.formatColorRgb(s.color)
  // rgba 格式的数据
  s.rgbaColor = s.formatColor(s.color, s.alphaSize)
  // 全局透明度
  s.globalAlpha = globalAlpha || 1
  // 背景色
  s.backgroundColor = backgroundColor || ''
  // 画笔的宽度
  s.lineWidth = lineWidth || 1
  // 是否正在播放动画
  s.isAnimation = false
  // 动画计时器
  s.timer = ''
  // 动画速度
  s.speed = store.state.playSpeed
  // 是否正在绘画
  s.isDrawing = false
  s.points = []
  // 画笔是1，橡皮擦是3，马可笔4，方头笔5
  s.type = s.penTypeInit()

  // 保存图层
  s.layerArr = []
  // 记录的图层信息
  s.layerInfo = layerInfo || []
  // 当前图层的layerId
  s.layerId = s.isEdit ? store.state.editLayerId : store.state.layerId

  // 当前正在绘画的图层
  s.nowLayer = {}
  // 移动临摹图层
  s.moveCopyPaintingLayer = false
  // frame计时器
  s.frameTime = 0

  // 保存的画笔image对象
  s.brushArr = []

  s.brushImg = brushImg

  s.brushDataArr = []
  s.brushElArr = []
  s.brushAlphaArr = []
  var brushFlag = 0
  // 画笔的总数量
  var brushImgTotal = 0

  // 加载画笔图案
  for (let [index, elem] of s.brushImg.entries()) {
    // 过滤掉img为空的，铅笔为空，因为铅笔笔刷不是图片，用的是canvas的绘图api
    if (!elem.img) {
      continue
    }
    let image = new Image()
    image.src = elem.img
    image.onload = function () {
      brushFlag++
    }
    s.brushArr[elem.name] = image
    brushImgTotal++
  }

  // 检查画笔图片是否都加载完了
  var timer = setInterval(function () {
    // 判断已经加载的画笔数量，和总的画笔数是否一致
    if (brushFlag == brushImgTotal) {
      // 清除计时器
      clearInterval(timer)
      for (let [key, value] of Object.entries(s.brushArr)) {
        let brushCanvas = new annie.Bitmap(document.createElement('canvas'))
        let brushEl = brushCanvas.bitmapData
        brushEl.width = value.width
        brushEl.height = value.height
        let brushCtx = brushEl.getContext('2d')
        // 表示图片是否平滑
        brushCtx.imageSmoothingEnabled = true
        brushCtx.drawImage(value, 0, 0)
        s.brushDataArr[key] = brushCtx.getImageData(
          0,
          0,
          brushEl.width,
          brushEl.height
        )
        // 画笔图片的颜色是灰度的图片，这里记录画笔图片每个像素的透明度
        // 在改变画笔颜色和透明度的时候，要改变每个像素的值
        var pxData = s.brushDataArr[key].data
        s.brushAlphaArr[key] = []
        for (var j = 0; j < pxData.length; j += 4) {
          s.brushAlphaArr[key].push(pxData[j + 3])
        }
      }

      if (!s.readonly) {
        // 绘制图案
        s.init()
        s.redraw()
      }
    }
  }, 0)

  // 画笔图案
  s.brush = null

  // 缩放中心点

  s.anchorX = w / (2 * s.suofang)
  s.anchorY = h / (2 * s.suofang)

  // let layer = new annie.Sprite()
  // s.layerArr.push(layer)
  // // 当前是第几层
  // s.layerId = 0

  // s.addChildAt(layer, 0)
  // 画板1
  // 两层画布，第一层画布，展示绘画过程，画完一笔后，将笔迹画到第二层画布上保留，第一层画布清空
  // 所有的绘画最终都画在画板1上
  s.backLayer = new annie.Bitmap(document.createElement('canvas'))
  s.addChildAt(s.backLayer, 0)

  s.el = s.backLayer.bitmapData
  s.el.width = document.body.clientWidth
  s.el.height = document.body.clientWidth
  s.ctx = s.el.getContext('2d')
  s.ctx.imageSmoothingEnabled = true
  s.ctx.scale(1 / s.suofang, 1 / s.suofang)
  s.ctx.globalAlpha = s.globalAlpha

  s.ctx.clearRect(0, 0, s.drawingPadWidth, s.drawingPadHeight)
  // s.ctx.save()
  // 背景色填充为白色
  if (s.backgroundColor) {
    s.ctx.fillStyle = s.backgroundColor
    s.ctx.fillRect(0, 0, s.drawingPadWidth, s.drawingPadHeight)
  }

  // 临摹层
  s.copyPaintingLayer = new annie.Bitmap(document.createElement('canvas'))
  s.copyPaintingLayerCtx = s.copyPaintingLayer.bitmapData.getContext('2d')
  // 临摹图层的旋转中心点
  s.copyPaintingLayer.anchorX = w / (2 * s.suofang)
  s.copyPaintingLayer.anchorY = h / (2 * s.suofang)
  s.addChildAt(s.copyPaintingLayer, 1)
  // s.setCopyPaintingImage(linmoImg)

  // 绘画图层
  s.drawingLayer = new annie.Sprite()
  s.addChild(s.drawingLayer)

  // 填色图片层
  s.fillImgLayer = new annie.Bitmap(document.createElement('canvas'))
  s.fillImgLayerCtx = s.fillImgLayer.bitmapData.getContext('2d')
  s.fillImgLayer.anchorX = w / (2 * s.suofang)
  s.fillImgLayer.anchorY = h / (2 * s.suofang)
  s.drawingLayer.addChildAt(s.fillImgLayer, 1000)

  // 橡皮擦图层
  s.eraserSprite = new annie.Sprite()
  s.eraserSprite.scaleX = 1 / s.suofang
  s.eraserSprite.scaleY = 1 / s.suofang
  // 默认不显示橡皮擦图层
  s.eraserSprite.visible = false
  s.addChildAt(s.eraserSprite, 1000)
  s.eraserShape = new annie.Shape()
  s.eraserSprite.addChild(s.eraserShape)

  // 吸色层
  s.colorPickerSprite = new annie.Sprite()
  s.colorPickerSprite.scaleX = 1 / s.suofang
  s.colorPickerSprite.scaleY = 1 / s.suofang
  // 默认不显示吸色层
  s.colorPickerSprite.visible = false
  s.addChildAt(s.colorPickerSprite, 1000)
  // 添加取色图片
  let colorPickerImgEle = new Image()
  s.colorPickerBitmap = {}
  colorPickerImgEle.onload = function (e) {
    s.colorPickerBitmap = new annie.Bitmap(colorPickerImgEle)
    s.colorPickerBitmap.x = 0
    s.colorPickerBitmap.y = 0
    s.colorPickerBitmap.width = 60
    s.colorPickerBitmap.height = 60
    s.colorPickerBitmap.anchorX = -60
    s.colorPickerBitmap.anchorY = -60
    s.colorPickerSprite.addChild(s.colorPickerBitmap)
  }
  colorPickerImgEle.src = colorPickerImg

  // 如果画板不可绘画，移除所有监听事件
  if (s.readonly) {
    // s.redraw();
    s.removeAllEventListener()
    return false
  } else {
    // s.addEventListener(annie.MouseEvent.MOUSE_OUT, s.onMouseUp.bind(s))
    // // 双指缩放
    var temp1 = {}
    var temp2 = {}

    s.addEventListener(annie.Event.ADD_TO_STAGE, function (e) {
      // 设置多点触控
      s.stage.addEventListener(
        annie.MouseEvent.MOUSE_DOWN,
        s.onMouseDown.bind(s)
      )
      s.stage.addEventListener(
        annie.MouseEvent.MOUSE_MOVE,
        s.onMouseMove.bind(s)
      )
      s.stage.addEventListener(annie.MouseEvent.MOUSE_UP, s.onMouseUp.bind(s))

      s.stage.addEventListener(annie.TouchEvent.ON_MULTI_TOUCH, function (evt) {
        // 双指缩放，有一定概率触发mouse_down，但是抬起手指不会触发mouse_up，导致s.points中有个mouse_down中设置的点的坐标
        // 会导致画线起点错误的bug
        if (s.isDrawing) {
          s.onMouseUp()
        }
        // console.log(s.stage)
        // s.points = []
        if (temp1.x) {
          // 第一个点
          var newPoint1 = {
            x: evt.clientPoint1.x,
            y: evt.clientPoint1.y,
          }
          // 第二个点
          var newPoint2 = {
            x: evt.clientPoint2.x,
            y: evt.clientPoint2.y,
          }
          // 第一个点的位移量
          var res1 = (newPoint1.x - temp1.x) * (newPoint2.x - temp2.x)
          var res2 = (newPoint1.y - temp1.y) * (newPoint2.y - temp2.y)
          // 两个点的夹角
          var angle1 = Trig.angleBetween2Points(temp1, temp2)
          var angle2 = Trig.angleBetween2Points(newPoint1, newPoint2)
          var angle =
            (angle2.toFixed(2) * 180) / Math.PI -
            (angle1.toFixed(2) * 180) / Math.PI
          // alert(angle);

          if (res1 < 1000 || res2 < 1000) {
            if (res1 > 0 || res2 > 0) {
              var offsetX = newPoint1.x - temp1.x
              var offsetY = newPoint1.y - temp1.y
              // if (offsetX < 10 && offsetX > -10) {
              //     s.x += offsetX;
              // }
              if (s.moveCopyPaintingLayer) {
                s.copyPaintingLayer.x += offsetX
                s.copyPaintingLayer.y += offsetY
              } else {
                s.x += offsetX / 3
                s.y += offsetY / 3
              }

              // if (offsetY < 10 && offsetY > -10) {
              //     s.y += offsetY;
              // }
            }

            if (res1 <= 0 || res2 <= 0) {
              if (s.moveCopyPaintingLayer) {
                if (s.copyPaintingLayer.scaleX + evt.scale >= 0.1) {
                  s.copyPaintingLayer.scaleX += evt.scale
                  s.copyPaintingLayer.scaleY += evt.scale
                }
              } else {
                if (s.scaleX + evt.scale * 2 >= 0.1) {
                  s.scaleX += evt.scale * 2
                  s.scaleY += evt.scale * 2
                }
              }
            }
          }

          if (Math.abs(angle) < 5) {
            if (s.moveCopyPaintingLayer) {
              s.copyPaintingLayer.rotation -= angle
            } else {
              s.rotation -= angle * 0.8
            }
          }
        }

        temp1 = { x: evt.clientPoint1.x, y: evt.clientPoint1.y }
        temp2 = { x: evt.clientPoint2.x, y: evt.clientPoint2.y }
      })
    })
  }

  // enter_frame事件，用于更新画板的状态，只在繁花曲线中使用
  s.addEventListener(annie.Event.ENTER_FRAME, function (e) {
    // 更新画板的状态
    s.frame()
  })
}

__extends(MyShape, annie.Sprite)

/**
 * 图层初始化
 */
MyShape.prototype.init = function () {
  var s = this
  // s.drawingLayer.removeAllChildren()
  // s.drawingLayer.removeAllEventListener()
  // 初始化画板1，画板1在下面，用来显示绘制的内容
  // s.ctx1Init()
  // 初始化画板2，画板2在上面，用来显示当前正在绘制的内容，绘制结束后，画板2清空，将内容画到画板1上面
  // s.ctx2Init()
  // 添加图层，有多少个图层，循环添加
  // 第一层
  let layerNum = 0
  let layerArr = []
  // 清空图层记录
  if (s.layerInfo.length != 0) {
    // 观看动画，或者编辑之前的画
    layerNum = s.layerInfo.length
    layerArr = s.layerInfo
  } else {
    // 绘画记录
    // 不是观看模式
    if (!s.readonly) {
      switch (s.drawingType) {
        case 1:
          // 涂鸦
          if (s.isEdit) {
            layerNum = store.state.editPreviewImgArr.length
            layerArr = store.state.editPreviewImgArr
          } else {
            layerNum = store.state.previewImgArr.length
            layerArr = store.state.previewImgArr
          }
          break
        case 2:
          // 填色
          if (s.isEdit) {
            layerNum = store.state.editColoringPreviewImgArr.length
            layerArr = store.state.editColoringPreviewImgArr
          } else {
            layerNum = store.state.coloringPreviewImgArr.length
            layerArr = store.state.coloringPreviewImgArr
          }
          break
      }
    }
  }

  if (layerNum == 0) {
    s.addLayer()
  } else {
    for (let j = 0; j < layerArr.length; j++) {
      let element = layerArr[j]
      let layerAlpha = 100
      if (element.alpha) {
        layerAlpha = element.alpha
      }
      if (element.layerId == 0) {
        element.layerId = 1
      }
      s.addLayer(j, element.visible, layerAlpha, element.layerId)
    }
  }
}

/**
 * enter_frame事件，用于更新画板的状态
 */
MyShape.prototype.frame = function () {
  let s = this

  // 繁花曲线
  if (s.drawingType == 3 && s.isDrawing) {
    s.fanHuaAngle += 0.1
    s.onMouseMove()
  }
}

/**
 * 画笔类型初始化
 */
MyShape.prototype.penTypeInit = function () {
  let s = this
  let type = store.state.penType
  if (s.drawingType == 3) {
    // 如果是繁花曲线，则固定为1
    type = 1
  }
  return type
}

/**
 * 给某个图层添加图片
 * @param {*} imgBase64
 */
MyShape.prototype.setLayerImage = function (imgBase64, layerId) {
  let s = this
  let layer = s.layerArr[layerId].layer

  let ctx = layer.getChildAt(0).bitmapData.getContext('2d')
  // ctx.clearRect(0, 0, s.clientWidth, s.clientWidth)
  ctx.imageSmoothingEnabled = false
  let img = new Image()
  img.src = imgBase64
  img.onload = function () {
    if (img.width >= img.height) {
      ctx.drawImage(
        img,
        0,
        (s.clientWidth - (img.height * s.clientWidth) / img.width) / 2,
        s.clientWidth,
        (img.height * s.clientWidth) / img.width
      )
    } else {
      ctx.drawImage(
        img,
        (s.clientWidth - (img.width * s.clientWidth) / img.height) / 2,
        0,
        (img.width * s.clientWidth) / img.height,
        s.clientWidth
      )
    }
  }
}

/**
 * 设置填色图片
 * @param {*} imgBase64
 */
MyShape.prototype.setTianseImage = function (imgBase64) {
  let s = this
  // s.copyPaintingLayer
  let el = s.fillImgLayer.bitmapData
  el.width = s.clientWidth
  el.height = s.clientWidth

  // 表示图片是否平滑
  s.fillImgLayerCtx.clearRect(0, 0, s.clientWidth, s.clientWidth)
  s.fillImgLayerCtx.imageSmoothingEnabled = true
  s.fillImgLayerCtx.globalAlpha = store.state.copyPaintingLayerAlpha / 100
  var img = new Image()
  img.src = imgBase64
  img.onload = function () {
    //必须onload之后再画
    if (img.width >= img.height) {
      s.fillImgLayerCtx.drawImage(
        img,
        0,
        (s.clientWidth - (img.height * s.clientWidth) / img.width) / 2,
        s.clientWidth,
        (img.height * s.clientWidth) / img.width
      )
    } else {
      s.fillImgLayerCtx.drawImage(
        img,
        (s.clientWidth - (img.width * s.clientWidth) / img.height) / 2,
        0,
        (img.width * s.clientWidth) / img.height,
        s.clientWidth
      )
    }
  }
}

/**
 * 设置临摹图片
 * @param {*} imgBase64
 */
MyShape.prototype.setCopyPaintingImage = function (imgBase64) {
  let s = this
  // s.copyPaintingLayer
  let el = s.copyPaintingLayer.bitmapData
  el.width = s.clientWidth
  el.height = s.clientWidth

  // 表示图片是否平滑
  s.copyPaintingLayerCtx.clearRect(0, 0, s.clientWidth, s.clientWidth)
  s.copyPaintingLayerCtx.imageSmoothingEnabled = true
  s.copyPaintingLayerCtx.globalAlpha = store.state.copyPaintingLayerAlpha / 100
  var img = new Image()
  img.src = imgBase64
  img.onload = function () {
    //必须onload之后再画
    if (img.width >= img.height) {
      s.copyPaintingLayerCtx.drawImage(
        img,
        0,
        (s.clientWidth - (img.height * s.clientWidth) / img.width) / 2,
        s.clientWidth,
        (img.height * s.clientWidth) / img.width
      )
    } else {
      s.copyPaintingLayerCtx.drawImage(
        img,
        (s.clientWidth - (img.width * s.clientWidth) / img.height) / 2,
        0,
        (img.width * s.clientWidth) / img.height,
        s.clientWidth
      )
    }
  }
}

/**
 * 设置临摹图层透明度
 * @param {*} alpha 0到100
 */
MyShape.prototype.setCopyPaintingAlpha = function (alpha) {
  let s = this
  if (!store.state.copyPaintingLayerImg) {
    return
  }
  s.copyPaintingLayerCtx.clearRect(0, 0, s.clientWidth, s.clientWidth)
  s.copyPaintingLayerCtx.imageSmoothingEnabled = true
  s.copyPaintingLayerCtx.globalAlpha = alpha / 100
  var img = new Image()
  img.src = store.state.copyPaintingLayerImg
  img.onload = function () {
    //必须onload之后再画
    if (img.width >= img.height) {
      s.copyPaintingLayerCtx.drawImage(
        img,
        0,
        (s.clientWidth - (img.height * s.clientWidth) / img.width) / 2,
        s.clientWidth,
        (img.height * s.clientWidth) / img.width
      )
    } else {
      s.copyPaintingLayerCtx.drawImage(
        img,
        (s.clientWidth - (img.width * s.clientWidth) / img.height) / 2,
        0,
        (img.width * s.clientWidth) / img.height,
        s.clientWidth
      )
    }
  }
}

/**
 * 删除临摹图片
 * @returns
 */
MyShape.prototype.delCopyPaintingImage = function () {
  let s = this
  s.copyPaintingLayerCtx.clearRect(0, 0, s.clientWidth, s.clientWidth)
}

/**
 * 删除某个图层
 * @param {*} layerId
 */
MyShape.prototype.delLayer = function (layerId) {
  let s = this
  for (let i = 0; i < s.layerArr.length; i++) {
    const element = s.layerArr[i]
    if (element.layerId == layerId) {
      s.drawingLayer.removeChild(element.layer)
      s.layerArr.splice(i, 1)
    }
  }

  s.clearLayer(layerId)
  switch (s.drawingType) {
    case 1:
      if (s.isEdit) {
        store.commit('delEditPreviewImgArr', layerId)
      } else {
        store.commit('delPreviewImgArr', layerId)
      }
      break

    case 2:
      if (s.isEdit) {
        store.commit('delEditColoringPreviewImgArr', layerId)
      } else {
        store.commit('delColoringPreviewImgArr', layerId)
      }
      break
  }
}

/**
 * 清空某个图层
 * @param {*} layerId
 */
MyShape.prototype.clearLayer = function (layerId) {
  let s = this
  for (let i = s.strokes.length - 1; i >= 0; i--) {
    const element = s.strokes[i]
    if (element.z == layerId) {
      s.strokes.splice(i, 1)
    }
  }
  if (s.isEdit) {
    // localStorage.setItem(s.editStrokesKey, JSON.stringify(s.strokes))
    s.db.saveEditStroke(1, JSON.stringify(s.strokes))
  } else {
    s.db.saveStroke(1, JSON.stringify(s.strokes))
    // localStorage.setItem(s.strokesKey, JSON.stringify(s.strokes))
  }

  s.redraw()
}

/**
 * 更改是否可以移动临摹层的状态值
 */
MyShape.prototype.changeMoveCopyPaintingLayer = function () {
  let s = this
  s.moveCopyPaintingLayer = !s.moveCopyPaintingLayer
}

/**
 * 所有的绘画最终都画在画板1上
 */
MyShape.prototype.ctx1Init = function (ctx) {
  var s = this
  // 清空绘画区域
  ctx.clearRect(0, 0, s.drawingPadWidth, s.drawingPadHeight)
}

/**
 * 画板2为了方便展示动画，一条线画完后，将画板重置，将线条画到画板1上
 */
MyShape.prototype.ctx2Init = function (ctx2, ctx1) {
  var s = this
  // 清空画板2
  ctx2.clearRect(0, 0, s.drawingPadWidth, s.drawingPadHeight)
  if (ctx1) {
    ctx2.drawImage(ctx1, 0, 0, s.drawingPadWidth, s.drawingPadHeight)
  }
}

/**
 * 添加图层
 * 每个图层有两个画板，一个用来展示绘画的动画，一个用来记录绘画的所有笔迹
 * @param {*} childAt 第几层
 * @param {*} visible 是否可见
 * @param {*} alpha 透明度
 * @param {*} layerId 图层id，用来区分不同的图层
 */
MyShape.prototype.addLayer = function (
  childAt = 0,
  visible = true,
  alpha = 100,
  layerId = 1
) {
  let s = this
  let layer = new annie.Sprite()
  layer.visible = visible
  // 检查是否有重复的layerId
  let flag = false
  for (let i = 0; i < s.layerArr.length; i++) {
    const element = s.layerArr[i]
    if (element.layerId == layerId) {
      flag = true
      break
    }
  }
  if (!flag) {
    s.layerArr.push({
      layer: layer,
      layerId: layerId,
      alpha: alpha,
    })
  }
  s.drawingLayer.addChildAt(layer, childAt)

  // 画板1
  // 两层画布，第一层画布，展示绘画过程，画完一笔后，将笔迹画到第二层画布上保留，第一层画布清空
  // 所有的绘画最终都画在画板1上
  let bitmap1 = new annie.Bitmap(document.createElement('canvas'))
  layer.addChildAt(bitmap1, 0)
  let el = bitmap1.bitmapData
  el.width = s.clientWidth
  el.height = s.clientWidth
  let ctx = el.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.scale(1 / s.suofang, 1 / s.suofang)
  ctx.globalAlpha = alpha / 100
  // s.ctx.globalCompositeOperation = 'multiply'

  // 画板2
  // 为了方便展示绘画的过程
  let bitmap2 = new annie.Bitmap(document.createElement('canvas'))
  layer.addChildAt(bitmap2, 1)

  let el2 = bitmap2.bitmapData
  el2.width = s.clientWidth
  el2.height = s.clientWidth
  let ctx2 = el2.getContext('2d')
  ctx2.imageSmoothingEnabled = true
  ctx2.scale(1 / s.suofang, 1 / s.suofang)
  ctx2.globalAlpha = alpha / 100

  s.ctx1Init(ctx)
  s.ctx2Init(ctx2)

  // 绘画模式
  if (!s.readonly) {
    // 预览图
    let previewImg = annie.toDisplayDataURL(
      layer.getChildAt(0),
      { x: 0, y: 0, width: s.clientWidth, height: s.clientWidth },
      { type: 'jpg', quality: 10 }
    )

    s.layerId = layerId

    switch (s.drawingType) {
      case 1:
        // 涂鸦
        if (s.isEdit) {
          store.commit('setEditPreviewImgArr', [previewImg, layerId])
          store.commit('setLayerId', s.layerId)
        } else {
          store.commit('setPreviewImgArr', [previewImg, layerId])
          store.commit('setEditLayerId', s.layerId)
        }
        break
      case 2:
        // 填色
        if (s.isEdit) {
          store.commit('setEditColoringPreviewImgArr', [previewImg, layerId])
          store.commit('setLayerId', s.layerId)
        } else {
          store.commit('setColoringPreviewImgArr', [previewImg, layerId])
          store.commit('setEditLayerId', s.layerId)
        }
        break
    }

    s.nowLayer = layer
  }
}

/**
 * 设置图层信息
 * @param {*} layerInfo
 */
MyShape.prototype.setLayerInfo = function (layerInfo) {
  let s = this
  s.layerInfo = layerInfo
}

/**
 * 更改图层
 * @param {*} layerId
 */
MyShape.prototype.changeLayer = function (layerId) {
  let s = this

  s.layerId = layerId
  for (let i = 0; i < s.layerArr.length; i++) {
    const element = s.layerArr[i]
    if (layerId == element.layerId) {
      s.nowLayer = element.layer
      break
    }
  }
  if (s.isEdit) {
    // 编辑
    store.commit('setEditLayerId', layerId)
  } else {
    store.commit('setLayerId', layerId)
  }
}

/**
 * 更改图层可见性
 * @param {*} layerId
 */
MyShape.prototype.changeLayerVisible = function (layerId) {
  let s = this
  let visible = true
  for (let i = 0; i < s.layerArr.length; i++) {
    const element = s.layerArr[i]
    if (element.layerId == layerId) {
      element.layer.visible = !element.layer.visible
      visible = element.layer.visible
      break
    }
  }
  switch (s.drawingType) {
    case 1:
      if (s.isEdit) {
        store.commit('setEditLayerVisible', [layerId, visible])
      } else {
        store.commit('setLayerVisible', [layerId, visible])
      }
      break

    case 2:
      if (s.isEdit) {
        store.commit('setEditColoringLayerVisible', [layerId, visible])
      } else {
        store.commit('setColoringLayerVisible', [layerId, visible])
      }
      break
  }
}

/**
 * 设置图层的透明度
 * @param {*} layerId
 * @param {*} alpha
 */
MyShape.prototype.setLayerAlpha = function (layerId, alpha) {
  let s = this
  for (let i = 0; i < s.layerArr.length; i++) {
    const element = s.layerArr[i]
    if (element.layerId == layerId) {
      element.alpha = alpha
      switch (s.drawingType) {
        case 1:
          if (s.isEdit) {
            store.commit('setEditLayerAlpha', [layerId, alpha])
          } else {
            store.commit('setLayerAlpha', [layerId, alpha])
          }
          break

        case 2:
          if (s.isEdit) {
            store.commit('setEditColoringLayerAlpha', [layerId, alpha])
          } else {
            store.commit('setColoringLayerAlpha', [layerId, alpha])
          }
          break
      }

      break
    }
  }
  s.redraw()
}

/**
 * 移动取色器，获取当前颜色
 * @param {*} x
 * @param {*} y
 * @param {*} e
 */
MyShape.prototype.drawColorPicker = function (x, y, e) {
  let s = this
  s.colorPickerBitmap.x = x
  s.colorPickerBitmap.y = y

  // 当前像素的颜色
  let data = e.target.stage.renderObj.rootContainer
    .getContext('2d')
    .getImageData(e.clientX, e.clientY, 1, 1).data
  s.color = 'rgb(' + data[0] + ',' + data[1] + ',' + data[2] + ')'
  // s.alphaSize = data[3] / 255
  // s.alphaSize.toFixed(2)
  // s.setAlphaSize(s.alphaSize)
  s.setColor(s.color)

  // 更改store存储的值
  store.commit('setDrawingPadRgbColor', s.color)
}

MyShape.prototype.showColorPicker = function () {
  let s = this
  s.colorPickerSprite.visible = true
}

MyShape.prototype.hideColorPicker = function () {
  let s = this
  s.colorPickerSprite.visible = false
}

/**
 * 绘制橡皮擦的圈圈
 */
MyShape.prototype.drawEraser = function (x, y) {
  let s = this
  // 清空图层
  s.eraserShape.clear()
  // 绘制橡皮擦
  s.eraserShape.beginStroke('#ff0000', 1)
  s.eraserShape.drawCircle(0, 0, s.lineWidth / 2)
  s.eraserShape.x = x
  s.eraserShape.y = y
  s.eraserShape.endStroke()
}

/**
 * 显示橡皮擦
 */
MyShape.prototype.showEraser = function () {
  let s = this
  s.eraserSprite.visible = true
}

/**
 * 隐藏橡皮擦
 */
MyShape.prototype.hideEraser = function () {
  let s = this
  s.eraserSprite.visible = false
}

MyShape.prototype.formatColor = function (color, alphaSize) {
  var s = this

  color = color.substr(4)
  color = color.substr(0, color.length - 1)
  return 'rgba(' + color + ',' + alphaSize + ')'
}

/**
 * rgba格式转为数组，透明度为255进制
 * @param {*} value
 * @returns
 */
MyShape.prototype.rgbaToArray = function (value) {
  value = value.substr(5)
  value = value.substr(0, value.length - 1)
  let arr = value.split(',')
  return [arr[0], arr[1], arr[2], Math.round(arr[3] * 255)]
}

/**
 * rgb rgba 转hex
 * @param {*} value
 * @returns
 */
MyShape.prototype.formatColorToHex = function (value) {
  if (/rgba?/.test(value)) {
    var array = value.split(',')
    //不符合rgb或rgb规则直接return
    if (array.length < 3) return ''
    value = '#'
    for (var i = 0, color; (color = array[i++]); ) {
      if (i < 4) {
        //前三位转换成16进制
        color = parseInt(color.replace(/[^\d]/gi, ''), 10).toString(16)
        value += color.length == 1 ? '0' + color : color
      } else {
        //rgba的透明度转换成16进制
        color = color.replace(')', '')
        var colorA = parseInt(color * 255)
        var colorAHex = colorA.toString(16)
        value += colorAHex
      }
    }
    value = value.toUpperCase()
  }
  return value
}

MyShape.prototype.formatColorRgb = function (color) {
  var s = this
  color = color.substr(4)
  color = color.substr(0, color.length - 1)
  return color.split(',')
}

/**
 * 繁花曲线初始化
 * @returns
 */
MyShape.prototype.initFanHua = function () {
  let s = this
  // 繁花曲线旋转角度
  s.fanHuaAngle = 0
  // 大圆的半径
  s.fanHuaBigR = 437
  // 小圆的半径
  s.fanHuaSmallR = 165
  // 控制参数
  s.fanHuaK = 200
}

/**
 * 更改繁花曲线的参数
 */
MyShape.prototype.changeFanHuaK = function (k) {
  let s = this
  s.fanHuaK = k
}

/**
 * 更改繁花曲线的大圆半径
 */
MyShape.prototype.changeFanHuaBigR = function (r) {
  let s = this
  s.fanHuaBigR = r
}

/**
 * 更改繁花曲线的小圆半径
 */
MyShape.prototype.changeFanHuaSmallR = function (r) {
  let s = this
  s.fanHuaSmallR = r
}

/**
 * 繁花曲线控制启动和停止
 * @param {*} e
 * @returns
 */
MyShape.prototype.controlFanHua = function () {
  let s = this
  if (s.isDrawing) {
    s.onMouseUp()
  } else {
    s.onMouseDown()
  }
}

/**
 * 生成点
 * 根据绘画模式返回对应的坐标
 * 正常模式是手指绘画，返回的就是触点的坐标，也就是e
 * 繁花曲线模式，通过一个方程生成对应的坐标点
 * @param {*} e 触摸事件返回的参数
 * @returns
 */
MyShape.prototype.generatePoints = function (e) {
  let s = this
  switch (s.drawingType) {
    // 手指绘画，直接返回e，不做处理
    case 1:
    case 2:
      break
    // 繁花曲线，通过方程生成对应的点的坐标
    case 3:
      let R = s.fanHuaBigR
      let r = s.fanHuaSmallR
      let k = s.fanHuaK
      let x =
        (R - r) * Math.cos(s.fanHuaAngle) +
        k * Math.cos(((R - r) / r) * s.fanHuaAngle) +
        (window.innerWidth * window.devicePixelRatio) / 2

      let y =
        (R - r) * Math.sin(s.fanHuaAngle) -
        k * Math.sin(((R - r) / r) * s.fanHuaAngle) +
        (window.innerHeight * window.devicePixelRatio) / 2
      e = {
        clientX: x,
        clientY: y,
      }
      break
  }
  return e
}

/**
 * 高效的填充算法
 * @param {*} ctx
 * @param {*} startX
 * @param {*} startY
 * @param {*} fillColor
 */
MyShape.prototype.efficientFloodFill = function (
  ctx,
  startX,
  startY,
  fillColor
) {
  let s = this
  // 保证startX和startY是整数
  startX = Math.round(startX / s.suofang)
  startY = Math.round(startY / s.suofang)
  // 栈，用来保存要开始计算的起点
  const pixelStack = [[startX, startY]]
  const canvasWidth = ctx.canvas.width
  const canvasHeight = ctx.canvas.height
  // 开始点在颜色数组中的索引
  const startPos = (startY * canvasWidth + startX) * 4
  // 获取颜色数组
  const colorLayer = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
  // 获取开始点的颜色
  const startColor = [
    colorLayer.data[startPos],
    colorLayer.data[startPos + 1],
    colorLayer.data[startPos + 2],
    colorLayer.data[startPos + 3],
  ]

  // 如果开始点的颜色和填充颜色一样，则不做任何操作
  if (
    startColor[0] == fillColor[0] &&
    startColor[1] == fillColor[1] &&
    startColor[2] == fillColor[2] &&
    startColor[3] == fillColor[3]
  ) {
    return
  }
  // 如果开始点的颜色和填充颜色不一样，则开始填充
  while (pixelStack.length > 0) {
    // 弹出栈顶元素
    const newPos = pixelStack.pop()
    const x = newPos[0]
    let y = newPos[1]

    let pixelPos = (y * canvasWidth + x) * 4
    // 找到触点所在列，最上面的点的位置
    while (y-- >= 0 && s.matchColor(colorLayer, pixelPos, startColor)) {
      pixelPos -= canvasWidth * 4
    }
    pixelPos += canvasWidth * 4
    ++y

    let reachLeft = false,
      reachRight = false
    while (
      y++ < canvasHeight - 1 &&
      s.matchColor(colorLayer, pixelPos, startColor)
    ) {
      colorLayer.data[pixelPos] = fillColor[0]
      colorLayer.data[pixelPos + 1] = fillColor[1]
      colorLayer.data[pixelPos + 2] = fillColor[2]
      colorLayer.data[pixelPos + 3] = fillColor[3]

      if (x > 0) {
        if (s.matchColor(colorLayer, pixelPos - 4, startColor)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, y])
            reachLeft = true
          }
        } else if (reachLeft) {
          reachLeft = false
        }
      }

      if (x < canvasWidth - 1) {
        if (s.matchColor(colorLayer, pixelPos + 4, startColor)) {
          if (!reachRight) {
            pixelStack.push([x + 1, y])
            reachRight = true
          }
        } else if (reachRight) {
          reachRight = false
        }
      }
      pixelPos += canvasWidth * 4
    }
  }
  ctx.putImageData(colorLayer, 0, 0)
}

/**
 * 判断两个位置的像素点是否相同
 * @param {*} colorLayer
 * @param {*} pixelPos
 * @param {*} color
 * @returns
 */
MyShape.prototype.matchColor = function (colorLayer, pixelPos, color) {
  return (
    colorLayer.data[pixelPos] === color[0] &&
    colorLayer.data[pixelPos + 1] === color[1] &&
    colorLayer.data[pixelPos + 2] === color[2] &&
    colorLayer.data[pixelPos + 3] === color[3]
  )
}

/**
 * 手指接触屏幕，开始绘画
 * @param e
 */
MyShape.prototype.onMouseDown = function (e) {
  var s = this
  // 延迟执行，防止和双指操作冲突
  setTimeout(() => {
    // 如果是多指缩放，则不做任何操作
    if (
      s.stage.isMultiTouch == undefined ||
      (s.stage.isMultiTouch != undefined && s.stage.isMultiTouch)
    ) {
      return
    }

    // 停止所有动画，如果处于播放状态，需要暂停播放
    if (s.isAnimation) {
      s.points = []
      s.cancelAnimation()
      s.redraw()
    }
    // 当前的图层
    let layer = s.nowLayer
    if (!layer.visible) {
      return
    }
    // 正在绘画
    s.isDrawing = true
    // 生成点
    e = s.generatePoints(e)
    // 获取点的相对于画布的坐标位置
    s._lastPosition = s._position(e)
    // s.points记录点的坐标
    // 吸取颜色，不记录坐标
    // 记录当前的设置，颜色，画笔宽度，透明度，画笔类型，点的坐标
    s._currentStroke = {
      c: s.color,
      l: s.lineWidth,
      a: s.alphaSize,
      t: s.type,
      z: s.layerId, // 图层id
      lines: [],
    }
    // 吸色，不记录坐标
    if (s.type != 2) {
      s.points.push(s._lastPosition)

      // s:开始点的位置，e:结束点的位置
      // 第一个点只有开始位置
      s._currentStroke.lines.push({
        s: s._lastPosition,
        e: {},
      })
    }

    let layerAlpha = 100
    for (let i = 0; i < s.layerArr.length; i++) {
      const element = s.layerArr[i]
      if (element.layerId == s.layerId) {
        layerAlpha = element.alpha
        break
      }
    }
    let ctx = layer.getChildAt(0).bitmapData.getContext('2d')
    let ctx2 = layer.getChildAt(1).bitmapData.getContext('2d')

    // s.ctx.miterLimit = s.ctx2.miterLimit = s.lineWidth / 2
    ctx.lineWidth = ctx2.lineWidth = s.lineWidth
    // 决定了两条线段相交时如何绘制焦点，只有当两条线段方向不同时，才会生效。可取值：bevel，round，miter。默认值是miter
    ctx.lineJoin = ctx2.lineJoin = 'round'
    // 该值告诉浏览器如何绘制线段的端点，可选值为以下三个之一：butt，round，square。默认为butt。
    ctx.lineCap = ctx2.lineCap = 'round'
    ctx.globalCompositeOperation = ctx2.globalCompositeOperation = 'source-over'
    // ctx.globalAlpha = ctx.globalAlpha = layerAlpha / 100
    ctx.globalAlpha = ctx2.globalAlpha = layerAlpha / 100

    // 正常画笔
    if (s.type == 1) {
      // s.ctx.shadowBlur = s.ctx2.shadowBlur = 1
      // s.ctx.shadowColor = s.ctx2.shadowColor = s.color
      ctx.strokeStyle = ctx2.strokeStyle = s.rgbaColor
    } else if (s.type == -1) {
      // 填色
      ctx.fillStyle = ctx2.fillStyle = s.rgbaColor
      // let color = s.rgbaToArray(s.rgbaColor)
      // s.efficientFloodFill(ctx, s._lastPosition.x, s._lastPosition.y, color)
    } else if (s.type == 3) {
      // 橡皮，将颜色设置为白色
      ctx.strokeStyle = ctx2.strokeStyle = 'rgb(255,255,255)'
      ctx.globalCompositeOperation = 'destination-out'
      // s.ctx.shadowColor = s.ctx2.shadowColor = 'rgb(255,255,255)'
      // s.ctx.shadowBlur = s.ctx2.shadowBlur = 0
      // 显示橡皮擦
      s.noSuofangPosition = s._position(e)
      // s.drawEraser(s._lastPosition.x, s._lastPosition.y)
      // s.showEraser()
    } else if (s.type == 2) {
      // 取色
      s.drawColorPicker(s._lastPosition.x, s._lastPosition.y, e)
      s.showColorPicker()
    } else if (s.type >= 4) {
      // 使用图片渲染的画笔，初始化画笔
      s.brush = s.initBrush(s.type, s.colorRgb, s.alphaSize)
      // ctx.strokeStyle = ctx.createPattern(s.brush, 'repeat')
      // ctx2.strokeStyle = ctx2.createPattern(s.brush, 'repeat')
      // console.log(s.brush)
    }
  }, 50)
}

MyShape.prototype.onMouseMove = function (e) {
  var s = this
  // 是否在绘画状态
  if (!s.isDrawing || s.type == -1) return
  // 生成点
  e = s.generatePoints(e)
  // 当前的点坐标
  s.currentPosition = s._position(e)
  // 不是取色状态
  if (s.type != 2) {
    // 放到s.points中保存
    s.points.push(s.currentPosition)

    // 第一个点
    var p1 = s.points[0]
    // 第二个点
    var p2 = s.points[1]
  }

  let layerAlpha = 100
  for (let i = 0; i < s.layerArr.length; i++) {
    const element = s.layerArr[i]
    if (element.layerId == s.layerId) {
      layerAlpha = element.alpha
      break
    }
  }
  // 当前的图层
  let layer = s.nowLayer
  let ctx = layer.getChildAt(0).bitmapData.getContext('2d')
  let ctx2 = layer.getChildAt(1).bitmapData.getContext('2d')
  ctx.globalAlpha = ctx2.globalAlpha = layerAlpha / 100
  // 图片画笔
  if (s.type >= 4) {
    // 鼠标按下的点
    p1 = s._lastPosition
    // 滑动到当前的点
    p2 = s.currentPosition
    s.drawBrushPath(ctx2, p1, p2, s.lineWidth, s.brush)
  } else {
    if (s.type == 1 || s.type == 3) {
      if (s.type == 3) {
        // 橡皮擦
        // 显示橡皮擦

        s.noSuofangPosition = s._position(e)
        s.drawEraser(s.currentPosition.x, s.currentPosition.y)
        s.showEraser()
      }
      s.ctx2Init(ctx2)
      ctx2.beginPath()
      ctx.beginPath()

      // if (s.points.length >= 3) {
      //   let controlPointsArr = []
      //   for (let i = 0; i < s.points.length; i++) {
      //     if (i < s.points.length - 2) {
      //       let controlPoints = Trig.getControlPoints(
      //         s.points[i],
      //         s.points[i + 1],
      //         s.points[i + 2]
      //       )
      //       controlPointsArr.push(controlPoints)
      //     }
      //   }
      //   for (let i = 0; i < s.points.length; i++) {
      //     if (i < s.points.length - 2) {
      //       if (i == 0) {
      //         ctx.moveTo(s.points[i].x, s.points[i].y)
      //         ctx2.moveTo(s.points[i].x, s.points[i].y)
      //       } else if (i == 1) {
      //         ctx.lineTo(s.points[i].x, s.points[i].y)
      //         ctx2.lineTo(s.points[i].x, s.points[i].y)
      //       } else {
      //         // ctx.moveTo(s.points[i - 1].x, s.points[i - 1].y)
      //         // ctx2.moveTo(s.points[i - 1].x, s.points[i - 1].y)
      //         ctx.bezierCurveTo(
      //           controlPointsArr[i - 2][1].x,
      //           controlPointsArr[i - 2][1].y,
      //           controlPointsArr[i - 1][0].x,
      //           controlPointsArr[i - 1][0].y,
      //           s.points[i].x,
      //           s.points[i].y
      //         )
      //         ctx2.bezierCurveTo(
      //           controlPointsArr[i - 2][1].x,
      //           controlPointsArr[i - 2][1].y,
      //           controlPointsArr[i - 1][0].x,
      //           controlPointsArr[i - 1][0].y,
      //           s.points[i].x,
      //           s.points[i].y
      //         )
      //       }
      //     }
      //   }
      //   ctx2.stroke()
      // }
      ctx2.moveTo(p1.x, p1.y)
      ctx.moveTo(p1.x, p1.y)
      for (let i = 0; i < s.points.length; i++) {
        let midPoint = s.midPointBtw(p1, p2)

        ctx2.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
        ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
        p1 = s.points[i]
        if (i < s.points.length) {
          p2 = s.points[i + 1]
        }
      }
      ctx2.lineTo(p1.x, p1.y)
      ctx.lineTo(p1.x, p1.y)
      // // ctx2.closePath()
      // // ctx2.fill()
      ctx2.stroke()
    } else if (s.type == 2) {
      // 取色
      s.drawColorPicker(s.currentPosition.x, s.currentPosition.y, e)
    }
  }

  if (s.type != 2) {
    s._currentStroke.lines.push({
      s: s._lastPosition,
      e: s.currentPosition,
    })
  }
  s._lastPosition = s.currentPosition
}

MyShape.prototype.onMouseUp = function (e) {
  var s = this
  // 是否在绘画状态
  if (!s.isDrawing) return
  // 绘画状态更改
  s.isDrawing = false
  // 当前的图层
  let layerAlpha = 100
  for (let i = 0; i < s.layerArr.length; i++) {
    const element = s.layerArr[i]
    if (element.layerId == s.layerId) {
      layerAlpha = element.alpha
      break
    }
  }
  let layer = s.nowLayer
  let ctx = layer.getChildAt(0).bitmapData.getContext('2d')
  let ctx2 = layer.getChildAt(1).bitmapData.getContext('2d')
  ctx.globalAlpha = ctx2.globalAlpha = layerAlpha / 100

  var p1 = s.points[0]
  var p2 = s.points[1]
  // 如果只是按下一个点，没有移动
  // 因为双指缩放的时候，不能保证两个手指同时触屏，如果一个手指触屏，那就会多一个点，所以，一个点不画
  if (s.points.length == 1) {
    s.drawFirstPoint(ctx, p1, s.type, s.lineWidth, s.alphaSize, s.color)
  } else if (s.points.length > 1) {
    s.ctx2Init(ctx2)
    if (s.type == 1 || s.type == 3) {
      ctx.stroke()
      ctx.closePath()
    } else if (s.type >= 4) {
      for (var i = 1, len = s.points.length; i < len; i++) {
        s.drawBrushPath(ctx, p1, p2, s.lineWidth, s.brush)
        p1 = s.points[i]
        p2 = s.points[i + 1]
      }
    }
  }
  // 隐藏橡皮擦图层，并且设置画笔类型为之前的类型
  if (s.type == 3) {
    // 隐藏橡皮擦图层
    s.hideEraser()
    // // 设置画笔类型为之前的类型
    // s.type = store.state.prePenType
    // // 设置画笔类型
    // s.setType(s.type)
    // // 设置画笔的粗细
    // s.setLineWidth(store.state.penSize)
  }
  // 如果是取色，则隐藏取色图层，并且设置画笔类型为之前的类型
  if (s.type == 2) {
    // 隐藏取色图层
    s.hideColorPicker()
    // 取色完成后，设置画笔类型为之前的类型
    // s.type = store.state.prePenType
    // 设置画笔类型
    // s.setType(s.type)
  }
  if (s.type != 2) {
    s.strokes.push(s._currentStroke)
    if (s.isEdit) {
      // localStorage.setItem(s.editStrokesKey, JSON.stringify(s.strokes))
      s.db.saveEditStroke(1, JSON.stringify(s.strokes))
    } else {
      s.db.saveStroke(1, JSON.stringify(s.strokes))
      // localStorage.setItem(s.strokesKey, JSON.stringify(s.strokes))
    }

    s.points = []
  }

  // 绘画结束，生成预览图
  // let previewImg = s.getBase64(false)
  let previewImg = annie.toDisplayDataURL(
    layer.getChildAt(0),
    { x: 0, y: 0, width: s.clientWidth, height: s.clientWidth },
    { type: 'jpg', quality: 10 }
  )
  switch (s.drawingType) {
    case 1:
      // 涂鸦
      if (s.isEdit) {
        store.commit('setEditLayerPreviewImg', [previewImg, s.layerId])
      } else {
        store.commit('setLayerPreviewImg', [previewImg, s.layerId])
      }
      break
    case 2:
      // 填色
      if (s.isEdit) {
        store.commit('setEditColoringPreviewImg', [previewImg, s.layerId])
      } else {
        store.commit('setColoringPreviewImg', [previewImg, s.layerId])
      }
      break
  }
}

/**
 * 图片笔刷模式，渲染间隔，值越小，线会越实，值越大，图片间隔会越大，线会越虚
 * @param {*} lineWidth
 * @returns
 */
MyShape.prototype.getSpacing = function (lineWidth) {
  let spacing = 1
  return spacing
}

/**
 * 绘制笔刷线条
 * @param {*} p1
 * @param {*} p2
 */
MyShape.prototype.drawBrushPath = function (ctx, p1, p2, lineWidth, brush) {
  let s = this
  // // 两点之间的直线距离
  var distance = parseInt(Trig.distanceBetween2Points(p1, p2))
  // if (distance <= 2) {
  //   return false
  // }
  // // 两点之间的夹角
  var angle = Trig.angleBetween2Points(p1, p2)
  for (let i = 0; i <= distance; i += lineWidth / s.suofang) {
    let x = p1.x + i * Math.sin(angle)
    let y = p1.y + i * Math.cos(angle)
    ctx.drawImage(
      brush,
      x - lineWidth / 2,
      y - lineWidth / 2,
      lineWidth,
      lineWidth
    )
  }
  // // 填充两点之间的点

  // var spacing = s.getSpacing(lineWidth)
  // let anchorpoints = [p1, p2]
  // 生成贝塞尔曲线点，根据两点之间的距离，计算出贝塞尔曲线点的个数，距离越大，点越多
  // let points = this.CreateBezierPoints(
  //   anchorpoints,
  //   Math.ceil((distance / lineWidth) * 3)
  // )
  // let points = this.CreateBezierPoints(anchorpoints, distance)
  // // 绘制笔刷
  // for (let i = 0, len = points.length; i < len; i++) {
  //   let point = points[i]
  //   let x = point.x
  //   let y = point.y
  //   ctx.drawImage(
  //     brush,
  //     x - lineWidth / 2,
  //     y - lineWidth / 2,
  //     lineWidth,
  //     lineWidth
  //   )
  // }
}

/**
 * 生成贝塞尔曲线上的点
 * @param {*} anchorpoints 控制点
 * @param {*} pointsAmount 生成的点的数量
 * @returns
 */
MyShape.prototype.CreateBezierPoints = function (anchorpoints, pointsAmount) {
  var points = []
  for (var i = 0; i < pointsAmount; i++) {
    var point = this.MultiPointBezier(anchorpoints, i / pointsAmount)
    points.push(point)
  }
  return points
}

/**
 * 生成贝塞尔曲线
 * @param {*} points
 * @param {*} t
 * @returns
 */
MyShape.prototype.MultiPointBezier = function (points, t) {
  var len = points.length
  var x = 0,
    y = 0
  var erxiangshi = function (start, end) {
    var cs = 1,
      bcs = 1
    while (end > 0) {
      cs *= start
      bcs *= end
      start--
      end--
    }
    return cs / bcs
  }
  for (var i = 0; i < len; i++) {
    var point = points[i]
    x +=
      point.x *
      Math.pow(1 - t, len - 1 - i) *
      Math.pow(t, i) *
      erxiangshi(len - 1, i)
    y +=
      point.y *
      Math.pow(1 - t, len - 1 - i) *
      Math.pow(t, i) *
      erxiangshi(len - 1, i)
  }
  return { x: x, y: y }
}

/**
 * 获取点的位置
 * @param e
 * @param suofang 画布是有缩放值的，橡皮擦图层没有缩放值
 * @private
 */
MyShape.prototype._position = function (e, suofang = 1) {
  let s = this
  let point = s.globalToLocal(new annie.Point(e.clientX, e.clientY))
  let data = {
    x: suofang == 1 ? Math.round(point.x * s.suofang) : point.x,
    y: suofang == 1 ? Math.round(point.y * s.suofang) : point.y,
  }
  return data
}

/**
 * 两个点之间的距离
 * @param point1
 * @param point2
 * @returns {number}
 */
MyShape.prototype.distanceBetween = function (point1, point2) {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  )
}

/**
 * 两个点之间的角度，和x轴之间的角度
 * @param point1
 * @param point2
 * @returns {number}
 */
MyShape.prototype.angleBetween = function (point1, point2) {
  return Math.atan2(point2.x - point1.x, point2.y - point1.y)
}

/**
 * 两个点的中点坐标
 * @param p1
 * @param p2
 * @returns {{x: *, y: *}}
 */
MyShape.prototype.midPointBtw = function (p1, p2) {
  return {
    x: Math.ceil(p1.x) + (Math.ceil(p2.x) - Math.ceil(p1.x)) / 2,
    y: Math.ceil(p1.y) + (Math.ceil(p2.y) - Math.ceil(p1.y)) / 2,
  }
}

/**
 * 使用图片渲染的画笔
 * 初始化画笔
 * @param colorRgb
 * @param alphaSize
 * @param callback
 */
MyShape.prototype.initBrush = function (type, colorRgb, alphaSize, debug) {
  var s = this
  // 第一个画笔是马克笔，type=4
  // 第二个画笔是方头笔，type=5
  let brushData = []
  let brushName = ''
  for (let [index, elem] of s.brushImg.entries()) {
    if (type == elem.type) {
      brushName = elem.name
      brushData = s.brushDataArr[brushName]
      break
    }
  }

  if (brushData) {
    // pxData 记录的是rgba的值，每隔4个一组，每一组代表一个像素
    let pxData = localStorage.getItem(type + '_' + colorRgb + '_' + alphaSize)

    if (pxData) {
      pxData = pxData.split(',')
      pxData = Uint8ClampedArray.from(pxData)
      try {
        brushData = new ImageData(pxData, brushData.width, brushData.height)
      } catch (error) {
        localStorage.removeItem(type + '_' + colorRgb + '_' + alphaSize)
        location.reload()
      }
    } else {
      let pxData = brushData.data

      for (let i = 0, j = 0, len = pxData.length; i < len; i += 4, j++) {
        // 透明像素不做处理
        if (pxData[i + 3] != 0) {
          pxData[i] = colorRgb[0]
          pxData[i + 1] = colorRgb[1]
          pxData[i + 2] = colorRgb[2]
          pxData[i + 3] = s.brushAlphaArr[brushName][j] * alphaSize
        }
      }
      // if (type == 4) {
      //   console.log(pxData)
      //   return false
      // }
      // localStorage.setItem(type + '_' + colorRgb + '_' + alphaSize, pxData)
    }

    s.brushCanvas = new annie.Bitmap(document.createElement('canvas'))

    s.brushEl = s.brushCanvas.bitmapData
    s.brushEl.width = brushData.width
    s.brushEl.height = brushData.height
    s.brushCtx = s.brushEl.getContext('2d')
    // 用于设置图片是否平滑，也就是是否抗锯齿，默认为true，表示图片平滑，false表示图片不平滑
    s.brushCtx.imageSmoothingEnabled = true
    s.brushCtx.putImageData(brushData, 0, 0)
    // 返回经过处理的画笔图片
    // var img = s.brushEl.toDataURL("image/png");
    return s.brushEl
  }
}

/**
 * 加载图片，加载完成后返回图片
 * @param url
 * @param callback
 */
MyShape.prototype.imgLoad = function (url) {
  var img = new Image()
  img.src = url
  if (img.complete) {
    return img
    // callback(img);
  } else {
    img.onload = function (ev) {
      img.onload = null
      // callback(img);
      return img
    }
  }
}

/**
 * 设置画笔颜色
 * @param color
 */
MyShape.prototype.setColor = function (color) {
  var s = this
  s.color = color
  s.rgbaColor = s.formatColor(s.color, s.alphaSize)
  s.colorRgb = s.formatColorRgb(s.color)

  // s.brush = s.initBrush(s.colorRgb, s.alphaSize)
}

/**
 * 设置画笔大小
 * @param lineWidth
 */
MyShape.prototype.setLineWidth = function (lineWidth) {
  var s = this
  s.lineWidth = lineWidth || 1
}

/**
 * 设置透明度
 * @param alphaSize
 */
MyShape.prototype.setAlphaSize = function (alphaSize) {
  var s = this
  s.alphaSize = alphaSize
  s.rgbaColor = s.formatColor(s.color, s.alphaSize)
  // s.brush = s.initBrush(s.colorRgb, s.alphaSize)
}
/**
 * 设置画布是否可以绘画，false可画，true不可画
 * @param readonly
 */
MyShape.prototype.setReadonlyAttr = function (readonly) {
  var s = this
  s.readonly = readonly
  if (s.readonly) {
    s.removeAllEventListener()
  } else {
    s.addEventListener(annie.MouseEvent.MOUSE_DOWN, s.onMouseDown.bind(s))
  }
}

/**
 * 画第一个点，或者填色
 * @param point
 * @param type
 * @param lineWidth
 * @param alphaSize
 * @param color
 */
MyShape.prototype.drawFirstPoint = function (
  ctx,
  point,
  type,
  lineWidth,
  alphaSize,
  color
) {
  var s = this
  if (type == 1 || type == 3) {
    ctx.save()
    ctx.beginPath()
    if (type == 1) {
      ctx.fillStyle = s.formatColor(color, alphaSize)
      ctx.arc(point.x, point.y, lineWidth / 2, 0, 2 * Math.PI, false)
      ctx.closePath()
    }
    ctx.fill()
    ctx.restore()
  } else if (type >= 4) {
    var colorRgb = s.formatColorRgb(color)
    let brush = s.initBrush(type, colorRgb, alphaSize)
    ctx.drawImage(
      brush,
      point.x - lineWidth / 2,
      point.y - lineWidth / 2,
      lineWidth,
      lineWidth
    )
  } else if (type == -1) {
    // 填色
    let colorRgbaStr = s.formatColor(color, alphaSize)
    let colorRgbaArr = s.rgbaToArray(colorRgbaStr)
    s.efficientFloodFill(ctx, point.x, point.y, colorRgbaArr)
  }
}

/**
 * 清空画布，重画
 */
MyShape.prototype.clear = function () {
  var s = this
  s.strokes = []
  // 清除画布
  for (let i = 0; i < s.layerArr.length; i++) {
    let element = s.layerArr[i]
    let layer = element.layer
    let layerId = element.layerId
    let ctx = layer.getChildAt(0).bitmapData.getContext('2d')
    ctx.clearRect(0, 0, s.drawingPadWidth, s.drawingPadHeight)
    let previewImg = annie.toDisplayDataURL(
      layer.getChildAt(0),
      { x: 0, y: 0, width: s.clientWidth, height: s.clientWidth },
      { type: 'jpg', quality: 10 }
    )
    switch (s.drawingType) {
      case 1:
        // 涂鸦
        if (s.isEdit) {
          store.commit('setEditLayerPreviewImg', [previewImg, layerId])
        } else {
          store.commit('setLayerPreviewImg', [previewImg, layerId])
        }
        break
      case 2:
        // 填色
        if (s.isEdit) {
          store.commit('setEditColoringPreviewImg', [previewImg, layerId])
        } else {
          store.commit('setColoringPreviewImg', [previewImg, layerId])
        }
        break
    }
  }
  switch (s.drawingType) {
    case 1:
      if (s.isEdit) {
        // 删除绘画记录
        // localStorage.removeItem(s.editStrokesKey)
        s.db.deleteEditStroke(1)
        store.commit('setEditWorkId', '')
      } else {
        s.db.deleteStroke(1)
        // localStorage.removeItem(s.strokesKey)
      }
      break

    case 2:
      if (s.isEdit) {
        // 删除绘画记录
        localStorage.removeItem(s.editStrokesKey)
        store.commit('setEditWorkId', '')
      } else {
        localStorage.removeItem(s.strokesKey)
      }
      break
  }

  // s.init()
  // s.cancelAnimation()
}

/**
 * 播放绘画动画，应该有个状态，标识是否是在播放动画中isAnimation
 */
MyShape.prototype.animate = async function (callback, playControl) {
  var s = this
  callback = callback || ''
  // 动画速度
  s.speed = store.state.playSpeed
  // 重置动画，每次都从头开始播放
  // 清空画布，clearTimeout
  s.layerArr = []
  s.drawingLayer.removeAllChildren()
  store.commit('clearPreviewImgArr')
  s.cancelAnimation()
  s.init()
  s.points = []

  // 正在播放动画中
  s.isAnimation = true

  // 每一个stroke记录的是相同颜色，透明度，宽度的线
  var strokesLength = s.strokes.length
  var strokes = s.strokes
  // 计算总时长
  var totalTime = 0
  for (var i = 0; i < strokesLength; i++) {
    // 图层有可能被删除，所以要判断
    for (let j = 0; j < s.layerArr.length; j++) {
      const element = s.layerArr[j]
      let layerId = 1
      if (strokes[i].z) {
        layerId = strokes[i].z
      }
      if (element.layerId == layerId) {
        totalTime += Math.ceil(strokes[i].lines.length / s.speed)
        break
      }
    }
  }
  // totalTime -= strokesLength
  // 保存总时长
  store.commit('setTotalTime', totalTime)

  // 递归，promise异步
  let asyncStroke = function (i) {
    if (i == strokesLength - 1) {
      // 画最后一条线
      s._stroke(strokes[i], true).then(() => {
        s.isAnimation = false
        if (callback) {
          callback()
        }
      })
    } else {
      // 上一个画完，再画下一个
      if (strokes[i].lines.length == 0) {
        asyncStroke(i + 1)
        // 如果线没有点，则不画
        return
      }
      s._stroke(strokes[i], true).then(() => {
        // if (i + 1 <= 3) asyncStroke(i + 1)
        asyncStroke(i + 1)
      })
    }
  }
  // 从第一条线开始画
  asyncStroke(0)
}

/**
 * 停止所有动画
 */
MyShape.prototype.cancelAnimation = function () {
  var s = this
  if (s.timer) {
    s.timer.stop()
    s.timer.kill()
  }

  // 将播放状态设置为false
  s.isAnimation = false
}

/**
 * 是否正在播放动画
 * @returns {boolean}
 */
MyShape.prototype.checkIsAnimation = function () {
  var s = this
  return s.isAnimation
}

/**
 * 设置当前播放时长，用于计算进度条
 */
MyShape.prototype.setCurrentTime = function () {
  let s = this
  // 当前播放时长
  let currentTime = store.state.playTime
  currentTime++
  store.commit('setPlayTime', currentTime)
}

/**
 * 重新绘制画板单条笔迹
 * @param stroke
 * @private
 */
MyShape.prototype._stroke = async function (stroke, isAnimation) {
  let s = this
  return new Promise((resolve, reject) => {
    // 线条是画到哪个图层上面的
    // 如果没有定义，设置为0

    if (!stroke.z) {
      stroke.z = 1
    }
    let layerId = stroke.z
    let layer = {}
    let layerAlpha = 100
    // 有个bug，stroke.t是空值，暂时不知道这个值是怎么产生的
    // 如果是空值，设置为橡皮擦
    if (!stroke.t) {
      stroke.t = 3
    }
    // 是否播放动画，默认不播放
    isAnimation = isAnimation || false
    // isAnimation = false
    for (let i = 0; i < s.layerArr.length; i++) {
      const element = s.layerArr[i]
      if (element.layerId == layerId) {
        layer = element.layer
        layerAlpha = element.alpha
        break
      }
    }
    // layer 有可能被删除了，所以要判断一下
    if (Object.keys(layer).length === 0) {
      resolve()
      return
    }
    let ctx = layer.getChildAt(0).bitmapData.getContext('2d')
    let ctx2 = layer.getChildAt(1).bitmapData.getContext('2d')

    ctx.globalAlpha = ctx2.globalAlpha = layerAlpha / 100

    let strokeLength = stroke.lines.length

    // 只有一个点
    if (strokeLength == 1) {
      if (isAnimation) {
        let timer = setInterval(() => {
          s.drawFirstPoint(
            ctx,
            stroke.lines[0].s,
            stroke.t,
            stroke.l,
            stroke.a,
            stroke.c
          )
          // 设置当前播放时长
          s.setCurrentTime()
          // 画完后清除timer
          clearInterval(timer)
          store.commit('delPlayTimer', timer)
          resolve()
        }, 1)
        // 保存定时器，用于停止
        store.commit('setPlayTimerArr', timer)
      } else {
        s.drawFirstPoint(
          ctx,
          stroke.lines[0].s,
          stroke.t,
          stroke.l,
          stroke.a,
          stroke.c
        )

        resolve()
      }
    } else {
      ctx.globalCompositeOperation = ctx2.globalCompositeOperation =
        'source-over'
      // 图片画笔
      if (stroke.t >= 4) {
        let p1 = stroke.lines[0].s
        let p2 = stroke.lines[1].e
        let colorRgb = s.formatColorRgb(stroke.c)
        let img = s.initBrush(stroke.t, colorRgb, stroke.a)
        // console.log(img.toDataURL('image/png'))
        if (isAnimation) {
          let i = 0
          let timer = setInterval(() => {
            // 设置当前播放时长
            s.setCurrentTime()
            for (let j = 0; j < s.speed; j++) {
              if (i != 0) {
                if (i < strokeLength - 1) {
                  p1 = stroke.lines[i].e
                  p2 = stroke.lines[i + 1].e
                }
              }
              s.drawBrushPath(ctx, p1, p2, stroke.l, img)
              i++
            }

            // 画完后清除timer
            if (i >= strokeLength - 1) {
              // 如果有最后一个点
              clearInterval(timer)
              store.commit('delPlayTimer', timer)
              if (i == strokeLength - 1) {
                s.setCurrentTime()
              }

              resolve()
            }
          }, 1)
          // 保存定时器，用于停止
          store.commit('setPlayTimerArr', timer)
        } else {
          for (var i = 1; i < strokeLength; i++) {
            s.drawBrushPath(ctx, p1, p2, stroke.l, img)

            if (i < strokeLength - 1) {
              p1 = stroke.lines[i].e
              p2 = stroke.lines[i + 1].e
            }
          }
          resolve()
        }
      } else if (stroke.t == 1 || stroke.t == 3) {
        ctx.miterLimit = ctx2.miterLimit = stroke.l / 2
        ctx.lineWidth = ctx2.lineWidth = stroke.l
        ctx.lineJoin = ctx.lineCap = ctx2.lineJoin = ctx2.lineCap = 'round'
        ctx.globalCompositeOperation = ctx2.globalCompositeOperation =
          'source-over'
        if (stroke.t == 1) {
          ctx.strokeStyle = ctx2.strokeStyle = s.formatColor(stroke.c, stroke.a)
          // s.ctx.shadowBlur = 1
          // s.ctx.shadowColor = stroke.c
        } else if (stroke.t == 3) {
          ctx.strokeStyle = ctx2.strokeStyle = 'rgba(255,255,255,1)'

          ctx.globalCompositeOperation = ctx2.globalCompositeOperation =
            'destination-out'

          // s.ctx.shadowBlur = 0
          // s.ctx.shadowColor = 'rgb(255,255,255)'
        }

        var p1 = stroke.lines[0].s
        var p2 = stroke.lines[1].e

        // 播放动画
        if (isAnimation) {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          s.ctx2Init(ctx2)
          ctx2.beginPath()
          ctx2.moveTo(p1.x, p1.y)

          // setInterval方式
          let i = 0
          let timer = setInterval(() => {
            // 设置当前播放时长
            s.ctx2Init(ctx2)
            for (let j = 0; j < s.speed; j++) {
              if (i != 0) {
                if (i < strokeLength - 1) {
                  p1 = stroke.lines[i].e
                  p2 = stroke.lines[i + 1].e
                }
              }

              // 中点坐标
              let midPoint = s.midPointBtw(p1, p2)
              // 二次贝塞尔曲线绘制
              ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
              ctx2.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
              i++
            }
            // 设置当前播放时长
            s.setCurrentTime()
            // 最后一个点，没有定时器
            // 也有可能恰好没有最后一个点，在上面都画完了
            if (i >= strokeLength - 1) {
              if (i == strokeLength - 1) {
                ctx.lineTo(p1.x, p1.y)
                ctx2.lineTo(p1.x, p1.y)
                // 播放时长+1
                s.setCurrentTime()
              }
              s.ctx2Init(ctx2)
              // 画到展示画布上
              ctx.stroke()
              clearInterval(timer)
              store.commit('delPlayTimer', timer)
              resolve()
            } else {
              ctx2.stroke()
            }
          }, 1)
          // 保存定时器，用于停止
          store.commit('setPlayTimerArr', timer)
        } else {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          for (let i = 1; i < strokeLength; i++) {
            let midPoint = s.midPointBtw(p1, p2)
            // ctx.quadraticCurveTo(midPoint.x, midPoint.y, p2.x, p2.y)
            ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y)
            // s.ctx.lineTo(midPoint.x,midPoint.y);

            if (i < strokeLength - 1) {
              p1 = stroke.lines[i].e
              p2 = stroke.lines[i + 1].e
            } else if (i == strokeLength - 1) {
              p1 = stroke.lines[i].e
              ctx.lineTo(p1.x, p1.y)
            }
          }
          ctx.stroke()
          resolve()
        }
      }
    }
  })
}

/**
 * 重新设置绘画层的图层
 */
MyShape.prototype.resetLayer = function () {
  let s = this
  let layerNum = 0
  let layerArr = []
  switch (s.drawingType) {
    case 1:
      // 涂鸦
      if (s.isEdit) {
        layerNum = store.state.editPreviewImgArr.length
        layerArr = store.state.editPreviewImgArr
      } else {
        layerNum = store.state.previewImgArr.length
        layerArr = store.state.previewImgArr
      }
      break
    case 2:
      // 填色
      if (s.isEdit) {
        layerNum = store.state.editColoringPreviewImgArr.length
        layerArr = store.state.editColoringPreviewImgArr
      } else {
        layerNum = store.state.coloringPreviewImgArr.length
        layerArr = store.state.coloringPreviewImgArr
      }
      break
  }

  let layer = {}
  for (let i = 0; i < layerNum; i++) {
    for (let j = 0; j < s.layerArr.length; j++) {
      if (layerArr[i].layerId == s.layerArr[j].layerId) {
        layer = s.layerArr[j].layer
        break
      }
    }

    s.drawingLayer.addChildAt(layer, i)
  }
}

/**
 * 重新绘制画板所有线条
 */
MyShape.prototype.redraw = function () {
  var s = this
  // s.drawingLayer.removeAllChildren()
  // 清空所有图层
  for (let i = 0; i < s.layerArr.length; i++) {
    const element = s.layerArr[i]
    s.ctx1Init(element.layer.getChildAt(0).bitmapData.getContext('2d'))
  }

  if (s.strokes) {
    var strokes = s.strokes
    for (let i = 0; i < strokes.length; i++) {
      s._stroke(strokes[i])
    }
  }

  for (let i = 0; i < s.layerArr.length; i++) {
    let element = s.layerArr[i]

    let previewImg = annie.toDisplayDataURL(
      element.layer.getChildAt(0),
      { x: 0, y: 0, width: s.clientWidth, height: s.clientWidth },
      { type: 'jpg', quality: 10 }
    )
    switch (s.drawingType) {
      case 1:
        // 涂鸦
        if (s.isEdit) {
          store.commit('setEditLayerPreviewImg', [previewImg, element.layerId])
        } else {
          store.commit('setLayerPreviewImg', [previewImg, element.layerId])
        }
        break
      case 2:
        // 填色
        if (s.isEdit) {
          store.commit('setEditColoringPreviewImg', [
            previewImg,
            element.layerId,
          ])
        } else {
          store.commit('setColoringPreviewImg', [previewImg, element.layerId])
        }
    }
  }
}

/**
 * 还原一步
 */
MyShape.prototype.redo = function () {
  var s = this
  var stroke = s.undoHistory.pop()
  if (stroke) {
    s.strokes.push(stroke)
    // 重新绘制所有
    s.redraw()
    if (s.isEdit) {
      // localStorage.setItem(s.editStrokesKey, JSON.stringify(s.strokes))
      s.db.saveEditStroke(1, JSON.stringify(s.strokes))
    } else {
      s.db.saveStroke(1, JSON.stringify(s.strokes))
      // localStorage.setItem(s.strokesKey, JSON.stringify(s.strokes))
    }

    // s._stroke(stroke)
  }
}

/**
 * 撤销一步
 */
MyShape.prototype.undo = function () {
  var s = this

  // 线条出栈
  // console.log(s.strokes)
  var stroke = s.strokes.pop()
  // console.log(stroke);
  if (stroke) {
    s.undoHistory.push(stroke)
    // 重新绘制所有
    s.redraw()
    if (s.isEdit) {
      // localStorage.setItem(s.editStrokesKey, JSON.stringify(s.strokes))
      s.db.saveEditStroke(1, JSON.stringify(s.strokes))
    } else {
      s.db.saveStroke(1, JSON.stringify(s.strokes))
      // localStorage.setItem(s.strokesKey, JSON.stringify(s.strokes))
    }
  }
}

/**
 * 设置是画笔模式还是橡皮擦模式
 */
MyShape.prototype.setType = function (type) {
  var s = this
  s.type = type
  // 保存状态
  store.commit('setPenType', type)
}

/**
 * 设置strokes
 * @param strokes
 */
MyShape.prototype.setStrokes = function (strokes) {
  var s = this
  // s.init()
  s.strokes = typeof strokes == 'string' ? JSON.parse(strokes) : []
  // 画笔是否初始化完成，初始化完成后，才能绘制，否则会报错，找不到画笔
  if (s.brushArr.length > 0) {
    s.redraw()
  }
}

MyShape.prototype.toJSON = function () {
  var that = this
  if (that.strokes.length == 0) {
    // 没有绘画
    return false
  }
  return JSON.stringify(that.strokes)
}

/**
 * 上传图片到服务器
 */
MyShape.prototype.getBase64 = function (
  removeHeader = true,
  isColoring = false
) {
  var s = this
  if (!isColoring) {
    // 隐藏临摹图层
    s.copyPaintingLayer.visible = false
  }
  // 隐藏橡皮擦图层
  s.eraserSprite.visible = false
  // 隐藏吸色图层
  s.colorPickerSprite.visible = false

  let pic = annie.toDisplayDataURL(
    s,
    {
      x: 0,
      y: 0,
      width: s.clientWidth,
      height: s.clientWidth,
    },
    {
      type: 'png',
    }
  )

  if (removeHeader) {
    pic = pic.replace(/^data:image\/(png|jpeg);base64,/, '')
  }
  if (!isColoring) {
    // 再把临摹图层显示出来
    s.copyPaintingLayer.visible = true
  }

  return pic
}

var Trig = {
  distanceBetween2Points: function (point1, point2) {
    var dx = point2.x - point1.x
    var dy = point2.y - point1.y
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
  },

  angleBetween2Points: function (point1, point2) {
    var dx = point2.x - point1.x
    var dy = point2.y - point1.y
    return Math.atan2(dx, dy)
  },

  getControlPoints: function (point1, point2, point3) {
    let len1 = this.distanceBetween2Points(point1, point2)
    let len2 = this.distanceBetween2Points(point2, point3)
    let k = len1 / len2
    let controlPoint1 = {
      x: (k * (point1.x - point3.x)) / (2 * (1 + k)) + point2.x,
      y: (k * (point1.y - point3.y)) / (2 * (1 + k)) + point2.y,
    }
    let controlPoint2 = {
      x: (k * (point3.x - point1.x)) / (2 * (1 + k)) + point2.x,
      y: (k * (point3.y - point1.y)) / (2 * (1 + k)) + point2.y,
    }
    return [controlPoint1, controlPoint2]
  },
}

export default MyShape
