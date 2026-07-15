import { useState } from 'react'
import { useClasses } from '../hooks/useClasses'
import { useStudents } from '../hooks/useStudents'
import { useAllPayments } from '../hooks/usePayment'
import { getCurrentMonth, getCurrentYear, getMonthName, isStudentVisibleForMonth } from '../utils/helpers'
import LoadingSpinner from '../components/LoadingSpinner'

export default function TrangChu() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  
  const { data: classes = [], isLoading: classesLoading } = useClasses()
  const { data: students = [], isLoading: studentsLoading } = useStudents()
  const { data: payments = [], isLoading: paymentsLoading } = useAllPayments()

  if (classesLoading || studentsLoading || paymentsLoading) {
    return <LoadingSpinner />
  }

  const gradeOrder = ['6', '7', '8', '9']
  const gradeStats = gradeOrder.map(grade => {
    const gradeStudents = students.filter(student => student.school_grade === grade && isStudentVisibleForMonth(student, selectedMonth, selectedYear))
    const paidCount = payments.filter(
      payment => gradeStudents.some(student => student.id === payment.student_id) &&
        payment.month === selectedMonth &&
        payment.year === selectedYear &&
        payment.paid
    ).length

    return {
      grade,
      totalStudents: gradeStudents.length,
      paidStudents: paidCount,
      unpaidStudents: gradeStudents.length - paidCount
    }
  })

  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800">{getMonthName(selectedMonth)}/{selectedYear}</h1>
          <div className="ml-4 flex items-center gap-2">
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
        <p className="text-gray-600">Chọn tháng/năm để xem</p>
      </div>

      <div className="space-y-3 mb-8">
        {gradeStats.map(({ grade, totalStudents, paidStudents, unpaidStudents }) => (
          <div key={grade} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">Khối {grade}</h2>
              <span className="text-sm text-gray-600">{totalStudents} học sinh</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-xs text-gray-600">Tổng</p>
                <p className="text-xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <p className="text-xs text-gray-600">Đã đóng</p>
                <p className="text-xl font-bold text-emerald-600">{paidStudents}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <p className="text-xs text-gray-600">Chưa đóng</p>
                <p className="text-xl font-bold text-red-600">{unpaidStudents}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Tiến độ theo lớp</h2>
        <div className="space-y-3">
          {classes.map(cls => {
            const classStudents = students.filter(s => s.class_id === cls.id && isStudentVisibleForMonth(s, selectedMonth, selectedYear))
            const paidCount = payments.filter(
              p => classStudents.some(s => s.id === p.student_id) && 
                   p.month === selectedMonth && p.year === selectedYear && p.paid
            ).length
            const total = classStudents.length
            const percent = total > 0 ? Math.round((paidCount / total) * 100) : 0

            return (
              <div key={cls.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">{cls.name}</h3>
                  <span className="text-sm text-gray-600">{paidCount}/{total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
