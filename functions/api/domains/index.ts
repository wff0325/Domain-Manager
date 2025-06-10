import { Env, Domain } from '../../types'
import { checkAuth } from '../../utils/auth'

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const authError = await checkAuth(context)
        if (authError) return authError

        console.log('开始查询域名列表')
        const result = await context.env.DB.prepare(
            'SELECT * FROM domains ORDER BY created_at DESC'
        ).all<Domain>()

        console.log('查询结果:', result)

        if (!result.success) {
            throw new Error('数据库查询失败')
        }

        const response = {
            status: 200,
            message: '获取成功',
            data: result.results || []
        }

        console.log('返回响应:', response)
        return Response.json(response)
    } catch (error) {
        console.error('获取域名列表失败:', error)
        return Response.json({
            status: 500,
            message: error instanceof Error ? error.message : '获取域名列表失败',
            data: []
        }, { status: 500 })
    }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const authError = await checkAuth(context)
        if (authError) return authError

        const data = await context.request.json() as Domain
        console.log('接收到的数据:', data)

        // 验证必填字段
        const requiredFields = ['domain', 'registrar', 'registrar_date', 'expiry_date', 'service_type', 'status'] as const
        for (const field of requiredFields) {
            if (!data[field]) {
                return Response.json({
                    status: 400,
                    message: `${field} 是必填字段`,
                    data: null
                }, { status: 400 })
            }
        }

        const result = await context.env.DB.prepare(`
            INSERT INTO domains (
                domain, registrar, registrar_link, registrar_date,
                expiry_date, service_type, status, tgsend, st_tgsend, memo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        `).bind(
            data.domain,
            data.registrar,
            data.registrar_link || '',
            data.registrar_date,
            data.expiry_date,
            data.service_type,
            data.status,
            data.tgsend || 0,
            data.st_tgsend ?? 1,
            data.memo || ''
        ).run<Domain>()

        if (result.success) {
            const newDomain = result.results?.[0] || null
            console.log('创建成功:', newDomain)
            return Response.json({
                status: 200,
                message: '创建成功',
                data: newDomain
            })
        } else {
            throw new Error('数据库插入失败')
        }
    } catch (error) {
        console.error('创建域名失败:', error)
        return Response.json({
            status: 500,
            message: error instanceof Error ? error.message : '创建域名失败',
            data: null
        }, { status: 500 })
    }
} 