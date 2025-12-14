'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { MessageSquare, Send, CheckCircle } from 'lucide-react'
import emailjs from "emailjs-com"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [firstname, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [message, setMessage] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const templateParams = {

      from_name: firstname + lastName,
      from_email: email,
      message: message
    }

    try {
      await emailjs.send(
        "service_4gmz6yi",
        "template_1dxykfl",
        templateParams,
        "tdXVivUJuTYSN4x6N"
      ).then(() => {
        setIsSubmitting(false)
        setIsSubmitted(true)

        // Reset form after submission
        setTimeout(() => setIsSubmitted(false), 2000)
      })

    } catch (error) {
      console.error("EmailJS Error:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-12 md:py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-block">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-primary/10 p-3 rounded-2xl"
                >
                  <MessageSquare className="w-6 h-6 text-primary" />
                </motion.div>
              </div>

              <h2 className="text-4xl font-bold tracking-tight">
                Let&apos;s Connect
              </h2>

              <p className="text-muted-foreground text-lg">
                Have a project in mind? We&apos;d love to discuss how we can help bring your ideas to life.
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary">01</span>
                  </div>
                  <p className="text-sm">Fill out the form with your project details</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary">02</span>
                  </div>
                  <p className="text-sm">We&apos;ll review and get back within 24 hours</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary">03</span>
                  </div>
                  <p className="text-sm">Schedule a detailed discussion about your needs</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        First Name
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        name="first_name"
                        value={firstname}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Last Name
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        name="last_name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Email
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      required
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Message
                      <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      required
                      name="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about how we can help you."
                      className="min-h-[150px] bg-background"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || isSubmitted}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mr-2"
                        >
                          Sending...
                        </motion.div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send className="w-4 h-4" />
                        </motion.div>
                      </>
                    ) : isSubmitted ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Sent Successfully
                        </motion.div>
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
