<template>
    <div class="home-container" :class="{ 'dark-mode': isDarkMode }">
        <div class="header">
            <h2 class="neon-title" data-text="域名管理系统(Domains-Support)">域名管理系统(Domains-Support)</h2>
            <div class="header-buttons">
                <el-button type="primary" size="small" :icon="Refresh" :loading="refreshing"
                    @click="handleRefresh">刷新</el-button>
                <el-dropdown trigger="click">
                    <el-button type="primary" size="small">
                        系统
                        <el-icon class="el-icon--right"><arrow-down /></el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="handleAdd">
                                <el-icon><Plus /></el-icon>新增
                            </el-dropdown-item>
                            <el-dropdown-item @click="handleConfig">
                                <el-icon><Setting /></el-icon>配置
                            </el-dropdown-item>
                            <el-dropdown-item @click="handleImport">
                                <el-icon><Upload /></el-icon>导入
                            </el-dropdown-item>
                            <el-dropdown-item @click="handleExport">
                                <el-icon><Download /></el-icon>导出
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-tooltip content="登出系统" placement="bottom">
                    <el-button type="primary" size="small" :icon="SwitchButton" @click="handleLogout">登出</el-button>
                </el-tooltip>

                <!-- 
                  关键部分: 主题切换下拉菜单。
                  如果这个部分不显示，请务必检查依赖安装和浏览器控制台错误。
                -->
                <el-dropdown trigger="click" @command="handleThemeChange">
                    <el-tooltip :content="`当前主题: ${themeLabels[theme]}`" placement="bottom">
                        <el-button type="primary" size="small" :icon="currentThemeIcon" />
                    </el-tooltip>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="light" :icon="Sunny">亮色模式</el-dropdown-item>
                            <el-dropdown-item command="dark" :icon="Moon">暗黑模式</el-dropdown-item>
                            <el-dropdown-item command="auto" :icon="Monitor">跟随系统</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

            </div>
        </div>

        <!-- ... 表格和页脚代码保持不变 ... -->
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
                        <a href="https://www.youtube.com/" target="_blank" class="social-link"
                            title="访问 YouTube 频道">
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// 关键部分: 确保 Monitor 图标已从 @element-plus/icons-vue 导入
import { Setting, Refresh, Plus, Edit, Delete, SwitchButton, Sunny, Moon, ArrowDown, Upload, Download, Monitor } from '@element-plus/icons-vue'
import { useAuth } from '../utils/auth'
import DomainDialog from '../components/DomainDialog.vue'
import AlertConfigDialog from '../components/AlertConfigDialog.vue'
import ImportDialog from '../components/ImportDialog.vue'
import { createDomain, updateDomain, deleteDomain, type DomainData } from '../api/domains'

type Domain = DomainData
type Theme = 'light' | 'dark' | 'auto'

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

interface ApiErrorResponse {
    message?: string
}

const router = useRouter()
const auth = useAuth()
const domains = ref<Domain[]>([])
const alertDays = ref(30)
const alertConfig = ref<AlertConfig>()
const refreshing = ref(false)
const dialogVisible = ref(false)
const configVisible = ref(false)
const isEdit = ref(false)
const editData = ref<Domain>()
const importVisible = ref(false)

const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'auto')
const isDarkMode = ref(false)
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

const themeLabels: Record<Theme, string> = {
    light: '亮色',
    dark: '暗黑',
    auto: '跟随系统'
}

const currentThemeIcon = computed(() => {
    if (theme.value === 'light') return Sunny;
    if (theme.value === 'dark') return Moon;
    return Monitor;
});

const applyTheme = () => {
    isDarkMode.value = theme.value === 'auto' ? prefersDark.matches : theme.value === 'dark'
    document.documentElement.classList.toggle('dark', isDarkMode.value)
}

const handleThemeChange = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
}

const onPrefersColorSchemeChange = () => {
    if (theme.value === 'auto') {
        applyTheme()
    }
}

