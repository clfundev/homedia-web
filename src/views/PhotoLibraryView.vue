<script setup lang="ts">
import MyPage from '@/components/MyPage.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goToPhoto() {}

function goBack() {
  router.back()
}
</script>

<template>
  <MyPage title="Photo Library" :show-back="true" @back="goBack">
    <p>Nothing</p>
  </MyPage>
</template>
