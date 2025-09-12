'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/(main)/auth-provider'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bot, LogIn } from 'lucide-react'

const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const { login, signup } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const parsed = credentialsSchema.safeParse({ email, password })
    if (!parsed.success) {
      setMessage({ text: parsed.error.errors.map(err => err.message).join(', '), success: false })
      return
    }

    setLoading(true)
    let result
    if (isSignUp) {
      result = await signup(email, password)
    } else {
      result = await login(email, password)
    }
    setMessage({ text: result.message, success: result.success })
    setLoading(false)

    // Redirect only on successful login
    if (!isSignUp && result.success) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Bot className="h-8 w-8" />
          <h1 className="text-3xl font-bold">CareerAI</h1>
        </div>

        <Card className="w-full max-w-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-2xl">{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
              <CardDescription>
                Enter your email and password to {isSignUp ? 'create an account' : 'login'}.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {message && (
                <p className={`text-sm ${message.success ? 'text-green-600' : 'text-red-600'}`}>
                  {message.text}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" disabled={loading} className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

