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

export function useClassById(classId) {
  return useQuery({
    queryKey: ['classes', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!classId
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, monthly_fee, start_date, level }) => {
      const { data, error } = await supabase
        .from('classes')
        .insert([{ name, monthly_fee, start_date, level }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    }
  })
}

export function useUpdateClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, monthly_fee, start_date, level }) => {
      const { data, error } = await supabase
        .from('classes')
        .update({ name, monthly_fee, start_date, level })
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    }
  })
}

export function useArchiveClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (classId) => {
      const { error } = await supabase
        .from('classes')
        .update({ active: false })
        .eq('id', classId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    }
  })
}

export function useDeleteClass() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (classId) => {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    }
  })
}
