<script setup lang="ts">
import { fileSystemApi, libraryApi } from '@/api/api'
import type { Dir, File, LibraryType } from '@/models/models'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'

const loading = ref<boolean>(true)

const currentDir = ref<Dir | null>(null)

const libraryTitle = ref<string>('')

const libraryType = ref<LibraryType>('VIDEO')

interface LibraryTypeOption {
  value: LibraryType
  label: string
}

const libraryTypeOptions: LibraryTypeOption[] = [
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Music' },
  { value: 'IMAGE', label: 'Photo' },
]

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

async function fetchDirectory(path: string) {
  loading.value = true
  try {
    const resp = await fileSystemApi.getDirectory(path)
    const dir = resp.data
    if (dir.parentPath !== null && dir.parentPath !== undefined) {
      dir.children.unshift({
        name: '...',
        path: dir.parentPath,
        type: 'dir',
      })
    }
    currentDir.value = dir
  } catch (error) {
    ElMessage.error(`getDirectory error: ${error}`)
  } finally {
    loading.value = false
  }
}

function handleRowClick(row: File) {
  fetchDirectory(row.path)
}

async function handleConfirm() {
  if (!currentDir.value) {
    ElMessage.error(`Add library error: currentDir is null`)
    visible.value = false
    return
  }
  try {
    await libraryApi.addLibrary({
      title: libraryTitle.value,
      type: libraryType.value,
      path: currentDir.value.path,
    })

    // 媒体库添加后发起扫描请求
    console.log('scanAllLibraries after library added')
    libraryApi.scanAllLibraries()

    ElMessage.success(`Add library succeeded`)
    visible.value = false
  } catch (error) {
    ElMessage.error(`Add library error: ${error}`)
  }
}

onMounted(() => {
  fetchDirectory('')
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="Add Library"
    width="50%"
    align-center
    :close-on-click-modal="false"
  >
    <div class="content">
      <div>
        <span>Title</span>
        <el-input v-model="libraryTitle" style="width: 100%" />
      </div>

      <div>
        <span>Library Type</span>
        <el-select v-model="libraryType" style="width: 100%">
          <el-option
            v-for="item in libraryTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <div>
        <span>Path {{ currentDir?.path }}</span>
        <el-table
          v-loading="loading"
          :data="currentDir?.children ?? []"
          :show-header="false"
          max-height="400px"
          row-class-name="dir-row"
          @row-click="handleRowClick"
          class="table"
        >
          <el-table-column>
            <template #default="{ row }">
              <div class="dir-cell">
                <span class="dir-name">{{ row.name }}</span>
                <el-icon class="arrow">
                  <ArrowRight />
                </el-icon>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">添加</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table {
  width: 100%;
  border-radius: var(--el-border-radius-base);
  border: 1px solid var(--el-border-color);
}

.dir-cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

:deep(.dir-row) {
  cursor: pointer;
}
</style>
