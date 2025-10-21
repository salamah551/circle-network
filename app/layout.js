import './globals.css'
import ToastContainer from '@/components/Toast'
import PostHogProvider from '@/components/PostHogProvider'
import { Suspense } from 'react'
import InviteCapture from '@/components/InviteCapture'

export const metadata = {
  title: 'The Circle Network - Invite-Only',
  description: 'Where high-performers connect. An exclusive community of 250 founding members across finance, tech, consulting, and commerce.',
  keywords: 'networking, professionals, founders, investors, executives, elite community',
  openGraph: {
    title: 'The Circle Network - Invite-Only',
    description: 'Where high-performers connect',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Circle Network',
    description: 'Where high-performers connect',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <PostHogProvider>
          <Suspense fallback={null}>
            <InviteCapture />
          </Suspense>
          {children}
          <ToastContainer />
        </PostHogProvider>
      </body>
    </html>
  )
}
