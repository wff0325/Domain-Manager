<template>
    <div class="home-container" :class="[isDarkMode ? 'dark-mode' : '', panelStyleClass]">
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
                <!-- New Settings Button -->
                <el-tooltip content="系统设置" placement="bottom">
                     <el-button type="primary" size="small" :icon="Setting" @click="settingsDrawerVisible = true">设置</el-button>
                </el-tooltip>
                <el-tooltip content="登出系统" placement="bottom">
                    <el-button type="primary" size="small" :icon="SwitchButton" @click="handleLogout">登出</el-button>
                </el-tooltip>
            </div>
        </div>
        
        <!-- Main Content Table -->
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
            <el-table-column prop="registrar_date" label="注册时间" align="center" sortable class-name="yellow-text-cell" />
            <el-table-column prop="expiry_date" label="过期时间" align="center" sortable class-name="yellow-text-cell" />
            <el-table-column label="剩余时间" align="center" sortable
                :sort-method="(a, b) => calculateRemainingDays(a.expiry_date) - calculateRemainingDays(b.expiry_date)">
                <template #default="scope">
                    <span :class="['yellow-text-cell', { 'warning-text': calculateRemainingDays(scope.row.expiry_date) <= alertDays }]">
                        {{ calculateRemainingDays(scope.row.expiry_date) }}天
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="service_type" label="服务类型" align="center" sortable class-name="yellow-text-cell" />
            <el-table-column prop="status" label="状态" align="center" sortable>
                <template #default="scope">
                    <span :class="scope.row.status === '在线' ? 'success-text' : 'danger-text'">
                        {{ scope.row.status }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="memo" label="备注" align="center" sortable class-name="yellow-text-cell" />
            <el-table-column label="操作" width="200" align="center">
                <template #default="scope">
                    <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(scope.row)">修改</el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- Dialogs -->
        <DomainDialog v-model:visible="dialogVisible" :is-edit="isEdit" :edit-data="editData" @submit="handleDialogSubmit" />
        <AlertConfigDialog v-model:visible="configVisible" :config="alertConfig" @submit="handleConfigSubmit" />
        <ImportDialog v-model:visible="importVisible" @success="loadDomains" />

        <!-- New Settings Drawer -->
        <el-drawer v-model="settingsDrawerVisible" title="系统设置" direction="rtl" size="300px">
            <div class="settings-container">
                <el-divider>主题模式</el-divider>
                <el-radio-group v-model="theme" class="settings-group">
                    <el-radio-button label="light">浅色</el-radio-button>
                    <el-radio-button label="dark">深色</el-radio-button>
                    <el-radio-button label="system">跟随系统</el-radio-button>
                </el-radio-group>

                <el-divider>主题颜色</el-divider>
                <div class="color-picker">
                    <div
                        v-for="color in accentColors"
                        :key="color"
                        class="color-swatch"
                        :style="{ backgroundColor: color }"
                        :class="{ active: accentColor === color }"
                        @click="setAccentColor(color)"
                    ></div>
                </div>

                <el-divider>面板样式</el-divider>
                 <el-radio-group v-model="panelStyle" class="settings-group">
                    <el-radio-button label="misty">Misty</el-radio-button>
                    <el-radio-button label="solid">Solid</el-radio-button>
                </el-radio-group>
            </div>
        </el-drawer>

        <footer class="footer">
            <!-- Footer content remains the same -->
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElDrawer, ElRadioGroup, ElRadioButton, ElDivider } from 'element-plus';
import { Setting, Refresh, Plus, Edit, Delete, SwitchButton, ArrowDown, Upload, Download } from '@element-plus/icons-vue';
// ... other imports remain the same
import { useAuth } from '../utils/auth';
import DomainDialog from '../components/DomainDialog.vue';
import AlertConfigDialog from '../components/AlertConfigDialog.vue';
import ImportDialog from '../components/ImportDialog.vue';
import { createDomain, updateDomain, deleteDomain, type DomainData } from '../api/domains';


// --- App Settings Logic (Nezha-style) ---
const settingsDrawerVisible = ref(false);
const theme = ref(localStorage.getItem('theme') || 'system');
const accentColor = ref(localStorage.getItem('accentColor') || '#409EFF');
const panelStyle = ref(localStorage.getItem('panelStyle') || 'misty');
const isDarkMode = ref(false);

const accentColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'];

// Watch for changes in settings and save to localStorage
watch(theme, (newTheme) => localStorage.setItem('theme', newTheme));
watch(accentColor, (newColor) => localStorage.setItem('accentColor', newColor));
watch(panelStyle, (newStyle) => localStorage.setItem('panelStyle', newStyle));

