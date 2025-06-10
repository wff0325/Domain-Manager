<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '修改域名' : '新建域名'"
    width="500px"
    @close="handleClose"
    class="domain-dialog"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="域名" prop="domain">
        <el-input v-model="formData.domain" placeholder="请输入域名" />
      </el-form-item>
      <el-form-item label="域名商" prop="registrar">
        <el-input v-model="formData.registrar" placeholder="请输入域名商" />
      </el-form-item>
      <el-form-item label="域名商链接" prop="registrar_link">
        <el-input v-model="formData.registrar_link" placeholder="请输入域名商链接" />
      </el-form-item>
      <el-form-item label="注册日期" prop="registrar_date">
        <el-date-picker
          v-model="formData.registrar_date"
          type="date"
          placeholder="选择注册日期"
          style="width: 100%;"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="到期日期" prop="expiry_date">
        <el-date-picker
          v-model="formData.expiry_date"
          type="date"
          placeholder="选择到期日期"
          style="width: 100%;"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="服务类型" prop="service_type">
        <el-input v-model="formData.service_type" placeholder="例如：博客、图床等" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%;">
          <el-option label="在线" value="在线" />
          <el-option label="离线" value="离线" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
      <!-- 修正：为 el-switch 添加 active-value 和 inactive-value -->
      <el-form-item label="TG通知" prop="tgsend">
        <el-switch
          v-model="formData.tgsend"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
      <el-form-item label="状态通知" prop="st_tgsend">
        <el-switch
          v-model="formData.st_tgsend"
          :active-value="1"
          :inactive-value="0"
        />
      </el-form-item>
      <el-form-item label="备注" prop="memo">
        <el-input v-model="formData.memo" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { DomainData } from '../api/domains';

const props = defineProps<{
  visible: boolean;
  isEdit: boolean;
  editData?: DomainData;
}>();

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref<FormInstance>();
// 修正：将 tgsend 和 st_tgsend 的默认值改为数字 0
const initialFormData: Omit<DomainData, 'id' | 'created_at'> = {
  domain: '',
  registrar: '',
  registrar_link: '',
  registrar_date: '',
  expiry_date: '',
  service_type: '',
  status: '在线',
  memo: '',
  tgsend: 0,
  st_tgsend: 0
};
const formData = ref({ ...initialFormData });

const rules = reactive<FormRules>({
  domain: [{ required: true, message: '请输入域名', trigger: 'blur' }],
  registrar: [{ required: true, message: '请输入域名商', trigger: 'blur' }],
  registrar_date: [{ required: true, message: '请选择注册日期', trigger: 'change' }],
  expiry_date: [{ required: true, message: '请选择到期日期', trigger: 'change' }],
  service_type: [{ required: true, message: '请输入服务类型', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.isEdit && props.editData) {
      formData.value = { ...props.editData };
    } else {
      formData.value = { ...initialFormData };
    }
  } else {
    formRef.value?.resetFields();
  }
});

const handleClose = () => {
  emit('update:visible', false);
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    const valid = await formRef.value.validate();
    if (valid) {
      emit('submit', formData.value);
    }
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};
</script>

<style scoped>
/*
 * 此处无需样式，对话框将完全由 Home.vue 中的全局样式控制
*/
.domain-dialog {
  /* No local styles needed */
}
</style>
