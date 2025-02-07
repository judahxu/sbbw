// src/app/admin/server-accounts/components/BatchImportDialog.tsx
'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle, X, RotateCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';

interface BatchImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (accounts: Array<{ name: string; config: string }>) => void;
}

interface PreviewData {
  name: string;
  config: string;
  [key: string]: string;
}

export function BatchImportDialog({
  open,
  onOpenChange,
  onSubmit
}: BatchImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = XLSX.utils.book_new();
    const data = [
      ['name', 'config'],
      ['server-us-1', 'server=us1.example.com;port=443;password=abc123']
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(template, worksheet, 'Template');
    XLSX.writeFile(template, 'server-account-template.xlsx');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 检查文件类型
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('请上传 Excel 文件 (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    setError(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const firstSheetName = workbook.SheetNames?.[0] ?? '';
      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) {
        throw new Error('无法读取工作表');
      }
      const jsonData = XLSX.utils.sheet_to_json<PreviewData>(worksheet);

      // 验证数据格式
      if (!jsonData.length) {
        setError('文件内容为空');
        return;
      }
      const hasRequiredFields = jsonData.every(item => 
        item.name && item.config
      );

      if (!hasRequiredFields) {
        throw new Error('数据格式不正确，请确保包含名称和配置信息');
      }
      // 验证必要字段
      // if (!jsonData[0].hasOwnProperty('name') || !jsonData[0].hasOwnProperty('config')) {
      //   setError('Excel 文件必须包含 name 和 config 列');
      //   return;
      // }
      setPreviewData(jsonData);
      // 预览前10条数据
      // setPreviewData(jsonData.slice(0, 10));
    } catch (error) {
      setError('解析文件失败');
      console.error('File parsing error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!file || !previewData) return;

    setIsSubmitting(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const firstSheetName = workbook.SheetNames?.[0] ?? '';
      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) {
        throw new Error('无法读取工作表');
      }
      const jsonData = XLSX.utils.sheet_to_json<PreviewData>(worksheet);

      // 转换数据格式
      const accounts = jsonData.map(row => ({
        name: row.name,
        config: row.config
      }));

      onSubmit(accounts);
      
      // 重置状态
      setFile(null);
      setPreviewData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : '导入失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFile(null);
      setPreviewData(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>批量导入加速器账号</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 模板下载 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">首次使用？下载导入模板：</span>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              下载模板
            </Button>
          </div>

          {/* 文件上传区域 */}
          <div className="space-y-2">
            <Label>上传文件</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <label className="flex flex-col items-center cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">
                  点击或拖拽上传 Excel 文件
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isSubmitting}
                />
              </label>
            </div>
            {file && (
              <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreviewData(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
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
                      <th className="px-4 py-2 text-left">名称</th>
                      <th className="px-4 py-2 text-left">配置</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{row.name}</td>
                        <td className="px-4 py-2 font-mono">{row.config}</td>
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
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={!file || !!error || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting && (
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              确认导入
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}