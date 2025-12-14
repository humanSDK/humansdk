import './globals.css'
import { Providers } from '../components/providers'
import { Navbar } from "../components/navbar"
import { ThemeToggle } from "../components/theme-toggle"
import { AnimatedBackground } from "../components/animated-background"

export const metadata = {
  title: "Cos ϴ",
  description: "A Project Tracker by a stealth startup",
  icons: {
    icon: "https://cos-theta.s3.eu-north-1.amazonaws.com/static/cos-theta-logo.png",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-inter antialiased">
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <AnimatedBackground />
            <Navbar />
            {children}
            <ThemeToggle />
          </div>
        </Providers>
      </body>
    </html>
  )
}

