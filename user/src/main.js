import {createApp} from 'vue'
// import './style.css'
import './assets/reset.css'
import App from './App.vue'
import ElementPlus, {ElLoading} from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:windi.css'
import router from './router'
import store from "./store/index.js";
import 'nprogress/nprogress.css'
import 'vue-cropper/dist/index.css'
import VueCropper from "vue-cropper";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import * as VueIconsPlusHi2 from "vue-icons-plus/hi2";
import * as VueIconsPlusSl from "vue-icons-plus/sl"
import * as VueIconsPlusIp from "vue-icons-plus/ip"

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
for (const [key, component] of Object.entries(VueIconsPlusHi2)) {
    app.component(key, component)
}
for (const [key, component] of Object.entries(VueIconsPlusSl)) {
    app.component(key, component)
}
for (const [key, component] of Object.entries(VueIconsPlusIp)) {
    app.component(key, component)
}


app.use(store)
app.use(router)
app.use(VueCropper)
app.use(ElementPlus)
// app.directive('loading', ElLoading.directive)

app.mount('#app')
