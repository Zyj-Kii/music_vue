<template>
  <div class="music-list">
      <div class="back">
          <i class="icon-back" @click="back"></i>
      </div>
      <h1 class="title">{{title}}</h1>
      <div class="bg-image" :style="bgStyle" ref="bgImage">
          <div class="play-wrapper">
              <div @click="handlePlayRandom" class="play" v-show="showPlay">
                  <i class="icon-play"></i>
                  <span class="text">随机播放全部</span>
              </div>
          </div>
          <div class="filter" ref="filter"></div>
      </div>
      <div class="bg-layer" ref="layer"></div>
      <scroll
          class="list"
          :data="songs"
          :probeType="3"
          :listenScroll="true"
          @scroll="handleScroll"
          ref="list">
          <div class="song-list-wrapper">
              <song-list @select="handleSongPlay" :songs="songs"></song-list>
          </div>
          <div class="loading-container" v-show="!songs.length">
              <loading></loading>
          </div>
      </scroll>
  </div>
</template>

<script>
import SongList from 'base/song-list/song-list'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import {prefixStyle} from 'common/js/dom'
import {mapActions, mapMutations, mapGetters} from 'vuex'
import * as types from '@/store/mutation-types'

const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')

export default {
  name: 'music-list',
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: function () {
        return []
      }
    },
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      scrollY: 0,
      showPlay: false
    }
  },
  methods: {
    handleScroll (pos) {
      this.scrollY = pos.y
    },
    back () {
      this.$router.back()
    },
    handleSongPlay (song, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
      // iphone播放一定要用户交互，所以这里判断hack
      // 这里对于资源是否能够播放，给五次重新请求的机会
      if (this.isIphone) {
        this._fixIphonePlayMusic()
      }
    },
    handlePlayRandom () {
      this.randomPlay(this.songs)
      if (this.isIphone) {
        this._fixIphonePlayMusic()
      }
    },
    _fixIphonePlayMusic () {
      const timer = []
      for (let i = 1; i <= 10; i++) {
        timer[i] = setTimeout(() => {
          this.audio.play()
            .then(() => {
              for (let j = i + 1; j <= 10; j++) {
                clearTimeout(timer[j])
              }
            })
            .catch(() => {
              if (i === 10) {
                alert('暂无版权')
                this.setPlayingState(false)
              }
            })
        }, i * 100)
      }
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ]),
    ...mapMutations({
      setPlayingState: types.SET_PLAYING_STATE
    })
  },
  computed: {
    bgStyle () {
      return `background-image:url(${this.bgImage})`
    },
    ...mapGetters(['isIphone', 'audio'])
  },
  watch: {
    scrollY (newY) {
      const translateY = Math.max(this.minTranslateY, newY)
      const bgImageStyle = this.$refs.bgImage.style
      let scale = 1
      let blur = 0
      let zIndex = 0
      this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
      const percent = Math.abs(newY / this.imageHeight)
      if (newY > 0) {
        scale = 1 + percent
        zIndex = 10
      } else {
        blur = Math.min(20 * percent, 20)
      }
      if (newY < this.minTranslateY) {
        zIndex = 10
        bgImageStyle.paddingTop = 0
        this.showPlay = false
        bgImageStyle.height = `${RESERVED_HEIGHT}px`
      } else {
        this.showPlay = true
        bgImageStyle.paddingTop = '70%'
        bgImageStyle.height = 0
      }
      bgImageStyle.zIndex = zIndex
      bgImageStyle[transform] = `scale(${scale})`
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`
    },
    songs () {
      this.showPlay = true
    }
  },
  mounted () {
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  components: {
    SongList,
    Scroll,
    Loading
  }
}
</script>

<style lang="stylus" scoped>
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"
.music-list
    position fixed
    z-index 100
    top 0
    left 0
    bottom 0
    right 0
    background $color-background
    .back
      position absolute
      top 0
      left 6px
      z-index 50
      .icon-back
        display block
        padding 10px
        font-size $font-size-large-x
        color $color-theme
    .title
      position absolute
      top 0
      left 10%
      z-index 40
      width 80%
      no-wrap()
      text-align center
      line-height 40px
      font-size $font-size-large
      color $color-text
    .bg-image
      position relative
      width 100%
      height 0
      padding-top 70%
      transform-origin top
      background-size cover
      .play-wrapper
        position absolute
        bottom 20px
        z-index 50
        width 100%
        .play
          box-sizing border-box
          width 135px
          padding 7px 0
          margin 0 auto
          text-align center
          border 1px solid $color-theme
          color $color-theme
          border-radius 100px
          font-size 0
          .icon-play
            display inline-block
            vertical-align middle
            margin-right 6px
            font-size $font-size-medium-x
          .text
            display inline-block
            vertical-align middle
            font-size $font-size-small
      .filter
        position absolute
        top 0
        left 0
        width 100%
        height 100%
        background rgba(7, 17, 27, 0.4)
    .bg-layer
      position relative
      height 100%
      background $color-background
    .list
      position fixed
      top 0
      bottom 0
      width 100%
      background $color-background
      .song-list-wrapper
        padding 20px 30px
      .loading-container
        position absolute
        width 100%
        top 50%
        transform translateY(-50%)
</style>
