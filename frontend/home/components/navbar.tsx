'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import { COS_THETA_APP } from '@/constant'
export function Navbar() {

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b' : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-sm hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#contact" className="text-sm hover:text-primary transition-colors">
            Contact
          </Link>
          <Link href={`${COS_THETA_APP}/login`}>
            <Button variant="outline" className="mr-2">
              Log in
            </Button>
          </Link>
          <Link href={`${COS_THETA_APP}/signup`}>
            <Button>Get Started</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-16 left-0 right-0 bg-background border-b"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              href="#features"
              className="text-sm hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-sm hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex flex-col space-y-2">
  <Link href={`${COS_THETA_APP}/login`}>
    <Button variant="outline" className="w-full">
      Log in
    </Button>
  </Link>
  <Link href={`${COS_THETA_APP}/signup`}>
    <Button className="w-full">
      Get Started
    </Button>
  </Link>
</div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

