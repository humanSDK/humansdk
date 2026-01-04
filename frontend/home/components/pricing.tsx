'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Rocket, Stars, ArrowRight } from 'lucide-react'
import { COS_THETA_APP } from '../constant'
/* Original pricing code preserved in comments for future use */

export function Pricing() {
  return (
    <section id="pricing" className="py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Join Our Early Access Program
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We&apos;re currently in development and offering exclusive early access to teams who want to shape the future of project management.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="relative overflow-hidden border-2 border-primary/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary/10 p-2.5 rounded-full">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Early Access Benefits</h3>
                <p className="text-muted-foreground text-sm">
                  Get exclusive access to all premium features during our development phase.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-2.5">
                  <Stars className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-0.5">Premium Features</h4>
                    <p className="text-xs text-muted-foreground">
                      Full access to all current and upcoming premium features
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Stars className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-0.5">Priority Support</h4>
                    <p className="text-xs text-muted-foreground">
                      Direct line to our development team for feedback and support
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Stars className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-0.5">Shape the Product</h4>
                    <p className="text-xs text-muted-foreground">
                      Influence feature development with your feedback
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Stars className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-0.5">Early Bird Pricing</h4>
                    <p className="text-xs text-muted-foreground">
                      Special pricing for early adopters post-launch
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <Button size="lg" className="group" onClick={() => window.location.href = `${COS_THETA_APP}/signup`}>
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  No credit card required. Free during development phase.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

