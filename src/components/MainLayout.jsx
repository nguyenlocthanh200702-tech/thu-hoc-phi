import { Routes, Route } from 'react-router-dom'
import BottomNav from './BottomNav'
import TrangChu from '../pages/TrangChu'
import LopHoc from '../pages/LopHoc'
import ChiTietLop from '../pages/ChiTietLop'
import HocSinh from '../pages/HocSinh'
import ChiTietHocSinh from '../pages/ChiTietHocSinh'
import Baocao from '../pages/Baocao'
import CaiDat from '../pages/CaiDat'

export default function MainLayout({ user }) {
  return (
    <div className="flex flex-col w-full h-screen max-w-md mx-auto bg-gray-50">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<TrangChu />} />
          <Route path="/lop-hoc" element={<LopHoc />} />
          <Route path="/lop-hoc/:id" element={<ChiTietLop />} />
          <Route path="/hoc-sinh" element={<HocSinh />} />
          <Route path="/hoc-sinh/:id" element={<ChiTietHocSinh />} />
          <Route path="/bao-cao" element={<Baocao />} />
          <Route path="/cai-dat" element={<CaiDat />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
