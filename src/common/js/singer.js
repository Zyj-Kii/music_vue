export default class Singer {
  constructor ({id, singerName}) {
    this.id = id
    this.singerName = singerName
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R150x150M000${id}.jpg?max_age=2592000`
  }
}
