<script setup lang="ts">
import { playSessionApi, videoApi } from '@/api/api'
import MyPage from '@/components/MyPage.vue'
import MyVideoPlayer, { type VideoSource } from '@/components/MyVideoPlayer.vue'
import type { Video } from '@/models/models'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}

interface VideoQuality {
  name: string
  maxStreamingBitRate: number
}

const PRESET_QUALITYS: VideoQuality[] = [
  { name: '120 Mbps', maxStreamingBitRate: 120000000 },
  { name: '80 Mbps', maxStreamingBitRate: 80000000 },
  { name: '60 Mbps', maxStreamingBitRate: 60000000 },
  { name: '40 Mbps', maxStreamingBitRate: 40000000 },
  { name: '20 Mbps', maxStreamingBitRate: 20000000 },
  { name: '15 Mbps', maxStreamingBitRate: 15000000 },
  { name: '10 Mbps', maxStreamingBitRate: 10000000 },
  { name: '8 Mbps', maxStreamingBitRate: 8000000 },
  { name: '6 Mbps', maxStreamingBitRate: 6000000 },
  { name: '4 Mbps', maxStreamingBitRate: 4000000 },
  { name: '3 Mbps', maxStreamingBitRate: 3000000 },
  { name: '1.5 Mbps', maxStreamingBitRate: 1500000 },
  { name: '720 kbps', maxStreamingBitRate: 720000 },
  { name: '420 kbps', maxStreamingBitRate: 420000 },
]

const route = useRoute()

const video = ref<Video | null>(null)

const playSessionId = uuidv4().replaceAll('-', '')

const qualityOptions = computed<VideoQuality[]>(() => {
  if (!video.value) return []

  const totalBitRate = video.value.totalBitRate ?? -1
  const options = []

  // 仅标准视频支持原始视频流播放
  if (video.value.isStandard) {
    options.push({ name: 'Direct', maxStreamingBitRate: -1 })
  }

  // 添加比原比特率高一档的选项
  if (totalBitRate > 0 && totalBitRate < PRESET_QUALITYS[0]!.maxStreamingBitRate) {
    const option = PRESET_QUALITYS.filter((c) => c.maxStreamingBitRate >= totalBitRate).pop()
    if (option) {
      options.push(option)
    }
  }

  // 添加所有比原比特率低的选项
  PRESET_QUALITYS.forEach((c) => {
    if (totalBitRate <= 0 || c.maxStreamingBitRate < totalBitRate) {
      options.push(c)
    }
  })

  return options
})

const selectedQualityId = ref<number | null>(null) // maxStreamingBitRate即ID，-1表示Direct画质

const selectedQuality = computed<VideoQuality | undefined>(() => {
  return qualityOptions.value.find(
    (option) => option.maxStreamingBitRate === selectedQualityId.value,
  )
})

const playerSource = computed<VideoSource | null>(() => {
  if (!video.value || !selectedQuality.value) {
    return null
  }
  const maxStreamingBitRate = selectedQuality.value.maxStreamingBitRate
  const isHls = maxStreamingBitRate > 0
  const src = isHls
    ? `${import.meta.env.VITE_BASE_URL}/videos/${video.value.id}/playlist?playSessionId=${playSessionId}&maxStreamingBitRate=${maxStreamingBitRate}`
    : `${import.meta.env.VITE_BASE_URL}/videos/${video.value.id}/stream`
  return { src: src, isHls: isHls }
})

const isHlsStreaming = computed<boolean>(() => {
  return playerSource.value?.isHls ?? false
})

let pingTimerId: number = 0

function openPlaySession() {
  pingTimerId = setInterval(() => {
    playSessionApi.pingPlaySession(playSessionId)
  }, 10000)
}

function closePlaySession() {
  clearInterval(pingTimerId)
  playSessionApi.closePlaySession(playSessionId)
}

watch(isHlsStreaming, (newValue) => {
  if (newValue) {
    openPlaySession()
  } else {
    closePlaySession()
  }
})

watch(qualityOptions, (newValue) => {
  selectedQualityId.value = newValue[0]?.maxStreamingBitRate ?? null
})

onMounted(() => {
  videoApi
    .getVideo(route.params.videoId as string)
    .then((resp) => {
      video.value = resp.data
    })
    .catch((error) => {
      ElMessage.error(`getVideoById error: ${error}`)
    })
})

onBeforeUnmount(() => {
  closePlaySession()
})
</script>

<template>
  <MyPage :title="video?.title ?? 'Video'" :show-back="true" @back="goBack">
    <div class="content">
      <el-select v-model="selectedQualityId" placeholder="Quality" style="width: 200px">
        <el-option
          v-for="item in qualityOptions"
          :key="item.maxStreamingBitRate"
          :label="item.name"
          :value="item.maxStreamingBitRate"
        />
      </el-select>
      <el-row justify="center" style="width: 100%">
        <el-col :xs="24" :sm="20" :md="20" :lg="16" :xl="16">
          <MyVideoPlayer :source="playerSource" />
        </el-col>
      </el-row>
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
  overflow: auto;
}
</style>
