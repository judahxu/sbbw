// app/(admin)/layout.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Settings,
  Package,
  CreditCard,
  ChevronDown,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";
import { useSession,signOut } from "next-auth/react";

// 导航配置
const navigation = [
  { name: '总览', href: '/admin', icon: LayoutDashboard },
  { name: '用户管理', href: '/admin/users', icon: User },
  { 
    name: '账号管理',
    icon: Users,
    children: [
      { name: '普通账号', href: '/admin/accounts/regular' },
      // { name: 'Plus账号', href: '/admin/accounts/plus' },
      // { name: 'API账号', href: '/admin/accounts/api' },
      { name: '加速器账号', href: '/admin/accounts/accelerator' } 
    ]
  },
  { 
    name: '产品价格配置',
    icon: Package,
    href: '/admin/products'
    // children: [
      // { name: '基础产品', href: '/admin/products/basic' },
      // { name: '推荐套餐', href: '/admin/products/bundles' },
      // { name: '配置选项', href: '/admin/products/options' },
    // ]
  },
  { 
    name: '订单管理',
    icon: ShoppingCart,
    href: '/admin/orders'
    // children: [
    //   { name: '账号订单', href: '/admin/orders/accounts' },
    //   { name: 'API订单', href: '/admin/orders/api' },
    //   { name: '加速器订单', href: '/admin/orders/accelerator' },
    //   { name: '充值订单', href: '/admin/orders/recharge' },
    // ]
  },
  // { name: '财务管理', href: '/admin/finance', icon: CreditCard },
  // { name: '系统设置', href: '/admin/settings', icon: Settings },
];

// 布局组件
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 授权检查
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/unauthorized");
        return;
      }
      setIsAuthorized(true);
    }

    setIsLoading(false);
  }, [status, session, router]);

  // 加载状态
  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  // 导航菜单组件
  const NavItems = () => {
    // 根据当前路由初始化展开状态
    const [expandedItems, setExpandedItems] = useState<string[]>(() => {
      return navigation
        .filter(item => item.children?.some(child => 
          pathname.startsWith(child.href)
        ))
        .map(item => item.name);
    });
  
    // 切换展开状态
    const toggleExpand = (name: string) => {
      setExpandedItems(curr => 
        curr.includes(name) 
          ? curr.filter(item => item !== name)
          : [...curr, name]
      );
    };

    // 检查路由是否激活
    const isActive = (href: string) => {
      if (pathname === href) return true;
      if (href !== '/admin' && pathname.startsWith(href)) return true;
      return false;
    };
  
    return (
      <>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.name);
          
          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md
                    text-gray-600 hover:bg-gray-50 hover:text-gray-900 
                    dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white
                    ${isActive(item.href!) ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white' : ''}`}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`pl-11 space-y-1 overflow-hidden transition-all duration-200
                    ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={`block px-4 py-2 text-sm font-medium rounded-md ${
                        isActive(child.href)
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }
  
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive(item.href)
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            {/* Logo和移动端菜单按钮 */}
            <div className="flex items-center">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <Menu className="h-6 w-6" />
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                      <Link href="/admin" className="text-xl font-bold">
                        管理后台
                      </Link>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                      <NavItems />
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/admin" className="ml-4 text-xl font-bold">
                管理后台
              </Link>
            </div>

            {/* 用户菜单 */}
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center">
                  <span className="mr-2">Admin</span>
                  <ChevronDown size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>账号管理</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem>
                    <Link href="/admin/settings/profile" className="flex items-center">
                      个人设置
                    </Link>
                  </DropdownMenuItem> */}
                  <DropdownMenuItem className="text-red-600">
                    <button className="flex items-center" onClick={() => signOut({ callbackUrl: "/" })}>
                      <LogOut className="mr-2 h-4 w-4" />
                      退出登录
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* 桌面端侧边栏导航 */}
        <div className="hidden lg:block w-64 bg-white shadow-sm dark:bg-gray-800">
          <nav className="flex flex-col p-4 space-y-1">
            <NavItems />
          </nav>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}