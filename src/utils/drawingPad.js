import * as Phaser from 'phaser'
import brushImg from './brush'
import store from '../store'
import { Database } from './database'
import Trig from './trig'

class DrawingPad extends Phaser.Scene {
  constructor(
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
    isEdit, // 是否是编辑模式
    drawingPadOffsetY // 画板偏移量
  ) {
    super()

    let s = this

    // 初始化参数
    // localStorage.clear();
    s.clientWidth = window.innerWidth * window.devicePixelRatio
    s.clientHeight = window.innerHeight * window.devicePixelRatio

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
    // 画布在y轴的偏移量
    s.drawingPadOffsetY = drawingPadOffsetY || 0
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
    s.lineWidth = lineWidth
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
    // 当前的画笔对象
    s.brushObj = {}

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

    // s.drawingLayer = {}
  }

  preload() {
    this.load.image('colorPickerImg', 'assets/img/xise.png')
  }

  create() {
    let s = this
    const cam = s.cameras.main
    let brushFlag = 0
    // 画笔的总数量
    let brushImgTotal = 0
    // 背景层
    s.backLayer = s.add
      .rexCanvas(0, 0, s.drawingPadWidth, s.drawingPadHeight)
      .setOrigin(0, 0)
      .setScale(1 / s.suofang)
    let backLayerCtx = s.backLayer.getContext('2d')

    backLayerCtx.clearRect(0, 0, s.drawingPadWidth, s.drawingPadHeight)
    s.backLayer.y = s.drawingPadOffsetY

    // 填充背景色
    if (s.backgroundColor) {
      backLayerCtx.fillStyle = s.backgroundColor
      backLayerCtx.imageSmoothingEnabled = true
      backLayerCtx.fillRect(0, 0, s.drawingPadWidth, s.drawingPadHeight)
    }

    // 临摹图层
    s.copyPaintingLayer = s.add
      .rexCanvas(0, 0, s.drawingPadWidth, s.drawingPadHeight)
      .setOrigin(0, 0)
      .setScale(1 / s.suofang)
    s.copyPaintingLayerCtx = s.copyPaintingLayer.getContext()
    s.copyPaintingLayer.y = s.drawingPadOffsetY

    // 绘画图层
    s.drawingLayer = s.add.container()
    s.drawingLayer.y = s.drawingPadOffsetY

    // 吸色层
    s.colorPickerSprite = s.add.sprite(0, 0, 'colorPickerImg')
    s.colorPickerSprite.setScale(0.2)
    s.colorPickerSprite.visible = false

    // 橡皮擦层
    s.eraserSprite = s.add.circle(0, 0, s.lineWidth / 2)
    s.eraserSprite.visible = false
    s.eraserSprite.setStrokeStyle(1, 0x000000)

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
      if (s.type == elem.type) {
        s.brushObj = elem
        s.setLineWidth(s.lineWidth, elem.lineWidthTimes || 1)
      }
    }

