import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Loader2, LogOut, Users, TrendingUp, Activity } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalClients: number
  totalFreelancers: number
  totalAdmins: number
}

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
}

export default function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalClients: 0,
    totalFreelancers: 0,
    totalAdmins: 0,
  })
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase!.auth.getUser()

        if (userError || !user) {
          window.location.href = '/login'
          return
        }

        // Load admin profile
        const { data: profileData, error: profileError } = await supabase!
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        // Check if user is admin
        if (profileData.role !== 'admin') {
          window.location.href = '/dashboard/client'
          return
        }

        setProfile(profileData)

        // Load all users
        const { data: allUsers, error: usersError } = await supabase!
          .from('profiles')
          .select('id, full_name, email, role')
          .order('created_at', { ascending: false })

        if (usersError) throw usersError

        setUsers(allUsers)

        // Calculate stats
        const stats = {
          totalUsers: allUsers.length,
          totalClients: allUsers.filter((u) => u.role === 'client').length,
          totalFreelancers: allUsers.filter((u) => u.role === 'freelancer').length,
          totalAdmins: allUsers.filter((u) => u.role === 'admin').length,
        }
        setStats(stats)
      } catch (err: any) {
        console.error('Load admin data error:', err)
        setError(err.message || 'Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
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

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">👤</span>
              </div>
              <div>
                <p className="text-sm text-slate-600">Clients</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalClients}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">💼</span>
              </div>
              <div>
                <p className="text-sm text-slate-600">Freelancers</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalFreelancers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-red-600">⚙️</span>
              </div>
              <div>
                <p className="text-sm text-slate-600">Admins</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalAdmins}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.slice(0, 10).map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{user.full_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'client'
                            ? 'bg-green-100 text-green-800'
                            : user.role === 'freelancer'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length > 10 && (
            <p className="text-sm text-slate-600 mt-4 text-center">
              Showing 10 of {users.length} users
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white">Manage Users</Button>
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
            <Button variant="outline" className="w-full">
              System Settings
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
