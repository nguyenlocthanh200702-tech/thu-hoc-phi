import { supabase } from '../supabase'

export default function CaiDat() {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Cài đặt</h1>
      <div className="space-y-4">
        <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
          Đổi mật khẩu
        </button>
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
