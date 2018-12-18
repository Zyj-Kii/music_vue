export default class Singer {
  constructor ({id, singerName, avatar}) {
    this.id = id
    this.singerName = singerName
    this.avatar = `https://y.gtimg.cn/music/photo_new/T001R150x150M000${avatar}.jpg?max_age=2592000`
  }
}
