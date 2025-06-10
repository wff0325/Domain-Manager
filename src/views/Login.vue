<template>
    <div class="login-container">
        <el-card class="login-card">
            <div class="logo-container">
                <img src="../../public/vite.svg" alt="Logo" class="logo" />
                <h2>域名管理系统<br />(Domains-Support)</h2>
            </div>
            <el-form :model="loginForm" @submit.prevent="handleLogin" label-position="top">
                <el-form-item label="用户名">
                    <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" clearable />
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" :prefix-icon="Lock"
                        show-password @keyup.enter="handleLogin" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleLogin" style="width: 100%">登录</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuth } from '../utils/auth'
import { User, Lock } from '@element-plus/icons-vue'

interface ApiResponse<T = any> {
    status: number
    message: string
    data: T
}

interface LoginResponse {
    token: string
}

const auth = useAuth()
const router = useRouter()
const loginForm = ref({
    username: '',
    password: ''
})

const handleLogin = async () => {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: loginForm.value.username,
                password: loginForm.value.password
            })
        })

        const result = await response.json() as ApiResponse<LoginResponse>

        if (result.status === 200 && result.data?.token) {
            const expiresIn = 6 * 60 * 60 // 6小时
            auth.setAuthToken(result.data.token, expiresIn)
            ElMessage.success('登录成功')
            await router.push({ name: 'Home' })
        } else {
            ElMessage.error(result.message || '用户名或密码错误')
        }
    } catch (error) {
        console.error('Login error:', error)
        ElMessage.error('登录失败')
    }
}
</script>

<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.login-card {
    width: 400px;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
}

.logo {
    width: 100px;
    height: 100px;
    margin-bottom: 16px;
}

h2 {
    text-align: center;
    color: #409EFF;
    font-size: 24px;
    line-height: 1.4;
    margin: 0;
}

:deep(.el-input__wrapper) {
    padding-left: 0;
}

:deep(.el-form-item__label) {
    font-weight: bold;
}

:deep(.el-button) {
    height: 40px;
    font-size: 16px;
}
</style>