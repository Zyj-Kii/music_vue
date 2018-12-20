<template>
    <div class="song-list">
        <ul v-if="songs.length">
            <li
                v-for="(song, key) of songs"
                @click="handleSelect(song,key)"
                :key="key"
                class="item">
                <div class="content">
                    <h2 class="name">{{song.songName}}</h2>
                    <p class="desc">{{getDesc(song)}}</p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  name: 'song-list',
  props: {
    songs: {
      type: Array,
      default () {
        return []
      }
    }
  },
  methods: {
    getDesc (song) {
      return `${song.singer} - ${song.album}`
    },
    handleSelect (song, index) {
      this.$emit('select', song, index)
    }
  }
}
</script>

<style lang="stylus" scoped>
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"
    .song-list
        .item
            display flex
            align-items center
            box-sizing border-box
            height 64px
            font-size $font-size-medium
            .content
                flex 1
                line-height 20px
                overflow hidden
                .name
                    no-wrap()
                    color $color-text
                .desc
                    no-wrap()
                    margin-top 4px
                    color $color-text-d
</style>
