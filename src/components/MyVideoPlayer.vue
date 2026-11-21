<script setup lang="ts">
import '@videojs/html/media/hlsjs-video'
import '@videojs/html/video/player'
import '@videojs/html/video/skin'

export interface VideoSource {
  src: string
  isHls: boolean
}

const props = defineProps<{
  source: VideoSource | null
}>()
</script>

<template>
  <video-player v-if="props.source?.isHls">
    <video-skin>
      <hlsjs-video :src="props.source?.src" playsinline></hlsjs-video>
    </video-skin>
  </video-player>

  <video-player v-else>
    <video-skin>
      <video :src="props.source?.src" playsinline></video>
    </video-skin>
  </video-player>
</template>

<style scoped>
video-skin {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
}
</style>
