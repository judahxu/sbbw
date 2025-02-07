import React, { useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronRight, Menu, X } from 'lucide-react';

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface MarkdownViewerProps {
  content: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface HeadingProps extends React.HTMLProps<HTMLHeadingElement> {
  children?: React.ReactNode;
}

interface ListItemProps {
  children?: React.ReactNode;
  ordered?: boolean;
  index?: number;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const generateId = useCallback((text: string, index: number): string => {
    if (!text) return `heading-${index}`;
    
    const processed = text
      .toLowerCase()
      .trim()
      .replace(/[\s]+/g, '-')
      .replace(/[^\u4e00-\u9fa5a-z0-9-]/g, '')
      .replace(/-+/g, '-');
    
    return processed || `heading-${index}`;
  }, []);

  useEffect(() => {
    const headings = content
      .split('\n')
      .filter(line => line.startsWith('#'))
      .map((line, index) => {
        const headingRegex = /^#+/;
        const match = headingRegex.exec(line);
        const level = match?.[0].length ?? 0;
        const text = line.replace(/^#+\s*/, '').trim();
        const id = generateId(text, index);
        return { id, text, level };
      });
    setTableOfContents(headings);
  }, [content, generateId]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      window.scrollTo({
        top: element.offsetTop - offset,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  const getPaddingClass = (level: number) => {
    switch (level) {
      case 1: return 'pl-0';
      case 2: return 'pl-4';
      case 3: return 'pl-8';
      case 4: return 'pl-12';
      default: return 'pl-16';
    }
  };

  const safeToString = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'bigint') return value.toString();
    if (value == null) return '';
    if (React.isValidElement(value)) return '';
    if (Array.isArray(value)) return value.map(safeToString).join('');
    return ''; // Return empty string for objects and any other types
  };


  const components = React.useMemo(() => ({
    h1: ({ children, ...props }: HeadingProps) => {
      const text = safeToString(children);
      const headingIndex = tableOfContents.findIndex(item => item.text === text.trim());
      const id = headingIndex >= 0 && headingIndex < tableOfContents.length 
        ? tableOfContents[headingIndex]?.id 
        : generateId(text, tableOfContents.length);
      
      return (
        <h1 id={id} className="scroll-m-20 text-4xl font-bold tracking-tight mb-4" {...props}>
          {children}
        </h1>
      );
    },
  
    h2: ({ children, ...props }: HeadingProps) => {
      const text = safeToString(children);
      const headingIndex = tableOfContents.findIndex(item => item.text === text.trim());
      const id = headingIndex >= 0 && headingIndex < tableOfContents.length 
        ? tableOfContents[headingIndex]?.id 
        : generateId(text, tableOfContents.length);
      
      return (
        <h2 id={id} className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4 mt-8" {...props}>
          {children}
        </h2>
      );
    },
  
    h3: ({ children, ...props }: HeadingProps) => {
      const text = safeToString(children);
      const headingIndex = tableOfContents.findIndex(item => item.text === text.trim());
      const id = headingIndex >= 0 && headingIndex < tableOfContents.length 
        ? tableOfContents[headingIndex]?.id 
        : generateId(text, tableOfContents.length);
      
      return (
        <h3 id={id} className="scroll-m-20 text-xl font-semibold tracking-tight mb-4 mt-6" {...props}>
          {children}
        </h3>
      );
    },
  
    li: ({ children, ordered, index = 0 }: ListItemProps) => (
      <li className="flex items-start gap-2 leading-7">
        <span className="min-w-[1.5em] select-none">
          {ordered ? `${index + 1}.` : '•'}
        </span>
        <span>{children}</span>
      </li>
    ),
  
    code: ({ inline, children }: CodeProps) => {
      if (inline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded-sm font-mono text-sm">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="font-mono text-sm">{children}</code>
        </pre>
      );
    }
  }), [tableOfContents, generateId]);


  const TableOfContents = () => (
    <div className="space-y-1">
      {tableOfContents.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          className={`w-full justify-start ${getPaddingClass(item.level)} hover:bg-accent/50 transition-colors`}
          onClick={() => scrollToHeading(item.id)}
        >
          <ChevronRight className="h-4 w-4 mr-2" />
          <span className="truncate text-sm">{item.text}</span>
        </Button>
      ))}
    </div>
  );



  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 移动端菜单按钮 */}
        <div className="lg:hidden flex justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="fixed right-4 top-4 z-50"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* 移动端侧边栏 */}
        <div className={`
          fixed inset-0 z-40 lg:hidden transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <Card className="absolute left-0 top-0 h-full w-64 rounded-none p-4">
            <h3 className="text-lg font-semibold mb-4 mt-8">目录</h3>
            <ScrollArea className="h-[calc(100vh-120px)]">
              <TableOfContents />
            </ScrollArea>
          </Card>
        </div>

        {/* 桌面端侧边栏 */}
        <div className="hidden lg:block lg:col-span-3">
          <Card className="p-4 sticky top-8">
            <h3 className="text-lg font-semibold mb-4">目录</h3>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <TableOfContents />
            </ScrollArea>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="col-span-1 lg:col-span-9">
          <Card className="p-4 sm:p-8">
            <article className="prose prose-slate max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {content}
              </ReactMarkdown>
            </article>
          </Card>
        </div>
      </div>
    </div>
  );
}