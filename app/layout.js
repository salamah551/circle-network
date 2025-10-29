import './globals.css'
import ToastContainer from '@/components/Toast'
import PostHogProvider from '@/components/PostHogProvider'

export const metadata = {
  title: 'The Circle Network — The World\'s First AI-Enhanced Private Network',
  description: 'Inner Circle for elite founders/VCs and Core (Charter Member) with immediate but limited ARC™ access. High-touch intros, premium community, and AI leverage.',
  keywords: 'networking, professionals, founders, investors, executives, elite community, AI-enhanced',
  openGraph: {
    title: 'The Circle Network — The World\'s First AI-Enhanced Private Network',
    description: 'Inner Circle for elite founders/VCs and Core (Charter Member) with immediate but limited ARC™ access.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Circle Network — The World\'s First AI-Enhanced Private Network',
    description: 'Inner Circle for elite founders/VCs and Core (Charter Member) with immediate but limited ARC™ access.',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <PostHogProvider>
          {children}
          <ToastContainer />
        </PostHogProvider>
      </body>
    </html>
  )
}
