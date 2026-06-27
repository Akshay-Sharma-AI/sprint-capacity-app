'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { signUp } from '@/lib/supabase/auth'
import { Eye, EyeOff, Zap, ArrowRight, Check } from 'lucide-react'

const features = [
  'Sprint board with real-time updates',
  'Team capacity planning',
  'Daily standup feed',
  'Backlog & task management',
]

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const result = await signUp(email, password, fullName)
    if (result.success) {
      toast.success(`Welcome, ${fullName.split(' ')[0]}! You're in.`)
      router.push('/')
    } else {
      toast.error((result.error as any)?.message || 'Sign up failed. Try a different email.')
      setLoading(false)
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-primary p-10 text-primary-foreground">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary-foreground/20">
            <Zap className="size-4" />
          </div>
          <span className="font-semibold text-lg">SprintCapacity</span>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold leading-tight">
              Your team's sprint<br />command center.
            </h1>
            <p className="mt-3 text-primary-foreground/70 text-sm leading-relaxed">
              Join thousands of scrum teams managing capacity, blockers, and velocity in one place.
            </p>
          </div>

          <div className="space-y-3">
            {features.map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-primary-foreground/80">
                <div className="flex items-center justify-center size-4 rounded-full bg-primary-foreground/20 shrink-0">
                  <Check className="size-2.5" />
                </div>
                {f}
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 p-4">
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-primary-foreground/20 shrink-0 flex items-center justify-center text-xs font-bold">AK</div>
              <div>
                <p className="text-xs font-medium">Akshay K., Scrum Master</p>
                <p className="text-xs text-primary-foreground/60 mt-0.5 leading-relaxed">
                  "SprintCapacity cut our planning meetings from 90 mins to 20. The capacity view is a game-changer."
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} SprintCapacity. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-5">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center size-7 rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </div>
            <span className="font-semibold">SprintCapacity</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Join your team instantly — no approval needed
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jane Smith"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                autoFocus
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength
                            ? strength === 1 ? 'bg-destructive' : strength === 2 ? 'bg-yellow-500' : 'bg-green-500'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strength === 1 ? 'text-destructive' : strength === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {strength === 1 ? 'Too short' : strength === 2 ? 'Fair — try adding numbers' : 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-9" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            By signing up you agree to our{' '}
            <span className="text-primary cursor-pointer hover:underline">Terms</span> and{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
