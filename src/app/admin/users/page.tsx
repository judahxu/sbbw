'use client'

import { useState } from 'react'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { api } from "~/trpc/react"
import { Loader2 } from "lucide-react"
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
  const [filters, setFilters] = useState({
    keyword: '',
    page: 1,
    pageSize: 10
  })

  const { data, isLoading } = api.admin.listUsers.useQuery(filters)

  // Generate page numbers logic
  const generatePaginationItems = () => {
    if (!data?.pagination) return []
    
    const { page, pageCount } = data.pagination
    const items = []
    
    // Always show first page
    items.push(1)
    
    if (page > 3) {
      items.push('ellipsis')
    }
    
    // Show current page and surrounding pages
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) {
      items.push(i)
    }
    
    if (page < pageCount - 2) {
      items.push('ellipsis')
    }
    
    // Always show last page
    if (pageCount > 1) {
      items.push(pageCount)
    }
    
    return items
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">用户管理</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          className="max-w-sm"
          placeholder="搜索用户名/邮箱"
          value={filters.keyword}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            keyword: e.target.value,
            page: 1
          }))}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
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
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.image ?? ''} />
                        <AvatarFallback>
                          {user.name?.slice(0, 2).toUpperCase() ?? 'U'}
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
                  <TableCell>
                    <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                      {user.emailVerified ? '已验证' : '未验证'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {data?.pagination && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex items-center gap-2">
              <Select
                value={String(filters.pageSize)}
                onValueChange={(value) => setFilters(prev => ({
                  ...prev,
                  pageSize: Number(value),
                  page: 1
                }))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue>{filters.pageSize} 条/页</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 条/页</SelectItem>
                  <SelectItem value="20">20 条/页</SelectItem>
                  <SelectItem value="50">50 条/页</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">
                共 {data.pagination.total || 0} 条
              </span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={(e) => {
                      if (data.pagination.page <= 1) {
                        e.preventDefault();
                        return;
                      }
                      setFilters(prev => ({
                        ...prev,
                        page: prev.page - 1
                      }))
                    }}
                    aria-disabled={data.pagination.page === 1}
                  />
                </PaginationItem>

                {generatePaginationItems().map((item, index) => (
                  item === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          page: item as number
                        }))}
                        isActive={data.pagination.page === item}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  )
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      if (data.pagination.page >= data.pagination.pageCount) {
                        e.preventDefault();
                        return;
                      }
                      setFilters(prev => ({
                        ...prev,
                        page: prev.page + 1
                      }))
                    }}
                    aria-disabled={data.pagination.page === data.pagination.pageCount}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}