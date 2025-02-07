// src/components/user-nav.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, UserCircle } from "lucide-react";
import LoginLink from '../components/LoginLink'

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />;
  }

  if (!session) {
    return (
      <div className="flex items-center">
        <LoginLink 
          to='/login' 
          src='/images/sbbw.svg' 
          alt='SBBW Logo' 
          width={100} 
          height={24} 
          title='登录' 
        />
      </div>
    );
  }
  

  const userInitials = session.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session.user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user?.image ?? ""} alt={session.user?.name ?? ""} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user?.name ?? "用户"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {session.user?.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>管理后台</span>
            </Link>
          </DropdownMenuItem>
        )}
        {/* <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex items-center">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>个人设置</span>
          </Link>
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/record" className="cursor-pointer flex items-center">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>订单记录</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}