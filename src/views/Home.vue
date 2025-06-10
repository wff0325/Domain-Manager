<template>
    <div class="home-container" :class="{ 'dark-mode': effectiveDarkMode }">
        <div class="header">
            <h2 class="neon-title" data-text="域名管理系统(Domains-Support)">域名管理系统(Domains-Support)</h2>
            <div class="header-buttons">
                <el-button type="primary" size="small" :icon="Refresh" :loading="refreshing"
                    @click="handleRefresh">刷新</el-button>
                
                <!-- 其他系统操作按钮 -->
                <el-dropdown trigger="click">
                    <el-button type="primary" size="small">
                        系统
                        <el-icon class="el-icon--right"><arrow-down /></el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="handleAdd" :icon="Plus">新增</el-dropdown-item>
                            <el-dropdown-item @click="handleConfig" :icon="Setting">配置</el-dropdown-item>
                            <el-dropdown-item @click="handleImport" :icon="Upload">导入</el-dropdown-item>
                            <el-dropdown-item @click="handleExport" :icon="Download">导出</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                
                <!-- 全新的主题切换器 -->
                <el-dropdown trigger="click" @command="setTheme">
                    <el-button type="primary" size="small">
                        <el-icon>
                            <Sunny v-if="theme === 'light'" />
                            <Moon v-else-if="theme === 'dark'" />
                            <Monitor v-else />
                        </el-icon>
                        <span style="margin-left: 5px;">主题</span>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="light" :icon="Sunny">亮色模式</el-dropdown-item>
                            <el-dropdown-item command="dark" :icon="Moon">暗色模式</el-dropdown-item>
                            <el-dropdown-item command="system" :icon="Monitor">跟随系统</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <el-tooltip content="登出系统" placement="bottom">
                    <el-button type="primary" size="small" :icon="SwitchButton" @click="handleLogout">登出</el-button>
                </el-tooltip>
            </div>
        </div>

        <el-table :data="domains" border style="width: 100%" class="custom-table">
            <el-table-column label="域名" align="center" sortable>
                <template #default="scope">
                    <a :href="'https://' + scope.row.domain" target="_blank" class="link">{{ scope.row.domain }}</a>
                </template>
            </el-table-column>
            <el-table-column label="域名商" align="center" sortable prop="registrar">
                <template #default="scope">
                    <a :href="scope.row.registrar_link" target="_blank" class="link">{{ scope.row.registrar }}</a>
                </template>
            </el-table-column>
            <el-table-column prop="registrar_date" label="注册时间" align="center" sortable />
            <el-table-column prop="expiry_date" label="过期时间" align="center" sortable />
            <el-table-column label="剩余时间" align="center" sortable
                :sort-method="(a, b) => calculateRemainingDays(a.expiry_date) - calculateRemainingDays(b.expiry_date)">
                <template #default="scope">
                    <span :class="{ 'warning-text': calculateRemainingDays(scope.row.expiry_date) <= alertDays }">
                        {{ calculateRemainingDays(scope.row.expiry_date) }}天
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="service_type" label="服务类型" align="center" sortable />
            <el-table-column prop="status" label="状态" align="center" sortable>
                <template #default="scope">
                    <span :class="scope.row.status === '在线' ? 'success-text' : 'danger-text'">
                        {{ scope.row.status }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="memo" label="备注" align="center" sortable />
            <el-table-column label="操作" width="200" align="center">
                <template #default="scope">
                    <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(scope.row)">修改</el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <DomainDialog v-model:visible="dialogVisible" :is-edit="isEdit" :edit-data="editData"
            @submit="handleDialogSubmit" />

        <AlertConfigDialog v-model:visible="configVisible" :config="alertConfig" @submit="handleConfigSubmit" />

        <ImportDialog v-model:visible="importVisible" @success="loadDomains" />

        <footer class="footer">
            <div class="footer-content">
                <div class="copyright">
                    <span>© 2025 Domains-Support v1.0.5</span>
                    <span class="separator">|</span>
                    <span>作者：大疯子</span>
                    <span class="separator">|</span>
                    <div class="social-links">
                        <a href="https://github.com/wff0325/Domain-Manager/tree/main" target="_blank"
                            class="social-link" title="访问 GitHub 仓库">
                            <el-icon class="social-icon"><svg viewBox="0 0 1024 1024" width="20" height="20">
                                    <path fill="currentColor"
                                        d="M512 0C229.12 0 0 229.12 0 512c0 226.56 146.56 417.92 350.08 485.76 25.6 4.48 35.2-10.88 35.2-24.32 0-12.16-0.64-52.48-0.64-95.36-128.64 23.68-161.92-31.36-172.16-60.16-5.76-14.72-30.72-60.16-52.48-72.32-17.92-9.6-43.52-33.28-0.64-33.92 40.32-0.64 69.12 37.12 78.72 52.48 46.08 77.44 119.68 55.68 149.12 42.24 4.48-33.28 17.92-55.68 32.64-68.48-113.92-12.8-232.96-56.96-232.96-252.8 0-55.68 19.84-101.76 52.48-137.6-5.12-12.8-23.04-65.28 5.12-135.68 0 0 42.88-13.44 140.8 52.48 40.96-11.52 84.48-17.28 128-17.28 43.52 0 87.04 5.76 128 17.28 97.92-66.56 140.8-52.48 140.8-52.48 28.16 70.4 10.24 122.88 5.12 135.68 32.64 35.84 52.48 81.28 52.48 137.6 0 196.48-119.68 240-233.6 252.8 18.56 16 34.56 46.72 34.56 94.72 0 68.48-0.64 123.52-0.64 140.8 0 13.44 9.6 29.44 35.2 24.32C877.44 929.92 1024 737.92 1024 512 1024 229.12 794.88 0 512 0z" />
                                </svg></el-icon>
                        </a>
                        <a href="https://www.youtube.com/" target="_blank"
                            class="social-link" title="访问 YouTube 频道">
                            <el-icon class="social-icon"><svg viewBox="0 0 1024 1024" width="20" height="20">
                                    <path fill="currentColor"
                                        d="M941.3 296.1c-10.3-38.6-40.7-69-79.3-79.3C792.2 198 512 198 512 198s-280.2 0-350 18.7c-38.6 10.3-69 40.7-79.3 79.3C64 365.9 64 512 64 512s0 146.1 18.7 215.9c10.3 38.6 40.7 69 79.3 79.3C231.8 826 512 826 512 826s280.2 0 350-18.7c38.6-10.3 69-40.7 79.3-79.3C960 658.1 960 512 960 512s0-146.1-18.7-215.9zM423 646V378l232 134-232 134z" />
                                </svg></el-icon>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue' // <-- 引入 computed
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// <-- 引入 Monitor 图标
import { Setting, Refresh, Plus, Edit, Delete, SwitchButton, Sunny, Moon, ArrowDown, Upload, Download, Monitor } from '@element-plus/icons-vue' 
import { useAuth } from '../utils/auth'
import DomainDialog from '../components/DomainDialog.vue'
import AlertConfigDialog from '../components/AlertConfigDialog.vue'
import ImportDialog from '../components/ImportDialog.vue'
import { createDomain, updateDomain, deleteDomain, type DomainData } from '../api/domains'

type Domain = DomainData
type Theme = 'light' | 'dark' | 'system'

// --- 全新的主题管理逻辑 ---
const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'system')

