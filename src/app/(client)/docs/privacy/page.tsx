// app/docs/privacy/page.tsx
"use client";

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">隐私政策</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh] pr-4">
            <Accordion
              type="multiple"
              defaultValue={["item-1", "item-2", "item-3", "item-4", "item-5", "item-6", "item-7"]}
              className="w-full"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>1. 信息收集</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>我们收集的信息包括：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>用户提供的邮箱地址</li>
                      <li>订单和交易记录</li>
                      <li>客服沟通记录</li>
                      <li>使用服务时的日志信息</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>2. 信息使用</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>我们使用收集的信息用于：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>提供和改进服务</li>
                      <li>处理订单和支付</li>
                      <li>提供客户支持</li>
                      <li>发送服务通知</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>3. 信息保护</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>我们采取的保护措施包括：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>使用加密技术保护数据传输</li>
                      <li>严格控制数据访问权限</li>
                      <li>定期安全审计</li>
                      <li>员工保密培训</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>4. 信息共享</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>我们不会与第三方共享用户信息，除非：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>获得用户明确授权</li>
                      <li>法律法规要求</li>
                      <li>保护用户或公众安全</li>
                      <li>维护服务正常运营</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>5. 用户权利</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>用户对个人信息享有以下权利：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>访问和查看个人信息</li>
                      <li>更正或更新个人信息</li>
                      <li>删除个人信息</li>
                      <li>退订营销信息</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>6. Cookie 使用</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>我们使用 Cookie 来：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>改善用户体验</li>
                      <li>记住用户偏好</li>
                      <li>分析服务使用情况</li>
                      <li>提供个性化服务</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>7. 联系我们</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>如有隐私相关问题，请通过以下方式联系我们：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>电子邮件：seebigbigworldx@gmail.com</li>
                      <li>响应时间：24小时内</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}