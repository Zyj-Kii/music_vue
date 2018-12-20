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
