<template>
    <scroll
        class="list-view"
        :listenScroll="true"
        :probeType="3"
        @scroll="handleScroll"
        ref="listview">
        <ul>
            <li
                v-for="(group, key) in data"
                :key="key"
                ref="listGroup"
                class="list-group">
                <h2
                    class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li
                        v-for="(item, key) of group.items"
                        class="list-group-item"
                        @click="handleSelectItem(item)"
                        :key="key">
                        <img class="avatar" v-lazy="item.avatar"/>
                        <span class="name">{{item.singerName}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <div
            class="list-shortcut"
            @touchmove.stop.prevent="onShortcutTouchMove"
            @touchstart="onShortcutTouchStart">
            <ul>
                <li
                    class="item"
                    v-for="(item, key) of shortcutList"
                    :data-index="key"
                    :class="{current: currentIndex === key}"
                    :key="key">
                    {{item}}
                </li>
            </ul>
        </div>
        <div
            class="list-fixed"
            v-show="fixedTitle"
            ref="fixed">
            <h1 class="fixed-title">{{fixedTitle}}</h1>
        </div>
    </scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import {getData} from 'common/js/dom'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  created () {
    this.touch = {}
    this.listHeight = []
  },
  mounted () {
    setTimeout(() => {
      this._calculateHeight()
    }, 20)
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  name: 'listview',
  props: {
    data: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  methods: {
    onShortcutTouchStart (e) {
      const anchorIndex = parseInt(getData(e.target, 'index'))
      this.touch.y1 = e.touches[0].pageY
      this.touch.anchorIndex = anchorIndex
      this.realAnchorIndex = anchorIndex
      this._scrollTo()
    },
    onShortcutTouchMove (e) {
      this.touch.y2 = e.touches[0].pageY
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = this.touch.anchorIndex + delta
      if (anchorIndex < 0) {
        anchorIndex = 0
      } else if (anchorIndex > this.listHeight.length - 2) {
        anchorIndex = this.listHeight.length - 2
      }
      this.realAnchorIndex = anchorIndex
      if (!this.timer) {
        this.timer = setTimeout(() => {
          this._scrollTo()
          this.timer = null
        }, 100)
      }
    },
    handleSelectItem (item) {
      this.$emit('selectItem', item)
    },
    handleScroll (pos) {
      this.scrollY = pos.y
    },
    _scrollTo () {
      this.currentIndex = this.realAnchorIndex
      this.$refs.listview.scrollToElement(this.$refs.listGroup[this.realAnchorIndex], 0)
    },
    _calculateHeight () {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let item of list) {
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  computed: {
    shortcutList () {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle () {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  watch: {
    scrollY (newY) {
      // list-view 的 scroll >= 0 即在最顶部
      // 这里的scrollY其实可以理解为 scroll 离容器顶部的距离
      if (newY >= 0) {
        this.currentIndex = 0
        return
      }
      const listHeight = this.listHeight
      const length = listHeight.length - 1
      for (let i = 0; i < length; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if ((-newY >= height1 && -newY < height2)) {
          this.currentIndex = i
          this.diff = height2 + newY
          return
        }
      }
      // 上面逻辑处理后只剩下最后一个没有判断，若不满足，则必为最后一个
      this.currentIndex = listHeight.length - 2
    },
    diff (newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = 'translateY(' + fixedTop + 'px)'
    }
  },
  components: {
    Scroll
  }
}
</script>

<style lang="stylus" scoped>
@import "~common/stylus/variable.styl"
.list-view
    position relative
    width 100%
    height 100%
    overflow hidden
    background $color-background
    .list-group
      padding-bottom 30px
      .list-group-title
        height 30px
        line-height 30px
        padding-left 20px
        font-size $font-size-small
        color $color-text-l
        background $color-highlight-background
      .list-group-item
        display flex
        align-items center
        padding 20px 0 0 30px
        .avatar
          width 50px
          height 50px
          border-radius 50%
        .name
          margin-left 20px
          color $color-text-l
          font-size $font-size-medium
    .list-shortcut
      position absolute
      z-index 30
      right 0
      top 50%
      transform translateY(-50%)
      width 20px
      padding 20px 0
      border-radius 10px
      text-align center
      background $color-background-d
      font-family Helvetica
      .item
        padding 3px
        line-height 1
        color $color-text-l
        font-size $font-size-small
        &.current
          color $color-theme
    .list-fixed
      position absolute
      top 0
      left 0
      width 100%
      .fixed-title
        height 30px
        line-height 30px
        padding-left 20px
        font-size $font-size-small
        color $color-text-l
        background $color-highlight-background
    .loading-container
      position absolute
      width 100%
      top 50%
      transform translateY(-50%)
</style>
