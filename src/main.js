import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './utils/axios' // 引入 axios 配置
import * as echarts from 'echarts'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// 全局挂载echarts
app.config.globalProperties.$echarts = echarts

app.use(router)
app.use(ElementPlus)
app.use(ElementPlusIconsVue)

app.mount('#app') 