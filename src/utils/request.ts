import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuth } from './auth'
import router from '../router'
import { ElMessage } from 'element-plus'

export interface ApiResponse<T = any> {
    status: number
    message: string
    data: T
}

const request = axios.create({
    timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const auth = useAuth()
        const token = auth.getAuthToken()

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token.token}`
        }
        return config
    },
    (error: AxiosError) => {
        ElMessage.error('请求发送失败')
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    <T>(response: AxiosResponse<ApiResponse<T>>) => {
        return {
            ...response,
            data: response.data
        }
    },
    (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
            const auth = useAuth()
            auth.clearAuth()
            router.push('/login')
            ElMessage.error('登录已过期，请重新登录')
        } else {
            console.error('API Error:', error.response?.data || error.message)
            ElMessage.error(error.response?.data?.message || '请求失败')
        }
        return Promise.reject(error)
    }
)

export default request 