// Apply theme and accent color to the document
const applySettings = () => {
    // Apply theme
    if (theme.value === 'system') {
        isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        isDarkMode.value = theme.value === 'dark';
    }
    document.documentElement.classList.toggle('dark', isDarkMode.value);

    // Apply accent color
    document.documentElement.style.setProperty('--el-color-primary', accentColor.value);
};

const setAccentColor = (color: string) => {
    accentColor.value = color;
};

// Computed class for panel style
const panelStyleClass = computed(() => {
    return `panel-style-${panelStyle.value}`;
});

onMounted(() => {
    applySettings();
    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (theme.value === 'system') {
            applySettings();
        }
    });
});

watch([theme, accentColor], applySettings);

// --- Existing component logic ---
const router = useRouter();
const auth = useAuth();
const domains = ref<DomainData[]>([]);
const alertDays = ref(30);
const alertConfig = ref();
const refreshing = ref(false);
const dialogVisible = ref(false);
const configVisible = ref(false);
const isEdit = ref(false);
const editData = ref<DomainData>();
const importVisible = ref(false);

// ... All your other existing functions (handleLogout, loadDomains, etc.) remain unchanged.
// Just copy and paste them here.
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

const handleEdit = (row: DomainData) => {
    isEdit.value = true
    editData.value = row
    dialogVisible.value = true
}

const handleDelete = async (row: DomainData) => {
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

const handleDialogSubmit = async (formData: Omit<DomainData, 'id' | 'created_at'>) => {
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
        if (!authData) {
            throw new Error('未登录或登录已过期')
        }

        const response = await fetch('/api/domains', {
            headers: {
                'Authorization': `Bearer ${authData.token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || '请求失败')
        }

        const result = await response.json()

        if (result.status !== 200) {
            throw new Error(result.message || '请求失败')
        }

        domains.value = result.data || []
    } catch (error: any) {
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

const handleConfigSubmit = async (config: any) => {
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

        const result = await response.json()

        if (result.status === 200) {
            ElMessage.success('配置保存成功')
            alertDays.value = config.days
            alertConfig.value = config
        } else {
            throw new Error(result.message || '保存失败')
        }
    } catch (error: unknown) {
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

const updateDomainStatus = async (domain: string, status: string): Promise<DomainData> => {
    const authData = auth.getAuthToken()
    if (!authData) throw new Error('未登录或登录已过期')

    const response = await fetch('/api/domains/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify({ domain, status })
    })

    const result = await response.json()
    if (result.status === 200) {
        return result.data
    }
    throw new Error(result.message || '更新失败')
}

const checkDomainStatus = async (domain: string): Promise<string> => {
    try {
        const authData = auth.getAuthToken()
        if (!authData) throw new Error('未登录或登录已过期')

        const response = await fetch('/api/domains/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.token}`
            },
            body: JSON.stringify({ domain })
        })

        const result = await response.json()
        return result.status === 200 ? result.data.status : '离线'
    } catch (error) {
        console.error(`检查域名 ${domain} 状态失败:`, error)
        return '离线'
    }
}

const handleRefresh = async () => {
    if (refreshing.value) return
    refreshing.value = true
    try {
        ElMessage.info('正在检查域名状态...')
        const updatedDomains = await Promise.all(
            domains.value.map(async (domain) => {
                const status = await checkDomainStatus(domain.domain)
                return await updateDomainStatus(domain.domain, status)
            })
        )
        domains.value = updatedDomains
        ElMessage.success('状态刷新完成')
    } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '刷新状态失败')
    } finally {
        refreshing.value = false
    }
}

const loadAlertConfig = async () => {
    try {
        const authData = auth.getAuthToken()
        if (!authData) return

        const response = await fetch('/api/alertconfig', {
            headers: { 'Authorization': `Bearer ${authData.token}` }
        })
        const result = await response.json()
        if (result.status === 200 && result.data) {
            alertConfig.value = result.data
            alertDays.value = result.data.days
        }
    } catch (error) {
        console.error('获取告警配置失败:', error)
    }
}

const handleImport = () => {
    importVisible.value = true
}

const handleExport = async () => {
    const loading = ElMessage.info({ message: '正在准备导出数据...', duration: 0 })
    try {
        const authData = auth.getAuthToken()
        if (!authData) throw new Error('未登录或登录已过期')

        const response = await fetch('/api/domains/export', {
            headers: { 'Authorization': `Bearer ${authData.token}` }
        })

        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            throw new Error(errorData.message || '导出失败')
        }

        const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `domains-export.json`
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)
        ElMessage.success('导出成功')
    } catch (error) {
        ElMessage.error(error instanceof Error ? error.message : '导出失败')
    } finally {
        loading.close()
    }
}


