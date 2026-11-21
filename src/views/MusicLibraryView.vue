<script setup lang="ts">
import MyPage from '@/components/MyPage.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goToMusic() {}

function goBack() {
  router.back()
}
</script>

<template>
  <MyPage title="Music Library" :show-back="true" @back="goBack">
    <p>Nothing</p>
  </MyPage>
</template>
