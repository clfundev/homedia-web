<script setup lang="ts">
import { Back } from '@element-plus/icons-vue'

const props = defineProps({
  // 标题
  title: {
    type: String,
    default: 'Title',
  },
  // 是否显示返回按钮
  showBack: {
    type: Boolean,
    default: true,
  },
})

// 定义返回按钮点击事件
const emit = defineEmits(['back'])
</script>

<template>
  <el-container class="container">
    <el-header class="header">
      <el-button v-if="showBack" circle text class="back-btn" @click="emit('back')">
        <el-icon :size="24"><Back /></el-icon>
      </el-button>
      <span class="title">{{ title }}</span>
    </el-header>
    <el-main class="content">
      <slot></slot>
    </el-main>
  </el-container>
</template>

<style scoped>
.container {
  height: 100%;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center; /* 子元素垂直居中 */
  gap: 12px; /* 子元素间距 */
}

.back-btn {
  color: var(--el-text-color-primary); /* 图标颜色 */
}

.title {
  flex: 1;
  font-size: 20px;
  font-weight: 480;
  color: var(--el-text-color-primary);

  /* 禁止文字换行，超出截断显示省略号 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.content {
  padding-top: 4px;
}
</style>
