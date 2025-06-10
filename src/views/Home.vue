<template>
  <el-table :data="domains" border class="custom-table">
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
        <span :style="{ color: dynamicTextColor }">{{ scope.row.registrar_date }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="expiry_date" label="过期时间" align="center" sortable>
      <template #default="scope">
        <span :style="{ color: dynamicTextColor }">{{ scope.row.expiry_date }}</span>
      </template>
    </el-table-column>

    <el-table-column label="剩余时间" align="center" sortable :sort-method="calculateRemainingDays">
      <template #default="scope">
        <span :style="{ color: dynamicTextColor }">
          {{ calculateRemainingDays(scope.row.expiry_date) }}天
        </span>
      </template>
    </el-table-column>

    <el-table-column prop="service_type" label="服务类型" align="center" sortable>
      <template #default="scope">
        <span :style="{ color: dynamicTextColor }">{{ scope.row.service_type }}</span>
      </template>
    </el-table-column>

    <el-table-column prop="memo" label="备注" align="center" sortable>
      <template #default="scope">
        <span :style="{ color: dynamicTextColor }">{{ scope.row.memo }}</span>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="200" align="center">
      <template #default="scope">
        <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(scope.row)">修改</el-button>
        <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElTable, ElTableColumn, ElButton } from 'element-plus';

const domains = ref([
  {
    domain: 'example.com',
    registrar: 'GoDaddy',
    registrar_link: 'https://www.godaddy.com',
    registrar_date: '2021-01-01',
    expiry_date: '2023-01-01',
    service_type: 'Hosting',
    memo: 'Auto-renew',
  },
  {
    domain: 'testdomain.net',
    registrar: 'Namecheap',
    registrar_link: 'https://www.namecheap.com',
    registrar_date: '2020-07-15',
    expiry_date: '2024-07-15',
    service_type: 'SSL',
    memo: 'Renewed',
  },
]);

// 获取主题
const theme = ref('light');  // 假设你有一个主题切换逻辑
const isDarkMode = ref(false);

// 计算剩余时间
const calculateRemainingDays = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};

// 计算动态文本颜色
const dynamicTextColor = computed(() => {
  return isDarkMode.value ? '#ffffff' : '#000000';
});

// 主题切换方法
const applySettings = () => {
  isDarkMode.value = theme.value === 'dark' || (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.className = isDarkMode.value ? 'dark' : 'light';
  document.documentElement.style.setProperty('--el-color-primary', '#409EFF');  // 你可以选择主题色
};

// 监听主题变化
watch(theme, applySettings, { immediate: true });

// 假设的编辑和删除方法
const handleEdit = (row) => {
  console.log('Editing', row);
};

const handleDelete = (row) => {
  console.log('Deleting', row);
};
</script>

<style scoped>
.custom-table {
  width: 100%;
}

.link {
  color: inherit;
}

.dark {
  background-color: #1e1e1e;
  color: #fff;
}

.light {
  background-color: #fff;
  color: #000;
}
</style>
