import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '~/styles/globals.css'
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '世界这么大 我想去看看',
  description: 'Free to see big world! GPT4,ChatGPT,GPT4充值,科学上网,加速器',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <TRPCReactProvider>
            {children}
            <Toaster />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
