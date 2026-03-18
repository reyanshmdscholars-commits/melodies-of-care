'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Volunteer } from './supabase'

const AUTH_KEY = 'moc_volunteer'

interface VolunteerAuthContextType {
  volunteer: Volunteer | null
  login: (v: Volunteer) => void
  logout: () => void
}

const VolunteerAuthContext = createContext<VolunteerAuthContextType>({
  volunteer: null,
  login: () => {},
  logout: () => {},
})

export function VolunteerAuthProvider({ children }: { children: ReactNode }) {
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      if (stored) setVolunteer(JSON.parse(stored))
    } catch {}
  }, [])

  const login = (v: Volunteer) => {
    setVolunteer(v)
    localStorage.setItem(AUTH_KEY, JSON.stringify(v))
  }

  const logout = () => {
    setVolunteer(null)
    localStorage.removeItem(AUTH_KEY)
  }

  return (
    <VolunteerAuthContext.Provider value={{ volunteer, login, logout }}>
      {children}
    </VolunteerAuthContext.Provider>
  )
}

export const useVolunteerAuth = () => useContext(VolunteerAuthContext)
