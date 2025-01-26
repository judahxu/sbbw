// app/(client)/docs/recharge/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import MarkdownViewer from '@/app/components/MarkdownViewer';

export default function RechargePage() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // 读取MD文件内容
        const response = await fetch('/docs/联系客服指南.md');
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error('Error loading markdown:', error);
        setContent('Error loading documentation.');
      }
    };

    fetchContent();
  }, []);

  return <MarkdownViewer content={content} />;
}