import { Env } from '../../types'
import { checkAuth } from '../../utils/auth'

interface AlertConfig {
    tg_token: string
    tg_userid: string
    days: number
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const authError = await checkAuth(context)
        if (authError) return authError

        const { results } = await context.env.DB.prepare(
            'SELECT * FROM alertcfg LIMIT 1'
        ).all<AlertConfig>()

        return Response.json({
            status: 200,
            message: '获取成功',
            data: results[0] || null
        })
    } catch (error) {
        console.error('获取配置失败:', error)
        return Response.json({
            status: 500,
            message: '获取配置失败',
            data: null
        }, { status: 500 })
    }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const authError = await checkAuth(context)
        if (authError) return authError

        const data = await context.request.json() as AlertConfig

        // 验证必填字段
        const requiredFields = ['tg_token', 'tg_userid', 'days'] as const
        for (const field of requiredFields) {
            if (!data[field]) {
                return Response.json({
                    status: 400,
                    message: `${field} 是必填字段`,
                    data: null
                }, { status: 400 })
            }
        }

        // 检查是否已存在配置
        const { results } = await context.env.DB.prepare(
            'SELECT id FROM alertcfg LIMIT 1'
        ).all<{ id: number }>()

        let result
        if (results.length > 0) {
            // 更新现有记录
            result = await context.env.DB.prepare(`
                UPDATE alertcfg 
                SET tg_token = ?, tg_userid = ?, days = ?
                WHERE id = ?
                RETURNING *
            `).bind(
                data.tg_token,
                data.tg_userid,
                data.days,
                results[0].id
            ).run<AlertConfig>()
        } else {
            // 插入新记录
            result = await context.env.DB.prepare(`
                INSERT INTO alertcfg (tg_token, tg_userid, days)
                VALUES (?, ?, ?)
                RETURNING *
            `).bind(
                data.tg_token,
                data.tg_userid,
                data.days
            ).run<AlertConfig>()
        }

        if (result.success) {
            const config = result.results?.[0] || null
            return Response.json({
                status: 200,
                message: results.length > 0 ? '更新成功' : '保存成功',
                data: config
            })
        } else {
            throw new Error('数据库操作失败')
        }
    } catch (error) {
        console.error('保存配置失败:', error)
        return Response.json({
            status: 500,
            message: error instanceof Error ? error.message : '保存配置失败',
            data: null
        }, { status: 500 })
    }
} 