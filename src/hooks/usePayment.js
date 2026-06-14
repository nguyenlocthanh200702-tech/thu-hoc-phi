import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'

export function useMonthlyPayments(month, year) {
  return useQuery({
    queryKey: ['payments', month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, student:students(name, class_id, class:classes(name, monthly_fee))')
        .eq('month', month)
        .eq('year', year)
      if (error) throw error
      return data || []
    }
  })
}

export function useAllPayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, student:students(name, class_id, class:classes(name, monthly_fee))')
      if (error) throw error
      return data || []
    }
  })
}

export function useStudentPayments(studentId) {
  return useQuery({
    queryKey: ['payments', 'student', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
      if (error) throw error
      return data || []
    }
  })
}

export function useMarkPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ studentId, month, year }) => {
      const { error } = await supabase
        .from('payments')
        .upsert({
          student_id: studentId,
          month,
          year,
          paid: true,
          paid_at: new Date().toISOString()
        }, { onConflict: 'student_id,month,year' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    }
  })
}
