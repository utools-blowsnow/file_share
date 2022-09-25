import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
require('./plugins/tools')

Vue.config.productionTip = false


if (window.inUtools === false){
  new Vue({
    render: h => h(App),
  }).$mount('#app')
}else{
  utools.onPluginReady(() => {
    new Vue({
      render: h => h(App),
    }).$mount('#app')
  })
}