// ... 省略其他不变的函数 ...
const checkLoginStatus = () => { if (!auth.getAuthToken()) { router.push({ name: 'Login' }) } }
const handleLogout = () => { auth.clearAuth(); router.push({ name: 'Login' }) }
const handleAdd = () => { isEdit.value = false; editData.value = undefined; dialogVisible.value = true; }
const handleEdit = (row: Domain) => { isEdit.value = true; editData.value = row; dialogVisible.value = true; }
const handleDelete = async (row: Domain) => { try { await ElMessageBox.confirm('确定要删除该域名吗？', '提示', { type: 'warning' }); if (row.id) { await deleteDomain(row.id); ElMessage.success('删除成功'); await loadDomains(); } } catch (error) { if (error !== 'cancel') { ElMessage.error('删除失败'); } } }
const handleDialogSubmit = async (formData: Omit<Domain, 'id' | 'created_at'>) => { try { if (isEdit.value && editData.value?.id) { await updateDomain(editData.value.id, formData); ElMessage.success('修改成功'); } else { await createDomain(formData); ElMessage.success('添加成功'); } dialogVisible.value = false; await loadDomains(); } catch (error: any) { const message = error?.response?.data?.message || (isEdit.value ? '修改失败' : '添加失败'); ElMessage.error(message); } }
const loadDomains = async () => { try { const authData = auth.getAuthToken(); if (!authData) throw new Error('未登录或登录已过期'); const response = await fetch('/api/domains', { headers: { 'Authorization': `Bearer ${authData.token}` } }); if (!response.ok) throw new Error('请求域名列表失败'); const result: ApiResponse<Domain[]> = await response.json(); if (result.status !== 200) throw new Error(result.message || '获取数据失败'); domains.value = result.data || []; } catch (error) { if (error instanceof Error) { ElMessage.error(error.message || '加载域名列表失败'); if (error.message.includes('未登录') || error.message.includes('过期')) { auth.clearAuth(); router.push({ name: 'Login' }); } } else { ElMessage.error('加载域名列表时发生未知错误'); } } }
const calculateRemainingDays = (expiryDate: string) => { const today = new Date(); today.setHours(0, 0, 0, 0); const expiry = new Date(expiryDate); expiry.setHours(0, 0, 0, 0); const diffTime = expiry.getTime() - today.getTime(); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); return diffDays < 0 ? 0 : diffDays; }
const handleConfig = () => { configVisible.value = true; }
const handleConfigSubmit = async (config: AlertConfig) => { try { const authData = auth.getAuthToken(); if (!authData) throw new Error('未授权'); const response = await fetch('/api/alertconfig', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.token}` }, body: JSON.stringify(config) }); const result: ApiResponse<AlertConfig> = await response.json(); if (result.status === 200) { ElMessage.success('配置保存成功'); alertDays.value = config.days; alertConfig.value = config; configVisible.value = false; } else { throw new Error(result.message || '保存失败'); } } catch (error) { if (error instanceof Error) { ElMessage.error(error.message || '保存配置失败'); } else { ElMessage.error('保存配置时发生未知错误'); } } }
const updateDomainStatus = async (domain: string, status: string): Promise<Domain> => { const authData = auth.getAuthToken(); if (!authData) throw new Error('未授权'); const response = await fetch('/api/domains/status', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.token}` }, body: JSON.stringify({ domain, status }) }); const result: ApiResponse<Domain> = await response.json(); if (result.status === 200) return result.data; throw new Error(result.message || '更新状态失败'); }
const checkDomainStatus = async (domain: string): Promise<string> => { try { const authData = auth.getAuthToken(); if (!authData) throw new Error('未授权'); const response = await fetch('/api/domains/check', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.token}` }, body: JSON.stringify({ domain }) }); const result: ApiResponse<{ status: string }> = await response.json(); return result.status === 200 ? result.data.status : '离线'; } catch (error) { console.error(`检查域名 ${domain} 状态失败:`, error); return '离线' } }
const handleRefresh = async () => { if (refreshing.value) return; try { refreshing.value = true; ElMessage.info('正在检查域名状态...'); const results = await Promise.allSettled(domains.value.map(async (domain) => { const status = await checkDomainStatus(domain.domain); if (status !== domain.status) { await updateDomainStatus(domain.domain, status); } })); const failedCount = results.filter(r => r.status === 'rejected').length; if (failedCount > 0) { ElMessage.warning(`${failedCount} 个域名状态检查失败，请稍后重试。`); } else { ElMessage.success('状态刷新完成'); } await loadDomains(); } catch (error) { if (error instanceof Error) { ElMessage.error(error.message || '刷新状态失败'); } else { ElMessage.error('刷新状态时发生未知错误'); } } finally { refreshing.value = false; } }
const loadAlertConfig = async () => { try { const authData = auth.getAuthToken(); if (!authData) return; const response = await fetch('/api/alertconfig', { headers: { 'Authorization': `Bearer ${authData.token}` } }); const result: ApiResponse<AlertConfig> = await response.json(); if (result.status === 200 && result.data) { alertConfig.value = result.data; alertDays.value = result.data.days; } } catch (error) { console.error('获取告警配置失败:', error); } }
const handleImport = () => { importVisible.value = true; }
const handleExport = async () => { try { const authData = auth.getAuthToken(); if (!authData) throw new Error('未授权'); const loading = ElMessage.info({ message: '正在准备导出数据...', duration: 0 }); const response = await fetch('/api/domains/export', { headers: { 'Authorization': `Bearer ${authData.token}` } }); loading.close(); if (!response.ok) { const errorData = await response.json() as ApiErrorResponse; throw new Error(errorData.message || '导出失败'); } const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `domains-export-${new Date().toISOString().split('T')[0]}.json`; const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a); ElMessage.success('导出成功'); } catch (error) { if (error instanceof Error) { ElMessage.error(error.message || '导出失败'); } else { ElMessage.error('导出时发生未知错误'); } } }

onMounted(() => {
    checkLoginStatus()
    loadDomains()
    loadAlertConfig()
    
    applyTheme()
    prefersDark.addEventListener('change', onPrefersColorSchemeChange)
})

onUnmounted(() => {
    prefersDark.removeEventListener('change', onPrefersColorSchemeChange)
})
</script>

<style>
/* 全局样式 */
.neon-title {
    font-family: 'ZCOOL KuaiLe', cursive;
    font-weight: normal;
    font-size: 2.2rem;
    position: relative;
    background: linear-gradient(90deg, #ff0000, #ff9900, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
    background-size: 400% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: gradientFlow 5s linear infinite;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}
@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
#live2d-widget {
    z-index: 1 !important;
    pointer-events: none !important;
}
.dark {
    --el-bg-color: transparent;
    --el-bg-color-overlay: transparent;
}
</style>

<style scoped>
/* Scoped样式 */
.home-container {
    min-height: 100vh;
    box-sizing: border-box;
    padding: 20px 20px 80px 20px;
    background-image: url('https://wp.upx8.com/api.php?content=%E5%8A%A8%E6%BC%AB');
    background-size: cover;
    background-position: center center;
    background-attachment: fixed;
    transition: background-image 0.5s ease-in-out;
}
.home-container.dark-mode {
    background-image: url('https://api.btstu.cn/sjbz/api.php?lx=dongman');
}
.header, .custom-table, .footer {
    position: relative;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    margin-bottom: 20px;
}
.dark-mode .header, .dark-mode .custom-table, .dark-mode .footer {
    background-color: rgba(0, 0, 0, 0.45);
}
.header {
    display: flex; flex-wrap: wrap; gap: 15px;
    align-items: center; justify-content: space-between; padding: 5px 20px;
}
.header h2 { margin: 0; }
.header-buttons { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
:deep(.el-table),
:deep(.el-table__expanded-cell) {
    background-color: transparent !important;
}
:deep(.el-table th),
:deep(.el-table tr),
:deep(.el-table td) {
    background-color: transparent !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
}
:deep(.el-table) {
    color: #333;
    text-shadow: 0 0 2px #fff;
}
.dark-mode :deep(.el-table) {
    color: #fff !important;
    text-shadow: 0 0 4px #000, 0 0 4px #000;
}
:deep(.el-table__row:hover td) {
    background-color: rgba(255, 255, 255, 0.15) !important;
}
.dark-mode :deep(.el-table__row:hover td) {
    background-color: rgba(0, 0, 0, 0.2) !important;
}
.link { color: #0277bd; text-decoration: none; font-weight: bold; }
.link:hover { color: #01579b; }
.dark-mode .link { color: #90caf9; }
.dark-mode .link:hover { color: #e3f2fd; }
.warning-text { color: #f57f17; font-weight: bold; }
.dark-mode .warning-text { color: #ffd54f; }
.success-text { color: #2e7d32; font-weight: bold; }
.dark-mode .success-text { color: #a5d6a7; }
.danger-text { color: #b71c1c; font-weight: bold; }
.dark-mode .danger-text { color: #ef9a9a; }
.footer {
    position: fixed; 
    bottom: 0; 
    left: 0; 
    right: 0;
    padding: 10px;
    margin: 0;
    border-radius: 0;
    color: #333;
    text-shadow: 0 0 2px #fff;
}
.dark-mode .footer {
    color: #eee;
    text-shadow: 0 0 3px #000;
}
.footer-content { max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; text-align: center; }
.copyright { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; font-size: 14px; }
.separator { opacity: 0.6; margin: 0 2px; }
.social-links { display: flex; gap: 15px; align-items: center; }
.social-link { color: inherit; transition: all 0.3s ease; }
.social-link:hover { color: #0277bd; transform: translateY(-2px); }
.dark-mode .social-link:hover { color: #90caf9; }
.social-icon { width: 20px; height: 20px; }
</style>
