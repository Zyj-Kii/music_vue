<template>
    <transition name="slide">
        <music-list
            :title="title"
            :bg-image="bgImage"
            :songs="songs"></music-list>
    </transition>
</template>

<script>
import {mapGetters} from 'vuex'
import {getSingerDetail} from 'api/singer'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
import MusicList from 'components/music-list/music-list'

export default {
  name: 'singer-detail',
  data () {
    return {
      songs: []
    }
  },
  computed: {
    title () {
      return this.singer.singerName
    },
    bgImage () {
      return this.singer.avatar
    },
    ...mapGetters([
      'singer'
    ])
  },
  methods: {
    _getSingerDetail () {
      if (!this.singer.id) {
        this.$router.push('/singer')
      }
      getSingerDetail(this.singer.id)
        .then(res => {
          if (res.code === ERR_OK) {
            this._normalizeSongs(res.data.list)
          }
        })
    },
    _normalizeSongs (list) {
      const songs = this.songs
      for (let item of list) {
        let {musicData} = item
        if (musicData.songid && musicData.albumid) {
          songs.push(createSong(musicData))
        }
      }
    }
  },
  created () {
    this.singeDetail = []
    this._getSingerDetail()
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="stylus">
    .slide-enter-active, .slide-leave-active
      transition all .3s
    .slide-enter, .slide-leave-to
      transform translate3d(100%, 0, 0)
</style>
