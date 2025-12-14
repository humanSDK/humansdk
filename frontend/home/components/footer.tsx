// 'use client'

// import { motion } from "framer-motion"
// import Link from "next/link"
// import Logo from "./Logo"
// import { Facebook, Twitter, Instagram, Linkedin, ExternalLink } from 'lucide-react'

// const footerLinks = {
//   product: [
//     { name: "Features", href: "#features" },
//     { name: "Pricing", href: "#pricing" },
//     { name: "Security", href: "#security" },
//     { name: "Roadmap", href: "#roadmap" }
//   ],
//   company: [
//     { name: "About", href: "#about" },
//     { name: "Blog", href: "#blog" },
//     { name: "Careers", href: "#careers" },
//     { name: "Contact", href: "#contact" }
//   ],
//   legal: [
//     { name: "Privacy", href: "#privacy" },
//     { name: "Terms", href: "#terms" },
//     { name: "Cookie Policy", href: "#cookies" },
//     { name: "Licenses", href: "#licenses" }
//   ],
//   social: [
//     { name: "Facebook", icon: Facebook, href: "#" },
//     { name: "Twitter", icon: Twitter, href: "#" },
//     { name: "Instagram", icon: Instagram, href: "#" },
//     { name: "LinkedIn", icon: Linkedin, href: "#" }
//   ]
// }

// export function Footer() {
//   return (
//     <footer className="border-t bg-muted/20">
//       <div className="container mx-auto px-4 py-12">
//         <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
//           {/* Logo and Description */}
//           <div className="col-span-2 md:col-span-4">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5 }}
//               className="space-y-4"
//             >
//               <Logo className="w-32" />
//               <p className="text-sm text-muted-foreground">
//                 Modern project management and team collaboration platform.
//               </p>
//               <div className="flex items-center gap-4">
//                 {footerLinks.social.map((social) => (
//                   <Link
//                     key={social.name}
//                     href={social.href}
//                     className="text-muted-foreground hover:text-primary transition-colors"
//                     aria-label={social.name}
//                   >
//                     <social.icon className="w-5 h-5" />
//                   </Link>
//                 ))}
//               </div>
//             </motion.div>
//           </div>

//           {/* Product Links */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5, delay: 0.1 }}
//             className="col-span-1 md:col-span-2"
//           >
//             <h4 className="font-semibold mb-4 text-sm">Product</h4>
//             <ul className="space-y-2">
//               {footerLinks.product.map((link) => (
//                 <li key={link.name}>
//                   <Link
//                     href={link.href}
//                     className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
//                   >
//                     {link.name}
//                     <ExternalLink className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </motion.div>

//           {/* Company Links */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="col-span-1 md:col-span-2"
//           >
//             <h4 className="font-semibold mb-4 text-sm">Company</h4>
//             <ul className="space-y-2">
//               {footerLinks.company.map((link) => (
//                 <li key={link.name}>
//                   <Link
//                     href={link.href}
//                     className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
//                   >
//                     {link.name}
//                     <ExternalLink className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </motion.div>

//           {/* Legal Links */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//             className="col-span-1 md:col-span-2"
//           >
//             <h4 className="font-semibold mb-4 text-sm">Legal</h4>
//             <ul className="space-y-2">
//               {footerLinks.legal.map((link) => (
//                 <li key={link.name}>
//                   <Link
//                     href={link.href}
//                     className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
//                   >
//                     {link.name}
//                     <ExternalLink className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </motion.div>
//         </div>

//         {/* Copyright and Additional Links */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5, delay: 0.4 }}
//           className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
//         >
//           <p className="text-sm text-muted-foreground">
//             © {new Date().getFullYear()} CosTheta. All rights reserved.
//           </p>
//           <div className="flex items-center gap-8">
//             <Link 
//               href="#status" 
//               className="text-sm text-muted-foreground hover:text-primary transition-colors"
//             >
//               Status
//             </Link>
//             <Link 
//               href="#accessibility" 
//               className="text-sm text-muted-foreground hover:text-primary transition-colors"
//             >
//               Accessibility
//             </Link>
//           </div>
//         </motion.div>
//       </div>
//     </footer>
//   )
// }

'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import Logo from "./Logo"
import { Mail, MapPin, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Left Column - Logo, Description, and Contact */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Logo className="w-32" />
                <p className="text-muted-foreground max-w-md">
                  Empowering teams with next-generation project management. Currently in development, shaping the future of collaboration.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>costheta.services@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>+91 7010618984</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>HSR Layout, Silkboard Junction, Bengaluru - Karnataka</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Vision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center"
            >
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Our Vision</h4>
                <p className="text-muted-foreground">
                  To revolutionize project management by creating an intuitive, powerful platform that adapts to the way modern teams work, fostering creativity, efficiency, and seamless collaboration.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Copyright and Links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t"
          >
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CosTheta. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              <Link
                href="#privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#accessibility"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

