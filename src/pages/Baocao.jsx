import { useClasses } from '../hooks/useClasses'
import { useStudents } from '../hooks/useStudents'
import { useAllPayments } from '../hooks/usePayment'
import { getCurrentMonth, getCurrentYear, formatCurrency, getMonthName, calculateOverallStats } from '../utils/helpers'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Baocao() {
  const month = getCurrentMonth()
  const year = getCurrentYear()

  const { data: classes = [], isLoading: classesLoading } = useClasses()
  const { data: students = [], isLoading: studentsLoading } = useStudents()
  const { data: payments = [], isLoading: paymentsLoading } = useAllPayments()

  if (classesLoading || studentsLoading || paymentsLoading) {
    return <LoadingSpinner />
  }

  const stats = calculateOverallStats(payments, students, classes, month, year)

  // Get unpaid students grouped by class
  const monthPayments = payments.filter(p => p.month === month && p.year === year)
  const paidStudentIds = new Set(monthPayments.filter(p => p.paid).map(p => p.student_id))
  
  const unpaidByClass = classes.map(cls => ({
    class: cls,
    students: students.filter(
      s => s.class_id === cls.id && !paidStudentIds.has(s.id)
    )
  })).filter(item => item.students.length > 0)

  const handleExportCSV = () => {
    const headers = ['Tên', 'Lớp', 'Học phí', 'Tháng', 'Năm', 'Trạng thái', 'Ngày đóng']
    
    const rows = payments.map(p => [
      p.student?.name || '',
      p.student?.class?.name || '',
      p.student?.class?.monthly_fee || '',
      p.month,
      p.year,
      p.paid ? 'Đã đóng' : 'Chưa đóng',
      p.paid_at ? new Date(p.paid_at).toLocaleDateString('vi-VN') : ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `bao-cao-hoc-phi-${month}-${year}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const StatCard = ({ title, value, unit, bgColor, textColor }) => (
    <div className={`rounded-lg ${bgColor} p-4`}>
      <p className="text-xs text-gray-600 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${textColor}`}>
        {unit === 'currency' ? formatCurrency(value) : value}
      </p>
    </div>
  )

  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Báo cáo</h1>
        <p className="text-gray-600 text-sm">{getMonthName(month)}/{year}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard 
          title="Tổng dự kiến" 
          value={stats.totalExpected} 
          unit="currency" 
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <StatCard 
          title="Đã thu" 
          value={stats.totalCollected} 
          unit="currency" 
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard 
          title="Còn thiếu" 
          value={stats.remaining} 
          unit="currency" 
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
        <StatCard 
          title="% Hoàn thành" 
          value={Math.round((stats.totalCollected / stats.totalExpected) * 100) || 0}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
      </div>

      <div className="mb-6">
        <button
          onClick={handleExportCSV}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          📥 Xuất CSV
        </button>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Học sinh chưa đóng tiền</h2>
        
        {unpaidByClass.length > 0 ? (
          <div className="space-y-4">
            {unpaidByClass.map(({ class: cls, students: classStudents }) => (
              <div key={cls.id} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-gray-800 mb-3">{cls.name}</h3>
                <div className="space-y-2">
                  {classStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm text-gray-800">{student.name}</span>
                      <span className="text-sm font-semibold text-red-600">{formatCurrency(cls.monthly_fee)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-emerald-600 text-lg font-semibold">✓ Tất cả học sinh đã đóng tiền</p>
          </div>
        )}
      </div>
    </div>
  )
}
