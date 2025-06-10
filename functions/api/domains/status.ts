import { Env, Domain } from '../../types'
import { checkAuth } from '../../utils/auth'

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const authError = await checkAuth(context)
        if (authError) return authError

        const { domain, status } = await context.request.json() as { domain: string, status: string }

        const result = await context.env.DB.prepare(`
            UPDATE domains 
            SET status = ? 
            WHERE domain = ?
            RETURNING *
        `).bind(
            status,
            domain
        ).run<Domain>()

        if (!result.success) {
            throw new Error('更新状态失败')
        }

        return Response.json({
            status: 200,
            message: '更新成功',
            data: result.results?.[0] || null
        })
    } catch (error) {
        console.error('更新域名状态失败:', error)
        return Response.json({
            status: 500,
            message: error instanceof Error ? error.message : '更新域名状态失败',
            data: null
        }, { status: 500 })
    }
} 