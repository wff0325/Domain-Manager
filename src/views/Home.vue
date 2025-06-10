<template>
    <div class="home-container" :class="{ 'dark-mode': isDarkMode }">
        <div class="header">
            <h2>域名管理系统(Domains-Support)</h2>
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
                                <el-icon>
                                    <Plus />
                                </el-icon>新增
                            </el-dropdown-item>
                            <el-dropdown-item @click="handleConfig">
                                <el-icon>
                                    <Setting />
                                </el-icon>配置
                            </el-dropdown-item>
                            <el-dropdown-item @click="handleImport">
                                <el-icon>
                                    <Upload />
                                </el-icon>导入
                            </el-dropdown-item>
                            <el-dropdown-item @click="handleExport">
                                <el-icon>
                                    <Download />
                                </el-icon>导出
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-tooltip content="登出系统" placement="bottom">
                    <el-button type="primary" size="small" :icon="SwitchButton" @click="handleLogout">登出</el-button>
                </el-tooltip>
                <el-switch v-model="isDarkMode" :active-icon="Moon" :inactive-icon="Sunny" @change="toggleDarkMode"
                    inline-prompt class="theme-switch" />
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
                    <span>作者：饭奇骏</span>
                    <span class="separator">|</span>
                    <div class="social-links">
                        <a href="https://github.com/frankiejun/Domains-Support/tree/main" target="_blank"
                            class="social-link" title="访问 GitHub 仓库">
                            <el-icon class="social-icon"><svg viewBox="0 0 1024 1024" width="20" height="20">
                                    <path fill="currentColor"
                                        d="M512 0C229.12 0 0 229.12 0 512c0 226.56 146.56 417.92 350.08 485.76 25.6 4.48 35.2-10.88 35.2-24.32 0-12.16-0.64-52.48-0.64-95.36-128.64 23.68-161.92-31.36-172.16-60.16-5.76-14.72-30.72-60.16-52.48-72.32-17.92-9.6-43.52-33.28-0.64-33.92 40.32-0.64 69.12 37.12 78.72 52.48 46.08 77.44 119.68 55.68 149.12 42.24 4.48-33.28 17.92-55.68 32.64-68.48-113.92-12.8-232.96-56.96-232.96-252.8 0-55.68 19.84-101.76 52.48-137.6-5.12-12.8-23.04-65.28 5.12-135.68 0 0 42.88-13.44 140.8 52.48 40.96-11.52 84.48-17.28 128-17.28 43.52 0 87.04 5.76 128 17.28 97.92-66.56 140.8-52.48 140.8-52.48 28.16 70.4 10.24 122.88 5.12 135.68 32.64 35.84 52.48 81.28 52.48 137.6 0 196.48-119.68 240-233.6 252.8 18.56 16 34.56 46.72 34.56 94.72 0 68.48-0.64 123.52-0.64 140.8 0 13.44 9.6 29.44 35.2 24.32C877.44 929.92 1024 737.92 1024 512 1024 229.12 794.88 0 512 0z" />
                                </svg></el-icon>
                        </a>
                        <a href="https://www.youtube.com/@frankiejun8965" target="_blank" class="social-link"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, Refresh, Plus, Edit, Delete, SwitchButton, Sunny, Moon, ArrowDown, Upload, Download } from '@element-plus/icons-vue'
import { useAuth } from '../utils/auth'
import DomainDialog from '../components/DomainDialog.vue'
import AlertConfigDialog from '../components/AlertConfigDialog.vue'
import ImportDialog from '../components/ImportDialog.vue'
import { createDomain, updateDomain, deleteDomain, type DomainData } from '../api/domains'

type Domain = DomainData

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

const router = useRouter()
const auth = useAuth()
const domains = ref<Domain[]>([])
const alertDays = ref(30)
const alertConfig = ref<AlertConfig>()
const refreshing = ref(false)

// 对话框相关的状态
const dialogVisible = ref(false)
const configVisible = ref(false)
const isEdit = ref(false)
const editData = ref<Domain>()
const importVisible = ref(false)

// 暗黑模式状态
const isDarkMode = ref(localStorage.getItem('darkMode') === 'true')

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
        console.log('提交的表单数据:', formData)
        if (isEdit.value && editData.value?.id) {
            const response = await updateDomain(editData.value.id, formData)
            console.log('更新响应:', response)
            ElMessage.success('修改成功')
        } else {
            const response = await createDomain(formData)
            console.log('创建响应:', response)
            ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        await loadDomains()
    } catch (error: any) {
        console.error('保存失败:', error)
        console.error('错误响应:', error.response?.data)
        ElMessage.error(error.response?.data?.message || (isEdit.value ? '修改失败' : '添加失败'))
    }
}

