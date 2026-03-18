'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const ADMIN_PASSWORD = 'melodiesofcare2025'
const AUTH_KEY = 'moc_admin_auth'

interface AdminAuthContextType {
  isAdmin: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
})

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored === 'true') setIsAdmin(true)
  }, [])

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      localStorage.setItem(AUTH_KEY, 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    localStorage.removeItem(AUTH_KEY)
  }

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
