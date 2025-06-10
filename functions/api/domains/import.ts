import type { Env } from '../../types'
import { verifyToken } from '../../utils/auth'

interface DomainData {
    domain: string;
    registrar?: string;
    registrar_link?: string;
    registrar_date?: string;
    expiry_date?: string;
    service_type?: string;
    status?: string;
    memo?: string;
    tgsend?: number;
    st_tgsend?: number;
}

interface ImportResult {
    total: number;
    success: number;
    failed: number;
    errors: Array<{
        domain: string;
        error: string;
    }>;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
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

        // 解析上传的 JSON 文件
        let domains: DomainData[] = []
        try {
            const contentType = context.request.headers.get('content-type') || ''

            // 根据内容类型处理不同的请求体格式
            if (contentType.includes('application/json')) {
                // 直接解析 JSON
                domains = await context.request.json() as DomainData[]
            } else if (contentType.includes('multipart/form-data')) {
                // 处理 multipart 表单数据
                const formData = await context.request.formData()
                const file = formData.get('file')

                if (!file || typeof file !== 'object' || !('text' in file)) {
                    throw new Error('未提供有效的文件')
                }

                const content = await (file as File).text()
                domains = JSON.parse(content)
            } else {
                throw new Error('不支持的内容类型')
            }

            // 确保 domains 是数组
            if (!Array.isArray(domains)) {
                // 尝试查找嵌套的 domains 字段
                if (domains && typeof domains === 'object' && 'domains' in domains) {
                    const nestedDomains = (domains as { domains: DomainData[] }).domains;
                    if (Array.isArray(nestedDomains)) {
                        domains = nestedDomains;
                    } else {
                        throw new Error('无效的数据格式：domains 字段不是数组');
                    }
                } else {
                    throw new Error('无效的数据格式：应为数组或包含 domains 数组的对象')
                }
            }
        } catch (error) {
            return Response.json({
                status: 400,
                message: '解析文件失败: ' + (error as Error).message,
                data: null
            }, { status: 400 })
        }

        // 插入数据
        const results: ImportResult = {
            total: domains.length,
            success: 0,
            failed: 0,
            errors: []
        }

        const db = context.env.DB

        // 开始导入域名
        for (const domain of domains) {
            try {
                // 必填字段验证
                if (!domain.domain) {
                    throw new Error('域名字段缺失')
                }

                // 检查域名是否已存在
                const existingDomain = await db.prepare(
                    'SELECT id FROM domains WHERE domain = ?'
                ).bind(domain.domain).first()

                if (existingDomain) {
                    // 更新现有域名
                    await db.prepare(`
                        UPDATE domains 
                        SET 
                            registrar = ?, 
                            registrar_link = ?, 
                            registrar_date = ?, 
                            expiry_date = ?, 
                            service_type = ?, 
                            status = ?, 
                            memo = ?, 
                            tgsend = ?, 
                            st_tgsend = ?
                        WHERE domain = ?
                    `).bind(
                        domain.registrar || '',
                        domain.registrar_link || '',
                        domain.registrar_date || '',
                        domain.expiry_date || '',
                        domain.service_type || '',
                        domain.status || '离线',
                        domain.memo || '',
                        domain.tgsend || 0,
                        domain.st_tgsend || 0,
                        domain.domain
                    ).run()
                } else {
                    // 插入新域名
                    await db.prepare(`
                        INSERT INTO domains 
                        (domain, registrar, registrar_link, registrar_date, expiry_date, service_type, status, memo, tgsend, st_tgsend)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        domain.domain,
                        domain.registrar || '',
                        domain.registrar_link || '',
                        domain.registrar_date || '',
                        domain.expiry_date || '',
                        domain.service_type || '',
                        domain.status || '离线',
                        domain.memo || '',
                        domain.tgsend || 0,
                        domain.st_tgsend || 0
                    ).run()
                }

                results.success++
            } catch (error) {
                results.failed++
                results.errors.push({
                    domain: domain.domain || '未知域名',
                    error: (error as Error).message
                })
            }
        }

        return Response.json({
            status: 200,
            message: `导入完成: ${results.success} 成功, ${results.failed} 失败`,
            data: results
        })
    } catch (error) {
        console.error('导入数据失败:', error)
        return Response.json({
            status: 500,
            message: '导入数据失败: ' + (error as Error).message,
            data: null
        }, { status: 500 })
    }
}
