/**
 * Get current month (1-12)
 */
export function getCurrentMonth() {
  return new Date().getMonth() + 1
}

/**
 * Get current year
 */
export function getCurrentYear() {
  return new Date().getFullYear()
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

/**
 * Format currency to Vietnamese Dong
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount)
}

/**
 * Get month name in Vietnamese
 */
export function getMonthName(month) {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]
  return months[month - 1]
}

/**
 * Calculate class payment stats for a given month/year
 */
export function calculateClassStats(payments, students, classId, month, year) {
  const classPayments = payments.filter(
    p => p.student_id && p.student?.class_id === classId && p.month === month && p.year === year
  )
  const classStudents = students.filter(s => s.class_id === classId && s.active)
  
  const paidCount = classPayments.filter(p => p.paid).length
  const unpaidCount = classStudents.length - paidCount
  
  return { paidCount, unpaidCount, total: classStudents.length }
}

/**
 * Calculate overall payment stats
 */
export function calculateOverallStats(payments, students, classes, month, year) {
  const activeStudents = students.filter(s => s.active)
  const monthPayments = payments.filter(p => p.month === month && p.year === year)
  const paidPayments = monthPayments.filter(p => p.paid)
  
  const totalStudents = activeStudents.length
  const paidStudents = new Set(paidPayments.map(p => p.student_id)).size
  const unpaidStudents = totalStudents - paidStudents
  
  let totalExpected = 0
  let totalCollected = 0
  
  activeStudents.forEach(student => {
    const classInfo = classes.find(c => c.id === student.class_id)
    if (classInfo) {
      totalExpected += classInfo.monthly_fee
      
      const isPaid = paidPayments.some(
        p => p.student_id === student.id && p.month === month && p.year === year
      )
      if (isPaid) {
        totalCollected += classInfo.monthly_fee
      }
    }
  })
  
  const remaining = totalExpected - totalCollected
  
  return {
    totalStudents,
    paidStudents,
    unpaidStudents,
    totalExpected,
    totalCollected,
    remaining
  }
}
