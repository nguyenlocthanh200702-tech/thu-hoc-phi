import { useState } from 'react'
import { useClasses } from '../hooks/useClasses'
import { useStudents } from '../hooks/useStudents'
import { useAllPayments } from '../hooks/usePayment'
import { getCurrentMonth, getCurrentYear, getMonthName, formatCurrency, calculateOverallStats } from '../utils/helpers'
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

  const stats = calculateOverallStats(payments, students, classes, selectedMonth, selectedYear)

  const StatCard = ({ title, value, unit, bgColor }) => (
    <div className={`rounded-lg ${bgColor} p-4`}>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">
        {unit === 'currency' ? formatCurrency(value) : value}
      </p>
    </div>
  )

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

      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard title="Tổng học sinh" value={stats.totalStudents} bgColor="bg-blue-50" />
        <StatCard title="Đã đóng" value={stats.paidStudents} bgColor="bg-emerald-50" />
        <StatCard title="Chưa đóng" value={stats.unpaidStudents} bgColor="bg-red-50" />
        <StatCard title="Dự kiến" value={stats.totalExpected} unit="currency" bgColor="bg-purple-50" />
        <StatCard title="Đã thu" value={stats.totalCollected} unit="currency" bgColor="bg-green-50" />
        <StatCard title="Còn thiếu" value={stats.remaining} unit="currency" bgColor="bg-orange-50" />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Tiến độ theo lớp</h2>
        <div className="space-y-3">
          {classes.map(cls => {
            const classStudents = students.filter(s => s.class_id === cls.id)
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
