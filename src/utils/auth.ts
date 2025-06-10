import { ref } from 'vue'

interface AuthToken {
    token: string
    expiresAt: number
}

export const useAuth = () => {
    const isAuthenticated = ref(false)

    // 使用 JWT 或其他加密 token
    const setAuthToken = (token: string, expiresIn: number) => {
        const expiresAt = new Date().getTime() + expiresIn * 1000
        const authData: AuthToken = {
            token,
            expiresAt
        }

        // 将 token 加密后存储
        const encrypted = btoa(JSON.stringify(authData))
        localStorage.setItem('auth_token', encrypted)
        isAuthenticated.value = true
    }

    const getAuthToken = (): AuthToken | null => {
        const encrypted = localStorage.getItem('auth_token')
        if (!encrypted) return null

        try {
            const decrypted = JSON.parse(atob(encrypted))
            if (new Date().getTime() > decrypted.expiresAt) {
                localStorage.removeItem('auth_token')
                isAuthenticated.value = false
                return null
            }
            isAuthenticated.value = true
            return decrypted
        } catch {
            return null
        }
    }

    const clearAuth = () => {
        localStorage.removeItem('auth_token')
        isAuthenticated.value = false
    }

    return {
        isAuthenticated,
        setAuthToken,
        getAuthToken,
        clearAuth
    }
} 