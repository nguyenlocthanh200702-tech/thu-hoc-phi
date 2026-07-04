import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from '../hooks/useClasses'
import { useStudents } from '../hooks/useStudents'
import { useAllPayments } from '../hooks/usePayment'
import { getCurrentMonth, getCurrentYear, formatCurrency, formatDate } from '../utils/helpers'
import ClassModal from '../components/ClassModal'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LopHoc() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [modalState, setModalState] = useState({ isOpen: false, editingClass: null })

  const { data: classes = [], isLoading: classesLoading } = useClasses()
  const { data: students = [], isLoading: studentsLoading } = useStudents()
  const { data: payments = [], isLoading: paymentsLoading } = useAllPayments()
  
  const createClassMutation = useCreateClass()
  const updateClassMutation = useUpdateClass()
  const deleteClassMutation = useDeleteClass()

  if (classesLoading || studentsLoading || paymentsLoading) {
    return <LoadingSpinner />
  }

  // derive available years from payments
  const yearsSet = new Set(payments.map(p => p.year))
  yearsSet.add(getCurrentYear())
  const years = Array.from(yearsSet).sort((a, b) => b - a)

  const handleSubmit = async (formData) => {
    try {
      if (modalState.editingClass) {
        await updateClassMutation.mutateAsync({
          id: modalState.editingClass.id,
          ...formData
        })
      } else {
        await createClassMutation.mutateAsync(formData)
      }
      setModalState({ isOpen: false, editingClass: null })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (classId) => {
    if (confirm('Bạn chắc chắn muốn xóa lớp này? Hành động này không thể hoàn tác.')) {
      try {
        await deleteClassMutation.mutateAsync(classId)
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Danh sách lớp học</h1>
          <p className="text-gray-600 text-sm">{classes.length} lớp</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border rounded"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => setModalState({ isOpen: true, editingClass: null })}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            + Thêm
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {classes.map(cls => {
          const classStudents = students.filter(s => s.class_id === cls.id)
          const monthPayments = payments.filter(
            p => classStudents.some(s => s.id === p.student_id) &&
                 p.month === selectedMonth && p.year === selectedYear
          )
          const paidCount = monthPayments.filter(p => p.paid).length
          const unpaidCount = classStudents.length - paidCount
          const percent = classStudents.length > 0 
            ? Math.round((paidCount / classStudents.length) * 100) 
            : 0

          return (
            <div key={cls.id} className="bg-white rounded-lg shadow p-4">
              <Link
                to={`/lop-hoc/${cls.id}`}
                className="block hover:opacity-80 transition-opacity"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{cls.name}</h3>
                    <p className="text-sm text-gray-600">{classStudents.length} học sinh</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{percent}%</span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    Học phí: {formatCurrency(cls.monthly_fee)}
                  </p>
                  {cls.level && (
                    <p className="text-sm text-gray-600">
                      {cls.level}
                    </p>
                  )}
                  {cls.start_date && (
                    <p className="text-sm text-gray-600">
                      Ngày bắt đầu: {formatDate(cls.start_date)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span className="text-emerald-600">✓ {paidCount}</span>
                    <span className="text-red-600">✕ {unpaidCount}</span>
                  </div>
                </div>
              </Link>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setModalState({ isOpen: true, editingClass: cls })}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(cls.id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors font-medium"
                >
                  Xóa
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không có lớp nào</p>
        </div>
      )}

      <ClassModal
        isOpen={modalState.isOpen}
        class={modalState.editingClass}
        onClose={() => setModalState({ isOpen: false, editingClass: null })}
        onSubmit={handleSubmit}
        isLoading={createClassMutation.isPending || updateClassMutation.isPending}
      />
    </div>
  )
}
