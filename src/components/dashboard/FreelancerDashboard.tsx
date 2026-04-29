import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Loader2, LogOut, Briefcase, Star, Award } from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  bio?: string
  phone_number?: string
  skills?: string[]
  hourly_rate?: number
  location?: string
  portfolio_url?: string
}

export default function FreelancerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase!.auth.getUser()

        if (userError || !user) {
          window.location.href = '/login'
          return
        }

        const { data: profileData, error: profileError } = await supabase!
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        setProfile(profileData)
      } catch (err: any) {
        console.error('Load profile error:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleLogout = async () => {
    await supabase!.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <p className="text-slate-600 mb-4">Profile not found</p>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Freelancer Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Projects</p>
                <p className="text-lg font-semibold text-slate-900">0</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Rating</p>
                <p className="text-lg font-semibold text-slate-900">5.0/5.0</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">₹0</span>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Earned</p>
                <p className="text-lg font-semibold text-slate-900">0 INR</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Profile Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-600">Full Name</label>
                <p className="text-slate-900 font-medium">{profile.full_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <p className="text-slate-900 font-medium">{profile.email}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Hourly Rate</label>
                <p className="text-slate-900 font-medium">
                  {profile.hourly_rate ? `₹${profile.hourly_rate}/hour` : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Location</label>
                <p className="text-slate-900 font-medium">{profile.location || 'Not set'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button className="w-full justify-start bg-primary hover:bg-primary/90 text-white">
                Browse Projects
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View Portfolio
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Bank Details
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
