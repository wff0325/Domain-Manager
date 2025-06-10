drop table domains;

-- 创建域名表
CREATE TABLE IF NOT EXISTS domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    registrar TEXT NOT NULL,
    registrar_link TEXT,
    registrar_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    service_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT '离线',
    tgsend  INTEGER DEFAULT 0,  
    memo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 

--通知配置表
CREATE TABLE IF NOT EXISTS alertcfg (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tg_token TEXT NOT NULL,
    tg_userid TEXT NOT NULL,
    days INTEGER NOT NULL DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 

--v1.0.2 更新sql,需到cf上的domains-db的控制台上运行
ALTER TABLE domains ADD COLUMN st_tgsend INTEGER DEFAULT 1;
update domains set st_tgsend = 1 where st_tgsend is null;
