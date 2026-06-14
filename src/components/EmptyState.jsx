export default function EmptyState({ icon = '📭', title = 'Không có dữ liệu', description = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-600 text-center">{description}</p>}
    </div>
  )
}
