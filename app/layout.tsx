import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AdminAuthProvider } from '@/lib/admin-auth'
import { VolunteerAuthProvider } from '@/lib/volunteer-auth'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Melodies of Care — Intergenerational Music Outreach',
  description: 'Connecting generations through the universal language of music.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <AdminAuthProvider>
          <VolunteerAuthProvider>
            <div className="liquid-mesh" />
            <Navbar />
            <main style={{ position: 'relative', zIndex: 1 }}>
              {children}
            </main>
            <Footer />
          </VolunteerAuthProvider>
        </AdminAuthProvider>
      </body>
    </html>
  )
}
