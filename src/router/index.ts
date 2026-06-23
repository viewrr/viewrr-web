import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../components/Home.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Home },
  {
    path: '/title/:id',
    name: 'detail',
    component: () => import('../components/Detail.vue'),
    props: true,
  },
  {
    path: '/watch/:id',
    name: 'player',
    component: () => import('../components/Player.vue'),
    props: true,
  },
  { path: '/search', name: 'search', component: () => import('../components/Search.vue') },
  { path: '/login', name: 'login', component: () => import('../components/Login.vue') },
  // Unknown paths fall back to Home rather than rendering a blank <RouterView/>.
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  // Apple-TV feel: jump to top on navigation, restore on back/forward.
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 }
  },
})

export default router
