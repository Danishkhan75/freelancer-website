import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import RecaptchaWrapper from './RecaptchaWrapper'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleCaptchaToken = (token: string) => {
    setCaptchaToken(token)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!captchaToken) {
      setError('Please verify that you are not a robot')
      return
    }

    if (!supabase) {
      setError('Authentication service not available. Please refresh and try again.')
      return
    }

    setLoading(true)

    try {
      const authDomain = import.meta.env.PUBLIC_AUTH_DOMAIN
      if (!authDomain) {
        throw new Error('Auth domain not configured')
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://${authDomain}/auth/reset-password-confirm`,
      })

      if (resetError) throw resetError

      setSuccess(true)
      setEmail('')
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">Check your email</p>
            <p className="text-sm text-green-700">
              We've sent you a password reset link. Click the link in the email to create a new password.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setSuccess(false)}
          variant="outline"
          className="w-full"
        >
          Back to Login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleReset} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Security Verification *</Label>
        <RecaptchaWrapper onToken={handleCaptchaToken} />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Reset Link...
          </>
        ) : (
          'Send Reset Link'
        )}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        The reset link will expire in 24 hours
      </p>
    </form>
  )
}
