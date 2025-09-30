import './globals.css'

export const metadata = {
  title: 'The Circle Network - Invite-Only',
  description: 'Where high-performers connect',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}