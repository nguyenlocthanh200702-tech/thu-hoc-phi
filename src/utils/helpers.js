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
 * Get current date in UTC+7 timezone (Hanoi, Bangkok, Jakarta)
 * Returns YYYY-MM-DD format for use with <input type="date">
 */
export function getCurrentDateUTC7() {
  // Create date in UTC+7
  const now = new Date()
  const utcPlus7 = new Date(now.getTime() + (7 * 60 - now.getTimezoneOffset()) * 60 * 1000)
  const year = utcPlus7.getFullYear()
  const month = String(utcPlus7.getMonth() + 1).padStart(2, '0')
  const day = String(utcPlus7.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Convert date string to YYYY-MM-DD format for use with <input type="date">
 */
export function formatDateForInput(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
 * Determine the month/year a student becomes visible for tuition collection.
 * If the student joined after the 25th, they start from the next month.
 */
export function getEffectiveStartMonth(student) {
  if (!student?.start_date) return null

  const date = new Date(student.start_date)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  if (day > 25) {
    let nextMonth = month + 1
    let nextYear = year

    if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    }

    return { month: nextMonth, year: nextYear }
  }

  return { month, year }
}

/**
 * Check whether a student should be included in the given month/year.
 */
export function isStudentVisibleForMonth(student, month, year) {
  if (!student) return false
  if (!student.start_date) return true

  const effectiveStart = getEffectiveStartMonth(student)
  if (!effectiveStart) return true

  if (effectiveStart.year < year) return true
  if (effectiveStart.year > year) return false

  return effectiveStart.month <= month
}

/**
 * Calculate class payment stats for a given month/year
 */
export function calculateClassStats(payments, students, classId, month, year) {
  const classPayments = payments.filter(
    p => p.student_id && p.student?.class_id === classId && p.month === month && p.year === year
  )
  const classStudents = students.filter(s => s.class_id === classId && s.active && isStudentVisibleForMonth(s, month, year))
  
  const paidCount = classPayments.filter(p => p.paid).length
  const unpaidCount = classStudents.length - paidCount
  
  return { paidCount, unpaidCount, total: classStudents.length }
}

/**
 * Calculate overall payment stats
 */
export function calculateOverallStats(payments, students, classes, month, year) {
  const activeStudents = students.filter(s => s.active && isStudentVisibleForMonth(s, month, year))
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

/**
 * Get main school classes for each grade
 */
export function getMainSchoolClasses() {
  return {
    '6': ['6/1', '6/2', '6/3', '6/4', '6/5', '6/6', '6/7', '6/8', 'Trường khác'],
    '7': ['7/1', '7/2', '7/3', '7/4', '7/5', '7/6', '7/7', '7/8', 'Trường khác'],
    '8': ['8/1', '8/2', '8/3', '8/4', '8/5', '8/6', '8/7', '8/8', 'Trường khác'],
    '9': ['9/1', '9/2', '9/3', '9/4', '9/5', '9/6', '9/7', '9/8', 'Trường khác']
  }
}

/**
 * Get available class levels
 */
export function getClassLevels() {
  return ['Khối 6', 'Khối 7', 'Khối 8', 'Khối 9']
}
