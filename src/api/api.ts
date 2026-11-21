import type { AddLibraryRequest, Dir, Library, Video } from '@/models/models'
import { http } from '@/utils/http'

export const videoApi = {
  getVideo(videoId: string) {
    return http<Video>({
      method: 'GET',
      url: `/videos/${videoId}`,
    })
  },
  standardize(videoId: string) {
    return http({
      method: 'POST',
      url: `/videos/${videoId}/standardize`,
    })
  },
}

export const playSessionApi = {
  pingPlaySession(playSessionId: string) {
    return http({
      method: 'POST',
      url: `/session/ping`,
      params: { playSessionId },
    })
  },
  closePlaySession(playSessionId: string) {
    return http({
      method: 'POST',
      url: `/session/close`,
      params: { playSessionId },
    })
  },
}

export const libraryApi = {
  getLibraries() {
    return http<Library[]>({
      method: 'GET',
      url: `/libraries`,
    })
  },
  getLibraryVideos(libraryId: string) {
    return http<Video[]>({
      method: 'GET',
      url: `/libraries/${libraryId}/videos`,
    })
  },
  addLibrary(addLibraryRequest: AddLibraryRequest) {
    return http({
      method: 'POST',
      url: `/libraries/add`,
      data: addLibraryRequest,
    })
  },
  scanAllLibraries() {
    return http({
      method: 'POST',
      url: `/libraries/scan`,
    })
  },
}

export const fileSystemApi = {
  getDirectory(path: string) {
    return http<Dir>({
      method: 'GET',
      url: `/fs/dir`,
      params: { path },
    })
  },
}
