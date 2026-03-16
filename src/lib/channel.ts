export function detectChannel(referer: string | null, queryChannel: string | null): string {
  if (queryChannel) return queryChannel.toUpperCase()
  if (!referer) return 'DIRECT'
  if (referer.includes('kakaotalk') || referer.includes('kakao')) return 'KAKAO'
  if (referer.includes('instagram') || referer.includes('cdninstagram')) return 'INSTAGRAM'
  if (referer.includes('naver')) return 'NAVER'
  return 'DIRECT'
}

export function getChannelLabel(channel: string): string {
  const map: Record<string, string> = {
    KAKAO: '카카오톡',
    INSTAGRAM: '인스타그램',
    NAVER: '네이버',
    DIRECT: '직접링크',
  }
  return map[channel] || channel
}

export function getChannelColor(channel: string): string {
  const map: Record<string, string> = {
    KAKAO: 'bg-yellow-100 text-yellow-800',
    INSTAGRAM: 'bg-pink-100 text-pink-800',
    NAVER: 'bg-green-100 text-green-800',
    DIRECT: 'bg-blue-100 text-blue-800',
  }
  return map[channel] || 'bg-gray-100 text-gray-800'
}

export function getChannelEmoji(channel: string): string {
  const map: Record<string, string> = {
    KAKAO: '💬',
    INSTAGRAM: '📸',
    NAVER: '🟢',
    DIRECT: '🔗',
  }
  return map[channel] || '🔗'
}
