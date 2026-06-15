import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*, class:classes(name)')
        .eq('active', true)
        .order('name')
      if (error) throw error
      return data || []
    }
  })
}

export function useStudentsByClass(classId) {
  return useQuery({
    queryKey: ['students', 'class', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .eq('active', true)
        .order('name')
      if (error) throw error
      return data || []
    },
    enabled: !!classId
  })
}

export function useStudentById(studentId) {
  return useQuery({
    queryKey: ['students', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*, class:classes(id, name, monthly_fee)')
        .eq('id', studentId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!studentId
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, class_id, start_date, school_grade, main_school_class, school_name }) => {
      // Default school_name to "Chu Văn An" if not provided and not "Trường khác"
      const finalSchoolName = main_school_class === 'Trường khác' ? school_name : 'Chu Văn An'
      
      const { data, error } = await supabase
        .from('students')
        .insert([{ name, class_id, start_date, school_grade, main_school_class, school_name: finalSchoolName }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    }
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, class_id, start_date, school_grade, main_school_class, school_name }) => {
      // Default school_name to "Chu Văn An" if not provided and not "Trường khác"
      const finalSchoolName = main_school_class === 'Trường khác' ? school_name : 'Chu Văn An'
      
      const { data, error } = await supabase
        .from('students')
        .update({ name, class_id, start_date, school_grade, main_school_class, school_name: finalSchoolName })
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    }
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (studentId) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    }
  })
}
