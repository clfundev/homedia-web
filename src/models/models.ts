export interface Video {
  id: string
  title: string
  fileSize: string
  filePath: string
  lastModified: string
  isStandard: boolean
  durationSeconds: number
  width: number
  height: number
  videoCodec: string
  audioCodec: string
  totalBitRate?: number
  videoBitRate?: number
  audioBitRate?: number
  videoStreamIndex?: number
  audioStreamIndex?: number
  realFrameRate?: number
  averageFrameRate?: number
}

export type LibraryType = 'VIDEO' | 'AUDIO' | 'IMAGE'

export interface Library {
  id: string
  title: string
  type: LibraryType
  path: string
}

export interface AddLibraryRequest {
  title: string
  type: LibraryType
  path: string
}

export interface Dir {
  name: string
  path: string
  parentPath?: string
  children: File[]
}

export interface File {
  name: string
  path: string
  type: 'dir' | 'file'
}

export interface StandardizationProgress {
  videoId: string
  progress: number
}

export interface ScanningStatus {
  scanning: boolean
  progress: number
}
