import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStudentById } from '../hooks/useStudents'
import { useStudentPayments, useMarkPaid, useTogglePaid } from '../hooks/usePayment'
import ConfirmModal from '../components/ConfirmModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { getCurrentYear, formatCurrency, formatDate } from '../utils/helpers'

export default function ChiTietHocSinh() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [modalState, setModalState] = useState({ isOpen: false, month: null, year: null })
  const currentYear = getCurrentYear()

  const { data: student, isLoading: studentLoading } = useStudentById(id)
  const { data: payments = [], isLoading: paymentsLoading, refetch } = useStudentPayments(id)
  const markPaidMutation = useMarkPaid()
  const togglePaidMutation = useTogglePaid()

  if (studentLoading || paymentsLoading) {
    return <LoadingSpinner />
  }

  if (!student) {
    return (
      <div className="p-4 pb-24">
        <p className="text-red-500">Không tìm thấy học sinh</p>
      </div>
    )
  }

  // Generate payment records for 12 months of current year
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const paymentMap = {}
  payments.forEach(p => {
    const key = `${p.month}-${p.year}`
    paymentMap[key] = p
  })

  const handleMarkPaid = (month, year) => {
    setModalState({ isOpen: true, month, year })
  }

  const handleConfirmPaid = async () => {
    if (modalState.month && modalState.year) {
      await markPaidMutation.mutateAsync({
        studentId: id,
        month: modalState.month,
        year: modalState.year
      })
      await refetch()
      setModalState({ isOpen: false, month: null, year: null })
    }
  }

  const handleTogglePaid = async (month, year, currentPaidStatus) => {
    await togglePaidMutation.mutateAsync({
      studentId: id,
      month,
      year,
      paid: !currentPaidStatus
    })
    await refetch()
  }

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]

  return (
    <div className="p-4 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="text-emerald-600 text-sm mb-4 hover:text-emerald-700"
      >
        ← Quay lại
      </button>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{student.name}</h1>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Lớp: <span className="font-medium text-gray-800">{student.class.name}</span></p>
          <p>Học phí: <span className="font-medium text-gray-800">{formatCurrency(student.class.monthly_fee)}</span></p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Lịch sử thanh toán {currentYear}</h2>
        <div className="grid grid-cols-3 gap-2">
          {months.map(month => {
            const key = `${month}-${currentYear}`
            const payment = paymentMap[key]
            const isPaid = payment?.paid
            
            return (
              <div key={month}>
                {isPaid ? (
                  <button
                    onClick={() => handleTogglePaid(month, currentYear, true)}
                    className="w-full p-3 bg-emerald-50 border-2 border-emerald-500 text-emerald-600 rounded-lg font-medium text-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                    title="Nhấn để hủy đánh dấu thanh toán"
                  >
                    <div className="text-lg mb-1">✓</div>
                    {monthNames[month - 1]}
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkPaid(month, currentYear)}
                    className="w-full p-3 bg-red-50 border-2 border-red-300 text-red-600 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors"
                  >
                    <div className="text-lg mb-1">✕</div>
                    {monthNames[month - 1]}
                  </button>
                )}
                {payment?.paid_at && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {formatDate(payment.paid_at)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen}
        title="Xác nhận đóng tiền"
        message={`Xác nhận ${student.name} đã đóng học phí ${monthNames[modalState.month - 1]} ${modalState.year}?`}
        onConfirm={handleConfirmPaid}
        onCancel={() => setModalState({ isOpen: false, month: null, year: null })}
        isLoading={markPaidMutation.isPending}
      />
    </div>
  )
}
