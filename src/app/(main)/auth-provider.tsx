'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: any | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
  isLoading: boolean
  userEmail: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)
      setIsLoading(false)
    }
    initAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setIsLoading(false)

    if (error) throw new Error(error.message)
    setUser(data.user)
  }

  const signup = async (email: string, password: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    })
    setIsLoading(false)

    if (error) throw new Error(error.message)

    // Optional auto-login
    if (data.user) {
      await login(email, password)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  const deleteAccount = async () => {
    if (!user) throw new Error('No user logged in')
    // Delete user using Supabase admin API
    // Supabase client does NOT allow deleting users client-side in production.
    // For demo/testing: sign out user and remove local state
    await logout()
    console.log(`Account for ${user.email} deleted (placeholder).`)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        deleteAccount,
        isLoading,
        userEmail: user?.email ?? null,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