const loadDomains = async () => {
    try {
        console.log('开始加载域名列表')
        const authData = auth.getAuthToken()
        if (!authData) {
            throw new Error('未登录或登录已过期')
        }

        const response = await fetch('/api/domains', {
            headers: {
                'Authorization': `Bearer ${authData.token}`,
                'Content-Type': 'application/json'
            }
        })
        console.log('域名列表原始响应:', response)

        if (!response.ok) {
            const errorData = await response.json() as ApiResponse<null>
            throw new Error(errorData.message || '请求失败')
        }

        const result = await response.json() as ApiResponse<Domain[]>
        console.log('解析后的响应:', result)

        if (result.status !== 200) {
            throw new Error(result.message || '请求失败')
        }

        domains.value = result.data || []
        console.log('设置域名列表成功:', domains.value)
    } catch (error: any) {
        console.error('加载域名列表失败:', error)
        console.error('错误详情:', {
            message: error.message,
            stack: error.stack
        })
        ElMessage.error(error.message || '加载域名列表失败')
        if (error.message === '未授权访问' || error.message === '无效的访问令牌') {
            auth.clearAuth()
            router.push({ name: 'Login' })
        }
    }
}

const calculateRemainingDays = (expiryDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    expiry.setHours(0, 0, 0, 0)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) {
        return 0
    }
    return diffDays
}

const handleConfig = () => {
    configVisible.value = true
}

const handleConfigSubmit = async (config: AlertConfig) => {
    try {
        const authData = auth.getAuthToken()
        if (!authData) {
            throw new Error('未登录或登录已过期')
        }

        const response = await fetch('/api/alertconfig', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.token}`
            },
            body: JSON.stringify(config)
        })

        const result = await response.json() as ApiResponse<AlertConfig>

        if (result.status === 200) {
            ElMessage.success('配置保存成功')
            alertDays.value = config.days
            alertConfig.value = config
        } else {
            throw new Error(result.message || '保存失败')
        }
    } catch (error: unknown) {
        console.error('保存配置失败:', error)
        if (error instanceof Error) {
            ElMessage.error(error.message)
            if (error.message === '未授权访问' || error.message === '无效的访问令牌') {
                auth.clearAuth()
                router.push({ name: 'Login' })
            }
        } else {
            ElMessage.error('保存配置失败')
        }
    }
}

const updateDomainStatus = async (domain: string, status: string): Promise<Domain> => {
    try {
        const authData = auth.getAuthToken()
        if (!authData) {
            throw new Error('未登录或登录已过期')
        }

        const response = await fetch('/api/domains/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.token}`
            },
            body: JSON.stringify({ domain, status })
        })

        const result = await response.json() as ApiResponse<Domain>

        if (result.status === 200) {
            //ElMessage.success('状态更新成功')
            return result.data
        } else {
            throw new Error(result.message || '更新失败')
        }
    } catch (error: unknown) {
        console.error('更新状态失败:', error)
        if (error instanceof Error) {
            ElMessage.error(error.message)
            if (error.message === '未授权访问' || error.message === '无效的访问令牌') {
                auth.clearAuth()
                router.push({ name: 'Login' })
            }
        } else {
            ElMessage.error('更新状态失败')
        }
        throw error
    }
}

const checkDomainStatus = async (domain: string): Promise<string> => {
    try {
        const authData = auth.getAuthToken()
        if (!authData) {
            throw new Error('未登录或登录已过期')
        }

        const response = await fetch('/api/domains/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.token}`
            },
            body: JSON.stringify({ domain })
        })

        const result = await response.json() as ApiResponse<{ status: string }>

        if (result.status === 200) {
            return result.data.status
        } else {
            throw new Error(result.message || '检查失败')
        }
    } catch (error) {
        console.error(`检查域名 ${domain} 状态失败:`, error)
        return '离线'
    }
}

const handleRefresh = async () => {
    if (refreshing.value) return

    try {
        refreshing.value = true
        ElMessage.info('正在检查域名状态...')

        // 并行检查所有域名状态
        const statusChecks = domains.value.map(async (domain) => {
            const status = await checkDomainStatus(domain.domain)
            const updatedDomain = await updateDomainStatus(domain.domain, status)
            return updatedDomain
        })

        // 等待所有检查完成
        const updatedDomains = await Promise.all(statusChecks)
        domains.value = updatedDomains
        ElMessage.success('状态刷新完成')
    } catch (error: unknown) {
        console.error('刷新状态失败:', error)
        ElMessage.error(error instanceof Error ? error.message : '刷新状态失败')
    } finally {
        refreshing.value = false
    }
}

