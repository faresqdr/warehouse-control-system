import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from "./router/index"
import { createPinia } from 'pinia'
const pinia = createPinia()

createApp(App).use(router).use(pinia).mount('#app')
