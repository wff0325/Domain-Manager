[English](./README.en.md)

---

### Domain-Manager

#### 介绍
一个用于管理域名和SSL证书的简单平台

<!-- 在这里粘贴你的项目预览图片 -->
<!-- 例如: ![项目预览](https://example.com/your-image.png) -->


#### 功能清单
1. 域名管理
    - [x] 域名列表
    - [x] 添加域名
    - [x] 删除域名
    - [x] 同步域名（支持Cloudflare/Dnspod）
    - [x] 域名解析管理
    - [x] 添加解析
    - [x] 删除解析
    - [x] 修改解析
    - [x] 域名证书管理
    - [x] 申请证书
    - [x] 证书续期
    - [x] 自动续期
    - [x] 下载证书
    - [x] 删除证书
    - [x] 推送证书到其他服务器
    - [x] 域名监控
2. 证书管理
    - [x] 证书列表
    - [x] 添加证书
    - [x] 删除证书
    - [x] 监控证书
    - [x] 推送证书到其他服务器
3. 用户管理
    - [x] 用户列表
    - [x] 添加用户
    - [x] 删除用户
4. 消息通知
    - [x] Bark
    - [x] Server酱
    - [x] 企业微信
    - [x] 钉钉
    - [x] 飞书

#### 软件架构
- Vue.js
- Golang
- Gin
- Gorm
- SQLite

#### 安装教程

1. 下载最新版本的 `Domain-Manager`
2. 解压 `Domain-Manager`
3. 运行 `Domain-Manager`
    - `./Domain-Manager -c config.yaml`
4. 访问 `Domain-Manager`
    - `http://127.0.0.1:8080`
5. 默认用户名和密码
    - `admin` / `admin`

#### 使用说明
1.  **添加域名服务商**
    - 支持 `Cloudflare` 和 `Dnspod`
    - `Cloudflare` 需要 `API Token`
    - `Dnspod` 需要 `ID` 和 `Token`
2.  **添加域名**
    - 手动添加
    - 从服务商同步
3.  **添加DNS解析**
    - 手动添加
4.  **申请证书**
    - 支持 `Let's Encrypt` 和 `ZeroSSL`
    - 申请方式 `HTTP-01` 和 `DNS-01`
    - `DNS-01` 方式需要服务商支持
5.  **推送证书**
    - 支持 `SSH`
    - 推送证书到其他服务器

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request
