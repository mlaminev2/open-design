import type { Metadata } from 'next'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import Nav from '@/components/Nav'
import CartDrawer from '@/components/CartDrawer'
import CustomCursor from '@/components/CustomCursor'
import ProgressBar from '@/components/ProgressBar'
import Toast from '@/components/Toast'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Maison Éburne — L\'Élégance Redéfinie',
    template: '%s — Maison Éburne',
  },
  description: 'Streetwear luxury en édition limitée. Paris SS25. Pièces pensées pour durer.',
  keywords: ['streetwear luxury', 'édition limitée', 'Paris', 'mode', 'Maison Éburne'],
  openGraph: {
    siteName: 'Maison Éburne',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <CartProvider>
            <CustomCursor />
            <ProgressBar />
            <Nav />
            <CartDrawer />
            <Toast />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
