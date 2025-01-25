'use client'
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter } from 'lucide-react';

const mockData = {
  revenue: [
    { month: '2024-01', total: 150000, subscription: 80000, oneTime: 70000 },
    { month: '2024-02', total: 180000, subscription: 100000, oneTime: 80000 },
    { month: '2024-03', total: 220000, subscription: 120000, oneTime: 100000 },
  ],
  transactions: [
    { id: 1, date: '2024-03-15', type: 'ChatGPT账号', amount: 99, status: '已完成' },
    { id: 2, date: '2024-03-15', type: 'Plus充值', amount: 299, status: '已完成' },
    { id: 3, date: '2024-03-14', type: 'API Token', amount: 799, status: '处理中' },
  ]
};

const FinanceDashboard = () => {
  const [period, setPeriod] = useState('month');

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">财务管理</h1>
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">日</SelectItem>
              <SelectItem value="week">周</SelectItem>
              <SelectItem value="month">月</SelectItem>
              <SelectItem value="year">年</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>总收入</CardTitle>
            <CardDescription>本月累计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥ 220,000</div>
            <p className="text-green-600">+22% vs 上月</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>订单数</CardTitle>
            <CardDescription>本月累计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-green-600">+15% vs 上月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>平均订单金额</CardTitle>
            <CardDescription>本月平均</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥ 178</div>
            <p className="text-green-600">+5% vs 上月</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="transactions">交易记录</TabsTrigger>
          <TabsTrigger value="reports">财务报表</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>收入趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="总收入" stroke="#8884d8" />
                    <Line type="monotone" dataKey="subscription" name="订阅收入" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="oneTime" name="一次性收入" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>交易记录</CardTitle>
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100">
                    <Filter className="h-4 w-4" />
                    筛选
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100">
                    <Download className="h-4 w-4" />
                    导出
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">订单号</th>
                      <th className="px-6 py-3">日期</th>
                      <th className="px-6 py-3">类型</th>
                      <th className="px-6 py-3">金额</th>
                      <th className="px-6 py-3">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.transactions.map((tx) => (
                      <tr key={tx.id} className="bg-white border-b">
                        <td className="px-6 py-4">{tx.id}</td>
                        <td className="px-6 py-4">{tx.date}</td>
                        <td className="px-6 py-4">{tx.type}</td>
                        <td className="px-6 py-4">¥{tx.amount}</td>
                        <td className="px-6 py-4">{tx.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>财务报表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">收入报表</h3>
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100">
                    <Download className="h-4 w-4" />
                    导出收入报表
                  </button>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">对账单</h3>
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100">
                    <Download className="h-4 w-4" />
                    导出对账单
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceDashboard;