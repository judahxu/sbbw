// app/docs/terms/page.tsx
"use client";

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">服务条款</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh] pr-4">
            <Accordion
              type="multiple"
              defaultValue={["item-1", "item-2", "item-3", "item-4", "item-5"]}
              className="w-full"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>1. 服务说明</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>1.1 我们提供的服务包括但不限于：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>美区 App Store 账号服务</li>
                      <li>App Store 礼品卡充值服务</li>
                      <li>全球加速服务</li>
                      <li>技术支持服务</li>
                    </ul>
                    <p>1.2 我们保留随时修改、暂停或终止服务的权利，并会提前通知用户。</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>2. 用户责任</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>用户在使用我们的服务时应当：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>遵守所有适用的法律法规</li>
                      <li>保护账号安全，不与他人分享账号信息</li>
                      <li>不得将服务用于任何非法或未经授权的用途</li>
                      <li>对自己的行为负责，并承担相应后果</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>3. 服务费用</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>3.1 付费服务：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>所有费用以实际订单显示为准</li>
                      <li>支持支付宝、微信等支付方式</li>
                      <li>特定服务可能需要额外付费</li>
                    </ul>
                    <p>3.2 退款政策：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>礼品卡充值后不支持退款</li>
                      <li>已购买的服务不支持退款</li>
                      <li>特殊情况请联系客服处理</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>4. 服务保证</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>我们承诺：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>提供24/7全天候技术支持</li>
                      <li>保证服务的安全性和可靠性</li>
                      <li>保护用户的个人信息和隐私</li>
                      <li>及时处理用户反馈和问题</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>5. 免责声明</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p>我们不对以下情况承担责任：</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>因不可抗力导致的服务中断或故障</li>
                      <li>用户违规使用造成的损失</li>
                      <li>第三方服务的可用性和质量</li>
                      <li>用户个人操作失误造成的损失</li>
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