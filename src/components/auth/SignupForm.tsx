import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'
import RecaptchaWrapper from './RecaptchaWrapper'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

type Role = 'client' | 'freelancer' | 'admin'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleCaptchaToken = (token: string) => {
    setCaptchaToken(token)
  }

  const validateForm = () => {
    if (!email || !password || !fullName) {
      setError('Please fill in all required fields')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (!captchaToken) {
      setError('Please verify that you are not a robot')
      return false
    }
    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

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

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `https://${authDomain}/auth/callback`,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (authError) throw authError

      // Update profile with role
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: role,
          })

        if (profileError) throw profileError
      }

      setSuccess(true)
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFullName('')
      setRole('client')
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Account Created!</p>
            <p className="text-sm text-green-700">Check your email to confirm your account before logging in.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSignup} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
          required
        />
      </div>

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
        <Label htmlFor="role">I am a *</Label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          disabled={loading}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          <option value="client">Client (Hiring)</option>
          <option value="freelancer">Freelancer (Service Provider)</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          minLength={8}
        />
        <p className="text-xs text-slate-500">Minimum 8 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  )
}
