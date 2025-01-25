'use client'
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, Shield, DollarSign, Plug, Bell, Users, Database } from 'lucide-react';

const SettingsPage = () => {
  // 状态管理
  const [platformName, setPlatformName] = useState('See Big Big World');
  const [supportEmail, setSupportEmail] = useState('support@example.com');
  const [requireMFA, setRequireMFA] = useState(false);
  const [apiExchangeRate, setApiExchangeRate] = useState('7.2');
  const [serviceFee, setServiceFee] = useState('3');

  // 保存设置的处理函数
  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings...`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
          <TabsTrigger value="basic">基础设置</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
          <TabsTrigger value="business">业务规则</TabsTrigger>
          <TabsTrigger value="integration">接口配置</TabsTrigger>
          <TabsTrigger value="notification">通知设置</TabsTrigger>
          <TabsTrigger value="roles">角色权限</TabsTrigger>
          <TabsTrigger value="backup">备份维护</TabsTrigger>
          <TabsTrigger value="logs">系统日志</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>基础设置</CardTitle>
              <CardDescription>配置平台的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">平台名称</Label>
                <Input
                  id="platform-name"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">支持邮箱</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
              <Button onClick={() => handleSave('basic')}>保存更改</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>配置平台的安全相关选项</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="mfa">强制开启双因素认证</Label>
                <Switch
                  id="mfa"
                  checked={requireMFA}
                  onCheckedChange={setRequireMFA}
                />
              </div>
              <Button onClick={() => handleSave('security')}>保存更改</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>业务规则</CardTitle>
              <CardDescription>配置业务相关的规则和参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exchange-rate">API额度汇率</Label>
                <Input
                  id="exchange-rate"
                  type="number"
                  value={apiExchangeRate}
                  onChange={(e) => setApiExchangeRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-fee">服务费率(%)</Label>
                <Input
                  id="service-fee"
                  type="number"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(e.target.value)}
                />
              </div>
              <Button onClick={() => handleSave('business')}>保存更改</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>接口配置</CardTitle>
              <CardDescription>配置第三方服务接口参数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>支付接口配置</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="支付宝 App ID" />
                    <Input placeholder="支付宝密钥" type="password" />
                  </div>
                </div>
                <Button onClick={() => handleSave('integration')}>保存更改</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 其他标签页的内容可以按需添加 */}
      </Tabs>

      {/* 快捷导航 */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-white p-4 rounded-lg shadow-lg space-y-2">
          <Button variant="outline" size="icon" title="基础设置">
            <AlertCircle className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="安全设置">
            <Shield className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="业务规则">
            <DollarSign className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="接口配置">
            <Plug className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="通知设置">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="角色权限">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="备份维护">
            <Database className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;