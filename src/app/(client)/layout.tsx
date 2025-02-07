import Image from 'next/image'
import Link from 'next/link'
import ServiceLink from '../components/ServiceLink'
import HomeLink from '../components/HomeLink'
import LoginLink from '../components/LoginLink'
import {UserNav} from '../components/user-nav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex w-full justify-between items-center px-4">
            <div className="flex-1">
              <HomeLink to='/' first="世界这么大" second="-> 去看看" />
            </div>
            <div className="flex items-center">
              <UserNav />
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 container py-6 md:py-8  w-full">
        {children}
      </div>
    </main>
  )
}