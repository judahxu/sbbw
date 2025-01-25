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
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <HomeLink to='/' first="世界这么大" second="-> 去看看" />   
        <UserNav />
      </div>
      {children}
    </main>
  )
}