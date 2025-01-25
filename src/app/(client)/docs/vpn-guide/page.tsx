'use client'
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  HelpCircle,
  AlertCircle,
  Laptop,
  Settings,
  BookOpen,
  FileQuestion,
  Lightbulb,
} from "lucide-react";

// TableOfContents component
const TableOfContents = ({ activeSection, onSectionChange }) => {
  const sections = [
    {
      id: "prerequisites",
      title: "使用前须知",
      icon: AlertCircle,
      subsections: ["适用设备和系统要求", "服务说明和限制", "合规使用提醒"]
    },
    {
      id: "quickstart",
      title: "快速上手",
      icon: Laptop,
      subsections: ["下载与安装", "首次配置向导", "连接测试", "基础功能介绍"]
    },
    {
      id: "advanced",
      title: "进阶使用指南",
      icon: Settings,
      subsections: ["节点选择与切换", "使用模式说明", "应用分流设置", "网络诊断工具使用"]
    },
    {
      id: "faq",
      title: "常见问题",
      icon: FileQuestion,
      subsections: ["连接问题排查", "速度优化指南", "账号相关问题", "续费说明"]
    },
    {
      id: "tips",
      title: "使用建议与技巧",
      icon: Lightbulb,
      subsections: ["网络环境优化", "应用场景推荐配置", "安全使用建议"]
    }
  ];

  return (
    <div className="w-64 h-[calc(100vh-4rem)] overflow-y-auto border-r">
      <div className="p-4 space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="space-y-2">
              <button
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "flex items-center space-x-2 w-full px-2 py-1 rounded-lg text-left",
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{section.title}</span>
              </button>
              {section.subsections.map((subsection, index) => (
                <button
                  key={index}
                  className="w-full pl-8 pr-2 py-1 text-sm text-muted-foreground hover:text-foreground text-left"
                >
                  {subsection}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 页面顶部组件
const Header = () => (
  <div className="h-16 border-b flex items-center justify-between px-6">
    <div className="flex items-center space-x-4">
      <BookOpen className="w-6 h-6" />
      <h1 className="text-xl font-semibold">加速器使用指南</h1>
    </div>
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索指南..."
          className="pl-9 pr-4 py-2 w-64 rounded-md border"
        />
      </div>
      <Button variant="outline" size="icon">
        <HelpCircle className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

// 页面底部导航组件
const Footer = ({ activeSection, onSectionChange, sections }) => {
  const currentIndex = sections.findIndex(s => s === activeSection);
  
  return (
    <div className="h-16 border-t flex items-center justify-between px-6">
      <Button
        variant="outline"
        onClick={() => onSectionChange(sections[currentIndex - 1])}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        上一章
      </Button>
      <Button
        onClick={() => onSectionChange(sections[currentIndex + 1])}
        disabled={currentIndex === sections.length - 1}
      >
        下一章
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

// 主内容区域组件
const MainContent = ({ activeSection }) => {
  // 这里是示例内容，实际使用时需要完善
  const content = {
    prerequisites: (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>使用前须知</CardTitle>
            <CardDescription>
              在开始使用加速服务之前，请仔细阅读以下重要信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">适用设备和系统要求</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>iOS 14.0 或更高版本</li>
                  <li>iPhone、iPad 和 Mac 设备</li>
                  <li>稳定的网络环境</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">服务说明和限制</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>支持同时在多个设备上使用</li>
                  <li>部分应用可能需要特殊设置</li>
                  <li>视网络环境影响服务质量</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">合规使用提醒</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    请遵守当地法律法规，仅将服务用于正当合法用途，如访问 App Store 等。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    // 其他章节的内容将在确认后添加...
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {content[activeSection] || (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          选择左侧目录以查看内容
        </div>
      )}
    </div>
  );
};

// 主页面组件
export default function GuidePage() {
  const [activeSection, setActiveSection] = useState("prerequisites");
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <TableOfContents
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <MainContent activeSection={activeSection} />
      </div>
      <Footer
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sections={["prerequisites", "quickstart", "advanced", "faq", "tips"]}
      />
    </div>
  );
}