// 在组件加载时获取告警配置
const loadAlertConfig = async () => {
    try {
        const authData = auth.getAuthToken()
        if (!authData) {
            throw new Error('未登录或登录已过期')
        }

        const response = await fetch('/api/alertconfig', {
            headers: {
                'Authorization': `Bearer ${authData.token}`,
                'Content-Type': 'application/json'
            }
        })
        const result = await response.json() as ApiResponse<AlertConfig>

        if (result.status === 200 && result.data) {
            alertConfig.value = result.data
            alertDays.value = result.data.days
        } else {
            throw new Error(result.message || '获取配置失败')
        }
    } catch (error: unknown) {
        console.error('获取告警配置失败:', error)
        if (error instanceof Error) {
            if (error.message === '未授权访问' || error.message === '无效的访问令牌') {
                auth.clearAuth()
                router.push({ name: 'Login' })
            }
        }
    }
}

const handleImport = () => {
    importVisible.value = true
}

const handleExport = async () => {
    try {
        const authData = auth.getAuthToken()
        if (!authData) {
            throw new Error('未登录或登录已过期')
        }

        // 显示加载提示
        const loading = ElMessage.info({
            message: '正在准备导出数据...',
            duration: 0
        })

        // 直接使用浏览器下载功能
        const response = await fetch('/api/domains/export', {
            headers: {
                'Authorization': `Bearer ${authData.token}`
            }
        })

        // 关闭加载提示
        loading.close()

        if (!response.ok) {
            const errorData = await response.json() as ApiResponse<null>
            throw new Error(errorData.message || '导出失败')
        }

        // 获取文件名
        const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `domains-export-${new Date().toISOString().split('T')[0]}.json`

        // 创建 Blob 并下载
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        ElMessage.success('导出成功')
    } catch (error) {
        console.error('导出失败:', error)
        ElMessage.error(error instanceof Error ? error.message : '导出失败')
    }
}

// 切换暗黑模式
const toggleDarkMode = () => {
    localStorage.setItem('darkMode', isDarkMode.value.toString())
    document.documentElement.classList.toggle('dark', isDarkMode.value)
}

// 初始化暗黑模式
onMounted(() => {
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
    }
    checkLoginStatus()
    loadDomains()
    loadAlertConfig()
})
</script>

<style scoped>
.home-container {
    min-height: 100vh;
    padding: 20px;
    padding-bottom: 80px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
    transition: background 0.3s ease;
}

.home-container.dark-mode {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: #ffffff;
}

