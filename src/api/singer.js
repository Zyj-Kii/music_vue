import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import Vue from 'vue'

export function getSingerList () {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'
  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })
  return jsonp(url, data, options)
}

export function getSingerDetail (singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 100,
    songstatus: 1,
    singermid: singerId
  })
  return jsonp(url, data, options)
}

export function getSongVKey (songmid) {
  const url = '/api/getSongVKey'
  const data = Object.assign({}, commonParams, {
    loginUin: 3051522991,
    uin: 3051522991,
    guid: 5931742855,
    songmid,
    cid: 205361747,
    needNewCode: 0,
    platform: 'yqq',
    format: 'json',
    filename: `C400${songmid}.m4a`
  })
  return new Promise((resolve, reject) => {
    Vue.prototype.$get(url, data)
      .then(res => resolve(res))
      .catch(err => reject(err))
  })
}
