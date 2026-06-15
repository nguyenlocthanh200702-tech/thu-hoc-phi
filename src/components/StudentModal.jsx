import { useState, useEffect } from 'react'
import { getCurrentDateUTC7, formatDateForInput, getMainSchoolClasses } from '../utils/helpers'

export default function StudentModal({ isOpen, student: editingStudent, classes = [], onClose, onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState({ name: '', class_id: '', start_date: '', school_grade: '6', main_school_class: '', school_name: '' })
  const [error, setError] = useState('')
  const mainSchoolClasses = getMainSchoolClasses()

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name,
        class_id: editingStudent.class_id,
        start_date: formatDateForInput(editingStudent.start_date) || '',
        school_grade: editingStudent.school_grade || '6',
        main_school_class: editingStudent.main_school_class || '',
        school_name: editingStudent.school_name || 'Chu Văn An'
      })
    } else {
      setFormData({ name: '', class_id: '', start_date: getCurrentDateUTC7(), school_grade: '6', main_school_class: '', school_name: 'Chu Văn An' })
    }
    setError('')
  }, [editingStudent, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Tên học sinh là bắt buộc')
      return
    }

    if (!formData.class_id) {
      setError('Vui lòng chọn lớp')
      return
    }

    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {editingStudent ? 'Sửa học sinh' : 'Thêm học sinh'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên học sinh
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lớp học
            </label>
            <select
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            >
              <option value="">Chọn lớp...</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Mặc định: hôm nay (UTC+7)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khối lớp (Trường cấp II)
            </label>
            <select
              value={formData.school_grade}
              onChange={(e) => setFormData({ ...formData, school_grade: e.target.value, main_school_class: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            >
              <option value="6">Khối 6</option>
              <option value="7">Khối 7</option>
              <option value="8">Khối 8</option>
              <option value="9">Khối 9</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lớp ở trường
            </label>
            <select
              value={formData.main_school_class}
              onChange={(e) => setFormData({ ...formData, main_school_class: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            >
              <option value="">Chọn lớp...</option>
              {mainSchoolClasses[formData.school_grade]?.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {formData.main_school_class === 'Trường khác' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trường học
              </label>
              <input
                type="text"
                value={formData.school_name}
                onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                placeholder="Ví dụ: Trường THCS Lê Qúy Đôn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
            </div>
          )}

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
