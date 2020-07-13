import Vue from 'vue'
//按需引入
import { Button, Form, FormItem, Input, Message } from 'element-ui'
//全局注册为可用
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
//message组件需要全局挂载到vue上,可以通过this.$message调用
Vue.prototype.$message = Message 