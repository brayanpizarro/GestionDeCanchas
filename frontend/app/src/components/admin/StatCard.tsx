import type React from "react"
import type { StatCardProps } from "../../types"

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color, change }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 mb-1 truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value || 0}</p>
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{subtitle}</p>}
        {change && <p className="text-xs sm:text-sm text-green-600 mt-1">{change}</p>}
      </div>
      <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
    </div>
  </div>
)

export default StatCard
