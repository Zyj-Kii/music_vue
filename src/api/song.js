import {commonParams} from './config'
import Vue from 'vue'

export function getLyric (mid) {
  const url = '/api/getLyric'
  const data = Object.assign({}, commonParams, {
    songmid: mid,
    pcachetime: +new Date(),
    hostUin: 0,
    needNewCode: 0,
    format: 'json',
    platform: 'yqq'
  })
  return new Promise((resolve, reject) => {
    Vue.prototype.$get(url, data)
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}
