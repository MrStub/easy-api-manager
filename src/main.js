import Vue from 'vue'
import Button from 'element-ui/lib/button'
import Card from 'element-ui/lib/card'
import Form from 'element-ui/lib/form'
import FormItem from 'element-ui/lib/form-item'
import Row from 'element-ui/lib/row'
import Col from 'element-ui/lib/col'
import Select from 'element-ui/lib/select'
import Option from 'element-ui/lib/option'
import Input from 'element-ui/lib/input'
import DatePicker from 'element-ui/lib/date-picker'
import Table from 'element-ui/lib/table'
import TableColumn from 'element-ui/lib/table-column'
import Dialog from 'element-ui/lib/dialog'
import Pagination from 'element-ui/lib/pagination'
import Tabs from 'element-ui/lib/tabs'
import TabPane from 'element-ui/lib/tab-pane'
import Alert from 'element-ui/lib/alert'
import Tag from 'element-ui/lib/tag'
import Message from 'element-ui/lib/message'
import 'element-ui/lib/theme-chalk/base.css'
import 'element-ui/lib/theme-chalk/icon.css'
import 'element-ui/lib/theme-chalk/button.css'
import 'element-ui/lib/theme-chalk/card.css'
import 'element-ui/lib/theme-chalk/form.css'
import 'element-ui/lib/theme-chalk/form-item.css'
import 'element-ui/lib/theme-chalk/row.css'
import 'element-ui/lib/theme-chalk/col.css'
import 'element-ui/lib/theme-chalk/select.css'
import 'element-ui/lib/theme-chalk/option.css'
import 'element-ui/lib/theme-chalk/input.css'
import 'element-ui/lib/theme-chalk/date-picker.css'
import 'element-ui/lib/theme-chalk/table.css'
import 'element-ui/lib/theme-chalk/table-column.css'
import 'element-ui/lib/theme-chalk/dialog.css'
import 'element-ui/lib/theme-chalk/pagination.css'
import 'element-ui/lib/theme-chalk/tabs.css'
import 'element-ui/lib/theme-chalk/tab-pane.css'
import 'element-ui/lib/theme-chalk/alert.css'
import 'element-ui/lib/theme-chalk/tag.css'
import 'element-ui/lib/theme-chalk/message.css'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false
Vue.use(Button)
Vue.use(Card)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Row)
Vue.use(Col)
Vue.use(Select)
Vue.use(Option)
Vue.use(Input)
Vue.use(DatePicker)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Dialog)
Vue.use(Pagination)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Alert)
Vue.use(Tag)
Vue.prototype.$message = Message

new Vue({
  store,
  render: (h) => h(App)
}).$mount('#app')
