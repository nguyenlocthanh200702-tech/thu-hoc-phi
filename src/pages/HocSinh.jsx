import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '../hooks/useStudents'
import { useClasses } from '../hooks/useClasses'
import { formatDate } from '../utils/helpers'
import StudentModal from '../components/StudentModal'
import LoadingSpinner from '../components/LoadingSpinner'

export default function HocSinh() {
  const [searchTerm, setSearchTerm] = useState('')
  const [modalState, setModalState] = useState({ isOpen: false, editingStudent: null })
  
  const { data: students = [], isLoading: studentsLoading } = useStudents()
  const { data: classes = [], isLoading: classesLoading } = useClasses()
  
  const createStudentMutation = useCreateStudent()
  const updateStudentMutation = useUpdateStudent()
  const deleteStudentMutation = useDeleteStudent()

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [students, searchTerm])

  if (studentsLoading || classesLoading) {
    return <LoadingSpinner />
  }

  const handleSubmit = async (formData) => {
    try {
      if (modalState.editingStudent) {
        await updateStudentMutation.mutateAsync({
          id: modalState.editingStudent.id,
          ...formData
        })
      } else {
        await createStudentMutation.mutateAsync(formData)
      }
      setModalState({ isOpen: false, editingStudent: null })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (studentId) => {
    if (confirm('Bạn chắc chắn muốn xóa học sinh này? Hành động này không thể hoàn tác.')) {
      try {
        await deleteStudentMutation.mutateAsync(studentId)
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Danh sách học sinh</h1>
          <p className="text-gray-600 text-sm">{filteredStudents.length} học sinh</p>
        </div>
        <button
          onClick={() => setModalState({ isOpen: true, editingStudent: null })}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          + Thêm
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="space-y-3">
        {filteredStudents.map(student => (
          <div
            key={student.id}
            className="bg-white rounded-lg shadow p-4"
          >
            <Link
              to={`/hoc-sinh/${student.id}`}
              className="block hover:opacity-80 transition-opacity mb-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.class?.name}</p>
                  {student.main_school_class && (
                    <p className="text-xs text-gray-500 mt-1">
                      {student.main_school_class === 'Trường khác' ? student.school_name : student.main_school_class}
                    </p>
                  )}
                  {student.start_date && (
                    <p className="text-xs text-gray-500">
                      Bắt đầu: {formatDate(student.start_date)}
                    </p>
                  )}
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Link>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setModalState({ isOpen: true, editingStudent: student })}
                className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDelete(student.id)}
                className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Không tìm thấy học sinh' : 'Không có học sinh nào'}
          </p>
        </div>
      )}

      <StudentModal
        isOpen={modalState.isOpen}
        student={modalState.editingStudent}
        classes={classes}
        onClose={() => setModalState({ isOpen: false, editingStudent: null })}
        onSubmit={handleSubmit}
        isLoading={createStudentMutation.isPending || updateStudentMutation.isPending}
      />
    </div>
  )
}
