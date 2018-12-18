import axios from 'axios'
axios.defaults.timeout = 5000
export default {
  install: (Vue) => {
    Vue.prototype.$get = (url, params = {}) => {
      return new Promise((resolve, reject) => {
        axios.get(url, {params})
          .then(res => {
            resolve(res.data)
          })
          .catch(err => {
            reject(err)
          })
      })
    }
  }
}
