'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { signIn } from '@/lib/supabase/auth'
import { Eye, EyeOff, Zap, ArrowRight, Copy, Check } from 'lucide-react'

const DEMO_EMAIL = 'demo@sprintcapacity.app'
const DEMO_PASSWORD = 'Demo1234!'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<'email' | 'password' | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await signIn(email, password)
    if (result.success) {
      toast.success('Welcome back!')
      router.refresh()
      router.push('/')
    } else {
      toast.error('Incorrect email or password. Try the demo credentials below.')
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    toast.info('Demo credentials filled in — hit Sign in')
  }

  const copyToClipboard = async (text: string, field: 'email' | 'password') => {
    await navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
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
              Run better sprints.<br />Ship faster.
            </h1>
            <p className="mt-3 text-primary-foreground/70 text-sm leading-relaxed">
              Plan capacity, track blockers, and keep your scrum team aligned — all in one place.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Real-time sprint board & backlog',
              'Team capacity planning by sprint',
              'Daily standup feed',
              'Dashboard with burndown metrics',
            ].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-primary-foreground/80">
                <div className="size-1.5 rounded-full bg-primary-foreground/60 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} SprintCapacity. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center size-7 rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </div>
            <span className="font-semibold">SprintCapacity</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Welcome back — let's get to work</p>
          </div>

          {/* Demo credentials box */}
          <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Demo Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">Try the app instantly — no sign-up needed</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10" onClick={fillDemo}>
                Use demo
                <ArrowRight className="size-3 ml-1" />
              </Button>
            </div>
            <Separator className="bg-primary/10" />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Email</p>
                <div className="flex items-center gap-1.5 font-mono bg-background rounded px-2 py-1 border border-border">
                  <span className="flex-1 truncate text-foreground">{DEMO_EMAIL}</span>
                  <button onClick={() => copyToClipboard(DEMO_EMAIL, 'email')} className="text-muted-foreground hover:text-foreground shrink-0">
                    {copied === 'email' ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Password</p>
                <div className="flex items-center gap-1.5 font-mono bg-background rounded px-2 py-1 border border-border">
                  <span className="flex-1 text-foreground">{DEMO_PASSWORD}</span>
                  <button onClick={() => copyToClipboard(DEMO_PASSWORD, 'password')} className="text-muted-foreground hover:text-foreground shrink-0">
                    {copied === 'password' ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">or sign in with your account</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
            </div>

            <Button type="submit" className="w-full h-9" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New to SprintCapacity?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
