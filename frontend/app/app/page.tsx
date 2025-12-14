"use client"
import { useEffect } from "react"

export default function Home() {

  useEffect(() => {
    window.location.href = "/console"
  }, [])

  return (
    <main className="h-screen w-full overflow-hidden flex justify-center items-center">
      Please wait while we are verifying you...
    </main>
  )
}

