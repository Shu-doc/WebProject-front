<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElCard,
  ElSelect,
  ElOption
} from 'element-plus'
import { getRoom, updateRoom } from '../api/room'

interface Room {
  roomId: number
  roomName: string
  ownerId: number       // 房主ID
  maxUser: number       // 最大允许人数
  status: number        // 0=私密, 1=公开
  createTime: string
  roomPassword: string  // 私密房间密码
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const room = ref<Room>({
  roomId: 0,
  roomName: '',
  ownerId: 0,
  maxUser: 10,
  status: 1,  // 默认公开
  createTime: '',
  roomPassword: ''
})

// 状态选项（0=私密, 1=公开）
const statusOptions = [
  { value: 1, label: '公开' },
  { value: 0, label: '私密' }
]

// 获取自习室ID
const roomId = computed(() => {
  const id = route.params.roomId
  return id ? Number(id) : 0
})

// 获取查询参数中的搜索条件
const searchQuery = computed(() => {
  return route.query.search as string || ''
})

// 加载自习室数据
const loadRoom = async () => {
  loading.value = true
  try {
    if (roomId.value > 0) {
      const response = await getRoom(roomId.value)

      if (response.data) {
        // 检查响应格式
        if (typeof response.data === 'object' && 'code' in response.data) {
          // 格式: {code: 200, data: {...}, message: '...'}
          if (response.data.code === 200 && response.data.data) {
            room.value = { ...response.data.data }
            ElMessage.success(`已加载自习室: ${room.value.roomName}`)
          } else {
            ElMessage.warning(`未找到自习室ID: ${roomId.value}`)
            // 清空表单
            resetForm()
          }
        } else {
          // 格式: 直接返回自习室对象
          room.value = { ...response.data }
          ElMessage.success(`已加载自习室: ${room.value.roomName}`)
        }
      } else {
        ElMessage.warning(`未找到自习室ID: ${roomId.value}`)
        // 清空表单
        resetForm()
      }
    } else {
      // 新建自习室，清空表单
      resetForm()
    }
  } catch (error: any) {
    console.error('加载自习室失败:', error)

    if (error.response) {
      // 服务器响应了，但状态码不在 2xx 范围
      ElMessage.error(`加载失败: ${error.response.status} ${error.response.statusText}`)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else {
      // 请求配置出错
      ElMessage.error(`加载配置错误: ${error.message}`)
    }
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  room.value = {
    roomId: 0,
    roomName: '',
    ownerId: 0,
    maxUser: 10,
    status: 1,  // 默认公开
    createTime: '',
    roomPassword: ''
  }
}

// 保存自习室
const saveRoom = async () => {
  // 表单验证
  if (!room.value.roomName.trim()) {
    ElMessage.warning('请输入自习室名称')
    return
  }
  if (room.value.maxUser <= 0) {
    ElMessage.warning('最大人数必须大于0')
    return
  }

  saving.value = true
  try {
    if (roomId.value > 0) {
      // 更新现有自习室
      const response = await updateRoom(roomId.value, room.value)
      if (response.data.code === 200) {
        ElMessage.success('自习室信息已保存')
        // 保存成功后返回查询页面，保持之前的搜索条件
        setTimeout(() => {
          goBack()
        }, 800) // 延迟800ms让用户看到保存成功的消息
      } else {
        ElMessage.error('保存失败')
      }
    } else {
      // 创建新自习室（应该使用RoomAddView，这里不应该被调用）
      ElMessage.warning('请使用"新增自习室"功能创建新自习室')
    }
  } catch (error: any) {
    console.error('保存自习室失败:', error)

    if (error.response) {
      // 服务器响应了，但状态码不在 2xx 范围
      ElMessage.error(`保存失败: ${error.response.status} ${error.response.statusText}`)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else {
      // 请求配置出错
      ElMessage.error(`保存配置错误: ${error.message}`)
    }
  } finally {
    saving.value = false
  }
}

// 返回自习室列表
const goBack = () => {
  // 返回自习室查询页面，并传递之前的搜索条件
  router.push({
    path: '/RoomQuery',
    query: {
      search: searchQuery.value
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadRoom()
})
</script>

<template>
  <main class="room-edit-view">
    <ElCard class="edit-card">
      <template #header>
        <div class="card-header">
          <span>{{ roomId ? '编辑自习室' : '新建自习室' }}</span>
          <div class="header-actions">
            <ElButton @click="goBack">返回列表</ElButton>
          </div>
        </div>
      </template>

      <ElForm
        :model="room"
        label-width="100px"
        class="room-form"
        v-loading="loading"
      >
        <ElFormItem label="自习室ID">
          <ElInput
            v-model="room.roomId"
            disabled
            placeholder="自动生成"
          />
        </ElFormItem>

        <ElFormItem label="自习室名称" required>
          <ElInput
            v-model="room.roomName"
            placeholder="请输入自习室名称"
            clearable
          />
        </ElFormItem>

        <ElFormItem label="最大人数" required>
          <ElInput
            v-model="room.maxUser"
            type="number"
            min="1"
            placeholder="请输入最大允许人数"
            clearable
          />
        </ElFormItem>

        <ElFormItem label="房主ID">
          <ElInput
            v-model="room.ownerId"
            type="number"
            min="1"
            placeholder="请输入房主ID"
            clearable
          />
        </ElFormItem>

        <ElFormItem label="状态">
          <ElSelect v-model="room.status" placeholder="请选择状态" style="width: 100%">
            <ElOption
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="房间密码">
          <ElInput
            v-model="room.roomPassword"
            type="password"
            placeholder="私密房间需设置密码"
            clearable
            show-password
          />
        </ElFormItem>

        <ElFormItem>
          <ElButton
            type="primary"
            @click="saveRoom"
            :loading="saving"
          >
            保存
          </ElButton>
          <ElButton @click="goBack" style="margin-left: 12px;">
            取消
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </main>
</template>

<style scoped>
.room-edit-view {
  padding: 20px;
}

.edit-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: 600;
}

.room-form {
  padding: 20px 0;
}
</style>