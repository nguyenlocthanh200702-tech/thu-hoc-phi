export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Đang tải...</p>
      </div>
    </div>
  )
}
