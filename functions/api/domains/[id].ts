import { Env, Domain } from '../../types'
import { checkAuth } from '../../utils/auth'

export const onRequestPut: PagesFunction<Env> = async (context) => {
    try {
        const authError = await checkAuth(context)
        if (authError) return authError

        const id = context.params.id as string
        const data = await context.request.json() as Domain

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
            UPDATE domains SET
                domain = ?,
                registrar = ?,
                registrar_link = ?,
                registrar_date = ?,
                expiry_date = ?,
                service_type = ?,
                status = ?,
                tgsend = ?,
                st_tgsend = ?,
                memo = ?
            WHERE id = ?
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
            data.memo || '',
            id
        ).run<Domain>()

        if (result.success) {
            const updatedDomain = result.results?.[0] || null
            if (!updatedDomain) {
                return Response.json({
                    status: 404,
                    message: '域名不存在',
                    data: null
                }, { status: 404 })
            }

            return Response.json({
                status: 200,
                message: '更新成功',
                data: updatedDomain
            })
        } else {
            throw new Error('数据库更新失败')
        }
    } catch (error) {
        console.error('更新域名失败:', error)
        return Response.json({
            status: 500,
            message: error instanceof Error ? error.message : '更新域名失败',
            data: null
        }, { status: 500 })
    }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    try {
        const authError = await checkAuth(context)
        if (authError) return authError

        const id = context.params.id

        const result = await context.env.DB.prepare(
            'DELETE FROM domains WHERE id = ?'
        ).bind(id).run()

        if (result.success) {
            return Response.json({
                status: 200,
                message: '删除成功',
                data: null
            })
        } else {
            throw new Error('删除失败')
        }
    } catch (error) {
        return Response.json({
            status: 500,
            message: error instanceof Error ? error.message : '删除域名失败',
            data: null
        }, { status: 500 })
    }
} 