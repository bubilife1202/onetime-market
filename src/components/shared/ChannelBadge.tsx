'use client'

import { getChannelLabel, getChannelColor, getChannelEmoji } from '@/lib/channel'

interface ChannelBadgeProps {
  channel: string
  showEmoji?: boolean
  size?: 'sm' | 'md'
}

export default function ChannelBadge({ channel, showEmoji = true, size = 'sm' }: ChannelBadgeProps) {
  const label = getChannelLabel(channel)
  const color = getChannelColor(channel)
  const emoji = getChannelEmoji(channel)

  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${color} ${sizeClass}`}>
      {showEmoji && <span>{emoji}</span>}
      {label}
    </span>
  )
}
