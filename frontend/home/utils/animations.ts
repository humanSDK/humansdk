import { Variants } from "framer-motion"

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export const navbarAnimation: Variants = {
  hidden: { y: -100 },
  visible: {
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
}

export const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2 }
}

