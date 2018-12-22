import {playMode} from 'common/js/config'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [],
  playMode: playMode.sequence,
  currentIndex: -1,
  isIphone: false,
  audio: null,
  persistSong: false
}

export default state
