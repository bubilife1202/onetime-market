'use client'

import { getChannelLabel, getChannelEmoji } from '@/lib/channel'

interface ChannelData {
  channel: string
  count: number
  percentage: number
}

interface ChannelChartProps {
  data: ChannelData[]
}

const barColors: Record<string, string> = {
  KAKAO: 'bg-yellow-400',
  INSTAGRAM: 'bg-pink-400',
  NAVER: 'bg-green-400',
  DIRECT: 'bg-blue-400',
}

export default function ChannelChart({ data }: ChannelChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">유입 채널 분석</h3>
        <p className="text-sm text-gray-400 text-center py-8">아직 데이터가 없습니다</p>
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">유입 채널 분석</h3>

      {/* Donut-style bar */}
      <div className="flex h-4 rounded-full overflow-hidden mb-5">
        {data.map((d) => (
          <div
            key={d.channel}
            className={`${barColors[d.channel] || 'bg-gray-400'} transition-all duration-500`}
            style={{ width: `${d.percentage}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.channel} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${barColors[d.channel] || 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {getChannelEmoji(d.channel)} {getChannelLabel(d.channel)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">{d.count}건</span>
              <span className="text-sm text-gray-400 w-12 text-right">{d.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">총 주문</span>
          <span className="font-semibold text-gray-900">{total}건</span>
        </div>
      </div>
    </div>
  )
}
