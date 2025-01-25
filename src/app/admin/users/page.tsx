// app/admin/users/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { api } from "~/trpc/react" // 添加trpc import
import { Loader2 } from "lucide-react" // 添加loading图标
import { useToast } from '~/hooks/use-toast'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [filters, setFilters] = useState({
    keyword: '',
    roles: [] as string[],
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined
    },
    page: 1,
    pageSize: 10
  })

  // 调用API获取用户列表
  const { data, isLoading, error } = api.admin.listUsers.useQuery(filters, {
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "错误",
        description: error.message
      })
    }
  })

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }))
  }

  // 渲染分页组件
  const renderPagination = () => {
    if (!data?.pagination) return null

    const { page, pageCount } = data.pagination
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1} 
            />
          </PaginationItem>
          
          {[...Array(pageCount)].map((_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                onClick={() => handlePageChange(i + 1)}
                isActive={page === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pageCount}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">用户管理</h1>
        <Button onClick={() => router.push('/admin/users/new')}>
          添加用户
        </Button>
      </div>

      {/* 搜索和筛选区 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索用户名/邮箱"
                value={filters.keyword}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  keyword: e.target.value,
                  page: 1 // 重置页码
                }))}
              />
            </div>

            {/* 角色筛选 */}
            <div className="w-[200px]">
              <Select
                 onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  roles: [...prev.roles, value],
                  page: 1
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">普通用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 日期范围选择 */}
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      format(filters.dateRange.from, "yyyy-MM-dd")
                    ) : (
                      <span>开始日期</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) => setFilters(prev => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        from: date
                      },
                      page: 1
                    }))}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? (
                      format(filters.dateRange.to, "yyyy-MM-dd")
                    ) : (
                      <span>结束日期</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) => setFilters(prev => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        to: date
                      },
                      page: 1
                    }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表表格 */}
      <Card>
        <CardContent className="p-0">
        {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-[200px] text-red-500">
              加载失败: {error.message}
            </div>
          ) : !data?.users.length ? (
            <div className="flex justify-center items-center h-[200px] text-gray-500">
              暂无数据
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">用户信息</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>注册时间</TableHead>
                {/* <TableHead>服务使用</TableHead> */}
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.image || ''} />
                        <AvatarFallback>
                          {user.name?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                      {user.role === 'admin' ? '管理员' : 
                       user.role === 'member' ? '会员' : '用户'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? 
                      format(user.emailVerified, 'yyyy-MM-dd HH:mm') : 
                      '未验证'}
                  </TableCell>
                  {/* <TableCell>
                    <div className="flex gap-2">
                      {user.services.accounts > 0 && (
                        <Badge variant="outline">
                          账号: {user.services.accounts}
                        </Badge>
                      )}
                      {user.services.apiKeys > 0 && (
                        <Badge variant="outline">
                          API: {user.services.apiKeys}
                        </Badge>
                      )}
                      {user.services.accelerators > 0 && (
                        <Badge variant="outline">
                          加速器: {user.services.accelerators}
                        </Badge>
                      )}
                    </div>
                  </TableCell> */}
                  <TableCell>
                    <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                      {user.emailVerified ? '已验证' : '未验证'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      查看
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        </CardContent>
      </Card>
    </div>
  )
}