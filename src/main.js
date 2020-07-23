import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/CSS/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 导入表格插件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截
axios.interceptors.request.use(config => {
  // console.log(config)
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
// 配置全局axios,可以通过this.$http调用
Vue.prototype.$http = axios
Vue.config.productionTip = false
// 注册为全局可用的组件
Vue.component('tree-table', TreeTable)
// 注册全局的富文本编辑器
Vue.use(VueQuillEditor)
// 注册一个时间的全局过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  // 年
  const year = dt.getFullYear()
  // 月(从0开始的要加1,padStart(2,'0')总长度2位，不足前面补0)
  const month = (dt.getMonth() + 1 + '').padStart(2, '0')
  // 日
  const day = (dt.getDate() + '').padStart(2, '0')
  // 时
  const hour = (dt.getHours() + '').padStart(2, '0')
  // 分
  const minute = (dt.getMinutes() + '').padStart(2, '0')
  // 秒
  const seconds = (dt.getSeconds() + '').padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
