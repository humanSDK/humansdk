'use client'

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
}

export function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full bg-gradient-to-br from-background to-muted border-muted-foreground/20 overflow-hidden group">
        <CardHeader className="relative z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Icon className="h-8 w-8 mb-2 text-primary" />
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}

