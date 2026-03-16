'use client'

import { formatPrice, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils'
import ChannelBadge from '@/components/shared/ChannelBadge'

interface OrderItem {
  id: string
  orderNumber: string
  buyerName: string
  totalAmount: number
  status: string
  channel: string
  createdAt: string
  items: { productName: string; quantity: number }[]
}

interface OrderTableProps {
  orders: OrderItem[]
  compact?: boolean
}

export default function OrderTable({ orders, compact = false }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-gray-400 text-sm">주문이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">주문번호</th>
            <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">구매자</th>
            {!compact && (
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">상품</th>
            )}
            <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">채널</th>
            <th className="text-right text-xs font-medium text-gray-500 px-5 py-3">금액</th>
            <th className="text-center text-xs font-medium text-gray-500 px-5 py-3">상태</th>
            {!compact && (
              <th className="text-right text-xs font-medium text-gray-500 px-5 py-3">주문일시</th>
            )}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="px-5 py-3">
                <span className="text-sm font-mono text-gray-700">{order.orderNumber}</span>
              </td>
              <td className="px-5 py-3">
                <span className="text-sm text-gray-900">{order.buyerName}</span>
              </td>
              {!compact && (
                <td className="px-5 py-3">
                  <span className="text-sm text-gray-600">
                    {order.items[0]?.productName}
                    {order.items.length > 1 && ` 외 ${order.items.length - 1}건`}
                  </span>
                </td>
              )}
              <td className="px-5 py-3">
                <ChannelBadge channel={order.channel} />
              </td>
              <td className="px-5 py-3 text-right">
                <span className="text-sm font-medium text-gray-900">{formatPrice(order.totalAmount)}</span>
              </td>
              <td className="px-5 py-3 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </td>
              {!compact && (
                <td className="px-5 py-3 text-right">
                  <span className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
