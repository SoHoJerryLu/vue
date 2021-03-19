import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/olmap',
      name: 'olmap',
      component: () => import('@/pages/Openlayers/openlayersMap'),
  },{
      path: '/tableTools',
      name: 'tableTools',
      component: () => import('@/pages/ElementUI/tableTools'),
  },{
    path: '/speech',
    name: 'speech',
    component: () => import('@/components/html5/speech'),
  }]
})