.header {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.dark-mode .header {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    color: #ffffff;
}

.header h2 {
    margin: 0;
    color: #1976D2;
    font-size: 24px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.dark-mode .header h2 {
    color: #64B5F6;
}

.header-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
}

.theme-switch {
    margin-left: 4px;
}

.custom-table {
    margin-bottom: 60px;
    overflow-x: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.dark-mode .custom-table {
    background: #2d2d2d;
    color: #ffffff;
}

:deep(.el-table) {
    width: 100% !important;
    white-space: nowrap;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.dark-mode :deep(.el-table) {
    --el-table-border-color: #404040;
    --el-table-header-bg-color: #2d2d2d;
    --el-table-row-hover-bg-color: #404040;
    --el-table-current-row-bg-color: #404040;
    --el-table-header-text-color: #ffffff;
    --el-table-text-color: #ffffff;
    --el-table-bg-color: #2d2d2d;
}

.link {
    color: #409EFF;
    text-decoration: none;
    transition: color 0.3s;
}

.link:hover {
    color: #66b1ff;
    text-decoration: underline;
}

.warning-text {
    color: #E6A23C;
    font-weight: bold;
}

.success-text {
    color: #67C23A;
    font-weight: bold;
}

.danger-text {
    color: #F56C6C;
    font-weight: bold;
}

:deep(.el-table th) {
    background-color: #f5f7fa !important;
}

.dark-mode :deep(.el-table th) {
    background-color: #2d2d2d !important;
    color: #ffffff !important;
    font-weight: bold;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background-color: #fafafa;
}

.dark-mode :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background-color: #333333;
}

.el-button {
    border-radius: 4px;
}

/* 添加图标的过渡效果 */
.el-icon {
    margin-right: 4px;
    transition: transform 0.3s;
}

.el-button:hover .el-icon {
    transform: rotate(180deg);
}

.header-buttons .el-button {
    min-width: 88px;
    transition: all 0.3s;
}

.header-buttons .el-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-buttons .el-button [class*="el-icon"] {
    margin-right: 4px;
    transition: transform 0.3s;
}

.header-buttons .el-button:not(.is-loading):hover [class*="el-icon"] {
    transform: rotate(180deg);
}

/* 表格中的按钮样式 */
.el-table .el-button {
    transition: all 0.3s;
}

.el-table .el-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.el-table .el-button [class*="el-icon"] {
    margin-right: 4px;
}

/* 加载状态的特殊样式 */
.el-button.is-loading {
    opacity: 0.8;
    cursor: not-allowed;
}

.el-button.is-loading [class*="el-icon"] {
    animation: none;
}

.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: white;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.dark-mode .footer {
    background: #2d2d2d;
    color: #ffffff;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    text-align: center;
}

.copyright {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
}

.separator {
    color: #dcdfe6;
    margin: 0 2px;
}

.social-links {
    display: flex;
    gap: 15px;
    align-items: center;
}

.social-link {
    color: #606266;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    padding: 2px;
}

.social-link:hover {
    color: #409EFF;
    transform: translateY(-2px);
}

.social-icon {
    width: 20px;
    height: 20px;
}

@media (max-width: 768px) {
    .home-container {
        padding: 15px;
        padding-bottom: 70px;
    }

    .header {
        padding: 12px;
        margin-bottom: 12px;
    }

    .header h2 {
        font-size: 1.2rem;
    }

    .custom-table {
        margin-bottom: 15px;
    }

    .footer {
        padding: 10px;
        height: auto;
        min-height: 50px;
    }

    .footer-content {
        flex-direction: column;
        gap: 8px;
        text-align: center;
    }

    .copyright {
        font-size: 0.8rem;
        gap: 6px;
    }

    .social-links {
        gap: 10px;
    }

    .social-icon {
        width: 16px;
        height: 16px;
    }

    :deep(.el-table) {
        font-size: 0.9rem;
    }

    :deep(.el-table th),
    :deep(.el-table td) {
        padding: 8px 4px;
    }

    :deep(.el-button) {
        padding: 6px 12px;
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .home-container {
        padding: 10px;
        padding-bottom: 60px;
    }

    .header {
        padding: 10px;
    }

    .header-buttons {
        gap: 5px;
    }

    .footer {
        padding: 8px;
        min-height: 45px;
    }

    .copyright {
        font-size: 0.75rem;
    }
}
</style>

<style>
/* 全局暗黑模式样式 */
.dark {
    --el-bg-color: #1a1a1a;
    --el-bg-color-overlay: #2d2d2d;
    --el-text-color-primary: #ffffff;
    --el-text-color-regular: #e0e0e0;
    --el-border-color: #404040;
    --el-border-color-light: #404040;
    --el-border-color-lighter: #404040;
    --el-border-color-extra-light: #404040;
    --el-fill-color-blank: #2d2d2d;
    --el-mask-color: rgba(0, 0, 0, 0.8);
}

.dark .el-dialog {
    --el-dialog-bg-color: #2d2d2d;
    --el-dialog-title-font-color: #ffffff;
}

.dark .el-card {
    --el-card-bg-color: #2d2d2d;
}

/* 移除按钮的暗黑模式样式 */
.dark .el-button {
    --el-button-bg-color: var(--el-color-primary);
    --el-button-border-color: var(--el-color-primary);
    --el-button-hover-bg-color: var(--el-color-primary-light-3);
    --el-button-hover-border-color: var(--el-color-primary-light-3);
}

.dark .el-button--danger {
    --el-button-bg-color: var(--el-color-danger);
    --el-button-border-color: var(--el-color-danger);
    --el-button-hover-bg-color: var(--el-color-danger-light-3);
    --el-button-hover-border-color: var(--el-color-danger-light-3);
}

.dark .el-input {
    --el-input-bg-color: #2d2d2d;
    --el-input-text-color: #ffffff;
    --el-input-border-color: #404040;
}

.dark .el-select {
    --el-select-border-color-hover: #505050;
    --el-select-input-focus-border-color: #505050;
}

.el-button.el-button--small {
    padding: 6px 12px;
    /* 默认是 8px 15px */
    font-size: 12px;
    /* 默认是 13px */
}
</style>