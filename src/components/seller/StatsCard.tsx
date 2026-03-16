'use client'

interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  change?: string
  color?: 'blue' | 'green' | 'orange' | 'purple'
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
}

export default function StatsCard({ title, value, icon, change, color = 'blue' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${colorMap[color]}`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {change && (
        <p className="text-xs text-gray-400 mt-1">{change}</p>
      )}
    </div>
  )
}
