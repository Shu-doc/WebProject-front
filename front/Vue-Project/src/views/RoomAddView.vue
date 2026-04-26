<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
import { addRoom } from '../api/room'

interface Room {
  roomId: number
  roomName: string
  ownerId: number       // 房主ID
  maxUser: number       // 最大允许人数
  status: number        // 0=私密, 1=公开
  createTime: string
  roomPassword: string  // 私密房间密码
}

// 用于新增自习室的数据接口
interface AddRoomData {
  roomName: string
  ownerId: number
  maxUser: number
  status: number
  roomPassword?: string
}

const router = useRouter()
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
    // 准备提交数据（ID由后端数据库自动生成）
    const submitData: AddRoomData = {
      roomName: room.value.roomName.trim(),
      ownerId: room.value.ownerId,
      maxUser: room.value.maxUser,
      status: room.value.status,
      roomPassword: room.value.roomPassword.trim() || undefined
    }

    // 调用新增自习室接口
    const response = await addRoom(submitData)
    if (response.data.code === 200) {
      ElMessage.success('自习室添加成功')
      // 成功后返回自习室查询页面
      setTimeout(() => {
        goBack()
      }, 800)
    } else {
      ElMessage.error(`添加失败: ${response.data.message || '未知错误'}`)
    }
  } catch (error: any) {
    console.error('添加自习室失败:', error)

    if (error.response) {
      // 服务器响应了，但状态码不在 2xx 范围
      ElMessage.error(`添加失败: ${error.response.status} ${error.response.statusText}`)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else {
      // 请求配置出错
      ElMessage.error(`添加配置错误: ${error.message}`)
    }
  } finally {
    saving.value = false
  }
}

// 返回自习室列表
const goBack = () => {
  router.push('/RoomQuery')
}
</script>

<template>
  <main class="room-add-view">
    <ElCard class="add-card">
      <template #header>
        <div class="card-header">
          <span>新增自习室</span>
          <div class="header-actions">
            <ElButton @click="goBack">返回列表</ElButton>
          </div>
        </div>
      </template>

      <ElForm
        :model="room"
        label-width="100px"
        class="room-form"
      >
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
            确认添加
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
.room-add-view {
  padding: 20px;
}

.add-card {
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