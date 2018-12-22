import * as types from './mutation-types'
import {getSongVKey} from 'api/singer'
import {ERR_OK} from 'api/config'

export const selectPlay = ({commit, state}, {list, index}) => {
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
  if (state.playlist[state.currentIndex].url === '') {
    getKey(state, commit)
  }
}

export const setCurrentIndex = ({commit, state}, index) => {
  commit(types.SET_CURRENT_INDEX, index)
  if (!state.persistSong && state.playlist[state.currentIndex].url === '') {
    getKey(state, commit)
  }
}

function getKey (state, commit) {
  getSongVKey(state.playlist[state.currentIndex].mid)
    .then(res => {
      if (res.code === ERR_OK) {
        const filename = res.data.items[0].filename
        const vkey = res.data.items[0].vkey
        const error = 0
        commit(types.SET_CURRENT_URL, {filename, vkey, error})
      } else {
        const error = 1
        commit(types.SET_CURRENT_URL, {error})
      }
    })
}