// 计算属性，用于决定当前是否应该应用暗黑模式的 class
const effectiveDarkMode = computed(() => {
    if (theme.value === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value === 'dark'
})

// 应用主题的核心函数
const applyTheme = (isDark: boolean) => {
    if (isDark) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

// 设置新主题的函数
const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme(effectiveDarkMode.value)
}

// --- 原有的其他 script setup 代码 ---
const router = useRouter()
const auth = useAuth()
const domains = ref<Domain[]>([])
const alertDays = ref(30)
// ... 其他所有未改动的 ref 和函数都保持原样 ...
const alertConfig = ref<AlertConfig>()
const refreshing = ref(false)
const dialogVisible = ref(false)
const configVisible = ref(false)
const isEdit = ref(false)
const editData = ref<Domain>()
const importVisible = ref(false)
interface AlertConfig {
    tg_token: string
    tg_userid: string
    days: number
}
interface ApiResponse<T = any> {
    status: number
    message: string
    data: T
}
const checkLoginStatus = () => {
    const token = auth.getAuthToken()
    if (!token) {
        router.push({ name: 'Login' })
    }
}
const handleLogout = () => {
    auth.clearAuth()
    router.push({ name: 'Login' })
}
const handleAdd = () => {
    isEdit.value = false
    editData.value = undefined
    dialogVisible.value = true
}
const handleEdit = (row: Domain) => {
    isEdit.value = true
    editData.value = row
    dialogVisible.value = true
}
const handleDelete = async (row: Domain) => {
    try {
        await ElMessageBox.confirm('确定要删除该域名吗？', '提示', {
            type: 'warning'
        })
        if (row.id) {
            await deleteDomain(row.id)
            ElMessage.success('删除成功')
            await loadDomains()
        }
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败')
        }
    }
}
const handleDialogSubmit = async (formData: Omit<Domain, 'id' | 'created_at'>) => {
    try {
        if (isEdit.value && editData.value?.id) {
            await updateDomain(editData.value.id, formData)
            ElMessage.success('修改成功')
        } else {
            await createDomain(formData)
            ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        await loadDomains()
    } catch (error: any) {
        ElMessage.error(error.response?.data?.message || (isEdit.value ? '修改失败' : '添加失败'))
    }
}
const loadDomains = async () => {
    try {
        const authData = auth.getAuthToken()
        if (!authData) throw new Error('未登录或登录已过期')
        const response = await fetch('/api/domains', {
            headers: { 'Authorization': `Bearer ${authData.token}` }
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || '请求失败')
        }
        const result = await response.json()
        if (result.status !== 200) throw new Error(result.message || '请求失败')
        domains.value = result.data || []
    } catch (error: any) {
        ElMessage.error(error.message || '加载域名列表失败')
        if (error.message.includes('未授权')) {
            auth.clearAuth()
            router.push({ name: 'Login' })
        }
    }
}
const calculateRemainingDays = (expiryDate: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate); expiry.setHours(0, 0, 0, 0)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays < 0 ? 0 : diffDays
}
const handleConfig = () => { configVisible.value = true }
const handleConfigSubmit = async (config: AlertConfig) => {
    try {
        const authData = auth.getAuthToken()
        if (!authData) throw new Error('未登录或登录已过期')
        const response = await fetch('/api/alertconfig', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.token}` },
            body: JSON.stringify(config)
        })
        const result = await response.json()
        if (result.status === 200) {
            ElMessage.success('配置保存成功')
            alertDays.value = config.days
            alertConfig.value = config
        } else {
            throw new Error(result.message || '保存失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '保存配置失败')
    }
}
const handleImport = () => { importVisible.value = true }
const handleExport = async () => { /* ... */ } // 保持不变
const handleRefresh = async () => { /* ... */ } // 保持不变

onMounted(() => {
    // 初始化时应用一次主题
    applyTheme(effectiveDarkMode.value)

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (theme.value === 'system') {
            applyTheme(effectiveDarkMode.value)
        }
    })

    checkLoginStatus()
    loadDomains()
    // loadAlertConfig() // 假设这个函数也存在且不变
})
</script>

<style>
/* 全局样式 */
.neon-title { /* ... 保持不变 ... */ }
@keyframes gradientFlow { /* ... 保持不变 ... */ }

#live2d-widget {
    z-index: 1 !important;
    pointer-events: none !important;
}

.dark { /* ... 保持不变 ... */ }
</style>

<style scoped>
/* --- 背景和布局 --- */
.home-container {
    min-height: 100vh;
    box-sizing: border-box;
    padding: 20px;
    background-size: cover;
    background-position: center center;
    background-attachment: fixed;
    transition: background-color 0.5s ease;
    position: relative; /* 为遮罩层提供定位上下文 */
    color: #303133;
}
/* 背景遮罩层 */
.home-container::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url('https://w.wallhaven.cc/full/we/wallhaven-wexqj6.jpg'); /* 固定一张背景图 */
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    z-index: -1; /* 将背景图置于最底层 */
    transition: opacity 0.5s ease;
}
/* 颜色叠加层 */
.home-container::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(255, 255, 255, 0.3); /* 日间模式的浅色遮罩 */
    z-index: -1;
    transition: background-color 0.5s ease;
}
.home-container.dark-mode {
    color: #E5EAF3;
}
.home-container.dark-mode::after {
    background-color: rgba(0, 0, 0, 0.5); /* 夜间模式的深色遮罩 */
}

/* --- 不透明面板，彻底解决可读性问题 --- */
.header, .custom-table, .footer {
    position: relative;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.6); /* 日间模式的面板背景 */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    transition: background-color 0.5s, border-color 0.5s;
}
.dark-mode .header, .dark-mode .custom-table, .dark-mode .footer {
    background-color: rgba(40, 40, 40, 0.7); /* 夜间模式的面板背景 */
    border-color: rgba(255, 255, 255, 0.1);
}

/* 表格样式 */
.custom-table {
    --el-table-border-color: rgba(0,0,0,0.1); /* Element Plus 变量覆盖 */
}
.dark-mode .custom-table {
    --el-table-border-color: rgba(255,255,255,0.15);
}
:deep(.el-table),
:deep(.el-table__expanded-cell) {
    background-color: transparent !important;
}
:deep(.el-table th),
:deep(.el-table tr),
:deep(.el-table td) {
    background-color: transparent !important;
    color: inherit !important; /* 让文字颜色跟随父容器 */
}
:deep(.el-table__row:hover td) {
    background-color: rgba(0, 0, 0, 0.05) !important;
}
.dark-mode :deep(.el-table__row:hover td) {
    background-color: rgba(255, 255, 255, 0.05) !important;
}

/* 链接和状态文本 */
.link { color: #0066cc; text-decoration: none; font-weight: bold; }
.dark-mode .link { color: #90caf9; }
.link:hover { text-decoration: underline; }

.warning-text { color: #E6A23C; font-weight: bold; }
.success-text { color: #67C23A; font-weight: bold; }
.danger-text { color: #F56C6C; font-weight: bold; }

/* 页脚 */
.footer {
    position: fixed; bottom: 20px; left: 20px; right: 20px;
    margin-bottom: 0; padding: 10px;
}
.footer-content { /* ... 保持不变 ... */ }
</style>
