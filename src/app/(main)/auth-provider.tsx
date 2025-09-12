'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: any | null
  userEmail: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  deleteAccount: () => Promise<string>
  isLoading: boolean
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

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, message: 'Invalid email or password.' }
        }
        return { success: false, message: error.message }
      }

      if (!data.user) {
        return { success: false, message: 'No account found with this email.' }
      }

      setUser(data.user)
      return { success: true, message: ' ' }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  }

const signup = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      if (error.code === 'user_already_exists' || error.message.includes('already registered')) {
        return { success: false, message: 'An account with this email already exists.' }
      }
      return { success: false, message: error.message }
    }

    // If no error but no user returned, treat as failure
    if (!data.user) {
      return { success: false, message: 'Could not create account. Please try again.' }
    }

    return { success: true, message: 'If this email isn’t already registered, an account has been created. Please check your email to verify.' }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}


  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  const deleteAccount = async () => {
    if (!user) return 'No user logged in.'
    await logout()
    return `Account for ${user.email} deleted (placeholder).`
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userEmail: user?.email ?? null,
        login,
        signup,
        logout,
        deleteAccount,
        isLoading,
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
