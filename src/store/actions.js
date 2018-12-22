import * as types from './mutation-types'
import {getSongVKey} from 'api/singer'
import {ERR_OK} from 'api/config'
import {shuffle} from 'common/js/util'
import {playMode} from 'common/js/config'

export const selectPlay = ({commit, state}, {list, index}) => {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    const randomList = shuffle(list)
    index = findIndex(randomList, this.sequenceList[index])
    commit(types.SET_PLAYLIST, randomList)
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
  if (state.playlist[state.currentIndex].url === '') {
    getKey(state, commit)
  }
}

export const randomPlay = ({commit, state}, list) => {
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYLIST, shuffle(list))
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
  commit(types.SET_PLAY_MODE, playMode.random)
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

function findIndex (list, song) {
  list.findIndex((item) => {
    if (item.id === song.id) {
      return true
    }
  })
}
