import { useState } from 'react'
import { supabase } from '../supabase'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CaiDat() {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (!passwordForm.newPassword.trim()) {
      setMessage({ type: 'error', text: 'Mật khẩu mới là bắt buộc' })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự' })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu không khớp' })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Mật khẩu đã được thay đổi thành công' })
        setPasswordForm({ newPassword: '', confirmPassword: '' })
        setTimeout(() => {
          setShowPasswordForm(false)
          setMessage({ type: '', text: '' })
        }, 2000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi đăng xuất' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !showPasswordForm) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-4 pb-24">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Cài đặt</h1>

      <div className="space-y-4">
        {!showPasswordForm ? (
          <>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Đổi mật khẩu
            </button>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>
          </>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
            </div>

            {message.text && (
              <div
                className={`px-4 py-3 rounded-lg text-sm ${
                  message.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-green-50 border border-green-200 text-green-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordForm({ newPassword: '', confirmPassword: '' })
                  setMessage({ type: '', text: '' })
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Đang xử lý...' : 'Lưu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
