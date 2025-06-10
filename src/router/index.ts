import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import { useAuth } from '../utils/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/home',
            name: 'Home',
            component: Home,
            meta: { requiresAuth: true }
        }
    ]
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
    if (to.meta.requiresAuth) {
        const auth = useAuth()
        const token = auth.getAuthToken()

        if (!token) {
            next('/login')
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router 