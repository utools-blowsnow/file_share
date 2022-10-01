import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
require('./plugins/tools')
require('./plugins/axios')

Vue.config.productionTip = false


utools.onPluginReady(() => {
  new Vue({
    render: h => h(App),
  }).$mount('#app')
})

