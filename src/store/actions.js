import * as types from './mutation-types'
import {getSongVKey} from 'api/singer'
import {ERR_OK} from 'api/config'

export const selectPlay = ({commit, state}, {list, index}) => {
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
  getSongVKey(state.playlist[state.currentIndex].mid)
    .then(res => {
      if (res.code === ERR_OK) {
        const filename = res.data.items[0].filename
        const vkey = res.data.items[0].vkey
        commit(types.SET_CURRENT_URL, {filename, vkey})
      }
    })
}
