import { useParams } from 'react-router-dom'

export default function ChiTietLop() {
  const { id } = useParams()
  return (
    <div className="p-4 pb-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Chi tiết lớp</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-600">Chi tiết lớp {id} sẽ hiển thị ở đây</p>
      </div>
    </div>
  )
}
