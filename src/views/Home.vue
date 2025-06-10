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

        <!-- 修正：恢复了完整的页脚内容 -->
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
// JavaScript 部分与上一个版本相同，无需更改
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElDrawer, ElRadioGroup, ElRadioButton, ElDivider } from 'element-plus';
import { Setting, Refresh, Plus, Edit, Delete, SwitchButton, ArrowDown, Upload, Download } from '@element-plus/icons-vue';
import { useAuth } from '../utils/auth';
import DomainDialog from '../components/DomainDialog.vue';
import AlertConfigDialog from '../components/AlertConfigDialog.vue';
import ImportDialog from '../components/ImportDialog.vue';
import { createDomain, updateDomain, deleteDomain, type DomainData } from '../api/domains';

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
/* --- 宠物模型和霓虹标题 --- */
#live2d-widget { z-index: 1 !important; pointer-events: none !important; }
.neon-title { font-family: 'ZCOOL KuaiLe', cursive; font-weight: normal; font-size: 2.2rem; position: relative; background: linear-gradient(90deg, #ff0000, #ff9900, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000); background-size: 400% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: gradientFlow 5s linear infinite; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2); }
@keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

/* --- 修正：全局主题文字颜色变量 --- */
:root {
  --text-color-primary: #31353a;
  --text-color-secondary: #4b5563;
  --border-color: #e0e0e0;
}
html.dark {
  --text-color-primary: #f0f2f5;
  --text-color-secondary: #9ca3af;
  --border-color: #404a58;
}

/* --- 修正：全局Element Plus组件覆盖 --- */
html.dark .el-dialog, html.dark .el-drawer, html.dark .el-picker-panel, html.dark .el-select-dropdown {
    --el-bg-color: #1e293b !important;
    --el-border-color: #334155 !important;
}
html.dark .el-dialog__title { color: var(--text-color-primary) !important; }
html.dark .el-form-item__label { color: var(--text-color-secondary) !important; }
html.dark .el-input__inner, html.dark .el-textarea__inner {
    color: var(--text-color-primary) !important;
    background-color: #374151 !important;
    border-color: #4b5563 !important;
}
html.dark .el-select-dropdown__item { color: var(--text-color-secondary) !important; }
html.dark .el-select-dropdown__item.hover, html.dark .el-select-dropdown__item:hover { background-color: #374151 !important; }
html.dark .el-select-dropdown__item.selected { color: var(--el-color-primary) !important; background-color: rgba(var(--el-color-primary-rgb), 0.1) !important;}
/* ... 更多 EP 组件的深色模式覆盖 ... */
</style>

<style scoped>
/* --- 基础容器 --- */
.home-container { min-height: 100vh; box-sizing: border-box; padding: 20px 20px 80px 20px; background-size: cover; background-position: center center; background-attachment: fixed; transition: all 0.4s ease-in-out; }
.home-container.light { background-color: #e0eafc; background-image: url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); }
.home-container.dark { background-color: #0d1b2a; background-image: url('https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'); }

/* --- 面板样式 --- */
.header, .custom-table, .footer { position: relative; z-index: 10; border-radius: 12px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); margin-bottom: 20px; transition: all 0.3s ease-in-out; border: 1px solid transparent; }

/* Misty 面板 */
.panel-style-misty .header, .panel-style-misty .custom-table, .panel-style-misty .footer { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.home-container.light .panel-style-misty .header, .home-container.light .panel-style-misty .custom-table, .home-container.light .panel-style-misty .footer { background-color: rgba(255, 255, 255, 0.75); border-color: rgba(200, 200, 200, 0.4); }
.home-container.dark .panel-style-misty .header, .home-container.dark .panel-style-misty .custom-table, .home-container.dark .panel-style-misty .footer { background-color: rgba(25, 35, 45, 0.7); border-color: rgba(100, 100, 120, 0.5); }

/* Solid 面板 */
.panel-style-solid .header, .panel-style-solid .custom-table, .panel-style-solid .footer { backdrop-filter: none; }
.home-container.light .panel-style-solid .header, .home-container.light .panel-style-solid .custom-table, .home-container.light .panel-style-solid .footer { background-color: #ffffff; border-color: #d0d5dd; }
.home-container.dark .panel-style-solid .header, .home-container.dark .panel-style-solid .custom-table, .home-container.dark .panel-style-solid .footer { background-color: #1e293b; border-color: #334155; }

/* --- 表格文字颜色 (最终修正方案) --- */
:deep(.el-table), :deep(.el-table__expanded-cell) { background-color: transparent !important; }
:deep(.el-table th), :deep(.el-table tr), :deep(.el-table td) { background-color: transparent !important; text-shadow: none !important; transition: all 0.3s ease-in-out; }
/* 使用 CSS 变量来设置文字和边框颜色 */
:deep(.el-table th .cell), :deep(.el-table td .cell) { color: var(--text-color-primary) !important; }
:deep(.el-table th), :deep(.el-table td) { border-color: var(--border-color) !important; }
html.light :deep(.el-table__row:hover td) { background-color: rgba(0, 0, 0, 0.04) !important; }
html.dark :deep(.el-table__row:hover td) { background-color: rgba(255, 255, 255, 0.06) !important; }

/* --- 其他元素 --- */
.header { display: flex; flex-wrap: wrap; gap: 15px; align-items: center; justify-content: space-between; padding: 10px 20px; }
.header-buttons { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.link { color: var(--el-color-primary); text-decoration: none; font-weight: 500; }
.link:hover { opacity: 0.8; }
html.light .warning-text { color: #e67e22 !important; font-weight: 500; }
html.dark .warning-text { color: #f39c12 !important; font-weight: 500; }
html.light .success-text { color: #27ae60; font-weight: 500; }
html.dark .success-text { color: #2ecc71; font-weight: 500; }
html.light .danger-text { color: #c0392b; font-weight: 500; }
html.dark .danger-text { color: #e74c3c; font-weight: 500; }

/* --- 页脚 --- */
.footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 12px; margin: 0; border-radius: 0; }
.footer-content { max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; text-align: center; }
.copyright { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; font-size: 14px; }
.separator { color: #dcdfe6; margin: 0 2px; }
.social-links { display: flex; gap: 15px; align-items: center; }
.social-link { color: #eee; transition: all 0.3s ease; }
.social-link:hover { color: #90caf9; transform: translateY(-2px); }
.social-icon { width: 20px; height: 20px; }
/* 修正页脚文字颜色 */
html.light .footer { color: #495057; }
html.dark .footer { color: #adb5bd; }
html.dark .footer .social-link { color: #adb5bd; }
html.dark .footer .social-link:hover { color: #e5e7eb; }
html.dark .footer .separator { color: #4b5563; }

/* --- 设置抽屉 --- */
.settings-container { padding: 0 15px; }
.settings-group { display: flex; justify-content: center; width: 100%; margin-top: 12px; margin-bottom: 12px; }
.color-picker { display: flex; justify-content: space-around; padding: 15px 0; }
.color-swatch { width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); }
.color-swatch:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
.color-swatch.active { border-color: var(--el-color-primary); transform: translateY(-1px) scale(1.1); box-shadow: 0 2px 5px rgba(0,0,0,0.2); }

</style>
