import type { Env } from '../../types'
import { verifyToken } from '../../utils/auth'

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        // 验证权限
        const authResult = await verifyToken(context)
        if (!authResult.success) {
            return Response.json({
                status: 401,
                message: authResult.message || '未授权访问',
                data: null
            }, { status: 401 })
        }

        // 获取所有域名数据，排除 ID 字段
        const { results } = await context.env.DB.prepare(
            'SELECT domain, registrar, registrar_link, registrar_date, expiry_date, service_type, status, memo, tgsend, st_tgsend FROM domains'
        ).all()

        // 返回 JSON 文件，直接输出 domains 数组
        return new Response(JSON.stringify(results, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="domains-export-${new Date().toISOString().split('T')[0]}.json"`
            }
        })
    } catch (error) {
        console.error('导出数据失败:', error)
        return Response.json({
            status: 500,
            message: '导出数据失败: ' + (error as Error).message,
            data: null
        }, { status: 500 })
    }
} 