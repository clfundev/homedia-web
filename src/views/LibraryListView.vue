<script setup lang="ts">
import { libraryApi } from '@/api/api'
import AddLibraryDialog from '@/components/AddLibraryDialog.vue'
import MyPage from '@/components/MyPage.vue'
import type { Library, ScanningStatus } from '@/models/models'
import { Plus, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref<boolean>(true)
const libraries = ref<Library[]>([])
const showAddLibraryDialog = ref<boolean>(false)
const scanningStatus = ref<ScanningStatus | null>(null)
let ws: WebSocket | null = null

function goToLibrary(library: Library) {
  if (library.type === 'VIDEO') {
    router.push({ name: 'VideoLibrary', params: { libraryId: library.id } })
  } else if (library.type === 'AUDIO') {
    router.push({ name: 'MusicLibrary', params: { libraryId: library.id } })
  } else {
    router.push({ name: 'PhotoLibrary', params: { libraryId: library.id } })
  }
}

async function fetchLibraries() {
  loading.value = true
  try {
    const resp = await libraryApi.getLibraries()
    libraries.value = resp.data
  } catch (error) {
    ElMessage.error(`getLibraries error: ${error}`)
  } finally {
    loading.value = false
  }
}

async function scanAllLibraries() {
  try {
    await libraryApi.scanAllLibraries()
  } catch (error) {
    ElMessage.error(`scanAllLibraries error: ${error}`)
  }
}

function getCoverUrl(library: Library) {
  return `${import.meta.env.VITE_BASE_URL}/libraries/${library.id}/cover`
}

function connectWebSocket() {
  const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/scanning`
  console.log(`connect ${wsUrl}`)
  ws = new WebSocket(wsUrl)
  ws.onopen = () => {
    console.log(`${wsUrl} connected`)
  }
  ws.onmessage = (event) => {
    const newStatus = JSON.parse(event.data)
    if (scanningStatus.value?.scanning && !newStatus.scanning) {
      // 扫描终止，刷新媒体库列表
      console.log('refresh libraries after scan completed')
      fetchLibraries()
    }
    scanningStatus.value = newStatus
  }
  ws.onclose = () => {
    console.log(`${wsUrl} disconnected`)
  }
}

function disconnectWebSocket() {
  ws?.close()
}

function formatProgress(percentage: number) {
  return `Scanning...${percentage}%`
}

onMounted(() => {
  fetchLibraries()
  connectWebSocket()
})

onBeforeUnmount(() => {
  disconnectWebSocket()
})
</script>

<template>
  <MyPage title="Libraries" :show-back="false">
    <div class="content">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="showAddLibraryDialog = true">
          Add Library
        </el-button>
        <el-button :icon="RefreshRight" @click="scanAllLibraries">Scan All Libraries</el-button>
        <el-progress
          v-if="scanningStatus?.scanning"
          :percentage="scanningStatus.progress"
          :format="formatProgress"
          style="width: 200px"
        />
      </div>

      <div class="grid" v-loading="loading">
        <el-row :gutter="10" style="width: 100%; row-gap: 10px">
          <el-col
            v-for="library in libraries"
            :key="library.id"
            :xs="12"
            :sm="8"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <el-card
              class="card-item"
              shadow="hover"
              :body-style="{ padding: 0 }"
              @click="goToLibrary(library)"
            >
              <el-image
                style="width: 100%; aspect-ratio: 16/9"
                :src="getCoverUrl(library)"
                :fit="'cover'"
                lazy
              />
              <div class="card-footer">
                <el-text truncated>{{ library.title }}</el-text>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <AddLibraryDialog v-model="showAddLibraryDialog" />
  </MyPage>
</template>

<style scoped>
.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.toolbar {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.el-button {
  margin: 0;
}

.grid {
  width: 100%;
  flex: 1;
  overflow: auto;
}

.card-item {
  cursor: pointer;
  border-radius: 12px;
}

.card-footer {
  padding: 2px 8px;
}
</style>
