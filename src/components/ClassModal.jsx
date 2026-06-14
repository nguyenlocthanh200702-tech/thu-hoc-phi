import { useState, useEffect } from 'react'

export default function ClassModal({ isOpen, class: editingClass, onClose, onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState({ name: '', monthly_fee: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingClass) {
      setFormData({
        name: editingClass.name,
        monthly_fee: editingClass.monthly_fee
      })
    } else {
      setFormData({ name: '', monthly_fee: '' })
    }
    setError('')
  }, [editingClass, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Tên lớp là bắt buộc')
      return
    }

    if (!formData.monthly_fee || formData.monthly_fee <= 0) {
      setError('Học phí phải lớn hơn 0')
      return
    }

    onSubmit({
      ...formData,
      monthly_fee: parseInt(formData.monthly_fee)
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {editingClass ? 'Sửa lớp học' : 'Thêm lớp học'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên lớp
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Lớp 6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Học phí (đ)
            </label>
            <input
              type="number"
              value={formData.monthly_fee}
              onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
              placeholder="Ví dụ: 800000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Đang xử lý...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
