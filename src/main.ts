import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 确保先注册 ElementPlus
app.use(ElementPlus)
// 再注册路由
app.use(router)

app.mount('#app')
