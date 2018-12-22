import * as types from './mutation-types'

const mutations = {
  [types.SET_SINGER] (state, singer) {
    state.singer = singer
  },
  [types.SET_PLAYING_STATE] (state, flag) {
    state.playing = flag
  },
  [types.SET_FULL_SCREEN] (state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST] (state, list) {
    state.playlist = list
  },
  [types.SET_SEQUENCE_LIST] (state, list) {
    state.sequenceList = list
  },
  [types.SET_PLAY_MODE] (state, mode) {
    state.playMode = mode
  },
  [types.SET_CURRENT_INDEX] (state, index) {
    state.currentIndex = index
  },
  [types.SET_CURRENT_URL] (state, {filename, vkey, error}) {
    if (error === 0) {
      state.playlist[state.currentIndex].url = `http://dl.stream.qqmusic.qq.com/${filename}?fromtag=38&guid=5931742855&vkey=${vkey}`
    } else {
      state.playlist[state.currentIndex].url = ''
    }
  },
  [types.SET_IPHONE] (state, flag) {
    state.isIphone = flag
  },
  [types.SET_AUDIO] (state, audio) {
    state.audio = audio
  },
  [types.SET_PERSIST_SONG] (state, flag) {
    state.persistSong = flag
  }
}

export default mutations
