[English](./README.en.md)

![ChatGPT Image 2025年6月11日 09_29_12](https://github.com/user-attachments/assets/d7509dd3-5254-4af0-ad68-f8cbfdd0bcd9)


<div align="center">

# Domains-Manager

</div>



一个基于 Cloudflare Pages/EdgeOne Pages  的域名管理系统，帮助您轻松管理和监控多个域名的状态、到期时间等信息。

## 功能特点

- 域名管理：添加、编辑、删除、导入、导出域名信息
- 状态监控：自动检查域名在线状态
- 到期提醒：设置域名到期提醒时间
- 多注册商支持：支持多个域名注册商的信息记录
- Telegram 通知：支持通过 Telegram 发送到期提醒
- 响应式设计：支持移动端和桌面端访问
- 安全认证：基于用户名密码的访问控制

## 批量导入说明

系统支持通过JSON文件批量导入域名数据。导入格式如下：

```json
[
  {
    "domain": "example.com",
    "registrar": "Cloudflare",
    "registrar_link": "https://dash.cloudflare.com",
    "registrar_date": "2023-01-01",
    "expiry_date": "2024-01-01",
    "service_type": "网站",
    "memo": "主站"
  },
  {
    "domain": "example.org",
    "registrar": "Namecheap",
    "registrar_link": "https://www.namecheap.com",
    "registrar_date": "2023-02-15",
    "expiry_date": "2024-02-15",
    "service_type": "API服务",
    "memo": "API文档站点"
  }
]
```

### 导入字段说明

- `domain`：域名（必填）
- `registrar`：注册商名称
- `registrar_link`：注册商管理链接
- `registrar_date`：注册日期，格式为YYYY-MM-DD
- `expiry_date`：到期日期，格式为YYYY-MM-DD
- `service_type`：服务类型
- `memo`：备注信息

导入时，系统会自动验证数据格式，并给出成功和失败的详细信息。

## 快速开始

### 前置要求

- GitHub 账号
- Cloudflare 账号/EdgeOne 账号

### 安装步骤

1. Fork 本仓库到您的 GitHub 账号

2. 在 Cloudflare Pages/EdgeOne Pages  中创建新项目
   - 登录 Cloudflare Dashboard/EdgeOne Pages 
   - 进入 Pages 页面
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 选择您 fork 的仓库

3. 配置构建设置
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
   - 环境变量：
     ```
     USER=your_username
     PASS=your_password
     API_TOKEN=your_api_token
     ```

4. 创建 D1 数据库
   - 在 Cloudflare Dashboard 中进入 D1 页面
   - 创建新数据库，命名为 `domains-db`
   - 复制数据库 ID

5. 配置数据库
   - 在 Cloudflare Pages 项目设置中添加 D1 数据库绑定
   - 绑定名称：`DB`
   - 数据库 ID：粘贴之前复制的 ID

6. 初始化数据库
   - 在 Cloudflare Dashboard 中进入 D1 页面
   - 选择您的数据库
   - 执行 `schema.sql` 中的 SQL 语句

7. 部署
   - 点击 "Save and Deploy"
   - 等待部署完成

部署完成后，您可以通过 Cloudflare Pages 提供的域名访问系统。

## API 文档

### 1. 域名检查 API

**端点**: `/api/check`
**方法**: GET 或 POST
**认证**: 需要 API Token（通过 URL 参数或 Bearer Token）

认证方式（二选一）：
1. URL 参数：`/api/check?token=your_token`
2. Bearer Token：`Authorization: Bearer your_token`

响应：
```json
{
    "status": 200,
    "message": "检查完成",
    "data": {
        "total_domains": 10,
        "notified_domains": [
            {
                "domain": "example.com",
                "remainingDays": 15,
                "expiry_date": "2024-03-01"
            }
        ]
    }
}
```

### 2. 域名列表 API

**端点**: `/api/addrec`
**方法**: POST
**认证**: 需要 Bearer Token

响应：
```json
{
    "status": 200,
    "message": "获取成功",
    "data": [
        {
            "id": 1,
            "domain": "example.com",
            "registrar": "Cloudflare",
            "registrar_link": "https://cloudflare.com",
            "registrar_date": "2023-01-01",
            "expiry_date": "2024-01-01",
            "service_type": "网站",
            "status": "在线",
            "memo": "主站"
        }
    ]
}
```

## 配置说明

### 环境变量

- `USER`: 管理员用户名
- `PASS`: 管理员密码
- `API_TOKEN`: API 访问令牌

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 星
[![Stargazers over time](https://starchart.cc/wff0325/Domain-Manager.svg?variant=adaptive)](https://starchart.cc/wff0325/Domain-Manager)

"本项目 CDN 加速及安全防护由 Tencent EdgeOne 赞助：EdgeOne 提供长期有效的免费套餐，包含不限量的流量和请求，覆盖中国大陆节点，且无任何超额收费，感兴趣的朋友可以去 EdgeOne 官网获取"

[亚洲最佳CDN、边缘和安全解决方案 - Tencent EdgeOne](https://edgeone.ai/zh?from=github)

[!(https://edgeone.ai/media/34fe3a45-492d-4ea4-ae5d-ea1087ca7b4b.png)]

[![Use EdgeOne Pages to deploy](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https://console.tencentcloud.com/edgeone/pages/project/pages-3tg9qzxkm2i4/index?name=domain-manager)

## 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解更多详情。
