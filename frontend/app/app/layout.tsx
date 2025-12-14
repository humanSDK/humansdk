import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// import Sidebar from "@/components/Sidebar/Sidebar";
import { Toaster } from "@/components/ui/toaster"
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Cos ϴ",
  description: "A Project Tracker by a stealth startup",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}>
        <div className="flex flex-row w-full">
          {/* <Sidebar /> */}
          <main className="flex-1  bg-white min-h-screen">{children}</main>
          <Toaster />
        </div>
      </body>
    </html >
  );
}