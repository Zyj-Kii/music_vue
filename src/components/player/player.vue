<template>
    <div class="player" v-show="playlist.length">
        <transition
            name="normal"
            @after-enter="afterEnter"
            @leave="leave"
            @after-leave="afterLeave"
            @enter="enter">
            <div class="normal-player" v-if="realSong" v-show="fullScreen">
                <div class="background">
                    <img width="100%" height="100%" :src="realSong.image">
                </div>
                <div class="top">
                    <div class="back" @click="handleScreen(false)">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title">{{realSong.songName}}</h1>
                    <h2 class="subtitle">{{realSong.singer}}</h2>
                </div>
                <div class="middle">
                    <div class="middle-l">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdCls">
                                <img class="image" :src="realSong.image">
                            </div>
                        </div>
                    </div>
                    <scroll class="middle-r" ref="lyricList">
                        <div class="lyric-wrapper">
                            <div v-if="currentLyric">
                                <p
                                    ref="lyricLine"
                                    class="text"
                                    v-for="(line, key) of currentLyric.lines"
                                    :class="{'current': currentLineNumber === key}"
                                    :key="key">{{line.txt}}</p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar
                                @percentChange="handlePercentChange"
                                :percent="percent"></progress-bar>
                        </div>
                        <span class="time time-r">{{format(realSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div @click="changeMode" class="icon i-left">
                            <i :class="iconMode"></i>
                        </div>
                        <div @click="handlePlay('prev')" :class="disableCls" class="icon i-left">
                            <i class="icon-prev"></i>
                        </div>
                        <div class="icon i-center" :class="disableCls">
                            <i @click="togglePlaying" :class="playIcon"></i>
                        </div>
                        <div @click="handlePlay('next')" :class="disableCls" class="icon i-right">
                            <i class="icon-next"></i>
                        </div>
                        <div class="icon i-right">
                            <i class="icon icon-not-favorite"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="mini">
            <div
                class="mini-player"
                @click="handleScreen(true)"
                v-if="realSong"
                v-show="!fullScreen">
                <div class="icon">
                    <img :class="cdCls" width="40" height="40" :src="realSong.image">
                </div>
                <div class="text">
                    <h2 class="name">{{realSong.songName}}</h2>
                    <p class="desc">{{realSong.singer}}</p>
                </div>
                <div @click.stop="togglePlaying" class="control">
                    <progress-circle
                        :radius="32"
                        :percent="percent">
                        <i :class="miniIcon" class="icon-mini"></i>
                    </progress-circle>
                </div>
                <div class="control">
                    <i class="icon-playlist"></i>
                </div>
            </div>
        </transition>
        <audio
            @canplay="handlePlayMusic"
            ref="audio"
            preload="auto"
            @error="handlePlayError"
            @timeupdate="updateTime"
            @ended="handleMusicEnd"
            :src="songSource ? songSource : 'http://forbidden/'"></audio>
    </div>
</template>

<script>
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import Scroll from 'base/scroll/scroll'
import {playMode} from 'common/js/config'
import {mapGetters, mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import * as types from '@/store/mutation-types'
import {prefixStyle} from 'common/js/dom'
import detect from 'common/js/detect'
import {shuffle} from 'common/js/util'
import Lyric from 'lyric-parser'
const transform = prefixStyle('transform')

export default {
  name: 'player',
  data () {
    return {
      onReady: false,
      currentTime: 0,
      realSong: null,
      currentLyric: null,
      currentLineNumber: 0
    }
  },
  methods: {
    handleScreen (flag) {
      this.setFullScreen(flag)
    },
    togglePlaying () {
      this.setPlayingState(!this.playing)
      if (this.playing) {
        this.handlePlayMusic()
      }
    },
    handlePlayMusic () {
      this.onReady = true
      this.audio.play()
        .catch(() => {
          this.setPlayingState(false)
          alert('暂无版权')
        })
    },
    handlePlayError (e) {
      if (!this.isIphone && e.target.src) {
        this.setPlayingState(false)
        alert('暂无版权')
        this.onReady = true
      }
    },
    handlePlay (direction) {
      if (this.playMode === playMode.loop) {
        this.audio.currentTime = 0
        this.audio.play()
        return
      }
      if (!this.onReady) {
        return
      }
      if (!this.playing) {
        this.setPlayingState(true)
      }
      let index = this.currentIndex
      if (direction === 'next') {
        index += 1
        if (index >= this.playlist.length) {
          index = 0
        }
      } else {
        index -= 1
        if (index < 0) {
          index = this.playlist.length - 1
        }
      }
      this.setCurrentIndex(index)

      // iphone播放一定要用户交互，所以这里判断hack
      // 这里对于资源是否能够播放，给十次重新请求的机会
      if (this.isIphone) {
        const timer = []
        for (let i = 1; i <= 10; i++) {
          timer[i] = setTimeout(() => {
            this.audio.play()
              .then(() => {
                this.onReady = true
                for (let j = i + 1; j <= 10; j++) {
                  clearTimeout(timer[j])
                }
              })
              .catch(() => {
                if (i === 10) {
                  alert('暂无版权')
                  this.setPlayingState(false)
                  this.onReady = true
                }
              })
          }, i * 100)
        }
      }
      this.audio.currentTime = 0
      this.onReady = false
    },
    handlePercentChange (percent) {
      this.audio.currentTime = percent * this.realSong.duration
      if (!this.playing) {
        this.setPlayingState(true)
      }
    },
    changeMode () {
      const mode = (this.playMode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.setPlaylist(list)
      this.resetCurrentIndex(list)
    },
    resetCurrentIndex (list) {
      let index = list.findIndex((item) => {
        return item.id === this.realSong.id
      })
      this.setCurrentIndex(index)
    },
    handleMusicEnd () {
      this.handlePlay('next')
    },
    getLyric () {
      this.realSong.getLyric()
        .then(lyric => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
        })
    },
    handleLyric ({lineNum, txt}) {
      this.currentLineNumber = lineNum
    },
    format (time) {
      time = time | 0
      const minute = (time / 60) | 0
      let second = time % 60
      if (second < 10) {
        second = '0' + second
      }
      return `${minute}:${second}`
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    enter (el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: 'translate3d(0, 0, 0) scale(1)'
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      const cdWrapper = this.$refs.cdWrapper
      cdWrapper.style.transition = 'all .4s'
      const {x, y, scale} = this._getPosAndScale()
      cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave () {
      const cdWrapperStyle = this.$refs.cdWrapper.style
      cdWrapperStyle.transition = ''
      cdWrapperStyle[transform] = ''
    },
    _getPosAndScale () {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    ...mapMutations({
      setFullScreen: types.SET_FULL_SCREEN,
      setPlayingState: types.SET_PLAYING_STATE,
      setAudio: types.SET_AUDIO,
      setIphone: types.SET_IPHONE,
      setPlayMode: types.SET_PLAY_MODE,
      setPlaylist: types.SET_PLAYLIST,
      setPersistSong: types.SET_PERSIST_SONG
    }),
    ...mapActions([
      'selectPlay',
      'setCurrentIndex'
    ])
  },
  computed: {
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    songSource () {
      if (this.realSong && this.realSong.url !== '') {
        return this.realSong.url
      } else {
        return ''
      }
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    disableCls () {
      return this.onReady ? '' : 'disable'
    },
    percent () {
      return this.currentTime / this.realSong.duration
    },
    iconMode () {
      switch (this.playMode) {
        case playMode.sequence:
          return 'icon-sequence'
        case playMode.loop:
          return 'icon-loop'
        case playMode.random:
          return 'icon-random'
      }
    },
    ...mapGetters([
      'fullScreen',
      'playlist',
      'currentSong',
      'playing',
      'currentIndex',
      'isIphone',
      'audio',
      'playMode',
      'sequenceList',
      'persistSong'
    ])
  },
  watch: {
    playing (newPlaying) {
      const audio = this.audio
      if (newPlaying) {
        audio.play()
          .catch()
      } else {
        audio.pause()
      }
    },
    currentSong (newSong) {
      if (newSong !== 'persistSong') {
        this.realSong = newSong
      }
    },
    realSong () {
      this.$nextTick(() => {
        this.getLyric()
      })
    },
    currentLineNumber (newVal) {
      console.log(newVal)
    }
  },
  mounted () {
    if (detect('iPhone')) {
      this.setIphone(true)
    }
    this.setAudio(this.$refs.audio)
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll
  }
}
</script>

<style lang="stylus" scoped>
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"
    .player
        .normal-player
            position: fixed
            left: 0
            right: 0
            top: 0
            bottom: 0
            z-index: 150
            background: $color-background
            .background
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                z-index: -1
                opacity: 0.6
                filter: blur(20px)
            .top
                position: relative
                margin-bottom: 25px
                .back
                    position absolute
                    top: 0
                    left: 6px
                    z-index: 50
                    .icon-back
                        display: block
                        padding: 9px
                        font-size: $font-size-large-x
                        color: $color-theme
                        transform: rotate(-90deg)
                .title
                    width: 70%
                    margin: 0 auto
                    line-height: 40px
                    text-align: center
                    no-wrap()
                    font-size: $font-size-large
                    color: $color-text
                .subtitle
                    line-height: 20px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-text
            .middle
                position: fixed
                width: 100%
                top: 80px
                bottom: 170px
                white-space: nowrap
                font-size: 0
                .middle-l
                    display: inline-block
                    vertical-align: top
                    position: relative
                    width: 100%
                    height: 0
                    padding-top: 80%
                    .cd-wrapper
                        position: absolute
                        left: 10%
                        top: 0
                        width: 80%
                        height: 100%
                        .cd
                            width: 100%
                            height: 100%
                            box-sizing: border-box
                            border: 10px solid rgba(255, 255, 255, 0.1)
                            border-radius: 50%
                            &.play
                                animation: rotate 20s linear infinite
                            &.pause
                                animation-play-state: paused
                            .image
                                position: absolute
                                left: 0
                                top: 0
                                width: 100%
                                height: 100%
                                border-radius: 50%
                    .playing-lyric-wrapper
                        width: 80%
                        margin: 30px auto 0 auto
                        overflow: hidden
                        text-align: center
                        .playing-lyric
                            height: 20px
                            line-height: 20px
                            font-size: $font-size-medium
                            color: $color-text-l
                .middle-r
                    display: inline-block
                    vertical-align: top
                    width: 100%
                    height: 100%
                    overflow: hidden
                    .lyric-wrapper
                        width: 80%
                        margin: 0 auto
                        overflow: hidden
                        text-align: center
                        .text
                            line-height: 32px
                            color: $color-text-l
                            font-size: $font-size-medium
                            &.current
                                color: $color-text
            .bottom
                position: absolute
                bottom: 50px
                width: 100%
                .dot-wrapper
                    text-align: center
                    font-size: 0
                    .dot
                        display: inline-block
                        vertical-align: middle
                        margin: 0 4px
                        width: 8px
                        height: 8px
                        border-radius: 50%
                        background: $color-text-l
                        &.active
                            width: 20px
                            border-radius: 5px
                            background: $color-text-ll
                .progress-wrapper
                    display: flex
                    align-items: center
                    width: 80%
                    margin: 0 auto
                    padding: 10px 0
                    .time
                        color: $color-text
                        font-size: $font-size-small
                        flex: 0 0 30px
                        line-height: 30px
                        width: 30px
                        &.time-l
                            text-align: left
                        &.time-r
                            text-align: right
                    .progress-bar-wrapper
                        flex: 1
                .operators
                    display: flex
                    align-items: center
                    .icon
                        flex: 1
                        color: $color-theme
                        &.disable
                            color: $color-theme-d
                        i
                            font-size: 30px
                    .i-left
                        text-align: right
                    .i-center
                        padding: 0 20px
                        text-align: center
                        i
                            font-size: 40px
                    .i-right
                        text-align: left
                    .icon-favorite
                        color: $color-sub-theme
            &.normal-enter-active, &.normal-leave-active
                transition: all 0.4s
                .top, .bottom
                    transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
            &.normal-enter, &.normal-leave-to
                opacity: 0
                .top
                    transform: translate3d(0, -100px, 0)
                .bottom
                    transform: translate3d(0, 100px, 0)
        .mini-player
            display: flex
            align-items: center
            position: fixed
            left: 0
            bottom: 0
            z-index: 180
            width: 100%
            height: 60px
            background: $color-highlight-background
            &.mini-enter-active, &.mini-leave-active
                transition: all 0.4s
            &.mini-enter, &.mini-leave-to
                opacity: 0
            .icon
                flex: 0 0 40px
                width: 40px
                padding: 0 10px 0 20px
                img
                    border-radius: 50%
                    &.play
                        animation: rotate 10s linear infinite
                    &.pause
                        animation-play-state: paused
            .text
                display: flex
                flex-direction: column
                justify-content: center
                flex: 1
                line-height: 20px
                overflow: hidden
                .name
                    margin-bottom: 2px
                    no-wrap()
                    font-size: $font-size-medium
                    color: $color-text
                .desc
                    no-wrap()
                    font-size: $font-size-small
                    color: $color-text-d
            .control
                flex: 0 0 30px
                width: 30px
                padding: 0 10px
                .icon-play-mini, .icon-pause-mini, .icon-playlist
                    font-size: 30px
                    color: $color-theme-d
                .icon-mini
                    font-size: 32px
                    position: absolute
                    left: 0
                    top: 0

    @keyframes rotate
        0%
            transform: rotate(0)
        100%
            transform: rotate(360deg)

</style>
