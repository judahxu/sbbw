// src/app/admin/server-accounts/components/BatchImportDialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BatchImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchImportDialog({ open, onOpenChange }: BatchImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 检查文件类型
    if (!selectedFile.name.endsWith('.csv')) {
      setError('请上传 CSV 文件');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // 读取文件预览
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        
        // 使用 Papa Parse 解析 CSV
        const result = await new Promise((resolve, reject) => {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: resolve,
            error: reject
          });
        });

        // 预览前10条数据
        setPreviewData((result as any).data.slice(0, 10));
      } catch (error) {
        setError('解析文件失败');
        console.error('File parsing error:', error);
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      // TODO: 调用 API 处理导入
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch('/api/server-accounts/batch-import', {
      //   method: 'POST',
      //   body: formData
      // });

      // 假设导入成功
      onOpenChange(false);
      setFile(null);
      setPreviewData(null);
      setError(null);
    } catch (error) {
      setError('导入失败，请重试');
      console.error('Import error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>批量导入加速器账号</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 文件上传区域 */}
          <div className="space-y-2">
            <Label>上传文件</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <label className="flex flex-col items-center cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">
                  点击或拖拽上传 CSV 文件
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 数据预览 */}
          {previewData && (
            <div className="space-y-2">
              <Label>数据预览（前10条）</Label>
              <div className="border rounded-lg overflow-auto max-h-[200px]">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t">
                        {Object.values(row).map((value: any, i) => (
                          <td key={i} className="px-4 py-2">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFile(null);
                setPreviewData(null);
                setError(null);
              }}
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={!file || !!error}
              onClick={handleImport}
            >
              确认导入
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );