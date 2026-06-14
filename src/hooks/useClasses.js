import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('active', true)
        .order('name')
      if (error) throw error
      return data || []
    }
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, monthly_fee }) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([{ name, monthly_fee }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    }
  })
}
