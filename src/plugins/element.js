import Vue from 'vue'
// 按需引入
import {
  Button, Form, FormItem, Input, Message, Header, Container,
  Aside, Main, Menu, Submenu, MenuItem, Breadcrumb, BreadcrumbItem
  , Card, Row, Col, Table, TableColumn, Switch, Tooltip, Pagination, Dialog,
  MessageBox, Tag, Tree, Select, Option, Cascader,Radio,Alert,Tabs,TabPane,
  Steps,Step,CheckboxGroup,Checkbox,Upload
} from 'element-ui'
import { options } from 'less'
// 全局注册为可用
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Header)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Col)
Vue.use(Row)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)
Vue.use(Radio)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Steps)
Vue.use(Step)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(Upload)
// message组件需要全局挂载到vue上,可以通过this.$message调用
Vue.prototype.$message = Message
// 全局挂载confirm
Vue.prototype.$confirm = MessageBox.confirm
