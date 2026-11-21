<script setup lang="ts">
import { libraryApi, videoApi } from '@/api/api'
import MyPage from '@/components/MyPage.vue'
import type { StandardizationProgress, Video } from '@/models/models'
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()

const router = useRouter()

const loading = ref<boolean>(true)

const videos = ref<Video[]>([])

const progresses = ref<StandardizationProgress[]>([])

const layout = ref<'grid' | 'list'>('grid')

let ws: WebSocket | null = null

function goToVideo(video: Video) {
  router.push({ name: 'Video', params: { videoId: video.id } })
}

function goBack() {
  router.back()
}

async function fetchLibraryVideos() {
  loading.value = true
  try {
    const resp = await libraryApi.getLibraryVideos(route.params.libraryId as string)
    videos.value = resp.data
  } catch (error) {
    ElMessage.error(`getLibraryVideos error: ${error}`)
  } finally {
    loading.value = false
  }
}

function standardize(video: Video) {
  videoApi.standardize(video.id).catch((error) => {
    ElMessage.error(`standardize error: ${error}`)
  })
}

function getCoverUrl(video: Video) {
  return `${import.meta.env.VITE_BASE_URL}/videos/${video.id}/cover`
}

function connectWebSocket() {
  const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/standardization`
  console.log(`connect ${wsUrl}`)
  ws = new WebSocket(wsUrl)
  ws.onopen = () => {
    console.log(`${wsUrl} connected`)
  }
  ws.onmessage = (event) => {
    progresses.value = JSON.parse(event.data)
  }
  ws.onclose = () => {
    console.log(`${wsUrl} disconnected`)
  }
}

function disconnectWebSocket() {
  ws?.close()
}

onMounted(() => {
  fetchLibraryVideos()
  connectWebSocket()
})

onBeforeUnmount(() => {
  disconnectWebSocket()
})
</script>

<template>
  <MyPage title="Video Library" :show-back="true" @back="goBack">
    <div v-loading="loading" class="content">
      <el-radio-group v-model="layout">
        <el-radio-button label="Grid" value="grid" />
        <el-radio-button label="List" value="list" />
      </el-radio-group>

      <el-table
        v-if="layout === 'list'"
        class="list"
        :data="videos"
        :show-overflow-tooltip="true"
        :default-sort="{ prop: 'title', order: 'ascending' }"
      >
        <el-table-column prop="title" label="Title" width="150" />
        <el-table-column label="Detail" min-width="150">
          <template #default="{ row }">
            <span>{{ JSON.stringify(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Operation" width="150">
          <template #default="{ row }">
            <el-button
              v-if="progresses.find((p) => p.videoId === row.id) === undefined"
              type="primary"
              size="small"
              :disabled="row.isStandard"
              @click="standardize(row)"
            >
              Standardize
            </el-button>
            <el-progress
              v-else
              :percentage="progresses.find((p) => p.videoId === row.id)?.progress"
            />
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="grid">
        <el-row :gutter="10" style="width: 100%; row-gap: 10px">
          <el-col v-for="video in videos" :key="video.id" :xs="12" :sm="8" :md="8" :lg="6" :xl="4">
            <el-card
              class="card-item"
              shadow="hover"
              :body-style="{ padding: 0 }"
              @click="goToVideo(video)"
            >
              <el-image
                style="width: 100%; aspect-ratio: 16/9"
                :src="getCoverUrl(video)"
                :fit="'cover'"
                lazy
              />
              <div class="card-footer">
                <el-text truncated>{{ video.title }}</el-text>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </MyPage>
</template>

<style scoped>
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.grid {
  width: 100%;
  flex: 1;
  overflow: auto;
}

.list {
  width: 100%;
  flex: 1;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
}

.card-item {
  cursor: pointer;
  border-radius: 12px;
}

.card-footer {
  padding: 2px 8px;
}
</style>
