[中文 (Chinese)](#中文) | [English](#english)

---

<a name="中文"></a>

##  Domain-Manager

#### 介绍
一个用于管理域名和SSL证书的简单平台

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

---

<a name="english"></a>

## Domain-Manager

#### Introduction
A simple platform for managing domains and SSL certificates.

#### Feature List
1.  **Domain Management**
    - [x] Domain List
    - [x] Add Domain
    - [x] Delete Domain
    - [x] Sync Domains (Supports Cloudflare/Dnspod)
    - [x] DNS Record Management
    - [x] Add Record
    - [x] Delete Record
    - [x] Modify Record
    - [x] Domain Certificate Management
    - [x] Apply for Certificate
    - [x] Renew Certificate
    - [x] Auto-Renew Certificate
    - [x] Download Certificate
    - [x] Delete Certificate
    - [x] Push Certificate to other servers
    - [x] Domain Monitoring
2.  **Certificate Management**
    - [x] Certificate List
    - [x] Add Certificate
    - [x] Delete Certificate
    - [x] Monitor Certificate
    - [x] Push Certificate to other servers
3.  **User Management**
    - [x] User List
    - [x] Add User
    - [x] Delete User
4.  **Notification Channels**
    - [x] Bark
    - [x] ServerChan
    - [x] WeCom
    - [x] DingTalk
    - [x] Lark (Feishu)

#### Software Architecture
- Vue.js
- Golang
- Gin
- Gorm
- SQLite

#### Installation Guide

1.  Download the latest version of `Domain-Manager`.
2.  Unzip the `Domain-Manager` package.
3.  Run `Domain-Manager`:
    - `./Domain-Manager -c config.yaml`
4.  Access `Domain-Manager`:
    - `http://127.0.0.1:8080`
5.  Default username and password:
    - `admin` / `admin`

#### Usage Instructions
1.  **Add a Domain Provider**
    - Supports `Cloudflare` and `Dnspod`.
    - `Cloudflare` requires an `API Token`.
    - `Dnspod` requires an `ID` and `Token`.
2.  **Add a Domain**
    - Manually add.
    - Sync from a provider.
3.  **Add DNS Records**
    - Manually add.
4.  **Apply for a Certificate**
    - Supports `Let's Encrypt` and `ZeroSSL`.
    - Challenge types: `HTTP-01` and `DNS-01`.
    - The `DNS-01` challenge requires support from your domain provider.
5.  **Push a Certificate**
    - Supports `SSH`.
    - Push certificates to other remote servers.

#### How to Contribute

1.  Fork this repository.
2.  Create a new branch (e.g., `feat_xxx`).
3.  Commit your changes.
4.  Create a new Pull Request.
