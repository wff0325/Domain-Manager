<template>
    <el-dialog v-model="dialogVisible" title="导入域名" width="500px" :close-on-click-modal="false">
        <div class="import-container">
            <el-upload class="upload-area" drag action="#" :auto-upload="false" :show-file-list="true" :limit="1"
                accept=".json" :on-change="handleFileChange" :on-exceed="handleExceed" :file-list="fileList">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    拖拽文件到此处或 <em>点击上传</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        请上传 JSON 格式文件，数据应为域名对象数组
                    </div>
                </template>
            </el-upload>

            <div v-if="selectedFile" class="selected-file">
                <span>已选择文件: {{ selectedFile.name }}</span>
                <el-button type="danger" size="small" @click="clearFile">清除</el-button>
            </div>

            <div v-if="importResult" class="import-result">
                <h3>导入结果:</h3>
                <div class="result-summary">
                    <div class="result-item">
                        <p>总数: <span>{{ importResult.total }}</span></p>
                    </div>
                    <div class="result-item success">
                        <p>成功: <span>{{ importResult.success }}</span></p>
                    </div>
                    <div class="result-item error">
                        <p>失败: <span>{{ importResult.failed }}</span></p>
                    </div>
                </div>

                <div v-if="importResult.errors && importResult.errors.length > 0" class="error-details">
                    <h4>错误详情:</h4>
                    <el-collapse>
                        <el-collapse-item :title="`显示 ${importResult.errors.length} 个错误`">
                            <div v-for="(error, index) in importResult.errors" :key="index" class="error-item">
                                <div>
                                    <span class="error-domain">{{ error.domain }}</span>
                                    <span class="error-msg">{{ error.error }}</span>
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </div>
        </div>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" @click="handleImport" :loading="loading" :disabled="!selectedFile">
                    开始导入
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadUserFile, UploadProps } from 'element-plus'
import type { ApiResponse } from '../utils/request'
import { useAuth } from '../utils/auth'

// 定义导入结果类型
interface ImportError {
    domain: string;
    error: string;
}

interface ImportResult {
    total: number;
    success: number;
    failed: number;
    errors: ImportError[];
}

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const fileList = ref<UploadUserFile[]>([])
const selectedFile = ref<File | null>(null)
const importResult = ref<ImportResult | null>(null)

watch(() => props.visible, (val) => {
    dialogVisible.value = val
    if (!val) {
        // 关闭对话框时清除状态
        clearFile()
        importResult.value = null
    }
})

watch(() => dialogVisible.value, (val) => {
    emit('update:visible', val)
})

const handleFileChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
    // 验证文件类型
    if (!uploadFile.raw || (uploadFile.raw.type !== 'application/json' && !uploadFile.name.endsWith('.json'))) {
        ElMessage.error('只能上传 JSON 文件!')
        fileList.value = []
        return
    }
    selectedFile.value = uploadFile.raw
    fileList.value = uploadFiles
}

const handleExceed = () => {
    ElMessage.warning('只能上传 1 个文件!')
}

const clearFile = () => {
    selectedFile.value = null
    fileList.value = []
}

const handleImport = async () => {
    if (!selectedFile.value) {
        ElMessage.warning('请先选择一个文件')
        return
    }

    loading.value = true
    try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)

        // 获取 token
        const auth = useAuth()
        const authData = auth.getAuthToken()
        if (!authData || !authData.token) {
            throw new Error('未登录或登录已过期')
        }

        const response = await fetch('/api/domains/import', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authData.token}`
            },
            body: formData
        })

        const result = await response.json() as ApiResponse<ImportResult>
        if (result.status !== 200) {
            throw new Error(result.message || '导入失败')
        }

        importResult.value = result.data
        ElMessage.success(result.message || '导入成功')

        // 导入成功后通知父组件刷新数据
        if (result.data.success > 0) {
            emit('success')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '导入失败')
        console.error('导入失败:', error)
    } finally {
        loading.value = false
    }
}

const handleClose = () => {
    dialogVisible.value = false
}
</script>

<style scoped>
.import-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.upload-area {
    width: 100%;
}

.selected-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: #f0f9ff;
    border-radius: 4px;
}

html.dark .selected-file {
    background-color: #1a3349;
}

.import-result {
    margin-top: 16px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 16px;
}

html.dark .import-result {
    border-color: #404040;
}

.import-result h3 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 16px;
}

.result-summary {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
}

.result-item {
    padding: 8px 16px;
    border-radius: 4px;
    background-color: #f0f0f0;
    text-align: center;
}

html.dark .result-item {
    background-color: #2a2a2a;
}

.result-item.success {
    background-color: #e7f8e9;
    color: #67c23a;
}

html.dark .result-item.success {
    background-color: #162c1a;
}

.result-item.error {
    background-color: #ffeeee;
    color: #f56c6c;
}

html.dark .result-item.error {
    background-color: #2c1a1a;
}

.result-item p {
    margin: 0;
}

.result-item span {
    font-weight: bold;
    font-size: 18px;
}

.error-details {
    margin-top: 16px;
}

.error-details h4 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 14px;
}

.error-item {
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    background-color: #fff5f5;
}

html.dark .error-item {
    background-color: #2a2020;
}

.error-domain {
    font-weight: bold;
    margin-right: 8px;
}

.error-msg {
    color: #f56c6c;
}

html.dark .error-msg {
    color: #ff9393;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

:deep(.el-upload-dragger) {
    width: 100%;
}

:deep(.el-upload) {
    width: 100%;
}

:deep(.el-upload-list) {
    width: 100%;
}
</style>