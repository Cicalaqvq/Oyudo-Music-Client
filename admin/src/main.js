import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus, {ElLoading} from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:windi.css'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import store from "./store/index.js";
import 'nprogress/nprogress.css'
import 'vue-cropper/dist/index.css'
import VueCropper from "vue-cropper";
import * as VueIconsPlusHi2 from "vue-icons-plus/hi2";
import * as VueIconsPlusVsc from "vue-icons-plus/vsc"
import * as VueIconsPlusTb from "vue-icons-plus/tb"
import * as echarts from 'echarts'
import zhCn from "element-plus/es/locale/lang/zh-cn"


const app = createApp(App)

app.config.globalProperties.$echarts = echarts
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
for (const [key, component] of Object.entries(VueIconsPlusHi2)) {
    app.component(key, component)
}

for (const [key, component] of Object.entries(VueIconsPlusVsc)) {
    app.component(key, component)
}
for (const [key, component] of Object.entries(VueIconsPlusTb)) {
    app.component(key, component)
}

app.use(store)
app.use(VueCropper)
app.use(ElementPlus, {locale: zhCn});
app.use(router)
app.directive('loading', ElLoading.directive)

app.mount('#app')
