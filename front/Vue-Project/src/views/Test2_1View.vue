<script setup lang="ts">
import { ref, computed } from 'vue'
import { userList } from '../api/user'
import { ElButton, ElTable, ElTableColumn, ElPagination, ElMessage } from 'element-plus'

interface User {
  userId: number
  username: string
  password: string
  nickname: string
  avatar: string
}

const loading = ref(false)
const users = ref<User[]>([])
const currentPage = ref(1)
const pageSize = ref(50)

const fetchUsers = async () => {
  try {
    loading.value = true
    console.log('开始调用 userList 接口...')

    const response = await userList()

    console.log('=== userList 接口返回的完整响应 ===')
    console.log('完整 response 对象:', response)
    console.log('response.data:', response.data)

    if (response.data && response.data.code === 200) {
      const userData = response.data.data || []
      users.value = userData
      ElMessage.success(`成功获取 ${userData.length} 个用户`)
      console.log('获取的用户数据:', userData)
    } else {
      console.error('接口返回格式不正确:', response.data)
      ElMessage.error('接口返回格式不正确')
    }

    console.log('=== 接口调用完成 ===')
  } catch (error: any) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')

    if (error.response) {
      console.error('响应错误 - 状态码:', error.response.status)
      console.error('响应错误 - 数据:', error.response.data)
    } else if (error.request) {
      console.error('请求错误 - 可能是网络问题或跨域问题')
    } else {
      console.error('配置错误:', error.message)
    }
  } finally {
    loading.value = false
  }
}

// 计算分页后的数据
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return users.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(users.value.length / pageSize.value)
})

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <main class="test2-1-view">
    <div class="header">
      <div class="header-top">
        <h1>用户管理</h1>
        <el-button
          type="primary"
          size="small"
          :loading="loading"
          @click="fetchUsers"
          icon="Search"
          class="query-btn"
        >
          查询
        </el-button>
      </div>
      <p class="subtitle">查询并显示所有用户信息</p>
    </div>

    <div class="stats-container" v-if="users.length > 0">
      <div class="stats">
        <span class="stat-item">总用户数: {{ users.length }}</span>
        <span class="stat-item">当前页: {{ currentPage }}/{{ totalPages }}</span>
        <span class="stat-item">每页: {{ pageSize }} 条</span>
      </div>
    </div>

    <div class="content" v-if="users.length > 0">
      <el-table
        :data="paginatedUsers"
        stripe
        style="width: 100%"
        border
        v-loading="loading"
      >
        <el-table-column
          prop="userId"
          label="用户ID"
          width="100"
          align="center"
        />
        <el-table-column
          prop="username"
          label="用户名"
          min-width="150"
        />
        <el-table-column
          prop="nickname"
          label="昵称"
          min-width="150"
        />
        <el-table-column
          prop="password"
          label="密码"
          width="120"
        >
          <template #default="scope">
            <span class="password-field">{{ scope.row.password }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="avatar"
          label="头像"
          width="120"
        >
          <template #default="scope">
            <span v-if="scope.row.avatar" class="avatar-field">
              {{ scope.row.avatar.substring(0, 8) }}...
            </span>
            <span v-else class="no-avatar">无头像</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="users.length"
          @size-change="pageSize = $event"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <div class="empty-state" v-else-if="!loading">
      <p>点击上方按钮查询用户列表</p>
    </div>
  </main>
</template>

<style scoped>
.test2-1-view {
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--text);
}

.header .subtitle {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.query-btn {
  min-width: 80px;
}

.stats-container {
  margin-bottom: 20px;
}

.stats {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: var(--panel);
  border-radius: 8px;
  border: 1px solid var(--line);
}

.stat-item {
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
}

.stat-item:not(:last-child)::after {
  content: "|";
  color: var(--line);
  margin-left: 12px;
}

.content {
  background: var(--panel);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--line);
}

.password-field {
  font-family: monospace;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.avatar-field {
  font-family: monospace;
  font-size: 12px;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.no-avatar {
  color: var(--muted);
  font-size: 12px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted);
  background: var(--panel);
  border-radius: 8px;
  border: 1px dashed var(--line);
}
</style>
