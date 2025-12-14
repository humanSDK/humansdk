'use client'

import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import HeroImage from './images/hero11.png'

export function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden section-padding">
      <div className="container mx-auto container-padding text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          Track Projects,{' '}
          <span className="gradient-text">
            Collaborate
          </span>
          , and{' '}
          <span className="gradient-text">
            Deliver
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          A powerful project management platform with real-time collaboration, sprint boards,
          and team communication all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = 'http://localhost:3000/signup'}>
            Start Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6"
            onClick={() => window.open('https://www.loom.com/share/872e9c9e21e04c1f9ca0d4a4870fc784?sid=dd691424-3682-45e0-928d-c6648507995d', '_blank')}
          >
            Watch Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 relative"
        >
          <div className="bg-gradient-to-t from-background to-transparent absolute bottom-0 left-0 right-0 h-20 z-10" />
          <Image
            src={HeroImage}
            alt="Project Tracker Dashboard"
            className="rounded-xl shadow-2xl border"
            priority
          />
        </motion.div>
      </div>
    </div>
  )
}

