<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  User,
  Clock,
  Calendar,
  Star,
  TrendCharts,
  PieChart,
  Bell,
  Monitor,
  Cloudy,
  Check,
  Warning
} from '@element-plus/icons-vue'

// 数据统计卡片数据
const stats = ref([
  { title: '今日在线用户', value: '156', icon: User, color: '#409EFF', change: '+12%' },
  { title: '自习室使用率', value: '78%', icon: Clock, color: '#67C23A', change: '+5%' },
  { title: '今日预约数', value: '42', icon: Calendar, color: '#E6A23C', change: '+8%' },
  { title: '用户满意度', value: '4.8', icon: Star, color: '#F56C6C', change: '+0.2' }
])

// 使用趋势数据（模拟最近7天）
const trendData = ref({
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  data: [120, 135, 145, 156, 142, 168, 175]
})

// 用户分布数据
const userDistribution = ref([
  { name: '学生', value: 65, color: '#409EFF' },
  { name: '上班族', value: 25, color: '#67C23A' },
  { name: '自由职业者', value: 10, color: '#E6A23C' }
])

// 最近活动数据
const recentActivities = ref([
  { id: 1, user: '张三', action: '预约了自习室A', time: '10分钟前', type: 'success' },
  { id: 2, user: '李四', action: '完成了3小时自习', time: '30分钟前', type: 'info' },
  { id: 3, user: '王五', action: '取消了预约', time: '1小时前', type: 'warning' },
  { id: 4, user: '赵六', action: '提交了反馈', time: '2小时前', type: 'success' },
  { id: 5, user: '孙七', action: '续费了会员', time: '3小时前', type: 'success' }
])

// 系统状态数据
const systemStatus = ref([
  { name: 'Web服务器', status: '正常', icon: Monitor, color: '#67C23A' },
  { name: '数据库', status: '正常', icon: Cloudy, color: '#67C23A' },
  { name: '文件存储', status: '警告', icon: Warning, color: '#E6A23C' },
  { name: 'API服务', status: '正常', icon: Check, color: '#67C23A' }
])

// 当前时间
const currentTime = ref('')