    // 检查画笔图片是否都加载完了
    var timer = setInterval(function () {
      // 判断已经加载的画笔数量，和总的画笔数是否一致
      if (brushFlag == brushImgTotal) {
        // 清除计时器
        clearInterval(timer)
        for (let [key, value] of Object.entries(s.brushArr)) {
          let brushCanvas = s.textures.createCanvas(
            key,
            value.width,
            value.height
          )
          let brushCtx = brushCanvas.getContext('2d')
          // 表示图片是否平滑
          brushCtx.imageSmoothingEnabled = true
          brushCtx.drawImage(value, 0, 0)
          s.brushDataArr[key] = brushCtx.getImageData(
            0,
            0,
            value.width,
            value.height
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
          s.initLayer()
          s.redraw()
        }
      }
    }, 0)

    // 画笔图案
    s.brush = null

    // 如果画板不可绘画，移除所有监听事件
    if (!s.readonly) {
      // this.container = this.add.container(0, 0, [this.canvas])
      // this.container.y = 161
      this.input.addPointer(1)
      let start1 = {}
      let start2 = {}
      // 控制模式，双指缩放，旋转，移动
      s.controlMode = false
      this.input.on('pointerdown', (pointer) => {
        // 按下两个手指，进入控制模式
        if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
          // 如果是繁花曲线，不允许缩放
          if (s.drawingType == 3) {
            return
          }
          if (s.isDrawing) {
            s.onMouseUp()
          }

          s.controlMode = true
          start1 = {
            x: this.input.pointer1.worldX,
            y: this.input.pointer1.worldY,
          }
          start2 = {
            x: this.input.pointer2.worldX,
            y: this.input.pointer2.worldY,
          }
        } else {
          if (!s.controlMode) {
            s.onMouseDown(pointer)
          }
        }
      })

      this.input.on('pointermove', (pointer, localX, localY, event) => {
        if (this.input.pointer1.isDown && this.input.pointer2.isDown) {
          // 如果不是控制模式
          if (!s.controlMode) {
            return
          }

          // console.log(this.input.pointer1)
          let end1 = {
            x: this.input.pointer1.worldX,
            y: this.input.pointer1.worldY,
          }
          let end2 = {
            x: this.input.pointer2.worldX,
            y: this.input.pointer2.worldY,
          }

          let offsetX = end1.x - start1.x
          let offsetY = end1.y - start1.y

          let res1 = (end1.x - start1.x) * (end2.x - start2.x)
          let res2 = (end1.y - start1.y) * (end2.y - start2.y)

          cam.scrollX -= (offsetX * 0.2) / cam.zoom
          cam.scrollY -= (offsetY * 0.2) / cam.zoom

          if (Math.abs(res1) < 1000 || Math.abs(res2) < 1000) {
            let preLen = Phaser.Math.Distance.Between(
              start1.x,
              start1.y,
              start2.x,
              start2.y
            )
            let newLen = Phaser.Math.Distance.Between(
              end1.x,
              end1.y,
              end2.x,
              end2.y
            )
            if (
              cam.zoom + ((newLen - preLen) / 1000) * cam.zoom < 10 &&
              cam.zoom + ((newLen - preLen) / 1000) * cam.zoom > 0.5
            ) {
              cam.zoom += ((newLen - preLen) / 1000) * cam.zoom
            }

            let rad1 = Phaser.Math.Angle.BetweenPoints(start1, start2)
            let deg1 = Phaser.Math.RadToDeg(rad1)
            let rad2 = Phaser.Math.Angle.BetweenPoints(end1, end2)
            let deg2 = Phaser.Math.RadToDeg(rad2)
            let deg = Phaser.Math.Angle.ShortestBetween(deg1, deg2)
            let angle = Phaser.Math.DegToRad(deg)

            cam.rotation += angle * 0.1
          }
        } else {
          if (!s.controlMode) {
            s.onMouseMove(pointer)
          }
        }
      })

      this.input.on('pointerup', () => {
        // 两个触点抬起来
        if (
          s.controlMode &&
          !this.input.pointer1.isDown &&
          !this.input.pointer2.isDown
        ) {
          s.controlMode = false
          start1 = {}
          start2 = {}
        } else {
          if (!s.controlMode) {
            s.onMouseUp()
          }
        }
      })
    }
  }

  update() {
    // this.canvas.updateTexture()
    let s = this
    // 繁花曲线
    if (s.drawingType == 3 && s.isDrawing) {
      s.fanHuaAngle += 0.1
      s.onMouseMove()
    }
  }

  // 相机复位
  resetCamera() {
    this.cameras.main.resetFX()
    this.cameras.main.zoom = 1
    this.cameras.main.rotation = 0
    this.cameras.main.scrollX = 0
    this.cameras.main.scrollY = 0
  }

  removePointer() {
    console.log(this.input.pointer2)
    console.log(this.input)
  }

  /**
   * 获取颜色rgb数组[r,g,b]
   * @param {*} color
   * @returns
   */
  formatColorRgb(color) {
    color = color.substr(4)
    color = color.substr(0, color.length - 1)
    return color.split(',')
  }

  /**
   * 生成rgba格式颜色
   * @param {*} color
   * @param {*} alphaSize
   * @returns
   */
  formatColor(color, alphaSize) {
    try {
      color = color.substr(4)
      color = color.substr(0, color.length - 1)
      return 'rgba(' + color + ',' + alphaSize + ')'
    } catch (error) {}
  }

  /**
   * 画笔类型初始化
   */
  penTypeInit() {
    let s = this
    let type = store.state.penType
    if (s.drawingType == 3) {
      // 如果是繁花曲线，则固定为1
      type = 1
    }
    return type
  }

  /**
   * 图层初始化
   */
  initLayer() {
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
          case 3:
            // 繁花曲线
            if (s.isEdit) {
              layerNum = store.state.editFlowerPreviewImgArr.length
              layerArr = store.state.editFlowerPreviewImgArr
            } else {
              layerNum = store.state.flowerPreviewImgArr.length
              layerArr = store.state.flowerPreviewImgArr
            }
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
   * 添加图层
   * 每个图层有两个画板，一个用来展示绘画的动画，一个用来记录绘画的所有笔迹
   * @param {*} childAt 第几层
   * @param {*} visible 是否可见
   * @param {*} alpha 透明度
   * @param {*} layerId 图层id，用来区分不同的图层
   */
  addLayer(childAt = 0, visible = true, alpha = 100, layerId = 1) {
    let s = this
    let layer = s.add.container(0, 0)

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
    s.drawingLayer.addAt(layer, childAt)

    // 画板1
    // 两层画布，第一层画布，展示绘画过程，画完一笔后，将笔迹画到第二层画布上保留，第一层画布清空
    // 所有的绘画最终都画在画板1上
    // let bitmap1 = new annie.Bitmap(document.createElement('canvas'))
    let bitmap1 = this.add
      .rexCanvas(0, 0, s.drawingPadWidth, s.drawingPadHeight)
      .setInteractive()
      .setOrigin(0, 0)
      .setScale(1 / s.suofang)
      .needRedraw()
    layer.addAt(bitmap1, 0)
    let ctx = bitmap1.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.globalAlpha = alpha / 100
    // s.ctx.globalCompositeOperation = 'multiply'

    // 画板2
    // 为了方便展示绘画的过程
    let bitmap2 = this.add
      .rexCanvas(0, 0, s.drawingPadWidth, s.drawingPadHeight)
      .setInteractive()
      .setOrigin(0, 0)
      .setScale(1 / s.suofang)
      .needRedraw()
    layer.addAt(bitmap2, 1)

    let ctx2 = bitmap2.getContext('2d')
    ctx2.imageSmoothingEnabled = true
    ctx2.globalAlpha = alpha / 100

    s.ctx1Init(ctx)
    s.ctx2Init(ctx2)

    // 绘画模式
    if (!s.readonly) {
      // 预览图
      let previewImg = layer.getAt(0).getDataURL('image/png')
      // 压缩图片
      let previewCanvas = document.createElement('canvas')
      previewCanvas.width = 100
      previewCanvas.height = 100
      let image = new Image()
      image.src = previewImg
      image.onload = function () {
        let ctx = previewCanvas.getContext('2d')
        ctx.drawImage(image, 0, 0, previewCanvas.width, previewCanvas.height)
        previewImg = previewCanvas.toDataURL('image/png')

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
              store.commit('setEditColoringPreviewImgArr', [
                previewImg,
                layerId,
              ])
              store.commit('setLayerId', s.layerId)
            } else {
              store.commit('setColoringPreviewImgArr', [previewImg, layerId])
              store.commit('setEditLayerId', s.layerId)
            }
            break
          case 3:
            // 繁花曲线
            if (s.isEdit) {
              store.commit('setEditFlowerPreviewImgArr', [previewImg, layerId])
              store.commit('setLayerId', s.layerId)
            } else {
              store.commit('setFlowerPreviewImgArr', [previewImg, layerId])
              store.commit('setEditLayerId', s.layerId)
            }
        }

        s.nowLayer = layer
      }
    }
  }

  /**
   * 所有的绘画最终都画在画板1上
   */
  ctx1Init(ctx) {
    var s = this
    // 清空绘画区域
    ctx.clearRect(0, 0, s.drawingPadWidth, s.drawingPadHeight)
  }

  /**
   * 画板2为了方便展示动画，一条线画完后，将画板重置，将线条画到画板1上
   */
  ctx2Init(ctx2, ctx1) {
    var s = this
    // 清空画板2
    ctx2.clearRect(0, 0, s.drawingPadWidth, s.drawingPadHeight)
    if (ctx1) {
      ctx2.drawImage(ctx1, 0, 0, s.drawingPadWidth, s.drawingPadHeight)
    }
  }

  /**
   * 重新绘制画板所有线条
   */
  redraw() {
    var s = this
    // s.drawingLayer.removeAllChildren()
    // 清空所有图层
    for (let i = 0; i < s.layerArr.length; i++) {
      let element = s.layerArr[i]
      let canvas = element.layer.getAt(0)
      s.ctx1Init(canvas.getContext('2d'))
      // canvas.updateTexture()
    }

    if (s.strokes) {
      var strokes = s.strokes
      for (let i = 0; i < strokes.length; i++) {
        s._stroke(strokes[i])
      }
    }

    for (let i = 0; i < s.layerArr.length; i++) {
      let element = s.layerArr[i]

      let previewImg = element.layer.getAt(0).getDataURL('image/png')
      // 压缩图片
      let previewCanvas = document.createElement('canvas')
      previewCanvas.width = 100
      previewCanvas.height = 100
      let image = new Image()
      image.src = previewImg
      image.onload = function () {
        let ctx = previewCanvas.getContext('2d')
        ctx.drawImage(image, 0, 0, previewCanvas.width, previewCanvas.height)
        previewImg = previewCanvas.toDataURL('image/png')
        switch (s.drawingType) {
          case 1:
            // 涂鸦
            if (s.isEdit) {
              store.commit('setEditLayerPreviewImg', [
                previewImg,
                element.layerId,
              ])
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
              store.commit('setColoringPreviewImg', [
                previewImg,
                element.layerId,
              ])
            }
            break
          case 3:
            // 繁花曲线
            if (s.isEdit) {
              store.commit('setEditFlowerPreviewImg', [
                previewImg,
                element.layerId,
              ])
            } else {
              store.commit('setFlowerPreviewImg', [previewImg, element.layerId])
            }
            break
        }
      }
    }
  }

  /**
   * 获取点的位置
   * @param e
   * @param suofang 画布是有缩放值的，橡皮擦图层没有缩放值
   * @private
   */
  _position(e, suofang = true) {
    let s = this
    let point = {
      x: e.worldX,
      y: suofang ? e.worldY - s.drawingPadOffsetY : e.worldY,
    }

    let data = {
      x: suofang ? Math.round(point.x * s.suofang) : point.x,
      y: suofang ? Math.round(point.y * s.suofang) : point.y,
    }
    return data
  }

  /**
   * 手指接触屏幕，开始绘画
   * @param e
   */
  onMouseDown(e) {
    var s = this
    setTimeout(() => {
      if (s.controlMode) {
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
        vant.Toast.fail('当前图层是隐藏的')
        return
      }
      // 正在绘画
      s.isDrawing = true
      // 只要画了一笔，就将保存状态设置为false
      store.commit('setIsSaveStatus', false)
      // 生成点
      e = s.generatePoints(e)
      // 获取点的相对于画布的坐标位置
      s._lastPosition = s._position(e)
      s.noSuofangPosition = s._position(e, false)

      // s.points记录点的坐标
      // 吸取颜色，不记录坐标
      // 记录当前的设置，颜色，画笔宽度，透明度，画笔类型，点的坐标
      s._currentStroke = {
        c: s.color,
        l: s.lineWidth,
        a: s.alphaSize,
        t: s.type,
        s: 1, // 笔刷spacing值
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
      let ctx = layer.getAt(0).getContext('2d')
      let ctx2 = layer.getAt(1).getContext('2d')

      // s.ctx.miterLimit = s.ctx2.miterLimit = s.lineWidth / 2
      ctx.lineWidth = ctx2.lineWidth = s.lineWidth
      // 决定了两条线段相交时如何绘制焦点，只有当两条线段方向不同时，才会生效。可取值：bevel，round，miter。默认值是miter
      ctx.lineJoin = ctx2.lineJoin = 'round'
      // 该值告诉浏览器如何绘制线段的端点，可选值为以下三个之一：butt，round，square。默认为butt。
      ctx.lineCap = ctx2.lineCap = 'round'
      ctx.globalCompositeOperation = ctx2.globalCompositeOperation =
        'source-over'
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
        s.drawColorPicker(s.noSuofangPosition.x, s.noSuofangPosition.y)
        s.showColorPicker()
      } else if (s.type >= 4) {
        // 使用图片渲染的画笔，初始化画笔
        s.brush = s.initBrush(s.type, s.colorRgb, s.alphaSize)
        s._currentStroke.s = s.brushObj.spacing
        // ctx.strokeStyle = ctx.createPattern(s.brush, 'repeat')
        // ctx2.strokeStyle = ctx2.createPattern(s.brush, 'repeat')
        // console.log(s.brush)
      }
    }, 50)
  }

  /**
   *  移动画线
   * @param {*} e
   * @returns
   */
  onMouseMove(e) {
    var s = this
    // 是否在绘画状态
    if (!s.isDrawing || s.type == -1) return
    // 生成点
    e = s.generatePoints(e)

    // 当前的点坐标
    s.currentPosition = s._position(e)
    s.noSuofangPosition = s._position(e, false)
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
    let ctx = layer.getAt(0).getContext('2d')
    let ctx2 = layer.getAt(1).getContext('2d')
    ctx.globalAlpha = ctx2.globalAlpha = layerAlpha / 100
    s.noSuofangPosition = s._position(e, false)
    // 图片画笔
    if (s.type >= 4) {
      // 鼠标按下的点
      p1 = s._lastPosition
      // 滑动到当前的点
      p2 = s.currentPosition
      s.drawBrushPath(ctx2, p1, p2, s.lineWidth, s.brush, s._currentStroke.s)
    } else {
      if (s.type == 1 || s.type == 3) {
        if (s.type == 3) {
          // 橡皮擦
          // 显示橡皮擦

          s.drawEraser(s.noSuofangPosition.x, s.noSuofangPosition.y)
          s.showEraser()
        }
        s.ctx2Init(ctx2)
        ctx2.beginPath()
        ctx.beginPath()
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
        s.drawColorPicker(s.noSuofangPosition.x, s.noSuofangPosition.y)
      }
    }
    // layer.getAt(0).updateTexture()
    // layer.getAt(1).updateTexture()

    if (s.type != 2) {
      s._currentStroke.lines.push({
        s: s._lastPosition,
        e: s.currentPosition,
      })
    }
    s._lastPosition = s.currentPosition
  }

  /**
   * 绘画结束
   * @returns
   */
  onMouseUp() {
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
    let ctx = layer.getAt(0).getContext('2d')
    let ctx2 = layer.getAt(1).getContext('2d')
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
          s.drawBrushPath(ctx, p1, p2, s.lineWidth, s.brush, s._currentStroke.s)
          p1 = s.points[i]
          p2 = s.points[i + 1]
        }
      }
    }
    // layer.getAt(0).updateTexture()
    // layer.getAt(1).updateTexture()
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
    let previewImg = layer.getAt(0).getDataURL('image/png')
    // 图片太大，压缩一下
    let previewCanvas = document.createElement('canvas')
    previewCanvas.width = 100
    previewCanvas.height = 100
    let image = new Image()
    image.src = previewImg
    image.onload = function () {
      let ctx = previewCanvas.getContext('2d')
      ctx.drawImage(image, 0, 0, previewCanvas.width, previewCanvas.height)
      previewImg = previewCanvas.toDataURL('image/png')
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
        case 3:
          // 繁花曲线
          if (s.isEdit) {
            store.commit('setEditFlowerPreviewImg', [previewImg, s.layerId])
          } else {
            store.commit('setFlowerPreviewImg', [previewImg, s.layerId])
          }
      }
    }
    // previewCanvas.resize(400, 400)
  }

  /**
   * 画第一个点，或者填色
   * @param point
   * @param type
   * @param lineWidth
   * @param alphaSize
   * @param color
   */
  drawFirstPoint(ctx, point, type, lineWidth, alphaSize, color) {
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
   * 使用图片渲染的画笔
   * 初始化画笔
   * @param colorRgb
   * @param alphaSize
   * @param callback
   */
  initBrush(type, colorRgb, alphaSize) {
    var s = this
    // 第一个画笔是马克笔，type=4
    // 第二个画笔是方头笔，type=5
    let brushData = []
    let brushName = ''
    for (let [index, elem] of s.brushImg.entries()) {
      if (type == elem.type) {
        s.brushObj = elem
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

      s.brushCanvas = document.createElement('canvas')
      s.brushCanvas.width = brushData.width
      s.brushCanvas.height = brushData.height

      s.brushCtx = s.brushCanvas.getContext('2d')
      // 用于设置图片是否平滑，也就是是否抗锯齿，默认为true，表示图片平滑，false表示图片不平滑
      s.brushCtx.imageSmoothingEnabled = true
      s.brushCtx.putImageData(brushData, 0, 0)
      // 返回经过处理的画笔图片
      // var img = s.brushEl.toDataURL("image/png");
      return s.brushCanvas
    }
  }

  /**
   * 重新绘制画板单条笔迹
   * @param stroke
   * @private
   */
  async _stroke(stroke, isAnimation) {
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
      let ctx = layer.getAt(0).getContext('2d')
      let ctx2 = layer.getAt(1).getContext('2d')

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
            // layer.getAt(0).updateTexture()
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
          // layer.getAt(0).updateTexture()

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
          // let brushObj = {}
          // for (let [, elem] of s.brushImg.entries()) {
          //   if (stroke.t == elem.type) {
          //     brushObj = elem
          //     break
          //   }
          // }
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

                s.drawBrushPath(ctx, p1, p2, stroke.l, img, stroke.s || 1)
                // layer.getAt(0).updateTexture()
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
              s.drawBrushPath(ctx, p1, p2, stroke.l, img, stroke.s || 1)
              // layer.getAt(0).updateTexture()
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
            ctx.strokeStyle = ctx2.strokeStyle = s.formatColor(
              stroke.c,
              stroke.a
            )
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
                // layer.getAt(0).updateTexture()
                clearInterval(timer)
                store.commit('delPlayTimer', timer)
                resolve()
              } else {
                ctx2.stroke()
                // layer.getAt(1).updateTexture()
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
            // layer.getAt(0).updateTexture()
            resolve()
          }
        }
      }
    })
  }

  /**
   * 设置当前播放时长，用于计算进度条
   */
  setCurrentTime() {
    // 当前播放时长
    let currentTime = store.state.playTime
    currentTime++
    store.commit('setPlayTime', currentTime)
  }

  /**
   * 两个点的中点坐标
   * @param p1
   * @param p2
   * @returns {{x: *, y: *}}
   */
  midPointBtw(p1, p2) {
    return {
      x: (parseFloat(p1.x) + parseFloat(p2.x)) / 2,
      y: (parseFloat(p1.y) + parseFloat(p2.y)) / 2,
    }
  }

  /**
   * 绘画数据转json字符串
   * @returns
   */
  toJSON() {
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
  getBase64(removeHeader = true, isColoring = false, callback) {
    var s = this
    s.resetCamera()
    if (!isColoring) {
      // 隐藏临摹图层
      s.copyPaintingLayer.visible = false
    }
    // 隐藏橡皮擦图层
    s.eraserSprite.visible = false
    // 隐藏吸色图层
    s.colorPickerSprite.visible = false
    let pic = ''
    s.game.renderer.snapshotArea(
      0,
      s.drawingPadOffsetY,
      s.clientWidth,
      s.clientWidth,
      (image) => {
        let previewCanvas = document.createElement('canvas')
        previewCanvas.width = window.innerWidth
        previewCanvas.height = window.innerWidth

        let ctx = previewCanvas.getContext('2d')
        ctx.drawImage(image, 0, 0, previewCanvas.width, previewCanvas.height)
        let pic = previewCanvas.toDataURL('image/png')
        if (removeHeader) {
          pic = pic.replace(/^data:image\/(png|jpeg);base64,/, '')
        }
        if (!isColoring) {
          // 再把临摹图层显示出来
          s.copyPaintingLayer.visible = true
        }
        callback(pic)
      }
    )
  }

  /**
   * 设置临摹图片
   * @param {*} imgBase64
   */
  setCopyPaintingImage(imgBase64) {
    let s = this
    // 表示图片是否平滑
    s.copyPaintingLayerCtx.clearRect(
      0,
      0,
      s.drawingPadWidth,
      s.drawingPadHeight
    )
    // s.copyPaintingLayerCtx.imageSmoothingEnabled = true
    s.copyPaintingLayerCtx.globalAlpha =
      store.state.copyPaintingLayerAlpha / 100
    var img = new Image()
    img.src = imgBase64
    img.onload = function () {
      //必须onload之后再画
      if (img.width >= img.height) {
        s.copyPaintingLayerCtx.drawImage(
          img,
          0,
          (s.drawingPadWidth - (img.height * s.drawingPadHeight) / img.width) /
            2,
          s.drawingPadWidth,
          (img.height * s.drawingPadHeight) / img.width
        )
      } else {
        s.copyPaintingLayerCtx.drawImage(
          img,
          (s.drawingPadWidth - (img.width * s.drawingPadHeight) / img.height) /
            2,
          0,
          (img.width * s.drawingPadHeight) / img.height,
          s.drawingPadHeight
        )
      }
      // s.copyPaintingLayer.updateTexture()
    }
  }

  /**
   * 设置临摹图层透明度
   * @param {*} alpha 0到100
   */
  setCopyPaintingAlpha(alpha) {
    let s = this
    if (!store.state.copyPaintingLayerImg) {
      return
    }
    s.copyPaintingLayerCtx.clearRect(
      0,
      0,
      s.drawingPadWidth,
      s.drawingPadHeight
    )
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
          (s.drawingPadWidth - (img.height * s.drawingPadHeight) / img.width) /
            2,
          s.drawingPadWidth,
          (img.height * s.drawingPadHeight) / img.width
        )
      } else {
        s.copyPaintingLayerCtx.drawImage(
          img,
          (s.drawingPadWidth - (img.width * s.drawingPadHeight) / img.height) /
            2,
          0,
          (img.width * s.drawingPadHeight) / img.height,
          s.drawingPadHeight
        )
      }
      // s.copyPaintingLayer.updateTexture()
    }
  }

  /**
   * 删除临摹图片
   * @returns
   */
  delCopyPaintingImage() {
    let s = this
    s.copyPaintingLayerCtx.clearRect(
      0,
      0,
      s.drawingPadWidth,
      s.drawingPadHeight
    )
    // s.copyPaintingLayer.updateTexture()
  }

  /**
   * 判断两个位置的像素点是否相同
   * @param {*} colorLayer
   * @param {*} pixelPos
   * @param {*} color
   * @returns
   */
  matchColor(colorLayer, pixelPos, color) {
    return (
      colorLayer.data[pixelPos] === color[0] &&
      colorLayer.data[pixelPos + 1] === color[1] &&
      colorLayer.data[pixelPos + 2] === color[2] &&
      colorLayer.data[pixelPos + 3] === color[3]
    )
  }

  /**
   * 高效的填充算法
   * @param {*} ctx
   * @param {*} startX
   * @param {*} startY
   * @param {*} fillColor
   */
  efficientFloodFill(ctx, startX, startY, fillColor) {
    let s = this
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
   * rgba格式转为数组，透明度为255进制
   * @param {*} value
   * @returns
   */
  rgbaToArray(value) {
    value = value.substr(5)
    value = value.substr(0, value.length - 1)
    let arr = value.split(',')
    return [arr[0], arr[1], arr[2], Math.round(arr[3] * 255)]
  }

  /**
   * 清空画布，重画
   */
  clear() {
    var s = this
    s.strokes = []
    // 清除画布
    for (let i = 0; i < s.layerArr.length; i++) {
      let element = s.layerArr[i]
      let layer = element.layer
      let layerId = element.layerId
      let ctx = layer.getAt(0).getContext('2d')
      ctx.clearRect(0, 0, s.drawingPadWidth, s.drawingPadHeight)
      // layer.getAt(0).updateTexture()
      let previewImg = layer.getAt(0).getDataURL('image/png')
      // 压缩图片
      let previewCanvas = document.createElement('canvas')
      previewCanvas.width = 100
      previewCanvas.height = 100
      let image = new Image()
      image.src = previewImg
      image.onload = function () {
        let ctx = previewCanvas.getContext('2d')
        ctx.drawImage(image, 0, 0, previewCanvas.width, previewCanvas.height)
        previewImg = previewCanvas.toDataURL('image/png')
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
          case 3:
            // 繁花曲线
            if (s.isEdit) {
              store.commit('setEditFlowerPreviewImg', [previewImg, layerId])
            } else {
              store.commit('setFlowerPreviewImg', [previewImg, layerId])
            }
            break
        }
      }
    }
    switch (s.drawingType) {
      case 1:
      case 3:
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
  }

  /**
   * 获取随机值
   * @param {*} min
   * @param {*} max
   * @returns
   */
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 绘制笔刷线条
   * @param {*} p1
   * @param {*} p2
   */
  drawBrushPath(ctx, p1, p2, lineWidth, brush, spacing = 1) {
    let s = this
    // // 两点之间的直线距离
    var distance = parseInt(Phaser.Math.Distance.BetweenPoints(p1, p2))
    // // var angle = Phaser.Math.Angle.BetweenPoints(p1, p2)
    var angle = Trig.angleBetween2Points(p1, p2)
    for (let i = 0; i < distance; i += lineWidth * spacing) {
      let x = p1.x + i * Math.sin(angle)
      let y = p1.y + i * Math.cos(angle)
      ctx.save()
      ctx.translate(x, y)
      // ctx.rotate((Phaser.Math.RadToDeg(angle) * Math.PI) / 180)
      ctx.drawImage(brush, -lineWidth / 2, -lineWidth / 2, lineWidth, lineWidth)
      ctx.restore()
    }
    // // 填充两点之间的点
    // var spacing = s.getSpacing(lineWidth)
    // let anchorpoints = [p1, p2]
    // 生成贝塞尔曲线点，根据两点之间的距离，计算出贝塞尔曲线点的个数，距离越大，点越多
    // let points = this.CreateBezierPoints(
    //   anchorpoints,
    //   Math.ceil((distance / lineWidth) * 3)
    // )
    // let points = this.CreateBezierPoints(anchorpoints, Math.ceil(distance))
    // // // 绘制笔刷
    // for (let i = 0, len = points.length; i < len; i += 5) {
    //   let point = points[i]
    //   let x = point.x
    //   let y = point.y
    //   ctx.save()
    //   ctx.translate(x, y)
    //   // ctx.rotate((Phaser.Math.RadToDeg(angle) * Math.PI) / 180)
    //   ctx.drawImage(brush, -lineWidth / 2, -lineWidth / 2, lineWidth, lineWidth)
    //   ctx.restore()
    // }
  }

  /**
   * 生成贝塞尔曲线上的点
   * @param {*} anchorpoints 控制点
   * @param {*} pointsAmount 生成的点的数量
   * @returns
   */
  CreateBezierPoints(anchorpoints, pointsAmount) {
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
  MultiPointBezier(points, t) {
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
   * 设置画笔大小
   * @param lineWidth 画笔大小
   * @param lineWidthTimes 笔刷大小倍数
   */
  setLineWidth(lineWidth, lineWidthTimes = 1) {
    let s = this
    s.lineWidth = lineWidth * s.suofang * lineWidthTimes || 1
  }

  /**
   * 设置透明度
   * @param alphaSize
   */
  setAlphaSize(alphaSize) {
    let s = this
    s.alphaSize = alphaSize
    s.rgbaColor = s.formatColor(s.color, s.alphaSize)
    // s.brush = s.initBrush(s.colorRgb, s.alphaSize)
  }

  /**
   * 设置是画笔模式还是橡皮擦模式
   */
  setType(type) {
    let s = this
    s.type = type
    // 保存状态
    store.commit('setPenType', type)
  }
  /**
   * 设置画笔颜色
   * @param color
   */
  setColor(color) {
    let s = this
    s.color = color
    s.rgbaColor = s.formatColor(s.color, s.alphaSize)
    s.colorRgb = s.formatColorRgb(s.color)

    // s.brush = s.initBrush(s.colorRgb, s.alphaSize)
  }

  /**
   * 移动取色器，获取当前颜色
   * @param {*} x
   * @param {*} y
   * @param {*} e
   */
  drawColorPicker(x, y) {
    let s = this
    s.colorPickerSprite.x = x
    s.colorPickerSprite.y = y

    s.game.renderer.snapshotPixel(
      s.noSuofangPosition.x,
      s.noSuofangPosition.y,
      function (pixel) {
        s.color = 'rgb(' + pixel.r + ',' + pixel.g + ',' + pixel.b + ')'
        s.setColor(s.color)
        // 更改store存储的值
        store.commit('setDrawingPadRgbColor', s.color)
      }
    )
    // 当前像素的颜色
  }

  /**
   * 显示吸色针管图标
   */
  showColorPicker() {
    let s = this
    s.colorPickerSprite.visible = true
  }

  /**
   * 隐藏吸色针管图标
   */
  hideColorPicker() {
    let s = this
    s.colorPickerSprite.visible = false
  }

  /**
   * 绘制橡皮擦的圈圈
   */
  drawEraser(x, y) {
    let s = this

    s.eraserSprite.x = x
    s.eraserSprite.y = y
  }

  /**
   * 显示橡皮擦
   */
  showEraser() {
    let s = this
    s.eraserSprite.visible = true
  }

  /**
   * 隐藏橡皮擦
   */
  hideEraser() {
    let s = this
    s.eraserSprite.visible = false
  }

  /**
   * 更改图层
   * @param {*} layerId
   */
  changeLayer(layerId) {
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
  changeLayerVisible(layerId) {
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
  setLayerAlpha(layerId, alpha) {
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
   * 删除某个图层
   * @param {*} layerId
   */
  delLayer(layerId) {
    let s = this
    for (let i = 0; i < s.layerArr.length; i++) {
      const element = s.layerArr[i]
      if (element.layerId == layerId) {
        s.drawingLayer.remove(element.layer)
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
      case 3:
        // 繁花曲线
        if (s.isEdit) {
          store.commit('delEditFlowerPreviewImgArr', layerId)
        } else {
          store.commit('delFlowerPreviewImgArr', layerId)
        }
    }
  }

  /**
   * 清空图层
   * @param {*} layerId
   */
  clearLayer(layerId) {
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
  changeMoveCopyPaintingLayer() {
    let s = this
    s.moveCopyPaintingLayer = !s.moveCopyPaintingLayer
  }

  /**
   * 撤销一步
   */
  undo() {
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
   * 还原一步
   */
  redo() {
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
    }
  }

  /**
   * 停止所有动画
   */
  cancelAnimation() {
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
  checkIsAnimation() {
    var s = this
    return s.isAnimation
  }

  /**
   * 播放绘画动画，应该有个状态，标识是否是在播放动画中isAnimation
   */
  animate(callback, playControl) {
    var s = this
    callback = callback || ''
    // 动画速度
    s.speed = store.state.playSpeed
    // 重置动画，每次都从头开始播放
    // 清空画布，clearTimeout
    s.layerArr = []
    s.drawingLayer.removeAll(true)
    store.commit('clearPreviewImgArr')
    s.cancelAnimation()
    s.initLayer()
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
   * 重新设置绘画层的图层
   */
  resetLayer() {
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
      case 3:
        // 繁花曲线
        if (s.isEdit) {
          layerNum = store.state.editFlowerPreviewImgArr.length
          layerArr = store.state.editFlowerPreviewImgArr
        } else {
          layerNum = store.state.flowerPreviewImgArr.length
          layerArr = store.state.flowerPreviewImgArr
        }
    }

    let layer = {}
    for (let i = 0; i < layerNum; i++) {
      for (let j = 0; j < s.layerArr.length; j++) {
        if (layerArr[i].layerId == s.layerArr[j].layerId) {
          layer = s.layerArr[j].layer
          break
        }
      }
      s.drawingLayer.moveTo(layer, i)
      // s.drawingLayer.setDepth(layer, i)
    }
  }

  /**
   * 繁花曲线初始化
   * @returns
   */
  initFanHua() {
    let s = this
    // 繁花曲线旋转角度
    s.fanHuaAngle = 0
    // 大圆的半径
    s.fanHuaBigR = 336
    // 小圆的半径
    s.fanHuaSmallR = 165
    // 控制参数
    s.fanHuaK = 100
  }

  /**
   * 更改繁花曲线的参数
   */
  changeFanHuaK = function (k) {
    let s = this
    s.fanHuaK = k
  }

  /**
   * 更改繁花曲线的大圆半径
   */
  changeFanHuaBigR = function (r) {
    let s = this
    s.fanHuaBigR = r
  }

  /**
   * 更改繁花曲线的小圆半径
   */
  changeFanHuaSmallR = function (r) {
    let s = this
    s.fanHuaSmallR = r
  }

  /**
   * 开始绘制繁花曲线
   */
  startFlowerDraw() {
    let s = this
    s.onMouseDown()
  }

  /**
   * 停止绘制繁花曲线
   */
  stopFlowerDraw() {
    let s = this
    s.onMouseUp()
  }

  /**
   * 生成点
   * 根据绘画模式返回对应的坐标
   * 正常模式是手指绘画，返回的就是触点的坐标，也就是e
   * 繁花曲线模式，通过一个方程生成对应的坐标点
   * @param {*} e 触摸事件返回的参数
   * @returns
   */
  generatePoints(e) {
    let s = this
    let R, r, k, x, y
    switch (s.drawingType) {
      // 手指绘画，直接返回e，不做处理
      case 1:
      case 2:
        break
      // 繁花曲线，通过方程生成对应的点的坐标
      case 3:
        R = s.fanHuaBigR
        r = s.fanHuaSmallR
        k = s.fanHuaK
        x =
          (R - r) * Math.cos(s.fanHuaAngle) +
          k * Math.cos(((R - r) / r) * s.fanHuaAngle) +
          (window.innerWidth * window.devicePixelRatio) / 2

        y =
          (R - r) * Math.sin(s.fanHuaAngle) -
          k * Math.sin(((R - r) / r) * s.fanHuaAngle) +
          (window.innerHeight * window.devicePixelRatio) / 2
        e = {
          worldX: x,
          worldY: y,
        }
        break
    }
    return e
  }
}

export default DrawingPad
