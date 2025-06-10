import { Env } from '../types'

export interface AuthResult {
    success: boolean;
    message?: string;
    userId?: string;
}

export const verifyToken = async (context: EventContext<Env, any, any>): Promise<AuthResult> => {
    const authHeader = context.request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            success: false,
            message: '未授权访问'
        }
    }

    const token = authHeader.replace('Bearer ', '')
    // 这里可以添加更复杂的令牌验证逻辑，例如验证签名、检查过期时间等
    // 简单起见，我们只检查令牌是否存在
    if (!token) {
        return {
            success: false,
            message: '无效的访问令牌'
        }
    }

    return {
        success: true
    }
}

export const checkAuth = async (context: EventContext<Env, any, any>) => {
    const authHeader = context.request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
            status: 401,
            message: '未授权访问',
            data: null
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        })
    }
    return null
}

export const checkApiToken = async (context: EventContext<Env, any, any>) => {
    const url = new URL(context.request.url)
    const tokenParam = url.searchParams.get('token')
    const authHeader = context.request.headers.get('Authorization')
    const headerToken = authHeader?.replace('Bearer ', '')
    const token = tokenParam || headerToken

    if (!token || token !== context.env.API_TOKEN) {
        return new Response(JSON.stringify({
            status: 401,
            message: '无效的访问令牌',
            data: null
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        })
    }
    return null
} 