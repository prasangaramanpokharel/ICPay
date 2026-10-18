export type FileCategory = 'all' | 'images' | 'documents' | 'media' | 'archives' | 'code'

export function pathExtension(path: string): string {
  const clean = path.split('?')[0].split('#')[0]
  const lastSlash = clean.lastIndexOf('/')
  const base = lastSlash >= 0 ? clean.slice(lastSlash + 1) : clean
  const lastDot = base.lastIndexOf('.')
  return lastDot > 0 ? base.slice(lastDot + 1) : ''
}

export function getFileCategory(contentType = '', path = ''): FileCategory {
  const ext = path ? pathExtension(path).toLowerCase() : ''
  const type = contentType.toLowerCase()

  if (
    type.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'ico', 'bmp', 'tiff', 'heic'].includes(ext)
  ) {
    return 'images'
  }

  if (
    type.startsWith('video/') ||
    type.startsWith('audio/') ||
    ['mp4', 'webm', 'mov', 'avi', 'mkv', 'mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)
  ) {
    return 'media'
  }

  if (
    type.includes('pdf') ||
    type.includes('word') ||
    type.includes('officedocument') ||
    type.includes('document') ||
    type.includes('sheet') ||
    type.includes('presentation') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt', 'md', 'rtf', 'odt', 'ods'].includes(ext)
  ) {
    return 'documents'
  }

  if (
    type.includes('zip') ||
    type.includes('tar') ||
    type.includes('compressed') ||
    type.includes('archive') ||
    ['zip', 'tar', 'gz', 'bz2', '7z', 'rar', 'xz'].includes(ext)
  ) {
    return 'archives'
  }

  if (
    type.includes('javascript') ||
    type.includes('typescript') ||
    type.includes('json') ||
    type.includes('html') ||
    type.includes('css') ||
    type.includes('xml') ||
    ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'scss', 'py', 'rs', 'mo', 'go', 'java', 'c', 'cpp', 'sh', 'sql', 'yaml', 'yml'].includes(ext)
  ) {
    return 'code'
  }

  return 'documents'
}

export function getFileBadge(contentType = '', path = ''): string {
  const ext = path ? pathExtension(path).toUpperCase() : ''
  if (ext) return ext.slice(0, 5)
  if (contentType.includes('json')) return 'JSON'
  if (contentType.includes('pdf')) return 'PDF'
  if (contentType.includes('zip')) return 'ZIP'
  if (contentType.includes('image/')) return contentType.split('/')[1]?.toUpperCase().slice(0, 5) || 'IMG'
  return 'FILE'
}

export function formatFileDate(createdAtNs: bigint | undefined): string {
  if (!createdAtNs) return ''
  const ms = Number(createdAtNs / 1_000_000n)
  const diff = Date.now() - ms
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min}m ago`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
