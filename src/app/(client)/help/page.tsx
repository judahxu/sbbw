'use client'
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle } from "lucide-react";
import HomeLink from '../../components/HomeLink';
import LoginLink from '../../components/LoginLink';

const HelpDocs = () => {
  return (
    <main className="flex  flex-col items-center justify-between">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">入门指南</TabsTrigger>
            <TabsTrigger value="products">产品说明</TabsTrigger>
            <TabsTrigger value="troubleshooting">常见问题</TabsTrigger>
            <TabsTrigger value="payment">支付说明</TabsTrigger>
          </TabsList>

          {/* 入门指南 */}
          <TabsContent value="getting-started">
            <Card>
              <CardHeader>
                <CardTitle>新手入门指南</CardTitle>
                <CardDescription>帮助您快速了解和使用我们的服务</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <section>
                  <h3 className="text-lg font-semibold mb-2">账号类型说明</h3>
                  <p>我们提供以下几种账号类型：</p>
                  <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>基础 ChatGPT 账号：支持 GPT-3.5 模型的对话功能</li>
                    <li>Plus 账号：包含 GPT-4 等高级功能</li>
                    <li>API 账号：适合开发者和企业用户</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">快速开始</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>注册账号：点击右上角的"登录/注册"按钮</li>
                    <li>选择产品：根据需求选择合适的账号类型</li>
                    <li>完成支付：支持支付宝、微信等多种支付方式</li>
                    <li>获取服务：支付完成后即可使用相关服务</li>
                  </ol>
                </section>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>温馨提示</AlertTitle>
                  <AlertDescription>
                    首次使用建议选择短期套餐，以便体验服务质量
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 产品说明 */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>产品使用指南</CardTitle>
                <CardDescription>详细的产品功能介绍和使用说明</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-2">ChatGPT 使用说明</h3>
                  <div className="space-y-2">
                    <h4 className="font-medium">使用步骤：</h4>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>使用提供的账号密码登录 chat.openai.com</li>
                      <li>推荐使用加速器访问以获得更好的体验</li>
                      <li>建议定期更改密码以保证账号安全</li>
                    </ol>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">加速器配置说明</h3>
                  <div className="space-y-2">
                    <h4 className="font-medium">支持平台：</h4>
                    <ul className="list-disc pl-6">
                      <li>Windows 系统</li>
                      <li>MacOS 系统</li>
                      <li>iOS 设备</li>
                      <li>Android 设备</li>
                    </ul>
                    
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>注意事项</AlertTitle>
                      <AlertDescription>
                        请勿将加速器账号共享给他人使用，以免影响您的正常使用
                      </AlertDescription>
                    </Alert>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">API 使用指南</h3>
                  <div className="space-y-2">
                    <p>API 服务支持以下功能：</p>
                    <ul className="list-disc pl-6">
                      <li>文本补全</li>
                      <li>对话生成</li>
                      <li>内容审核</li>
                    </ul>
                    <p className="mt-2">计费说明：</p>
                    <ul className="list-disc pl-6">
                      <li>按 token 用量计费</li>
                      <li>支持余额预警设置</li>
                      <li>可实时查看用量统计</li>
                    </ul>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 常见问题 */}
          <TabsContent value="troubleshooting">
            <Card>
              <CardHeader>
                <CardTitle>常见问题解答</CardTitle>
                <CardDescription>解决使用过程中的常见问题</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-2">访问相关</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Q: 无法访问 ChatGPT 怎么办？</h4>
                      <p>A: 请检查：</p>
                      <ul className="list-disc pl-6">
                        <li>确认加速器是否正常连接</li>
                        <li>检查账号密码是否正确</li>
                        <li>清除浏览器缓存后重试</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Q: 出现网络错误怎么办？</h4>
                      <p>A: 建议尝试：</p>
                      <ul className="list-disc pl-6">
                        <li>切换加速器节点</li>
                        <li>更换浏览器尝试</li>
                        <li>检查本地网络状态</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">账号相关</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Q: 忘记密码怎么办？</h4>
                      <p>A: 可以通过以下方式找回：</p>
                      <ul className="list-disc pl-6">
                        <li>使用邮箱重置密码</li>
                        <li>联系客服协助处理</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Q: 账号被封禁怎么办？</h4>
                      <p>A: 请立即：</p>
                      <ul className="list-disc pl-6">
                        <li>检查是否违反使用规则</li>
                        <li>联系客服核实情况</li>
                        <li>提供账号信息协助处理</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 支付说明 */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>支付与计费说明</CardTitle>
                <CardDescription>了解产品定价与支付方式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-2">支付方式</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>支付宝</li>
                    <li>微信支付</li>
                    <li>银行卡转账</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">账单周期</h3>
                  <p>我们提供以下几种订阅周期：</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>按周订阅：每7天为一个结算周期</li>
                    <li>按月订阅：每30天为一个结算周期</li>
                    <li>按年订阅：每365天为一个结算周期</li>
                  </ul>
                </section>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>发票说明</AlertTitle>
                  <AlertDescription>
                    如需开具发票，请在支付完成后保存订单号，联系客服处理
                  </AlertDescription>
                </Alert>

                <section>
                  <h3 className="text-lg font-semibold mb-2">退款政策</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>未使用的服务支持退款</li>
                    <li>已使用的服务按实际使用天数计费</li>
                    <li>退款处理周期为1-3个工作日</li>
                  </ul>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default HelpDocs;