import Dexie from 'dexie'

export class Database extends Dexie {
  constructor() {
    super('database')

    this.version(3).stores({
      strokes: '++id',
      edit_strokes: '++id',
      path: '++id',
    })

    this.strokes = this.table('strokes')
    this.editStrokes = this.table('edit_strokes')
    this.path = this.table('path')
  }

  // 保存笔画
  async saveStroke(id, path) {
    return await this.strokes.put({ id, path })
  }

  // 保存编辑的笔画
  async saveEditStroke(id, path) {
    return await this.editStrokes.put({ id, path })
  }

  // 保存到path
  async savePath(id, path, pic, width, height, layer) {
    let data = {
      path: path,
      pic: pic,
      width: width,
      height: height,
      layer: layer,
    }
    if (id) {
      data.id = id
    }
    return await this.path.put(data)
  }

  // 获取所有path
  async getAllPath() {
    return await this.path.toArray()
  }

  // 根据id获取path
  async getPathById(id) {
    return await this.path.get(id)
  }

  // 根据id删除path
  async deletePath(id) {
    return await this.path.delete(id)
  }

  // 获取所有笔画
  async getAllStrokes() {
    return await this.strokes.toArray()
  }

  // 获取所有编辑的笔画
  async getAllEditStrokes() {
    return await this.editStrokes.toArray()
  }

  // 根据id获取笔画
  async getStrokesById(id) {
    return await this.strokes.get(id)
  }

  // 根据id获取编辑的笔画
  async getEditStrokesById(id) {
    return await this.editStrokes.get(id)
  }

  // 删除笔画
  async deleteStroke(id) {
    return await this.strokes.delete(id)
  }

  // 删除编辑的笔画
  async deleteEditStroke(id) {
    return await this.editStrokes.delete(id)
  }
}
