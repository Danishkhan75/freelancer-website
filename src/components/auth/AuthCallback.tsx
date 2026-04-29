import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const [status, setStatus] = useState('Authenticating...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session after redirect
        const { data: { session }, error: sessionError } = await supabase!.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (session) {
          setStatus('Email confirmed! Redirecting to your dashboard...')

          // Get user profile to determine role
          const { data: profile } = await supabase!
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          const role = profile?.role || 'client'

          // Redirect based on role
          const redirectMap: { [key: string]: string } = {
            client: '/dashboard/client',
            freelancer: '/dashboard/freelancer',
            admin: '/dashboard/admin',
          }

          // Use setTimeout to ensure user sees the success message briefly
          setTimeout(() => {
            window.location.href = redirectMap[role] || '/dashboard'
          }, 1500)
        } else {
          setError('No active session found. Please try signing up again.')
        }
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err.message || 'Authentication failed. Please try again.')
      }
    }

    handleCallback()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {error ? (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-900">Authentication Error</h1>
              <p className="text-slate-600">{error}</p>
              <div className="flex gap-3">
                <a
                  href="/login"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-semibold"
                >
                  Back to Login
                </a>
                <a
                  href="/signup"
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-md hover:bg-slate-300 font-semibold"
                >
                  Create Account
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <h1 className="text-2xl font-bold text-slate-900">Authenticating</h1>
              <p className="text-slate-600">{status}</p>
              <p className="text-xs text-slate-500">Please wait while we verify your account...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
