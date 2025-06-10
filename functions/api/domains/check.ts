import { Env } from '../../types'

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { domain } = await context.request.json() as { domain: string }

        try {
            const controller = new AbortController()
            const timeoutPromise = new Promise<Response>((_, reject) => {
                setTimeout(() => {
                    controller.abort()
                    reject(new Error('Timeout'))
                }, 5000)
            })

            // 先尝试 HTTP 协议
            const httpFetchPromise = fetch(`http://${domain}`, {
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
                    // 检查状态码和内容类型
                    const contentType = response.headers.get('content-type')
                    const contentLength = response.headers.get('content-length')

                    // 如果状态码是 2xx 或 3xx，且有内容类型或内容长度，则认为在线
                    if ((response.status >= 200 && response.status < 400) &&
                        (contentType || contentLength)) {
                        return Response.json({
                            status: 200,
                            message: '检查完成',
                            data: { status: '在线' }
                        })
                    }
                }
            } catch (httpError) {
                console.error(`HTTP 检查域名 ${domain} 失败:`, httpError)
                // 如果 HTTP 失败，尝试 HTTPS
                const httpsFetchPromise = fetch(`https://${domain}`, {
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
                        // 检查状态码和内容类型
                        const contentType = response.headers.get('content-type')
                        const contentLength = response.headers.get('content-length')

                        // 如果状态码是 2xx 或 3xx，且有内容类型或内容长度，则认为在线
                        if ((response.status >= 200 && response.status < 400) &&
                            (contentType || contentLength)) {
                            return Response.json({
                                status: 200,
                                message: '检查完成',
                                data: { status: '在线' }
                            })
                        }
                    }
                } catch (httpsError) {
                    console.error(`HTTPS 检查域名 ${domain} 失败:`, httpsError)
                }
            }
        } catch (error) {
            console.error(`检查域名 ${domain} 失败:`, error)
        }

        return Response.json({
            status: 200,
            message: '检查完成',
            data: { status: '离线' }
        })
    } catch (error) {
        console.error('域名检查失败:', error)
        return Response.json({
            status: 500,
            message: error instanceof Error ? error.message : '检查失败',
            data: null
        }, { status: 500 })
    }
} 