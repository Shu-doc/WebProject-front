<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { roomList, getRoom, deleteRoom } from '../api/room'
import {
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElMessage,
  ElMessageBox,
  ElInput,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElTag
} from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

interface Room {
  roomId: number
  roomName: string
  ownerId: number       // 房主ID
  maxUser: number       // 最大允许人数
  status: number        // 0=私密, 1=公开
  createTime: string    // 创建时间
  roomPassword: string  // 私密房间密码
}

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const searchRoomId = ref('')
const rooms = ref<Room[]>([])
const currentPage = ref(1)
const pageSize = ref(20)

const fetchRooms = async () => {
  // 验证输入
  if (searchRoomId.value.trim() && !/^\d+$/.test(searchRoomId.value.trim())) {
    ElMessage.warning('自习室ID必须是数字')
    return
  }

  try {
    loading.value = true

    if (searchRoomId.value.trim()) {
      // 查询单个自习室
      const roomId = searchRoomId.value.trim()

      const response = await getRoom(roomId)

      if (response.data) {
        // 检查响应格式
        if (typeof response.data === 'object' && 'code' in response.data) {
          // 格式: {code: 200, data: {...}, message: '...'}
          if (response.data.code === 200) {
            if (response.data.data) {
              // 单个自习室放入数组
              console.log('查询单个自习室返回数据（有code包装）:', response.data.data)
              console.log('自习室字段:', Object.keys(response.data.data))
              rooms.value = [response.data.data]
              ElMessage.success(`成功获取自习室: ${response.data.data.roomName}`)
            } else {
              rooms.value = []
              ElMessage.warning(`未找到自习室ID: ${roomId}`)
            }
          } else {
            rooms.value = []
            ElMessage.error(response.data.message || `查询失败，错误码: ${response.data.code}`)
            console.error('接口返回错误码:', response.data)
          }
        } else {
          // 格式: 直接返回自习室对象
          console.log('查询单个自习室返回数据（直接对象）:', response.data)
          console.log('自习室字段:', Object.keys(response.data))
          rooms.value = [response.data]
          ElMessage.success(`成功获取自习室: ${response.data.roomName}`)
        }
      } else {
        rooms.value = []
        ElMessage.error('响应数据为空')
        console.error('响应数据为空:', response)
      }
    } else {
      // 查询所有自习室
      const response = await roomList()

      if (response.data) {
        // 检查响应格式
        if (typeof response.data === 'object' && 'code' in response.data) {
          // 格式: {code: 200, data: [...], message: '...'}
          if (response.data.code === 200) {
            const roomData = response.data.data || []
            console.log('查询所有自习室返回数据:', roomData)
            if (roomData.length > 0) {
              console.log('第一个自习室字段:', Object.keys(roomData[0]))
              console.log('第一个自习室详情:', roomData[0])
            }
            rooms.value = roomData
            ElMessage.success(`成功获取 ${roomData.length} 个自习室`)
          } else {
            console.error('接口返回错误:', response.data)
            ElMessage.error(response.data.message || `查询失败，错误码: ${response.data.code}`)
            rooms.value = []
          }
        } else if (Array.isArray(response.data)) {
          // 格式: 直接返回自习室数组
          console.log('直接返回自习室数组数据:', response.data)
          if (response.data.length > 0) {
            console.log('第一个自习室字段:', Object.keys(response.data[0]))
            console.log('第一个自习室详情:', response.data[0])
          }
          rooms.value = response.data
          ElMessage.success(`成功获取 ${response.data.length} 个自习室`)
        } else {
          // 未知格式
          console.error('接口返回格式不正确:', response.data)
          ElMessage.error('接口返回格式不正确')
          rooms.value = []
        }
      } else {
        console.error('响应数据为空:', response)
        ElMessage.error('响应数据为空')
        rooms.value = []
      }
    }

  } catch (error: unknown) {
    console.error('获取自习室列表失败:', error)

    // 类型安全的错误处理
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number; statusText: string; data: any } }
      // 服务器响应了，但状态码不在 2xx 范围
      console.error('响应错误 - 状态码:', axiosError.response?.status)
      console.error('响应错误 - 数据:', axiosError.response?.data)
      ElMessage.error(`请求失败: ${axiosError.response?.status} ${axiosError.response?.statusText}`)
    } else if (error && typeof error === 'object' && 'request' in error) {
      // 请求已发出，但没有收到响应
      console.error('请求错误 - 可能是网络问题或跨域问题')
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else if (error instanceof Error) {
      // 请求配置出错
      console.error('配置错误:', error.message)
      ElMessage.error(`请求配置错误: ${error.message}`)
    } else {
      // 未知错误类型
      console.error('未知错误:', error)
      ElMessage.error('发生未知错误')
    }
  } finally {
    loading.value = false
  }
}

