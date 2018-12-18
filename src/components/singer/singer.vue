<template>
  <div class="singer">
    <template v-if="singerList.length">
      <list-view :data="singerList"></list-view>
    </template>
  </div>
</template>

<script>
import {getSingerList} from 'api/singer'
import {ERR_OK} from 'api/config'
import Singer from 'common/js/singer'
import ListView from 'base/listview/listview'
const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10

export default {
  name: 'Singer',
  data () {
    return {
      singerList: []
    }
  },
  components: {
    ListView
  },
  methods: {
    _getSingerList () {
      getSingerList()
        .then(res => {
          if (res.code === ERR_OK) {
            this.singerList = this._normalizeSinger(res.data.list)
          }
        })
    },
    _normalizeSinger (list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => {
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_id,
            singerName: item.Fsinger_name,
            avatar: item.Fsinger_mid
          }))
        }
        const key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
          id: item.Fsinger_id,
          singerName: item.Fsinger_name,
          avatar: item.Fsinger_mid
        }))
      })
      // 对map的key值排序
      let hot = []
      let ret = []
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      ret.sort((x, y) => {
        return x.title.charCodeAt(0) - y.title.charCodeAt(0)
      })
      return hot.concat(ret)
    }
  },
  mounted () {
    this._getSingerList()
  }
}
</script>

<style scoped lang="stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
