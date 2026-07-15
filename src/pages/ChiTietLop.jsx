import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useClassById } from '../hooks/useClasses'
import { useStudentsByClass } from '../hooks/useStudents'
import { useAllPayments } from '../hooks/usePayment'
import { getCurrentMonth, getCurrentYear, formatCurrency, isStudentVisibleForMonth } from '../utils/helpers'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ChiTietLop() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())

  const { data: cls, isLoading: classLoading } = useClassById(id)
  const { data: students = [], isLoading: studentsLoading } = useStudentsByClass(id)
  const { data: payments = [], isLoading: paymentsLoading } = useAllPayments()

  if (classLoading || studentsLoading || paymentsLoading) {
    return <LoadingSpinner />
  }

  if (!cls) {
    return (
      <div className="p-4 pb-24">
        <p className="text-red-500">Không tìm thấy lớp</p>
      </div>
    )
  }

  const visibleStudents = students.filter(student => isStudentVisibleForMonth(student, selectedMonth, selectedYear))

  const monthPayments = payments.filter(
    p => p.month === selectedMonth && p.year === selectedYear && 
         visibleStudents.some(s => s.id === p.student_id)
  )

  const paidStudents = new Set(monthPayments.filter(p => p.paid).map(p => p.student_id))
  
  let filteredStudents = visibleStudents
  if (filter === 'paid') {
    filteredStudents = students.filter(s => paidStudents.has(s.id))
  } else if (filter === 'unpaid') {
    filteredStudents = students.filter(s => !paidStudents.has(s.id))
  }

  const paidCount = paidStudents.size
  const unpaidCount = visibleStudents.length - paidCount

  return (
    <div className="p-4 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="text-emerald-600 text-sm mb-4 hover:text-emerald-700"
      >
        ← Quay lại
      </button>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{cls.name}</h1>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-gray-600">Tổng học sinh</p>
            <p className="text-xl font-bold text-gray-800">{visibleStudents.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Học phí</p>
            <p className="text-sm font-bold text-gray-800">{formatCurrency(cls.monthly_fee)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Dự kiến</p>
            <p className="text-sm font-bold text-gray-800">{formatCurrency(cls.monthly_fee * visibleStudents.length)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({visibleStudents.length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              filter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✓ ({paidCount})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              filter === 'unpaid'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✕ ({unpaidCount})
          </button>
          <div className="ml-3 flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              {Array.from(new Set([...payments.map(p => p.year), getCurrentYear()])).sort((a,b)=>b-a).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredStudents.map((student, index) => {
          const isPaid = paidStudents.has(student.id)
          return (
            <Link
              key={student.id}
              to={`/hoc-sinh/${student.id}`}
              className="flex items-center justify-between bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className={`text-2xl ${isPaid ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isPaid ? '🟢' : '🔴'}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {index + 1}. {student.name}
                  </div>
                  {student.main_school_class && (
                    <p className="text-xs text-gray-500 mt-1">
                      {student.main_school_class === 'Trường khác' ? student.school_name : student.main_school_class}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          )
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Không có học sinh nào</p>
        </div>
      )}
    </div>
  )
}
