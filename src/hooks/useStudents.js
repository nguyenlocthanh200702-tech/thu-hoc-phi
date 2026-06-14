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

export function useCreateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, class_id }) => {
      const { data, error } = await supabase
        .from('students')
        .insert([{ name, class_id }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    }
  })
}
