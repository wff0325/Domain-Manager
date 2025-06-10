import type { Env } from '../../types'

interface DomainRecord {
    domain: string
    registrar: string
    registrar_link: string
    registrar_date: string
    expiry_date: string
    service_type: string
    status: string
    tgsend: number
    memo?: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        // 验证 API Token
        const url = new URL(context.request.url)
        const tokenParam = url.searchParams.get('token')
        const authHeader = context.request.headers.get('Authorization')
        const headerToken = authHeader?.replace('Bearer ', '')

        // 同时支持查询参数和 Bearer Token
        const token = tokenParam || headerToken

        if (!token || token !== context.env.API_TOKEN) {
            return Response.json({
                status: 401,
                message: '未授权访问',
                data: null
            }, { status: 401 })
        }

        // 解析请求体
        const data = await context.request.json() as DomainRecord
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

        // 验证域名格式
        const domainRegex = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
        if (!domainRegex.test(data.domain)) {
            return Response.json({
                status: 400,
                message: '域名格式不正确',
                data: null
            }, { status: 400 })
        }

        // 验证日期格式
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(data.registrar_date) || !dateRegex.test(data.expiry_date)) {
            return Response.json({
                status: 400,
                message: '日期格式不正确，应为 YYYY-MM-DD',
                data: null
            }, { status: 400 })
        }

        // 检查域名是否已存在
        const { results: existingDomains } = await context.env.DB.prepare(
            'SELECT id FROM domains WHERE domain = ?'
        ).bind(data.domain).all()

        if (existingDomains.length > 0) {
            // 更新现有记录的 service_type 和 status
            const result = await context.env.DB.prepare(`
                UPDATE domains 
                SET service_type = ?, status = ?, memo = ?
                WHERE domain = ?
                RETURNING *
            `).bind(
                data.service_type,
                data.status,
                data.memo,
                data.domain
            ).run()

            if (result.success) {
                const updatedDomain = result.results?.[0] || null
                console.log('更新成功:', updatedDomain)
                return Response.json({
                    status: 200,
                    message: '更新成功',
                    data: updatedDomain
                })
            } else {
                throw new Error('数据库更新失败')
            }
        }

        // 插入新数据
        const result = await context.env.DB.prepare(`
            INSERT INTO domains (
                domain, registrar, registrar_link, registrar_date,
                expiry_date, service_type, status, tgsend, memo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            data.memo || ''
        ).run()

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