import {getLyric} from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'
export default class Song {
  constructor ({id, mid, singer, songName, album, duration, image}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.songName = songName
    this.album = album
    this.duration = duration
    this.image = image
    this.url = ''
  }
  getLyric () {
    if (!this.lyric) {
      return new Promise((resolve, reject) => {
        getLyric(this.mid)
          .then(res => {
            if (res.code === ERR_OK) {
              this.lyric = Base64.decode(res.lyric)
              resolve(this.lyric)
            } else {
              this.lyric = 'none'
              reject(new Error('no lyric'))
            }
          })
      })
    } else if (this.lyric !== 'none') {
      return Promise.resolve(this.lyric)
    } else {
      return Promise.reject(new Error('no lyric'))
    }
  }
}

export function createSong (musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    songName: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`
  })
}

function filterSinger (singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach(item => {
    ret.push(item.name)
  })
  return ret.join('/')
}