// 计算分页后的数据
const paginatedRooms = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return rooms.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(rooms.value.length / pageSize.value)
})

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const handleEdit = (roomId: number) => {
  // 传递当前搜索条件，以便返回时保持查询状态
  router.push({
    path: `/RoomEdit/${roomId}`,
    query: {
      search: searchRoomId.value || ''
    }
  })
}

const handleDelete = async (roomId: number) => {
  try {
    // 确认删除
    await ElMessageBox.confirm(
      `确定要删除自习室ID为 ${roomId} 的自习室吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )

    // 用户确认删除，执行删除操作
    const response = await deleteRoom(roomId)

    if (response.data.code === 200) {
      ElMessage.success('自习室删除成功')
      // 删除后刷新自习室列表
      fetchRooms()
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error: unknown) {
    // 如果用户取消删除，会抛出 reject，这里捕获但不处理
    if (typeof error === 'string' && (error === 'cancel' || error === 'close')) {
      return
    }

    console.error('删除自习室失败:', error)

    // 类型安全的错误处理
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number; statusText: string; data: any } }
      // 服务器响应了，但状态码不在 2xx 范围
      ElMessage.error(`删除失败: ${axiosError.response?.status} ${axiosError.response?.statusText}`)
    } else if (error && typeof error === 'object' && 'request' in error) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else if (error instanceof Error) {
      // 请求配置出错
      ElMessage.error(`删除配置错误: ${error.message}`)
    } else {
      // 未知错误类型
      console.error('未知错误:', error)
      ElMessage.error('删除自习室时发生未知错误')
    }
  }
}

const handleDropdownCommand = (command: string, roomId: number) => {
  if (command === 'edit') {
    handleEdit(roomId)
  } else if (command === 'delete') {
    handleDelete(roomId)
  }
}

// 页面加载时根据路由参数自动查询
onMounted(() => {
  // 检查路由查询参数中是否有搜索条件
  const searchFromRoute = route.query.search as string
  if (searchFromRoute) {
    searchRoomId.value = searchFromRoute
  }
  // 执行查询（会自动根据searchRoomId.value的值决定查询单个还是所有自习室）
  fetchRooms()
})

// 格式化状态标签（0=私密, 1=公开）
const formatStatus = (status: number | string) => {
  // 兼容字符串和数字类型
  const statusNum = Number(status)
  const statusMap: Record<number, { type: string, text: string }> = {
    1: { type: 'success', text: '公开' },
    0: { type: 'info', text: '私密' }
  }
  const statusInfo = statusMap[statusNum] || { type: 'info', text: `${status}` }
  return statusInfo
}
</script>

<template>
  <main class="room-query-view">
    <div class="header">
      <div class="header-top">
        <h1>自习室管理</h1>
        <div class="search-area">
          <el-input
            v-model="searchRoomId"
            placeholder="输入自习室ID查询单个自习室"
            size="small"
            style="width: 200px; margin-right: 8px;"
            clearable
            @keyup.enter="fetchRooms"
          />
          <el-button
            type="primary"
            size="small"
            :loading="loading"
            @click="fetchRooms"
            icon="Search"
            class="query-btn"
          >
            查询
          </el-button>
        </div>
      </div>
      <p class="subtitle">{{ searchRoomId ? '按自习室ID查询' : '查询并显示所有自习室信息' }}</p>
    </div>

    <div class="stats-container" v-if="rooms.length > 0">
      <div class="stats">
        <span class="stat-item">总自习室数: {{ rooms.length }}</span>
        <span class="stat-item">当前页: {{ currentPage }}/{{ totalPages }}</span>
        <span class="stat-item">每页: {{ pageSize }} 条</span>
      </div>
    </div>

    <div class="content" v-if="rooms.length > 0">
      <el-table
        :data="paginatedRooms"
        stripe
        style="width: 100%"
        border
        v-loading="loading"
      >
        <el-table-column
          prop="roomId"
          label="自习室ID"
          width="100"
          align="center"
        />
        <el-table-column
          prop="roomName"
          label="自习室名称"
          min-width="75"
        />
        <el-table-column
          prop="ownerId"
          label="房主ID"
          width="90"
          align="center"
        />
        <el-table-column
          prop="maxUser"
          label="最大人数"
          width="100"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.maxUser }} 人</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tag :type="formatStatus(scope.row.status).type" size="small">
              {{ formatStatus(scope.row.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="255"
        >
          <template #default="scope">
            <span>{{ scope.row.createTime || 'N/A' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120"
          align="center"
        >
          <template #default="scope">
            <el-dropdown
              @command="(command) => handleDropdownCommand(command, scope.row.roomId)"
              size="small"
            >
              <el-button type="primary" size="small">
                操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete" style="color: #f56c6c;">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="rooms.length"
          @size-change="pageSize = $event"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <div class="empty-state" v-else-if="!loading">
      <p>点击上方按钮查询自习室列表</p>
    </div>
  </main>
</template>

<style scoped>
.room-query-view {
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

.search-area {
  display: flex;
  align-items: center;
  gap: 8px;
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
