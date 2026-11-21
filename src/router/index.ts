import LibraryListView from '@/views/LibraryListView.vue'
import MusicLibraryView from '@/views/MusicLibraryView.vue'
import MusicView from '@/views/MusicView.vue'
import PhotoLibraryView from '@/views/PhotoLibraryView.vue'
import PhotoView from '@/views/PhotoView.vue'
import VideoLibraryView from '@/views/VideoLibraryView.vue'
import VideoView from '@/views/VideoView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/libraries',
    },
    {
      path: '/libraries',
      name: 'LibraryList',
      component: LibraryListView,
    },
    {
      path: '/libraries/:libraryId/videos',
      name: 'VideoLibrary',
      component: VideoLibraryView,
      props: true,
    },
    {
      path: '/libraries/:libraryId/music',
      name: 'MusicLibrary',
      component: MusicLibraryView,
      props: true,
    },
    {
      path: '/libraries/:libraryId/photos',
      name: 'PhotoLibrary',
      component: PhotoLibraryView,
      props: true,
    },
    {
      path: '/videos/:videoId',
      name: 'Video',
      component: VideoView,
      props: true,
    },
    {
      path: '/music/:musicId',
      name: 'Music',
      component: MusicView,
      props: true,
    },
    {
      path: '/photos/:photoId',
      name: 'Photo',
      component: PhotoView,
      props: true,
    },
  ],
})

export default router
