import React, { useState } from 'react'
import { Lock, Eye, EyeOff, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface AdminLoginProps {
  onClose: () => void
}

export function AdminLogin({ onClose }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))

    const success = login(password)
    if (success) {
      onClose()
    } else {
      setError('Invalid admin password. Please try again.')
    }
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="relative backdrop-blur-lg bg-white/90 dark:bg-slate-800/90 night:bg-black/70 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-8 w-full max-w-md">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 night:text-purple-400 night:hover:text-purple-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300 mb-2">
            Admin Access
          </h2>
          <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">
            Enter admin password to manage members
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-2">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 backdrop-blur-lg bg-white/80 dark:bg-slate-700/80 night:bg-black/40 border border-white/20 dark:border-slate-600/50 night:border-purple-700/30 rounded-xl text-slate-800 dark:text-white night:text-purple-100 placeholder-slate-400 dark:placeholder-slate-500 night:placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200"
                placeholder="Enter admin password..."
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 night:text-purple-400 night:hover:text-purple-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 night:bg-red-900/40 border border-red-200 dark:border-red-800/50 night:border-red-800/50 rounded-xl text-red-700 dark:text-red-300 night:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-400 night:text-purple-300 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 night:hover:bg-purple-800/30 transition-all duration-200 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Access Admin'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500 dark:text-slate-400 night:text-purple-400 text-xs">
            Admin access required for member management
          </p>
        </div>
      </div>
    </div>
  )
}