'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function SupabaseSetup() {
  const [copied, setCopied] = useState<string | null>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text)
    setCopied(name)
    toast.success(`${name} copied to clipboard`)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection</CardTitle>
          <CardDescription>
            Your database connection details for SprintCapacity integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!supabaseUrl || !supabaseAnonKey ? (
            <Alert className="border-warning/30 bg-warning/5">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription>
                Supabase is not yet configured. You need to set up the following environment variables:
                <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                  <li>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      NEXT_PUBLIC_SUPABASE_URL
                    </code>
                  </li>
                  <li>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </code>
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-success/30 bg-success/5">
              <Check className="h-4 w-4 text-success" />
              <AlertDescription>
                Supabase is properly configured and connected.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor="supabase-url">Supabase URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="supabase-url"
                  type="text"
                  value={supabaseUrl || 'Not configured'}
                  readOnly
                  className="font-mono text-xs"
                />
                {supabaseUrl && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(supabaseUrl, 'URL')}
                  >
                    {copied === 'URL' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="supabase-key">Supabase Anon Key</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="supabase-key"
                  type="password"
                  value={supabaseAnonKey || 'Not configured'}
                  readOnly
                  className="font-mono text-xs"
                />
                {supabaseAnonKey && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(supabaseAnonKey, 'Key')}
                  >
                    {copied === 'Key' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-3">Setup Instructions</h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-semibold min-w-fit">1.</span>
                <span>
                  Visit{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Supabase Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {' '}and create a new project
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold min-w-fit">2.</span>
                <span>
                  Go to Project Settings → API to find your URL and anon key
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold min-w-fit">3.</span>
                <span>
                  Set the environment variables in your Vercel project settings:
                  <ul className="mt-2 ml-4 list-disc space-y-1 text-xs">
                    <li>
                      <code>NEXT_PUBLIC_SUPABASE_URL</code>
                    </li>
                    <li>
                      <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                    </li>
                  </ul>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold min-w-fit">4.</span>
                <span>
                  Run the SQL migrations in your Supabase SQL editor:
                  <a
                    href="#"
                    className="text-primary hover:underline ml-1 inline-flex items-center gap-1"
                  >
                    View schema
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold min-w-fit">5.</span>
                <span>
                  Redeploy your Vercel project to activate the changes
                </span>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Database Tables</CardTitle>
          <CardDescription>
            Tables created during Supabase setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'workspaces',
              'workspace_members',
              'users',
              'projects',
              'sprints',
              'tasks',
              'capacities',
              'daily_updates',
            ].map((table) => (
              <div
                key={table}
                className="flex items-center gap-2 p-2 rounded bg-muted/50"
              >
                <Badge variant="secondary" className="font-mono text-xs">
                  {table}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
