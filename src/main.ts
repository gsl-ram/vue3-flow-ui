import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerLicense } from '@syncfusion/ej2-base'

import App from './App.vue'
import router from './router'

const syncfusionKey = import.meta.env.VITE_SYNCFUSION_LICENSE_KEY
if (syncfusionKey) {
  registerLicense(syncfusionKey)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
