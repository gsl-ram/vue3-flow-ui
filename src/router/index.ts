import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/vue-flow',
      name: 'vue-flow',
      component: () => import('../views/VueFlowDemo.vue'),
    },
    {
      path: '/vue-flow-advanced',
      name: 'vue-flow-advanced',
      component: () => import('../views/VueFlowAdvancedView.vue'),
    },
    {
      path: '/json-editor',
      name: 'json-editor',
      component: () => import('../views/JsonEditorDemo.vue'),
    },
    {
      path: '/code-editor',
      name: 'code-editor',
      component: () => import('../views/CodeEditorDemo.vue'),
    },
    {
      path: '/syncfusion-diagram',
      name: 'syncfusion-diagram',
      component: () => import('../views/SyncfusionDiagramDemo.vue'),
    },
  ],
})

export default router