onMounted(() => {
    checkLoginStatus();
    loadDomains();
    loadAlertConfig();
});

</script>

<style>
/* ... Your existing global styles for neon-title, live2d-widget, etc. remain the same ... */
</style>

<style scoped>
/* --- Background and Layout --- */
.home-container {
    min-height: 100vh;
    box-sizing: border-box;
    padding: 20px 20px 80px 20px;
    background-size: cover;
    background-position: center center;
    background-attachment: fixed;
    transition: background-image 0.5s ease-in-out, background-color 0.3s;
}

/* Light/Dark background images */
.home-container:not(.dark-mode) {
    background-image: url('https://wp.upx8.com/api.php?content=%E5%8A%A8%E6%BC%AB');
}
.home-container.dark-mode {
    background-image: url('https://images.unsplash.com/photo-1532372576444-39321318F8a7?w=1200');
}

/* --- Panel Styles (Misty vs Solid) --- */
.header, .custom-table, .footer {
    position: relative;
    z-index: 10;
    border-radius: 12px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    margin-bottom: 20px;
    transition: background-color 0.3s, backdrop-filter 0.3s;
    border: 1px solid rgba(255, 255, 255, 0.18);
}

/* Misty Style (Default) */
.panel-style-misty .header, 
.panel-style-misty .custom-table, 
.panel-style-misty .footer {
    background-color: rgba(0, 0, 0, 0.45); 
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
.dark-mode.panel-style-misty .header,
.dark-mode.panel-style-misty .custom-table,
.dark-mode.panel-style-misty .footer {
    background-color: rgba(0, 0, 0, 0.6);
}

/* Solid Style */
.panel-style-solid .header,
.panel-style-solid .custom-table,
.panel-style-solid .footer {
    backdrop-filter: none;
    background-color: rgba(245, 247, 250, 0.85);
}
.dark-mode.panel-style-solid .header,
.dark-mode.panel-style-solid .custom-table,
.dark-mode.panel-style-solid .footer {
    background-color: rgba(40, 40, 40, 0.9);
}


/* --- Other element styles --- */
.header {
    display: flex; flex-wrap: wrap; gap: 15px;
    align-items: center; justify-content: space-between; padding: 5px 20px;
}
.header h2 { margin: 0; }
.header-buttons { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }

/* Table transparency and text colors */
:deep(.el-table),
:deep(.el-table__expanded-cell) {
    background-color: transparent !important;
}
:deep(.el-table th),
:deep(.el-table tr),
:deep(.el-table td) {
    background-color: transparent !important;
    color: #fff !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
    text-shadow: 0 0 4px #000, 0 0 4px #000;
}
.panel-style-solid :deep(.el-table th),
.panel-style-solid :deep(.el-table tr),
.panel-style-solid :deep(.el-table td) {
    color: #606266 !important;
    text-shadow: none;
}
.dark-mode.panel-style-solid :deep(.el-table th),
.dark-mode.panel-style-solid :deep(.el-table tr),
.dark-mode.panel-style-solid :deep(.el-table td) {
    color: #E5EAF3 !important;
}

:deep(.el-table__row:hover td) {
    background-color: rgba(255, 255, 255, 0.15) !important;
}
.panel-style-solid :deep(.el-table__row:hover td) {
    background-color: rgba(0, 0, 0, 0.05) !important;
}

:deep(td.yellow-text-cell .cell),
.yellow-text-cell {
    color: #FFEB3B !important;
    font-weight: bold;
}
.warning-text { 
    color: #ffd54f !important;
}
.link { color: var(--el-color-primary); text-decoration: none; font-weight: bold; }
.link:hover { opacity: 0.8; }
.success-text { color: #a5d6a7; font-weight: bold; }
.danger-text { color: #ef9a9a; font-weight: bold; }

/* Footer */
.footer {
    position: fixed; bottom: 0; left: 0; right: 0;
    padding: 10px; margin: 0; border-radius: 0;
    color: #eee; text-shadow: 0 0 3px #000;
}
.panel-style-solid .footer {
    color: #303133;
    text-shadow: none;
}
.dark-mode.panel-style-solid .footer {
    color: #E5EAF3;
}
/* ... other footer styles remain the same ... */

/* --- Settings Drawer --- */
.settings-container {
    padding: 0 10px;
}
.settings-group {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 10px;
}
.color-picker {
    display: flex;
    justify-content: space-evenly;
    padding: 10px 0;
}
.color-swatch {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: transform 0.2s, border-color 0.2s;
}
.color-swatch:hover {
    transform: scale(1.1);
}
.color-swatch.active {
    border-color: var(--el-color-primary);
    transform: scale(1.2);
}

</style>