// 格式化时间函数
const formatTime = () => {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

// 更新时间
const updateTime = () => {
  currentTime.value = formatTime()
}

let timer = null
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="home-container">
    <!-- 欢迎标题 -->
    <div class="welcome-section">
      <h1>欢迎回来，管理员！</h1>
      <p class="welcome-subtitle">今天是 {{ currentTime }}，以下是系统概览</p>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-grid">
      <el-card v-for="(stat, index) in stats" :key="index" class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <el-icon :size="24">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-title">{{ stat.title }}</div>
          </div>
          <div class="stat-change" :style="{ color: stat.change.startsWith('+') ? '#67C23A' : '#F56C6C' }">
            {{ stat.change }}
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><TrendCharts /></el-icon>
                <span>自习室使用趋势（最近7天）</span>
              </div>
            </template>
            <div class="chart-container">
              <!-- 这里可以使用ECharts等图表库，这里用模拟样式 -->
              <div class="mock-chart">
                <div class="chart-bars">
                  <div
                    v-for="(value, index) in trendData.data"
                    :key="index"
                    class="chart-bar"
                    :style="{ height: (value / 200 * 100) + '%' }"
                    :title="`${trendData.labels[index]}: ${value}人`"
                  >
                    <span class="bar-value">{{ value }}</span>
                  </div>
                </div>
                <div class="chart-labels">
                  <span v-for="label in trendData.labels" :key="label">{{ label }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><PieChart /></el-icon>
                <span>用户群体分布</span>
              </div>
            </template>
            <div class="chart-container">
              <!-- 饼图模拟 -->
              <div class="mock-pie-chart">
                <div class="pie-chart-visual">
                  <div class="pie-segment" :style="{ '--segment-size': '65%', '--segment-color': '#409EFF' }"></div>
                  <div class="pie-segment" :style="{ '--segment-size': '25%', '--segment-color': '#67C23A' }"></div>
                  <div class="pie-segment" :style="{ '--segment-size': '10%', '--segment-color': '#E6A23C' }"></div>
                </div>
                <div class="pie-legend">
                  <div v-for="item in userDistribution" :key="item.name" class="legend-item">
                    <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                    <span class="legend-text">{{ item.name }}: {{ item.value }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近活动 & 系统状态 -->
    <div class="bottom-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="activity-card" shadow="hover">
            <template #header>
              <div class="activity-header">
                <el-icon><Bell /></el-icon>
                <span>最近活动</span>
              </div>
            </template>
            <div class="activity-list">
              <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div class="activity-content">
                  <div class="activity-user">{{ activity.user }}</div>
                  <div class="activity-action">{{ activity.action }}</div>
                </div>
                <div class="activity-time">
                  <el-tag :type="activity.type" size="small">{{ activity.time }}</el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="status-card" shadow="hover">
            <template #header>
              <div class="status-header">
                <el-icon><Monitor /></el-icon>
                <span>系统状态</span>
              </div>
            </template>
            <div class="status-list">
              <div v-for="status in systemStatus" :key="status.name" class="status-item">
                <div class="status-info">
                  <el-icon :size="20" :color="status.color">
                    <component :is="status.icon" />
                  </el-icon>
                  <span class="status-name">{{ status.name }}</span>
                </div>
                <el-tag :type="status.status === '正常' ? 'success' : 'warning'" effect="plain">
                  {{ status.status }}
                </el-tag>
              </div>
            </div>
            <div class="status-summary">
              <div class="summary-item">
                <span class="summary-label">系统运行时间</span>
                <span class="summary-value">15天 8小时 32分钟</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">最后检查时间</span>
                <span class="summary-value">{{ currentTime }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 30px;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 数据统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.stat-change {
  font-size: 14px;
  font-weight: 500;
}

/* 图表区域样式 */
.charts-section {
  margin-bottom: 30px;
}

.chart-card {
  border-radius: 12px;
  height: 100%;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #303133;
}

.chart-container {
  height: 250px;
  padding: 20px 0;
}

/* 模拟柱状图 */
.mock-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 0 20px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #409EFF, #79BBFF);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 20px;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  opacity: 0.8;
}

.bar-value {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  border-top: 1px solid #E4E7ED;
  margin-top: 10px;
}

.chart-labels span {
  font-size: 12px;
  color: #909399;
}

/* 模拟饼图 */
.mock-pie-chart {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 40px;
}

.pie-chart-visual {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    var(--segment-color, #409EFF) 0% var(--segment-size, 0%),
    transparent var(--segment-size, 0%) 100%
  );
  position: relative;
  flex-shrink: 0;
}

.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    var(--segment-color) 0% var(--segment-size),
    transparent var(--segment-size) 100%
  );
  clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
}

.pie-segment:nth-child(1) {
  --segment-size: 65%;
  --segment-color: #409EFF;
}

.pie-segment:nth-child(2) {
  --segment-size: 90%;
  --segment-color: #67C23A;
  clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
  transform: rotate(calc(65% * 3.6deg));
}

.pie-segment:nth-child(3) {
  --segment-size: 100%;
  --segment-color: #E6A23C;
  clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
  transform: rotate(calc(90% * 3.6deg));
}

.pie-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-text {
  font-size: 14px;
  color: #606266;
}

/* 底部区域样式 */
.bottom-section {
  margin-bottom: 20px;
}

.activity-card,
.status-card {
  border-radius: 12px;
  height: 100%;
}

.activity-header,
.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #303133;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #F2F6FC;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-content {
  flex: 1;
}

.activity-user {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.activity-action {
  font-size: 12px;
  color: #606266;
}

.activity-time {
  flex-shrink: 0;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-name {
  font-size: 14px;
  color: #303133;
}

.status-summary {
  border-top: 1px solid #F2F6FC;
  padding-top: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-size: 14px;
  color: #606266;
}

.summary-value {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-section .el-col,
  .bottom-section .el-col {
    width: 100%;
  }
}
</style>
