<template>
    <div class="home-container" :class="[isDarkMode ? 'dark' : 'light', panelStyleClass]">
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
                <el-tooltip content="主题设置" placement="bottom">
                     <el-button type="primary" size="small" :icon="Setting" @click="settingsDrawerVisible = true">主题</el-button>
                </el-tooltip>
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
            <el-table-column prop="registrar_date" label="注册时间" align="center" sortable>
                <template #default="scope">
                    <span class="accent-text">{{ scope.row.registrar_date }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="expiry_date" label="过期时间" align="center" sortable>
                <template #default="scope">
                    <span class="accent-text">{{ scope.row.expiry_date }}</span>
                </template>
            </el-table-column>
            <el-table-column label="剩余时间" align="center" sortable
                :sort-method="(a, b) => calculateRemainingDays(a.expiry_date) - calculateRemainingDays(b.expiry_date)">
                <template #default="scope">
                    <span :class="calculateRemainingDays(scope.row.expiry_date) <= alertDays ? 'warning-text' : 'accent-text'">
                        {{ calculateRemainingDays(scope.row.expiry_date) }}天
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="service_type" label="服务类型" align="center" sortable>
                 <template #default="scope">
                    <span class="accent-text">{{ scope.row.service_type }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" align="center" sortable>
                <template #default="scope">
                    <span :class="scope.row.status === '在线' ? 'success-text' : 'danger-text'">
                        {{ scope.row.status }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="memo" label="备注" align="center" sortable>
                <template #default="scope">
                    <span class="accent-text">{{ scope.row.memo }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
                <template #default="scope">
                    <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(scope.row)">修改</el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <DomainDialog v-model:visible="dialogVisible" :is-edit="isEdit" :edit-data="editData" @submit="handleDialogSubmit" />
        <AlertConfigDialog v-model:visible="configVisible" :config="alertConfig" @submit="handleConfigSubmit" />
        <ImportDialog v-model:visible="importVisible" @success="loadDomains" />

        <el-drawer v-model="settingsDrawerVisible" title="主题设置" direction="rtl" size="300px">
            <div class="settings-container">
                <el-divider>主题模式</el-divider>
                <el-radio-group v-model="theme" class="settings-group">
                    <el-radio-button label="light">浅色</el-radio-button>
                    <el-radio-button label="dark">深色</el-radio-button>
                    <el-radio-button label="system">跟随系统</el-radio-button>
                </el-radio-group>

                <el-divider>主题颜色</el-divider>
                <div class="color-picker">
                    <div v-for="color in accentColors" :key="color" class="color-swatch" :style="{ backgroundColor: color }" :class="{ active: accentColor === color }" @click="setAccentColor(color)"></div>
                </div>

                <el-divider>面板样式</el-divider>
                 <el-radio-group v-model="panelStyle" class="settings-group">
                    <el-radio-button label="misty">Misty</el-radio-button>
                    <el-radio-button label="solid">Solid</el-radio-button>
                </el-radio-group>
            </div>
        </el-drawer>

        <footer class="footer">
            <div class="footer-content">
                <span>© 2025 Domains-Support v1.0.5</span>
                <!-- 请将下面的 href 替换为您的实际链接 -->
                <a href="https://github.com/dafengzi" target="_blank" class="link footer-link">
                    <IconGithub class="footer-icon" />
                    <span>作者: 大疯子</span>
                </a>
                <a href="https://youtube.com/" target="_blank" class="link footer-link">
                    <IconYoutube class="footer-icon" />
                    <span>YouTube</span>
                </a>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElDrawer, ElRadioGroup, ElRadioButton, ElDivider } from 'element-plus';
import { Setting, Refresh, Plus, Edit, Delete, SwitchButton, ArrowDown, Upload, Download } from '@element-plus/icons-vue';
import { useAuth } from '../utils/auth';
import DomainDialog from '../components/DomainDialog.vue';
import AlertConfigDialog from '../components/AlertConfigDialog.vue';
import ImportDialog from '../components/ImportDialog.vue';
import { createDomain, updateDomain, deleteDomain, type DomainData } from '../api/domains';

// --- SVG 图标定义 ---
const IconGithub = h('svg', { viewBox: '0 0 24 24', width: '16', height: '16', fill: 'currentColor' }, [
  h('path', { d: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' })
]);

const IconYoutube = h('svg', { viewBox: '0 0 24 24', width: '16', height: '16', fill: 'currentColor' }, [
  h('path', { d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' })
]);

interface AlertConfig { tg_token: string; tg_userid: string; days: number; }
interface ApiResponse<T = any> { status: number; message: string; data: T; }

const settingsDrawerVisible = ref(false);
const theme = ref(localStorage.getItem('theme') || 'system');
const accentColor = ref(localStorage.getItem('accentColor') || '#409EFF');
const panelStyle = ref(localStorage.getItem('panelStyle') || 'misty');
const isDarkMode = ref(false); 

const accentColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'];

watch(theme, (newTheme) => localStorage.setItem('theme', newTheme));
watch(accentColor, (newColor) => localStorage.setItem('accentColor', newColor));
watch(panelStyle, (newStyle) => localStorage.setItem('panelStyle', newStyle));

const applySettings = () => {
    let currentIsDark = false;
    if (theme.value === 'system') {
        currentIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        currentIsDark = theme.value === 'dark';
    }
    isDarkMode.value = currentIsDark; 

    document.documentElement.className = currentIsDark ? 'dark' : 'light'; 
    document.documentElement.style.setProperty('--el-color-primary', accentColor.value);
};

const setAccentColor = (color: string) => { accentColor.value = color; };
const panelStyleClass = computed(() => `panel-style-${panelStyle.value}`);

onMounted(() => {
    applySettings();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (theme.value === 'system') applySettings();
    });
});
watch([theme, accentColor], applySettings, { immediate: true });

const router = useRouter();
const auth = useAuth();
const domains = ref<DomainData[]>([]);
const alertDays = ref(30);
const alertConfig = ref<AlertConfig>();
const refreshing = ref(false);
const dialogVisible = ref(false);
const configVisible = ref(false);
const isEdit = ref(false);
const editData = ref<DomainData>();
const importVisible = ref(false);

const checkLoginStatus = () => { if (!auth.getAuthToken()) router.push({ name: 'Login' }); };
const handleLogout = () => { auth.clearAuth(); router.push({ name: 'Login' }); };
const handleAdd = () => { isEdit.value = false; editData.value = undefined; dialogVisible.value = true; };
const handleEdit = (row: DomainData) => { isEdit.value = true; editData.value = row; dialogVisible.value = true; };
const handleConfig = () => { configVisible.value = true; };
const handleImport = () => { importVisible.value = true; };

const handleDelete = async (row: DomainData) => {
    try {
        await ElMessageBox.confirm('确定要删除该域名吗？', '提示', { type: 'warning' });
        if (row.id) {
            await deleteDomain(row.id);
            ElMessage.success('删除成功');
            await loadDomains();
        }
    } catch (error) { if (error !== 'cancel') ElMessage.error('删除失败'); }
};

const handleDialogSubmit = async (formData: Omit<DomainData, 'id' | 'created_at'>) => {
    try {
        if (isEdit.value && editData.value?.id) {
            await updateDomain(editData.value.id, formData);
            ElMessage.success('修改成功');
        } else {
            await createDomain(formData);
            ElMessage.success('添加成功');
        }
        dialogVisible.value = false;
        await loadDomains();
    } catch (error: any) { ElMessage.error(error.response?.data?.message || '操作失败'); }
};

const loadDomains = async () => {
    try {
        const authData = auth.getAuthToken();
        if (!authData) throw new Error('未登录或登录已过期');
        const response = await fetch('/api/domains', { headers: { 'Authorization': `Bearer ${authData.token}` } });
        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            throw new Error(errorData.message || '请求失败');
        }
        const result = await response.json() as ApiResponse<DomainData[]>;
        if (result.status !== 200) throw new Error(result.message || '请求失败');
        domains.value = result.data || [];
    } catch (error: any) {
        ElMessage.error(error.message || '加载域名列表失败');
        if (error.message.includes('授权') || error.message.includes('令牌')) { auth.clearAuth(); router.push({ name: 'Login' }); }
    }
};

const calculateRemainingDays = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

const handleConfigSubmit = async (config: AlertConfig) => {
    try {
        const authData = auth.getAuthToken();
        if (!authData) throw new Error('未登录或登录已过期');
        const response = await fetch('/api/alertconfig', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.token}` }, body: JSON.stringify(config) });
        const result = await response.json() as ApiResponse;
        if (result.status !== 200) throw new Error(result.message || '保存失败');
        ElMessage.success('配置保存成功');
        alertDays.value = config.days;
        alertConfig.value = config;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '保存配置失败';
        ElMessage.error(errorMessage);
        if (errorMessage.includes('授权') || errorMessage.includes('令牌')) { auth.clearAuth(); router.push({ name: 'Login' }); }
    }
};

const handleRefresh = async () => {
    if (refreshing.value) return;
    refreshing.value = true;
    ElMessage.info('正在检查域名状态...');
    try {
        const checkDomainStatus = async (domain: string): Promise<string> => {
            try {
                const authData = auth.getAuthToken();
                if (!authData) throw new Error('未授权');
                const response = await fetch('/api/domains/check', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.token}` }, body: JSON.stringify({ domain }) });
                const result = await response.json() as ApiResponse<{ status: string }>;
                return result.status === 200 && result.data ? result.data.status : '离线';
            } catch { return '离线'; }
        };
        const updateDomainStatus = async (domain: string, status: string): Promise<DomainData> => {
            const authData = auth.getAuthToken();
            if (!authData) throw new Error('未授权');
            const response = await fetch('/api/domains/status', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authData.token}` }, body: JSON.stringify({ domain, status }) });
            const result = await response.json() as ApiResponse<DomainData>;
            if (result.status === 200 && result.data) return result.data;
            throw new Error(result.message || '更新失败');
        };
        const updatedDomains = await Promise.all(domains.value.map(async (domainItem) => {
            const status = await checkDomainStatus(domainItem.domain);
            return await updateDomainStatus(domainItem.domain, status);
        }));
        domains.value = updatedDomains;
        ElMessage.success('状态刷新完成');
    } catch (error: unknown) {
        ElMessage.error(error instanceof Error ? error.message : '刷新状态失败');
    } finally {
        refreshing.value = false;
    }
};

const loadAlertConfig = async () => {
    try {
        const authData = auth.getAuthToken();
        if (!authData) return;
        const response = await fetch('/api/alertconfig', { headers: { 'Authorization': `Bearer ${authData.token}` } });
        const result = await response.json() as ApiResponse<AlertConfig>;
        if (result.status === 200 && result.data) {
            alertConfig.value = result.data;
            alertDays.value = result.data.days;
        }
    } catch (error) { console.error('获取告警配置失败:', error); }
};

const handleExport = async () => {
    const loading = ElMessage.info({ message: '正在准备导出数据...', duration: 0 });
    try {
        const authData = auth.getAuthToken();
        if (!authData) throw new Error('未登录或登录已过期');
        const response = await fetch('/api/domains/export', { headers: { 'Authorization': `Bearer ${authData.token}` } });
        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            throw new Error(errorData.message || '导出失败');
        }
        const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `domains-export.json`;
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        ElMessage.success('导出成功');
    } catch (error) {
        ElMessage.error(error instanceof Error ? error.message : '导出失败');
    } finally {
        loading.close();
    }
};

onMounted(() => {
    checkLoginStatus();
    loadDomains();
    loadAlertConfig();
});
</script>

<style> /* 全局样式 */
#live2d-widget {
    z-index: 1 !important; 
    pointer-events: none !important; 
}
.neon-title {
    font-family: 'ZCOOL KuaiLe', cursive; font-weight: normal; font-size: 2.2rem; position: relative;
    background: linear-gradient(90deg, #ff0000, #ff9900, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
    background-size: 400% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
    animation: gradientFlow 5s linear infinite; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}
@keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

html.light .el-input__inner,
html.light .el-textarea__inner {
    color: #303133 !important; 
}
html.dark .el-input__inner,
html.dark .el-textarea__inner {
    color: #E5EAF3 !important; 
}
html.light .el-dialog__title { color: #303133 !important; }
html.dark .el-dialog__title { color: #E5EAF3 !important; }
html.light .el-dialog__body { color: #474747 !important; }
html.dark .el-dialog__body { color: #c3c4c7 !important; }
</style>

<style scoped>
/* --- 基础容器样式 --- */
.home-container {
    min-height: 100vh; box-sizing: border-box; padding: 20px 20px 80px 20px;
    background-size: cover; background-position: center center; background-attachment: fixed;
    transition: background-image 0.4s ease-in-out, background-color 0.4s ease-in-out;
}
.home-container.light {
    background-color: #e0eafc; 
    background-image: url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
}
.home-container.dark {
    background-color: #0d1b2a; 
    background-image: url('https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
}

/* --- 面板基础样式 --- */
.header, .custom-table, .footer {
    position: relative; z-index: 10; border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); margin-bottom: 20px;
    transition: background-color 0.3s ease-in-out, backdrop-filter 0.3s ease-in-out, border-color 0.3s ease-in-out;
    border: 1px solid transparent;
}

/* --- Misty 面板样式 --- */
.panel-style-misty .header, .panel-style-misty .custom-table, .panel-style-misty .footer {
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}
.home-container.light .panel-style-misty .header, 
.home-container.light .panel-style-misty .custom-table, 
.home-container.light .panel-style-misty .footer {
    background-color: rgba(255, 255, 255, 0.75); border-color: rgba(200, 200, 200, 0.4);
}
.home-container.dark .panel-style-misty .header, 
.home-container.dark .panel-style-misty .custom-table, 
.home-container.dark .panel-style-misty .footer {
    background-color: rgba(25, 35, 45, 0.7); border-color: rgba(100, 100, 120, 0.5);
}

/* --- Solid 面板样式 --- */
.panel-style-solid .header, .panel-style-solid .custom-table, .panel-style-solid .footer {
    backdrop-filter: none;
}
.home-container.light .panel-style-solid .header, 
.home-container.light .panel-style-solid .custom-table, 
.home-container.light .panel-style-solid .footer {
    background-color: #ffffff; border-color: #d0d5dd;
}
.home-container.dark .panel-style-solid .header, 
.home-container.dark .panel-style-solid .custom-table, 
.home-container.dark .panel-style-solid .footer {
    background-color: #1e293b; border-color: #334155;
}

/* --- 表格特定样式 --- */
:deep(.el-table), :deep(.el-table__expanded-cell) { background-color: transparent !important; }
:deep(.el-table th), :deep(.el-table tr), :deep(.el-table td) {
    background-color: transparent !important; text-shadow: none !important;
    transition: color 0.3s ease-in-out, border-color 0.3s ease-in-out;
}
html.light :deep(.el-table td .cell) { color: #31353a !important; }
html.light :deep(.el-table th), html.light :deep(.el-table td) { border-color: #e0e0e0 !important; }
html.dark :deep(.el-table td .cell) { color: #f0f2f5 !important; }
html.dark :deep(.el-table th), html.dark :deep(.el-table td) { border-color: #404a58 !important; }
html.light :deep(.el-table__row:hover td) { background-color: rgba(0, 0, 0, 0.04) !important; }
html.dark :deep(.el-table__row:hover td) { background-color: rgba(255, 255, 255, 0.06) !important; }

/* --- 头部和按钮 --- */
.header { display: flex; flex-wrap: wrap; gap: 15px; align-items: center; justify-content: space-between; padding: 10px 20px; }
.header-buttons { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }

/* --- 文字和链接颜色 --- */
.link { color: var(--el-color-primary); text-decoration: none; font-weight: 500; }
.link:hover { opacity: 0.8; }
.accent-text { color: var(--el-color-primary); font-weight: 500; }
html.light .warning-text { color: #e67e22 !important; font-weight: 500; }
html.dark .warning-text { color: #f39c12 !important; font-weight: 500; }
html.light .success-text { color: #27ae60; font-weight: 500; }
html.dark .success-text { color: #2ecc71; font-weight: 500; }
html.light .danger-text { color: #c0392b; font-weight: 500; }
html.dark .danger-text { color: #e74c3c; font-weight: 500; }

/* --- 表格标题颜色 --- */
:deep(.el-table th .cell) {
    color: var(--el-color-primary) !important;
    font-weight: 500;
}

/* --- 页脚样式 --- */
.footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 12px; margin: 0; border-radius: 0; }
html.light .footer { color: #495057; }
html.dark .footer { color: #adb5bd; }
.footer-content { display: flex; justify-content: center; align-items: center; gap: 20px; font-size: 0.9em; }
.footer-link { display: inline-flex; align-items: center; gap: 6px; }
.footer-icon { transition: color 0.3s; }

/* --- 设置抽屉 --- */
.settings-container { padding: 0 15px; }
.settings-group { display: flex; justify-content: center; width: 100%; margin-top: 12px; margin-bottom: 12px; }
.color-picker { display: flex; justify-content: space-around; padding: 15px 0; }
.color-swatch { width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); }
.color-swatch:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
.color-swatch.active { border-color: var(--el-color-primary); transform: translateY(-1px) scale(1.1); box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
</style>
