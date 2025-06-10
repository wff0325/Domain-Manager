import type { Env } from '../../types'

interface AlertConfig {
    tg_token: string
    tg_userid: string
    days: number
}

interface Domain {
    domain: string
    expiry_date: string
    tgsend: number
    st_tgsend: number
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

        console.log('开始执行域名检查...')
        const { results: configResults } = await context.env.DB.prepare(
            'SELECT * FROM alertcfg LIMIT 1'
        ).all<AlertConfig>()

        if (!configResults.length) {
            console.log('未找到告警配置')
            return Response.json({
                status: 404,
                message: '未找到告警配置',
                data: null
            }, { status: 404 })
        }

        const config = configResults[0]
        console.log('获取到告警配置:', {
            days: config.days,
            has_token: !!config.tg_token,
            has_userid: !!config.tg_userid
        })

        // 获取所有域名
        const { results: domains } = await context.env.DB.prepare(
            'SELECT domain, expiry_date, tgsend, st_tgsend FROM domains WHERE tgsend = 1 or st_tgsend = 1'
        ).all<Domain>()

        console.log(`找到 ${domains.length} 个启用通知的域名`)
        const notifiedDomains = []

        for (const domain of domains) {
            const remainingDays = calculateRemainingDays(domain.expiry_date)
            console.log(`检查域名 ${domain.domain}: 过期时间 ${domain.expiry_date}, 剩余天数 ${remainingDays}`)

            // 检查网站连通性
            let isOnline = false
            try {
                const controller = new AbortController()
                const timeoutPromise = new Promise<Response>((_, reject) => {
                    setTimeout(() => {
                        controller.abort()
                        reject(new Error('Timeout'))
                    }, 5000)
                })

                // 先尝试 HTTP 协议
                const httpFetchPromise = fetch(`http://${domain.domain}`, {
                    method: 'GET',
                    redirect: 'follow',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': '*/*'
                    }
                })

                try {
                    const response = await Promise.race([httpFetchPromise, timeoutPromise])
                    if (response instanceof Response) {
                        if (response.status >= 200 && response.status < 500) {
                            isOnline = true
                        }
                    }
                } catch (httpError) {
                    console.error(`HTTP 检查域名 ${domain.domain} 失败:`, httpError)
                    // 如果 HTTP 失败，尝试 HTTPS
                    const httpsFetchPromise = fetch(`https://${domain.domain}`, {
                        method: 'GET',
                        redirect: 'follow',
                        signal: controller.signal,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        }
                    })

                    try {
                        const response = await Promise.race([httpsFetchPromise, timeoutPromise])
                        if (response instanceof Response) {
                            if (response.status >= 200 && response.status < 500) {
                                isOnline = true
                            }
                        }
                    } catch (httpsError) {
                        console.error(`HTTPS 检查域名 ${domain.domain} 失败:`, httpsError)
                    }
                }
            } catch (error) {
                console.error(`检查域名 ${domain.domain} 失败:`, error)
            }

            // 更新域名状态
            const newStatus = isOnline ? '在线' : '离线'
            await context.env.DB.prepare(
                'UPDATE domains SET status = ? WHERE domain = ?'
            ).bind(newStatus, domain.domain).run()

            // 如果状态变为离线且启用了通知，发送 Telegram 消息
            if (newStatus === '离线' && domain.st_tgsend === 1) {
                const message = `*🔔 Domains-Support 通知*\n\n` +
                    `⚠️ *域名服务离线告警*\n\n` +
                    `🌐 域名：\`${domain.domain}\`\n` +
                    `📊 状态：离线\n` +
                    `⏰ 时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n\n` +
                    `🔍 请检查网站服务状态！`

                try {
                    await sendTelegramMessage(config.tg_token, config.tg_userid, message)
                    console.log(`成功发送离线通知：${domain.domain}`)
                } catch (error) {
                    console.error(`发送离线通知失败:`, error)
                }
            }

            // 检查域名是否即将过期
            if (remainingDays <= config.days && domain.tgsend === 1) {
                console.log(`域名 ${domain.domain} 需要发送过期通知：剩余天数(${remainingDays}) <= 阈值(${config.days})`)
                const message = `*🔔 Domains-Support通知*\n\n` +
                    `🌐 域名：\`${domain.domain}\`\n` +
                    `📅 过期时间：\`${domain.expiry_date}\`\n` +
                    `⏳ 剩余天数：\`${remainingDays}天\`\n\n` +
                    `⚠️ 剩余天数告警，请尽快进行续约！`

                try {
                    console.log('准备发送过期通知...')
                    await sendTelegramMessage(config.tg_token, config.tg_userid, message)
                    console.log(`成功发送过期通知：${domain.domain}`)
                    notifiedDomains.push({
                        domain: domain.domain,
                        remainingDays,
                        expiry_date: domain.expiry_date
                    })
                } catch (error) {
                    console.error(`发送过期通知失败:`, error)
                }
            }
        }

        return Response.json({
            status: 200,
            message: '检查完成',
            data: {
                total_domains: domains.length,
                notified_domains: notifiedDomains
            }
        })
    } catch (error) {
        console.error('检查执行失败:', error)
        return Response.json({
            status: 500,
            message: '检查执行失败: ' + (error as Error).message,
            data: null
        }, { status: 500 })
    }
}

// 添加对 GET 方法的支持
export const onRequestGet: PagesFunction<Env> = onRequestPost

function calculateRemainingDays(expiryDate: string): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    expiry.setHours(0, 0, 0, 0)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
}

async function sendTelegramMessage(token: string, chatId: string, message: string): Promise<void> {
    if (!token || !chatId) {
        throw new Error('Telegram token 或 chat ID 未配置')
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`
    console.log('发送 Telegram 请求:', { url, chatId, messageLength: message.length })

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
        }),
    })

    const responseData = await response.json()

    if (!response.ok) {
        console.error('Telegram API 响应错误:', responseData)
        throw new Error(`Failed to send Telegram message: ${response.statusText}, Details: ${JSON.stringify(responseData)}`)
    }

    console.log('Telegram API 响应:', responseData)
} 