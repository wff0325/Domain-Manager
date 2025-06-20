[中文 (Chinese)](./README.md)

---

### Domain-Manager

#### Introduction
A simple platform for managing domains and SSL certificates.

<!-- Paste your project preview images here -->
<!-- Example: ![Project Preview](https://example.com/your-image.png) -->

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
